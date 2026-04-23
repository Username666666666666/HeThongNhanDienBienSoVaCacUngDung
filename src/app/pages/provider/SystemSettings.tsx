import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Settings, Bell, Send, Trash2, Plus, Edit 
} from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'update' | 'maintenance';
  targetRole: 'all' | 'admin' | 'supervisor' | 'support' | 'owner';
  createdDate: Date;
  status: 'active' | 'sent';
}

export const SystemSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'notifications' | 'general'>('notifications');
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'update' | 'maintenance',
    targetRole: 'all' as 'all' | 'admin' | 'supervisor' | 'support' | 'owner',
  });

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Cập nhật hệ thống v2.5',
      message: 'Hệ thống sẽ cập nhật tính năng mới vào 20/04/2026. Vui lòng kiểm tra email để biết thêm chi tiết.',
      type: 'update',
      targetRole: 'all',
      createdDate: new Date('2026-04-15'),
      status: 'sent',
    },
    {
      id: '2',
      title: 'Bảo trì định kỳ',
      message: 'Hệ thống sẽ bảo trì từ 02:00 - 04:00 ngày 18/04/2026. Trong thời gian này, một số chức năng có thể bị gián đoạn.',
      type: 'maintenance',
      targetRole: 'admin',
      createdDate: new Date('2026-04-16'),
      status: 'active',
    },
    {
      id: '3',
      title: 'Tính năng mới: Dual-Gate Monitoring',
      message: 'Chúng tôi đã ra mắt tính năng giám sát 2 cổng đồng thời cho Supervisor. Hãy trải nghiệm ngay!',
      type: 'info',
      targetRole: 'supervisor',
      createdDate: new Date('2026-04-10'),
      status: 'sent',
    },
  ]);

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    maxDevicesPerLot: 50,
    sessionTimeout: 30,
  });

  const getNotificationTypeInfo = (type: string) => {
    switch (type) {
      case 'info':
        return { name: 'Thông tin', color: 'bg-blue-100 text-blue-700', icon: '💡' };
      case 'warning':
        return { name: 'Cảnh báo', color: 'bg-yellow-100 text-yellow-700', icon: '⚠️' };
      case 'update':
        return { name: 'Cập nhật', color: 'bg-green-100 text-green-700', icon: '🔄' };
      case 'maintenance':
        return { name: 'Bảo trì', color: 'bg-red-100 text-red-700', icon: '🔧' };
      default:
        return { name: type, color: 'bg-gray-100 text-gray-700', icon: '📢' };
    }
  };

  const getTargetRoleInfo = (role: string) => {
    switch (role) {
      case 'all':
        return 'Tất cả';
      case 'admin':
        return 'Admin';
      case 'supervisor':
        return 'Giám sát';
      case 'support':
        return 'Hỗ trợ';
      case 'owner':
        return 'Người dùng';
      default:
        return role;
    }
  };

  const handleSendNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const notification: Notification = {
      id: Date.now().toString(),
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type,
      targetRole: newNotification.targetRole,
      createdDate: new Date(),
      status: 'sent',
    };

    setNotifications([notification, ...notifications]);
    setShowNotificationModal(false);
    setNewNotification({ title: '', message: '', type: 'info', targetRole: 'all' });
    toast.success('✅ Đã gửi thông báo thành công!');
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    toast.success('🗑️ Đã xóa thông báo!');
  };

  const handleSaveSettings = () => {
    toast.success('✅ Đã lưu cài đặt hệ thống!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-gray-800 to-zinc-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/provider')}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl mb-1 flex items-center gap-3">
                <Settings className="w-8 h-8" />
                Cài đặt hệ thống
              </h1>
              <p className="text-slate-200 text-sm">Quản lý thông báo và cấu hình hệ thống</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-3 rounded-xl font-bold transition ${
              activeTab === 'notifications'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bell className="w-5 h-5 inline mr-2" />
            Thông báo hệ thống
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 rounded-xl font-bold transition ${
              activeTab === 'general'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-5 h-5 inline mr-2" />
            Cấu hình chung
          </button>
        </div>

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Thông báo hệ thống</h2>
                <button
                  onClick={() => setShowNotificationModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center gap-2 font-bold shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Tạo thông báo mới
                </button>
              </div>

              <div className="space-y-4">
                {notifications.map((notification) => {
                  const typeInfo = getNotificationTypeInfo(notification.type);

                  return (
                    <div
                      key={notification.id}
                      className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${typeInfo.color}`}>
                              {typeInfo.icon} {typeInfo.name}
                            </div>
                            <div className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
                              👥 {getTargetRoleInfo(notification.targetRole)}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              notification.status === 'sent'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {notification.status === 'sent' ? '✓ Đã gửi' : '⏳ Chờ gửi'}
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mb-2">
                            {notification.title}
                          </div>
                          <div className="text-gray-700 mb-3">{notification.message}</div>
                          <div className="text-sm text-gray-500">
                            Tạo lúc: {notification.createdDate.toLocaleString('vi-VN')}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toast.info('🔧 Chức năng chỉnh sửa đang được phát triển')}
                            className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {notifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có thông báo</h3>
                  <p className="text-gray-600">Tạo thông báo mới để gửi đến người dùng</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cấu hình chung</h2>

            <div className="space-y-6">
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Chế độ bảo trì</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.maintenanceMode}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })
                    }
                    className="w-6 h-6 text-blue-600 focus:ring-2 focus:ring-blue-500 rounded"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Bật chế độ bảo trì</div>
                    <div className="text-sm text-gray-600">
                      Hệ thống sẽ hiển thị thông báo bảo trì cho người dùng
                    </div>
                  </div>
                </label>
              </div>

              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sao lưu tự động</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.autoBackup}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, autoBackup: e.target.checked })
                    }
                    className="w-6 h-6 text-blue-600 focus:ring-2 focus:ring-blue-500 rounded"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Bật sao lưu tự động</div>
                    <div className="text-sm text-gray-600">Tự động sao lưu dữ liệu hằng ngày lúc 02:00</div>
                  </div>
                </label>
              </div>

              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thông báo</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.emailNotifications}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, emailNotifications: e.target.checked })
                      }
                      className="w-6 h-6 text-blue-600 focus:ring-2 focus:ring-blue-500 rounded"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Thông báo qua Email</div>
                      <div className="text-sm text-gray-600">Gửi thông báo quan trọng qua email</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.smsNotifications}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, smsNotifications: e.target.checked })
                      }
                      className="w-6 h-6 text-blue-600 focus:ring-2 focus:ring-blue-500 rounded"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Thông báo qua SMS</div>
                      <div className="text-sm text-gray-600">Gửi thông báo khẩn cấp qua SMS</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Giới hạn hệ thống</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số thiết bị tối đa mỗi bãi đỗ
                    </label>
                    <input
                      type="number"
                      value={systemSettings.maxDevicesPerLot}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, maxDevicesPerLot: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Thời gian timeout (phút)
                    </label>
                    <input
                      type="number"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, sessionTimeout: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Người dùng sẽ tự động đăng xuất sau khoảng thời gian này
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-bold text-lg shadow-lg"
              >
                Lưu cài đặt
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tạo thông báo mới</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  placeholder="VD: Cập nhật hệ thống v2.5"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung</label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  placeholder="Nhập nội dung thông báo..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loại thông báo</label>
                <select
                  value={newNotification.type}
                  onChange={(e) =>
                    setNewNotification({ ...newNotification, type: e.target.value as typeof newNotification.type })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="info">💡 Thông tin</option>
                  <option value="warning">⚠️ Cảnh báo</option>
                  <option value="update">🔄 Cập nhật</option>
                  <option value="maintenance">🔧 Bảo trì</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Đối tượng nhận</label>
                <select
                  value={newNotification.targetRole}
                  onChange={(e) =>
                    setNewNotification({
                      ...newNotification,
                      targetRole: e.target.value as typeof newNotification.targetRole,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="all">👥 Tất cả</option>
                  <option value="admin">🛡️ Admin</option>
                  <option value="supervisor">👁️ Giám sát</option>
                  <option value="support">💬 Hỗ trợ</option>
                  <option value="owner">🚗 Người dùng</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleSendNotification}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Gửi thông báo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
