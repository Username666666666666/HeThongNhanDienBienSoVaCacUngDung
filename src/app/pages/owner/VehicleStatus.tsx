import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, MapPin, Clock, AlertTriangle, Navigation } from 'lucide-react';
import { toast } from 'sonner';

export const VehicleStatus = () => {
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState(1);

  const vehicles = [
    {
      id: 1,
      plate: '30A-12345',
      type: 'Xe ô tô',
      status: 'parked',
      parkingLot: 'Bãi đỗ xe A',
      location: 'Vị trí A015 - Sân A',
      entryTime: '08:30 AM',
      entryDate: '30/03/2026',
      duration: '2 giờ 30 phút',
      currentFee: '50.000đ',
      entryImage: 'https://images.unsplash.com/photo-1774576670116-a21417528d54?w=400',
    },
    {
      id: 2,
      plate: '29B-67890',
      type: 'Xe máy',
      status: 'available',
      parkingLot: '-',
      location: '-',
    },
  ];

  const vehicle = vehicles.find((v) => v.id === selectedVehicle);

  const handleReportTheft = () => {
    toast.error('Đã gửi báo cáo mất cắp đến quản lý bãi đỗ!');
  };

  const handleNavigate = () => {
    toast.success('Đang mở bản đồ chỉ đường...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/owner')}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl mb-1">Trạng thái phương tiện</h1>
              <p className="text-blue-100 text-sm">Theo dõi xe của bạn</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-lg text-gray-900 mb-4">Danh sách xe</h3>
              <div className="space-y-3">
                {vehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicle(v.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      selectedVehicle === v.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          v.status === 'parked' ? 'bg-green-100' : 'bg-gray-100'
                        }`}
                      >
                        <Car
                          className={`w-5 h-5 ${
                            v.status === 'parked' ? 'text-green-600' : 'text-gray-600'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="text-gray-900">{v.plate}</div>
                        <div className="text-sm text-gray-500">{v.type}</div>
                      </div>
                    </div>
                    <div
                      className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                        v.status === 'parked'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {v.status === 'parked' ? 'Đang đỗ' : 'Chưa đỗ'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="lg:col-span-2">
            {vehicle?.status === 'parked' ? (
              <div className="space-y-6">
                {/* Status Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl text-gray-900">{vehicle.plate}</h2>
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                      Đang đỗ
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Bãi đỗ</div>
                      <div className="text-gray-900">{vehicle.parkingLot}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Vị trí</div>
                      <div className="text-gray-900">{vehicle.location}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Giờ vào</div>
                      <div className="text-gray-900">
                        {vehicle.entryTime} - {vehicle.entryDate}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Thời gian đỗ</div>
                      <div className="text-gray-900">{vehicle.duration}</div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-sm text-blue-600">Phí hiện tại</div>
                      <div className="text-2xl text-blue-700">{vehicle.currentFee}</div>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                {/* Location Map */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Vị trí đỗ xe
                  </h3>
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-4">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Sơ đồ bãi đỗ - {vehicle.location}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleNavigate}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-5 h-5" />
                    Chỉ đường đến xe
                  </button>
                </div>

                {/* Entry Photos */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl text-gray-900 mb-4">Hình ảnh khi vào bãi</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <img
                        src={vehicle.entryImage}
                        alt="Entry"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        Biển số xe
                      </div>
                    </div>
                    <div className="relative">
                      <img
                        src={vehicle.entryImage}
                        alt="Driver"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        Người lái xe
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theft Report */}
                <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-red-200">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h3 className="text-xl text-gray-900">Báo mất cắp</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Nếu phát hiện xe bị mất cắp hoặc rời bãi không rõ lý do, vui lòng báo ngay để được
                    hỗ trợ.
                  </p>
                  <button
                    onClick={handleReportTheft}
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
                  >
                    Báo cáo mất cắp
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl text-gray-900 mb-2">Xe chưa đỗ</h3>
                <p className="text-gray-600 mb-6">Phương tiện này chưa được đỗ tại bãi nào.</p>
                <button
                  onClick={() => navigate('/owner/register-vehicle')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Đăng ký đỗ xe
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
