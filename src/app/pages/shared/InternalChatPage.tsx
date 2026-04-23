import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, Send, Users, Plus, Search, 
  AlertTriangle, DollarSign, UserPlus, X, Camera, FileText,
  TrendingUp, TrendingDown, Shield, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext.tsx';

interface ChatRoom {
  id: string;
  name: string;
  members: { id: string; name: string; role: 'admin' | 'supervisor' | 'support' }[];
  createdBy: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

interface Message {
  id: string;
  roomId: string;
  sender: string;
  senderRole: 'admin' | 'supervisor' | 'support';
  content: string;
  type: 'text' | 'alert' | 'financial' | 'theft_report' | 'camera_request';
  metadata?: {
    reportId?: string;
    vehicleInfo?: string;
    revenue?: number;
    expense?: number;
    profit?: number;
    cameraLocation?: string;
    reason?: string;
  };
  createdAt: Date;
}

interface FinancialReport {
  revenue: number;
  expense: number;
  profit: number;
  period: string;
}

export const InternalChatPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'alert' | 'financial' | 'theft_report'>('text');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showFinancialForm, setShowFinancialForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Financial form
  const [financialData, setFinancialData] = useState<FinancialReport>({
    revenue: 0,
    expense: 0,
    profit: 0,
    period: 'Tháng 4/2026',
  });

  // Available staff to add
  const allStaff = [
    { id: 'admin1', name: 'Admin Nguyễn', role: 'admin' as const },
    { id: 'admin2', name: 'Admin Trần', role: 'admin' as const },
    { id: 'supervisor1', name: 'Giám sát viên A', role: 'supervisor' as const },
    { id: 'supervisor2', name: 'Giám sát viên B', role: 'supervisor' as const },
    { id: 'support1', name: 'Nhân viên hỗ trợ C', role: 'support' as const },
    { id: 'support2', name: 'Nhân viên hỗ trợ D', role: 'support' as const },
  ];

  const [rooms, setRooms] = useState<ChatRoom[]>([
    {
      id: 'room1',
      name: 'Nhóm quản lý chung - Bãi A',
      members: [
        { id: 'admin1', name: 'Admin Nguyễn', role: 'admin' },
        { id: 'supervisor1', name: 'Giám sát viên A', role: 'supervisor' },
        { id: 'support1', name: 'Nhân viên hỗ trợ C', role: 'support' },
      ],
      createdBy: 'Admin Nguyễn',
      lastMessage: 'Báo cáo tài chính tháng 4',
      lastMessageTime: new Date('2026-04-16T14:30:00'),
      unreadCount: 2,
    },
    {
      id: 'room2',
      name: 'Xử lý khẩn cấp',
      members: [
        { id: 'admin1', name: 'Admin Nguyễn', role: 'admin' },
        { id: 'supervisor1', name: 'Giám sát viên A', role: 'supervisor' },
      ],
      createdBy: 'Admin Nguyễn',
      lastMessage: 'Có báo mất cắp cần xử lý gấp',
      lastMessageTime: new Date('2026-04-16T15:00:00'),
      unreadCount: 1,
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg1',
      roomId: 'room1',
      sender: 'Admin Nguyễn',
      senderRole: 'admin',
      content: 'Chào mọi người! Hôm nay có gì cần báo cáo không?',
      type: 'text',
      createdAt: new Date('2026-04-16T08:30:00'),
    },
    {
      id: 'msg2',
      roomId: 'room1',
      sender: 'Nhân viên hỗ trợ C',
      senderRole: 'support',
      content: 'Báo cáo tài chính tháng 4/2026',
      type: 'financial',
      metadata: {
        revenue: 150000000,
        expense: 80000000,
        profit: 70000000,
      },
      createdAt: new Date('2026-04-16T14:30:00'),
    },
    {
      id: 'msg3',
      roomId: 'room2',
      sender: 'Giám sát viên A',
      senderRole: 'supervisor',
      content: 'KHẨN CẤP: Phát hiện xe 59A-12345 bị mất tại khu vực A3',
      type: 'alert',
      metadata: {
        reportId: 'THEFT-001',
        vehicleInfo: '59A-12345 - Honda Wave RSX Đen',
      },
      createdAt: new Date('2026-04-16T15:00:00'),
    },
  ]);

  const currentRoom = rooms.find(r => r.id === selectedRoom);
  const roomMessages = messages.filter(m => m.roomId === selectedRoom).sort((a, b) => 
    a.createdAt.getTime() - b.createdAt.getTime()
  );

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedRoom) return;

    const newMessage: Message = {
      id: `msg${Date.now()}`,
      roomId: selectedRoom,
      sender: user?.name || 'Unknown',
      senderRole: (user?.role as any) || 'support',
      content: messageText,
      type: messageType,
      createdAt: new Date(),
    };

    setMessages([...messages, newMessage]);
    setRooms(rooms.map(r => r.id === selectedRoom ? {
      ...r,
      lastMessage: messageText,
      lastMessageTime: new Date(),
    } : r));
    
    setMessageText('');
    setMessageType('text');
    toast.success('✅ Đã gửi tin nhắn');
  };

  const handleSendFinancialReport = () => {
    if (!selectedRoom) return;

    const profit = financialData.revenue - financialData.expense;

    const newMessage: Message = {
      id: `msg${Date.now()}`,
      roomId: selectedRoom,
      sender: user?.name || 'Unknown',
      senderRole: 'support',
      content: `Báo cáo tài chính ${financialData.period}`,
      type: 'financial',
      metadata: {
        revenue: financialData.revenue,
        expense: financialData.expense,
        profit: profit,
      },
      createdAt: new Date(),
    };

    setMessages([...messages, newMessage]);
    setRooms(rooms.map(r => r.id === selectedRoom ? {
      ...r,
      lastMessage: `Báo cáo tài chính ${financialData.period}`,
      lastMessageTime: new Date(),
    } : r));

    setShowFinancialForm(false);
    setFinancialData({ revenue: 0, expense: 0, profit: 0, period: 'Tháng 4/2026' });
    toast.success('✅ Đã gửi báo cáo tài chính');
  };

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) {
      toast.error('❌ Vui lòng nhập tên nhóm');
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error('❌ Vui lòng chọn ít nhất 1 thành viên');
      return;
    }

    const members = allStaff.filter(s => selectedMembers.includes(s.id) || s.id === user?.id);

    const newRoom: ChatRoom = {
      id: `room${Date.now()}`,
      name: newRoomName,
      members: members,
      createdBy: user?.name || 'Unknown',
      unreadCount: 0,
    };

    setRooms([...rooms, newRoom]);
    setShowCreateRoom(false);
    setNewRoomName('');
    setSelectedMembers([]);
    toast.success('✅ Đã tạo nhóm chat');
  };

  const handleAddMembers = () => {
    if (!selectedRoom || selectedMembers.length === 0) {
      toast.error('❌ Vui lòng chọn thành viên');
      return;
    }

    const newMembers = allStaff.filter(s => selectedMembers.includes(s.id));
    
    setRooms(rooms.map(r => {
      if (r.id === selectedRoom) {
        const existingIds = r.members.map(m => m.id);
        const membersToAdd = newMembers.filter(m => !existingIds.includes(m.id));
        return { ...r, members: [...r.members, ...membersToAdd] };
      }
      return r;
    }));

    setShowAddMember(false);
    setSelectedMembers([]);
    toast.success('✅ Đã thêm thành viên');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'supervisor': return 'bg-blue-100 text-blue-700';
      case 'support': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'supervisor': return 'Giám sát';
      case 'support': return 'Hỗ trợ';
      default: return role;
    }
  };

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl px-6 py-5">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-xl transition">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <MessageSquare className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Chat nội bộ</h1>
              <p className="text-sm text-white/80">Trao đổi công việc & báo cáo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateRoom(true)}
              className="bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-xl flex items-center gap-2 transition font-semibold shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Tạo nhóm
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden max-w-[1800px] mx-auto w-full">
        {/* Rooms List */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col shadow-lg">
          <div className="p-4 border-b bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhóm chat..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={`w-full p-5 border-b border-gray-100 hover:bg-gray-50 transition text-left ${
                  selectedRoom === room.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-bold text-gray-900 text-base">{room.name}</span>
                  {room.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold min-w-[24px] text-center">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate mb-2">{room.lastMessage || 'Chưa có tin nhắn'}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 font-medium">{room.members.length} thành viên</span>
                  </div>
                  {room.lastMessageTime && (
                    <span className="text-xs text-gray-400">
                      {room.lastMessageTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </button>
            ))}

            {filteredRooms.length === 0 && (
              <div className="p-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Không tìm thấy nhóm</p>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{currentRoom?.name}</h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {currentRoom?.members.map((member) => (
                        <span key={member.id} className={`text-xs px-2 py-1 rounded-full ${getRoleColor(member.role)}`}>
                          {member.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-xl flex items-center gap-2 transition font-semibold"
                  >
                    <UserPlus className="w-4 h-4" />
                    Thêm thành viên
                  </button>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {roomMessages.map((msg) => {
                  const isOwn = msg.sender === user?.name;
                  
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-2xl ${isOwn ? 'order-2' : 'order-1'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-700">{msg.sender}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(msg.senderRole)}`}>
                            {getRoleLabel(msg.senderRole)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Financial Report Message */}
                        {msg.type === 'financial' && msg.metadata && (
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-5 shadow-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <DollarSign className="w-5 h-5 text-green-600" />
                              <span className="font-bold text-green-800 text-lg">{msg.content}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-white rounded-xl p-4 border border-green-200">
                                <div className="flex items-center gap-2 mb-1">
                                  <TrendingUp className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm text-gray-600">Thu</span>
                                </div>
                                <div className="text-xl font-bold text-blue-600">
                                  {msg.metadata.revenue?.toLocaleString('vi-VN')}đ
                                </div>
                              </div>
                              <div className="bg-white rounded-xl p-4 border border-green-200">
                                <div className="flex items-center gap-2 mb-1">
                                  <TrendingDown className="w-4 h-4 text-red-600" />
                                  <span className="text-sm text-gray-600">Chi</span>
                                </div>
                                <div className="text-xl font-bold text-red-600">
                                  {msg.metadata.expense?.toLocaleString('vi-VN')}đ
                                </div>
                              </div>
                              <div className="bg-white rounded-xl p-4 border border-green-200">
                                <div className="flex items-center gap-2 mb-1">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span className="text-sm text-gray-600">Lãi</span>
                                </div>
                                <div className="text-xl font-bold text-green-600">
                                  {msg.metadata.profit?.toLocaleString('vi-VN')}đ
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Alert Message */}
                        {msg.type === 'alert' && (
                          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-400 rounded-2xl px-5 py-4 shadow-lg">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-bold text-red-800 text-lg mb-2">{msg.content}</div>
                                {msg.metadata?.vehicleInfo && (
                                  <div className="bg-white rounded-lg p-3 border border-red-200">
                                    <div className="text-sm text-gray-700">
                                      <strong>Xe:</strong> {msg.metadata.vehicleInfo}
                                    </div>
                                    {msg.metadata.reportId && (
                                      <div className="text-sm text-gray-600 mt-1">
                                        <strong>Mã báo cáo:</strong> {msg.metadata.reportId}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Regular Text Message */}
                        {msg.type === 'text' && (
                          <div
                            className={`rounded-2xl px-5 py-3 shadow-md ${
                              isOwn
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                          >
                            {msg.content}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Area */}
              <div className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
                <div className="flex gap-3 mb-3">
                  <button
                    onClick={() => setMessageType('text')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      messageType === 'text' 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    💬 Tin nhắn
                  </button>
                  <button
                    onClick={() => setMessageType('alert')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      messageType === 'alert' 
                        ? 'bg-red-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ⚠️ Khẩn cấp
                  </button>
                  {user?.role === 'support' && (
                    <button
                      onClick={() => setShowFinancialForm(true)}
                      className="px-4 py-2 rounded-lg font-medium bg-green-100 text-green-700 hover:bg-green-200 transition"
                    >
                      💰 Báo cáo tài chính
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={
                      messageType === 'alert' 
                        ? 'Nhập nội dung khẩn cấp...' 
                        : 'Nhập tin nhắn...'
                    }
                    className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className={`px-8 py-3 rounded-xl font-bold transition shadow-lg flex items-center gap-2 ${
                      messageType === 'alert'
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    Gửi
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                <p className="text-xl text-gray-500 font-medium">Chọn nhóm để bắt đầu chat</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Tạo nhóm chat mới</h3>
              <button onClick={() => setShowCreateRoom(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">Tên nhóm</label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="VD: Nhóm quản lý - Bãi A"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">Chọn thành viên</label>
              <div className="max-h-64 overflow-y-auto space-y-2 border-2 border-gray-200 rounded-xl p-3">
                {allStaff.filter(s => s.id !== user?.id).map((staff) => (
                  <label key={staff.manguoidung} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(staff.manguoidung)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers([...selectedMembers, staff.manguoidung]);
                        } else {
                          setSelectedMembers(selectedMembers.filter(id => id !== staff.manguoidung));
                        }
                      }}
                      className="w-5 h-5 text-indigo-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{staff.name}</div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${getRoleColor(staff.role)}`}>
                        {getRoleLabel(staff.role)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowCreateRoom(false)} 
                className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl font-bold transition"
              >
                Hủy
              </button>
              <button 
                onClick={handleCreateRoom} 
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-bold transition shadow-lg"
              >
                Tạo nhóm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Thêm thành viên</h3>
              <button onClick={() => setShowAddMember(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="max-h-80 overflow-y-auto space-y-2 border-2 border-gray-200 rounded-xl p-3">
                {allStaff.filter(s => !currentRoom?.members.some(m => m.id === s.id)).map((staff) => (
                  <label key={staff.manguoidung} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(staff.manguoidung)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers([...selectedMembers, staff.manguoidung]);
                        } else {
                          setSelectedMembers(selectedMembers.filter(id => id !== staff.manguoidung));
                        }
                      }}
                      className="w-5 h-5 text-indigo-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{staff.name}</div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${getRoleColor(staff.role)}`}>
                        {getRoleLabel(staff.role)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowAddMember(false)} 
                className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl font-bold transition"
              >
                Hủy
              </button>
              <button 
                onClick={handleAddMembers} 
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-bold transition shadow-lg"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Financial Report Modal */}
      {showFinancialForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Báo cáo tài chính</h3>
              <button onClick={() => setShowFinancialForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Kỳ báo cáo</label>
                <input
                  type="text"
                  value={financialData.period}
                  onChange={(e) => setFinancialData({ ...financialData, period: e.target.value })}
                  placeholder="VD: Tháng 4/2026"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tổng thu (VNĐ)</label>
                <input
                  type="number"
                  value={financialData.revenue || ''}
                  onChange={(e) => setFinancialData({ ...financialData, revenue: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tổng chi (VNĐ)</label>
                <input
                  type="number"
                  value={financialData.expense || ''}
                  onChange={(e) => setFinancialData({ ...financialData, expense: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Lãi ròng</div>
                <div className="text-2xl font-bold text-green-600">
                  {(financialData.revenue - financialData.expense).toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowFinancialForm(false)} 
                className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl font-bold transition"
              >
                Hủy
              </button>
              <button 
                onClick={handleSendFinancialReport} 
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-bold transition shadow-lg"
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
