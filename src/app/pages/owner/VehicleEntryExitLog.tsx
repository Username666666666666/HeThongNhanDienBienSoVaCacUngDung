import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Car,
  Clock,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Trash2,
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
  CircleDollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

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

type ReservationStatus = 'Đã thanh toán' | 'Chờ giám sát xác nhận' | 'Hoàn thành';

type ReservationInvoice = {
  id: string;
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
  status: ReservationStatus;
  supervisorNote?: string;
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

const getReservationStatusClass = (status: ReservationStatus) => {
  switch (status) {
    case 'Đã thanh toán':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Chờ giám sát xác nhận':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Hoàn thành':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
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
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<ReservationInvoice | null>(null);

  // Mock data - Danh sách phương tiện
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 'v1',
      plateNumber: '30A-12345',
      vehicleType: 'car',
      brand: 'Honda City',
      color: 'Trắng',
      registrationDate: new Date('2026-01-15'),
      verificationStatus: 'verified',
    },
    {
      id: 'v2',
      plateNumber: '29B-67890',
      vehicleType: 'motorcycle',
      brand: 'Honda Wave',
      color: 'Đen',
      registrationDate: new Date('2026-02-20'),
      verificationStatus: 'verified',
    },
    {
      id: 'v3',
      plateNumber: '51F-11111',
      vehicleType: 'car',
      brand: 'Toyota Vios',
      color: 'Xám',
      registrationDate: new Date('2026-03-25'),
      verificationStatus: 'pending',
    },
  ]);

  // Mock data - Lịch sử đỗ xe
  const mockLogs: ParkingLog[] = [
    {
      id: 'log1',
      vehicleId: 'v1',
      plateNumber: '30A-12345',
      parkingLotName: 'Bãi xe Vincom Center',
      zone: 'Sân A',
      spotId: 'A015',
      entryTime: new Date('2026-03-31T08:30:00'),
      exitTime: new Date('2026-03-31T11:45:00'),
      duration: '3 giờ 15 phút',
      amount: 150,
      paymentMethod: 'coins',
      status: 'completed',
    },
    {
      id: 'log2',
      vehicleId: 'v1',
      plateNumber: '30A-12345',
      parkingLotName: 'Bãi xe Landmark 81',
      zone: 'Sân B',
      spotId: 'B008',
      entryTime: new Date('2026-03-30T14:00:00'),
      exitTime: new Date('2026-03-30T18:30:00'),
      duration: '4 giờ 30 phút',
      amount: 200,
      paymentMethod: 'online',
      status: 'completed',
    },
    {
      id: 'log3',
      vehicleId: 'v2',
      plateNumber: '29B-67890',
      parkingLotName: 'Bãi xe Vincom Center',
      zone: 'Sân A',
      spotId: 'A022',
      entryTime: new Date('2026-03-31T09:15:00'),
      status: 'parked',
      paymentMethod: 'cash',
    },
    {
      id: 'log4',
      vehicleId: 'v1',
      plateNumber: '30A-12345',
      parkingLotName: 'Bãi xe Diamond Plaza',
      zone: 'Sân C',
      spotId: 'C005',
      entryTime: new Date('2026-03-29T10:00:00'),
      exitTime: new Date('2026-03-29T12:30:00'),
      duration: '2 giờ 30 phút',
      amount: 100,
      paymentMethod: 'coins',
      status: 'completed',
    },
  ];

  // Mock data - Hóa đơn đặt chỗ trước đã thanh toán
  const reservationInvoices: ReservationInvoice[] = [
    {
      id: 'inv1',
      invoiceCode: 'HD-2026-0001',
      vehicleId: 'v1',
      vehicleCode: 'PT-001',
      plateNumber: '30A-12345',
      vehicleType: 'car',
      parkingLotName: 'Bãi xe Vincom Center',
      zoneName: 'Khu A',
      spotName: 'A-15',
      amount: 250000,
      paymentMethod: 'Chuyển khoản',
      reservedAt: new Date('2026-03-31T07:50:00'),
      expectedExitAt: new Date('2026-03-31T12:50:00'),
      status: 'Đã thanh toán',
      supervisorNote: 'Đã xác thực thanh toán, chờ đối chiếu khi ra cổng.',
    },
    {
      id: 'inv2',
      invoiceCode: 'HD-2026-0002',
      vehicleId: 'v2',
      vehicleCode: 'PT-002',
      plateNumber: '29B-67890',
      vehicleType: 'motorcycle',
      parkingLotName: 'Bãi xe Landmark 81',
      zoneName: 'Khu B',
      spotName: 'B-08',
      amount: 180000,
      paymentMethod: 'Xu ảo',
      reservedAt: new Date('2026-03-31T09:05:00'),
      expectedExitAt: new Date('2026-03-31T18:05:00'),
      status: 'Chờ giám sát xác nhận',
      supervisorNote: 'Giám sát cần kiểm tra biển số và mã phương tiện trước khi cho ra cổng.',
    },
    {
      id: 'inv3',
      invoiceCode: 'HD-2026-0003',
      vehicleId: 'v3',
      vehicleCode: 'PT-003',
      plateNumber: '51F-11111',
      vehicleType: 'car',
      parkingLotName: 'Bãi xe Diamond Plaza',
      zoneName: 'Khu C',
      spotName: 'C-05',
      amount: 300000,
      paymentMethod: 'Chuyển khoản',
      reservedAt: new Date('2026-03-30T15:00:00'),
      expectedExitAt: new Date('2026-03-31T15:00:00'),
      status: 'Hoàn thành',
      supervisorNote: 'Đã hoàn tất đối soát và cho ra cổng.',
    },
  ];

  const filteredLogs = mockLogs.filter((log) => {
    const matchesVehicle = selectedVehicle === 'all' || log.vehicleId === selectedVehicle;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    return matchesVehicle && matchesStatus;
  });

  const stats = useMemo(
    () => ({
      totalTrips: mockLogs.filter((l) => l.status === 'completed').length,
      currentlyParked: mockLogs.filter((l) => l.status === 'parked').length,
      totalSpent: mockLogs.reduce((sum, log) => sum + (log.amount || 0), 0),
      reservationCount: reservationInvoices.length,
      paidReservations: reservationInvoices.filter((item) => item.status === 'Đã thanh toán').length,
      completedReservations: reservationInvoices.filter((item) => item.status === 'Hoàn thành').length,
      waitingReservations: reservationInvoices.filter((item) => item.status === 'Chờ giám sát xác nhận').length,
    }),
    []
  );

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle({ ...vehicle });
  };

  const handleSaveVehicle = () => {
    if (!editingVehicle) return;

    if (!editingVehicle.brand || !editingVehicle.color) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    setVehicles(vehicles.map((v) => (v.id === editingVehicle.id ? editingVehicle : v)));
    toast.success('Cập nhật thông tin xe thành công!');
    setEditingVehicle(null);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles(vehicles.filter((v) => v.id !== vehicleId));
    toast.success('Đã xóa phương tiện thành công!');
    setDeletingVehicle(null);
  };

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
              className={`flex-1 py-3 rounded-lg transition-all ${
                activeTab === 'logs'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              📋 Lịch sử đỗ xe
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className={`flex-1 py-3 rounded-lg transition-all ${
                activeTab === 'booking'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🧾 Thanh toán đặt chỗ trước
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Lịch sử đỗ xe Tab */}
        {activeTab === 'logs' && (
          <>
            {/* Filters */}
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

            {/* Log Entries */}
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Vehicle Icon */}
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                          {vehicleTypeIcons[
                            vehicles.find((v) => v.id === log.vehicleId)?.vehicleType || 'car'
                          ]}
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl text-gray-900">{log.plateNumber}</h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs ${
                                log.status === 'parked'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {log.status === 'parked' ? '🅿️ Đang đỗ' : '✅ Đã hoàn thành'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {log.parkingLotName} • {log.zone} - Chỗ {log.spotId}
                              </span>
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
                            {log.duration && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span className="text-blue-600 font-medium">Thời gian: {log.duration}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Amount */}
                        {log.amount && (
                          <div className="text-right shrink-0">
                            <div className="text-2xl text-red-600 mb-1">-{log.amount.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">
                              {log.paymentMethod === 'cash'
                                ? '💵 Tiền mặt'
                                : log.paymentMethod === 'online'
                                  ? '💳 Online'
                                  : '🪙 Xu ảo'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                      className="w-full flex items-center justify-center gap-2 mt-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">
                        {expandedLog === log.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                      </span>
                      {expandedLog === log.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {expandedLog === log.id && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      <div className="bg-white rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-4">Chi tiết giao dịch</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-600">Mã giao dịch:</span>
                            <span className="font-mono text-gray-900">#{log.id.toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-600">Loại xe:</span>
                            <span className="font-medium">
                              {vehicleTypeLabels[
                                vehicles.find((v) => v.id === log.vehicleId)?.vehicleType || 'car'
                              ]}
                            </span>
                          </div>
                          {log.amount && (
                            <>
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-600">Phương thức thanh toán:</span>
                                <span className="font-medium">
                                  {log.paymentMethod === 'cash'
                                    ? 'Tiền mặt'
                                    : log.paymentMethod === 'online'
                                      ? 'Chuyển khoản'
                                      : 'Xu ảo'}
                                </span>
                              </div>
                              <div className="border-t border-gray-200 pt-3 flex justify-between gap-4">
                                <span className="font-semibold text-gray-900">Tổng tiền:</span>
                                <span className="font-semibold text-red-600 text-lg">
                                  {log.amount.toLocaleString()} xu
                                </span>
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
                <h3 className="text-xl text-gray-900 mb-2">Chưa có lịch sử đỗ xe</h3>
                <p className="text-gray-500 mb-6">Bắt đầu đăng ký đỗ xe để xem lịch sử tại đây</p>
                <button
                  onClick={() => navigate('/owner/parking-registration')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Đăng ký đỗ xe ngay
                </button>
              </div>
            )}
          </>
        )}

        {/* Thanh toán đặt chỗ trước Tab */}
        {activeTab === 'booking' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-2">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Danh sách hóa đơn đặt chỗ trước</h2>
                  <p className="text-sm text-gray-500">
                    Chỉ hiển thị các bill đã thanh toán để giám sát kiểm tra và đối chiếu khi ra cổng.
                  </p>
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  {stats.reservationCount} hóa đơn · {stats.completedReservations} hoàn thành
                </div>
              </div>
            </div>

            {reservationInvoices.map((invoice) => (
              <div key={invoice.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-white">
                <div className="p-6 md:p-7">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-3xl shrink-0">
                        <Receipt className="w-8 h-8 text-blue-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="text-xl md:text-2xl text-gray-900 font-semibold">
                            {invoice.invoiceCode}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full border text-xs font-medium ${getReservationStatusClass(
                              invoice.status
                            )}`}
                          >
                            {invoice.status}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 space-y-2">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <span>
                              <span className="font-medium text-gray-800">Tên bãi đỗ:</span>{' '}
                              {invoice.parkingLotName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>
                              <span className="font-medium text-gray-800">Khu vực / vị trí:</span>{' '}
                              {invoice.zoneName} • {invoice.spotName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              <span className="font-medium text-gray-800">Thời gian đặt:</span>{' '}
                              {invoice.reservedAt.toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              <span className="font-medium text-gray-800">Dự kiến ra cổng:</span>{' '}
                              {invoice.expectedExitAt.toLocaleString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right lg:text-right shrink-0">
                      <div className="text-xs text-gray-500 mb-1">Thành tiền</div>
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        {formatMoney(invoice.amount)} xu
                      </div>
                      <div className="text-sm text-gray-500">{invoice.paymentMethod}</div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-gray-200 pt-5">
                    <div className="text-xs bg-gray-100 text-gray-700 rounded-full px-4 py-2 inline-flex items-center gap-2 w-fit">
                      <CarFront className="w-4 h-4" />
                      Mã phương tiện:
                      <span className="font-semibold">{invoice.vehicleCode}</span>
                    </div>

                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      Xem hóa đơn chi tiết
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {reservationInvoices.length === 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl text-gray-900 mb-2">Chưa có bill đặt chỗ trước</h3>
                <p className="text-gray-500">Các hóa đơn đã thanh toán sẽ xuất hiện ở đây.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Chỉnh sửa thông tin xe</h3>
              <button
                onClick={() => setEditingVehicle(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Biển số xe</label>
                <input
                  type="text"
                  value={editingVehicle.plateNumber}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Biển số không thể thay đổi</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hãng xe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingVehicle.brand}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, brand: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Honda, Toyota..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu xe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingVehicle.color}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, color: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Đen, Trắng..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingVehicle(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveVehicle}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingVehicle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Xác nhận xóa</h3>
                <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Bạn có chắc chắn muốn xóa phương tiện{' '}
              <span className="font-semibold">
                {vehicles.find((v) => v.id === deletingVehicle)?.plateNumber}
              </span>
              ? Tất cả lịch sử liên quan sẽ vẫn được giữ lại.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingVehicle(null)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteVehicle(deletingVehicle)}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                Xóa phương tiện
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Invoice Full-screen Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto bg-white rounded-[28px] overflow-hidden shadow-2xl border border-white/70 my-6">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 md:p-8 relative">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-white/15 hover:bg-white/25 transition"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-sm mb-4 w-fit">
                    <Receipt className="w-4 h-4" />
                    Hóa đơn đặt chỗ trước
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">Bill đã thanh toán</h2>
                  <p className="text-blue-100 text-sm md:text-base">
                    Giám sát kiểm tra mã phương tiện, biển số và hóa đơn trước khi cho xe ra cổng.
                  </p>
                </div>

                <div className="bg-white/15 rounded-2xl px-5 py-4 shrink-0">
                  <div className="text-xs text-blue-100 mb-1">Mã phương tiện</div>
                  <div className="text-2xl font-bold tracking-wide">{selectedInvoice.vehicleCode}</div>
                  <div className="text-xs text-blue-100 mt-1">Đối chiếu nhanh</div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-3xl bg-gray-50 border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center">
                      <Car className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Thông tin phương tiện</h3>
                      <p className="text-sm text-gray-500">Dành cho đối chiếu tại cổng</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <VehicleInfoRow label="Biển số" value={selectedInvoice.plateNumber} />
                    <VehicleInfoRow label="Mã phương tiện" value={selectedInvoice.vehicleCode} />
                    <VehicleInfoRow label="Loại xe" value={vehicleTypeLabels[selectedInvoice.vehicleType]} />
                  </div>
                </div>

                <div className="rounded-3xl bg-indigo-50 border border-indigo-200 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-100 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Thanh toán</h3>
                      <p className="text-sm text-gray-500">Thông tin bill đã thanh toán</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <VehicleInfoRow label="Số bill" value={selectedInvoice.invoiceCode} />
                    <VehicleInfoRow label="Phương thức" value={selectedInvoice.paymentMethod} />
                    <div className="flex items-center justify-between gap-4 border-b border-gray-200 py-3 last:border-b-0">
                      <span className="text-gray-500 text-sm">Thành tiền</span>
                      <span className="text-red-600 font-bold text-2xl">
                        {formatMoney(selectedInvoice.amount)} xu
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-green-100 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Thông tin đặt chỗ</h3>
                      <p className="text-sm text-gray-500">Tên bãi đỗ, khu vực và vị trí</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <VehicleInfoRow label="Tên bãi đỗ" value={selectedInvoice.parkingLotName} />
                    <VehicleInfoRow label="Khu vực" value={selectedInvoice.zoneName} />
                    <VehicleInfoRow label="Vị trí" value={selectedInvoice.spotName} />
                  </div>
                </div>

                <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Thời gian</h3>
                      <p className="text-sm text-gray-500">Từ lúc đặt đến dự kiến ra cổng</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <VehicleInfoRow label="Ngày đặt" value={selectedInvoice.reservedAt.toLocaleString('vi-VN')} />
                    <VehicleInfoRow label="Dự kiến ra cổng" value={selectedInvoice.expectedExitAt.toLocaleString('vi-VN')} />
                    <VehicleInfoRow
                      label="Trạng thái"
                      value={
                        <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getReservationStatusClass(selectedInvoice.status)}`}>
                          {selectedInvoice.status}
                        </span>
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-green-50 border border-green-200 p-6 md:p-7">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                    <BadgeCheck className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-2xl font-bold text-green-700 mb-2">Bill đã thanh toán thành công</h4>
                    <p className="text-green-700/90 leading-relaxed">
                      Hóa đơn này chỉ cần hiển thị cho giám sát để đối chiếu biển số và mã phương tiện.
                      Sau khi kiểm tra và cho xe ra cổng, trạng thái có thể được cập nhật thành <b>Hoàn thành</b>.
                    </p>

                    {selectedInvoice.supervisorNote && (
                      <div className="mt-5 bg-white/70 border border-green-200 rounded-2xl p-4 text-sm text-gray-700">
                        <div className="font-semibold text-green-700 mb-1">Ghi chú giám sát</div>
                        {selectedInvoice.supervisorNote}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-green-200 pt-5">
                  <div className="flex items-center gap-2 text-green-700 font-semibold">
                    <ShieldCheck className="w-5 h-5" />
                    Đã xác thực thanh toán
                  </div>
                  <div className={`px-4 py-2 rounded-full border text-sm font-semibold ${getReservationStatusClass(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Đóng hóa đơn
                </button>
                <button
                  onClick={() => toast.success('Đã sao chép mã hóa đơn (mô phỏng).')}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transition-all"
                >
                  Xác nhận đã kiểm tra
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
