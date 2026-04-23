import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Car, Clock, MapPin, Send, User, MessageSquare, Filter, Upload, Image as ImageIcon, Search, Shield, Eye, AlertOctagon, Camera } from 'lucide-react';
import { toast } from 'sonner';
import type { TheftReport, TheftReportUpdate } from '../../types/community.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { getHomeRoute } from '../../utils/navigation.ts';

export const TheftReportPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('id');

  const [showNewReport, setShowNewReport] = useState(!reportId);
  const [licensePlate, setLicensePlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [reports, setReports] = useState<TheftReport[]>([
    {
      id: 'theft1',
      userId: 'user1',
      userName: 'Nguyễn Văn A',
      vehicleInfo: {
        licensePlate: '59A-12345',
        brand: 'Honda',
        model: 'Wave RSX',
        color: 'Đen',
      },
      parkingLotCode: 'PL001',
      parkingLotName: 'Bãi đỗ xe Trung tâm A',
      lastSeenTime: new Date('2026-03-31T08:00:00'),
      reportTime: new Date('2026-03-31T10:30:00'),
      description: 'Xe đỗ từ 8h sáng nhưng đến 10h30 không thấy xe nữa. Vui lòng kiểm tra camera.',
      status: 'escalated',
      severity: 'high',
      isEscalatedToAdmin: true,
      escalatedAt: new Date('2026-03-31T12:00:00'),
      adminId: 'admin1',
      adminName: 'Quản trị viên Nguyễn',
      cameraFootage: ['camera1', 'camera2'],
      supportStaffId: 'support1',
      supportStaffName: 'Nhân viên Hỗ trợ A',
      updates: [
        {
          id: 'update1',
          staffId: 'support1',
          staffName: 'Nhân viên Hỗ trợ A',
          staffRole: 'support',
          content: 'Đã xem camera và phát hiện xe rời bãi lúc 9:15 sáng với người lạ điều khiển. Sự việc nghiêm trọng, đã chuyển lên quản trị viên.',
          createdAt: new Date('2026-03-31T11:00:00'),
          isEscalation: true,
        },
        {
          id: 'update2',
          staffId: 'admin1',
          staffName: 'Quản trị viên Nguyễn',
          staffRole: 'admin',
          content: 'Đã đối soát camera và xác định đây là vụ mất cắp. Đã liên hệ công an và gửi hình ảnh. Giám sát viên ca sáng sẽ được xem xét trách nhiệm do thiếu sót.',
          createdAt: new Date('2026-03-31T14:00:00'),
        },
      ],
      communityComments: [
        {
          id: 'com1',
          userId: 'user2',
          userName: 'Trần Thị B',
          content: 'Tôi có thấy một chiếc xe màu đen rời bãi lúc sáng, có lẽ là xe của bạn.',
          createdAt: new Date('2026-03-31T11:30:00'),
        },
      ],
    },
  ]);

  const filteredReports = reports.filter(r =>
    r.vehicleInfo.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

const handleCreateReport = () => {
  if (!user) {
    toast.error('Bạn cần đăng nhập');
    return;
  }

  if (!licensePlate.trim() || !brand.trim() || !model.trim() || !color.trim() || !description.trim()) {
    toast.error('Vui lòng điền đầy đủ thông tin');
    return;
  }

    const newReport: TheftReport = {
      id: `theft${Date.now()}`,
      userId: user.id,
      userName: user.name,
      vehicleInfo: {
        licensePlate,
        brand,
        model,
        color,
      },
      parkingLotCode: 'PL001',
      parkingLotName: 'Bãi đỗ xe Trung tâm A',
      lastSeenTime: new Date(),
      reportTime: new Date(),
      description,
      status: 'pending',
      updates: [],
      communityComments: [],
    };

    setReports([newReport, ...reports]);
    setShowNewReport(false);
    setLicensePlate('');
    setBrand('');
    setModel('');
    setColor('');
    setDescription('');
    toast.success('Báo cáo của bạn đang được xử lý');
  };

 const handleAddCommunityComment = (reportId: string) => {
  if (!user) {
    toast.error('Bạn cần đăng nhập');
    return;
  }

  if (!messageText.trim()) return;

    setReports(reports.map(r =>
      r.id === reportId
        ? {
          ...r,
          communityComments: [
            ...r.communityComments,
            {
              id: `com${Date.now()}`,
              userId: user.id,
              userName: user.name,
              content: messageText,
              createdAt: new Date(),
            },
          ],
        }
        : r
    ));

    setMessageText('');
    toast.success('Đã gửi thông tin hỗ trợ');
  };

  const getStatusColor = (status: TheftReport['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'investigating': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'escalated': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'found': return 'bg-green-100 text-green-700 border-green-300';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusLabel = (status: TheftReport['status']) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'investigating': return 'Đang điều tra';
      case 'escalated': return 'Đã chuyển Admin';
      case 'found': return 'Đã tìm thấy';
      case 'closed': return 'Đã đóng';
      default: return status;
    }
  };

  const getSeverityColor = (severity?: TheftReport['severity']) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeverityLabel = (severity?: TheftReport['severity']) => {
    switch (severity) {
      case 'low': return 'Thấp';
      case 'medium': return 'Trung bình';
      case 'high': return 'Cao';
      case 'critical': return 'Nghiêm trọng';
      default: return 'Chưa xác định';
    }
  };

  const handleBackButton = () => {
    navigate('/community');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBackButton}
              className="p-2 hover:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl mb-1 flex items-center gap-2">
                <AlertTriangle className="w-7 h-7" />
                Báo cáo mất cắp
              </h1>
              <p className="text-orange-100 text-sm">Hỗ trợ tìm kiếm phương tiện</p>
            </div>
            <button
              onClick={() => setShowNewReport(true)}
              className="bg-white text-red-600 px-6 py-3 rounded-xl hover:shadow-lg transition-all"
            >
              Báo cáo mới
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo biển số hoặc tên Người dùng..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có báo cáo nào</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Report Header */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg text-gray-900 mb-1">{report.userName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {report.parkingLotName}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                      {report.severity && (
                        <span className={`px-3 py-1 rounded-full text-xs ${getSeverityColor(report.severity)}`}>
                          Mức độ: {getSeverityLabel(report.severity)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Escalation Badge */}
                  {report.isEscalatedToAdmin && (
                    <div className="bg-orange-100 border-l-4 border-orange-500 p-3 rounded mb-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="text-sm text-orange-900 font-medium">Đã chuyển lên Quản trị viên</p>
                          <p className="text-xs text-orange-700">
                            Xử lý bởi: {report.adminName} • {report.escalatedAt && new Date(report.escalatedAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vehicle Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-lg p-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Biển số</p>
                      <p className="text-gray-900 font-medium">{report.vehicleInfo.licensePlate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Hãng xe</p>
                      <p className="text-gray-900">{report.vehicleInfo.brand}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Dòng xe</p>
                      <p className="text-gray-900">{report.vehicleInfo.model}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Màu sắc</p>
                      <p className="text-gray-900">{report.vehicleInfo.color}</p>
                    </div>
                  </div>
                </div>

                {/* Report Details */}
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="text-sm text-gray-500 mb-2">Mô tả sự việc</h4>
                    <p className="text-gray-900">{report.description}</p>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Lần cuối thấy: {new Date(report.lastSeenTime).toLocaleString('vi-VN')}
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Báo cáo: {new Date(report.reportTime).toLocaleString('vi-VN')}
                    </div>
                  </div>

                  {/* Staff Updates */}
                  {report.updates.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-600" />
                        Cập nhật từ nhân viên ({report.updates.length})
                      </h4>
                      <div className="space-y-3">
                        {report.updates.map((update) => (
                          <div 
                            key={update.id} 
                            className={`border-l-4 p-4 rounded-lg ${
                              update.staffRole === 'admin'
                                ? 'bg-purple-50 border-purple-400'
                                : update.isEscalation
                                ? 'bg-orange-50 border-orange-400'
                                : 'bg-blue-50 border-blue-400'
                            }`}
                          >
                            <div className="flex items-start gap-2 mb-2">
                              {update.staffRole === 'admin' && (
                                <Shield className="w-4 h-4 text-purple-600 mt-0.5" />
                              )}
                              {update.isEscalation && update.staffRole !== 'admin' && (
                                <AlertOctagon className="w-4 h-4 text-orange-600 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-sm font-medium ${
                                    update.staffRole === 'admin' ? 'text-purple-900' : 'text-blue-900'
                                  }`}>
                                    {update.staffName}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    update.staffRole === 'admin'
                                      ? 'bg-purple-200 text-purple-800'
                                      : 'bg-blue-200 text-blue-800'
                                  }`}>
                                    {update.staffRole === 'admin' ? 'Quản trị viên' : 'Nhân viên hỗ trợ'}
                                  </span>
                                  <span className={`text-xs ${
                                    update.staffRole === 'admin' ? 'text-purple-600' : 'text-blue-600'
                                  }`}>
                                    {new Date(update.createdAt).toLocaleString('vi-VN')}
                                  </span>
                                </div>
                                <p className={`text-sm ${
                                  update.staffRole === 'admin' ? 'text-purple-800' : 'text-blue-800'
                                }`}>
                                  {update.content}
                                </p>
                                {update.isEscalation && (
                                  <div className="mt-2 text-xs text-orange-700 flex items-center gap-1">
                                    <AlertOctagon className="w-3 h-3" />
                                    Sự việc đã được chuyển lên cấp cao hơn
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Camera Footage */}
                  {report.cameraFootage && report.cameraFootage.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-purple-600" />
                        Camera được kiểm tra
                      </h4>
                      <div className="flex gap-2">
                        {report.cameraFootage.map((cam, i) => (
                          <span key={i} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                            Camera {i + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Community Comments */}
                  <div className="border-t pt-6">
                    <h4 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      Hỗ trợ từ cộng đồng ({report.communityComments.length})
                    </h4>

                    {report.communityComments.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {report.communityComments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm">
                              {comment.userName[0]}
                            </div>
                            <div className="flex-1 bg-green-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-gray-900">{comment.userName}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleString('vi-VN')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Chia sẻ thông tin hữu ích..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddCommunityComment(report.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddCommunityComment(report.id)}
                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-all"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Report Modal */}
      {showNewReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-7 h-7 text-red-600" />
                Báo cáo mất cắp
              </h2>
              <button
                onClick={() => setShowNewReport(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  Vui lòng cung cấp đầy đủ thông tin để chúng tôi có thể hỗ trợ bạn nhanh nhất.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Biển số xe *</label>
                  <input
                    type="text"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                    placeholder="VD: 59A-12345"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Hãng xe *</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="VD: Honda"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Dòng xe *</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="VD: Wave RSX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Màu sắc *</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="VD: Đen"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Mô tả sự việc *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết thời gian, vị trí và hoàn cảnh phát hiện mất xe..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewReport(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateReport}
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg hover:shadow-lg transition-all"
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};