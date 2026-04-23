import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BarChart3, TrendingUp, DollarSign, Users, 
  Building2, Calendar, Download, FileText
} from 'lucide-react';
import { toast } from 'sonner';

export const ProviderStatistics = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const stats = {
    totalRevenue: 450000000,
    totalAccounts: 125,
    totalDevices: 342,
    activeParkingLots: 45,
    newAccountsThisMonth: 12,
    revenueGrowth: 23,
    deviceGrowth: 15,
  };

  const revenueByPackage = [
    { package: 'Cao cấp', revenue: 250000000, count: 50, color: 'purple' },
    { package: 'Tiêu chuẩn', revenue: 150000000, count: 75, color: 'blue' },
    { package: 'Miễn phí', revenue: 0, count: 100, color: 'gray' },
  ];

  const topParkingLots = [
    { name: 'Bãi đỗ xe Hùng Vương', revenue: 25000000, devices: 15, users: 450 },
    { name: 'Bãi xe Thống Nhất', revenue: 22000000, devices: 12, users: 380 },
    { name: 'Bãi xe An Phú', revenue: 18000000, devices: 10, users: 320 },
    { name: 'Bãi đỗ Minh Khai', revenue: 15000000, devices: 8, users: 280 },
    { name: 'Bãi xe Trần Hưng Đạo', revenue: 12000000, devices: 7, users: 210 },
  ];

  const monthlyData = [
    { month: 'T1', revenue: 35000000, accounts: 10 },
    { month: 'T2', revenue: 38000000, accounts: 12 },
    { month: 'T3', revenue: 42000000, accounts: 15 },
    { month: 'T4', revenue: 45000000, accounts: 12 },
  ];

  const handleExportReport = (type: string) => {
    toast.loading(`Đang xuất báo cáo ${type}...`);
    setTimeout(() => {
      toast.success(`✅ Đã xuất báo cáo ${type} thành công!`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white shadow-xl">
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
                <BarChart3 className="w-8 h-8" />
                Báo cáo & Thống kê
              </h1>
              <p className="text-green-100 text-sm">Tổng quan doanh thu và hoạt động hệ thống</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Time Range Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Khoảng thời gian</h2>
            <div className="flex gap-2">
              {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range === 'week' && '7 ngày'}
                  {range === 'month' && 'Tháng'}
                  {range === 'quarter' && 'Quý'}
                  {range === 'year' && 'Năm'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Tổng doanh thu</div>
              <div className="bg-green-100 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalRevenue.toLocaleString()}đ
            </div>
            <div className="text-sm text-green-600 mt-2">↑ {stats.revenueGrowth}% so với tháng trước</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Tổng tài khoản</div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.totalAccounts}</div>
            <div className="text-sm text-blue-600 mt-2">+{stats.newAccountsThisMonth} tài khoản mới</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Bãi đỗ hoạt động</div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.activeParkingLots}</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Thiết bị</div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.totalDevices}</div>
            <div className="text-sm text-orange-600 mt-2">↑ {stats.deviceGrowth}% so với tháng trước</div>
          </div>
        </div>

        {/* Revenue by Package */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Doanh thu theo gói dịch vụ</h2>
          <div className="space-y-4">
            {revenueByPackage.map((item, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full bg-${item.color}-500`}></div>
                    <div>
                      <div className="font-bold text-gray-900">{item.package}</div>
                      <div className="text-sm text-gray-600">{item.count} bãi đỗ</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {item.revenue === 0 ? 'Miễn phí' : `${item.revenue.toLocaleString()}đ`}
                    </div>
                    {item.revenue > 0 && (
                      <div className="text-sm text-gray-600">
                        {((item.revenue / stats.totalRevenue) * 100).toFixed(1)}% tổng doanh thu
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`bg-${item.color}-500 h-3 rounded-full`}
                    style={{ width: `${item.revenue > 0 ? (item.revenue / stats.totalRevenue) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Parking Lots */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Top 5 bãi đỗ</h2>
          <div className="space-y-3">
            {topParkingLots.map((lot, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 transition"
              >
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 text-lg">{lot.name}</div>
                  <div className="text-sm text-gray-600">
                    {lot.devices} thiết bị • {lot.users} người dùng
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {lot.revenue.toLocaleString()}đ
                  </div>
                  <div className="text-xs text-gray-500">doanh thu/tháng</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Xu hướng theo tháng</h2>
          <div className="grid grid-cols-4 gap-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-xl p-4">
                <div className="text-center mb-3">
                  <div className="text-sm text-gray-600 mb-1">{data.month}</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {data.revenue.toLocaleString()}đ
                  </div>
                </div>
                <div className="bg-gradient-to-t from-green-200 to-emerald-200 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-600 mb-1">Tài khoản mới</div>
                  <div className="text-xl font-bold text-gray-900">+{data.accounts}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Reports */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Xuất báo cáo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleExportReport('Doanh thu')}
              className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 p-6 rounded-xl hover:shadow-lg transition group"
            >
              <div className="bg-green-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-lg font-bold text-gray-900 mb-2">Báo cáo doanh thu</div>
              <div className="text-sm text-gray-600 mb-4">Chi tiết doanh thu theo gói dịch vụ</div>
              <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                <Download className="w-5 h-5" />
                Tải xuống
              </div>
            </button>

            <button
              onClick={() => handleExportReport('Tài khoản')}
              className="bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-300 p-6 rounded-xl hover:shadow-lg transition group"
            >
              <div className="bg-blue-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-lg font-bold text-gray-900 mb-2">Báo cáo tài khoản</div>
              <div className="text-sm text-gray-600 mb-4">Thống kê tài khoản theo vai trò</div>
              <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                <Download className="w-5 h-5" />
                Tải xuống
              </div>
            </button>

            <button
              onClick={() => handleExportReport('Thiết bị')}
              className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 p-6 rounded-xl hover:shadow-lg transition group"
            >
              <div className="bg-purple-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="text-lg font-bold text-gray-900 mb-2">Báo cáo thiết bị</div>
              <div className="text-sm text-gray-600 mb-4">Tình trạng và bảo trì thiết bị</div>
              <div className="flex items-center justify-center gap-2 text-purple-600 font-semibold">
                <Download className="w-5 h-5" />
                Tải xuống
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
