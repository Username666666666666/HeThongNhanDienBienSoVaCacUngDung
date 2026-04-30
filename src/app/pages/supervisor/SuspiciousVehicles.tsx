import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Car,
  Clock,
  MapPin,
  Phone,
  User,
  Flag,
  History,
  CheckCircle,
  XCircle,
  Calendar,
  Camera,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback.tsx';

interface SuspiciousVehicle {
  id: string;
  plateNumber: string;
  ownerName: string;
  ownerPhone: string;
  parkingSpot: string;
  zone: string;
  entryTime: Date;
  daysParked: number;
  entryPhoto: string;
  driverPhoto: string;
  status: 'warning' | 'suspicious';
  lastChecked?: Date;
  notes?: string;
}

export const SuspiciousVehicles = () => {
  const navigate = useNavigate();
  // Track pending timeouts for cleanup
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const [vehicles, setVehicles] = useState<SuspiciousVehicle[]>([
    {
      id: '1',
      plateNumber: '30A-12345',
      ownerName: 'Nguyễn Văn A',
      ownerPhone: '0901234567',
      parkingSpot: 'A015',
      zone: 'Sân A',
      entryTime: new Date('2026-03-29T08:30:00'),
      daysParked: 7,
      entryPhoto: 'https://images.unsplash.com/photo-1774576670116-a21417528d54?w=400',
      driverPhoto: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400',
      status: 'suspicious',
      lastChecked: new Date('2026-04-02T10:00:00'),
      notes: 'Đã liên hệ Người dùng nhưng không nghe máy',
    },
    {
      id: '2',
      plateNumber: '51F-67890',
      ownerName: 'Trần Thị B',
      ownerPhone: '0902345678',
      parkingSpot: 'B008',
      zone: 'Sân B',
      entryTime: new Date('2026-04-01T14:20:00'),
      daysParked: 4,
      entryPhoto: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
      driverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      status: 'suspicious',
    },
    {
      id: '3',
      plateNumber: '29B-11111',
      ownerName: 'Lê Văn C',
      ownerPhone: '0903456789',
      parkingSpot: 'A001',
      zone: 'Sân A',
      entryTime: new Date('2026-04-02T09:15:00'),
      daysParked: 3.2,
      entryPhoto: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400',
      driverPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      status: 'warning',
    },
  ]);

  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Cleanup timeouts on component unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const handleMarkAsFlagged = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (vehicle) {
      toast.success(`🚩 Đã đánh dấu xe ${vehicle.plateNumber} vào vùng nghi ngờ`, {
        duration: 3000,
      });
      // In real app, would move to suspicious history
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
    }
  };

  const handleContactOwner = (vehicle: SuspiciousVehicle) => {
    toast.info(`📞 Đang gọi cho ${vehicle.ownerName} - ${vehicle.ownerPhone}...`);
    const timeout = setTimeout(() => {
      toast.success(`✓ Đã ghi nhận cuộc gọi với ${vehicle.ownerName}`);
    }, 1500);
    timeoutRefs.current.push(timeout);
  };

  const handleAddNote = () => {
    if (!selectedVehicle || !noteInput.trim()) {
      toast.error('Vui lòng nhập ghi chú');
      return;
    }

    setVehicles((prev) =>
      prev.map((v) =>
        v.id === selectedVehicle
          ? {
              ...v,
              notes: noteInput,
              lastChecked: new Date(),
            }
          : v
      )
    );

    toast.success('✓ Đã lưu ghi chú');
    setNoteInput('');
    setShowNoteModal(false);
    setSelectedVehicle(null);
  };

  const handleResolve = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (vehicle) {
      toast.success(`✅ Đã xác nhận xe ${vehicle.plateNumber} không có vấn đề`, {
        duration: 3000,
      });
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
    }
  };

  const suspiciousCount = vehicles.filter((v) => v.status === 'suspicious').length;
  const warningCount = vehicles.filter((v) => v.status === 'warning').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/supervisor')}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl mb-1 flex items-center gap-3">
                <AlertTriangle className="w-8 h-8" />
                Xe nghi ngờ (Đỗ quá 3 ngày)
              </h1>
              <p className="text-orange-100 text-sm">
                Theo dõi và quản lý các xe đỗ lâu ngày trong bãi
              </p>
            </div>
            <button
              onClick={() => navigate('/supervisor/suspicious-history')}
              className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl hover:bg-white/30 transition flex items-center gap-2"
            >
              <History className="w-5 h-5" />
              <span className="font-semibold">Lịch sử xe nghi ngờ</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-red-100 text-sm mb-1">Nghi ngờ cao</div>
                <div className="text-4xl font-bold">{suspiciousCount}</div>
              </div>
              <Flag className="w-12 h-12 text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-yellow-500 text-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-orange-100 text-sm mb-1">Cảnh báo</div>
                <div className="text-4xl font-bold">{warningCount}</div>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-100 text-sm mb-1">Tổng xe</div>
                <div className="text-4xl font-bold">{vehicles.length}</div>
              </div>
              <Car className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Vehicles List */}
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${
                vehicle.status === 'suspicious'
                  ? 'border-red-300'
                  : 'border-orange-300'
              }`}
            >
              <div
                className={`p-4 ${
                  vehicle.status === 'suspicious'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500'
                    : 'bg-gradient-to-r from-orange-500 to-yellow-500'
                } text-white`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {vehicle.status === 'suspicious' ? (
                      <Flag className="w-6 h-6" />
                    ) : (
                      <AlertTriangle className="w-6 h-6" />
                    )}
                    <div>
                      <div className="text-2xl font-bold">{vehicle.plateNumber}</div>
                      <div className="text-sm opacity-90">
                        {vehicle.status === 'suspicious'
                          ? '🚨 Nghi ngờ cao'
                          : '⚠️ Cảnh báo'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{Math.floor(vehicle.daysParked)}</div>
                    <div className="text-sm opacity-90">ngày đỗ</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Owner Info */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Thông tin Người dùng
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">{vehicle.ownerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{vehicle.ownerPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {vehicle.parkingSpot} - {vehicle.zone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          Vào: {vehicle.entryTime.toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleContactOwner(vehicle)}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 font-semibold"
                    >
                      <Phone className="w-4 h-4" />
                      Liên hệ Người dùng
                    </button>
                  </div>

                  {/* Photos */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <Camera className="w-5 h-5 text-purple-600" />
                      Ảnh khi vào bãi
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <ImageWithFallback
                          src={vehicle.entryPhoto}
                          alt="Entry Plate"
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                        />
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          📷 Biển số
                        </div>
                      </div>
                      <div className="relative">
                        <ImageWithFallback
                          src={vehicle.driverPhoto}
                          alt="Entry Driver"
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                        />
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          👤 Người lái
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Actions */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-600" />
                      Ghi chú
                    </h4>
                    {vehicle.notes ? (
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 border-2 border-gray-200">
                        {vehicle.notes}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-400 italic border-2 border-gray-200">
                        Chưa có ghi chú
                      </div>
                    )}
                    {vehicle.lastChecked && (
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Kiểm tra lần cuối:{' '}
                        {vehicle.lastChecked.toLocaleString('vi-VN')}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSelectedVehicle(vehicle.id);
                        setNoteInput(vehicle.notes || '');
                        setShowNoteModal(true);
                      }}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition flex items-center justify-center gap-2 font-semibold"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {vehicle.notes ? 'Sửa ghi chú' : 'Thêm ghi chú'}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleResolve(vehicle.id)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 font-bold shadow-lg"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Xác nhận OK
                  </button>

                  <button
                    onClick={() => handleMarkAsFlagged(vehicle.id)}
                    className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-xl hover:from-red-700 hover:to-pink-700 transition flex items-center justify-center gap-2 font-bold shadow-lg"
                  >
                    <Flag className="w-5 h-5" />
                    Đánh dấu nghi ngờ
                  </button>

                  <button
                    onClick={() =>
                      toast.info('Chức năng báo cáo lên admin đang được phát triển')
                    }
                    className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white py-3 rounded-xl hover:from-orange-700 hover:to-yellow-700 transition flex items-center justify-center gap-2 font-bold shadow-lg"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    Báo cáo Admin
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {vehicles.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Không có xe nghi ngờ
            </h3>
            <p className="text-gray-600">
              Tất cả xe trong bãi đều trong thời gian đỗ bình thường
            </p>
          </div>
        )}

        {/* Info Panel */}
        <div className="mt-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl shadow-md p-6 border-2 border-blue-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                📋 Tiêu chí xe nghi ngờ
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  • <strong className="text-orange-600">Cảnh báo (3-5 ngày):</strong>{' '}
                  Xe đỗ quá 3 ngày, cần theo dõi
                </li>
                <li>
                  • <strong className="text-red-600">Nghi ngờ cao (trên 5 ngày):</strong>{' '}
                  Xe đỗ quá 5 ngày, cần liên hệ Người dùng hoặc báo cáo
                </li>
                <li>
                  • Hệ thống tự động cập nhật danh sách mỗi ngày lúc 6:00 sáng
                </li>
                <li>
                  • Có thể thêm ghi chú, liên hệ Người dùng, hoặc đánh dấu vào vùng nghi ngờ
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
              Thêm ghi chú
            </h3>

            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Nhập ghi chú về xe này..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none h-32"
            />

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setSelectedVehicle(null);
                  setNoteInput('');
                }}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition flex items-center justify-center gap-2 font-bold"
              >
                <XCircle className="w-5 h-5" />
                Hủy
              </button>
              <button
                onClick={handleAddNote}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition flex items-center justify-center gap-2 font-bold"
              >
                <CheckCircle className="w-5 h-5" />
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
