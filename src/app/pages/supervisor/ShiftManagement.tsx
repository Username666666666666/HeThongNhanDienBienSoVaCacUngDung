import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, Play, Square, User, Calendar, MapPin,
  CheckCircle, AlertTriangle, List
} from 'lucide-react';
import { toast } from 'sonner';
import type { ShiftRecord } from '../../types/community.ts';

export const ShiftManagement = () => {
  const navigate = useNavigate();
  const [activeShift, setActiveShift] = useState<ShiftRecord | null>(null);
  const [showStartShift, setShowStartShift] = useState(false);
  const [selectedZone, setSelectedZone] = useState('');

  const currentSupervisor = {
    id: 'sup1',
    name: 'Nguyễn Văn X',
    parkingLotCode: 'PL001',
  };

  const zones = ['Cổng A - Vào', 'Cổng B - Ra', 'Cổng C - Vào/Ra'];

  const [shifts, setShifts] = useState<ShiftRecord[]>([
    {
      id: 'shift1',
      supervisorId: 'sup2',
      supervisorName: 'Trần Thị Y',
      parkingLotCode: 'PL001',
      zone: 'Cổng A - Vào',
      shiftStart: new Date('2026-03-31T06:00:00'),
      shiftEnd: new Date('2026-03-31T14:00:00'),
      status: 'completed',
      vehicleEntries: 45,
      vehicleExits: 0,
      incidents: [],
    },
    {
      id: 'shift2',
      supervisorId: 'sup3',
      supervisorName: 'Lê Văn Z',
      parkingLotCode: 'PL001',
      zone: 'Cổng B - Ra',
      shiftStart: new Date('2026-03-31T14:00:00'),
      shiftEnd: new Date('2026-03-31T22:00:00'),
      status: 'completed',
      vehicleEntries: 0,
      vehicleExits: 38,
      incidents: ['Trễ giờ 15 phút'],
    },
  ]);

  const handleStartShift = () => {
    if (!selectedZone) {
      toast.error('Vui lòng chọn ca làm việc');
      return;
    }

    const newShift: ShiftRecord = {
      id: `shift${Date.now()}`,
      supervisorId: currentSupervisor.id,
      supervisorName: currentSupervisor.name,
      parkingLotCode: currentSupervisor.parkingLotCode,
      zone: selectedZone,
      shiftStart: new Date(),
      status: 'active',
      vehicleEntries: 0,
      vehicleExits: 0,
      incidents: [],
    };

    setActiveShift(newShift);
    setShifts([newShift, ...shifts]);
    setShowStartShift(false);
    toast.success('Đã bắt đầu ca trực');
  };

  const handleEndShift = () => {
    if (!activeShift) return;

    const updatedShift = {
      ...activeShift,
      shiftEnd: new Date(),
      status: 'completed' as const,
    };

    setShifts(shifts.map(s => s.id === activeShift.id ? updatedShift : s));
    setActiveShift(null);
    toast.success('Đã kết thúc ca trực');
  };

  const calculateShiftDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const diff = endTime.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/supervisor')}
              className="p-2 hover:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl mb-1 flex items-center gap-2">
                <Clock className="w-7 h-7" />
                Quản lý Ca trực
              </h1>
              <p className="text-green-100 text-sm">Theo dõi thời gian và trách nhiệm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Active Shift Card */}
        {activeShift ? (
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-8 mb-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-100">Ca đang hoạt động</span>
                </div>
                <h2 className="text-3xl mb-2">{activeShift.zone}</h2>
                <p className="text-green-100">
                  Bắt đầu: {new Date(activeShift.shiftStart).toLocaleString('vi-VN')}
                </p>
              </div>
              <button
                onClick={handleEndShift}
                className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl transition-all flex items-center gap-2"
              >
                <Square className="w-5 h-5" />
                Kết thúc ca
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-green-100 mb-1">Thời gian</p>
                <p className="text-2xl">{calculateShiftDuration(activeShift.shiftStart)}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-green-100 mb-1">Xe vào</p>
                <p className="text-2xl">{activeShift.vehicleEntries}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-green-100 mb-1">Xe ra</p>
                <p className="text-2xl">{activeShift.vehicleExits}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 mb-8 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-gray-900 mb-2">Chưa có ca trực nào đang hoạt động</h3>
            <p className="text-gray-600 mb-6">Nhấn nút bên dưới để bắt đầu ca trực mới</p>
            <button
              onClick={() => setShowStartShift(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
            >
              <Play className="w-5 h-5" />
              Bắt đầu giám sát
            </button>
          </div>
        )}

        {/* Shift History */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h3 className="text-lg text-gray-900 flex items-center gap-2">
              <List className="w-5 h-5 text-green-600" />
              Lịch sử ca trực
            </h3>
          </div>

          <div className="divide-y">
            {shifts.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có ca trực nào</p>
              </div>
            ) : (
              shifts.map((shift) => (
                <div key={shift.id} className="p-6 hover:bg-gray-50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        shift.status === 'active'
                          ? 'bg-green-100'
                          : shift.incidents.length > 0
                          ? 'bg-yellow-100'
                          : 'bg-gray-100'
                      }`}>
                        {shift.status === 'active' ? (
                          <Clock className="w-6 h-6 text-green-600" />
                        ) : shift.incidents.length > 0 ? (
                          <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        ) : (
                          <CheckCircle className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-gray-900">{shift.supervisorName}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            shift.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {shift.status === 'active' ? 'Đang hoạt động' : 'Đã hoàn thành'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          {shift.zone}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>{new Date(shift.shiftStart).toLocaleString('vi-VN')}</span>
                          {shift.shiftEnd && (
                            <>
                              <span className="mx-2">→</span>
                              <span>{new Date(shift.shiftEnd).toLocaleString('vi-VN')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Thời gian làm việc</p>
                      <p className="text-lg text-gray-900">
                        {calculateShiftDuration(shift.shiftStart, shift.shiftEnd)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 mb-1">Xe vào</p>
                      <p className="text-xl text-blue-900">{shift.vehicleEntries}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-purple-600 mb-1">Xe ra</p>
                      <p className="text-xl text-purple-900">{shift.vehicleExits}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-orange-600 mb-1">Sự cố</p>
                      <p className="text-xl text-orange-900">{shift.incidents.length}</p>
                    </div>
                  </div>

                  {shift.incidents.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 mb-2">Ghi chú sự cố:</p>
                      <ul className="text-sm text-yellow-700 list-disc list-inside">
                        {shift.incidents.map((incident, i) => (
                          <li key={i}>{incident}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Start Shift Modal */}
      {showStartShift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-gray-900">Bắt đầu ca trực</h2>
              <button
                onClick={() => setShowStartShift(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-700 mb-3">
                Chọn ca làm việc
              </label>
              <div className="space-y-2">
                {zones.map((zone) => (
                  <button
                    key={zone}
                    onClick={() => setSelectedZone(zone)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedZone === zone
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedZone === zone ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <MapPin className={`w-5 h-5 ${
                          selectedZone === zone ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">{zone}</p>
                        <p className="text-sm text-gray-500">Theo dõi xe {zone.includes('Vào') ? 'vào' : 'ra'} bãi</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Ca trực sẽ được ghi nhận để tra cứu trách nhiệm khi có sự cố mất cắp hoặc tranh chấp.
              </p>
            </div>

            <button
              onClick={handleStartShift}
              disabled={!selectedZone}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Bắt đầu giám sát
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
