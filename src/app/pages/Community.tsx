import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Search, Key, Info, MapPin, Star, LogOut, AlertTriangle, Map
} from 'lucide-react';
import { toast } from 'sonner';
import type { ParkingLot } from '../types/community.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { getHomeRoute, shouldSkipCommunityCodeEntry } from '../utils/navigation.ts';


export interface SupportTicket {
  id: number;
  message: string;
  userId: number;
  status: string;
}

export const Community = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [communityCode, setCommunityCode] = useState<string>(location.state?.communityCode || '');
  const [hasCommunityAccess, setHasCommunityAccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const parkingLots: ParkingLot[] = [
    {
      code: 'PL001',
      name: 'Bãi đỗ xe Trung tâm A',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      memberCount: 245,
      hasCommunity: true,
      communityCode: 'COMM001',
      rating: 4.5,
      description: 'Bãi đỗ xe hiện đại, an toàn với hệ thống camera 24/7'
    },
    {
      code: 'PL002',
      name: 'Bãi đỗ xe Quận 3',
      address: '456 Lê Văn Sỹ, Quận 3, TP.HCM',
      memberCount: 189,
      hasCommunity: true,
      communityCode: 'COMM002',
      rating: 4.2,
      description: 'Bãi rộng rãi, giá cả hợp lý'
    },
    {
      code: 'PL003',
      name: 'Bãi đỗ xe Sân bay',
      address: '789 Trường Sơn, Tân Bình, TP.HCM',
      memberCount: 312,
      hasCommunity: false,
      rating: 4.7,
      description: 'Gần sân bay, tiện lợi cho chuyến đi'
    },
  ];

  // Check if user should skip code entry (direct link from parking lot)
  const skipCodeEntry = location.state?.skipCodeEntry || shouldSkipCommunityCodeEntry(user?.role);

  useEffect(() => {
    const storedCode = localStorage.getItem('communityCode');
    if (storedCode) {
      setCommunityCode(storedCode);
      setHasCommunityAccess(true);
    }
  }, []);

  useEffect(() => {
    if (location.state?.skipCodeEntry && location.state.communityCode && !hasCommunityAccess) {
      const normalizedCode = location.state.communityCode.toUpperCase().trim();
      const lot = parkingLots.find(p => p.communityCode === normalizedCode);
      if (!lot) return;
      setHasCommunityAccess(true);
      localStorage.setItem('communityCode', normalizedCode);
      navigate(`/community/feed?code=${normalizedCode}`, { replace: true });
    }
  }, [location.state, hasCommunityAccess, navigate, parkingLots]);

  const filteredParkingLots = useMemo(
    () => parkingLots.filter(lot =>
      lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.address.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [parkingLots, searchQuery]
  );

  const handleEnterCode = () => {
    const normalizedCode = communityCode.toUpperCase().trim();
    const lot = parkingLots.find(p => p.communityCode === normalizedCode);

    if (!lot) {
      toast.error('Mã cộng đồng không tồn tại!');
      return;
    }

    if (!lot.hasCommunity) {
      toast.error('Bãi đỗ này chưa có cộng đồng!');
      return;
    }

    toast.success(`Đã vào cộng đồng ${lot.name}!`);
    setHasCommunityAccess(true);
    localStorage.setItem('communityCode', normalizedCode);
    navigate(`/community/feed?code=${normalizedCode}`);
  };

  const handleViewParkingLot = (lot: ParkingLot) => {
    if (lot.hasCommunity && lot.communityCode) {
      navigate(`/community/reviews?parking=${lot.code}`);
    } else {
      navigate(`/community/reviews?parking=${lot.code}`);
    }
  };

  const handleBackButton = () => {
    navigate(getHomeRoute(user?.role));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBackButton}
              className="p-2 hover:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl mb-1">Cộng đồng bãi đỗ xe</h1>
              <p className="text-purple-100 text-sm">Tìm kiếm và kết nối với cộng đồng</p>
            </div>
            <button
              onClick={() => navigate('/owner/parking-lots')}
              className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl transition-all flex items-center gap-2"
            >
              <Map className="w-5 h-5" />
              Tìm bãi đỗ xe
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enter Community Code Card - Hidden for Supervisor & Support Staff */}
        {!skipCodeEntry && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Key className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl text-gray-900">Nhập mã cộng đồng</h2>
                  <p className="text-gray-600 text-sm">Mã do quản trị viên bãi xe cung cấp</p>
                </div>
              </div>

              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={communityCode}
                  onChange={(e) => setCommunityCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã cộng đồng (VD: COMM001)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none uppercase"
                />
                <button
                  onClick={handleEnterCode}
                  disabled={!communityCode.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Vào cộng đồng
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="mb-2">Để tham gia cộng đồng, bạn cần:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Mã cộng đồng do quản trị viên bãi xe tạo</li>
                      <li>Đã đăng ký đỗ xe tại bãi đó ít nhất 1 lần</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message for Supervisor & Support Staff */}
        {skipCodeEntry && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg p-8 mb-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8" />
              </div>
              <h2 className="text-2xl mb-2">Bạn đã được cấp quyền truy cập</h2>
              <p className="text-blue-100 mb-6">
                {user?.role === 'supervisor' ? 'Giám sát viên' : 'Nhân viên hỗ trợ'} có quyền truy cập các cộng đồng được quản trị viên gán.
              </p>
              <p className="text-sm text-blue-100">
                N��u muốn theo dõi cộng đồng khác, bạn vẫn có thể nhập mã cộng đồng bên dưới.
              </p>
            </div>
          </div>
        )}

        {/* Optional Code Entry for Staff */}
        {skipCodeEntry && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-lg text-gray-900 mb-4">Theo dõi cộng đồng khác</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={communityCode}
                onChange={(e) => setCommunityCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã cộng đồng (tùy chọn)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none uppercase"
              />
              <button
                onClick={handleEnterCode}
                disabled={!communityCode.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Vào
              </button>
            </div>
          </div>
        )}

        {/* Search Parking Lots */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-purple-600" />
            Tìm kiếm bãi đỗ xe
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bãi đỗ hoặc địa chỉ..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Parking Lots List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParkingLots.map((lot) => (
            <div
              key={lot.code}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden cursor-pointer"
              onClick={() => handleViewParkingLot(lot)}
            >
              <div className={`h-2 ${lot.hasCommunity ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gray-300'}`} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg text-gray-900 mb-1">{lot.name}</h3>
                    <p className="text-sm text-gray-600 flex items-start gap-1">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {lot.address}
                    </p>
                  </div>
                </div>

                {lot.description && (
                  <p className="text-sm text-gray-600 mb-4">{lot.description}</p>
                )}

                <div className="flex items-center justify-between mb-4">
                  {lot.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-700">{lot.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <span className="text-sm text-gray-500">{lot.memberCount} thành viên</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    lot.hasCommunity
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {lot.hasCommunity ? '✓ Có cộng đồng' : 'Chưa có cộng đồng'}
                  </span>
                  {lot.hasCommunity && lot.communityCode && (
                    <span className="text-xs text-gray-500">
                      Mã: {lot.communityCode}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredParkingLots.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không tìm thấy bãi đỗ xe phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
};