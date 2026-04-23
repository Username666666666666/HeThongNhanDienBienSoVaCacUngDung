import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Send, Users, AlertTriangle, Image as ImageIcon, Paperclip
} from 'lucide-react';
import { toast } from 'sonner';
import type { ChatMessage } from '../../types/community.ts';
import { useAuth } from '../../context/AuthContext.tsx';


export const CommunityChat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const communityCode = searchParams.get('code');
  const theftId = searchParams.get('theft');

  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

const currentUser = {
  id: user?.id || 'user1',
  name: user?.name || 'Người dùng',
  role: (
    user?.role === 'support' ? 'support' :
    user?.role === 'admin' ? 'admin' :
    user?.role === 'super_admin' ? 'super_admin' :
    'owner'
  ) as ChatMessage['userRole'],
};

  const parkingLot = {
    code: 'PL001',
    name: 'Bãi đỗ xe Trung tâm A',
    communityCode: 'COMM001',
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      userId: 'system',
      userName: 'Hệ thống',
      userRole: 'admin',
      content: 'Chào mừng đến với phòng chat cộng đồng bãi đỗ xe!',
      createdAt: new Date('2026-03-31T08:00:00'),
      type: 'system',
    },
    {
      id: 'm2',
      userId: 'admin1',
      userName: 'Quản lý bãi',
      userRole: 'admin',
      content: 'Chúc mọi người một ngày tốt lành! Nếu có thắc mắc gì, hãy hỏi nhé.',
      createdAt: new Date('2026-03-31T08:30:00'),
      type: 'text',
    },
    {
      id: 'm3',
      userId: 'user2',
      userName: 'Trần Thị B',
      userRole: 'owner',
      content: 'Cho mình hỏi bãi xe có mở cửa vào ngày lễ không ạ?',
      createdAt: new Date('2026-03-31T09:00:00'),
      type: 'text',
    },
    {
      id: 'm4',
      userId: 'support1',
      userName: 'Nhân viên Hỗ trợ',
      userRole: 'support',
      content: 'Dạ có ạ, bãi xe mở cửa 24/7 kể cả ngày lễ và cuối tuần.',
      createdAt: new Date('2026-03-31T09:05:00'),
      type: 'text',
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: ChatMessage = {
      id: `m${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      content: messageText,
      createdAt: new Date(),
      type: 'text',
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return 'bg-red-100 text-red-700';
      case 'support':
        return 'bg-blue-100 text-blue-700';
      case 'supervisor':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản lý';
      case 'super_admin':
        return 'Super Admin';
      case 'support':
        return 'Hỗ trợ';
      case 'supervisor':
        return 'Giám sát';
      default:
        return 'Thành viên';
    }
  };

  if (!communityCode && !theftId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl text-gray-900 mb-2">Chưa có thông tin phòng chat</h2>
          <p className="text-gray-600 mb-6">Vui lòng chọn cộng đồng để tiếp tục</p>
          <button
            onClick={() => navigate('/community')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(theftId ? '/community/theft' : `/community/feed?code=${communityCode}`)}
              className="p-2 hover:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl mb-0.5 flex items-center gap-2">
                {theftId ? 'Chat hỗ trợ mất cắp' : 'Chat cộng đồng'}
              </h1>
              <p className="text-purple-100 text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                {parkingLot.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.userId === currentUser.id;
            const isSystem = message.type === 'system';

            if (isSystem) {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-full">
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isCurrentUser && (
                    <div className="flex items-center gap-2 mb-1 ml-2">
                      <span className="text-sm text-gray-700">{message.userName}</span>
                      {message.userRole !== 'owner' && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(message.userRole)}`}>
                          {getRoleLabel(message.userRole)}
                        </span>
                      )}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : message.userRole === 'admin' || message.userRole === 'super_admin'
                        ? 'bg-red-50 text-red-900 border border-red-200'
                        : message.userRole === 'support'
                        ? 'bg-blue-50 text-blue-900 border border-blue-200'
                        : 'bg-white text-gray-900 shadow-sm'
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                  </div>
                  <span className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'mr-2' : 'ml-2'}`}>
                    {new Date(message.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Theft Alert Banner */}
      {theftId && (
        <div className="bg-red-50 border-t border-red-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-red-800">
              <AlertTriangle className="w-4 h-4" />
              <span>Phòng chat hỗ trợ tìm kiếm xe bị mất cắp</span>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toast.info('Chức năng đính kèm file đang phát triển')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              onClick={() => toast.info('Chức năng gửi ảnh đang phát triển')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Nhấn Enter để gửi, Shift + Enter để xuống dòng
          </p>
        </div>
      </div>
    </div>
  );
};