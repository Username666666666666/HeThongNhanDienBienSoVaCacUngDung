import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Clock,
  Car,
  MapPin,
  DollarSign,
  Calendar,
  User,
  Image as ImageIcon,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback.tsx';
import { toast } from 'sonner';

interface LogEntry {
  id: string;
  plateNumber: string;
  vehicleType: 'car' | 'motorcycle' | 'truck' | 'electric_bike' | 'bicycle';
  ownerName: string;
  ownerPhone: string;
  zone: string;
  spotId: string;
  entryTime: Date;
  exitTime?: Date;
  entryImage: string;
  exitImage?: string;
  driverEntryImage: string;
  driverExitImage?: string;
  paymentMethod: 'cash' | 'online' | 'coins';
  amount?: number;
  supervisorEntry: string;
  supervisorExit?: string;
  duration?: string;
  status: 'parked' | 'completed';
}

export const VehicleEntryExitLog = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('today');
  const [filterZone, setFilterZone] = useState('all');
  const [filterVehicleType, setFilterVehicleType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState<{ type: string; url: string } | null>(null);

  // Mock data - Nhật ký xe ra vào
  const mockLogs: LogEntry[] = [
    {
      id: 'log1',
      plateNumber: '30A-12345',
      vehicleType: 'car',
      ownerName: 'Nguyễn Văn A',
      ownerPhone: '0901234567',
      zone: 'Sân A',
      spotId: 'A015',
      entryTime: new Date('2026-03-31T08:30:00'),
      exitTime: new Date('2026-03-31T11:45:00'),
      entryImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400',
      exitImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400',
      driverEntryImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      driverExitImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      paymentMethod: 'coins',
      amount: 150,
      supervisorEntry: 'Giám sát Trần',
      supervisorExit: 'Giám sát Lê',
      duration: '3 giờ 15 phút',
      status: 'completed',
    },
    {
      id: 'log2',
      plateNumber: '29B-67890',
      vehicleType: 'motorcycle',
      ownerName: 'Trần Thị B',
      ownerPhone: '0902345678',
      zone: 'Sân A',
      spotId: 'A022',
      entryTime: new Date('2026-03-31T09:15:00'),
      entryImage: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=400',
      driverEntryImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      paymentMethod: 'cash',
      supervisorEntry: 'Giám sát Trần',
      status: 'parked',
    },
    {
      id: 'log3',
      plateNumber: '51C-11111',
      vehicleType: 'truck',
      ownerName: 'Lê Văn C',
      ownerPhone: '0903456789',
      zone: 'Sân B',
      spotId: 'B003',
      entryTime: new Date('2026-03-31T07:00:00'),
      exitTime: new Date('2026-03-31T10:30:00'),
      entryImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400',
      exitImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400',
      driverEntryImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
      driverExitImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
      paymentMethod: 'online',
      amount: 300,
      supervisorEntry: 'Giám sát Trần',
      supervisorExit: 'Giám sát Trần',
      duration: '3 giờ 30 phút',
      status: 'completed',
    },
    {
      id: 'log4',
      plateNumber: '30F-98765',
      vehicleType: 'car',
      ownerName: 'Phạm Minh D',
      ownerPhone: '0904567890',
      zone: 'Sân B',
      spotId: 'B008',
      entryTime: new Date('2026-03-31T06:45:00'),
      entryImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
      driverEntryImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      paymentMethod: 'coins',
      supervisorEntry: 'Giám sát Trần',
      status: 'parked',
    },
  ];

  // Statistics
  const stats = {
    totalEntry: 15,
    totalExit: 11,
    currentlyParked: 4,
    todayRevenue: 2850,
  };

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

  const zones = ['all', 'Sân A', 'Sân B', 'Sân C'];

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch =
      log.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = filterZone === 'all' || log.zone === filterZone;
    const matchesVehicleType = filterVehicleType === 'all' || log.vehicleType === filterVehicleType;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    return matchesSearch && matchesZone && matchesVehicleType && matchesStatus;
  });

  const handleViewImage = (type: string, url: string) => {
    setShowImageModal({ type, url });
  };

  const handleExportExcel = () => {
    toast.success('Đang xuất báo cáo Excel...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/supervisor')}
              className="p-2 hover:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl mb-1">📋 Nhật ký xe ra vào</h1>
              <p className="text-blue-100 text-sm">Quản lý và theo dõi luồng xe trong bãi</p>
            </div>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-400/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-100" />
                </div>
                <div>
                  <div className="text-2xl">{stats.totalEntry}</div>
                  <div className="text-xs text-blue-100">Xe vào hôm nay</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-400/30 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-100" />
                </div>
                <div>
                  <div className="text-2xl">{stats.totalExit}</div>
                  <div className="text-xs text-blue-100">Xe ra hôm nay</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-400/30 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-100" />
                </div>
                <div>
                  <div className="text-2xl">{stats.currentlyParked}</div>
                  <div className="text-xs text-blue-100">Đang đỗ</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-yellow-100" />
                </div>
                <div>
                  <div className="text-2xl">{stats.todayRevenue.toLocaleString()}</div>
                  <div className="text-xs text-blue-100">Doanh thu (xu)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo biển số hoặc tên Người dùng..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="today">Hôm nay</option>
                <option value="yesterday">Hôm qua</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="custom">Tùy chỉnh</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Zone Filter */}
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">Tất cả zone</option>
                {zones.filter((z) => z !== 'all').map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Type Filter */}
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-gray-400" />
              <select
                value={filterVehicleType}
                onChange={(e) => setFilterVehicleType(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">Tất cả loại xe</option>
                <option value="car">Xe ô tô</option>
                <option value="motorcycle">Xe máy</option>
                <option value="truck">Xe tải</option>
                <option value="electric_bike">Xe đạp điện</option>
                <option value="bicycle">Xe đạp</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
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
              {/* Summary */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Vehicle Icon */}
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                      {vehicleTypeIcons[log.vehicleType]}
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
                          {log.status === 'parked' ? '🅿️ Đang đỗ' : '✅ Đã ra'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>
                            {log.ownerName} • {log.ownerPhone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {log.zone} - Chỗ {log.spotId}
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
                      </div>
                    </div>

                    {/* Amount */}
                    {log.amount && (
                      <div className="text-right">
                        <div className="text-2xl text-green-600 mb-1">{log.amount.toLocaleString()}</div>
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Entry Section */}
                    <div className="bg-white rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Thông tin vào bãi</h4>
                      </div>

                      <div className="space-y-3 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Thời gian:</span>
                          <span className="font-medium">{log.entryTime.toLocaleString('vi-VN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Giám sát viên:</span>
                          <span className="font-medium">{log.supervisorEntry}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Loại xe:</span>
                          <span className="font-medium">
                            {vehicleTypeIcons[log.vehicleType]} {vehicleTypeLabels[log.vehicleType]}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-600 mb-2">Ảnh biển số</div>
                          <div
                            onClick={() => handleViewImage('Biển số vào', log.entryImage)}
                            className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer group"
                          >
                            <ImageWithFallback
                              src={log.entryImage}
                              alt="Entry plate"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-2">Ảnh người lái</div>
                          <div
                            onClick={() => handleViewImage('Người lái vào', log.driverEntryImage)}
                            className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer group"
                          >
                            <ImageWithFallback
                              src={log.driverEntryImage}
                              alt="Entry driver"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Exit Section */}
                    <div className="bg-white rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Thông tin ra bãi</h4>
                      </div>

                      {log.exitTime ? (
                        <>
                          <div className="space-y-3 mb-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Thời gian:</span>
                              <span className="font-medium">{log.exitTime.toLocaleString('vi-VN')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Giám sát viên:</span>
                              <span className="font-medium">{log.supervisorExit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Thời gian đỗ:</span>
                              <span className="font-medium text-blue-600">{log.duration}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Phí đỗ xe:</span>
                              <span className="font-medium text-green-600">
                                {log.amount?.toLocaleString()} xu
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs text-gray-600 mb-2">Ảnh biển số</div>
                              <div
                                onClick={() => handleViewImage('Biển số ra', log.exitImage!)}
                                className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer group"
                              >
                                <ImageWithFallback
                                  src={log.exitImage!}
                                  alt="Exit plate"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-2">Ảnh người lái</div>
                              <div
                                onClick={() => handleViewImage('Người lái ra', log.driverExitImage!)}
                                className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer group"
                              >
                                <ImageWithFallback
                                  src={log.driverExitImage!}
                                  alt="Exit driver"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Eye className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                          <Clock className="w-12 h-12 mb-3" />
                          <p className="text-sm">Xe vẫn đang đỗ trong bãi</p>
                        </div>
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
            <h3 className="text-xl text-gray-900 mb-2">Không tìm thấy nhật ký</h3>
            <p className="text-gray-500">Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowImageModal(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              ✕ Đóng
            </button>
            <div className="bg-white rounded-2xl p-2">
              <div className="text-center mb-2 font-semibold text-gray-900">{showImageModal.type}</div>
              <ImageWithFallback
                src={showImageModal.url}
                alt={showImageModal.type}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
