import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Wrench, Calendar, AlertCircle, CheckCircle, 
  Clock, Building2, Filter, Edit, Save, X 
} from 'lucide-react';
import { toast } from 'sonner';

interface MaintenanceRecord {
  id: string;
  parkingLotName: string;
  deviceType: string;
  deviceId: string;
  lastMaintenance: Date;
  nextMaintenance: Date;
  maintenanceCycle: number; // số tháng
  status: 'upcoming' | 'due' | 'overdue';
  notes: string;
}

export const MaintenanceSchedule = () => {
  const navigate = useNavigate();
  const [filterParkingLot, setFilterParkingLot] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [tempRecord, setTempRecord] = useState<MaintenanceRecord | null>(null);

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([
    {
      id: '1',
      parkingLotName: 'Bãi đỗ xe Hùng Vương',
      deviceType: 'Camera IP',
      deviceId: 'CAM-001',
      lastMaintenance: new Date('2026-01-15'),
      nextMaintenance: new Date('2026-07-15'),
      maintenanceCycle: 6,
      status: 'upcoming',
      notes: 'Kiểm tra định kỳ, vệ sinh ống kính',
    },
    {
      id: '2',
      parkingLotName: 'Bãi đỗ xe Hùng Vương',
      deviceType: 'Barrier Gate',
      deviceId: 'GATE-A01',
      lastMaintenance: new Date('2026-02-01'),
      nextMaintenance: new Date('2026-05-01'),
      maintenanceCycle: 3,
      status: 'due',
      notes: 'Thay dầu động cơ, kiểm tra cảm biến',
    },
    {
      id: '3',
      parkingLotName: 'Bãi xe Thống Nhất',
      deviceType: 'Camera IP',
      deviceId: 'CAM-B02',
      lastMaintenance: new Date('2025-12-01'),
      nextMaintenance: new Date('2026-03-01'),
      maintenanceCycle: 3,
      status: 'overdue',
      notes: 'CẦN BẢO TRÌ GẤP - Camera bị mờ',
    },
    {
      id: '4',
      parkingLotName: 'Bãi xe An Phú',
      deviceType: 'Server',
      deviceId: 'SRV-C01',
      lastMaintenance: new Date('2026-03-01'),
      nextMaintenance: new Date('2026-09-01'),
      maintenanceCycle: 6,
      status: 'upcoming',
      notes: 'Cập nhật phần mềm, sao lưu dữ liệu',
    },
    {
      id: '5',
      parkingLotName: 'Bãi đỗ Minh Khai',
      deviceType: 'Card Reader',
      deviceId: 'CARD-D01',
      lastMaintenance: new Date('2026-01-10'),
      nextMaintenance: new Date('2026-04-10'),
      maintenanceCycle: 3,
      status: 'due',
      notes: 'Vệ sinh đầu đọc, kiểm tra kết nối',
    },
  ]);

  const parkingLots = Array.from(new Set(maintenanceRecords.map(r => r.parkingLotName)));

  const filteredRecords = maintenanceRecords.filter((record) => {
    const matchesParkingLot = filterParkingLot === 'all' || record.parkingLotName === filterParkingLot;
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesParkingLot && matchesStatus;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'upcoming':
        return { 
          name: 'Sắp tới', 
          color: 'bg-blue-100 text-blue-700 border-blue-300',
          icon: <Clock className="w-5 h-5" />
        };
      case 'due':
        return { 
          name: 'Đến hạn', 
          color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
          icon: <AlertCircle className="w-5 h-5" />
        };
      case 'overdue':
        return { 
          name: 'Quá hạn', 
          color: 'bg-red-100 text-red-700 border-red-300',
          icon: <AlertCircle className="w-5 h-5" />
        };
      default:
        return { 
          name: 'Không xác định', 
          color: 'bg-gray-100 text-gray-700 border-gray-300',
          icon: <Clock className="w-5 h-5" />
        };
    }
  };

  const handleEditClick = (record: MaintenanceRecord) => {
    setEditingRecord(record.id);
    setTempRecord({ ...record });
  };

  const handleSave = () => {
    if (!tempRecord) return;

    setMaintenanceRecords(maintenanceRecords.map(r => r.id === tempRecord.id ? tempRecord : r));
    toast.success(`✅ Đã cập nhật lịch bảo trì ${tempRecord.deviceId}!`);
    setEditingRecord(null);
    setTempRecord(null);
  };

  const handleCancel = () => {
    setEditingRecord(null);
    setTempRecord(null);
  };

  const stats = {
    total: maintenanceRecords.length,
    upcoming: maintenanceRecords.filter(r => r.status === 'upcoming').length,
    due: maintenanceRecords.filter(r => r.status === 'due').length,
    overdue: maintenanceRecords.filter(r => r.status === 'overdue').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-xl">
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
                <Wrench className="w-8 h-8" />
                Quản lý chu kỳ bảo trì
              </h1>
              <p className="text-purple-100 text-sm">
                Theo dõi lịch bảo trì thiết bị của từng bãi đỗ
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Tổng thiết bị</div>
              <Wrench className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Sắp tới</div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.upcoming}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Đến hạn</div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-yellow-600">{stats.due}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Quá hạn</div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Bộ lọc</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Bãi đỗ
              </label>
              <select
                value={filterParkingLot}
                onChange={(e) => setFilterParkingLot(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              >
                <option value="all">Tất cả bãi đỗ</option>
                {parkingLots.map(lot => (
                  <option key={lot} value={lot}>{lot}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="upcoming">Sắp tới</option>
                <option value="due">Đến hạn</option>
                <option value="overdue">Quá hạn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Maintenance Records */}
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const statusInfo = getStatusInfo(record.status);
            const isEditing = editingRecord === record.id;
            const displayRecord = isEditing && tempRecord ? tempRecord : record;

            return (
              <div
                key={record.id}
                className={`bg-white rounded-2xl shadow-lg p-6 border-2 transition ${
                  record.status === 'overdue' ? 'border-red-300' : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{displayRecord.deviceType}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border-2 flex items-center gap-1 ${statusInfo.color}`}>
                        {statusInfo.icon}
                        {statusInfo.name}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>🏢 Bãi: <span className="font-semibold">{displayRecord.parkingLotName}</span></div>
                      <div>🔧 Mã thiết bị: <span className="font-semibold">{displayRecord.deviceId}</span></div>
                    </div>
                  </div>

                  {!isEditing && (
                    <button
                      onClick={() => handleEditClick(record)}
                      className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl hover:bg-purple-200 transition flex items-center gap-2 font-semibold"
                    >
                      <Edit className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300">
                    <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Lần bảo trì gần nhất
                    </div>
                    <div className="text-lg font-bold text-blue-700">
                      {displayRecord.lastMaintenance.toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border-2 ${
                    record.status === 'overdue' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'
                  }`}>
                    <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Bảo trì tiếp theo
                    </div>
                    {isEditing ? (
                      <input
                        type="date"
                        value={tempRecord?.nextMaintenance.toISOString().split('T')[0]}
                        onChange={(e) => setTempRecord({ 
                          ...tempRecord!, 
                          nextMaintenance: new Date(e.target.value) 
                        })}
                        className="w-full px-2 py-1 border-2 border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-sm font-bold"
                      />
                    ) : (
                      <div className={`text-lg font-bold ${
                        record.status === 'overdue' ? 'text-red-700' : 'text-yellow-700'
                      }`}>
                        {displayRecord.nextMaintenance.toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </div>

                  <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-300">
                    <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Chu kỳ
                    </div>
                    {isEditing ? (
                      <input
                        type="number"
                        value={tempRecord?.maintenanceCycle || 3}
                        onChange={(e) => setTempRecord({ 
                          ...tempRecord!, 
                          maintenanceCycle: parseInt(e.target.value) || 3 
                        })}
                        className="w-full px-2 py-1 border-2 border-purple-400 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm font-bold"
                      />
                    ) : (
                      <div className="text-lg font-bold text-purple-700">
                        {displayRecord.maintenanceCycle} tháng
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-300">
                  <div className="text-xs text-gray-600 mb-2">📝 Ghi chú:</div>
                  {isEditing ? (
                    <textarea
                      value={tempRecord?.notes || ''}
                      onChange={(e) => setTempRecord({ ...tempRecord!, notes: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm resize-none"
                      rows={2}
                    />
                  ) : (
                    <div className="text-sm text-gray-700">{displayRecord.notes}</div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleCancel}
                      className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2 font-bold"
                    >
                      <X className="w-4 h-4" />
                      Hủy
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 transition flex items-center justify-center gap-2 font-bold shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      Lưu thay đổi
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {filteredRecords.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-gray-200">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <div className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy kết quả</div>
              <div className="text-gray-500">Thử thay đổi bộ lọc</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
