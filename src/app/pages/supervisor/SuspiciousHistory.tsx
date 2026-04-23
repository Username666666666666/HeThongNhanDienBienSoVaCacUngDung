import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Flag,
  Car,
  Calendar,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  Camera,
  
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback.tsx';

interface HistoryRecord {
  id: string;
  plateNumber: string;
  ownerName: string;
  ownerPhone: string;
  parkingSpot: string;
  zone: string;
  entryTime: Date;
  flaggedTime: Date;
  resolvedTime?: Date;
  daysParked: number;
  status: 'resolved' | 'flagged' | 'removed';
  resolution: string;
  flaggedBy: string;
  resolvedBy?: string;
  entryPhoto: string;
  driverPhoto: string;
  notes?: string;
}

export const SuspiciousHistory = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'resolved' | 'flagged' | 'removed'>(
    'all'
  );
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  const [records] = useState<HistoryRecord[]>([
    {
      id: '1',
      plateNumber: '30A-12345',
      ownerName: 'Nguyễn Văn A',
      ownerPhone: '0901234567',
      parkingSpot: 'A015',
      zone: 'Sân A',
      entryTime: new Date('2026-03-15T08:30:00'),
      flaggedTime: new Date('2026-03-22T10:00:00'),
      resolvedTime: new Date('2026-03-23T14:30:00'),
      daysParked: 8,
      status: 'resolved',
      resolution: 'Người dùng đi công tác dài ngày, đã xác nhận qua điện thoại',
      flaggedBy: 'Giám sát Trần Văn B',
      resolvedBy: 'Giám sát Trần Văn B',
      entryPhoto: 'https://images.unsplash.com/photo-1774576670116-a21417528d54?w=400',
      driverPhoto: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400',
      notes: 'Khách hàng thân thiết, đã liên hệ trước',
    },
    {
      id: '2',
      plateNumber: '51F-67890',
      ownerName: 'Trần Thị B',
      ownerPhone: '0902345678',
      parkingSpot: 'B008',
      zone: 'Sân B',
      entryTime: new Date('2026-03-20T14:20:00'),
      flaggedTime: new Date('2026-03-26T09:15:00'),
      daysParked: 6,
      status: 'flagged',
      resolution: 'Đang chờ phản hồi từ Người dùng',
      flaggedBy: 'Giám sát Lê Thị C',
      entryPhoto: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
      driverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      notes: 'Không liên hệ được, đã gửi tin nhắn',
    },
    {
      id: '3',
      plateNumber: '29B-11111',
      ownerName: 'Lê Văn C',
      ownerPhone: '0903456789',
      parkingSpot: 'C012',
      zone: 'Sân C',
      entryTime: new Date('2026-02-28T10:00:00'),
      flaggedTime: new Date('2026-03-10T08:00:00'),
      resolvedTime: new Date('2026-03-11T16:00:00'),
      daysParked: 11,
      status: 'removed',
      resolution: 'Xe bị bỏ quên, đã liên hệ Người dùng và di dời xe ra khỏi bãi',
      flaggedBy: 'Giám sát Trần Văn B',
      resolvedBy: 'Admin Nguyễn Văn D',
      entryPhoto: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400',
      driverPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      notes: 'Xe hỏng, Người dùng đã thu xếp xe cứu hộ',
    },
    {
      id: '4',
      plateNumber: '59A-22222',
      ownerName: 'Phạm Thị D',
      ownerPhone: '0904567890',
      parkingSpot: 'A025',
      zone: 'Sân A',
      entryTime: new Date('2026-03-18T11:45:00'),
      flaggedTime: new Date('2026-03-25T15:20:00'),
      resolvedTime: new Date('2026-03-26T10:00:00'),
      daysParked: 8,
      status: 'resolved',
      resolution: 'Người dùng nhập viện, người thân đã đến lấy xe',
      flaggedBy: 'Giám sát Lê Thị C',
      resolvedBy: 'Giám sát Lê Thị C',
      entryPhoto: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400',
      driverPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    },
    {
      id: '5',
      plateNumber: '92C-33333',
      ownerName: 'Hoàng Văn E',
      ownerPhone: '0905678901',
      parkingSpot: 'B015',
      zone: 'Sân B',
      entryTime: new Date('2026-03-10T16:30:00'),
      flaggedTime: new Date('2026-03-18T12:00:00'),
      resolvedTime: new Date('2026-03-19T09:30:00'),
      daysParked: 9,
      status: 'resolved',
      resolution: 'Xe thuê dài hạn, đã gia hạn thêm 1 tháng',
      flaggedBy: 'Giám sát Trần Văn B',
      resolvedBy: 'Admin Nguyễn Văn D',
      entryPhoto: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400',
      driverPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      notes: 'Khách hàng VIP, đã thanh toán trước 3 tháng',
    },
  ]);

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.ownerPhone.includes(searchTerm);

    const matchesFilter = filterStatus === 'all' || record.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'from-green-500 to-emerald-500';
      case 'flagged':
        return 'from-red-500 to-pink-500';
      case 'removed':
        return 'from-purple-500 to-indigo-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'resolved':
        return '✅ Đã giải quyết';
      case 'flagged':
        return '🚩 Đang xử lý';
      case 'removed':
        return '🚚 Đã di dời';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5" />;
      case 'flagged':
        return <Flag className="w-5 h-5" />;
      case 'removed':
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const resolvedCount = records.filter((r) => r.status === 'resolved').length;
  const flaggedCount = records.filter((r) => r.status === 'flagged').length;
  const removedCount = records.filter((r) => r.status === 'removed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/supervisor/suspicious-vehicles')}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl mb-1 flex items-center gap-3">
                <Flag className="w-8 h-8" />
                Lịch sử xe nghi ngờ
              </h1>
              <p className="text-purple-100 text-sm">
                Tất cả các xe đã được đánh dấu và xử lý
              </p>
            </div>
            <button
              onClick={() =>
                alert('Chức năng xuất báo cáo đang được phát triển')
              }
              className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl hover:bg-white/30 transition flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span className="font-semibold">Xuất báo cáo</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-100 text-sm mb-1">Tổng số</div>
                <div className="text-4xl font-bold">{records.length}</div>
              </div>
              <Car className="w-12 h-12 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-100 text-sm mb-1">Đã giải quyết</div>
                <div className="text-4xl font-bold">{resolvedCount}</div>
              </div>
              <CheckCircle className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-red-100 text-sm mb-1">Đang xử lý</div>
                <div className="text-4xl font-bold">{flaggedCount}</div>
              </div>
              <Flag className="w-12 h-12 text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-yellow-500 text-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-orange-100 text-sm mb-1">Đã di dời</div>
                <div className="text-4xl font-bold">{removedCount}</div>
              </div>
              <XCircle className="w-12 h-12 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo biển số, tên Người dùng, số điện thoại..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as typeof filterStatus)
                }
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none appearance-none bg-white"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="resolved">Đã giải quyết</option>
                <option value="flagged">Đang xử lý</option>
                <option value="removed">Đã di dời</option>
              </select>
            </div>
          </div>
        </div>

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-purple-300 transition"
            >
              <div
                className={`p-4 bg-gradient-to-r ${getStatusColor(
                  record.status
                )} text-white`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <div className="text-2xl font-bold">{record.plateNumber}</div>
                      <div className="text-sm opacity-90">
                        {getStatusLabel(record.status)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{record.daysParked}</div>
                    <div className="text-sm opacity-90">ngày đỗ</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                  {/* Owner Info */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Thông tin Người dùng
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="font-semibold">{record.ownerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{record.ownerPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">
                          {record.parkingSpot} - {record.zone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      Thời gian
                    </h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-start gap-2">
                        <Clock className="w-3 h-3 text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-gray-500">Vào bãi</div>
                          <div className="font-semibold text-gray-900">
                            {record.entryTime.toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Flag className="w-3 h-3 text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-gray-500">Đánh dấu</div>
                          <div className="font-semibold text-gray-900">
                            {record.flaggedTime.toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>
                      {record.resolvedTime && (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-gray-500">Giải quyết</div>
                            <div className="font-semibold text-gray-900">
                              {record.resolvedTime.toLocaleString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Staff Info */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-600" />
                      Nhân viên xử lý
                    </h4>
                    <div className="space-y-1 text-xs">
                      <div>
                        <div className="text-gray-500">Đánh dấu bởi</div>
                        <div className="font-semibold text-gray-900">
                          {record.flaggedBy}
                        </div>
                      </div>
                      {record.resolvedBy && (
                        <div>
                          <div className="text-gray-500">Giải quyết bởi</div>
                          <div className="font-semibold text-gray-900">
                            {record.resolvedBy}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-600" />
                      Thao tác
                    </h4>
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 font-semibold text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Xem chi tiết
                    </button>
                  </div>
                </div>

                {/* Resolution */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border-2 border-purple-200">
                  <h4 className="font-bold text-gray-900 text-sm mb-2">
                    📝 Kết quả xử lý
                  </h4>
                  <p className="text-sm text-gray-700">{record.resolution}</p>
                  {record.notes && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      Ghi chú: {record.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRecords.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Không tìm thấy kết quả
            </h3>
            <p className="text-gray-600">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div
              className={`p-6 bg-gradient-to-r ${getStatusColor(
                selectedRecord.status
              )} text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-1">
                    {selectedRecord.plateNumber}
                  </h2>
                  <p className="opacity-90">{getStatusLabel(selectedRecord.status)}</p>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition"
                >
                  <XCircle className="w-8 h-8" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Owner Info */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Thông tin Người dùng
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold">{selectedRecord.ownerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{selectedRecord.ownerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {selectedRecord.parkingSpot} - {selectedRecord.zone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {selectedRecord.daysParked} ngày đỗ
                    </span>
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-600" />
                  Ảnh khi vào bãi
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <ImageWithFallback
                      src={selectedRecord.entryPhoto}
                      alt="Entry Plate"
                      className="w-full h-64 object-cover rounded-xl border-2 border-gray-300"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      📷 Biển số xe
                    </div>
                  </div>
                  <div className="relative">
                    <ImageWithFallback
                      src={selectedRecord.driverPhoto}
                      alt="Entry Driver"
                      className="w-full h-64 object-cover rounded-xl border-2 border-gray-300"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      👤 Người lái xe
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Dòng thời gian
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Vào bãi đỗ</div>
                      <div className="text-sm text-gray-600">
                        {selectedRecord.entryTime.toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <Flag className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Đánh dấu nghi ngờ
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedRecord.flaggedTime.toLocaleString('vi-VN')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Bởi: {selectedRecord.flaggedBy}
                      </div>
                    </div>
                  </div>
                  {selectedRecord.resolvedTime && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-900">Đã giải quyết</div>
                        <div className="text-sm text-gray-600">
                          {selectedRecord.resolvedTime.toLocaleString('vi-VN')}
                        </div>
                        {selectedRecord.resolvedBy && (
                          <div className="text-xs text-gray-500 mt-1">
                            Bởi: {selectedRecord.resolvedBy}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">
                  📝 Kết quả xử lý
                </h3>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border-2 border-purple-200">
                  <p className="text-gray-700">{selectedRecord.resolution}</p>
                  {selectedRecord.notes && (
                    <p className="text-sm text-gray-500 mt-3 italic">
                      Ghi chú: {selectedRecord.notes}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
