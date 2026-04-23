import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Car,
  Clock,
  MapPin,
  DollarSign,
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
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback.tsx';
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

export const VehicleEntryExitLog = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'logs' | 'vehicles'>('logs');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<string | null>(null);

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

  const vehicleTypeIcons = {
    car: '🚗',
    motorcycle: '🏍️',
    truck: '🚚',
    electric_bike: '🛵',
    bicycle: '🚲',
  };

  const vehicleTypeLabels = {
    car: 'Xe ô tô',
    motorcycle: 'Xe máy',
    truck: 'Xe tải',
    electric_bike: 'Xe đạp điện',
    bicycle: 'Xe đạp',
  };

  const filteredLogs = mockLogs.filter((log) => {
    const matchesVehicle = selectedVehicle === 'all' || log.vehicleId === selectedVehicle;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    return matchesVehicle && matchesStatus;
  });

  // Statistics
  const stats = {
    totalTrips: mockLogs.filter((l) => l.status === 'completed').length,
    currentlyParked: mockLogs.filter((l) => l.status === 'parked').length,
    totalSpent: mockLogs.reduce((sum, log) => sum + (log.amount || 0), 0),
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle({ ...vehicle });
  };

  const handleSaveVehicle = () => {
    if (!editingVehicle) return;

    if (!editingVehicle.brand || !editingVehicle.color) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    setVehicles(
      vehicles.map((v) => (v.id === editingVehicle.id ? editingVehicle : v))
    );
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
            <div className="flex-1">
              <h1 className="text-2xl mb-1">📖 Nhật ký xe của tôi</h1>
              <p className="text-blue-100 text-sm">Lịch sử đỗ xe và quản lý phương tiện</p>
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
          <div className="grid grid-cols-3 gap-4 mb-6">
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
              onClick={() => setActiveTab('vehicles')}
              className={`flex-1 py-3 rounded-lg transition-all ${
                activeTab === 'vehicles'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              🚗 Quản lý phương tiện
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
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
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
                          <div className="text-right">
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
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mã giao dịch:</span>
                            <span className="font-mono text-gray-900">#{log.id.toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Loại xe:</span>
                            <span className="font-medium">
                              {vehicleTypeLabels[
                                vehicles.find((v) => v.id === log.vehicleId)?.vehicleType || 'car'
                              ]}
                            </span>
                          </div>
                          {log.amount && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Phương thức thanh toán:</span>
                                <span className="font-medium">
                                  {log.paymentMethod === 'cash'
                                    ? 'Tiền mặt'
                                    : log.paymentMethod === 'online'
                                    ? 'Chuyển khoản'
                                    : 'Xu ảo'}
                                </span>
                              </div>
                              <div className="border-t border-gray-200 pt-3 flex justify-between">
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

        {/* Quản lý phương tiện Tab */}
        {activeTab === 'vehicles' && (
          <div className="space-y-4">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-start gap-4">
                  {/* Vehicle Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-3xl">
                    {vehicleTypeIcons[vehicle.vehicleType]}
                  </div>

                  {/* Vehicle Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl text-gray-900">{vehicle.plateNumber}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          vehicle.verificationStatus === 'verified'
                            ? 'bg-green-100 text-green-700'
                            : vehicle.verificationStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {vehicle.verificationStatus === 'verified' ? (
                          <>
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            Đã xác thực
                          </>
                        ) : vehicle.verificationStatus === 'pending' ? (
                          <>
                            <Clock className="w-3 h-3 inline mr-1" />
                            Đang xử lý
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            Bị từ chối
                          </>
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        <span>
                          {vehicleTypeLabels[vehicle.vehicleType]} - {vehicle.brand}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-400" style={{ backgroundColor: vehicle.color.toLowerCase() === 'trắng' ? 'white' : vehicle.color.toLowerCase() === 'đen' ? 'black' : vehicle.color.toLowerCase() === 'xám' ? 'gray' : 'blue' }} />
                        <span>Màu {vehicle.color}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Đăng ký: {vehicle.registrationDate.toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditVehicle(vehicle)}
                      className="p-3 hover:bg-blue-50 text-blue-600 rounded-lg transition-all"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeletingVehicle(vehicle.id)}
                      className="p-3 hover:bg-red-50 text-red-600 rounded-lg transition-all"
                      title="Xóa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {vehicles.length === 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl text-gray-900 mb-2">Chưa có phương tiện</h3>
                <p className="text-gray-500 mb-6">Đăng ký phương tiện đầu tiên của bạn</p>
                <button
                  onClick={() => navigate('/owner/register-vehicle')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Đăng ký xe ngay
                </button>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biển số xe
                </label>
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
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, brand: e.target.value })
                  }
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
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, color: e.target.value })
                  }
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
    </div>
  );
};
