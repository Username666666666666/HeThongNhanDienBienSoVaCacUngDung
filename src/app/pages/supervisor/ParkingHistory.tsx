import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Filter, Download, Search, Calendar, User, Clock,
  Car, MapPin, DollarSign, Image as ImageIcon, CheckCircle, XCircle, Coins
} from 'lucide-react';
import { mockParkingSessions } from '../../store/mockData.ts';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback.tsx';

export const ParkingHistory = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<'all' | 'entry' | 'exit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const allSessions = [
    ...mockParkingSessions,
    // Add more mock entries and exits
    {
      id: 's4',
      vehicleId: 'v2',
      plateNumber: '29B-67890',
      parkingLotId: 'p1',
      spotId: 'A005',
      entryTime: new Date('2026-03-30T10:15:00'),
      entryImages: {
        plate: 'https://images.unsplash.com/photo-1774576670116-a21417528d54?w=400',
        driver: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400',
        timestamp: new Date('2026-03-30T10:15:00'),
      },
      paymentStatus: 'pending' as const,
      supervisorId: '2',
    },
    {
      id: 's5',
      vehicleId: 'v3',
      plateNumber: '51F-54321',
      parkingLotId: 'p1',
      spotId: 'B012',
      entryTime: new Date('2026-03-30T09:45:00'),
      exitTime: new Date('2026-03-30T11:20:00'),
      entryImages: {
        plate: 'https://images.unsplash.com/photo-1774576670116-a21417528d54?w=400',
        driver: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400',
        timestamp: new Date('2026-03-30T09:45:00'),
      },
      exitImages: {
        plate: 'https://images.unsplash.com/photo-1774576670116-a21417528d54?w=400',
        driver: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400',
        timestamp: new Date('2026-03-30T11:20:00'),
      },
      paymentStatus: 'paid' as const,
      paymentMethod: 'online' as const,
      amount: 30000,
      supervisorId: '2',
      exitSupervisorId: '2',
    },
  ];

  const calculateDuration = (entry: Date, exit?: Date) => {
    const start = new Date(entry);
    const end = exit ? new Date(exit) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}p`;
  };

  const filteredSessions = allSessions
    .filter((session) => {
      if (filterStatus === 'entry') return !session.exitTime;
      if (filterStatus === 'exit') return session.exitTime;
      return true;
    })
    .filter((session) =>
      session.plateNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());

  const stats = {
    total: allSessions.length,
    entries: allSessions.filter((s) => !s.exitTime).length,
    exits: allSessions.filter((s) => s.exitTime).length,
    todayRevenue: allSessions
      .filter((s) => s.amount)
      .reduce((acc, s) => acc + (s.amount || 0), 0),
  };

  const selectedSessionData = allSessions.find((s) => s.id === selectedSession);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/supervisor')}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl mb-1 tracking-tight">📋 Lịch sử ra vào bãi</h1>
              <p className="text-cyan-100 text-sm">Chi tiết các phương tiện đã qua cổng</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-medium">Tổng giao dịch</div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-medium">Đang đỗ</div>
              <Car className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.entries}</div>
            <div className="text-sm text-gray-500 mt-1">xe trong bãi</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-medium">Đã ra</div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.exits}</div>
            <div className="text-sm text-gray-500 mt-1">hôm nay</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-medium">Doanh thu</div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.todayRevenue.toLocaleString()}đ
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  filterStatus === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus('entry')}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  filterStatus === 'entry'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đang đỗ ({stats.entries})
              </button>
              <button
                onClick={() => setFilterStatus('exit')}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  filterStatus === 'exit'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đã ra ({stats.exits})
              </button>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo biển số..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-3 rounded-xl hover:from-teal-700 hover:to-cyan-700 transition shadow-lg">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Biển số</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Vị trí</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Giờ vào</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Giờ ra</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Thời gian</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Thanh toán</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Car className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{session.plateNumber}</div>
                          <div className="text-xs text-gray-500">ID: {session.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold">{session.spotId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">
                          {new Date(session.entryTime).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(session.entryTime).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {session.exitTime ? (
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">
                            {new Date(session.exitTime).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(session.exitTime).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Đang đỗ...</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          {calculateDuration(session.entryTime, session.exitTime)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {session.amount ? (
                        <div className="text-sm">
                          <div className="font-bold text-gray-900 flex items-center gap-1">
                            {session.paymentMethod === 'coins' ? (
                              <>
                                <Coins className="w-4 h-4 text-yellow-600" />
                                {(session.amount / 1000).toLocaleString()} xu
                              </>
                            ) : (
                              `${session.amount.toLocaleString()}đ`
                            )}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {session.paymentMethod === 'cash'
                              ? 'Tiền mặt'
                              : session.paymentMethod === 'online'
                              ? 'Online'
                              : 'Xu ảo'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Chưa có</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {session.paymentStatus === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          Đã thanh toán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                          <Clock className="w-3 h-3" />
                          Chờ thanh toán
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedSession(session.id)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition text-sm font-semibold shadow-md"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSessionData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Chi tiết giao dịch</h2>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Vehicle Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Thông tin phương tiện</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="text-blue-600 text-sm mb-1">Biển số</div>
                    <div className="font-bold text-gray-900 text-xl">
                      {selectedSessionData.plateNumber}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <div className="text-green-600 text-sm mb-1">Vị trí</div>
                    <div className="font-bold text-gray-900 text-xl">
                      {selectedSessionData.spotId}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <div className="text-purple-600 text-sm mb-1">Thời gian</div>
                    <div className="font-bold text-gray-900 text-lg">
                      {calculateDuration(selectedSessionData.entryTime, selectedSessionData.exitTime)}
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-xl">
                    <div className="text-yellow-600 text-sm mb-1">Số tiền</div>
                    <div className="font-bold text-gray-900 text-lg">
                      {selectedSessionData.amount
                        ? `${selectedSessionData.amount.toLocaleString()}đ`
                        : 'Chưa có'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  Hình ảnh lưu trữ
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <ImageWithFallback
                      src={selectedSessionData.entryImages.plate}
                      alt="Entry Plate"
                      className="w-full h-40 object-cover rounded-xl border-2 border-green-300"
                    />
                    <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      ✓ Vào - Biển
                    </div>
                  </div>
                  <div className="relative">
                    <ImageWithFallback
                      src={selectedSessionData.entryImages.driver}
                      alt="Entry Driver"
                      className="w-full h-40 object-cover rounded-xl border-2 border-green-300"
                    />
                    <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      ✓ Vào - Lái
                    </div>
                  </div>
                  {selectedSessionData.exitImages && (
                    <>
                      <div className="relative">
                        <ImageWithFallback
                          src={selectedSessionData.exitImages.plate}
                          alt="Exit Plate"
                          className="w-full h-40 object-cover rounded-xl border-2 border-blue-300"
                        />
                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          → Ra - Biển
                        </div>
                      </div>
                      <div className="relative">
                        <ImageWithFallback
                          src={selectedSessionData.exitImages.driver}
                          alt="Exit Driver"
                          className="w-full h-40 object-cover rounded-xl border-2 border-blue-300"
                        />
                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          → Ra - Lái
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Clock className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Xe vào bãi</div>
                      <div className="text-sm text-gray-600">
                        {new Date(selectedSessionData.entryTime).toLocaleString('vi-VN')}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Giám sát: Giám sát Trần • Vị trí: {selectedSessionData.spotId}
                      </div>
                    </div>
                  </div>
                  {selectedSessionData.exitTime && (
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Xe ra bãi</div>
                        <div className="text-sm text-gray-600">
                          {new Date(selectedSessionData.exitTime).toLocaleString('vi-VN')}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Giám sát: Giám sát Trần • Thanh toán:{' '}
                          {selectedSessionData.paymentMethod === 'cash'
                            ? 'Tiền mặt'
                            : selectedSessionData.paymentMethod === 'online'
                            ? 'Chuyển khoản'
                            : 'Xu ảo'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-b-2xl">
              <button
                onClick={() => setSelectedSession(null)}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition font-semibold"
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
