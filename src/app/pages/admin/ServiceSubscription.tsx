import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Building2, Users, Crown, CheckCircle, 
  Calendar, Info, ExternalLink, Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';

export const ServiceSubscription = () => {
  const navigate = useNavigate();
  // Track pending timeouts for cleanup
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Mock subscription status
  const [currentSubscription] = useState({
    package: 'standard' as 'free' | 'standard' | 'enterprise',
    maxStaff: 15,
    currentStaff: 8,
    startDate: new Date('2026-01-01'),
    expiryDate: new Date('2026-12-31'),
    status: 'active' as 'active' | 'expired',
    monthlyFee: 2000000,
  });

  const packages = [
    {
      id: 'free',
      name: 'Miễn phí / Cơ bản',
      icon: '🆓',
      price: 0,
      maxStaff: 5,
      features: [
        'Tối đa 3-5 nhân viên',
        'Phù hợp bãi xe nhỏ',
        '2-3 ca trực',
        'Camera cơ bản',
        'Hỗ trợ email',
        'Báo cáo cơ bản',
      ],
      color: 'from-gray-500 to-slate-500',
      borderColor: 'border-gray-300',
      recommended: false,
    },
    {
      id: 'standard',
      name: 'Tiêu chuẩn',
      icon: '⭐',
      price: 2000000,
      maxStaff: 15,
      features: [
        'Tối đa 10-15 nhân viên',
        'Chuỗi bãi xe hoặc bãi lớn',
        'Nhiều cổng ra vào',
        'Camera HD + lưu trữ',
        'Hỗ trợ ưu tiên',
        'Báo cáo chi tiết',
        'Tích hợp API',
      ],
      color: 'from-blue-500 to-indigo-500',
      borderColor: 'border-blue-300',
      recommended: true,
    },
    {
      id: 'enterprise',
      name: 'Cao cấp (Enterprise)',
      icon: '👑',
      price: 5000000,
      maxStaff: 999,
      features: [
        'Không giới hạn nhân viên',
        'Hệ thống lớn, đa chi nhánh',
        'Tùy chỉnh toàn diện',
        'Camera AI + phân tích',
        'Hỗ trợ 24/7',
        'Báo cáo nâng cao + dự đoán',
        'Tích hợp đầy đủ',
        'Đào tạo chuyên sâu',
      ],
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-300',
      recommended: false,
    },
  ];

  const handleRegister = () => {
    toast.info('🌐 Chuyển hướng đến website nhà cung cấp để đăng ký...');
    const timeout = setTimeout(() => {
      // In real app, would redirect to provider website
      toast.success('✅ Đã mở trang đăng ký dịch vụ!');
    }, 1500);
    timeoutRefs.current.push(timeout);
  };

  const handleUpgrade = (packageId: string) => {
    toast.loading('Đang xử lý yêu cầu nâng cấp...');
    const timeout = setTimeout(() => {
      toast.success(`✅ Đã gửi yêu cầu nâng cấp lên gói ${packages.find(p => p.id === packageId)?.name}!`);
    }, 1500);
    timeoutRefs.current.push(timeout);
  };

  const handleRenew = () => {
    toast.loading('Đang xử lý gia hạn...');
    const timeout = setTimeout(() => {
      toast.success('✅ Đã gia hạn dịch vụ thành công!');
    }, 1500);
    timeoutRefs.current.push(timeout);
  };

  // Cleanup timeouts on component unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const daysUntilExpiry = Math.ceil(
    (currentSubscription.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl mb-1 flex items-center gap-3">
                <Building2 className="w-8 h-8" />
                Dịch vụ & Đăng ký
              </h1>
              <p className="text-purple-100 text-sm">
                Quản lý gói dịch vụ và đăng ký hệ thống
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Current Subscription */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-blue-300">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Gói dịch vụ hiện tại
              </h2>
              <p className="text-gray-600">Thông tin đăng ký và sử dụng của bạn</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              currentSubscription.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {currentSubscription.status === 'active' ? '✓ Đang hoạt động' : '✗ Hết hạn'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
              <div className="text-4xl mb-2">
                {packages.find(p => p.id === currentSubscription.package)?.icon}
              </div>
              <div className="text-sm text-gray-600 mb-1">Gói hiện tại</div>
              <div className="text-xl font-bold text-gray-900">
                {packages.find(p => p.id === currentSubscription.package)?.name}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
              <Users className="w-8 h-8 text-green-600 mb-2" />
              <div className="text-sm text-gray-600 mb-1">Nhân viên</div>
              <div className="text-xl font-bold text-gray-900">
                {currentSubscription.currentStaff}/{currentSubscription.maxStaff}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Còn {currentSubscription.maxStaff - currentSubscription.currentStaff} chỗ
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
              <Calendar className="w-8 h-8 text-purple-600 mb-2" />
              <div className="text-sm text-gray-600 mb-1">Hết hạn</div>
              <div className="text-xl font-bold text-gray-900">
                {currentSubscription.expiryDate.toLocaleDateString('vi-VN')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Còn {daysUntilExpiry} ngày
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-200">
              <div className="text-4xl mb-2">💰</div>
              <div className="text-sm text-gray-600 mb-1">Phí/tháng</div>
              <div className="text-xl font-bold text-gray-900">
                {currentSubscription.monthlyFee === 0
                  ? 'Miễn phí'
                  : `${currentSubscription.monthlyFee.toLocaleString()}đ`}
              </div>
            </div>
          </div>

          {daysUntilExpiry <= 30 && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-300 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    ⚠️ Sắp hết hạn dịch vụ
                  </h3>
                  <p className="text-sm text-gray-700">
                    Gói dịch vụ của bạn sẽ hết hạn trong {daysUntilExpiry} ngày. Vui lòng gia hạn để tiếp tục sử dụng.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleRenew}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 font-bold shadow-lg"
          >
            <CheckCircle className="w-5 h-5" />
            Gia hạn dịch vụ
          </button>
        </div>

        {/* Not Registered State */}
        {/* Uncomment below if user hasn't registered yet
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-red-300">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Chưa đăng ký dịch vụ
            </h2>
            <p className="text-gray-600 mb-6">
              Vui lòng đăng ký tại website nhà cung cấp để sử dụng hệ thống
            </p>
            <button
              onClick={handleRegister}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 font-bold shadow-lg mx-auto"
            >
              <ExternalLink className="w-5 h-5" />
              Đăng ký tại website nhà cung cấp
            </button>
          </div>
        </div>
        */}

        {/* Package Options */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Các gói dịch vụ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 ${pkg.borderColor} ${
                  pkg.recommended ? 'ring-4 ring-yellow-300' : ''
                } relative`}
              >
                {pkg.recommended && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    Phổ biến
                  </div>
                )}

                <div className={`p-6 bg-gradient-to-r ${pkg.color} text-white`}>
                  <div className="text-5xl mb-3">{pkg.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <div className="text-3xl font-bold">
                    {pkg.price === 0 ? 'Miễn phí' : `${pkg.price.toLocaleString()}đ`}
                  </div>
                  {pkg.price > 0 && <div className="text-sm opacity-90">/tháng</div>}
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">
                        {pkg.maxStaff === 999 ? 'Không giới hạn' : `Tối đa ${pkg.maxStaff}`} nhân viên
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {currentSubscription.package === pkg.id ? (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-600 py-3 rounded-xl font-bold cursor-not-allowed"
                    >
                      Gói hiện tại
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(pkg.id)}
                      className={`w-full bg-gradient-to-r ${pkg.color} text-white py-3 rounded-xl hover:shadow-lg transition font-bold`}
                    >
                      {pkg.price > (packages.find(p => p.id === currentSubscription.package)?.price || 0)
                        ? 'Nâng cấp'
                        : 'Chuyển xuống'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-300">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                📋 Lưu ý về dịch vụ
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  • Chỉ nhà cung cấp mới có thể cấu hình xu ảo (giá tối thiểu/tối đa)
                </li>
                <li>
                  • Admin chỉ quản lý nhân viên của bãi đỗ trong giới hạn gói dịch vụ
                </li>
                <li>
                  • Nhà cung cấp cung cấp trang thiết bị: camera, máy giám sát, server
                </li>
                <li>
                  • Nâng cấp/hạ cấp gói dịch vụ có hiệu lực ngay lập tức
                </li>
                <li>
                  • Phí dịch vụ được tính theo tháng, thanh toán vào đầu tháng
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
