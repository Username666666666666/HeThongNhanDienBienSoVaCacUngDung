import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Save, Info } from 'lucide-react';
import { toast } from 'sonner';

export const VirtualCoinSettings = () => {
  const navigate = useNavigate();

  // Cấu hình số lượng xu ảo tối thiểu/tối đa cho MỖI LẦN ĐẶT CHỖ TRƯỚC
  const [minCoinsPerBooking, setMinCoinsPerBooking] = useState(5); // Tối thiểu 5 xu
  const [maxCoinsPerBooking, setMaxCoinsPerBooking] = useState(200); // Tối đa 200 xu

  const handleSave = () => {
    if (minCoinsPerBooking >= maxCoinsPerBooking) {
      toast.error('Số xu tối thiểu phải nhỏ hơn số xu tối đa!');
      return;
    }

    if (minCoinsPerBooking < 1) {
      toast.error('Số xu tối thiểu phải lớn hơn 0!');
      return;
    }

    if (maxCoinsPerBooking > 9999) {
      toast.error('Số xu tối đa không được vượt quá 9999!');
      return;
    }

    toast.success('✅ Đã lưu cấu hình xu ảo thành công!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 via-orange-600 to-amber-600 text-white shadow-xl">
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
                <Coins className="w-8 h-8" />
                Cấu hình xu ảo
              </h1>
              <p className="text-yellow-100 text-sm">
                Thiết lập giới hạn xu ảo cho đặt chỗ trước
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-6 mb-6 border-2 border-blue-300">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                🔐 Quyền hạn nhà cung cấp
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Chỉ nhà cung cấp mới có quyền cấu hình SỐ LƯỢNG xu ảo cho đặt chỗ trước</li>
                <li>• Cấu hình này áp dụng cho TOÀN BỘ hệ thống</li>
                <li>• Người dùng phải nằm trong khoảng giới hạn khi đặt chỗ trước bằng xu</li>
                <li>• Admin các bãi đỗ không thể thay đổi giới hạn này</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Giới hạn xu ảo cho đặt chỗ trước</h2>

          {/* Min Coins */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Số xu tối thiểu cho mỗi lần đặt chỗ
            </label>
            <div className="relative">
              <Coins className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={minCoinsPerBooking}
                onChange={(e) => setMinCoinsPerBooking(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-lg font-bold"
                placeholder="5"
                min="1"
                max="9999"
              />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Người dùng phải đặt tối thiểu <strong>{minCoinsPerBooking} xu</strong> cho mỗi lần đặt chỗ
            </div>
          </div>

          {/* Max Coins */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Số xu tối đa cho mỗi lần đặt chỗ
            </label>
            <div className="relative">
              <Coins className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={maxCoinsPerBooking}
                onChange={(e) => setMaxCoinsPerBooking(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-lg font-bold"
                placeholder="200"
                min="1"
                max="9999"
              />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Người dùng chỉ được đặt tối đa <strong>{maxCoinsPerBooking} xu</strong> cho mỗi lần đặt chỗ
            </div>
          </div>

          {/* Range Display */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6 border-2 border-yellow-300">
            <h3 className="font-bold text-gray-900 mb-3">📊 Khoảng giới hạn</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                <div className="text-sm text-gray-600 mb-1">Tối thiểu</div>
                <div className="text-2xl font-bold text-green-600">
                  {minCoinsPerBooking} xu
                </div>
                <div className="text-xs text-gray-500 mt-1">/ mỗi lần đặt chỗ</div>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-red-300">
                <div className="text-sm text-gray-600 mb-1">Tối đa</div>
                <div className="text-2xl font-bold text-red-600">
                  {maxCoinsPerBooking} xu
                </div>
                <div className="text-xs text-gray-500 mt-1">/ mỗi lần đặt chỗ</div>
              </div>
            </div>
          </div>

          {/* Example Scenarios */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border-2 border-purple-300">
            <h3 className="font-bold text-gray-900 mb-3">💡 Ví dụ thực tế</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✅</span>
                  <span className="font-bold text-green-700">HỢP LỆ</span>
                </div>
                <p className="text-gray-700">
                  • Người dùng đặt chỗ với <strong>{minCoinsPerBooking} xu</strong> - OK<br />
                  • Người dùng đặt chỗ với <strong>{Math.floor((minCoinsPerBooking + maxCoinsPerBooking) / 2)} xu</strong> - OK<br />
                  • Người dùng đặt chỗ với <strong>{maxCoinsPerBooking} xu</strong> - OK
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-red-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">❌</span>
                  <span className="font-bold text-red-700">KHÔNG HỢP LỆ</span>
                </div>
                <p className="text-gray-700">
                  • Người dùng đặt chỗ với <strong>1 xu</strong> - Quá ít (tối thiểu {minCoinsPerBooking} xu)<br />
                  • Người dùng đặt chỗ với <strong>9999 xu</strong> - Quá nhiều (tối đa {maxCoinsPerBooking} xu)<br />
                  • Người dùng đặt chỗ với <strong>{minCoinsPerBooking - 1} xu</strong> - Dưới mức tối thiểu
                </p>
              </div>
            </div>
          </div>

          {/* Payment Methods Info */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-cyan-300">
            <h3 className="font-bold text-gray-900 mb-3">💳 Hình thức thanh toán</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <div>
                  <strong>Đặt chỗ trước (giá cố định):</strong> Người dùng có thể chọn thanh toán bằng tiền mặt HOẶC xu ảo
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✗</span>
                <div>
                  <strong>Đỗ theo giờ/ngày:</strong> KHÔNG hỗ trợ đặt chỗ trước, chỉ tính tiền khi ra bãi
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">ℹ</span>
                <div>
                  <strong>Lưu ý:</strong> Admin cần quy định rõ bãi đỗ tính theo giờ hay giá cố định
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-yellow-600 via-orange-600 to-amber-600 text-white py-4 rounded-xl hover:from-yellow-700 hover:via-orange-700 hover:to-amber-700 transition flex items-center justify-center gap-2 font-bold text-lg shadow-lg"
          >
            <Save className="w-6 h-6" />
            Lưu cấu hình
          </button>
        </div>

        {/* Warning */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 mt-6 border-2 border-red-300">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ⚠️ Lưu ý quan trọng
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  • Cấu hình này áp dụng cho TẤT CẢ các bãi đỗ trong hệ thống
                </li>
                <li>
                  • Giới hạn quá thấp (VD: 1 xu) sẽ gây lạm dụng hệ thống
                </li>
                <li>
                  • Giới hạn quá cao (VD: 9999 xu) sẽ khiến không ai sử dụng xu ảo
                </li>
                <li>
                  • Nên đặt khoảng hợp lý (VD: 5-200 xu) để khuyến khích sử dụng
                </li>
                <li>
                  • Thay đổi sẽ ảnh hưởng đến tất cả giao dịch đặt chỗ mới
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
