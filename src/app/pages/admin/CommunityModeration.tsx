import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, XCircle, MessageSquare,
  AlertTriangle, Users, UserX, Shield, Eye,
  Clock, Filter, Search
} from 'lucide-react';
import { toast } from 'sonner';
import type { CommunityPost, SupportTicket, CommunityMember } from '../../types/community.ts';

export const CommunityModeration = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'posts' | 'tickets' | 'members'>('posts');
  const [selectedParkingLot, setSelectedParkingLot] = useState<string>('all');

  const parkingLots = [
    { code: 'PL001', name: 'Bãi đỗ xe Trung tâm A' },
    { code: 'PL002', name: 'Bãi đỗ xe Quận 3' },
  ];

  // Mock pending posts
  const [pendingPosts, setPendingPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      authorId: 'user1',
      authorName: 'Nguyễn Văn A',
      parkingLotCode: 'PL001',
      parkingLotName: 'Bãi đỗ xe Trung tâm A',
      tags: ['experience'],
      title: 'Trải nghiệm đỗ xe cuối tuần',
      content: 'Hôm qua mình đỗ xe ở đây, nhân viên rất nhiệt tình và chuyên nghiệp.',
      createdAt: new Date('2026-03-31T10:00:00'),
      status: 'pending',
      likes: 0,
      likedBy: [],
      comments: [],
      hasParkedHere: true,
    },
    {
      id: '2',
      authorId: 'user2',
      authorName: 'Trần Thị B',
      parkingLotCode: 'PL001',
      parkingLotName: 'Bãi đỗ xe Trung tâm A',
      tags: ['theft_alert'],
      title: 'Phát hiện người lạ trong bãi',
      content: 'Tối qua có thấy người lạ mặt đi lại trong bãi, mọi người cẩn thận nhé!',
      createdAt: new Date('2026-03-31T09:00:00'),
      status: 'pending',
      likes: 0,
      likedBy: [],
      comments: [],
      hasParkedHere: true,
    },
  ]);

  // Mock support tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: '1',
      ticketNumber: 'TK001',
      userId: 'user1',
      userName: 'Nguyễn Văn A',
      parkingLotCode: 'PL001',
      subject: 'Báo cáo mất cắp xe',
      description: 'Xe của tôi bị mất tại vị trí A015 vào tối qua lúc 8h',
      category: 'theft',
      priority: 'urgent',
      status: 'open',
      createdAt: new Date('2026-03-31T08:00:00'),
      updatedAt: new Date('2026-03-31T08:00:00'),
      messages: [],
    },
    {
      id: '2',
      ticketNumber: 'TK002',
      userId: 'user2',
      userName: 'Trần Thị B',
      parkingLotCode: 'PL001',
      subject: 'Không thanh toán được bằng xu ảo',
      description: 'Hệ thống báo lỗi khi tôi thanh toán bằng xu ảo',
      category: 'payment',
      priority: 'high',
      status: 'in_progress',
      assignedTo: 'support1',
      assignedToName: 'Hỗ trợ viên 1',
      createdAt: new Date('2026-03-30T15:00:00'),
      updatedAt: new Date('2026-03-30T16:00:00'),
      messages: [
        {
          id: 'm1',
          userId: 'support1',
          userName: 'Hỗ trợ viên 1',
          userRole: 'support',
          content: 'Chúng tôi đang kiểm tra vấn đề. Bạn vui lòng chờ trong ít phút.',
          createdAt: new Date('2026-03-30T16:00:00'),
        },
      ],
    },
  ]);

  // Mock members
  const [members, setMembers] = useState<CommunityMember[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'Nguyễn Văn A',
      parkingLotCode: 'PL001',
      joinedAt: new Date('2026-01-15'),
      isBanned: false,
      postCount: 15,
      totalParks: 42,
      lastActive: new Date('2026-03-31'),
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Trần Thị B',
      parkingLotCode: 'PL001',
      joinedAt: new Date('2026-02-10'),
      isBanned: false,
      postCount: 8,
      totalParks: 23,
      lastActive: new Date('2026-03-30'),
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Spammer X',
      parkingLotCode: 'PL001',
      joinedAt: new Date('2026-03-20'),
      isBanned: true,
      bannedAt: new Date('2026-03-25'),
      bannedBy: 'admin1',
      banReason: 'Spam tin nhắn liên tục',
      postCount: 50,
      totalParks: 2,
      lastActive: new Date('2026-03-25'),
    },
  ]);

  const handleApprovePost = (postId: string) => {
    setPendingPosts(pendingPosts.map(p => 
      p.id === postId ? { ...p, status: 'approved' as const } : p
    ));
    toast.success('Đã duyệt bài viết!');
  };

  const handleRejectPost = (postId: string) => {
    setPendingPosts(pendingPosts.map(p => 
      p.id === postId ? { ...p, status: 'rejected' as const } : p
    ));
    toast.success('Đã từ chối bài viết!');
  };

  const handleBanMember = (memberId: string) => {
    const reason = prompt('Lý do kích thành viên:');
    if (reason) {
      setMembers(members.map(m =>
        m.id === memberId
          ? {
              ...m,
              isBanned: true,
              bannedAt: new Date(),
              bannedBy: 'admin1',
              banReason: reason,
            }
          : m
      ));
      toast.success('Đã kích thành viên khỏi cộng đồng!');
    }
  };

  const handleUnbanMember = (memberId: string) => {
    setMembers(members.map(m =>
      m.id === memberId
        ? {
            ...m,
            isBanned: false,
            bannedAt: undefined,
            bannedBy: undefined,
            banReason: undefined,
          }
        : m
    ));
    toast.success('Đã bỏ cấm thành viên!');
  };

  const handleAssignTicket = (ticketId: string) => {
    setTickets(tickets.map(t =>
      t.id === ticketId
        ? {
            ...t,
            status: 'in_progress',
            assignedTo: 'support1',
            assignedToName: 'Hỗ trợ viên 1',
            updatedAt: new Date(),
          }
        : t
    ));
    toast.success('Đã nhận xử lý yêu cầu!');
  };

  const filteredPosts = pendingPosts.filter(
    p => selectedParkingLot === 'all' || p.parkingLotCode === selectedParkingLot
  );

  const filteredTickets = tickets.filter(
    t => selectedParkingLot === 'all' || t.parkingLotCode === selectedParkingLot
  );

  const filteredMembers = members.filter(
    m => selectedParkingLot === 'all' || m.parkingLotCode === selectedParkingLot
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl mb-1">Quản lý cộng đồng</h1>
              <p className="text-purple-100 text-sm">Kiểm duyệt nội dung và quản lý thành viên</p>
            </div>
            <Shield className="w-8 h-8" />
          </div>

          {/* Parking Lot Filter */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedParkingLot('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedParkingLot === 'all'
                  ? 'bg-white text-purple-600'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              Tất cả bãi
            </button>
            {parkingLots.map((lot) => (
              <button
                key={lot.code}
                onClick={() => setSelectedParkingLot(lot.code)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedParkingLot === lot.code
                    ? 'bg-white text-purple-600'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {lot.name}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'posts', label: 'Bài đăng chờ duyệt', count: pendingPosts.filter(p => p.status === 'pending').length },
              { id: 'tickets', label: 'Yêu cầu hỗ trợ', count: tickets.filter(t => t.status === 'open').length },
              { id: 'members', label: 'Quản lý thành viên', count: members.filter(m => !m.isBanned).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Posts Moderation */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {filteredPosts.filter(p => p.status === 'pending').length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <p className="text-gray-500">Không có bài đăng nào cần duyệt</p>
              </div>
            ) : (
              filteredPosts
                .filter(p => p.status === 'pending')
                .map((post) => (
                  <div key={post.id} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xl">
                        {post.authorName[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-gray-900">{post.authorName}</h3>
                          {post.hasParkedHere ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Đã đỗ xe
                            </span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Chưa đỗ xe
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {post.parkingLotName} • {new Date(post.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex gap-2 mb-3">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-xl text-gray-900 mb-2">{post.title}</h2>
                      <p className="text-gray-700">{post.content}</p>
                    </div>

                    {!post.hasParkedHere && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 text-amber-800 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span>
                            Người dùng này chưa đỗ xe tại bãi. Xem xét kỹ trước khi duyệt.
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprovePost(post.id)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Duyệt bài
                      </button>
                      <button
                        onClick={() => handleRejectPost(post.id)}
                        className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Từ chối
                      </button>
                      <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Support Tickets */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Không có yêu cầu hỗ trợ nào</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl text-gray-900">#{ticket.ticketNumber}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            ticket.priority === 'urgent'
                              ? 'bg-red-100 text-red-700'
                              : ticket.priority === 'high'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {ticket.priority === 'urgent'
                            ? 'Khẩn cấp'
                            : ticket.priority === 'high'
                            ? 'Cao'
                            : 'Thấp'}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            ticket.status === 'open'
                              ? 'bg-yellow-100 text-yellow-700'
                              : ticket.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {ticket.status === 'open'
                            ? 'Mới'
                            : ticket.status === 'in_progress'
                            ? 'Đang xử lý'
                            : 'Đã giải quyết'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {ticket.userName} • {ticket.parkingLotCode}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(ticket.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>

                  <h4 className="text-lg text-gray-900 mb-2">{ticket.subject}</h4>
                  <p className="text-gray-700 mb-4">{ticket.description}</p>

                  {ticket.assignedTo && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
                      Đang được xử lý bởi: {ticket.assignedToName}
                    </div>
                  )}

                  {ticket.messages.length > 0 && (
                    <div className="border-t pt-4 mb-4">
                      <div className="space-y-3">
                        {ticket.messages.map((msg) => (
                          <div key={msg.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-900 mb-1">
                              {msg.userName} ({msg.userRole})
                            </div>
                            <p className="text-sm text-gray-700">{msg.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {!ticket.assignedTo && (
                      <button
                        onClick={() => handleAssignTicket(ticket.id)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:shadow-lg transition-all"
                      >
                        Nhận xử lý
                      </button>
                    )}
                    <button className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Members Management */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Thành viên</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Ngày tham gia</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Bài đăng</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Lượt đỗ</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                          {member.userName[0]}
                        </div>
                        <div>
                          <div className="text-gray-900">{member.userName}</div>
                          <div className="text-xs text-gray-500">ID: {member.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{member.postCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{member.totalParks}</td>
                    <td className="px-6 py-4">
                      {member.isBanned ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                            <UserX className="w-3 h-3" />
                            Đã kích
                          </span>
                          {member.banReason && (
                            <div className="text-xs text-gray-500 mt-1">{member.banReason}</div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          <CheckCircle className="w-3 h-3" />
                          Hoạt động
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {member.isBanned ? (
                        <button
                          onClick={() => handleUnbanMember(member.id)}
                          className="text-green-600 hover:text-green-700 text-sm"
                        >
                          Bỏ cấm
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBanMember(member.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Kích ra
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
