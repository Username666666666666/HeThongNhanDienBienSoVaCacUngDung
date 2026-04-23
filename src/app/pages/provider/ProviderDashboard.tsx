import { useNavigate } from 'react-router-dom';
import {
  Server, Users, Building2, Coins, Camera, Shield,
  TrendingUp, User, Bell, BarChart3, Settings, Package, Wrench,
  ShieldCheck
} from 'lucide-react';

export const ProviderDashboard = () => {
  const navigate = useNavigate();

  const stats = {
    totalAccounts: 125,
    activeAdmins: 45,
    totalRevenue: '1.250.000.000đ',
    activeDevices: 342,
  };

  const recentRegistrations = [
    { name: 'Bãi đỗ xe Hùng Vương', admin: 'Nguyễn Văn A', package: 'Tiêu chuẩn', date: '2 giờ trước' },
    { name: 'Bãi xe Thống Nhất', admin: 'Trần Thị B', package: 'Cao cấp', date: '5 giờ trước' },
    { name: 'Bãi xe An Phú', admin: 'Lê Văn C', package: 'Miễn phí', date: '1 ngày trước' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <div className="bg-gradient-to-r from-slate-800 via-gray-800 to-zinc-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-1 flex items-center gap-3">
                <Server className="w-8 h-8" />
                Nhà cung cấp hệ thống
              </h1>
              <p className="text-slate-200 text-sm">Quản lý toàn bộ hệ thống và dịch vụ</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-white/10 rounded-full transition">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">Hồ sơ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Tổng tài khoản</div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.totalAccounts}</div>
            <div className="text-sm text-blue-600 mt-2">↑ 12% so với tháng trước</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Admin hoạt động</div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.activeAdmins}</div>
            <div className="text-sm text-purple-600 mt-2">↑ 8% so với tháng trước</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Doanh thu</div>
              <div className="bg-green-100 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalRevenue}</div>
            <div className="text-sm text-green-600 mt-2">↑ 23% so với tháng trước</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Thiết bị hoạt động</div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <Camera className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.activeDevices}</div>
            <div className="text-sm text-orange-600 mt-2">↑ 15% so với tháng trước</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/provider/accounts')}
            className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-xl group-hover:bg-white/30 transition">
                <Users className="w-10 h-10" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold mb-1">Quản lý tài khoản</div>
                <div className="text-blue-100 text-sm">Admin, User, Supervisor</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/provider/services')}
            className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-xl group-hover:bg-white/30 transition">
                <Building2 className="w-10 h-10" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold mb-1">Quản lý dịch vụ</div>
                <div className="text-purple-100 text-sm">Gói dịch vụ & đăng ký</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/provider/coin-settings')}
            className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-xl group-hover:bg-white/30 transition">
                <Coins className="w-10 h-10" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold mb-1">Cấu hình xu ảo</div>
                <div className="text-yellow-100 text-sm">Giá tối thiểu/tối đa</div>
              </div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/provider/package-management')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4 border-2 border-purple-300"
          >
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-gray-900">Gói dịch vụ</div>
              <div className="text-sm text-gray-500">Sửa giá</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/provider/maintenance-schedule')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4 border-2 border-orange-300"
          >
            <div className="bg-orange-100 p-3 rounded-lg">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-gray-900">Bảo trì</div>
              <div className="text-sm text-gray-500">Chu kỳ</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/provider/devices')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4 border-2 border-gray-200"
          >
            <div className="bg-cyan-100 p-3 rounded-lg">
              <Camera className="w-6 h-6 text-cyan-600" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-gray-900">Thiết bị</div>
              <div className="text-sm text-gray-500">Camera, Server</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/provider/statistics')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4 border-2 border-gray-200"
          >
            <div className="bg-green-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-gray-900">Thống kê</div>
              <div className="text-sm text-gray-500">Báo cáo tổng</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/provider/system-settings')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4 border-2 border-gray-200"
          >
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Settings className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-gray-900">Cài đặt</div>
              <div className="text-sm text-gray-500">Hệ thống</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/community')}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4 border-2 border-gray-200"
          >
            <div className="bg-pink-100 p-3 rounded-lg">
              <Bell className="w-6 h-6 text-pink-600" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-gray-900">Hỗ trợ</div>
              <div className="text-sm text-gray-500">Liên hệ</div>
            </div>
          </button>

         <button
  onClick={() => navigate('/provider/vehicle-verify')}
  className="sm:col-span-2 xl:col-span-3 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-4 border-2 border-emerald-300"
>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-gray-900">Xác thực phương tiện</div>
              <div className="text-sm text-gray-500">Duyệt hồ sơ người dùng</div>
            </div>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Đăng ký gần đây</h2>
          <div className="space-y-3">
            {recentRegistrations.map((reg, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-xl">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{reg.name}</div>
                    <div className="text-sm text-gray-600">Admin: {reg.admin}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-semibold px-3 py-1 rounded-full inline-block ${
                      reg.package === 'Cao cấp'
                        ? 'bg-purple-100 text-purple-700'
                        : reg.package === 'Tiêu chuẩn'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {reg.package}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{reg.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};