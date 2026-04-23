import { useNavigate } from 'react-router-dom';
import { Monitor, Video, User, Bell, BarChart3, Clock, FileText, AlertTriangle, GitMerge } from 'lucide-react';

export const SupervisorDashboard = () => {
  const navigate = useNavigate();

  const todayStats = {
    vehiclesIn: 87,
    vehiclesOut: 65,
    currentVehicles: 22,
    revenue: '4.250.000đ',
  };

  const recentActivity = [
    { plate: '30A-12345', action: 'Vào bãi', time: '10 phút trước', status: 'success' },
    { plate: '51B-67890', action: 'Ra bãi', time: '15 phút trước', status: 'success' },
    { plate: '29C-11223', action: 'Vào bãi', time: '23 phút trước', status: 'success' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-1">Xin chào, Người giám sát</h1>
              <p className="text-green-100 text-sm">Quản lý cổng ra vào</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-white/10 rounded-full transition">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => navigate('/supervisor/profile')}
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Xe vào</div>
              <div className="bg-green-100 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl text-gray-900">{todayStats.vehiclesIn}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Xe ra</div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl text-gray-900">{todayStats.vehiclesOut}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Đang trong bãi</div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Monitor className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl text-gray-900">{todayStats.currentVehicles}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-500 text-sm">Doanh thu hôm nay</div>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="text-2xl text-gray-900">{todayStats.revenue}</div>
          </div>
        </div>

        {/* Quick Actions - Main Gate Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/supervisor/gate?mode=entry')}
            className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition border-2 border-green-500 group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-xl group-hover:bg-green-200 transition">
                <Video className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-left">
                <div className="text-2xl text-gray-900 mb-1">Cổng vào</div>
                <div className="text-gray-600">Quản lý xe vào bãi</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/supervisor/gate?mode=exit')}
            className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition border-2 border-blue-500 group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-xl group-hover:bg-blue-200 transition">
                <Video className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="text-2xl text-gray-900 mb-1">Cổng ra</div>
                <div className="text-gray-600">Quản lý xe ra bãi</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/supervisor/dual-gate')}
            className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition border-2 border-purple-500 group relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
              MỚI
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-4 rounded-xl group-hover:bg-purple-200 transition">
                <GitMerge className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="text-2xl text-gray-900 mb-1">2 Cổng</div>
                <div className="text-gray-600">Giám sát đồng thời</div>
              </div>
            </div>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => navigate('/supervisor/vehicle-logs')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-4"
          >
            <div className="bg-indigo-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-left">
              <div className="text-lg text-gray-900">Nhật ký</div>
              <div className="text-sm text-gray-500">Lịch sử ra vào</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/supervisor/shift')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-4"
          >
            <div className="bg-teal-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-teal-600" />
            </div>
            <div className="text-left">
              <div className="text-lg text-gray-900">Ca trực</div>
              <div className="text-sm text-gray-500">Quản lý ca</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/supervisor/suspicious-vehicles')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-4 border-2 border-orange-300 relative"
          >
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              3
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-left">
              <div className="text-lg text-gray-900">Xe nghi ngờ</div>
              <div className="text-sm text-gray-500">Đỗ quá 3 ngày</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/community')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-4"
          >
            <div className="bg-pink-100 p-3 rounded-lg">
              <Bell className="w-6 h-6 text-pink-600" />
            </div>
            <div className="text-left">
              <div className="text-lg text-gray-900">Cộng đồng</div>
              <div className="text-sm text-gray-500">Tin tức</div>
            </div>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl text-gray-900 mb-4">Hoạt động gần đây</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Monitor className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-gray-900">{activity.plate}</div>
                    <div className="text-sm text-gray-500">{activity.action}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {activity.time}
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                      activity.status === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {activity.status === 'success' ? 'Thành công' : 'Thất bại'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};