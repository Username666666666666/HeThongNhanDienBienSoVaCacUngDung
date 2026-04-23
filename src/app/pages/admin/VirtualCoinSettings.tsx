import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Coins, Gift, TrendingUp, 
  Settings, Save, Plus, Edit, Trash2, 
  CheckCircle, AlertCircle, Calendar
} from 'lucide-react';
import { toast } from 'sonner';

export const VirtualCoinSettings = () => {
  const navigate = useNavigate();
  const [acceptCoins, setAcceptCoins] = useState(true);
  const [conversionRate, setConversionRate] = useState(1);
  const [showEventModal, setShowEventModal] = useState(false);

  const [events, setEvents] = useState([
    {
      id: 1,
      name: 'Khuyến mãi tháng 3',
      description: 'Tặng 10% xu ảo cho giao dịch từ 100.000đ',
      discountPercent: 10,
      minAmount: 100000,
      maxDiscount: 50000,
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      isActive: true,
    },
  ]);

  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    discountPercent: 0,
    minAmount: 0,
    maxDiscount: 0,
    startDate: '',
    endDate: '',
  });

  const handleSaveSettings = () => {
    toast.success('Cài đặt đã được lưu thành công!');
  };

  const handleAddEvent = () => {
    if (!newEvent.name || !newEvent.discountPercent) {
      toast.error('Vui lòng điền đầy đủ thông tin sự kiện');
      return;
    }

    const event = {
      id: events.length + 1,
      ...newEvent,
      isActive: true,
    };

    setEvents([...events, event]);
    setShowEventModal(false);
    setNewEvent({
      name: '',
      description: '',
      discountPercent: 0,
      minAmount: 0,
      maxDiscount: 0,
      startDate: '',
      endDate: '',
    });
    toast.success('Sự kiện đã được thêm!');
  };

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter(e => e.id !== id));
    toast.success('Đã xóa sự kiện');
  };

  const handleToggleEvent = (id: number) => {
    setEvents(events.map(e => 
      e.id === id ? { ...e, isActive: !e.isActive } : e
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl mb-1">Cài đặt xu ảo</h1>
              <p className="text-amber-100 text-sm">Quản lý thanh toán bằng xu ảo và khuyến mãi</p>
            </div>
            <Settings className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Virtual Coins Settings */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Coins className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl text-gray-900">Cài đặt chung</h2>
              <p className="text-gray-600 text-sm">Cấu hình thanh toán xu ảo cho bãi đỗ</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Accept Virtual Coins */}
            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl">
              <div className="flex-1">
                <h3 className="text-lg text-gray-900 mb-2">Chấp nhận thanh toán bằng xu ảo</h3>
                <p className="text-sm text-gray-600">
                  Cho phép Người dùng sử dụng xu ảo để thanh toán phí đỗ xe tại bãi của bạn
                </p>
              </div>
              <button
                onClick={() => setAcceptCoins(!acceptCoins)}
                className={`relative w-16 h-8 rounded-full transition-all ${
                  acceptCoins ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                    acceptCoins ? 'left-9' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Conversion Rate */}
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="text-lg text-gray-900 mb-4">Tỷ giá quy đổi</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-2">1 xu ảo =</label>
                  <input
                    type="number"
                    value={conversionRate}
                    onChange={(e) => setConversionRate(parseFloat(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="text-gray-600 mt-6">VNĐ</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Tỷ giá chuẩn: 1 xu = 1 VNĐ. Có thể thay đổi theo thỏa thuận.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Lưu ý quan trọng:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Tắt tính năng này nếu bạn chỉ chấp nhận tiền mặt/chuyển khoản</li>
                    <li>Khi tắt, người dùng sẽ không thể đặt chỗ trước bằng xu ảo</li>
                    <li>Thay đổi cài đặt sẽ áp dụng cho tất cả giao dịch mới</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full mt-6 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Lưu cài đặt
          </button>
        </div>

        {/* Discount Events */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h2 className="text-2xl text-gray-900">Sự kiện khuyến mãi</h2>
                <p className="text-gray-600 text-sm">Tạo các chương trình ưu đãi khi nạp xu</p>
              </div>
            </div>
            <button
              onClick={() => setShowEventModal(true)}
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tạo sự kiện
            </button>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có sự kiện khuyến mãi nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    event.isActive 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl text-gray-900">{event.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            event.isActive
                              ? 'bg-green-200 text-green-800'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {event.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{event.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Khuyến mãi:</span>
                          <p className="text-pink-600 font-semibold">+{event.discountPercent}%</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Tối thiểu:</span>
                          <p className="text-gray-900 font-semibold">
                            {event.minAmount.toLocaleString()}đ
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Tối đa:</span>
                          <p className="text-gray-900 font-semibold">
                            {event.maxDiscount?.toLocaleString() || 'Không giới hạn'}đ
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Thời gian:
                          </span>
                          <p className="text-gray-900 font-semibold">
                            {new Date(event.startDate).toLocaleDateString('vi-VN')} - 
                            {new Date(event.endDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggleEvent(event.id)}
                        className={`p-2 rounded-lg transition-all ${
                          event.isActive
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        {event.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl text-gray-900">Thống kê xu ảo</h2>
              <p className="text-gray-600 text-sm">Dữ liệu tháng này</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="text-sm text-gray-600 mb-2">Tổng xu đã nhận</div>
              <div className="text-3xl text-blue-600 mb-1">2,500,000</div>
              <div className="text-xs text-gray-500">≈ 2.500.000đ</div>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="text-sm text-gray-600 mb-2">Giao dịch thành công</div>
              <div className="text-3xl text-green-600 mb-1">156</div>
              <div className="text-xs text-gray-500">+12% so với tháng trước</div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="text-sm text-gray-600 mb-2">Khuyến mãi đã tặng</div>
              <div className="text-3xl text-purple-600 mb-1">250,000</div>
              <div className="text-xs text-gray-500">Từ các sự kiện</div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-gray-900">Tạo sự kiện khuyến mãi</h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Tên sự kiện <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  placeholder="VD: Khuyến mãi mùa hè"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Mô tả chi tiết về sự kiện"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Phần trăm khuyến mãi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newEvent.discountPercent}
                    onChange={(e) => setNewEvent({ ...newEvent, discountPercent: parseFloat(e.target.value) })}
                    placeholder="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Số tiền tối thiểu</label>
                  <input
                    type="number"
                    value={newEvent.minAmount}
                    onChange={(e) => setNewEvent({ ...newEvent, minAmount: parseFloat(e.target.value) })}
                    placeholder="100000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Khuyến mãi tối đa</label>
                <input
                  type="number"
                  value={newEvent.maxDiscount}
                  onChange={(e) => setNewEvent({ ...newEvent, maxDiscount: parseFloat(e.target.value) })}
                  placeholder="50000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleAddEvent}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl hover:shadow-lg transition-all"
                >
                  Tạo sự kiện
                </button>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
