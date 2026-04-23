import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Camera, Check, X, DollarSign, MapPin, Upload,
  Clock, AlertCircle, Video, Coins, BadgeCheck, ArrowLeftRight,
  Users, RefreshCw
} from 'lucide-react';
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

interface GateData {
  scannedData: ScannedVehicle | null;
  selectedSpot: string;
  selectedOwner: string;
  paymentMethod: 'cash' | 'online' | 'coins';
  parkingDuration: { hours: number; minutes: number };
  scanning: boolean;
}

export const DualGateMonitoring = () => {
  const navigate = useNavigate();

  // Camera swap state
  const [cameraSwapped, setCameraSwapped] = useState(false);

  // Separate refs for each gate
  const entryPlateRef = useRef<HTMLInputElement>(null);
  const entryDriverRef = useRef<HTMLInputElement>(null);
  const exitPlateRef = useRef<HTMLInputElement>(null);
  const exitDriverRef = useRef<HTMLInputElement>(null);

  // Entry gate state
  const [entryGate, setEntryGate] = useState<GateData>({
    scannedData: null,
    selectedSpot: '',
    selectedOwner: '',
    paymentMethod: 'cash',
    parkingDuration: { hours: 3, minutes: 30 },
    scanning: false,
  });

  // Exit gate state
  const [exitGate, setExitGate] = useState<GateData>({
    scannedData: null,
    selectedSpot: '',
    selectedOwner: '',
    paymentMethod: 'cash',
    parkingDuration: { hours: 3, minutes: 30 },
    scanning: false,
  });

  const availableSpots = [
    { id: 'A001', zone: 'Sân A', status: 'available' },
    { id: 'A002', zone: 'Sân A', status: 'available' },
    { id: 'A015', zone: 'Sân A', status: 'available' },
    { id: 'B003', zone: 'Sân B', status: 'available' },
    { id: 'B008', zone: 'Sân B', status: 'available' },
    { id: 'B012', zone: 'Sân B', status: 'available' },
  ];

  // Handle Entry Gate - Plate Image
  const handleEntryPlateImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEntryGate((prev) => ({ ...prev, scanning: true }));
        setTimeout(() => {
          const isDuplicate = Math.random() > 0.7;
          setEntryGate((prev) => ({
            ...prev,
            scanning: false,
            scannedData: {
              plateNumber: '30A-' + Math.floor(10000 + Math.random() * 90000),
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
            },
          }));
          toast.success(
            isDuplicate
              ? '⚠️ [Cổng VÀO] Phát hiện trùng biển số!'
              : '✓ [Cổng VÀO] Đã nhận diện biển số!'
          );
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Entry Gate - Driver Image
  const handleEntryDriverImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (entryGate.scannedData) {
          setEntryGate((prev) => ({
            ...prev,
            scannedData: prev.scannedData
              ? { ...prev.scannedData, driverImage: reader.result as string }
              : null,
          }));
          toast.success('✓ [Cổng VÀO] Đã chụp ảnh người lái!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Exit Gate - Plate Image
  const handleExitPlateImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setExitGate((prev) => ({ ...prev, scanning: true }));
        setTimeout(() => {
          setExitGate((prev) => ({
            ...prev,
            scanning: false,
            scannedData: {
              plateNumber: '51F-' + Math.floor(10000 + Math.random() * 90000),
              plateImage: reader.result as string,
              driverImage: '',
            },
          }));
          toast.success('✓ [Cổng RA] Đã nhận diện biển số!');
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Exit Gate - Driver Image
  const handleExitDriverImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (exitGate.scannedData) {
          setExitGate((prev) => ({
            ...prev,
            scannedData: prev.scannedData
              ? { ...prev.scannedData, driverImage: reader.result as string }
              : null,
          }));
          toast.success('✓ [Cổng RA] Đã chụp ảnh người lái!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Confirm Entry
  const handleConfirmEntry = () => {
    if (!entryGate.scannedData) {
      toast.error('❌ [Cổng VÀO] Vui lòng quét biển số xe');
      return;
    }
    if (!entryGate.scannedData.driverImage) {
      toast.error('❌ [Cổng VÀO] Vui lòng chụp ảnh người lái');
      return;
    }
    if (!entryGate.selectedSpot) {
      toast.error('❌ [Cổng VÀO] Vui lòng chọn vị trí đỗ');
      return;
    }
    if (entryGate.scannedData.possibleOwners && !entryGate.selectedOwner) {
      toast.error('❌ [Cổng VÀO] Vui lòng chọn Người dùng đúng');
      return;
    }

    toast.success(
      `✅ Cho xe ${entryGate.scannedData.plateNumber} VÀO bãi - Vị trí ${entryGate.selectedSpot}`,
      { duration: 3000 }
    );

    // Reset entry gate
    setEntryGate({
      scannedData: null,
      selectedSpot: '',
      selectedOwner: '',
      paymentMethod: 'cash',
      parkingDuration: { hours: 3, minutes: 30 },
      scanning: false,
    });
  };

  // Confirm Exit
  const handleConfirmExit = () => {
    if (!exitGate.scannedData) {
      toast.error('❌ [Cổng RA] Vui lòng quét biển số xe');
      return;
    }
    if (!exitGate.scannedData.driverImage) {
      toast.error('❌ [Cổng RA] Vui lòng chụp ảnh người lái');
      return;
    }

    toast.success(`✅ Cho xe ${exitGate.scannedData.plateNumber} RA bãi`, {
      duration: 3000,
    });

    // Reset exit gate
    setExitGate({
      scannedData: null,
      selectedSpot: '',
      selectedOwner: '',
      paymentMethod: 'cash',
      parkingDuration: { hours: 3, minutes: 30 },
      scanning: false,
    });
  };

  const calculateAmount = () => {
    const pricePerHour = 20000;
    return (
      exitGate.parkingDuration.hours * pricePerHour +
      Math.floor((exitGate.parkingDuration.minutes / 60) * pricePerHour)
    );
  };

  // Entry Gate UI
  const renderEntryGate = () => (
    <div className="space-y-4">
      {/* Camera View */}
      <div className="bg-white rounded-xl shadow-md p-4 border-2 border-green-300">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Camera className="w-5 h-5 text-green-600" />
          Camera VÀO
        </h3>
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden border-4 border-green-500">
          {entryGate.scannedData?.plateImage ? (
            <img
              src={entryGate.scannedData.plateImage}
              alt="Entry Plate"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center">
              <Video className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-xs">Camera trực tiếp</p>
            </div>
          )}
          {entryGate.scanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-600/30 backdrop-blur-sm">
              <div className="text-white font-bold animate-pulse">
                🔍 Đang nhận diện...
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            ref={entryPlateRef}
            type="file"
            accept="image/*"
            onChange={handleEntryPlateImage}
            className="hidden"
          />
          <button
            onClick={() => entryPlateRef.current?.click()}
            disabled={entryGate.scanning}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 text-sm font-semibold"
          >
            <Upload className="w-4 h-4 inline mr-1" />
            Biển số
          </button>

          <input
            ref={entryDriverRef}
            type="file"
            accept="image/*"
            onChange={handleEntryDriverImage}
            className="hidden"
          />
          <button
            onClick={() => entryDriverRef.current?.click()}
            disabled={!entryGate.scannedData}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 text-sm font-semibold"
          >
            <Camera className="w-4 h-4 inline mr-1" />
            Người lái
          </button>
        </div>
      </div>

      {/* Duplicate Owner Selection */}
      {entryGate.scannedData?.possibleOwners && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-md p-4 border-2 border-orange-300">
          <div className="flex items-start gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">
                ⚠️ Trùng biển số!
              </h4>
              <p className="text-xs text-gray-600">
                Chọn Người dùng đúng ({entryGate.scannedData.possibleOwners.length} người)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {entryGate.scannedData.possibleOwners.map((owner) => (
              <button
                key={owner.id}
                onClick={() =>
                  setEntryGate((prev) => ({ ...prev, selectedOwner: owner.id }))
                }
                className={`w-full p-3 rounded-lg border-2 transition text-left text-sm ${
                  entryGate.selectedOwner === owner.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900 flex items-center gap-1 text-sm">
                      {owner.name}
                      {entryGate.selectedOwner === owner.id && (
                        <BadgeCheck className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="text-xs text-gray-600">SĐT: {owner.phone}</div>
                    <div className="text-xs text-gray-500">
                      Dùng gần nhất: {owner.lastUsed.toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scanned Info */}
      {entryGate.scannedData && (
        <>
          <div className="bg-white rounded-xl shadow-md p-4">
            <h4 className="font-bold text-gray-900 mb-3 text-sm">Thông tin xe</h4>
            <input
              type="text"
              value={entryGate.scannedData.plateNumber}
              onChange={(e) =>
                setEntryGate((prev) => ({
                  ...prev,
                  scannedData: prev.scannedData
                    ? { ...prev.scannedData, plateNumber: e.target.value }
                    : null,
                }))
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none font-bold text-center mb-3"
            />

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="relative">
                {entryGate.scannedData.plateImage ? (
                  <img
                    src={entryGate.scannedData.plateImage}
                    alt="Plate"
                    className="w-full h-24 object-cover rounded-lg border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Camera className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
                  📷 Biển
                </div>
              </div>
              <div className="relative">
                {entryGate.scannedData.driverImage ? (
                  <img
                    src={entryGate.scannedData.driverImage}
                    alt="Driver"
                    className="w-full h-24 object-cover rounded-lg border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
                  👤 Lái
                </div>
              </div>
            </div>
          </div>

          {/* Parking Spot Selection */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h4 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Chọn vị trí đỗ
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {availableSpots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() =>
                    setEntryGate((prev) => ({ ...prev, selectedSpot: spot.id }))
                  }
                  className={`p-2 rounded-lg border-2 transition text-sm ${
                    entryGate.selectedSpot === spot.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-green-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-gray-900">{spot.id}</div>
                  <div className="text-xs text-gray-500">{spot.zone}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() =>
                setEntryGate({
                  scannedData: null,
                  selectedSpot: '',
                  selectedOwner: '',
                  paymentMethod: 'cash',
                  parkingDuration: { hours: 3, minutes: 30 },
                  scanning: false,
                })
              }
              className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-4 rounded-xl hover:from-red-700 hover:to-pink-700 transition font-bold shadow-lg"
            >
              <X className="w-5 h-5 inline mr-1" />
              TỪ CHỐI
            </button>
            <button
              onClick={handleConfirmEntry}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-bold shadow-lg"
            >
              <Check className="w-5 h-5 inline mr-1" />
              CHO VÀO
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Exit Gate UI
  const renderExitGate = () => (
    <div className="space-y-4">
      {/* Camera View */}
      <div className="bg-white rounded-xl shadow-md p-4 border-2 border-blue-300">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-600" />
          Camera RA
        </h3>
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden border-4 border-blue-500">
          {exitGate.scannedData?.plateImage ? (
            <img
              src={exitGate.scannedData.plateImage}
              alt="Exit Plate"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center">
              <Video className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-xs">Camera trực tiếp</p>
            </div>
          )}
          {exitGate.scanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-600/30 backdrop-blur-sm">
              <div className="text-white font-bold animate-pulse">
                🔍 Đang nhận diện...
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            ref={exitPlateRef}
            type="file"
            accept="image/*"
            onChange={handleExitPlateImage}
            className="hidden"
          />
          <button
            onClick={() => exitPlateRef.current?.click()}
            disabled={exitGate.scanning}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 text-sm font-semibold"
          >
            <Upload className="w-4 h-4 inline mr-1" />
            Biển số
          </button>

          <input
            ref={exitDriverRef}
            type="file"
            accept="image/*"
            onChange={handleExitDriverImage}
            className="hidden"
          />
          <button
            onClick={() => exitDriverRef.current?.click()}
            disabled={!exitGate.scannedData}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 text-sm font-semibold"
          >
            <Camera className="w-4 h-4 inline mr-1" />
            Người lái
          </button>
        </div>
      </div>

      {/* Scanned Info */}
      {exitGate.scannedData && (
        <>
          <div className="bg-white rounded-xl shadow-md p-4">
            <h4 className="font-bold text-gray-900 mb-3 text-sm">Thông tin xe</h4>
            <input
              type="text"
              value={exitGate.scannedData.plateNumber}
              onChange={(e) =>
                setExitGate((prev) => ({
                  ...prev,
                  scannedData: prev.scannedData
                    ? { ...prev.scannedData, plateNumber: e.target.value }
                    : null,
                }))
              }
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-center mb-3"
            />

            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-blue-600 font-medium mb-1">Giờ vào</div>
                <div className="text-gray-900 font-bold">08:30 AM</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-purple-600 font-medium mb-1">Đỗ</div>
                <div className="text-gray-900 font-bold">
                  {exitGate.parkingDuration.hours}h {exitGate.parkingDuration.minutes}p
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-green-600 font-medium mb-1">Vị trí</div>
                <div className="text-gray-900 font-bold">A015</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-orange-300">
                <div className="text-orange-600 font-bold mb-1">💰 Tiền</div>
                <div className="text-orange-700 font-bold">
                  {calculateAmount().toLocaleString()}đ
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h4 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Thanh toán
            </h4>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                onClick={() =>
                  setExitGate((prev) => ({ ...prev, paymentMethod: 'cash' }))
                }
                className={`p-3 rounded-lg border-2 transition ${
                  exitGate.paymentMethod === 'cash'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300 bg-white'
                }`}
              >
                <div className="text-2xl mb-1">💵</div>
                <div className="text-xs font-semibold">Tiền mặt</div>
              </button>
              <button
                onClick={() =>
                  setExitGate((prev) => ({ ...prev, paymentMethod: 'online' }))
                }
                className={`p-3 rounded-lg border-2 transition ${
                  exitGate.paymentMethod === 'online'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300 bg-white'
                }`}
              >
                <div className="text-2xl mb-1">🏦</div>
                <div className="text-xs font-semibold">Chuyển khoản</div>
              </button>
              <button
                onClick={() =>
                  setExitGate((prev) => ({ ...prev, paymentMethod: 'coins' }))
                }
                className={`p-3 rounded-lg border-2 transition ${
                  exitGate.paymentMethod === 'coins'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-300 hover:border-yellow-300 bg-white'
                }`}
              >
                <Coins className="w-8 h-8 text-yellow-600 mx-auto mb-1" />
                <div className="text-xs font-semibold">Xu ảo</div>
              </button>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-lg text-center text-sm">
              <Check className="w-5 h-5 inline mr-1" />
              Đã xác nhận thanh toán
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() =>
                setExitGate({
                  scannedData: null,
                  selectedSpot: '',
                  selectedOwner: '',
                  paymentMethod: 'cash',
                  parkingDuration: { hours: 3, minutes: 30 },
                  scanning: false,
                })
              }
              className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-4 rounded-xl hover:from-red-700 hover:to-pink-700 transition font-bold shadow-lg"
            >
              <X className="w-5 h-5 inline mr-1" />
              HỦY
            </button>
            <button
              onClick={handleConfirmExit}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-bold shadow-lg"
            >
              <Check className="w-5 h-5 inline mr-1" />
              CHO RA
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white shadow-xl">
        <div className="max-w-[1800px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/supervisor')}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold mb-0.5">🚗🚙 Giám sát 2 cổng đồng thời</h1>
                <p className="text-green-100 text-sm">
                  Quản lý cổng VÀO và RA cùng lúc - Tránh nhầm lẫn
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Swap Camera Button */}
              <button
                onClick={() => {
                  setCameraSwapped(!cameraSwapped);
                  toast.success(
                    cameraSwapped ? '📹 Đã đặt lại vị trí camera mặc định' : '🔄 Đã đảo chiều camera'
                  );
                }}
                className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/30 transition flex items-center gap-2"
              >
                <ArrowLeftRight className="w-5 h-5" />
                <span className="font-semibold text-sm">
                  {cameraSwapped ? 'Đặt lại camera' : 'Đảo chiều camera'}
                </span>
              </button>

              {/* Clock */}
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">
                    {new Date().toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Gate Layout */}
      <div className="max-w-[1800px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side */}
          <div className="space-y-4">
            <div
              className={`p-4 rounded-xl shadow-md ${
                cameraSwapped
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600'
              } text-white`}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Video className="w-6 h-6" />
                {cameraSwapped ? '🚙 CỔNG RA (Bên trái)' : '🚗 CỔNG VÀO (Bên trái)'}
              </h2>
              <p className="text-xs mt-1 opacity-90">
                {cameraSwapped
                  ? 'Xử lý xe ra khỏi bãi'
                  : 'Xử lý xe vào bãi và chọn vị trí'}
              </p>
            </div>
            {cameraSwapped ? renderExitGate() : renderEntryGate()}
          </div>

          {/* Right Side */}
          <div className="space-y-4">
            <div
              className={`p-4 rounded-xl shadow-md ${
                cameraSwapped
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              } text-white`}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Video className="w-6 h-6" />
                {cameraSwapped ? '🚗 CỔNG VÀO (Bên phải)' : '🚙 CỔNG RA (Bên phải)'}
              </h2>
              <p className="text-xs mt-1 opacity-90">
                {cameraSwapped
                  ? 'Xử lý xe vào bãi và chọn vị trí'
                  : 'Xử lý xe ra khỏi bãi'}
              </p>
            </div>
            {cameraSwapped ? renderEntryGate() : renderExitGate()}
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl shadow-md p-4 border-2 border-purple-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 mb-1">
                💡 Hướng dẫn sử dụng chế độ 2 cổng
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  • <strong>Màu xanh lá</strong> = Cổng VÀO (nút "CHO VÀO") -{' '}
                  <strong>Màu xanh dương</strong> = Cổng RA (nút "CHO RA")
                </li>
                <li>
                  • Nhấn <strong>"Đảo chiều camera"</strong> để hoán đổi vị trí 2 camera trái/phải
                </li>
                <li>
                  • Mỗi cổng độc lập, xử lý riêng biệt để tránh nhầm lẫn IN/OUT
                </li>
                <li>
                  • Hệ thống tự động phát hiện trùng biển số và yêu cầu chọn Người dùng đúng
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
