import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, Check, AlertCircle, Building2, 
  Info, Coins, CheckCircle, X, RefreshCw, Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface ServicePackage {
  id: string;
  name: string;
  staffLimit: string;
  price: number;
  features: string[];
  deviceDiscount: number;
  maintenanceDiscount: number;
}

interface ParkingLot {
  id: string;
  name: string;
  package: string;
  hasVirtualCoin: boolean;
  status: 'active' | 'expired';
  expiryDate: string;
}

export const ServiceRegistration = () => {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showPackageDetails, setShowPackageDetails] = useState(false);
  const [enableVirtualCoin, setEnableVirtualCoin] = useState(false);
  const [selectedParkingLot, setSelectedParkingLot] = useState<string>('');
  const [isRenewal, setIsRenewal] = useState(false);

  // Cấu hình xu ảo từ Provider
  const providerCoinConfig = {
    minCoins: 5,
    maxCoins: 200,
  };

  const packages: ServicePackage[] = [
    {
      id: 'basic',
      name: 'Cơ bản',
      staffLimit: '3-5 nhân viên',
      price: 299000,
      deviceDiscount: 10,
      maintenanceDiscount: 15,
      features: [
        'Quản lý cơ bản',
        'Camera giám sát (tối đa 2)',
        'Báo cáo cơ bản',
        'Hỗ trợ email',
        'Tự bảo trì thiết bị',
      ],
    },
    {
      id: 'standard',
      name: 'Tiêu chuẩn',
      staffLimit: '10-15 nhân viên',
      price: 699000,
      deviceDiscount: 20,
      maintenanceDiscount: 30,
      features: [
        'Tất cả tính năng Cơ bản',
        'Camera giám sát (tối đa 10)',
        'Báo cáo nâng cao',
        'Hỗ trợ 24/7',
        'Bảo trì định kỳ 6 tháng/lần',
      ],
    },
    {
      id: 'premium',
      name: 'Cao cấp',
      staffLimit: 'Không giới hạn',
      price: 1499000,
      deviceDiscount: 30,
      maintenanceDiscount: 50,
      features: [
        'Tất cả tính năng Tiêu chuẩn',
        'Không giới hạn nhân viên',
        'Camera không giới hạn',
        'Bảo trì định kỳ 3 tháng/lần',
        'Hỗ trợ ưu tiên 24/7',
        'Đào tạo miễn phí',
      ],
    },
  ];

  const [myParkingLots, setMyParkingLots] = useState<ParkingLot[]>([
    {
      id: '1',
      name: 'Bãi đỗ xe Hùng Vương',
      package: 'Tiêu chuẩn',
      hasVirtualCoin: false,
      status: 'active',
      expiryDate: '2026-05-16',
    },
    {
      id: '2',
      name: 'Bãi xe Thống Nhất',
      package: 'Cơ bản',
      hasVirtualCoin: false,
      status: 'active',
      expiryDate: '2026-06-10',
    },
    {
      id: '3',
      name: 'Bãi đỗ xe Trần Hưng Đạo',
      package: 'Cao cấp',
      hasVirtualCoin: true,
      status: 'expired',
      expiryDate: '2026-04-10',
    },
  ]);

  // Danh sách bãi đỗ chưa đăng ký gói
  const unregisteredLots = [
    { id: '4', name: 'Bãi đỗ xe Lê Lợi' },
    { id: '5', name: 'Bãi xe Nguyễn Huệ' },
  ];

  const handleSelectPackage = (packageId: string, renewal: boolean = false, lotId?: string) => {
    setSelectedPackage(packageId);
    setIsRenewal(renewal);
    setEnableVirtualCoin(false); // Reset
    
    if (lotId) {
      setSelectedParkingLot(lotId);
    } else {
      setSelectedParkingLot('');
    }
    
    setShowPackageDetails(true);
  };

  const handleRegister = () => {
    const pkg = packages.find((p) => p.id === selectedPackage);
    if (!pkg) return;

    if (!selectedParkingLot) {
      toast.error('Vui lòng chọn bãi đỗ!');
      return;
    }

    const lot = [...myParkingLots, ...unregisteredLots].find((l) => l.id === selectedParkingLot);
    const action = isRenewal ? 'Gia hạn' : 'Đăng ký';
    const coinStatus = enableVirtualCoin ? 'có hỗ trợ xu ảo' : 'không hỗ trợ xu ảo';
    
    toast.success(`✅ ${action} gói ${pkg.name} thành công!`, {
      description: `Bãi: ${lot?.name} - ${coinStatus}`,
    });
    
    setShowPackageDetails(false);
    setSelectedPackage(null);
    setSelectedParkingLot('');
    setEnableVirtualCoin(false);
    setIsRenewal(false);
  };

  const selectedPackageData = packages.find((p) => p.id === selectedPackage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-xl">
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
                <Package className="w-8 h-8" />
                Gói dịch vụ
              </h1>
              <p className="text-purple-100 text-sm">Chọn gói phù hợp với nhu cầu của bạn</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* My Parking Lots */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Bãi đỗ của tôi</h2>
          </div>
          <div className="space-y-3">
            {myParkingLots.map((lot) => (
              <div
                key={lot.id}
                className={`border-2 rounded-xl p-4 transition ${
                  lot.status === 'expired' 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-xl font-bold text-gray-900">{lot.name}</div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="text-sm text-gray-600">
                        Gói: <span className="font-semibold">{lot.package}</span>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        HSD: <span className="font-semibold">{lot.expiryDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {lot.hasVirtualCoin ? (
                      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 px-4 py-2 rounded-full flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-600" />
                        <span className="font-bold text-yellow-700">Có xu ảo</span>
                      </div>
                    ) : (
                      <div className="bg-gray-100 border-2 border-gray-300 px-4 py-2 rounded-full">
                        <span className="font-semibold text-gray-600">Không có xu ảo</span>
                      </div>
                    )}
                    <div className={`px-4 py-2 rounded-full font-semibold ${
                      lot.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {lot.status === 'active' ? '🟢 Hoạt động' : '🔴 Hết hạn'}
                    </div>
                    {lot.status === 'active' && (
                      <button
                        onClick={() => {
                          const currentPkg = packages.find(p => p.name === lot.package);
                          if (currentPkg) {
                            handleSelectPackage(currentPkg.id, true, lot.id);
                          }
                        }}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:from-blue-600 hover:to-indigo-600 transition font-semibold"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Gia hạn
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Packages */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Các gói dịch vụ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition cursor-pointer ${
                  pkg.id === 'premium'
                    ? 'border-yellow-400 ring-4 ring-yellow-100'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
                onClick={() => handleSelectPackage(pkg.id)}
              >
                {pkg.id === 'premium' && (
                  <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white py-2 text-center font-bold">
                    ⭐ KHUYẾN NGHỊ
                  </div>
                )}

                <div className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <div className="text-sm text-gray-600 mb-4">{pkg.staffLimit}</div>
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {pkg.price.toLocaleString()}đ
                    </div>
                    <div className="text-sm text-gray-500">/ tháng</div>
                  </div>

                  {/* Hiển thị ưu đãi cho TẤT CẢ gói */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="w-5 h-5 text-yellow-600" />
                      <span className="font-bold text-yellow-700">Ưu đãi nếu dùng xu ảo</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      • Giảm {pkg.deviceDiscount}% thiết bị<br />
                      • Giảm {pkg.maintenanceDiscount}% bảo trì
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPackage(pkg.id);
                    }}
                    className={`w-full py-3 rounded-xl font-bold transition ${
                      pkg.id === 'premium'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    Đăng ký ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Policy Notice */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-300">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">📋 Chính sách dịch vụ</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <strong>Thiết bị:</strong> Nhà cung cấp cho mượn thiết bị. Nếu làm hư, Admin sẽ phải bồi thường 100% giá trị thiết bị.</li>
                <li>• <strong>Bảo trì:</strong> Gói Cơ bản tự bảo trì. Gói Tiêu chuẩn bảo trì 6 tháng/lần. Gói Cao cấp bảo trì 3 tháng/lần.</li>
                <li>• <strong>Hỗ trợ:</strong> Gói Cơ bản chỉ hỗ trợ email. Gói Tiêu chuẩn và Cao cấp hỗ trợ 24/7.</li>
                <li>• <strong>Xu ảo:</strong> TẤT CẢ gói đều có ưu đãi khi bật xu ảo. Nếu dùng xu ảo, bãi đỗ phải dùng giá cố định (không được tính theo giờ/ngày).</li>
                <li>• <strong>Thanh toán:</strong> Phí dịch vụ tính theo tháng. Gia hạn trước ngày hết hạn 7 ngày.</li>
                <li>• <strong>Hủy gói:</strong> Thông báo trước 30 ngày. Không hoàn phí đã thanh toán.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Package Details Modal */}
      {showPackageDetails && selectedPackageData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              {isRenewal ? '🔄 Gia hạn' : '✨ Đăng ký'} gói {selectedPackageData.name}
            </h2>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border-2 border-purple-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Gói dịch vụ</div>
                  <div className="text-xl font-bold text-gray-900">{selectedPackageData.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Giá</div>
                  <div className="text-xl font-bold text-purple-600">
                    {selectedPackageData.price.toLocaleString()}đ/tháng
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-600 mb-1">Giới hạn nhân viên</div>
                  <div className="font-semibold text-gray-900">{selectedPackageData.staffLimit}</div>
                </div>
              </div>
            </div>

            {/* Chọn bãi đỗ */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-indigo-300">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">Chọn bãi đỗ</h3>
              </div>
              <select
                value={selectedParkingLot}
                onChange={(e) => setSelectedParkingLot(e.target.value)}
                className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Chọn bãi đỗ --</option>
                {isRenewal ? (
                  myParkingLots
                    .filter(lot => lot.id === selectedParkingLot)
                    .map(lot => (
                      <option key={lot.id} value={lot.id}>
                        {lot.name} (Gói hiện tại: {lot.package})
                      </option>
                    ))
                ) : (
                  <>
                    <optgroup label="Bãi chưa đăng ký">
                      {unregisteredLots.map(lot => (
                        <option key={lot.id} value={lot.id}>
                          {lot.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Bãi đã đăng ký (nâng cấp)">
                      {myParkingLots
                        .filter(lot => lot.status === 'active')
                        .map(lot => (
                          <option key={lot.id} value={lot.id}>
                            {lot.name} (Gói hiện tại: {lot.package})
                          </option>
                        ))}
                    </optgroup>
                  </>
                )}
              </select>
            </div>

            {/* Virtual Coin Toggle */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6 border-2 border-yellow-400">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Coins className="w-7 h-7 text-yellow-600" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Hỗ trợ xu ảo</h3>
                    <p className="text-sm text-gray-600">Bật tính năng thanh toán bằng xu ảo</p>
                  </div>
                </div>
                <button
                  onClick={() => setEnableVirtualCoin(!enableVirtualCoin)}
                  className={`relative w-16 h-8 rounded-full transition ${
                    enableVirtualCoin ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition transform ${
                      enableVirtualCoin ? 'translate-x-8' : ''
                    }`}
                  ></div>
                </button>
              </div>

              {enableVirtualCoin && (
                <div className="border-t-2 border-yellow-200 pt-4 mt-4 space-y-4">
                  {/* Cảnh báo chính */}
                  <div className="bg-white rounded-lg p-4 border-2 border-red-400">
                    <div className="flex items-start gap-2 mb-3">
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-red-600 text-lg mb-2">⚠️ LƯU Ý QUAN TRỌNG VỀ XU ẢO</h4>
                        <ul className="text-sm text-gray-800 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold text-lg">•</span>
                            <span><strong className="text-red-600">CHỈ hỗ trợ GIÁ CỐ ĐỊNH</strong> cho các loại xe (xe máy, ô tô, xe đạp...)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold text-lg">•</span>
                            <span><strong className="text-red-600">KHÔNG hỗ trợ</strong> tính phí theo giờ hoặc ngày</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold text-lg">•</span>
                            <span>Số xu: <strong>{providerCoinConfig.minCoins} - {providerCoinConfig.maxCoins} xu</strong>/lần đặt chỗ (do nhà cung cấp quản lý)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold text-lg">•</span>
                            <span><strong className="text-red-600">Admin KHÔNG nhận tiền</strong> từ giao dịch xu ảo (tiền do nhà cung cấp quản lý)</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Ưu đãi */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-400">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-green-700 text-lg mb-2">🎁 Ưu đãi khi sử dụng xu ảo</h4>
                        <ul className="text-sm text-gray-800 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold text-lg">•</span>
                            <span>Giảm <strong className="text-green-600">{selectedPackageData.deviceDiscount}%</strong> chi phí lắp đặt thiết bị (camera, server, gateway...)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold text-lg">•</span>
                            <span>Giảm <strong className="text-green-600">{selectedPackageData.maintenanceDiscount}%</strong> chi phí bảo trì định kỳ</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold text-lg">•</span>
                            <span>Hỗ trợ kỹ thuật ưu tiên 24/7</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold text-lg">•</span>
                            <span>Miễn phí nâng cấp phần mềm</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Cảnh báo bồi thường */}
                  <div className="bg-gradient-to-r from-red-100 to-orange-100 rounded-lg p-4 border-2 border-red-300">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-red-600 text-lg mb-2">⚠️ TRÁCH NHIỆM BẢO QUẢN THIẾT BỊ</h4>
                        <ul className="text-sm text-gray-800 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold text-lg">•</span>
                            <span>Admin có <strong className="text-red-600">TRÁCH NHIỆM BẢO QUẢN</strong> thiết bị nhà cung cấp cho mượn</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold text-lg">•</span>
                            <span>Nếu làm hư, mất mát, hỏng hóc → <strong className="text-red-600">BỒI THƯỜNG 100%</strong> giá trị thiết bị</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold text-lg">•</span>
                            <span>Bảo hành 12 tháng (chỉ áp dụng lỗi nhà sản xuất)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 font-bold text-lg">•</span>
                            <span>Khi hết hạn hợp đồng, phải trả lại thiết bị nguyên vẹn</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!enableVirtualCoin && (
                <div className="text-sm text-gray-600 italic bg-white p-4 rounded-lg border border-yellow-300">
                  💡 <strong>Mẹo:</strong> Bật tính năng xu ảo để nhận ưu đãi giảm {selectedPackageData.deviceDiscount}% thiết bị và {selectedPackageData.maintenanceDiscount}% bảo trì từ nhà cung cấp!
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowPackageDetails(false);
                  setSelectedPackage(null);
                  setSelectedParkingLot('');
                  setEnableVirtualCoin(false);
                  setIsRenewal(false);
                }}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl hover:bg-gray-50 transition font-bold text-lg flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Hủy
              </button>
              <button
                onClick={handleRegister}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition font-bold text-lg shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {isRenewal ? 'Xác nhận gia hạn' : 'Xác nhận đăng ký'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
