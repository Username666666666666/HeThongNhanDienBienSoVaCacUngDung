import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const Statistics = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  const dailyData = [
    { time: '6h', vehicles: 12, revenue: 240 },
    { time: '8h', vehicles: 25, revenue: 500 },
    { time: '10h', vehicles: 35, revenue: 700 },
    { time: '12h', vehicles: 45, revenue: 900 },
    { time: '14h', vehicles: 38, revenue: 760 },
    { time: '16h', vehicles: 42, revenue: 840 },
    { time: '18h', vehicles: 30, revenue: 600 },
    { time: '20h', vehicles: 20, revenue: 400 },
  ];

  const weeklyData = [
    { day: 'T2', vehicles: 150, revenue: 3000 },
    { day: 'T3', vehicles: 180, revenue: 3600 },
    { day: 'T4', vehicles: 165, revenue: 3300 },
    { day: 'T5', vehicles: 195, revenue: 3900 },
    { day: 'T6', vehicles: 210, revenue: 4200 },
    { day: 'T7', vehicles: 240, revenue: 4800 },
    { day: 'CN', vehicles: 200, revenue: 4000 },
  ];

  const monthlyData = [
    { week: 'Tuần 1', vehicles: 1200, revenue: 24000 },
    { week: 'Tuần 2', vehicles: 1350, revenue: 27000 },
    { week: 'Tuần 3', vehicles: 1180, revenue: 23600 },
    { week: 'Tuần 4', vehicles: 1420, revenue: 28400 },
  ];

  const getData = () => {
    switch (period) {
      case 'day':
        return dailyData;
      case 'week':
        return weeklyData;
      case 'month':
        return monthlyData;
      default:
        return weeklyData;
    }
  };

  const getXDataKey = () => {
    switch (period) {
      case 'day':
        return 'time';
      case 'week':
        return 'day';
      case 'month':
        return 'week';
      default:
        return 'day';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl mb-1">Thống kê & Báo cáo</h1>
              <p className="text-purple-100 text-sm">Phân tích hoạt động bãi đỗ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Period Selector */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('day')}
                className={`px-4 py-2 rounded-lg transition ${
                  period === 'day'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Hôm nay
              </button>
              <button
                onClick={() => setPeriod('week')}
                className={`px-4 py-2 rounded-lg transition ${
                  period === 'week'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tuần này
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 rounded-lg transition ${
                  period === 'month'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tháng này
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-500">Tổng xe</div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl text-gray-900 mb-2">1,245</div>
            <div className="text-sm text-green-600">+12% so với tuần trước</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-500">Doanh thu</div>
              <div className="bg-green-100 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl text-gray-900 mb-2">24,9M đ</div>
            <div className="text-sm text-green-600">+8% so với tuần trước</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-500">Trung bình/xe</div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl text-gray-900 mb-2">20.000đ</div>
            <div className="text-sm text-gray-500">Ổn định</div>
          </div>
        </div>

        {/* Vehicle Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-xl text-gray-900 mb-6">Lượng xe theo thời gian</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getData()} key={`vehicle-chart-${period}`}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={getXDataKey()} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="vehicles" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl text-gray-900 mb-6">Doanh thu (x1000đ)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getData()} key={`revenue-chart-${period}`}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={getXDataKey()} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Parking Lot Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h3 className="text-xl text-gray-900 mb-6">Hiệu suất các bãi đỗ</h3>
          <div className="space-y-4">
            {[
              { name: 'Bãi đỗ xe A', vehicles: 450, revenue: '9.000.000đ', rate: 85 },
              { name: 'Bãi đỗ xe B', vehicles: 520, revenue: '10.400.000đ', rate: 92 },
              { name: 'Bãi đỗ xe C', vehicles: 380, revenue: '7.600.000đ', rate: 78 },
            ].map((lot, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-gray-900">{lot.name}</div>
                  <div className="text-green-600">{lot.revenue}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                  <div className="text-gray-500">Số xe: {lot.vehicles}</div>
                  <div className="text-gray-500">Tỷ lệ lấp đầy: {lot.rate}%</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${lot.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};