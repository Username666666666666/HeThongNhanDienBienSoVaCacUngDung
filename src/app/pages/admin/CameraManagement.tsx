import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Eye, Shield, Search, Plus, X, Clock, User } from 'lucide-react';
import { toast } from 'sonner';

interface CameraLocation {
  id: string;
  name: string;
  zone: string;
  status: 'online' | 'offline';
  streamUrl: string;
}

interface CameraPermission {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: 'supervisor' | 'support';
  cameras: string[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  reason: string;
}

export const CameraManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'cameras' | 'permissions' | 'logs'>('cameras');
  const [showGrantPermission, setShowGrantPermission] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);
  const [reason, setReason] = useState('');

  const cameras: CameraLocation[] = [
    { id: 'cam1', name: 'Camera Cổng chính', zone: 'Lối vào', status: 'online', streamUrl: 'stream1' },
    { id: 'cam2', name: 'Camera Khu A', zone: 'Khu vực A', status: 'online', streamUrl: 'stream2' },
    { id: 'cam3', name: 'Camera Khu B', zone: 'Khu vực B', status: 'online', streamUrl: 'stream3' },
    { id: 'cam4', name: 'Camera Khu C', zone: 'Khu vực C', status: 'offline', streamUrl: 'stream4' },
    { id: 'cam5', name: 'Camera Cổng ra', zone: 'Lối ra', status: 'online', streamUrl: 'stream5' },
  ];

  const staff = [
    { id: 'sup1', name: 'Giám sát viên A', role: 'supervisor' as const },
    { id: 'sup2', name: 'Giám sát viên B', role: 'supervisor' as const },
    { id: 'support1', name: 'Nhân viên hỗ trợ C', role: 'support' as const },
  ];

  const [permissions, setPermissions] = useState<CameraPermission[]>([
    {
      id: 'perm1',
      staffId: 'sup1',
      staffName: 'Giám sát viên A',
      staffRole: 'supervisor',
      cameras: ['cam1', 'cam2', 'cam3'],
      grantedBy: 'Admin Nguyễn',
      grantedAt: new Date('2026-04-15T09:00:00'),
      reason: 'Giám sát ca sáng khu A, B',
    },
  ]);

  const [accessLogs, setAccessLogs] = useState([
    {
      id: 'log1',
      staffName: 'Giám sát viên A',
      cameraName: 'Camera Khu A',
      accessTime: new Date('2026-04-16T08:30:00'),
      duration: '45 phút',
    },
    {
      id: 'log2',
      staffName: 'Giám sát viên A',
      cameraName: 'Camera Cổng chính',
      accessTime: new Date('2026-04-16T10:15:00'),
      duration: '20 phút',
    },
  ]);

  const handleGrantPermission = () => {
    if (!selectedStaff || selectedCameras.length === 0 || !reason.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const staffInfo = staff.find(s => s.id === selectedStaff);
    if (!staffInfo) return;

    const newPermission: CameraPermission = {
      id: `perm${Date.now()}`,
      staffId: selectedStaff,
      staffName: staffInfo.name,
      staffRole: staffInfo.role,
      cameras: selectedCameras,
      grantedBy: 'Admin Nguyễn',
      grantedAt: new Date(),
      reason: reason,
    };

    setPermissions([...permissions, newPermission]);
    setShowGrantPermission(false);
    setSelectedStaff('');
    setSelectedCameras([]);
    setReason('');
    toast.success('✅ Đã cấp quyền xem camera');
  };

  const handleRevokePermission = (permId: string) => {
    setPermissions(permissions.filter(p => p.id !== permId));
    toast.success('🚫 Đã thu hồi quyền xem camera');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-xl transition">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Camera className="w-8 h-8" />
                  Quản lý Camera
                </h1>
                <p className="text-blue-100 text-sm mt-1">Giám sát & cấp phép truy cập</p>
              </div>
            </div>
            <button
              onClick={() => setShowGrantPermission(true)}
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl flex items-center gap-2 transition font-bold shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Cấp quyền
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 p-2 flex gap-2">
          <button
            onClick={() => setActiveTab('cameras')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition ${
              activeTab === 'cameras'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📹 Danh sách Camera
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition ${
              activeTab === 'permissions'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🔐 Quyền truy cập
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition ${
              activeTab === 'logs'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Lịch sử truy cập
          </button>
        </div>

        {/* Cameras Tab */}
        {activeTab === 'cameras' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cameras.map((cam) => (
              <div key={cam.id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Camera className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{cam.name}</h3>
                      <p className="text-sm text-gray-500">{cam.zone}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    cam.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {cam.status === 'online' ? '🟢 Online' : '🔴 Offline'}
                  </div>
                </div>

                <div className="bg-gray-900 rounded-xl aspect-video flex items-center justify-center mb-4">
                  {cam.status === 'online' ? (
                    <div className="text-white text-center">
                      <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-70">Live Stream</p>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center">
                      <Camera className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Offline</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/admin/camera-view/${cam.id}`)}
                  disabled={cam.status === 'offline'}
                  className={`w-full py-3 rounded-xl font-bold transition ${
                    cam.status === 'online'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Eye className="w-4 h-4 inline mr-2" />
                  Xem trực tiếp
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="space-y-4">
            {permissions.map((perm) => (
              <div key={perm.id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-6 h-6 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-900">{perm.staffName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        perm.staffRole === 'supervisor' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {perm.staffRole === 'supervisor' ? 'Giám sát' : 'Hỗ trợ'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>📅 Cấp phép: {perm.grantedAt.toLocaleString('vi-VN')}</div>
                      <div>👤 Người cấp: {perm.grantedBy}</div>
                      <div>📝 Lý do: {perm.reason}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokePermission(perm.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl font-bold transition"
                  >
                    Thu hồi
                  </button>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="font-bold text-blue-900 mb-2">Camera được phép xem:</div>
                  <div className="flex flex-wrap gap-2">
                    {perm.cameras.map((camId) => {
                      const cam = cameras.find(c => c.id === camId);
                      return cam ? (
                        <span key={camId} className="bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 border border-blue-200">
                          📹 {cam.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            ))}

            {permissions.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-bold text-gray-700 mb-2">Chưa có quyền truy cập nào</p>
                <p className="text-gray-500">Nhấn "Cấp quyền" để thêm quyền xem camera cho nhân viên</p>
              </div>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Nhân viên</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Camera</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Thời gian truy cập</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Thời lượng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accessLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{log.staffName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700">{log.cameraName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{log.accessTime.toLocaleString('vi-VN')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        {log.duration}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grant Permission Modal */}
      {showGrantPermission && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Cấp quyền xem camera</h3>
              <button onClick={() => setShowGrantPermission(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Chọn nhân viên</label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role === 'supervisor' ? 'Giám sát' : 'Hỗ trợ'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Chọn camera</label>
                <div className="space-y-2 border-2 border-gray-200 rounded-xl p-4 max-h-64 overflow-y-auto">
                  {cameras.map((cam) => (
                    <label key={cam.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCameras.includes(cam.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCameras([...selectedCameras, cam.id]);
                          } else {
                            setSelectedCameras(selectedCameras.filter(id => id !== cam.id));
                          }
                        }}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <Camera className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{cam.name}</div>
                        <div className="text-sm text-gray-500">{cam.zone}</div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                        cam.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {cam.status === 'online' ? 'Online' : 'Offline'}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Lý do cấp quyền</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="VD: Giám sát ca sáng khu A, B..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowGrantPermission(false)} 
                className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl font-bold transition"
              >
                Hủy
              </button>
              <button 
                onClick={handleGrantPermission} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold transition shadow-lg"
              >
                Cấp quyền
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
