import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Car,
  Clock,
  MapPin,
  Calendar,
  Eye,
  Plus,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  X,
  Receipt,
  BadgeCheck,
  ShieldCheck,
  CreditCard,
  Ticket,
  CarFront,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase.ts';

interface Vehicle {
  id: string;
  plateNumber: string;
  vehicleType: 'car' | 'motorcycle' | 'truck' | 'electric_bike' | 'bicycle';
  brand: string;
  color: string;
  registrationDate: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

interface ParkingLog {
  id: string;
  vehicleId: string;
  plateNumber: string;
  parkingLotName: string;
  zone: string;
  spotId: string;
  entryTime: Date;
  exitTime?: Date;
  duration?: string;
  amount?: number;
  paymentMethod: 'cash' | 'online' | 'coins';
  status: 'parked' | 'completed';
}

type ReservationInvoice = {
  mabang: string;
  manguoidung: string;
  mathanhtoan: string; // Mã dùng để check-in với giám sát
  invoiceCode: string;
  vehicleId: string;
  vehicleCode: string;
  plateNumber: string;
  parkingLotName: string;
  zoneName: string;
  spotName: string;
  vehicleType: 'car' | 'motorcycle' | 'truck' | 'electric_bike' | 'bicycle';
  amount: number;
  paymentMethod: 'Chuyển khoản' | 'Xu ảo';
  reservedAt: Date;
  expectedExitAt: Date;
  status: string;
};

const vehicleTypeIcons: Record<Vehicle['vehicleType'], string> = {
  car: '🚗',
  motorcycle: '🏍️',
  truck: '🚚',
  electric_bike: '🛵',
  bicycle: '🚲',
};

const vehicleTypeLabels: Record<Vehicle['vehicleType'], string> = {
  car: 'Xe ô tô',
  motorcycle: 'Xe máy',
  truck: 'Xe tải',
  electric_bike: 'Xe đạp điện',
  bicycle: 'Xe đạp',
};

const formatMoney = (value: number) => value.toLocaleString('vi-VN');

// Helper chuẩn hóa loại xe từ DB
const classifyVehicleType = (value: string): Vehicle['vehicleType'] => {
  const text = (value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (text.includes('xe may') || text.includes('motor')) return 'motorcycle';
  if (text.includes('xe dap dien')) return 'electric_bike';
  if (text.includes('xe dap')) return 'bicycle';
  if (text.includes('truck') || text.includes('xe tai')) return 'truck';
  return 'car';
};

// Đổi màu badge status động theo Database
const getReservationStatusClass = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('hoàn thành')) return 'bg-green-100 text-green-700 border-green-200';
  if (s.includes('đã đặt') || s.includes('thanh toán')) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (s.includes('chờ') || s.includes('xác nhận')) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

const VehicleInfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-4 border-b border-gray-200 py-3 last:border-b-0">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="text-gray-900 font-medium text-right">{value}</span>
  </div>
);

export const VehicleEntryExitLog = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'logs' | 'booking'>('logs');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  
  // States cho Lịch sử (Giữ nguyên Mock data)
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // States cho Booking (Dữ liệu thật)
  const [realReservations, setRealReservations] = useState<ReservationInvoice[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ReservationInvoice | null>(null);

  // --- MOCK DATA: PHƯƠNG TIỆN (Giữ nguyên cho tab Lịch sử) ---
  const [vehicles] = useState<Vehicle[]>([
    { id: 'v1', plateNumber: '30A-12345', vehicleType: 'car', brand: 'Honda City', color: 'Trắng', registrationDate: new Date('2026-01-15'), verificationStatus: 'verified' },
    { id: 'v2', plateNumber: '29B-67890', vehicleType: 'motorcycle', brand: 'Honda Wave', color: 'Đen', registrationDate: new Date('2026-02-20'), verificationStatus: 'verified' },
  ]);

  // --- MOCK DATA: LỊCH SỬ ĐỖ XE (Giữ nguyên) ---
  const mockLogs: ParkingLog[] = [
    { id: 'log1', vehicleId: 'v1', plateNumber: '30A-12345', parkingLotName: 'Bãi xe Vincom Center', zone: 'Sân A', spotId: 'A015', entryTime: new Date('2026-03-31T08:30:00'), exitTime: new Date('2026-03-31T11:45:00'), duration: '3 giờ 15 phút', amount: 150, paymentMethod: 'coins', status: 'completed' },
    { id: 'log3', vehicleId: 'v2', plateNumber: '29B-67890', parkingLotName: 'Bãi xe Vincom Center', zone: 'Sân A', spotId: 'A022', entryTime: new Date('2026-03-31T09:15:00'), status: 'parked', paymentMethod: 'cash' },
  ];

  // --- FETCH REAL DATA CHO ĐẶT CHỖ TRƯỚC ---
  useEffect(() => {
    const fetchReservations = async () => {
      setLoadingReservations(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Lấy full thông tin từ bảng bangdatchotruoc theo ERD
        const { data, error } = await supabase
          .from('bangdatchotruoc')
          .select(`
            mabang,
            manguoidung,
            mabaido,
            makhuvuc,
            mavitri,
            loaithanhtoan,
            thanhtien,
            ngayhethan,
            trangthai,
            maphuongtien,
            mathanhtoan,
            created_at,
            phuongtien ( id, maphuongtien, bienso, maloai ),
            baido ( tenbaido ),
            khuvudo ( tenkhuvuc ),
            vitrido ( tenvitri )
          `)
          .eq('manguoidung', user.id) // Lọc đúng user đang đăng nhập
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const mapped: ReservationInvoice[] = data.map((item: any) => ({
            mabang: item.mabang,
            manguoidung: item.manguoidung,
            mathanhtoan: item.mathanhtoan || 'CHƯA CÓ MÃ', // Lấy mathanhtoan làm mã Check-in
            invoiceCode: (item.mabang || '').split('-')[0].toUpperCase(),
            vehicleId: item.maphuongtien || item.phuongtien?.id || '',
            vehicleCode: item.phuongtien?.maphuongtien || 'N/A',
            plateNumber: item.phuongtien?.bienso || 'N/A',
            vehicleType: classifyVehicleType(item.phuongtien?.maloai || ''),
            parkingLotName: item.baido?.tenbaido || 'N/A',
            zoneName: item.khuvudo?.tenkhuvuc || 'N/A',
            spotName: item.vitrido?.tenvitri || 'N/A',
            amount: Number(item.thanhtien || 0),
            paymentMethod: item.loaithanhtoan === 'Xu ảo' ? 'Xu ảo' : 'Chuyển khoản',
            reservedAt: new Date(item.created_at || Date.now()),
            expectedExitAt: new Date(item.ngayhethan || Date.now()),
            status: (item.trangthai || 'Đã đặt chỗ').charAt(0).toUpperCase() + (item.trangthai || 'Đã đặt chỗ').slice(1),
          }));
          setRealReservations(mapped);
        }
      } catch (err) {
        console.error('Error fetching reservations:', err);
        toast.error('Lỗi khi tải dữ liệu đặt chỗ.');
      } finally {
        setLoadingReservations(false);
      }
    };

    if (activeTab === 'booking') {
      fetchReservations();
    }
  }, [activeTab]);

  const filteredLogs = mockLogs.filter((log) => {
    const matchesVehicle = selectedVehicle === 'all' || log.vehicleId === selectedVehicle;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    return matchesVehicle && matchesStatus;
  });

  // Tính toán Stats kết hợp Mock (Logs) và Real (Booking)
  const stats = useMemo(
    () => ({
      totalTrips: mockLogs.filter((l) => l.status === 'completed').length,
      currentlyParked: mockLogs.filter((l) => l.status === 'parked').length,
      totalSpent: mockLogs.reduce((sum, log) => sum + (log.amount || 0), 0),
      reservationCount: realReservations.length,
      paidReservations: realReservations.filter((item) => item.status.toLowerCase().includes('đã')).length,
    }),
    [realReservations]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/owner')}
              className="p-2 hover:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl mb-1">📖 Nhật ký xe của tôi</h1>
              <p className="text-blue-100 text-sm">Lịch sử đỗ xe và hóa đơn đặt chỗ trước</p>
            </div>
            <button
              onClick={() => navigate('/owner/register-vehicle')}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng ký xe mới</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl mb-1">{stats.totalTrips}</div>
              <div className="text-xs text-blue-100">Chuyến đã hoàn thành</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl mb-1">{stats.currentlyParked}</div>
              <div className="text-xs text-blue-100">Đang đỗ</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl mb-1">{stats.totalSpent.toLocaleString()}</div>
              <div className="text-xs text-blue-100">Tổng chi phí (xu)</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl mb-1">{stats.paidReservations}</div>
              <div className="text-xs text-blue-100">Bill đã thanh toán</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 py-3 rounded-lg transition-all font-semibold ${
                activeTab === 'logs'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              📋 Lịch sử đỗ xe
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className={`flex-1 py-3 rounded-lg transition-all font-semibold ${
                activeTab === 'booking'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🧾 Đặt chỗ trước
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* ============================== */}
        {/* TAB 1: LỊCH SỬ ĐỖ XE (GIỮ NGUYÊN) */}
        {/* ============================== */}
        {activeTab === 'logs' && (
          <>
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-gray-400" />
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="all">Tất cả phương tiện</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicleTypeIcons[vehicle.vehicleType]} {vehicle.plateNumber} - {vehicle.brand}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="parked">Đang đỗ</option>
                    <option value="completed">Đã hoàn thành</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Tìm thấy <span className="font-semibold text-blue-600">{filteredLogs.length}</span> bản ghi
              </div>
            </div>

            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                          {vehicleTypeIcons[vehicles.find((v) => v.id === log.vehicleId)?.vehicleType || 'car']}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl text-gray-900 font-bold">{log.plateNumber}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${log.status === 'parked' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {log.status === 'parked' ? '🅿️ Đang đỗ' : '✅ Đã hoàn thành'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{log.parkingLotName} • {log.zone} - Chỗ {log.spotId}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Vào: {log.entryTime.toLocaleString('vi-VN')}</span>
                            </div>
                            {log.exitTime && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Ra: {log.exitTime.toLocaleString('vi-VN')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {log.amount && (
                          <div className="text-right shrink-0">
                            <div className="text-2xl font-bold text-red-600 mb-1">-{log.amount.toLocaleString()}</div>
                            <div className="text-xs font-medium text-gray-500">
                              {log.paymentMethod === 'cash' ? '💵 Tiền mặt' : log.paymentMethod === 'online' ? '💳 Online' : '🪙 Xu ảo'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                      className="w-full flex items-center justify-center gap-2 mt-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">{expandedLog === log.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}</span>
                      {expandedLog === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {expandedLog === log.id && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      <div className="bg-white rounded-xl p-4">
                        <h4 className="font-bold text-gray-900 mb-4">Chi tiết giao dịch</h4>
                        <div className="space-y-3 text-sm">
                          <VehicleInfoRow label="Mã giao dịch" value={<span className="font-mono text-gray-900">#{log.id.toUpperCase()}</span>} />
                          <VehicleInfoRow label="Loại xe" value={vehicleTypeLabels[vehicles.find((v) => v.id === log.vehicleId)?.vehicleType || 'car']} />
                          {log.amount && (
                            <>
                              <VehicleInfoRow label="Phương thức" value={log.paymentMethod === 'cash' ? 'Tiền mặt' : log.paymentMethod === 'online' ? 'Chuyển khoản' : 'Xu ảo'} />
                              <div className="border-t border-gray-200 pt-3 flex justify-between gap-4">
                                <span className="font-bold text-gray-900">Tổng tiền:</span>
                                <span className="font-bold text-red-600 text-lg">{log.amount.toLocaleString()} xu</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredLogs.length === 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có lịch sử đỗ xe</h3>
                <p className="text-gray-500 mb-6">Bắt đầu đăng ký đỗ xe để xem lịch sử tại đây</p>
                <button
                  onClick={() => navigate('/owner/parking-registration')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                >
                  Đăng ký đỗ xe ngay
                </button>
              </div>
            )}
          </>
        )}

        {/* ============================== */}
        {/* TAB 2: ĐẶT CHỖ TRƯỚC (DỮ LIỆU THẬT) */}
        {/* ============================== */}
        {activeTab === 'booking' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-2 border border-gray-100">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Danh sách hóa đơn đặt chỗ trước</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Cung cấp <strong className="text-blue-600">Mã thanh toán</strong> trong chi tiết hóa đơn cho Giám sát khi vào cổng.
                  </p>
                </div>
                <div className="text-sm font-semibold text-gray-600 bg-gray-50 px-4 py-2 rounded-xl flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  {stats.reservationCount} đặt chỗ · {stats.paidReservations} đã thanh toán
                </div>
              </div>
            </div>

            {loadingReservations ? (
              <div className="py-20 flex flex-col items-center justify-center bg-white rounded-2xl shadow-xl">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500 font-medium">Đang tải dữ liệu đặt chỗ...</p>
              </div>
            ) : (
              <>
                {realReservations.map((invoice) => (
                  <div key={invoice.mabang} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-white">
                    <div className="p-6 md:p-7">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                            <Receipt className="w-8 h-8 text-blue-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="text-xl md:text-2xl text-gray-900 font-bold">
                                #{invoice.invoiceCode}
                              </h3>
                              <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getReservationStatusClass(invoice.status)}`}>
                                {invoice.status}
                              </span>
                            </div>

                            <div className="text-sm text-gray-600 space-y-2">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-gray-400" />
                                <span><span className="font-semibold text-gray-800">Tên bãi đỗ:</span> {invoice.parkingLotName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span><span className="font-semibold text-gray-800">Khu vực / vị trí:</span> {invoice.zoneName} • {invoice.spotName}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span><span className="font-semibold text-gray-800">Thời gian đặt:</span> {invoice.reservedAt.toLocaleString('vi-VN')}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-left lg:text-right shrink-0 bg-gray-50 lg:bg-transparent p-4 lg:p-0 rounded-xl">
                          <div className="text-xs font-semibold text-gray-500 mb-1">Thành tiền</div>
                          <div className="text-3xl font-bold text-red-600 mb-2">
                            {formatMoney(invoice.amount)} <span className="text-xl">{invoice.paymentMethod === 'Xu ảo' ? 'xu' : 'đ'}</span>
                          </div>
                          <div className="text-sm font-semibold text-gray-600">{invoice.paymentMethod}</div>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-gray-100 pt-5">
                        <div className="text-sm bg-blue-50 text-blue-800 border border-blue-200 rounded-xl px-4 py-2.5 inline-flex items-center gap-2 w-fit font-medium">
                          <CarFront className="w-5 h-5 text-blue-600" />
                          Mã phương tiện: <span className="font-bold text-lg">{invoice.vehicleCode}</span>
                        </div>

                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:shadow-lg transition-all"
                        >
                          <Eye className="w-5 h-5" />
                          Lấy mã vào cổng
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {realReservations.length === 0 && (
                  <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                    <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có hóa đơn đặt chỗ trước</h3>
                    <p className="text-gray-500">Các vị trí đã đặt thành công sẽ xuất hiện tại đây.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Reservation Invoice Full-screen Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-auto p-4 md:p-6 flex items-center">
          <div className="max-w-4xl mx-auto bg-white rounded-[28px] overflow-hidden shadow-2xl border border-white/70 w-full animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 md:p-8 relative">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-white/15 hover:bg-white/25 transition"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-sm font-semibold mb-4 w-fit border border-white/30">
                    <Receipt className="w-4 h-4" />
                    Hóa đơn xác nhận đỗ xe
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Đưa mã này cho Giám sát</h2>
                  <p className="text-blue-100 text-sm md:text-base">
                    Cung cấp "Mã thanh toán" bên dưới khi vào cổng để được nhận chỗ.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Box chứa mã thanh toán - Cốt lõi của chức năng Check-in */}
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-3xl p-6 text-center">
                <p className="text-yellow-800 font-bold mb-2 flex items-center justify-center gap-2 text-lg">
                  <ShieldCheck className="w-6 h-6" /> MÃ THANH TOÁN / CHECK-IN
                </p>
                <div className="text-2xl md:text-4xl font-black text-gray-900 tracking-widest font-mono bg-white py-4 rounded-xl border border-yellow-200 shadow-sm break-all">
                  {selectedInvoice.mathanhtoan}
                </div>
                <p className="text-sm text-yellow-700 mt-3 font-medium">
                  * Cung cấp mã này cho Giám sát khi vào cổng để nhận chỗ đặt trước.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-3xl bg-gray-50 border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center">
                      <Car className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Phương tiện</h3>
                      <p className="text-sm text-gray-500">Đối chiếu tại cổng</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <VehicleInfoRow label="Biển số" value={selectedInvoice.plateNumber} />
                    <VehicleInfoRow label="Mã phương tiện" value={selectedInvoice.vehicleCode} />
                    <VehicleInfoRow label="Loại xe" value={vehicleTypeLabels[selectedInvoice.vehicleType] || 'N/A'} />
                  </div>
                </div>

                <div className="rounded-3xl bg-indigo-50 border border-indigo-200 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-100 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Thanh toán</h3>
                      <p className="text-sm text-gray-500">Chi tiết giao dịch</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <VehicleInfoRow label="Trạng thái" value={
                      <span className={`px-2.5 py-1 rounded border text-xs font-bold ${getReservationStatusClass(selectedInvoice.status)}`}>
                        {selectedInvoice.status}
                      </span>
                    } />
                    <VehicleInfoRow label="Phương thức" value={selectedInvoice.paymentMethod} />
                    <div className="flex items-center justify-between gap-4 border-b border-gray-200 py-3 last:border-b-0 mt-2">
                      <span className="text-gray-600 font-semibold">Thành tiền</span>
                      <span className="text-red-600 font-black text-2xl">
                        {formatMoney(selectedInvoice.amount)} <span className="text-lg">{selectedInvoice.paymentMethod === 'Xu ảo' ? 'xu' : 'đ'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-green-100 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Vị trí & Thời gian</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                  <VehicleInfoRow label="Tên bãi đỗ" value={selectedInvoice.parkingLotName} />
                  <VehicleInfoRow label="Khu vực" value={selectedInvoice.zoneName} />
                  <VehicleInfoRow label="Vị trí đỗ" value={selectedInvoice.spotName} />
                  <VehicleInfoRow label="Dự kiến ra" value={selectedInvoice.expectedExitAt.toLocaleString('vi-VN')} />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};