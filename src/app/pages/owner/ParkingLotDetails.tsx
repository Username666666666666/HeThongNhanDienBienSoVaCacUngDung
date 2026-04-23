import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Phone,
  Navigation,
  Eye,
  Car,
  Bike,
  Truck,
  Shield,
  Camera,
  Wifi,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback.tsx';
import { supabase } from '../../utils/supabase.ts';


type PriceType = 'fixed' | 'hourly' | 'daily';
type SpotStatusType = 0 | 1 | 2 | number | string;

interface ParkingLotView {
  id: string | number;
  name: string;
  communityCode: string;
  address: string;
  phone: string;
  rating: number;
  reviews: number;
  slots: number;
  totalSlots: number;
  image: string;
  openingHours: string;
  description: string;
}

interface ParkingSpotView {
  mavitri: string | number;
  tenvitri: string;
  trangthai: SpotStatusType;
  mabanggia: string | number | null;
  raw: any;
}

interface ParkingZoneView {
  makhuvuc: string | number;
  tenkhuvuc: string;
  hinhkhuvuc: string;
  mota: string;
  spots: ParkingSpotView[];
  supportedPricingIds: string[];
}

interface ParkingPricingView {
  mabanggia: string | number;
  type: string;
  priceType: PriceType;
  price: number;
  coinPrice: number;
  isVirtualCoin: boolean;
  vehicleType: 'car' | 'motorcycle'; // 👈 thêm dòng này
}

interface FacilityView {
  id: string | number;
  name: string;
  iconKey: string;
}

const customerReviews = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    rating: 5,
    comment: 'Bãi xe rộng rãi, nhân viên thân thiện. Giá cả hợp lý!',
    date: '25/03/2026',
  },
  {
    id: 2,
    name: 'Trần Thị B',
    rating: 4,
    comment: 'Vị trí thuận tiện, dễ tìm. Chỉ có điều đôi khi hơi đông.',
    date: '22/03/2026',
  },
  {
    id: 3,
    name: 'Lê Văn C',
    rating: 5,
    comment: 'An toàn, có camera giám sát tốt. Rất hài lòng!',
    date: '20/03/2026',
  },
];

const statusMeta = {
  available: { label: 'Trống', bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700' },
  booked: { label: 'Đã đặt', bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700' },
  reserved: { label: 'Đã giữ', bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700' },
  unknown: { label: 'Không rõ', bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' },
} as const;

const formatMoney = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return '0';
  return n.toLocaleString('vi-VN');
};

const resolveFacilityIconKey = (name: string) => {
  const text = name.toLowerCase();

  if (text.includes('camera')) return 'camera';
  if (text.includes('wifi') || text.includes('internet')) return 'wifi';
  if (text.includes('bảo vệ') || text.includes('an ninh') || text.includes('shield')) return 'shield';
  if (text.includes('mái che') || text.includes('che')) return 'alert';
  if (text.includes('điện') || text.includes('sạc')) return 'car';
  if (text.includes('xe máy') || text.includes('motor')) return 'bike';
  if (text.includes('tải') || text.includes('truck')) return 'truck';
  return 'alert';
};

const resolveFacilityIcon = (iconKey: string) => {
  switch (iconKey) {
    case 'camera':
      return Camera;
    case 'wifi':
      return Wifi;
    case 'shield':
      return Shield;
    case 'car':
      return Car;
    case 'bike':
      return Bike;
    case 'truck':
      return Truck;
    default:
      return AlertCircle;
  }
};

const statusToParkingStatus = (value: SpotStatusType) => {
  const n = Number(value);
  if (n === 1) return 'booked';
  if (n === 2) return 'reserved';
  return 'available';
};

const formatPriceDisplay = (item: ParkingPricingView) => {
  const basePrice = `${formatMoney(item.price)}đ`;
  const coinPart = item.isVirtualCoin ? ` · ${formatMoney(item.coinPrice)} xu` : '';

  if (item.priceType === 'hourly') return `${basePrice}/giờ${coinPart}`;
  if (item.priceType === 'daily') return `${basePrice}/ngày${coinPart}`;
  return `${basePrice}${coinPart}`;
};

export const ParkingLotDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [showMapModal, setShowMapModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [parkingLot, setParkingLot] = useState<ParkingLotView | null>(null);
  const [zones, setZones] = useState<ParkingZoneView[]>([]);
  const [pricing, setPricing] = useState<ParkingPricingView[]>([]);
  const [facilities, setFacilities] = useState<FacilityView[]>([]);

  const [activeModalZoneId, setActiveModalZoneId] = useState<string | number | null>(null);
  const [activeModalSpotIndex, setActiveModalSpotIndex] = useState(0);

  const loadParkingLot = async () => {
    try {
      setLoading(true);
      setLoadError(null);

   const rawId = String(id ?? '').trim();
if (!rawId) {
  setLoadError('Thiếu mã bãi đỗ.');
  return;
}

const { data: lotData, error: lotErr } = await supabase
  .from('baido')
  .select('*')
  .eq('mabaido', rawId)
  .maybeSingle();

if (lotErr) throw lotErr;

if (!lotData) {
  setLoadError('Không tìm thấy bãi đỗ.');
  return;
}

const lot = lotData as any;
const lotId = String(lot.mabaido ?? rawId);

      const { data: zoneRows, error: zoneErr } = await supabase
        .from('khuvudo')
        .select('*')
        .eq('mabaido', lotId)
        .order('makhuvuc', { ascending: true });

      if (zoneErr) throw zoneErr;

      const zoneIds = (zoneRows ?? []).map((z: any) => z.makhuvuc);

      const { data: spotRows, error: spotErr } = zoneIds.length
        ? await supabase.from('vitrido').select('*').in('makhuvuc', zoneIds)
        : { data: [], error: null as any };

      if (spotErr) throw spotErr;

      const { data: pricingRows, error: pricingErr } = await supabase
        .from('banggia')
        .select('*')
        .eq('mabaido', lotId)
        .order('mabanggia', { ascending: true });

      if (pricingErr) throw pricingErr;

      const pricingIds = (pricingRows ?? []).map((p: any) => p.mabanggia);

      const { data: coinRows } = pricingIds.length
        ? await supabase.from('banggiaxuao').select('*').in('mabanggia', pricingIds)
        : { data: [] as any[] };

      const coinMap = new Map<string, number>();
      (coinRows ?? []).forEach((row: any) => {
        coinMap.set(String(row.mabanggia), Number(row.thanhxu ?? 0));
      });

      const { data: supportRows } = zoneIds.length
        ? await supabase.from('phuongtienhotro').select('*').in('makhuvuc', zoneIds)
        : { data: [] as any[] };

      const pricingMap = new Map<string, any>();
      (pricingRows ?? []).forEach((row: any) => {
        pricingMap.set(String(row.mabanggia), row);
      });

    const supportedByZone = new Map<string, string[]>();

(supportRows ?? []).forEach((row: any) => {
  const zoneKey = String(row.makhuvuc);
  const pricingId = String(row.mabanggia);

  const current = supportedByZone.get(zoneKey) ?? [];
  if (!current.includes(pricingId)) {
    current.push(pricingId);
  }
  supportedByZone.set(zoneKey, current);
});

      const zoneSpotMap = new Map<string, ParkingSpotView[]>();
      (spotRows ?? []).forEach((row: any) => {
        const key = String(row.makhuvuc);
        const current = zoneSpotMap.get(key) ?? [];
      current.push({
  mavitri: row.mavitri ?? row.id ?? `${key}-${current.length + 1}`,
  tenvitri: row.tenvitri ?? row.ten ?? `Vị trí ${current.length + 1}`,
  trangthai: row.trangthai ?? 0,
  mabanggia: row.mabanggia ?? null,
  raw: row,
});
        zoneSpotMap.set(key, current);
      });

   const transformedZones: ParkingZoneView[] = (zoneRows ?? []).map((zone: any) => {
  const zoneKey = String(zone.makhuvuc);
  const spots = zoneSpotMap.get(zoneKey) ?? [];

  return {
    makhuvuc: zone.makhuvuc,
    tenkhuvuc: zone.tenkhuvuc ?? zone.ten ?? `Khu vực ${zoneKey}`,
    hinhkhuvuc: zone.hinhkhuvuc ?? zone.image ?? '',
    mota: zone.mota ?? '',
    spots,
    supportedPricingIds: supportedByZone.get(zoneKey) ?? [],
  };
});

      const totalSlots = transformedZones.reduce((sum, zone) => sum + zone.spots.length, 0);
      const availableSlots = transformedZones.reduce(
        (sum, zone) => sum + zone.spots.filter((spot) => Number(spot.trangthai) === 0).length,
        0,
      );

    const transformedPricing: ParkingPricingView[] = (pricingRows ?? []).map((row: any) => ({
  mabanggia: row.mabanggia,
  type: row.loaixe ?? row.type ?? 'Không rõ',
  priceType: (row.loaigia ?? 'fixed') as PriceType,
  price: Number(row.thanhtien ?? row.price ?? 0),
  coinPrice: Number(coinMap.get(String(row.mabanggia)) ?? row.giaxu ?? 0),
  isVirtualCoin: Boolean(row.thanhtoanxuao),

  vehicleType: row.kieuxe === 'motorcycle' ? 'motorcycle' : 'car', // 👈 thêm dòng này
}));

  const { data: facilityRows, error: facilityErr } = await supabase
  .from('tienich')
  .select('*')
  .eq('mabaido', lotId);

const transformedFacilities: FacilityView[] = [];

if (!facilityErr && facilityRows) {
  facilityRows.forEach((row: any) => {
    const name = row.ten_tien_ich;

    if (!name) return;

    transformedFacilities.push({
      id: row.matienich,
      name,
      iconKey: resolveFacilityIconKey(name),
    });
  });
}

      setParkingLot({
        id: lotId,
        name: lot.tenbaido ?? lot.name ?? 'Bãi đỗ xe',
        communityCode: lot.mathamgia ?? lot.communityCode ?? '',
        address: lot.diachi ?? lot.address ?? '',
        phone: lot.sodienthoai ?? lot.phone ?? '',
        rating: Number(lot.danhgia_trungbinh ?? lot.rating ?? 0),
        reviews: Number(lot.soluotdanhgia ?? lot.reviews ?? 0),
        slots: availableSlots,
        totalSlots,
        image: lot.hinhanh ?? lot.image ?? '',
        openingHours: lot.giohoatdong ?? lot.operatingHours ?? '24/7',
        description: lot.mota ?? lot.description ?? '',
      });

      setZones(transformedZones);
      setPricing(transformedPricing);
      setFacilities(transformedFacilities);

      if (transformedZones.length > 0) {
        setActiveModalZoneId(transformedZones[0].makhuvuc);
        setActiveModalSpotIndex(0);
      }
    } catch (error: any) {
      setLoadError(error?.message ?? 'Lỗi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadParkingLot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const zoneSummaries = useMemo(() => {
    return zones.map((zone) => {
      const total = zone.spots.length;
      const available = zone.spots.filter((spot) => Number(spot.trangthai) === 0).length;
      const booked = zone.spots.filter((spot) => Number(spot.trangthai) === 1).length;
      const reserved = zone.spots.filter((spot) => Number(spot.trangthai) === 2).length;

      return {
        ...zone,
        total,
        available,
        booked,
        reserved,
      };
    });
  }, [zones]);

  const activeZoneSummary = useMemo(() => {
    if (!zoneSummaries.length) return null;
    return (
      zoneSummaries.find((zone) => String(zone.makhuvuc) === String(activeModalZoneId)) ?? zoneSummaries[0]
    );
  }, [zoneSummaries, activeModalZoneId]);

  const activeSpot = useMemo(() => {
    if (!activeZoneSummary?.spots.length) return null;
    return activeZoneSummary.spots[activeModalSpotIndex] ?? activeZoneSummary.spots[0] ?? null;
  }, [activeZoneSummary, activeModalSpotIndex]);
const pricingMap = useMemo(() => {
  const map = new Map<string, ParkingPricingView>();
  pricing.forEach((p) => map.set(String(p.mabanggia), p));
  return map;
}, [pricing]);

const getSpotVehicleLabel = (spot: ParkingSpotView) => {
  if (!spot.mabanggia) return '';
  return pricingMap.get(String(spot.mabanggia))?.type ?? '';
};
  useEffect(() => {
    if (!activeZoneSummary) return;
    if (activeModalSpotIndex >= activeZoneSummary.spots.length) {
      setActiveModalSpotIndex(0);
    }
  }, [activeModalSpotIndex, activeZoneSummary]);

  const previewSpots = useMemo(() => {
  return zoneSummaries.flatMap((zone) => zone.spots);
}, [zoneSummaries]);

  const sortedPricing = useMemo(() => {
    const typeOrder: Record<PriceType, number> = { fixed: 0, hourly: 1, daily: 2 };
    return [...pricing].sort((a, b) => {
      const diff = typeOrder[a.priceType] - typeOrder[b.priceType];
      if (diff !== 0) return diff;
      return String(a.type).localeCompare(String(b.type), 'vi');
    });
  }, [pricing]);

  const jumpZone = (direction: 'prev' | 'next') => {
    if (!zoneSummaries.length) return;

    const currentIndex = Math.max(
      0,
      zoneSummaries.findIndex((zone) => String(zone.makhuvuc) === String(activeModalZoneId)),
    );

    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % zoneSummaries.length
        : (currentIndex - 1 + zoneSummaries.length) % zoneSummaries.length;

    const nextZone = zoneSummaries[nextIndex];
    setActiveModalZoneId(nextZone.makhuvuc);
    setActiveModalSpotIndex(0);
  };

  const jumpSpot = (direction: 'prev' | 'next') => {
    if (!activeZoneSummary?.spots.length) return;

    const length = activeZoneSummary.spots.length;
    const nextIndex =
      direction === 'next'
        ? (activeModalSpotIndex + 1) % length
        : (activeModalSpotIndex - 1 + length) % length;

    setActiveModalSpotIndex(nextIndex);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-gray-600">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (loadError || !parkingLot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">Không thể tải bãi đỗ</div>
          <p className="text-gray-600 mb-6">{loadError ?? 'Dữ liệu không tồn tại.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl mb-2 tracking-tight">Chi tiết bãi đỗ</h1>
              <p className="text-blue-100 text-sm">Thông tin chi tiết về bãi đỗ xe</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <ImageWithFallback
            src={parkingLot.image}
            alt={parkingLot.name}
            className="w-full h-96 object-cover"
          />
          <div className="p-4 bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Mã bãi đỗ / Mã cộng đồng</div>
              <div className="text-2xl font-bold text-purple-700">{parkingLot.communityCode}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Tỷ lệ lấp đầy</div>
              <div className="text-xl font-bold text-gray-900">
                {parkingLot.totalSlots > 0
                  ? Math.round(((parkingLot.totalSlots - parkingLot.slots) / parkingLot.totalSlots) * 100)
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{parkingLot.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{parkingLot.rating || 0}</span>
                      <span className="text-gray-400">({parkingLot.reviews || 0} đánh giá)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{parkingLot.openingHours}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold">
                  {parkingLot.slots} chỗ trống
                </div>
              </div>

              <p className="text-gray-600 mb-4">{parkingLot.description}</p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-gray-900 font-medium">{parkingLot.address}</div>
                    <button className="text-blue-600 text-sm hover:underline mt-1 flex items-center gap-1">
                      <Navigation className="w-4 h-4" />
                      Chỉ đường
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div className="text-gray-900 font-medium">{parkingLot.phone}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  Bản đồ bãi đỗ
                </h3>
                <button
                  onClick={() => setShowMapModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Eye className="w-4 h-4" />
                  Xem chi tiết
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {zoneSummaries.map((zone) => (
                  <button
                    key={zone.makhuvuc}
                    onClick={() => {
                      setActiveModalZoneId(zone.makhuvuc);
                      setActiveModalSpotIndex(0);
                    }}
                    className="text-left bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200"
                  >
                    <div className="text-lg font-bold text-gray-900 mb-2">{zone.tenkhuvuc}</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tổng: {zone.total}</span>
                      <span className="text-green-600 font-semibold">Trống: {zone.available}</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${zone.total > 0 ? (zone.available / zone.total) * 100 : 0}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="grid grid-cols-5 gap-3">
                  {previewSpots.slice(0, 15).map((spot) => {
                    const status = statusToParkingStatus(spot.trangthai);
                    return (
                      <div
                        key={String(spot.mavitri)}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold border-2 transition-all cursor-pointer ${
                          status === 'available'
                            ? 'bg-green-100 border-green-400 text-green-700 hover:bg-green-200'
                            : status === 'booked'
                              ? 'bg-red-100 border-red-400 text-red-700'
                              : 'bg-yellow-100 border-yellow-400 text-yellow-700'
                        }`}
                        title={`${spot.tenvitri} - ${status === 'available' ? 'Trống' : status === 'booked' ? 'Đã đặt' : 'Đã giữ'}`}
                        onClick={() => {
                          const zoneIndex = zoneSummaries.findIndex((z) =>
                            z.spots.some((s) => String(s.mavitri) === String(spot.mavitri)),
                          );
                          if (zoneIndex >= 0) {
                            setActiveModalZoneId(zoneSummaries[zoneIndex].makhuvuc);
                            setActiveModalSpotIndex(
                              zoneSummaries[zoneIndex].spots.findIndex((s) => String(s.mavitri) === String(spot.mavitri)),
                            );
                            setShowMapModal(true);
                          }
                        }}
                      >
                        <div className="text-sm font-bold">{spot.tenvitri}</div>
<div className="mt-1 text-[10px] px-2 py-0.5 rounded-full bg-white/80 text-gray-700">
  {getSpotVehicleLabel(spot)}
</div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded" />
                    <span className="text-gray-600">Trống</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded" />
                    <span className="text-gray-600">Đã đặt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded" />
                    <span className="text-gray-600">Đã giữ</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-blue-600" />
                Bảng giá
              </h3>

              <div className="space-y-3">
                {sortedPricing.map((item) => {
                  const Icon = item.vehicleType === 'motorcycle' ? Bike : Car;

                  return (
                    <div
                      key={String(item.mabanggia)}
                      className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-gray-900 font-semibold">{item.type}</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{formatPriceDisplay(item)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Tiện ích</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facilities.length > 0 ? (
                  facilities.map((feature) => {
                    const Icon = resolveFacilityIcon(feature.iconKey);
                    return (
                      <div
                        key={String(feature.id)}
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200"
                      >
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Icon className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-gray-900 font-medium">{feature.name}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500">Chưa có dữ liệu tiện ích.</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Đánh giá từ khách hàng</h3>
              <div className="space-y-4">
                {customerReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-gray-900 font-semibold">{review.name}</div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{review.comment}</p>
                    <p className="text-xs text-gray-400">{review.date}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() =>
  navigate(`/community/reviews?lotId=${encodeURIComponent(parkingLot.id)}`)
}
                className="w-full mt-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
              >
                Xem tất cả đánh giá
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Đặt chỗ ngay</h3>
              <button
                onClick={() => navigate(`/owner/parking/${parkingLot.id}/zones`)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition mb-3 font-semibold"
              >
                Chọn bãi đỗ này
              </button>
              <button
                onClick={() => navigate(`/community/feed?code=${encodeURIComponent(parkingLot.communityCode)}`)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition mb-3 font-semibold"
              >
                Tham gia cộng đồng
              </button>
              <button
                onClick={() =>
  navigate(`/community/reviews?lotId=${encodeURIComponent(parkingLot.id)}`)
}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition mb-3 font-semibold"
              >
                Viết đánh giá
              </button>
              <button
                onClick={() => navigate(-1)}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>

      {showMapModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Bản đồ chi tiết - {parkingLot.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Điều hướng giữa các ô để xem chi tiết từng vị trí.</p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <span className="text-2xl text-gray-600">×</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {zoneSummaries.map((zone) => (
                  <button
                    key={String(zone.makhuvuc)}
                    onClick={() => {
                      setActiveModalZoneId(zone.makhuvuc);
                      setActiveModalSpotIndex(0);
                    }}
                    className={`text-left bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 transition ${
                      String(activeModalZoneId) === String(zone.makhuvuc)
                        ? 'border-blue-500 shadow-md'
                        : 'border-blue-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-xl font-bold text-gray-900 mb-3">{zone.tenkhuvuc}</div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Tổng: {zone.total}</span>
                      <span className="text-green-600 font-bold">Trống: {zone.available}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>Đã đặt: {zone.booked}</span>
                      <span>Đã giữ: {zone.reserved}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all"
                        style={{ width: `${zone.total > 0 ? (zone.available / zone.total) * 100 : 0}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Bản đồ khu vực
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Nhấp vào từng ô vuông để xem thông tin riêng.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => jumpZone('prev')}
                        className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => jumpZone('next')}
                        className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {activeZoneSummary ? (
                    activeZoneSummary.spots.length > 0 ? (
                      <div className="grid grid-cols-5 gap-4">
                        {activeZoneSummary.spots.map((spot, idx) => {
                          const status = statusToParkingStatus(spot.trangthai);
                          const meta = statusMeta[status as keyof typeof statusMeta] ?? statusMeta.unknown;
                          const active = idx === activeModalSpotIndex;

                          return (
                    <button
  key={String(spot.mavitri)}
  onClick={() => setActiveModalSpotIndex(idx)}
  className={`aspect-square rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer
    ${active
      ? 'ring-2 ring-blue-500 border-blue-500 shadow-md'
      : ''
    }
    ${status === 'available'
      ? 'bg-green-50 border-green-400 hover:bg-green-100'
      : status === 'booked'
      ? 'bg-red-50 border-red-400'
      : 'bg-yellow-50 border-yellow-400'
    }`}
>
  <div className="flex flex-col items-center justify-center gap-1">
    
    {/* TÊN Ô */}
    <div className="text-sm font-bold text-gray-900">
      {spot.tenvitri || `Ô ${idx + 1}`}
    </div>

    {/* LOẠI XE */}
    <div className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 text-gray-700">
      {getSpotVehicleLabel(spot)}
    </div>

    {/* CHẤM TRẠNG THÁI */}
    <div
      className={`w-2 h-2 rounded-full ${
        status === 'available'
          ? 'bg-green-500'
          : status === 'reserved'
          ? 'bg-yellow-500'
          : 'bg-red-500'
      }`}
    />
  </div>
</button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Khu vực này chưa có ô nào.</div>
                    )
                  ) : (
                    <div className="text-sm text-gray-500">Chưa chọn khu vực.</div>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  {activeZoneSummary && activeZoneSummary.spots.length > 0 ? (
                    activeSpot ? (
                      <div className="space-y-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {activeZoneSummary.tenkhuvuc}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">{activeZoneSummary.mota || 'Không có mô tả.'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => jumpSpot('prev')}
                              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => jumpSpot('next')}
                              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-bold text-gray-900">
                            {activeSpot.tenvitri}
                          </h4>
                          {(() => {
                            const status = statusToParkingStatus(activeSpot.trangthai);
                            const meta = statusMeta[status as keyof typeof statusMeta] ?? statusMeta.unknown;
                            return (
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${meta.bg} ${meta.text}`}
                              >
                                {meta.label}
                              </span>
                            );
                          })()}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="p-4 rounded-xl bg-gray-50">
  <div className="text-gray-500">Loại xe</div>
  <div className="font-semibold text-gray-900 mt-1">
    {activeSpot?.mabanggia
      ? pricingMap.get(String(activeSpot.mabanggia))?.type ?? ''
      : ''}
  </div>
</div>
                          <div className="p-4 rounded-xl bg-gray-50">
                            <div className="text-gray-500">Trạng thái</div>
                            <div className="font-semibold text-gray-900 mt-1">
                              {
                                (statusMeta[
                                  statusToParkingStatus(activeSpot.trangthai) as keyof typeof statusMeta
                                ] ?? statusMeta.unknown).label
                              }
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-gray-50 col-span-2">
                            <div className="text-gray-500">Loại xe hỗ trợ trong khu vực</div>
                            <div className="font-semibold text-gray-900 mt-2 flex flex-wrap gap-2">
                           {activeZoneSummary.supportedPricingIds.length > 0 ? (
  activeZoneSummary.supportedPricingIds.map((pricingId) => {
    const priceRow = pricing.find((p) => String(p.mabanggia) === String(pricingId));
    const label = priceRow?.type ?? pricingId;

    return (
      <span
        key={pricingId}
        className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold"
      >
        {label}
      </span>
    );
  })
) : (
  <span className="text-gray-500 font-normal">Chưa cấu hình</span>
)}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-gray-700">Bảng giá liên kết</div>
                          <div className="grid grid-cols-1 gap-3">
                            {sortedPricing.length > 0 ? (
                              sortedPricing.map((item) => {
                              const isSupported =
  activeZoneSummary.supportedPricingIds.length === 0 ||
  activeZoneSummary.supportedPricingIds.includes(String(item.mabanggia));

                                return (
                                  <div
                                    key={String(item.mabanggia)}
                                    className={`rounded-xl border p-4 flex items-center justify-between ${
                                      isSupported ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                                    }`}
                                  >
                                    <div>
                                      <div className="font-semibold text-gray-900">{item.type}</div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {item.priceType === 'hourly'
                                          ? 'Theo giờ'
                                          : item.priceType === 'daily'
                                            ? 'Theo ngày'
                                            : 'Cố định'}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-blue-600">{formatPriceDisplay(item)}</div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-sm text-gray-500">Chưa có bảng giá.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Không có dữ liệu vị trí.</div>
                    )
                  ) : (
                    <div className="text-sm text-gray-500">Chọn một ô để xem chi tiết.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};