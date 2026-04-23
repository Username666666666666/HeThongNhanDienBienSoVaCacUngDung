import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Coins, CreditCard, Smartphone, 
  DollarSign, TrendingUp, Gift, AlertCircle,
  CheckCircle, Clock
} from 'lucide-react';
import { toast } from 'sonner';

export const TopUpCoins = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'momo' | null>(null);
  const [step, setStep] = useState(1);

  // Mock user balance
  const currentBalance = 500000;

  // Mock discount events
  const activeEvents = [
    {
      id: 1,
      name: 'Khuyến mãi tháng 3',
      description: 'Tặng 10% xu ảo cho giao dịch từ 100.000đ',
      discountPercent: 10,
      minAmount: 100000,
      endDate: '31/03/2026',
      icon: '🎉',
    },
    {
      id: 2,
      name: 'Nạp lần đầu',
      description: 'Tặng thêm 20% xu ảo cho người dùng mới',
      discountPercent: 20,
      minAmount: 50000,
      endDate: '31/12/2026',
      icon: '🎁',
    },
  ];

  // Quick top-up packages
  const packages = [
    { amount: 50000, bonus: 0, popular: false },
    { amount: 100000, bonus: 10000, popular: true },
    { amount: 200000, bonus: 30000, popular: false },
    { amount: 500000, bonus: 100000, popular: false },
    { amount: 1000000, bonus: 250000, popular: false },
  ];

  const calculateFinalAmount = (baseAmount: number) => {
    let total = baseAmount;
    
    // Apply active events
    activeEvents.forEach(event => {
      if (baseAmount >= event.minAmount) {
        total += baseAmount * (event.discountPercent / 100);
      }
    });

    return total;
  };

  const handleSelectPackage = (pkg: typeof packages[0], index: number) => {
    setSelectedPackage(index);
    setAmount(pkg.amount.toString());
  };

  const handleContinue = () => {
    if (!amount || parseInt(amount) < 10000) {
      toast.error('Số tiền nạp tối thiểu là 10.000đ');
      return;
    }

    if (!paymentMethod) {
      toast.error('Vui lòng chọn phương thức thanh toán');
      return;
    }

    setStep(2);
  };

  const handleConfirmPayment = () => {
    toast.success('Nạp xu thành công! Xu đã được cộng vào tài khoản.');
    navigate('/owner');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (step > 1) setStep(1);
                else navigate('/owner');
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl mb-1">Nạp xu ảo</h1>
              <p className="text-amber-100 text-sm">
                1 xu ảo = 1 VNĐ
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-amber-100">Số dư hiện tại</p>
              <p className="text-2xl">{currentBalance.toLocaleString()} xu</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {step === 1 && (
          <div className="space-y-6">
            {/* Active Events */}
            {activeEvents.length > 0 && (
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="w-8 h-8" />
                  <h2 className="text-2xl">Sự kiện đang diễn ra</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeEvents.map((event) => (
                    <div key={event.id} className="bg-white/20 backdrop-blur rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{event.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-lg mb-1">{event.name}</h3>
                          <p className="text-sm text-white/90 mb-2">{event.description}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>Đến {event.endDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick packages */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl text-gray-900 mb-6">Gói nạp nhanh</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {packages.map((pkg, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectPackage(pkg, index)}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      selectedPackage === index
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Phổ biến
                      </div>
                    )}
                    <div className="text-center">
                      <Coins className={`w-8 h-8 mx-auto mb-2 ${
                        selectedPackage === index ? 'text-amber-600' : 'text-gray-400'
                      }`} />
                      <p className="text-lg text-gray-900 mb-1">
                        {(pkg.amount / 1000).toFixed(0)}K
                      </p>
                      {pkg.bonus > 0 && (
                        <p className="text-xs text-green-600">
                          +{(pkg.bonus / 1000).toFixed(0)}K bonus
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl text-gray-900 mb-6">Hoặc nhập số tiền tùy chỉnh</h2>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setSelectedPackage(null);
                  }}
                  placeholder="Nhập số tiền (tối thiểu 10.000đ)"
                  className="w-full pl-14 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-xl"
                />
              </div>

              {amount && parseInt(amount) >= 10000 && (
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <h3 className="text-lg text-gray-900 mb-4">Chi tiết giao dịch</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tiền nạp:</span>
                      <span className="text-gray-900">{parseInt(amount).toLocaleString()}đ</span>
                    </div>
                    {activeEvents.map(event => {
                      if (parseInt(amount) >= event.minAmount) {
                        const bonus = parseInt(amount) * (event.discountPercent / 100);
                        return (
                          <div key={event.id} className="flex justify-between text-green-600">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {event.name} (+{event.discountPercent}%):
                            </span>
                            <span>+{bonus.toLocaleString()} xu</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                    <div className="border-t pt-3 flex justify-between text-xl">
                      <span className="text-gray-900">Tổng xu nhận được:</span>
                      <span className="text-amber-600">
                        {calculateFinalAmount(parseInt(amount)).toLocaleString()} xu
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment methods */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl text-gray-900 mb-6">Phương thức thanh toán</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <CreditCard className={`w-10 h-10 mx-auto mb-3 ${
                    paymentMethod === 'card' ? 'text-amber-600' : 'text-gray-400'
                  }`} />
                  <p className="text-center text-gray-900">Thẻ tín dụng/ghi nợ</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <DollarSign className={`w-10 h-10 mx-auto mb-3 ${
                    paymentMethod === 'bank' ? 'text-amber-600' : 'text-gray-400'
                  }`} />
                  <p className="text-center text-gray-900">Chuyển khoản ngân hàng</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('momo')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    paymentMethod === 'momo'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <Smartphone className={`w-10 h-10 mx-auto mb-3 ${
                    paymentMethod === 'momo' ? 'text-amber-600' : 'text-gray-400'
                  }`} />
                  <p className="text-center text-gray-900">Ví điện tử (MoMo, ZaloPay)</p>
                </button>
              </div>
            </div>

            {/* Info notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Lưu ý quan trọng:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Xu ảo chỉ được sử dụng trong hệ thống bãi đỗ xe</li>
                    <li>Xu không thể đổi lại thành tiền mặt</li>
                    <li>Một số bãi đỗ có thể không hỗ trợ thanh toán bằng xu ảo</li>
                    <li>Kiểm tra với quản trị viên bãi đỗ trước khi nạp</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={!amount || parseInt(amount) < 10000 || !paymentMethod}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp tục thanh toán
            </button>
          </div>
        )}

        {/* Step 2: Confirmation */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-12 h-12 text-amber-600" />
                </div>
                <h2 className="text-2xl text-gray-900 mb-2">Xác nhận nạp xu</h2>
                <p className="text-gray-600">Vui lòng kiểm tra thông tin trước khi thanh toán</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền thanh toán:</span>
                    <span className="text-gray-900 text-xl">{parseInt(amount).toLocaleString()}đ</span>
                  </div>
                  {activeEvents.map(event => {
                    if (parseInt(amount) >= event.minAmount) {
                      const bonus = parseInt(amount) * (event.discountPercent / 100);
                      return (
                        <div key={event.id} className="flex justify-between text-green-600">
                          <span>{event.name} (+{event.discountPercent}%):</span>
                          <span>+{bonus.toLocaleString()} xu</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                  <div className="border-t pt-4 flex justify-between">
                    <span className="text-gray-900 text-lg">Tổng xu nhận được:</span>
                    <span className="text-amber-600 text-2xl">
                      {calculateFinalAmount(parseInt(amount)).toLocaleString()} xu
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="text-sm text-gray-600 mb-2">Phương thức thanh toán</h3>
                <p className="text-gray-900">
                  {paymentMethod === 'card' && 'Thẻ tín dụng/ghi nợ'}
                  {paymentMethod === 'bank' && 'Chuyển khoản ngân hàng'}
                  {paymentMethod === 'momo' && 'Ví điện tử'}
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleConfirmPayment}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-xl hover:shadow-lg transition-all"
                >
                  <CheckCircle className="w-5 h-5 inline mr-2" />
                  Xác nhận thanh toán
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="w-full border-2 border-gray-300 text-gray-700 py-4 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
