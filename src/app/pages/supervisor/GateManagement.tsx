import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Camera, Check, X, DollarSign, MapPin, Upload, Users,
  Clock, AlertCircle, Video, Coins, BadgeCheck
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback.tsx';
import { toast } from 'sonner';

interface ScannedVehicle {
  plateNumber: string;
  plateImage: string;
  driverImage: string;
  possibleOwners?: Array<{
    id: string;
    name: string;
    phone: string;
    lastUsed: Date;
  }>;
}

export const GateManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'entry';

  const plateInputRef = useRef<HTMLInputElement>(null);
  const driverInputRef = useRef<HTMLInputElement>(null);

  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedVehicle | null>(null);
  const [selectedSpot, setSelectedSpot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online' | 'coins'>('cash');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [parkingDuration, setParkingDuration] = useState({ hours: 3, minutes: 30 });

  const availableSpots = [
    { id: 'A001', zone: 'Sân A', status: 'available' },
    { id: 'A002', zone: 'Sân A', status: 'available' },
    { id: 'A015', zone: 'Sân A', status: 'available' },
    { id: 'B003', zone: 'Sân B', status: 'available' },
    { id: 'B008', zone: 'Sân B', status: 'available' },
    { id: 'B012', zone: 'Sân B', status: 'available' },
  ];

  // Handle image selection from device
  const handlePlateImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScanning(true);
        // Simulate OCR processing
        setTimeout(() => {
          // Check for duplicate plate numbers
          const isDuplicate = Math.random() > 0.7; // 30% chance of duplicate
          setScannedData({
            plateNumber: '30A-12345',
            plateImage: reader.result as string,
            driverImage: '',
            possibleOwners: isDuplicate
              ? [
                  {
                    id: '1',
                    name: 'Nguyễn Văn A',
                    phone: '0901234567',
                    lastUsed: new Date('2026-03-28'),
                  },
                  {
                    id: '2',
                    name: 'Trần Thị B',
                    phone: '0902345678',
                    lastUsed: new Date('2026-03-25'),
                  },
                ]
              : undefined,
          });
          setScanning(false);
          toast.success(
            isDuplicate
              ? 'Phát hiện 2 Người dùng cùng biển số! Vui lòng chọn Người dùng đúng.'
              : 'Đã nhận diện biển số thành công!'
          );
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDriverImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (scannedData) {
          setScannedData({
            ...scannedData,
            driverImage: reader.result as string,
          });
          toast.success('Đã chụp ảnh người lái!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmEntry = () => {
    if (!scannedData) {
      toast.error('Vui lòng quét biển số xe');
      return;
    }
    if (!scannedData.driverImage) {
      toast.error('Vui lòng chụp ảnh người lái');
      return;
    }
    if (!selectedSpot) {
      toast.error('Vui lòng chọn vị trí đỗ');
      return;
    }
    if (scannedData.possibleOwners && !selectedOwner) {
      toast.error('Vui lòng chọn Người dùng đúng');
      return;
    }

    toast.success(
      `✅ Đã cho phép xe ${scannedData.plateNumber} vào bãi - Vị trí ${selectedSpot}`,
      { duration: 3000 }
    );
    // Reset form
    setScannedData(null);
    setSelectedSpot('');
    setSelectedOwner('');
  };

  const handleConfirmExit = () => {
    if (!scannedData) {
      toast.error('Vui lòng quét biển số xe');
      return;
    }
    if (!scannedData.driverImage) {
      toast.error('Vui lòng chụp ảnh người lái');
      return;
    }

    toast.success(`✅ Đã cho phép xe ${scannedData.plateNumber} ra bãi`, { duration: 3000 });
    // Reset form
    setScannedData(null);
    setPaymentMethod('cash');
  };

  const calculateAmount = () => {
    const pricePerHour = 20000; // 20k/hour for car
    return parkingDuration.hours * pricePerHour + Math.floor((parkingDuration.minutes / 60) * pricePerHour);
  };

  const renderEntryGate = () => (
    <div className="space-y-6">
      {/* Camera View - Upload Image */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Camera className="w-6 h-6 text-green-600" />
          Camera cổng vào - Nhận diện biển số
        </h3>
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden border-4 border-green-500">
          {scannedData?.plateImage ? (
            <img src={scannedData.plateImage} alt="Scanned Plate" className="w-full h-full object-contain" />
          ) : (
            <div className="text-center">
              <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Camera trực tiếp - Cổng vào</p>
            </div>
          )}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-600/30 backdrop-blur-sm">
              <div className="text-white text-2xl animate-pulse font-bold">
                🔍 Đang nhận diện biển số...
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <input
            ref={plateInputRef}
            type="file"
            accept="image/*"
            onChange={handlePlateImageSelect}
            className="hidden"
          />
          <button
            onClick={() => plateInputRef.current?.click()}
            disabled={scanning}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2 font-semibold shadow-lg"
          >
            <Upload className="w-5 h-5" />
            {scanning ? 'Đang xử lý...' : 'Chọn ảnh biển số'}
          </button>

          <input
            ref={driverInputRef}
            type="file"
            accept="image/*"
            onChange={handleDriverImageSelect}
            className="hidden"
          />
          <button
            onClick={() => driverInputRef.current?.click()}
            disabled={!scannedData}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 font-semibold shadow-lg"
          >
            <Camera className="w-5 h-5" />
            Chụp ảnh người lái
          </button>
        </div>
      </div>

      {/* Duplicate Owner Selection */}
      {scannedData?.possibleOwners && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg p-6 border-2 border-orange-300">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                ⚠️ Phát hiện trùng biển số!
              </h3>
              <p className="text-sm text-gray-600">
                Có {scannedData.possibleOwners.length} Người dùng cùng biển số này. Vui lòng chọn Người dùng đúng dựa trên thông tin người vào bãi.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {scannedData.possibleOwners.map((owner) => (
              <button
                key={owner.id}
                onClick={() => setSelectedOwner(owner.id)}
                className={`w-full p-4 rounded-xl border-2 transition text-left ${
                  selectedOwner === owner.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      {owner.name}
                      {selectedOwner === owner.id && (
                        <BadgeCheck className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600">SĐT: {owner.phone}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Sử dụng gần nhất: {owner.lastUsed.toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scanned Info */}
      {scannedData && (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Thông tin xe</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Biển số đã nhận diện (có thể chỉnh sửa)
                </label>
                <input
                  type="text"
                  value={scannedData.plateNumber}
                  onChange={(e) =>
                    setScannedData({ ...scannedData, plateNumber: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-xl font-bold text-center"
                  placeholder="Chỉnh sửa nếu sai"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  {scannedData.plateImage ? (
                    <img
                      src={scannedData.plateImage}
                      alt="Plate"
                      className="w-full h-40 object-cover rounded-xl border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 rounded-xl flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full font-semibold">
                    📷 Biển số xe
                  </div>
                </div>
                <div className="relative">
                  {scannedData.driverImage ? (
                    <img
                      src={scannedData.driverImage}
                      alt="Driver"
                      className="w-full h-40 object-cover rounded-xl border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 rounded-xl flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full font-semibold">
                    👤 Người lái xe
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Parking Spot Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              Chọn vị trí đỗ
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {availableSpots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => setSelectedSpot(spot.id)}
                  className={`p-4 rounded-xl border-2 transition ${
                    selectedSpot === spot.id
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-300 hover:border-green-300 bg-white'
                  }`}
                >
                  <div className="text-lg font-bold text-gray-900">{spot.id}</div>
                  <div className="text-xs text-gray-500">{spot.zone}</div>
                  {selectedSpot === spot.id && (
                    <div className="mt-2">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setScannedData(null);
                setSelectedSpot('');
                setSelectedOwner('');
              }}
              className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-5 rounded-xl hover:from-red-700 hover:to-pink-700 transition flex items-center justify-center gap-2 font-bold text-lg shadow-lg"
            >
              <X className="w-6 h-6" />
              Từ chối
            </button>
            <button
              onClick={handleConfirmEntry}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 font-bold text-lg shadow-lg"
            >
              <Check className="w-6 h-6" />
              Xác nhận vào
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderExitGate = () => (
    <div className="space-y-6">
      {/* Camera View - Upload Image */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Camera className="w-6 h-6 text-blue-600" />
          Camera cổng ra - Nhận diện biển số
        </h3>
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden border-4 border-blue-500">
          {scannedData?.plateImage ? (
            <img src={scannedData.plateImage} alt="Scanned Plate" className="w-full h-full object-contain" />
          ) : (
            <div className="text-center">
              <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Camera trực tiếp - Cổng ra</p>
            </div>
          )}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-600/30 backdrop-blur-sm">
              <div className="text-white text-2xl animate-pulse font-bold">
                🔍 Đang nhận diện biển số...
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <input
            ref={plateInputRef}
            type="file"
            accept="image/*"
            onChange={handlePlateImageSelect}
            className="hidden"
          />
          <button
            onClick={() => plateInputRef.current?.click()}
            disabled={scanning}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 font-semibold shadow-lg"
          >
            <Upload className="w-5 h-5" />
            {scanning ? 'Đang xử lý...' : 'Chọn ảnh biển số'}
          </button>

          <input
            ref={driverInputRef}
            type="file"
            accept="image/*"
            onChange={handleDriverImageSelect}
            className="hidden"
          />
          <button
            onClick={() => driverInputRef.current?.click()}
            disabled={!scannedData}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 flex items-center justify-center gap-2 font-semibold shadow-lg"
          >
            <Camera className="w-5 h-5" />
            Chụp ảnh người lái
          </button>
        </div>
      </div>

      {/* Scanned Info */}
      {scannedData && (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Thông tin xe</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Biển số</label>
                <input
                  type="text"
                  value={scannedData.plateNumber}
                  onChange={(e) =>
                    setScannedData({ ...scannedData, plateNumber: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xl font-bold text-center"
                />
              </div>

              {/* Time and duration info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-blue-600 font-medium mb-1">Giờ vào</div>
                  <div className="text-gray-900 font-bold text-lg">08:30 AM</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="text-purple-600 font-medium mb-1">Thời gian đỗ</div>
                  <div className="text-gray-900 font-bold text-lg">
                    {parkingDuration.hours}h {parkingDuration.minutes}p
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="text-green-600 font-medium mb-1">Vị trí</div>
                  <div className="text-gray-900 font-bold text-lg">A015</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-orange-300">
                  <div className="text-orange-600 font-bold mb-1">💰 Tổng tiền</div>
                  <div className="text-orange-700 font-bold text-2xl">
                    {calculateAmount().toLocaleString()}đ
                  </div>
                </div>
              </div>

              {/* Comparison images: Entry vs Exit */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">So sánh ảnh vào - ra</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="relative">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1774576670116-a21417528d54?w=200"
                      alt="Entry Plate"
                      className="w-full h-32 object-cover rounded-xl border-2 border-green-300"
                    />
                    <div className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      ✓ Vào - Biển
                    </div>
                  </div>
                  <div className="relative">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200"
                      alt="Entry Driver"
                      className="w-full h-32 object-cover rounded-xl border-2 border-green-300"
                    />
                    <div className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      ✓ Vào - Lái
                    </div>
                  </div>
                  <div className="relative">
                    {scannedData.plateImage ? (
                      <img
                        src={scannedData.plateImage}
                        alt="Exit Plate"
                        className="w-full h-32 object-cover rounded-xl border-2 border-blue-300"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 rounded-xl" />
                    )}
                    <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      → Ra - Biển
                    </div>
                  </div>
                  <div className="relative">
                    {scannedData.driverImage ? (
                      <img
                        src={scannedData.driverImage}
                        alt="Exit Driver"
                        className="w-full h-32 object-cover rounded-xl border-2 border-blue-300"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 rounded-xl" />
                    )}
                    <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      → Ra - Lái
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Thanh toán
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-5 rounded-xl border-2 transition ${
                  paymentMethod === 'cash'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-300 hover:border-green-300 bg-white'
                }`}
              >
                <div className="text-4xl mb-2">💵</div>
                <div className="font-semibold">Tiền mặt</div>
              </button>
              <button
                onClick={() => setPaymentMethod('online')}
                className={`p-5 rounded-xl border-2 transition ${
                  paymentMethod === 'online'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-300 hover:border-blue-300 bg-white'
                }`}
              >
                <div className="text-4xl mb-2">🏦</div>
                <div className="font-semibold">Chuyển khoản</div>
              </button>
              <button
                onClick={() => setPaymentMethod('coins')}
                className={`p-5 rounded-xl border-2 transition ${
                  paymentMethod === 'coins'
                    ? 'border-yellow-500 bg-yellow-50 shadow-md'
                    : 'border-gray-300 hover:border-yellow-300 bg-white'
                }`}
              >
                <div className="text-4xl mb-2">
                  <Coins className="w-10 h-10 text-yellow-600 mx-auto" />
                </div>
                <div className="font-semibold">Xu ảo</div>
              </button>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-5 rounded-xl text-center shadow-lg">
              <div className="flex items-center justify-center gap-2 text-xl font-bold">
                <Check className="w-6 h-6" />
                Đã xác nhận thanh toán
              </div>
              <div className="text-sm mt-2 text-green-100">
                {paymentMethod === 'cash'
                  ? '💵 Tiền mặt'
                  : paymentMethod === 'online'
                  ? '🏦 Chuyển khoản'
                  : `🪙 ${(calculateAmount() / 1000).toLocaleString()} xu ảo`}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setScannedData(null)}
              className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-5 rounded-xl hover:from-red-700 hover:to-pink-700 transition flex items-center justify-center gap-2 font-bold text-lg shadow-lg"
            >
              <X className="w-6 h-6" />
              Hủy
            </button>
            <button
              onClick={handleConfirmExit}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 font-bold text-lg shadow-lg"
            >
              <Check className="w-6 h-6" />
              Cho ra bãi
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderBothGates = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Video className="w-6 h-6" />
            Cổng vào
          </h3>
        </div>
        {renderEntryGate()}
      </div>
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Video className="w-6 h-6" />
            Cổng ra
          </h3>
        </div>
        {renderExitGate()}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/supervisor')}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl mb-1 tracking-tight">
                {mode === 'entry' ? '🚗 Cổng vào' : mode === 'exit' ? '🚙 Cổng ra' : '🚗🚙 Cả hai cổng'}
              </h1>
              <p className="text-green-100 text-sm">Quản lý phương tiện ra vào bãi</p>
            </div>
            <div className="ml-auto">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">{new Date().toLocaleTimeString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {mode === 'entry' && renderEntryGate()}
        {mode === 'exit' && renderExitGate()}
        {mode === 'both' && renderBothGates()}
      </div>
    </div>
  );
};
