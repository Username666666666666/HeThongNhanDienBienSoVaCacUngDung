import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, BarChart3, MapPin, Settings, AlertCircle,
  DollarSign, Car, Clock, TrendingUp, Package, Shield, MessageSquare,
  Video, Bell, User, Plus, Camera
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase.ts';


type StaffInviteResponseStatus = 'accepted' | 'rejected';

interface AdminNotificationPayload {
  action: 'staff_invite_response';
  status: StaffInviteResponseStatus;
  targetRole: 'supervisor' | 'support';
  parkingLotId: string;
  parkingLotName: string;
  parkingLotJoinCode: string;
  customName: string;
  canSwitchLots: boolean;
}

interface SystemNotification {
  mathongbao: string;
  manguoigui: string;
  manguoinhan: string;
  loai: string;
  tieude: string;
  noidung: string;
  dadoc: boolean;
  ngaytao: string;
}

interface ParsedAdminNotification extends SystemNotification {
  payload: AdminNotificationPayload | null;
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState({ name: '', avatar: '' });
 
  const [notifications, setNotifications] = useState<ParsedAdminNotification[]>([]);
const [showNoti, setShowNoti] = useState(false);
const [selectedNoti, setSelectedNoti] = useState<ParsedAdminNotification | null>(null);

const fetchNotifications = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('thongbao')
    .select('*')
    .eq('manguoinhan', user.id)
    .eq('loai', 'role_request_response')
    .order('ngaytao', { ascending: false });

  if (error) {
    console.error('Lỗi tải thông báo:', error);
    return;
  }

  const parsed: ParsedAdminNotification[] = (data || []).map((n: SystemNotification) => {
    let payload: AdminNotificationPayload | null = null;

    try {
      const body = JSON.parse(n.noidung);
      if (body?.action === 'staff_invite_response') payload = body;
    } catch {
      payload = null;
    }

    return { ...n, payload };
  });

  setNotifications(parsed);
};

const handleOpenNotification = async (n: ParsedAdminNotification) => {
  setSelectedNoti(n);
  setShowNoti(false);

  if (!n.dadoc) {
    await supabase
      .from('thongbao')
      .update({ dadoc: true })
      .eq('mathongbao', n.mathongbao);

    setNotifications((prev) =>
      prev.map((item) =>
        item.mathongbao === n.mathongbao ? { ...item, dadoc: true } : item
      )
    );
  }
};

  
  useEffect(() => {
 const fetchAdminInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
      .from('nguoidung')
      .select('tennguoidung')
      .eq('manguoidung', user.id)
      .single();
    
    const { data: detailData } = await supabase
      .from('ctadmin')
      .select('anhdaidien')
      .eq('manguoidung', user.id)
      .maybeSingle();

    setAdminData({
      name: userData?.tennguoidung || 'Quản trị viên',
      avatar: detailData?.anhdaidien || ''
    });
  };

  fetchAdminInfo();
  fetchNotifications();
  }, []);

  const stats = {
    totalLots: 5,
    totalSpots: 250,
    occupiedSpots: 187,
    monthlyRevenue: '125.000.000đ',
  };

  const myParkingLots = [
    {
      id: 1,
      name: 'Bãi đỗ xe A',
      address: '123 Nguyễn Huệ, Q1',
      spots: 60,
      occupied: 45,
      status: 'active',
    },
    {
      id: 2,
      name: 'Bãi đỗ xe B',
      address: '456 Lê Lợi, Q3',
      spots: 80,
      occupied: 62,
      status: 'active',
    },
    {
      id: 3,
      name: 'Bãi đỗ xe C',
      address: '789 Trần Hưng Đạo, Q5',
      spots: 50,
      occupied: 38,
      status: 'active',
    },
  ];



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-1">Xin chào, {adminData.name}</h1>
              <p className="text-purple-100 text-sm">Quản lý hệ thống bãi đỗ</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.href = '/internal-chat'}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm">Chat nội bộ</span>
              </button>
            <div className="relative">
  <button
    onClick={() => setShowNoti(!showNoti)}
    className="relative p-2 hover:bg-white/10 rounded-full transition"
  >
    <Bell className="w-6 h-6" />
    {notifications.some(n => !n.dadoc) && (
      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
    )}
  </button>

  {showNoti && (
    <div className="absolute right-0 top-12 w-[380px] z-50">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Thông báo</h3>
              <p className="text-xs text-white/80">
                {notifications.filter(n => !n.dadoc).length} chưa đọc
              </p>
            </div>
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Không có thông báo
            </div>
          ) : (
            notifications.map((n) => {
              const unread = !n.dadoc;
              return (
                <button
                  key={n.mathongbao}
                  onClick={() => handleOpenNotification(n)}
                  className={`w-full text-left p-4 rounded-xl transition mb-2 border ${
                    unread
                      ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
                      : 'bg-white border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {n.tieude}
                        </span>
                        {unread && (
                          <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-600 text-white">
                            Mới
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-gray-600 leading-5">
                        {n.payload ? (
                          <div className="space-y-1">
                            <div>
                              <strong>Kết quả:</strong>{' '}
                              {n.payload.status === 'accepted' ? 'Đã xác nhận' : 'Đã từ chối'}
                            </div>
                            <div>
                              <strong>Người dùng:</strong> {n.payload.customName}
                            </div>
                            <div>
                              <strong>Bãi đỗ:</strong> {n.payload.parkingLotName}
                            </div>
                            <div>
                              <strong>Mã tham gia:</strong> {n.payload.parkingLotJoinCode}
                            </div>
                            <div>
                              <strong>Chức vụ:</strong>{' '}
                              {n.payload.targetRole === 'supervisor' ? 'Giám sát viên' : 'Nhân viên hỗ trợ'}
                            </div>
                          </div>
                        ) : (
                          n.noidung
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-400 whitespace-nowrap">
                      {new Date(n.ngaytao).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  )}
</div>
              <button
  onClick={() => navigate('/profile')}
  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition border border-white/20"
>
  {adminData.avatar ? (
    <img 
      src={adminData.avatar} 
      className="w-8 h-8 rounded-full object-cover border border-white/50" 
      alt="Avatar"
    />
  ) : (
    <User className="w-5 h-5" />
  )}
  <span className="text-sm font-medium">Hồ sơ</span>
</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Tổng bãi đỗ</div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl text-gray-900">{stats.totalLots}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Tổng vị trí</div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl text-gray-900">{stats.totalSpots}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Đang sử dụng</div>
              <div className="bg-green-100 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl text-gray-900">{stats.occupiedSpots}</div>
            <div className="text-sm text-gray-500 mt-1">
              {Math.round((stats.occupiedSpots / stats.totalSpots) * 100)}% tỷ lệ lấp đầy
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Doanh thu tháng</div>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="text-2xl text-gray-900">{stats.monthlyRevenue}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/admin/parking-config')}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition border-2 border-purple-500 group"
          >
            <div className="bg-purple-100 p-3 rounded-lg mb-3 group-hover:bg-purple-200 transition inline-block">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-gray-900 mb-1">Cấu hình bãi đỗ</div>
            <div className="text-sm text-gray-500">Thiết lập mới</div>
          </button>

          <button
            onClick={() => navigate('/admin/my-parking-lots')}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition border-2 border-blue-500 group"
          >
            <div className="bg-blue-100 p-3 rounded-lg mb-3 group-hover:bg-blue-200 transition inline-block">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-gray-900 mb-1">Bãi đỗ của tôi</div>
            <div className="text-sm text-gray-500">Xem & chỉnh sửa</div>
          </button>

          <button
            onClick={() => navigate('/admin/staff-management')}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition border-2 border-emerald-500 group"
          >
            <div className="bg-emerald-100 p-3 rounded-lg mb-3 group-hover:bg-emerald-200 transition inline-block">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-lg font-bold text-gray-900 mb-1">Nhân viên</div>
            <div className="text-sm text-gray-500">Phân quyền</div>
          </button>

          <button
            onClick={() => navigate('/admin/statistics')}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition border-2 border-amber-500 group"
          >
            <div className="bg-amber-100 p-3 rounded-lg mb-3 group-hover:bg-amber-200 transition inline-block">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-lg font-bold text-gray-900 mb-1">Thống kê</div>
            <div className="text-sm text-gray-500">Báo cáo chi tiết</div>
          </button>

          <button
            onClick={() => navigate('/admin/video-logs')}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition border-2 border-red-500 group"
          >
            <div className="bg-red-100 p-3 rounded-lg mb-3 group-hover:bg-red-200 transition inline-block">
              <Video className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-lg font-bold text-gray-900 mb-1">Video Logs</div>
            <div className="text-sm text-gray-500">Ca trực</div>
          </button>

          <button
            onClick={() => navigate('/admin/camera-management')}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition border-2 border-indigo-500 group"
          >
            <div className="bg-indigo-100 p-3 rounded-lg mb-3 group-hover:bg-indigo-200 transition inline-block">
              <Camera className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-lg font-bold text-gray-900 mb-1">Camera</div>
            <div className="text-sm text-gray-500">Quản lý & cấp phép</div>
          </button>

          <button
            onClick={() => navigate('/admin/service-registration')}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition border-2 border-purple-500 group"
          >
            <div className="bg-purple-100 p-3 rounded-lg mb-3 group-hover:bg-purple-200 transition inline-block">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-gray-900 mb-1">Gói dịch vụ</div>
            <div className="text-sm text-gray-500">Đăng ký gói</div>
          </button>

          <button
            onClick={() => navigate('/admin/community-moderation')}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition border-2 border-pink-500 group"
          >
            <div className="bg-pink-100 p-3 rounded-lg mb-3 group-hover:bg-pink-200 transition inline-block">
              <Shield className="w-6 h-6 text-pink-600" />
            </div>
            <div className="text-lg font-bold text-gray-900 mb-1">Kiểm duyệt</div>
            <div className="text-sm text-gray-500">Quản lý cộng đồng</div>
          </button>

          <button
            onClick={() => navigate('/community')}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition border-2 border-green-500 group"
          >
            <div className="bg-green-100 p-3 rounded-lg mb-3 group-hover:bg-green-200 transition inline-block">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-lg font-bold text-gray-900 mb-1">Cộng đồng</div>
            <div className="text-sm text-gray-500">Đăng bài</div>
          </button>
        </div>

        {/* My Parking Lots */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl text-gray-900">Bãi đỗ của tôi</h2>
            <button
              onClick={() => navigate('/admin/parking-config')}
              className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Thêm mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myParkingLots.map((lot) => (
              <div
                key={lot.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                onClick={() => navigate('/admin/parking-config')}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg text-gray-900 mb-1">{lot.name}</h3>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {lot.address}
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs ${
                      lot.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Hoạt động
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tổng chỗ:</span>
                    <span className="text-gray-900">{lot.spots}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Đang đỗ:</span>
                    <span className="text-green-600">{lot.occupied}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(lot.occupied / lot.spots) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <button className="w-full mt-4 bg-purple-50 text-purple-600 py-2 rounded-lg hover:bg-purple-100 transition text-sm">
                  Quản lý
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-xl text-gray-900 mb-4">Hoạt động gần đây</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex-1">
                <div className="text-gray-900">Bãi đỗ xe A</div>
                <div className="text-sm text-gray-500">Cập nhật cấu hình giá</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">2 giờ trước</div>
                <button
                  onClick={() => navigate('/admin/parking-config')}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex-1">
                <div className="text-gray-900">Bãi đỗ xe B</div>
                <div className="text-sm text-gray-500">Thêm 10 vị trí mới</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">5 giờ trước</div>
                <button
                  onClick={() => navigate('/admin/parking-config')}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex-1">
                <div className="text-gray-900">Hệ thống</div>
                <div className="text-sm text-gray-500">Đăng bài lên cộng đồng</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">1 ngày trước</div>
                <button
                  onClick={() => navigate('/admin/community-moderation')}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedNoti?.payload && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <h2 className="text-xl font-bold">Chi tiết thông báo</h2>
        <p className="text-sm text-white/80 mt-1">
          Phản hồi từ Người dùng
        </p>
      </div>

      <div className="p-6 space-y-3 text-sm text-gray-700">
        <div className="p-3 bg-gray-50 rounded-xl">
          <div className="text-gray-500 text-xs">Trạng thái</div>
          <div className="font-semibold text-gray-900">
            {selectedNoti.payload.status === 'accepted' ? 'Đã xác nhận' : 'Đã từ chối'}
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl">
          <div className="text-gray-500 text-xs">Người dùng</div>
          <div className="font-semibold text-gray-900">{selectedNoti.payload.customName}</div>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl">
          <div className="text-gray-500 text-xs">Bãi đỗ</div>
          <div className="font-semibold text-gray-900">{selectedNoti.payload.parkingLotName}</div>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl">
          <div className="text-gray-500 text-xs">Mã tham gia</div>
          <div className="font-semibold text-gray-900">{selectedNoti.payload.parkingLotJoinCode}</div>
        </div>
      </div>

      <div className="p-6 pt-0 flex justify-end">
        <button
          onClick={() => setSelectedNoti(null)}
          className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
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