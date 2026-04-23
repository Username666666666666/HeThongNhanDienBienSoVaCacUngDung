import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Camera, Server, Wifi, AlertCircle, 
  CheckCircle, Search, Plus, Edit, Trash2, Power
} from 'lucide-react';
import { toast } from 'sonner';

interface Device {
  id: string;
  type: 'camera' | 'server' | 'gateway';
  name: string;
  serialNumber: string;
  parkingLot: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  installDate: Date;
  lastMaintenance: Date;
  ipAddress?: string;
}

export const DeviceManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'camera' | 'server' | 'gateway'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'maintenance'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      type: 'camera',
      name: 'Camera cổng vào A1',
      serialNumber: 'CAM-2024-001',
      parkingLot: 'Bãi đỗ xe Hùng Vương',
      location: 'Cổng vào chính',
      status: 'online',
      installDate: new Date('2024-01-15'),
      lastMaintenance: new Date('2026-03-01'),
      ipAddress: '192.168.1.101',
    },
    {
      id: '2',
      type: 'camera',
      name: 'Camera cổng ra A1',
      serialNumber: 'CAM-2024-002',
      parkingLot: 'Bãi đỗ xe Hùng Vương',
      location: 'Cổng ra',
      status: 'online',
      installDate: new Date('2024-01-15'),
      lastMaintenance: new Date('2026-03-01'),
      ipAddress: '192.168.1.102',
    },
    {
      id: '3',
      type: 'server',
      name: 'Server chính HV',
      serialNumber: 'SVR-2024-001',
      parkingLot: 'Bãi đỗ xe Hùng Vương',
      location: 'Phòng kỹ thuật',
      status: 'online',
      installDate: new Date('2024-01-10'),
      lastMaintenance: new Date('2026-02-15'),
      ipAddress: '192.168.1.10',
    },
    {
      id: '4',
      type: 'camera',
      name: 'Camera giám sát sân B',
      serialNumber: 'CAM-2024-003',
      parkingLot: 'Bãi xe Thống Nhất',
      location: 'Sân B - Khu vực B1',
      status: 'offline',
      installDate: new Date('2024-02-01'),
      lastMaintenance: new Date('2026-01-20'),
      ipAddress: '192.168.2.103',
    },
    {
      id: '5',
      type: 'gateway',
      name: 'Gateway vào/ra',
      serialNumber: 'GTW-2024-001',
      parkingLot: 'Bãi đỗ xe Hùng Vương',
      location: 'Cổng chính',
      status: 'maintenance',
      installDate: new Date('2024-01-12'),
      lastMaintenance: new Date('2026-04-10'),
      ipAddress: '192.168.1.50',
    },
  ]);

  const [newDevice, setNewDevice] = useState({
    type: 'camera' as 'camera' | 'server' | 'gateway',
    name: '',
    serialNumber: '',
    parkingLot: '',
    location: '',
    ipAddress: '',
  });

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.parkingLot.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || device.type === filterType;
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'camera':
        return <Camera className="w-6 h-6" />;
      case 'server':
        return <Server className="w-6 h-6" />;
      case 'gateway':
        return <Wifi className="w-6 h-6" />;
      default:
        return <AlertCircle className="w-6 h-6" />;
    }
  };

  const getDeviceTypeInfo = (type: string) => {
    switch (type) {
      case 'camera':
        return { name: 'Camera', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' };
      case 'server':
        return { name: 'Server', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700' };
      case 'gateway':
        return { name: 'Gateway', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' };
      default:
        return { name: type, color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'online':
        return { name: 'Hoạt động', color: 'bg-green-100 text-green-700', icon: '🟢' };
      case 'offline':
        return { name: 'Offline', color: 'bg-red-100 text-red-700', icon: '🔴' };
      case 'maintenance':
        return { name: 'Bảo trì', color: 'bg-yellow-100 text-yellow-700', icon: '🟡' };
      default:
        return { name: status, color: 'bg-gray-100 text-gray-700', icon: '⚪' };
    }
  };

  const handleAddDevice = () => {
    if (!newDevice.name || !newDevice.serialNumber || !newDevice.parkingLot || !newDevice.location) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const device: Device = {
      id: Date.now().toString(),
      type: newDevice.type,
      name: newDevice.name,
      serialNumber: newDevice.serialNumber,
      parkingLot: newDevice.parkingLot,
      location: newDevice.location,
      status: 'online',
      installDate: new Date(),
      lastMaintenance: new Date(),
      ipAddress: newDevice.ipAddress,
    };

    setDevices([...devices, device]);
    setShowAddModal(false);
    setNewDevice({ type: 'camera', name: '', serialNumber: '', parkingLot: '', location: '', ipAddress: '' });
    toast.success('✅ Đã thêm thiết bị mới thành công!');
  };

  const handleDeleteDevice = (id: string) => {
    setDevices(devices.filter((d) => d.id !== id));
    toast.success('🗑️ Đã xóa thiết bị!');
  };

  const handleToggleStatus = (id: string) => {
    setDevices(
      devices.map((d) => {
        if (d.id === id) {
          const newStatus = d.status === 'online' ? 'offline' : 'online';
          return { ...d, status: newStatus };
        }
        return d;
      })
    );
    toast.success('✅ Đã cập nhật trạng thái thiết bị!');
  };

  const stats = {
    total: devices.length,
    online: devices.filter((d) => d.status === 'online').length,
    offline: devices.filter((d) => d.status === 'offline').length,
    maintenance: devices.filter((d) => d.status === 'maintenance').length,
    lent: devices.filter((d) => d.status === 'online' || d.status === 'maintenance').length, // Đang cho mượn
    repairing: devices.filter((d) => d.status === 'maintenance').length, // Đang sửa chữa
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-xl">
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
                <Camera className="w-8 h-8" />
                Quản lý thiết bị
              </h1>
              <p className="text-cyan-100 text-sm">Quản lý camera, server và thiết bị hệ thống</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Stats with Lent & Repairing */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Tổng thiết bị</div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Server className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Đang cho mượn</div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.lent}</div>
            <div className="text-xs text-purple-600 mt-1">
              {((stats.lent / stats.total) * 100).toFixed(0)}% tổng
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Đang hoạt động</div>
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.online}</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Đang sửa chữa</div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.repairing}</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Offline</div>
              <div className="bg-red-100 p-3 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.offline}</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600 text-sm font-semibold">Bảo trì</div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900">{stats.maintenance}</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên, serial, bãi đỗ..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
            >
              <option value="all">Tất cả loại</option>
              <option value="camera">Camera</option>
              <option value="server">Server</option>
              <option value="gateway">Gateway</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="online">Hoạt động</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 font-bold shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Thêm thiết bị mới
          </button>
        </div>

        {/* Devices List */}
        <div className="space-y-4">
          {filteredDevices.map((device) => {
            const typeInfo = getDeviceTypeInfo(device.type);
            const statusInfo = getStatusInfo(device.status);

            return (
              <div
                key={device.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`${typeInfo.bgColor} p-4 rounded-xl`}>
                        <div className={typeInfo.textColor}>{getDeviceIcon(device.type)}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{device.name}</div>
                        <div className="text-sm text-gray-600">SN: {device.serialNumber}</div>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                      {statusInfo.icon} {statusInfo.name}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Loại thiết bị</div>
                      <div className={`${typeInfo.bgColor} ${typeInfo.textColor} px-3 py-1 rounded-full text-sm font-semibold inline-block`}>
                        {typeInfo.name}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Bãi đỗ</div>
                      <div className="font-semibold text-gray-900">{device.parkingLot}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Vị trí</div>
                      <div className="font-semibold text-gray-900">{device.location}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">IP Address</div>
                      <div className="font-mono text-sm text-gray-900">{device.ipAddress || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Ngày lắp đặt</div>
                      <div className="font-semibold text-gray-900">
                        {device.installDate.toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Bảo trì lần cuối</div>
                      <div className="font-semibold text-gray-900">
                        {device.lastMaintenance.toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleToggleStatus(device.id)}
                      className={`flex-1 ${
                        device.status === 'online'
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      } py-3 rounded-xl transition flex items-center justify-center gap-2 font-bold`}
                    >
                      <Power className="w-5 h-5" />
                      {device.status === 'online' ? 'Tắt' : 'Bật'}
                    </button>

                    <button
                      onClick={() => toast.info('🔧 Chức năng chỉnh sửa đang được phát triển')}
                      className="flex-1 bg-blue-100 text-blue-600 hover:bg-blue-200 py-3 rounded-xl transition flex items-center justify-center gap-2 font-bold"
                    >
                      <Edit className="w-5 h-5" />
                      Chỉnh sửa
                    </button>

                    <button
                      onClick={() => handleDeleteDevice(device.id)}
                      className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 py-3 rounded-xl transition flex items-center justify-center gap-2 font-bold"
                    >
                      <Trash2 className="w-5 h-5" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDevices.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy thiết bị</h3>
            <p className="text-gray-600">Thử thay đổi bộ lọc hoặc thêm thiết bị mới</p>
          </div>
        )}
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thêm thiết bị mới</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loại thiết bị</label>
                <select
                  value={newDevice.type}
                  onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value as typeof newDevice.type })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="camera">Camera</option>
                  <option value="server">Server</option>
                  <option value="gateway">Gateway</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên thiết bị</label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  placeholder="VD: Camera cổng vào A1"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Serial Number</label>
                <input
                  type="text"
                  value={newDevice.serialNumber}
                  onChange={(e) => setNewDevice({ ...newDevice, serialNumber: e.target.value })}
                  placeholder="VD: CAM-2024-001"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bãi đỗ</label>
                <input
                  type="text"
                  value={newDevice.parkingLot}
                  onChange={(e) => setNewDevice({ ...newDevice, parkingLot: e.target.value })}
                  placeholder="VD: Bãi đỗ xe Hùng Vương"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vị trí</label>
                <input
                  type="text"
                  value={newDevice.location}
                  onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                  placeholder="VD: Cổng vào chính"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">IP Address (Optional)</label>
                <input
                  type="text"
                  value={newDevice.ipAddress}
                  onChange={(e) => setNewDevice({ ...newDevice, ipAddress: e.target.value })}
                  placeholder="VD: 192.168.1.101"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleAddDevice}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-bold shadow-lg"
              >
                Thêm thiết bị
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};