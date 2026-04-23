import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, MessageSquare, Users, AlertTriangle, FileText, 
  Clock, CheckCircle, XCircle, Search, Filter, Eye,
  ArrowLeft, User, Bell, Send, Ban, CheckCheck, Trash2,
  MapPin, Building2
} from 'lucide-react';
import { toast } from 'sonner';
import type { CommunityMember, CommunityPost, TheftReport } from '../../types/community.ts';

export const SupportStaffDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'members' | 'moderation' | 'tickets' | 'theft'>('moderation');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const currentStaff = {
    id: 'support1',
    name: 'Nhân viên Hỗ trợ A',
    role: 'support' as const,
    assignedParkingLot: 'PL001', // Admin đã gán bãi đỗ
    parkingLotName: 'Bãi đỗ xe Trung tâm A',
    canSwitchLots: true, // Admin đã cấp phép chuyển bãi
  };

  // Kiểm tra xem nhân viên đã được gán bãi đỗ chưa
  const hasAssignedLot = !!currentStaff.assignedParkingLot;

  // Mock data
  const [members, setMembers] = useState<CommunityMember[]>([
  {
    id: '1',
    userId: 'user1',
    userName: 'Nguyễn Văn A',
    parkingLotCode: 'PL001',
    joinedAt: new Date('2026-03-01'),

    isBanned: false,

    postCount: 5,
    totalParks: 10,
    lastActive: new Date('2026-03-31T10:00:00'),
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Trần Thị B',
    parkingLotCode: 'PL001',
    joinedAt: new Date('2026-03-10'),

    isBanned: false,

    postCount: 3,
    totalParks: 5,
    lastActive: new Date('2026-03-30T15:00:00'),
  },
]);

  const [pendingPosts, setPendingPosts] = useState<CommunityPost[]>([
    {
      id: 'post1',
      authorId: 'user1',
      authorName: 'Nguyễn Văn A',
      parkingLotCode: 'PL001',
      parkingLotName: 'Bãi đỗ xe Trung tâm A',
      tags: ['experience'],
      title: 'Trải nghiệm đỗ xe tốt',
      content: 'Nhân viên thân thiện, bãi xe rộng rãi và sạch sẽ.',
      createdAt: new Date('2026-03-31T09:00:00'),
      status: 'pending',
      likes: 0,
      likedBy: [],
      comments: [],
      hasParkedHere: true,
    },
  ]);

  const [theftReports, setTheftReports] = useState<TheftReport[]>([
    {
      id: 'theft1',
      userId: 'user3',
      userName: 'Lê Văn C',
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
      description: 'Xe đỗ từ 8h sáng nhưng đến 10h30 không thấy xe nữa.',
      status: 'pending',
      updates: [],
      communityComments: [],
    },
  ]);

  const [messageText, setMessageText] = useState('');
  const [updateText, setUpdateText] = useState<{ [key: string]: string }>({});
  const [selectedSeverity, setSelectedSeverity] = useState<{ [key: string]: TheftReport['severity'] }>({});

  const handleApprovePost = (postId: string) => {
    setPendingPosts(pendingPosts.map(p => p.id === postId ? { ...p, status: 'approved' as const } : p));
    toast.success('✅ Đã duyệt bài viết');
  };

  const handleRejectPost = (postId: string) => {
    setPendingPosts(pendingPosts.map(p => p.id === postId ? { ...p, status: 'rejected' as const } : p));
    toast.success('❌ Đã từ chối bài viết');
  };

  const handleBlockUser = (userId: string) => {
    setMembers(members.map(m => m.id === userId ? { ...m, isBlocked: true } : m));
    toast.success('🚫 Đã chặn người dùng');
  };

  const handleUnblockUser = (userId: string) => {
    setMembers(members.map(m => m.id === userId ? { ...m, isBlocked: false } : m));
    toast.success('✅ Đã bỏ chặn người dùng');
  };

  const handleUpdateTheftReport = (reportId: string) => {
    const update = updateText[reportId];
    const severity = selectedSeverity[reportId];
    
    if (!update) {
      toast.error('Vui lòng nhập cập nhật');
      return;
    }

    setTheftReports(theftReports.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status: 'investigating' as const,
          severity: severity || r.severity,
       updates: [
  ...(r.updates || []),
  {
    id: Date.now().toString(),
    staffId: currentStaff.manguoidung,
    staffName: currentStaff.name,
    staffRole: currentStaff.role,
    content: update,
    createdAt: new Date(),
  },
],
        };
      }
      return r;
    }));

    setUpdateText({ ...updateText, [reportId]: '' });
    toast.success('✅ Đã cập nhật báo cáo');
  };

  const filteredPosts = pendingPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Nếu chưa được gán bãi đỗ
  if (!hasAssignedLot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center border-2 border-yellow-300">
          <div className="inline-block bg-gradient-to-br from-yellow-400 to-orange-400 p-6 rounded-full mb-6">
            <Building2 className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Chưa có bãi đỗ</h1>
          <p className="text-gray-600 mb-6">
            Bạn chưa được gán vào bãi đỗ nào. Vui lòng liên hệ Admin để được cấu hình bãi đỗ mặc định.
          </p>
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-800">
              💡 <strong>Lưu ý:</strong> Admin sẽ gán bạn vào một bãi đỗ cụ thể để bạn có thể làm việc.
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl mb-1 flex items-center gap-3">
                  <Shield className="w-8 h-8" />
                  Nhân viên hỗ trợ
                </h1>
                <div className="flex items-center gap-3">
                  <p className="text-purple-100 text-sm">Quản lý cộng đồng & hỗ trợ</p>
                  <div className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm font-semibold">{currentStaff.parkingLotName}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.href = '/internal-chat'}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-semibold">Chat nội bộ</span>
              </button>
              <button
                onClick={() => navigate('/community')}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-semibold">Cộng đồng</span>
              </button>
              <button
                onClick={() => navigate('/support/profile')}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-semibold">Hồ sơ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 p-2 flex gap-2 border-2 border-gray-200">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'moderation'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Eye className="w-5 h-5" />
            Kiểm duyệt bài viết
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'members'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-5 h-5" />
            Quản lý thành viên
          </button>
          <button
            onClick={() => setActiveTab('theft')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'theft'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Báo mất cắp
          </button>
        </div>

        {/* Moderation Tab */}
        {activeTab === 'moderation' && (
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">Bộ lọc</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Search className="w-4 h-4 inline mr-1" />
                    Tìm kiếm
                  </label>
                  <input
                    type="text"
                    placeholder="Tiêu đề hoặc nội dung..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  >
                    <option value="all">Tất cả</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Đã từ chối</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>👤 <span className="font-semibold">{post.authorName}</span></div>
                        <div>🏢 {post.parkingLotName}</div>
                        <div>🕐 {post.createdAt.toLocaleString('vi-VN')}</div>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                      post.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      post.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {post.status === 'pending' ? '⏳ Chờ duyệt' :
                       post.status === 'approved' ? '✅ Đã duyệt' :
                       '❌ Đã từ chối'}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-4 border-2 border-gray-200">
                    <p className="text-gray-700">{post.content}</p>
                  </div>

                  {post.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprovePost(post.id)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition shadow-lg flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Duyệt bài
                      </button>
                      <button
                        onClick={() => handleRejectPost(post.id)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-rose-600 transition shadow-lg flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {filteredPosts.length === 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-gray-200">
                  <div className="text-gray-400 text-6xl mb-4">📭</div>
                  <div className="text-xl font-bold text-gray-700 mb-2">Không có bài viết</div>
                  <div className="text-gray-500">Không tìm thấy bài viết nào cần kiểm duyệt</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.userName}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>📊 Số bài viết: <span className="font-semibold">{member.postCount}</span></div>
                      <div>📅 Tham gia: {member.joinedAt.toLocaleDateString('vi-VN')}</div>
                      <div>🕐 Hoạt động: {member.lastActive.toLocaleString('vi-VN')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {member.isBanned ? (
                      <>
                        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-bold">🚫 Đã chặn</div>
                        <button
                          onClick={() => handleUnblockUser(member.id)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition shadow-lg"
                        >
                          Bỏ chặn
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleBlockUser(member.id)}
                        className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-3 rounded-xl font-bold hover:from-red-600 hover:to-rose-600 transition shadow-lg flex items-center gap-2"
                      >
                        <Ban className="w-5 h-5" />
                        Chặn người dùng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Theft Reports Tab */}
        {activeTab === 'theft' && (
          <div className="space-y-4">
            {theftReports.map((report) => (
              <div key={report.id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">🚨 Báo mất xe</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>👤 <span className="font-semibold">{report.userName}</span></div>
                      <div>🏢 {report.parkingLotName}</div>
                      <div>🚗 {report.vehicleInfo.licensePlate} - {report.vehicleInfo.brand} {report.vehicleInfo.model}</div>
                      <div>🎨 Màu: {report.vehicleInfo.color}</div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                    report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    report.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                    report.status === 'closed' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {report.status === 'pending' && '⏳ Chờ xử lý'}
                    {report.status === 'investigating' && '🔍 Đang điều tra'}
                    {report.status === 'closed' && '✅ Đã giải quyết'}
                    {report.status === 'closed' && '❌ Đóng'}
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl p-4 mb-4 border-2 border-red-200">
                  <div className="font-bold text-red-700 mb-2">📝 Mô tả:</div>
                  <p className="text-gray-700">{report.description}</p>
                  <div className="mt-3 text-sm text-gray-600">
                    <div>🕐 Lần cuối thấy: {report.lastSeenTime.toLocaleString('vi-VN')}</div>
                    <div>📢 Báo cáo lúc: {report.reportTime.toLocaleString('vi-VN')}</div>
                  </div>
                </div>

                {report.updates && report.updates.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {report.updates.map((update, idx) => (
                      <div key={idx} className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-700">{update.staffName}</span>
                          <span className="text-xs text-gray-500">{update.createdAt.toLocaleString('vi-VN')}</span>
                        </div>
                        <p className="text-sm text-gray-700">{update.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mức độ nghiêm trọng</label>
                    <select
                      value={selectedSeverity[report.id] || report.severity || 'medium'}
                      onChange={(e) => setSelectedSeverity({ ...selectedSeverity, [report.id]: e.target.value as any })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                      <option value="critical">Nghiêm trọng</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cập nhật tiến trình</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={updateText[report.id] || ''}
                        onChange={(e) => setUpdateText({ ...updateText, [report.id]: e.target.value })}
                        placeholder="Nhập cập nhật..."
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      />
                      <button
                        onClick={() => handleUpdateTheftReport(report.id)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-600 transition shadow-lg flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Gửi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {theftReports.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-gray-200">
                <div className="text-gray-400 text-6xl mb-4">✅</div>
                <div className="text-xl font-bold text-gray-700 mb-2">Không có báo cáo mất cắp</div>
                <div className="text-gray-500">Hiện tại không có báo cáo mất cắp nào</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};