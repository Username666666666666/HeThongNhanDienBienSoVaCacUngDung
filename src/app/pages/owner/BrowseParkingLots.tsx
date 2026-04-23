import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Eye, Clock, Search, Car, Star, Coins } from 'lucide-react';
import { supabase } from '../../utils/supabase.ts';

interface ParkingLot {
  id: string;
  name: string;
  communityCode: string;
  address: string;
  totalSpots: number;
  availableSpots: number;
  image: string;
  amenities: string[];
  supportedVehicles: string[];
  hasVirtualCoin: boolean;
  rating: number | null;
  reviews: number;
  operatingHours: string;
}

export const BrowseParkingLots = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= LOAD DATA =================
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('baido')
        .select(`
          mabaido,
          tenbaido,
          mathamgia,
          diachi,
          giohoatdong,
          hinhanh,

          khuvudo (
            vitrido (trangthai),
            phuongtienhotro (
              banggia (
                loaixe,
                thanhtoanxuao
              )
            )
          ),

          tienich (ten_tien_ich)
        `)
        .eq('congkhai', true);

      if (!error && data) {
        const mapped = data.map((lot: any) => {
          const totalSpots = lot.khuvudo?.reduce(
            (s: number, z: any) => s + (z.vitrido?.length || 0),
            0
          );

          const availableSpots = lot.khuvudo?.reduce(
            (s: number, z: any) =>
              s + (z.vitrido || []).filter((x: any) => x.trangthai === 0).length,
            0
          );

          // ===== LẤY LOẠI XE =====
          const vehicleSet = new Set<string>();
          let hasVirtualCoin = false;

          lot.khuvudo?.forEach((z: any) => {
            z.phuongtienhotro?.forEach((p: any) => {
              if (p.banggia?.loaixe) {
                vehicleSet.add(p.banggia.loaixe);
              }
              if (p.banggia?.thanhtoanxuao) {
                hasVirtualCoin = true;
              }
            });
          });

          return {
            id: lot.mabaido,
            name: lot.tenbaido,
            communityCode: lot.mathamgia,
            address: lot.diachi,
            totalSpots,
            availableSpots,
            image:
              lot.hinhanh ||
              'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
            amenities: lot.tienich?.map((t: any) => t.ten_tien_ich) || [],
            supportedVehicles: Array.from(vehicleSet),
            hasVirtualCoin,
            rating: null,
            reviews: 0,
            operatingHours: lot.giohoatdong,
          };
        });

        setParkingLots(mapped);
      }

      setLoading(false);
    };

    load();
  }, []);

  // ================= FILTER =================
  const filteredLots = parkingLots.filter((lot) => {
    const q = searchQuery.toLowerCase();
    return (
      lot.name.toLowerCase().includes(q) ||
      lot.address.toLowerCase().includes(q) ||
      lot.communityCode.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <div className="p-10 text-center">Đang tải...</div>;
  }

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl mb-2">Khám phá bãi đỗ xe</h1>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, địa chỉ..."
              className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLots.map((lot) => (
          <div
            key={lot.id}
            onClick={() => navigate(`/owner/parking-lot/${lot.id}`)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl cursor-pointer"
          >
            <div className="relative h-48">
              <img src={lot.image} className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                {lot.availableSpots} chỗ trống
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-xl font-bold">{lot.name}</h3>

              <div className="text-sm text-gray-500 mb-2">
                {lot.communityCode}
              </div>

              <div className="flex items-start gap-2 mb-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                {lot.address}
              </div>

              <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {lot.operatingHours}
              </div>

              {/* ===== LOẠI XE ===== */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                  <Car className="w-4 h-4" />
                  Loại xe hỗ trợ
                </div>
                <div className="flex flex-wrap gap-2">
                  {lot.supportedVehicles.length > 0 ? (
                    lot.supportedVehicles.map((v, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded">
                        {v}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">Chưa rõ</span>
                  )}
                </div>
              </div>

              {/* ===== TIỆN ÍCH ===== */}
              <div className="flex flex-wrap gap-2 mb-3">
                {lot.amenities.slice(0, 3).map((a, i) => (
                  <span key={i} className="bg-gray-100 px-2 py-1 text-xs rounded">
                    {a}
                  </span>
                ))}
              </div>

              {/* ===== ĐÁNH GIÁ ===== */}
              <div className="flex items-center gap-2 text-sm mb-3">
                <Star className="w-4 h-4 text-yellow-500" />
                {lot.rating ? (
                  <span>{lot.rating} ({lot.reviews} đánh giá)</span>
                ) : (
                  <span className="text-gray-400">Chưa có đánh giá</span>
                )}
              </div>

              {/* ===== XU ẢO ===== */}
              <div className="flex items-center gap-2 text-sm mb-3">
                <Coins className={`w-4 h-4 ${lot.hasVirtualCoin ? 'text-yellow-500' : 'text-gray-300'}`} />
                {lot.hasVirtualCoin ? 'Có hỗ trợ xu ảo' : 'Không hỗ trợ xu ảo'}
              </div>

              <div className="border-t pt-3 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/owner/parking-lot/${lot.id}`);
                  }}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLots.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Không có bãi đỗ nào
        </div>
      )}
    </div>
  );
};