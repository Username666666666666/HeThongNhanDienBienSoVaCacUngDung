import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Calendar, User, Clock, Play, Download, Eye, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface VideoLog {
  id: string;
  shiftId: string;
  supervisorId: string;
  supervisorName: string;
  parkingLotId: string;
  parkingLotName: string;
  date: Date;
  startTime: string;
  endTime: string;
  cameraId: string;
  cameraLocation: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl: string;
  incidentReports?: number;
  notes?: string;
}

export const ShiftVideoLogs = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedParkingLot, setSelectedParkingLot] = useState<string>('all');
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('all');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Mock data
  const videoLogs: VideoLog[] = [
    {
      id: 'vl1',
      shiftId: 'shift001',
      supervisorId: 'sup1',
      supervisorName: 'Nguyễn Văn B',
      parkingLotId: 'pl1',
      parkingLotName: 'Bãi đỗ xe Trung tâm A',
      date: new Date(),
      startTime: '06:00',
      endTime: '14:00',
      cameraId: 'cam_gate_01',
      cameraLocation: 'Cổng vào chính',
      duration: '8:00:00',
      videoUrl: '#demo-video-1',
      thumbnailUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400',
      incidentReports: 0,
      notes: 'Ca trực bình thường, không có sự cố'
    },
    {
      id: 'vl2',
      shiftId: 'shift002',
      supervisorId: 'sup2',
      supervisorName: 'Trần Thị C',
      parkingLotId: 'pl1',
      parkingLotName: 'Bãi đỗ xe Trung tâm A',
      date: new Date(),
      startTime: '14:00',
      endTime: '22:00',
      cameraId: 'cam_gate_02',
      cameraLocation: 'Cổng ra',
      duration: '8:00:00',
      videoUrl: '#demo-video-2',
      thumbnailUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400',
      incidentReports: 1,
      notes: 'Phát hiện 1 trường hợp đỗ sai vị trí, đã xử lý'
    },
    {
      id: 'vl3',
      shiftId: 'shift003',
      supervisorId: 'sup1',
      supervisorName: 'Nguyễn Văn B',
      parkingLotId: 'pl2',
      parkingLotName: 'Bãi đỗ xe Quận 3',
      date: new Date(Date.now() - 86400000),
      startTime: '06:00',
      endTime: '14:00',
      cameraId: 'cam_gate_03',
      cameraLocation: 'Cổng vào',
      duration: '8:00:00',
      videoUrl: '#demo-video-3',
      thumbnailUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400',
      incidentReports: 0,
      notes: 'Ca trực bình thường'
    },
  ];

  const parkingLots = [
    { id: 'pl1', name: 'Bãi đỗ xe Trung tâm A' },
    { id: 'pl2', name: 'Bãi đỗ xe Quận 3' },
    { id: 'pl3', name: 'Bãi đỗ xe Sân bay' },
  ];

  const supervisors = [
    { id: 'sup1', name: 'Nguyễn Văn B' },
    { id: 'sup2', name: 'Trần Thị C' },
    { id: 'sup3', name: 'Lê Văn D' },
  ];

  const filteredLogs = videoLogs.filter(log => {
    const matchesDate = log.date.toISOString().split('T')[0] === selectedDate;
    const matchesParkingLot = selectedParkingLot === 'all' || log.parkingLotId === selectedParkingLot;
    const matchesSupervisor = selectedSupervisor === 'all' || log.supervisorId === selectedSupervisor;
    return matchesDate && matchesParkingLot && matchesSupervisor;
  });

  const handlePlayVideo = (videoId: string) => {
    setPlayingVideo(videoId);
    toast.info('Đang phát video demo...');
  };

  const handleDownloadVideo = (log: VideoLog) => {
    toast.success(`Đang tải xuống video ca trực ${log.startTime}-${log.endTime}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl mb-1">Nhật ký Video Ca Trực</h1>
              <p className="text-blue-100 text-sm">Xem lại video giám sát các ca trực</p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
              <Video className="w-5 h-5" />
              <span>{filteredLogs.length} video</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg text-gray-900">Bộ lọc</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Ngày
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Bãi đỗ xe</label>
              <select
                value={selectedParkingLot}
                onChange={(e) => setSelectedParkingLot(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">Tất cả bãi đỗ</option>
                {parkingLots.map(lot => (
                  <option key={lot.id} value={lot.id}>{lot.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Giám sát viên</label>
              <select
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">Tất cả giám sát viên</option>
                {supervisors.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Video Logs Grid */}
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy video phù hợp với bộ lọc</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLogs.map((log) => (
              <div key={log.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden">
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-gray-900">
                  {playingVideo === log.id ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Video className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                        <p className="text-sm">Video Demo đang phát</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={log.thumbnailUrl}
                        alt="Thumbnail"
                        className="w-full h-full object-cover opacity-60"
                      />
                      <button
                        onClick={() => handlePlayVideo(log.id)}
                        className="absolute inset-0 flex items-center justify-center hover:bg-black/20 transition group"
                      >
                        <div className="bg-blue-600 p-4 rounded-full group-hover:scale-110 transition">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </button>
                    </>
                  )}
                  {log.incidentReports && log.incidentReports > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                      {log.incidentReports} sự cố
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-gray-900 mb-1">{log.parkingLotName}</h3>
                      <p className="text-sm text-gray-600">{log.cameraLocation}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{log.supervisorName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{log.startTime} - {log.endTime} ({log.duration})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(log.date).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  {log.notes && (
                    <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded">
                      {log.notes}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePlayVideo(log.id)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Xem
                    </button>
                    <button
                      onClick={() => handleDownloadVideo(log)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-2">Tổng giờ giám sát</div>
            <div className="text-3xl text-gray-900 mb-1">24h</div>
            <div className="text-sm text-gray-500">Hôm nay</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-2">Video có sự cố</div>
            <div className="text-3xl text-gray-900 mb-1">
              {filteredLogs.filter(l => l.incidentReports && l.incidentReports > 0).length}
            </div>
            <div className="text-sm text-gray-500">Cần xem xét</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-2">Dung lượng lưu trữ</div>
            <div className="text-3xl text-gray-900 mb-1">145 GB</div>
            <div className="text-sm text-gray-500">Tháng này</div>
          </div>
        </div>
      </div>
    </div>
  );
};
