import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Star, Search, Clock, 
  Coins, CheckCircle, AlertCircle, Calendar,
  ChevronRight, Info, DollarSign
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback.tsx';
import { toast } from 'sonner';

interface ParkingLotData {
  id: number;
  name: string;
  address: string;
  description: string;
  rating: number;
  reviewCount: number;
  totalSpots: number;
  availableSpots: number;
  images: string[];
  amenities: string[];
  acceptVirtualCoins: boolean;
  pricing: {
    type: 'hourly' | 'fixed' | 'daily';
    allowedVehicles: {
      type: string;
      label: string;
      icon: string;
      price: number;
      canReserve: boolean;
    }[];
  };
  reviews: {
    id: number;
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  zones: {
    id: string;
    name: string;
    spots: {
      id: string;
      name: string;
      status: 'available' | 'occupied' | 'reserved';
    }[];
  }[];
}

export const ParkingRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedLot, setSelectedLot] = useState<number | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data bãi đỗ
  const parkingLots: ParkingLotData[] = [
    {
      id: 1,
      name: 'Bãi đỗ xe Trung tâm A',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      description: 'Bãi đỗ xe hiện đại, an ninh 24/7, camera giám sát toàn bộ',
      rating: 4.8,
      reviewCount: 245,
      totalSpots: 120,
      availableSpots: 45,
      images: [
        'https://images.unsplash.com/photo-1558798950-b05b143f435b?w=800',
        'https://images.unsplash.com/photo-1619335680796-54f13b88c6ba?w=800',
      ],
      amenities: ['Camera 24/7', 'Bảo vệ', 'Sạc điện', 'Wifi miễn phí', 'Nhà vệ sinh'],
      acceptVirtualCoins: true,
      pricing: {
        type: 'fixed',
        allowedVehicles: [
          { type: 'car', label: 'Xe ô tô', icon: '🚗', price: 100000, canReserve: true },
          { type: 'motorcycle', label: 'Xe máy', icon: '🏍️', price: 30000, canReserve: true },
          { type: 'bicycle', label: 'Xe đạp', icon: '🚲', price: 10000, canReserve: true },
        ],
      },
      reviews: [
        { id: 1, userName: 'Nguyễn Văn A', rating: 5, comment: 'Bãi đỗ rất tốt, an toàn', date: '20/03/2026' },
        { id: 2, userName: 'Trần Thị B', rating: 4, comment: 'Giá hợp lý, vị trí thuận tiện', date: '18/03/2026' },
        { id: 3, userName: 'Lê Văn C', rating: 5, comment: 'Nhân viên nhiệt tình, chu đáo', date: '15/03/2026' },
      ],
      zones: [
        {
          id: 'zone-a',
          name: 'Khu A - Xe ô tô',
          spots: [
            { id: 'A001', name: 'A001', status: 'available' },
            { id: 'A002', name: 'A002', status: 'occupied' },
            { id: 'A003', name: 'A003', status: 'available' },
            { id: 'A004', name: 'A004', status: 'reserved' },
            { id: 'A005', name: 'A005', status: 'available' },
          ],
        },
        {
          id: 'zone-b',
          name: 'Khu B - Xe máy',
          spots: [
            { id: 'B001', name: 'B001', status: 'available' },
            { id: 'B002', name: 'B002', status: 'available' },
            { id: 'B003', name: 'B003', status: 'occupied' },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Bãi đỗ xe Quận 3',
      address: '456 Lê Lợi, Quận 3, TP.HCM',
      description: 'Bãi đỗ theo giờ, linh hoạt, gần chợ và trung tâm thương mại',
      rating: 4.5,
      reviewCount: 189,
      totalSpots: 80,
      availableSpots: 30,
      images: [
        'https://images.unsplash.com/photo-1619335680796-54f13b88c6ba?w=800',
      ],
      amenities: ['Camera 24/7', 'Bảo vệ', 'Gần trung tâm'],
      acceptVirtualCoins: false,
      pricing: {
        type: 'hourly',
        allowedVehicles: [
          { type: 'car', label: 'Xe ô tô', icon: '🚗', price: 20000, canReserve: false },
          { type: 'motorcycle', label: 'Xe máy', icon: '🏍️', price: 5000, canReserve: false },
        ],
      },
      reviews: [
        { id: 1, userName: 'Phạm Văn D', rating: 4, comment: 'Bãi ổn, giá theo giờ tiện lợi', date: '25/03/2026' },
      ],
      zones: [
        {
          id: 'zone-a',
          name: 'Khu A',
          spots: [
            { id: 'A001', name: 'A001', status: 'available' },
            { id: 'A002', name: 'A002', status: 'occupied' },
          ],
        },
      ],
    },
  ];

  const currentLot = parkingLots.find(lot => lot.id === selectedLot);
  const currentVehicleType = currentLot?.pricing.allowedVehicles.find(v => v.type === selectedVehicleType);
  const canReserve = currentVehicleType?.canReserve || false;

  const handleSelectLot = (lotId: number) => {
    setSelectedLot(lotId);
    setStep(2);
  };

  const handleSelectVehicleType = (type: string) => {
    setSelectedVehicleType(type);
    setStep(3);
  };

  const handleSelectSpot = (spotId: string) => {
    setSelectedSpot(spotId);
  };

  const handlePayment = () => {
    if (!canReserve) {
      toast.error('Loại xe này không hỗ trợ đặt chỗ trước. Vui lòng thanh toán khi ra bãi.');
      return;
    }

    if (!selectedSpot) {
      toast.error('Vui lòng chọn vị trí đỗ');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error('Vui lòng chọn lịch đỗ');
      return;
    }

    // Check virtual coins
    const userCoins = 500000; // Mock data
    const price = currentVehicleType?.price || 0;

    if (userCoins < price) {
      toast.error('Số dư xu ảo không đủ. Vui lòng nạp thêm!');
      navigate('/owner/topup');
      return;
    }

    setStep(4);
  };

  const handleConfirm = () => {
    toast.success('Đặt chỗ thành công! Hệ thống đã ghi nhận.');
    navigate('/owner');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (step > 1) setStep(step - 1);
                else navigate('/owner');
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl mb-1">Đăng ký đỗ xe</h1>
              <p className="text-emerald-100 text-sm">
                {step === 1 && 'Chọn bãi đỗ'}
                {step === 2 && 'Chọn loại xe'}
                {step === 3 && 'Chọn vị trí & lịch đỗ'}
                {step === 4 && 'Xác nhận thanh toán'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Step 1: Chọn bãi đỗ */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm bãi đỗ theo tên hoặc địa chỉ..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Parking lots list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {parkingLots.map((lot) => (
                <div
                  key={lot.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-emerald-400"
                  onClick={() => handleSelectLot(lot.id)}
                >
                  <div className="relative h-48">
                    <ImageWithFallback
                      src={lot.images[0]}
                      alt={lot.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm shadow-md">
                      <span className="text-emerald-600">{lot.availableSpots}</span>/{lot.totalSpots} chỗ trống
                    </div>
                    {lot.acceptVirtualCoins && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        Hỗ trợ xu ảo
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl text-gray-900 mb-2">{lot.name}</h3>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{lot.address}</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lot.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg">{lot.rating}</span>
                        <span className="text-sm text-gray-500">({lot.reviewCount} đánh giá)</span>
                      </div>
                      <div className="text-sm">
                        {lot.pricing.type === 'hourly' && (
                          <span className="text-orange-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Theo giờ
                          </span>
                        )}
                        {lot.pricing.type === 'fixed' && (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Giá cố định
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {lot.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                          {amenity}
                        </span>
                      ))}
                      {lot.amenities.length > 3 && (
                        <span className="text-xs text-gray-500">+{lot.amenities.length - 3}</span>
                      )}
                    </div>

                    <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2">
                      Chọn bãi này
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Chọn loại xe */}
        {step === 2 && currentLot && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl text-gray-900 mb-2">Chọn loại xe</h2>
              <p className="text-gray-600 mb-6">Các loại xe được phép đỗ tại {currentLot.name}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {currentLot.pricing.allowedVehicles.map((vehicle) => (
                  <button
                    key={vehicle.type}
                    onClick={() => handleSelectVehicleType(vehicle.type)}
                    className="p-6 border-2 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="text-4xl">{vehicle.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg text-gray-900">{vehicle.label}</h3>
                        <p className="text-2xl text-emerald-600">{vehicle.price.toLocaleString()}đ</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      {vehicle.canReserve ? (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle className="w-4 h-4" />
                          Có thể đặt chỗ trước
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-600">
                          <AlertCircle className="w-4 h-4" />
                          Thanh toán theo giờ khi ra
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Lưu ý:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Xe có giá cố định: Có thể đặt chỗ trước và thanh toán bằng xu ảo</li>
                      <li>Xe theo giờ: Không hỗ trợ đặt chỗ, thanh toán khi ra bãi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Chọn vị trí & lịch */}
        {step === 3 && currentLot && currentVehicleType && (
          <div className="max-w-5xl mx-auto space-y-6">
            {!canReserve && (
              <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                  <div>
                    <h3 className="text-lg text-amber-900 mb-1">Không hỗ trợ đặt chỗ trước</h3>
                    <p className="text-amber-700">
                      Loại xe này tính phí theo giờ. Vui lòng đến bãi và thanh toán khi ra.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {canReserve && (
              <>
                {/* Chọn vị trí */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl text-gray-900 mb-6">Chọn vị trí đỗ</h2>
                  
                  {currentLot.zones.map((zone) => (
                    <div key={zone.id} className="mb-6">
                      <h3 className="text-lg text-gray-700 mb-3">{zone.name}</h3>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                        {zone.spots.map((spot) => (
                          <button
                            key={spot.id}
                            onClick={() => spot.status === 'available' && handleSelectSpot(spot.id)}
                            disabled={spot.status !== 'available'}
                            className={`aspect-square rounded-lg text-sm transition-all ${
                              selectedSpot === spot.id
                                ? 'bg-emerald-600 text-white border-2 border-emerald-700'
                                : spot.status === 'available'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-300'
                                : spot.status === 'occupied'
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-yellow-100 text-yellow-700 cursor-not-allowed border-2 border-yellow-300'
                            }`}
                          >
                            {spot.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-4 mt-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
                      <span className="text-gray-600">Trống</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                      <span className="text-gray-600">Đã đỗ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                      <span className="text-gray-600">Đã đặt</span>
                    </div>
                  </div>
                </div>

                {/* Đặt lịch */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl text-gray-900 mb-6 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-emerald-600" />
                    Đặt lịch đỗ xe (Bắt buộc)
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">
                        Ngày đỗ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-gray-700">
                        Giờ đỗ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Thanh toán */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl text-gray-900 mb-6">Thanh toán</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-700">
                      <span>Loại xe:</span>
                      <span>{currentVehicleType.label}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Vị trí:</span>
                      <span>{selectedSpot || 'Chưa chọn'}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Lịch đỗ:</span>
                      <span>
                        {scheduledDate && scheduledTime 
                          ? `${scheduledDate} - ${scheduledTime}`
                          : 'Chưa chọn'
                        }
                      </span>
                    </div>
                    <div className="border-t pt-4 flex justify-between text-xl">
                      <span className="text-gray-900">Tổng cộng:</span>
                      <span className="text-emerald-600">{currentVehicleType.price.toLocaleString()}đ</span>
                    </div>
                  </div>

                  {currentLot.acceptVirtualCoins ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-3">
                        <Coins className="w-6 h-6 text-amber-600" />
                        <div className="flex-1">
                          <p className="text-amber-900">Thanh toán bằng xu ảo</p>
                          <p className="text-sm text-amber-700">Số dư hiện tại: 500,000 xu</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-800 text-sm">
                        Bãi đỗ này không hỗ trợ thanh toán bằng xu ảo. Vui lòng thanh toán bằng tiền mặt hoặc chuyển khoản.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handlePayment}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl hover:shadow-lg transition-all"
                  >
                    Thanh toán & Đặt chỗ
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Xác nhận */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <h2 className="text-3xl text-gray-900 mb-3">Đặt chỗ thành công!</h2>
              <p className="text-gray-600 mb-8">
                Hệ thống đã ghi nhận đặt chỗ của bạn và thông báo cho giám sát viên bãi đỗ.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h3 className="text-lg text-gray-900 mb-4">Thông tin đặt chỗ:</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bãi đỗ:</span>
                    <span className="text-gray-900">{currentLot?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vị trí:</span>
                    <span className="text-gray-900">{selectedSpot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loại xe:</span>
                    <span className="text-gray-900">{currentVehicleType?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lịch đỗ:</span>
                    <span className="text-gray-900">{scheduledDate} - {scheduledTime}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-900">Đã thanh toán:</span>
                    <span className="text-emerald-600">{currentVehicleType?.price.toLocaleString()}đ</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Giám sát viên bãi đỗ đã được thông báo về việc bạn đã thanh toán trước. 
                  Vui lòng đến đúng lịch đã đặt để được hỗ trợ tốt nhất.
                </p>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl hover:shadow-lg transition-all"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
