
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, CalendarRange, Clock, Eye, EyeOff, Filter, Grid3x3, Layers3, MapPin, Search, Star, Users, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase.ts';

// ================================
// TYPES
// ================================

type PublicFilter = 'all' | 'public' | 'private';
type SortBy = 'newest' | 'name' | 'spots';

type LotRow = {
  mabaido: string;
  tenbaido: string;
  mathamgia: string;
  diachi: string;
  sodienthoai: string;
  giohoatdong: string;
  mota: string;
  hinhanh: string;
  manguoidung: string;
  congkhai: boolean;
  danhgia?: boolean;
};

type ZoneRow = {
  makhuvuc: string;
  tenkhuvuc: string;
  hinhkhuvuc: string;
  mota: string;
  mabaido: string;
  spots: SpotRow[];
};

type SpotRow = {
  mavitri: string;
  tenvitri: string;
  trangthai: number;
  makhuvuc: string;
  mabanggia: string | null;
};

type PricingRow = {
  mabanggia: string;
  loaixe: string;
  loaigia: 'fixed' | 'hourly' | 'daily';
  thanhtien: number;
  thanhtoanxuao: boolean;
  mabaido: string;
  kieuxe: 'car' | 'motorcycle';
};

type CoinRow = {
  mabanggia: string;
  thanhxu: number;
};

type AmenityRow = {
  matienich: string;
  mabaido: string;
  ten_tien_ich: string;
};

type ParkingLot = {
  mabaido: string;
  tenbaido: string;
  mathamgia: string;
  diachi: string;
  sodienthoai: string;
  giohoatdong: string;
  mota: string;
  hinhanh: string;
  congkhai: boolean;
  manguoidung: string;
  totalSpots: number;
  availableSpots: number;
  zonesCount: number;
  pricingCount: number;
  amenitiesCount: number;
  ratingsCount: number;
  zones: ZoneRow[];
pricing: PricingRow[];
amenities: AmenityRow[];
};

const currency = new Intl.NumberFormat('vi-VN');
const formatMoney = (value?: number | null) =>
  `${currency.format(Number(value ?? 0))} ₫`;

const lotStatusLabel = (publicValue: boolean) => (publicValue ? 'Đang công khai' : 'Đang ẩn');

// ================================
// DATA HELPERS
// ================================

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Bạn cần đăng nhập');
  return data.user.id;
}

async function loadMyParkingLots(userId: string): Promise<ParkingLot[]> {
  const { data: lots, error: lotError } = await supabase
    .from('baido')
    .select('mabaido, tenbaido, mathamgia, diachi, sodienthoai, giohoatdong, mota, hinhanh, congkhai, manguoidung')
    .eq('manguoidung', userId)
    .order('tenbaido', { ascending: true });

  if (lotError) throw lotError;
  if (!lots || lots.length === 0) return [];

  const lotIds = lots.map((l) => l.mabaido);

const [
  { data: zones, error: zoneError },
  { data: amenities, error: amenityError },
  { data: pricing, error: pricingError },
  { data: supports, error: supportError }
] = await Promise.all([
  supabase.from('khuvudo').select('makhuvuc, tenkhuvuc, hinhkhuvuc, mota, mabaido').in('mabaido', lotIds),
  supabase.from('tienich').select('matienich, mabaido, ten_tien_ich').in('mabaido', lotIds),
  supabase.from('banggia').select('mabanggia, loaixe, loaigia, thanhtien, thanhtoanxuao, mabaido, kieuxe').in('mabaido', lotIds),
  supabase.from('phuongtienhotro').select('makhuvuc, mabanggia')
]);
if (supportError) throw supportError;

  if (zoneError) throw zoneError;
  if (amenityError) throw amenityError;
  if (pricingError) throw pricingError;

const zoneIds = (zones ?? []).map((z) => z.makhuvuc);
const pricingIds = (pricing ?? []).map((p) => p.mabanggia);

const [{ data: spots, error: spotError }, { data: coins, error: coinError }] = await Promise.all([
  zoneIds.length
    ? supabase
        .from('vitrido')
        .select('mavitri, tenvitri, trangthai, makhuvuc, mabanggia')
        .in('makhuvuc', zoneIds)
    : Promise.resolve({ data: [], error: null } as any),
  pricingIds.length
    ? supabase
        .from('banggiaxuao')
        .select('mabanggia, thanhxu')
        .in('mabanggia', pricingIds)
    : Promise.resolve({ data: [], error: null } as any),
]);

if (spotError) throw spotError;
if (coinError) throw coinError;

const coinMap = new Map<string, number>();
(coins ?? []).forEach((c: any) => coinMap.set(c.mabanggia, Number(c.thanhxu ?? 0)));

const pricingMap = new Map<string, PricingRow & { coinPrice: number }>();
const supportMap = new Map<string, string[]>();

(supports ?? []).forEach((s: any) => {
  if (!supportMap.has(s.makhuvuc)) {
    supportMap.set(s.makhuvuc, []);
  }
  supportMap.get(s.makhuvuc)!.push(s.mabanggia);
});
(pricing ?? []).forEach((p: any) => {
  pricingMap.set(p.mabanggia, {
    ...p,
    coinPrice: coinMap.get(p.mabanggia) ?? 0,
  });
});

const spotMap = new Map<string, (SpotRow & { pricing: (PricingRow & { coinPrice: number }) | null })[]>();
(spots ?? []).forEach((s: any) => {
  if (!spotMap.has(s.makhuvuc)) spotMap.set(s.makhuvuc, []);
  spotMap.get(s.makhuvuc)!.push({
    ...s,
    pricing: s.mabanggia ? pricingMap.get(s.mabanggia) ?? null : null,
  });
});

  return lots.map((lot: any) => {
    const lotZones = (zones ?? [])
  .filter((z: any) => z.mabaido === lot.mabaido)
  .map((z: any) => {
    const supportedIds = supportMap.get(z.makhuvuc) ?? [];

    const supportedVehicleTypes = supportedIds
      .map((id) => pricingMap.get(id)?.loaixe)
      .filter(Boolean);

    return {
      ...z,
      spots: spotMap.get(z.makhuvuc) ?? [],
      supportedVehicleTypes,
    };
  });

    const lotPricing = (pricing ?? [])
      .filter((p: any) => p.mabaido === lot.mabaido)
      .map((p: any) => ({
        ...p,
        coinPrice: coinMap.get(p.mabanggia) ?? 0,
      }));

    const totalSpots = lotZones.reduce((sum, z) => sum + (z.spots?.length ?? 0), 0);
    const availableSpots = lotZones.reduce((sum, z) => sum + (z.spots ?? []).filter((s: SpotRow) => Number(s.trangthai) === 0).length, 0);
    const amenitiesCount = (amenities ?? []).filter((a: any) => a.mabaido === lot.mabaido).length;

    return {
      ...lot,
      totalSpots,
      availableSpots,
      zonesCount: lotZones.length,
      pricingCount: lotPricing.length,
      amenitiesCount,
      ratingsCount: 0,
      zones: lotZones,
      pricing: lotPricing,
      amenities: (amenities ?? []).filter((a: any) => a.mabaido === lot.mabaido),
    } as ParkingLot & { zones: any[]; pricing: any[]; amenities: AmenityRow[] };
  });
}

// ================================
// LIST PAGE
// ================================

export const MyParkingLots = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [query, setQuery] = useState('');
  const [visibility, setVisibility] = useState<PublicFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  const reload = async () => {
    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      const data = await loadMyParkingLots(userId);
      setLots(data);
    } catch (error: any) {
      toast.error(error?.message ?? 'Không tải được danh sách bãi đỗ');
      setLots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const stats = useMemo(() => {
    return lots.reduce(
      (acc, lot) => ({
        total: acc.total + 1,
        public: acc.public + (lot.congkhai ? 1 : 0),
        hidden: acc.hidden + (!lot.congkhai ? 1 : 0),
        spots: acc.spots + lot.totalSpots,
        zones: acc.zones + lot.zonesCount,
      }),
      { total: 0, public: 0, hidden: 0, spots: 0, zones: 0 }
    );
  }, [lots]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...lots];

    if (visibility !== 'all') {
      list = list.filter((lot) => (visibility === 'public' ? lot.congkhai : !lot.congkhai));
    }

    if (q) {
      list = list.filter((lot) => {
        const text = [lot.tenbaido, lot.mathamgia, lot.diachi, lot.sodienthoai, lot.giohoatdong, lot.mota, ...lot.zones.map((z: any) => z.tenkhuvuc), ...lot.pricing.map((p: any) => p.loaixe), ...lot.amenities.map((a: any) => a.ten_tien_ich)].join(' ').toLowerCase();
        return text.includes(q);
      });
    }

    list.sort((a, b) => {
      if (sortBy === 'name') return a.tenbaido.localeCompare(b.tenbaido, 'vi');
      if (sortBy === 'spots') return b.totalSpots - a.totalSpots;
      return b.mabaido.localeCompare(a.mabaido);
    });

    return list;
  }, [lots, query, visibility, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl mb-1">Bãi đỗ của tôi</h1>
              <p className="text-purple-100 text-sm">Màn hình gọn, chỉ quản lý danh sách. Chi tiết được tách sang trang chỉnh sửa riêng.</p>
            </div>
            <button onClick={() => navigate('/admin/parking-config')} className="hidden md:inline-flex items-center gap-2 bg-white text-purple-700 px-4 py-2 rounded-xl font-semibold hover:bg-purple-50 transition">
              <ArrowRight className="w-4 h-4" />
              Tạo bãi đỗ
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard icon={<Building2 className="w-5 h-5" />} label="Tổng bãi" value={stats.total} note="bãi đỗ đang quản lý" />
          <StatCard icon={<Eye className="w-5 h-5" />} label="Công khai" value={stats.public} note="hiển thị cho người dùng" />
          <StatCard icon={<EyeOff className="w-5 h-5" />} label="Đang ẩn" value={stats.hidden} note="chỉ admin nhìn thấy" />
          <StatCard icon={<Grid3x3 className="w-5 h-5" />} label="Vị trí đỗ" value={stats.spots} note={`${stats.zones} khu vực`} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm bãi đỗ, khu vực, loại xe, tiện ích..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div className="lg:col-span-3 relative">
              <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={visibility} onChange={(e) => setVisibility(e.target.value as PublicFilter)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-purple-500 outline-none">
                <option value="all">Tất cả</option>
                <option value="public">Công khai</option>
                <option value="private">Riêng tư</option>
              </select>
            </div>
            <div className="lg:col-span-3 relative">
              <CalendarRange className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-purple-500 outline-none">
                <option value="newest">Mới nhất</option>
                <option value="name">Tên bãi</option>
                <option value="spots">Số vị trí</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-200" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 bg-gray-200 rounded-2xl" />
                    <div className="h-20 bg-gray-200 rounded-2xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onCreate={() => navigate('/admin/parking-config')} />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filtered.map((lot) => (
              <LotCard key={lot.mabaido} lot={lot} onEdit={() => navigate(`/admin/parking-lot/${lot.mabaido}/edit`)} onDetails={() => navigate(`/admin/parking-lot/${lot.mabaido}/details`)} />
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex justify-center">
            <button onClick={() => navigate('/admin/parking-config')} className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg">
              <ArrowRight className="w-5 h-5" />
              Thêm bãi đỗ mới
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function StatCard({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: number; note: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-xl bg-purple-100 text-purple-700">{icon}</div>
        <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">{label}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{note}</div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-50 flex items-center justify-center text-4xl">🅿️</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có bãi đỗ nào</h3>
      <p className="text-gray-600 max-w-2xl mx-auto mb-6">Tạo bãi đỗ đầu tiên để quản lý đầy đủ bằng trang chỉnh sửa full-screen. Danh sách này chỉ giữ vai trò tinh gọn.</p>
      <button onClick={onCreate} className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition">
        <Building2 className="w-5 h-5" />
        Tạo bãi đỗ mới
      </button>
    </div>
  );
}

function LotCard({ lot, onEdit, onDetails }: { lot: ParkingLot; onEdit: () => void; onDetails: () => void }) {
  const vehicleTypes = new Set(lot.pricing.map((p: any) => p.kieuxe).filter(Boolean));
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-purple-300 transition-all">
      <div className="relative h-56 bg-gray-100">
        <img src={lot.hinhanh || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1600'} alt={lot.tenbaido} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${lot.congkhai ? 'bg-emerald-500 text-white' : 'bg-gray-900/80 text-white'}`}>{lotStatusLabel(lot.congkhai)}</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-purple-700">{lot.mathamgia}</span>
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-900">{lot.availableSpots}/{lot.totalSpots} chỗ trống</div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-2xl font-bold mb-1 drop-shadow">{lot.tenbaido}</h3>
          <div className="flex items-center gap-2 text-sm text-white/90"><MapPin className="w-4 h-4" /><span className="line-clamp-1">{lot.diachi}</span></div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat label="Khu vực" value={lot.zonesCount} tone="purple" />
          <MiniStat label="Vị trí" value={lot.totalSpots} tone="blue" />
          <MiniStat label="Xe hỗ trợ" value={vehicleTypes.size} tone="emerald" />
          <MiniStat label="Tiện ích" value={lot.amenitiesCount} tone="amber" />
        </div>

        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>Giờ hoạt động: <strong>{lot.giohoatdong}</strong></span></div>
          <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span>Đánh giá: <strong>{lot.ratingsCount || 'Chưa có'}</strong> (đang phát triển)</span></div>
          <div className="text-gray-600 leading-6">{lot.mota || 'Chưa có mô tả'}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          {lot.amenities.slice(0, 4).map((a: AmenityRow) => (
            <span key={a.matienich} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">{a.ten_tien_ich}</span>
          ))}
          {lot.amenities.length > 4 && <span className="text-sm text-gray-500 self-center">+{lot.amenities.length - 4}</span>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onEdit} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition font-bold flex items-center justify-center gap-2">
            <Eye className="w-5 h-5" />
            Chỉnh sửa
          </button>
          <button onClick={onDetails} className="bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition font-bold flex items-center justify-center gap-2 border-2 border-gray-300">
            <Star className="w-5 h-5" />
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone: 'purple' | 'blue' | 'emerald' | 'amber' }) {
  const cls = {
    purple: 'bg-purple-50 border-purple-100 text-purple-500',
    blue: 'bg-blue-50 border-blue-100 text-blue-500',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-500',
    amber: 'bg-amber-50 border-amber-100 text-amber-500',
  }[tone];
  return (
    <div className={`rounded-2xl border p-3 ${cls}`}>
      <div className="text-xs font-semibold uppercase">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

// ================================
// FULL-SCREEN EDIT PAGE
// Route suggested: /admin/parking-lot/:id/edit
// ================================

export const ParkingLotEditPage = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const lotId = params.get('id') ?? window.location.pathname.split('/').filter(Boolean).slice(-2, -1)[0] ?? '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'media' | 'zones' | 'pricing' | 'amenities' | 'danger'>('overview');
  const [lot, setLot] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      if (!lotId) throw new Error('Thiếu mã bãi đỗ');
      const { data: base, error } = await supabase.from('baido').select('*').eq('mabaido', lotId).eq('manguoidung', userId).maybeSingle();
      if (error) throw error;
      if (!base) throw new Error('Không tìm thấy bãi đỗ hoặc bạn không có quyền truy cập');

      const full = await loadMyParkingLots(userId);
      const current = full.find((x) => x.mabaido === lotId);
      if (!current) throw new Error('Không tải được dữ liệu bãi đỗ');
      setLot({ ...base, ...current });
    } catch (error: any) {
      toast.error(error?.message ?? 'Không tải được bãi đỗ');
      navigate('/admin/my-parking-lots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [lotId]);

  const saveLot = async (payload: Record<string, any>) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('baido').update(payload).eq('mabaido', lotId);
      if (error) throw error;
      toast.success('Đã lưu thay đổi');
      await load();
    } catch (error: any) {
      toast.error(error?.message ?? 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !lot) {
    return <div className="min-h-screen grid place-items-center text-gray-600">Đang tải bãi đỗ...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/admin/my-parking-lots')} className="p-2 rounded-full hover:bg-gray-100 transition"><ArrowLeft className="w-5 h-5" /></button>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Chỉnh sửa bãi đỗ</div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{lot.tenbaido}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => saveLot({ congkhai: !lot.congkhai })} disabled={saving} className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 font-semibold">
              {lot.congkhai ? 'Ẩn bãi đỗ' : 'Công khai'}
            </button>
            <button onClick={() => navigate(`/admin/parking-lot/${lotId}/details`)} className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black font-semibold">
              Xem chi tiết
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto">
            {[
              ['overview', 'Thông tin bãi đỗ'],
              ['media', 'Ảnh đại diện'],
              ['zones', 'Sân đỗ / vị trí'],
              ['pricing', 'Bảng giá'],
              ['amenities', 'Tiện ích'],
              ['danger', 'Xóa bãi đỗ'],
            ].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key as any)} className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold border transition ${activeTab === key ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          {activeTab === 'overview' && <LotOverviewForm lot={lot} onSave={saveLot} saving={saving} />}
          {activeTab === 'media' && <LotMediaForm lot={lot} onSaved={load} />}
          {activeTab === 'zones' && <ZoneManager lot={lot} onRefresh={load} />}
          {activeTab === 'pricing' && <PricingManager lot={lot} onRefresh={load} />}
          {activeTab === 'amenities' && <AmenityManager lot={lot} onRefresh={load} />}
          {activeTab === 'danger' && <DangerZone lot={lot} onDeleted={() => navigate('/admin/my-parking-lots')} />}
        </div>

        <aside className="xl:col-span-4 space-y-6">
          <PreviewCard lot={lot} />
          <QuickSummary lot={lot} />
        </aside>
      </div>
    </div>
  );
};

function PreviewCard({ lot }: { lot: any }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-56 bg-gray-100 relative">
        <img src={lot.hinhanh || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1600'} className="w-full h-full object-cover" alt={lot.tenbaido} />
      </div>
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <MapPin className="w-4 h-4" /> {lot.mathamgia}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{lot.tenbaido}</h3>
        <p className="text-sm text-gray-600 leading-6">{lot.mota || 'Chưa có mô tả'}</p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <MiniStat label="Khu vực" value={lot.zonesCount} tone="purple" />
          <MiniStat label="Vị trí" value={lot.totalSpots} tone="blue" />
          <MiniStat label="Trống" value={lot.availableSpots} tone="emerald" />
          <MiniStat label="Tiện ích" value={lot.amenitiesCount} tone="amber" />
        </div>
      </div>
    </div>
  );
}

function QuickSummary({ lot }: { lot: any }) {
  const vehicleTypes = [...new Set((lot.pricing ?? []).map((p: any) => p.loaixe))];
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Tóm tắt</h3>
        <p className="text-sm text-gray-500">Dữ liệu lấy trực tiếp từ Supabase</p>
      </div>
      <div className="space-y-3 text-sm">
        <SummaryRow label="Trạng thái" value={lot.congkhai ? 'Công khai' : 'Riêng tư'} />
        <SummaryRow label="Loại xe" value={vehicleTypes.length ? vehicleTypes.join(', ') : 'Chưa có'} />
        <SummaryRow label="Bảng giá" value={`${lot.pricingCount} dòng`} />
        <SummaryRow label="Sân đỗ" value={`${lot.zonesCount} khu vực`} />
        <SummaryRow label="Vị trí" value={`${lot.totalSpots} vị trí`} />
        <SummaryRow label="Tiện ích" value={`${lot.amenitiesCount} tiện ích`} />
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <div className="text-gray-500">{label}</div>
      <div className="text-right font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function LotOverviewForm({ lot, onSave, saving }: { lot: any; onSave: (payload: Record<string, any>) => void; saving: boolean }) {
  const [form, setForm] = useState({
    tenbaido: lot.tenbaido ?? '',
    mathamgia: lot.mathamgia ?? '',
    diachi: lot.diachi ?? '',
    sodienthoai: lot.sodienthoai ?? '',
    giohoatdong: lot.giohoatdong ?? '',
    mota: lot.mota ?? '',
  });

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Thông tin bãi đỗ</h2>
        <p className="text-sm text-gray-500 mt-1">Sửa nhanh tên, địa chỉ, mô tả, giờ hoạt động. Ảnh và các phần khác nằm ở tab riêng.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Tên bãi đỗ" value={form.tenbaido} onChange={(v) => setForm({ ...form, tenbaido: v })} />
        <Field label="Mã cộng đồng" value={form.mathamgia} onChange={(v) => setForm({ ...form, mathamgia: v })} />
        <Field label="Địa chỉ" value={form.diachi} onChange={(v) => setForm({ ...form, diachi: v })} className="md:col-span-2" />
        <Field label="Số điện thoại" value={form.sodienthoai} onChange={(v) => setForm({ ...form, sodienthoai: v })} />
        <Field label="Giờ hoạt động" value={form.giohoatdong} onChange={(v) => setForm({ ...form, giohoatdong: v })} />
        <Field label="Mô tả" value={form.mota} onChange={(v) => setForm({ ...form, mota: v })} className="md:col-span-2" textarea />
      </div>
      <div className="flex justify-end">
        <button onClick={() => onSave(form)} disabled={saving} className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-60">
          Lưu thông tin bãi đỗ
        </button>
      </div>
    </div>
  );
}

function LotMediaForm({ lot, onSaved }: { lot: any; onSaved: () => void }) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('BaiDo').upload(fileName, file);
      if (error) throw error;
      const { data: publicUrl } = supabase.storage.from('BaiDo').getPublicUrl(data.path);
      const { error: updateError } = await supabase.from('baido').update({ hinhanh: publicUrl.publicUrl }).eq('mabaido', lot.mabaido);
      if (updateError) throw updateError;
      toast.success('Đã cập nhật ảnh bãi đỗ');
      onSaved();
    } catch (error: any) {
      toast.error(error?.message ?? 'Tải ảnh thất bại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ảnh đại diện bãi đỗ</h2>
        <p className="text-sm text-gray-500 mt-1">Đổi ảnh ở đây. Ảnh sân đỗ sẽ chỉnh ở từng khu vực bên dưới.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
          <img src={lot.hinhanh || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1600'} alt={lot.tenbaido} className="w-full h-72 object-cover" />
        </div>
        <div className="space-y-4">
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white" />
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            Ảnh bãi đỗ là ảnh đại diện chung. Ảnh của từng sân/khu vực sẽ chỉnh riêng ở tab Sân đỗ / vị trí.
          </div>
          {uploading && <div className="text-sm text-gray-500">Đang tải ảnh...</div>}
        </div>
      </div>
    </div>
  );
}

function ZoneManager({ lot, onRefresh }: { lot: any; onRefresh: () => void }) {
  const [savingZoneId, setSavingZoneId] = useState<string | null>(null);

 const updateZone = async (zoneId: string, payload: Record<string, any>) => {
  setSavingZoneId(zoneId);
  try {
    const { error } = await supabase.from('khuvudo').update(payload).eq('makhuvuc', zoneId);
    if (error) throw error;
    toast.success('Đã lưu sân đỗ');
  } catch (error: any) {
    toast.error(error?.message ?? 'Lưu khu vực thất bại');
  } finally {
    setSavingZoneId(null);
  }
};

  const deleteZone = async (zone: any) => {
    if (!window.confirm(`Xóa sân đỗ "${zone.tenkhuvuc}" cùng toàn bộ vị trí bên trong?`)) return;
    try {
      const spotIds = (zone.spots ?? []).map((s: any) => s.mavitri);
      if (spotIds.length) await supabase.from('vitrido').delete().in('mavitri', spotIds);
      await supabase.from('phuongtienhotro').delete().eq('makhuvuc', zone.makhuvuc);
      const { error } = await supabase.from('khuvudo').delete().eq('makhuvuc', zone.makhuvuc);
      if (error) throw error;
      toast.success('Đã xóa sân đỗ');
      onRefresh();
    } catch (error: any) {
      toast.error(error?.message ?? 'Xóa sân thất bại');
    }
  };

  return (
    <div className="space-y-4">
      <EditorSectionTitle title="Sân đỗ / khu vực" desc="Sửa tên sân, ảnh sân, mô tả, loại xe hỗ trợ, và vị trí bên trong từng sân." />
      {(lot.zones ?? []).map((zone: any) => (
        <ZoneEditor key={zone.makhuvuc} zone={zone} onSave={updateZone} onDelete={deleteZone} saving={savingZoneId === zone.makhuvuc} onRefresh={onRefresh} lotId={lot.mabaido} />
      ))}
      <AddZoneForm lotId={lot.mabaido} onCreated={onRefresh} />
    </div>
  );
}

type DraftSpot = {
  id: string;
  mavitri?: string;
  tenvitri: string;
  trangthai: number;
  mabanggia: string | null;
};

function ZoneEditor({
  zone,
  onSave,
  onDelete,
  saving,
  onRefresh,
  lotId,
}: {
  zone: any;
  onSave: (id: string, payload: Record<string, any>) => Promise<void> | void;
  onDelete: (zone: any) => void;
  saving: boolean;
  onRefresh: () => void;
  lotId: string;
}) {
  const [name, setName] = useState(zone.tenkhuvuc ?? '');
  const [desc, setDesc] = useState(zone.mota ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [supported, setSupported] = useState<string[]>(zone.supportedVehicleTypes ?? []);
  const [pricingOptions, setPricingOptions] = useState<any[]>([]);
  const [draftSpots, setDraftSpots] = useState<DraftSpot[]>(
    (zone.spots ?? []).map((s: any) => ({
      id: s.mavitri,
      mavitri: s.mavitri,
      tenvitri: s.tenvitri,
      trangthai: Number(s.trangthai ?? 0),
      mabanggia: s.mabanggia ?? null,
    }))
  );
  const [uploading, setUploading] = useState(false);
  const originalSpotIdsRef = useRef<string[]>(
    (zone.spots ?? []).map((s: any) => s.mavitri).filter(Boolean)
  );

  useEffect(() => {
    setName(zone.tenkhuvuc ?? '');
    setDesc(zone.mota ?? '');
    setSupported(zone.supportedVehicleTypes ?? []);
    setDraftSpots(
      (zone.spots ?? []).map((s: any) => ({
        id: s.mavitri,
        mavitri: s.mavitri,
        tenvitri: s.tenvitri,
        trangthai: Number(s.trangthai ?? 0),
        mabanggia: s.mabanggia ?? null,
      }))
    );
    originalSpotIdsRef.current = (zone.spots ?? []).map((s: any) => s.mavitri).filter(Boolean);
    loadPricing();
  }, [zone.makhuvuc]);

  const loadPricing = async () => {
    const { data } = await supabase
      .from('banggia')
      .select('mabanggia, loaixe, loaigia, kieuxe, mabaido')
      .eq('mabaido', lotId);

    setPricingOptions(data ?? []);
  };

  const syncSupport = async (zoneId: string, nextTypes: string[]) => {
    const { data: allPricing } = await supabase
      .from('banggia')
      .select('mabanggia, loaixe')
      .eq('mabaido', lotId);

    const selectedIds = (allPricing ?? [])
      .filter((p: any) => nextTypes.includes(p.loaixe))
      .map((p: any) => p.mabanggia);

    await supabase.from('phuongtienhotro').delete().eq('makhuvuc', zoneId);

    if (selectedIds.length) {
      await supabase.from('phuongtienhotro').insert(
        selectedIds.map((mabanggia) => ({
          makhuvuc: zoneId,
          mabanggia,
        }))
      );
    }
  };

  const uploadZoneImage = async () => {
    if (!imageFile) return null;
    setUploading(true);
    try {
      const fileName = `${Date.now()}_${imageFile.name}`;
      const { data, error } = await supabase.storage.from('SanDo').upload(fileName, imageFile);
      if (error) throw error;
      const { data: publicUrl } = supabase.storage.from('SanDo').getPublicUrl(data.path);
      return publicUrl.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const addSpot = (mabanggia: string | null = null) => {
    const nextNumber = draftSpots.length + 1;
    const nextName = `${name || 'A'}${String(nextNumber).padStart(3, '0')}`;

    setDraftSpots((prev) => [
      ...prev,
      {
        id: `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        tenvitri: nextName,
        trangthai: 0,
        mabanggia,
      },
    ]);
  };

  const applyPricingToAll = (mabanggia: string | null) => {
    setDraftSpots((prev) => prev.map((spot) => ({ ...spot, mabanggia })));
  };

  const updateSpot = (spotId: string, patch: Partial<DraftSpot>) => {
    setDraftSpots((prev) => prev.map((spot) => (spot.id === spotId ? { ...spot, ...patch } : spot)));
  };

  const removeSpot = (spotId: string) => {
    setDraftSpots((prev) => prev.filter((spot) => spot.id !== spotId));
  };

  const save = async () => {
    const imageUrl = imageFile ? await uploadZoneImage() : undefined;

    await onSave(zone.makhuvuc, {
      tenkhuvuc: name,
      mota: desc,
      ...(imageUrl ? { hinhkhuvuc: imageUrl } : {}),
    });

    if (JSON.stringify(supported) !== JSON.stringify(zone.supportedVehicleTypes ?? [])) {
      await syncSupport(zone.makhuvuc, supported);
    }

    const currentDbSpotIds = draftSpots.map((s) => s.mavitri).filter(Boolean) as string[];
    const removedIds = originalSpotIdsRef.current.filter((id) => !currentDbSpotIds.includes(id));

    if (removedIds.length > 0) {
      const { error } = await supabase.from('vitrido').delete().in('mavitri', removedIds);
      if (error) throw error;
    }

    for (const spot of draftSpots) {
      const payload = {
        tenvitri: spot.tenvitri,
        trangthai: Number(spot.trangthai ?? 0),
        makhuvuc: zone.makhuvuc,
        mabanggia: spot.mabanggia || null,
      };

      if (spot.mavitri) {
        const { error } = await supabase.from('vitrido').update(payload).eq('mavitri', spot.mavitri);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('vitrido').insert(payload);
        if (error) throw error;
      }
    }

    toast.success('Đã lưu sân đỗ');
    onRefresh();
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{zone.tenkhuvuc}</h3>
          <p className="text-sm text-gray-500">Ảnh sân, mô tả, loại xe hỗ trợ, vị trí đỗ và gán bảng giá.</p>
        </div>
        <button
          onClick={() => onDelete(zone)}
          className="px-4 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-semibold text-sm"
        >
          Xóa sân
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Tên khu vực" value={name} onChange={setName} />

        <div>
          <label className="block text-sm mb-2 text-gray-700 font-medium">Ảnh khu vực</label>

          {zone.hinhkhuvuc && (
            <div className="mb-3 rounded-xl overflow-hidden border border-gray-200">
              <img src={zone.hinhkhuvuc} alt={zone.tenkhuvuc} className="w-full h-40 object-cover" />
            </div>
          )}

          {imageFile && (
            <div className="mb-3 rounded-xl overflow-hidden border border-blue-200">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="preview"
                className="w-full h-40 object-cover"
              />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
          />
        </div>

        <Field label="Mô tả khu vực" value={desc} onChange={setDesc} textarea className="md:col-span-2" />
      </div>

      <div>
        <label className="block text-sm mb-2 text-gray-700 font-medium">Phương tiện hỗ trợ</label>
        <div className="flex flex-wrap gap-2">
          {(pricingOptions ?? []).map((p: any) => (
            <label
              key={p.mabanggia}
              className="inline-flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={supported.includes(p.loaixe)}
                onChange={(e) =>
                  setSupported((prev) =>
                    e.target.checked ? [...prev, p.loaixe] : prev.filter((x) => x !== p.loaixe)
                  )
                }
              />
              <span className="text-sm text-gray-700">
                {p.loaixe} <span className="text-[10px] text-gray-500">({p.kieuxe})</span>
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Không check gì thì không hiện gì.</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h4 className="font-semibold text-gray-800">Vị trí đỗ</h4>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm"
              onChange={(e) => applyPricingToAll(e.target.value || null)}
              defaultValue=""
            >
              <option value="">Chọn xe để áp dụng cho tất cả</option>
              {pricingOptions.map((p) => (
                <option key={p.mabanggia} value={p.mabanggia}>
                  {p.loaixe} · {p.loaigia} · {p.kieuxe}
                </option>
              ))}
            </select>

            <button
              onClick={() => addSpot(null)}
              className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 font-semibold text-sm"
            >
              + Thêm vị trí
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {draftSpots.map((spot) => (
            <div key={spot.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    const next = window.prompt('Đổi tên vị trí', spot.tenvitri)?.trim();
                    if (!next || next === spot.tenvitri) return;
                    updateSpot(spot.id, { tenvitri: next });
                  }}
                  className="font-semibold text-gray-800 hover:underline text-left"
                >
                  {spot.tenvitri}
                </button>

                <button
                  onClick={() => removeSpot(spot.id)}
                  className="text-red-500 text-sm"
                >
                  ×
                </button>
              </div>

              <div className="text-xs text-gray-500">
                Trạng thái: {spot.trangthai === 0 ? 'Trống' : spot.trangthai === 1 ? 'Có người' : 'Đặt trước'}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Xe được phép</label>
                <select
                  value={spot.mabanggia ?? ''}
                  onChange={(e) => updateSpot(spot.id, { mabanggia: e.target.value || null })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm"
                >
                  <option value="">Chưa gán</option>
                  {pricingOptions.map((p) => (
                    <option key={p.mabanggia} value={p.mabanggia}>
                      {p.loaixe} · {p.loaigia} · {p.kieuxe}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-2">Chỉnh ở đây chỉ là nháp. Chỉ lưu khi bấm “Lưu sân đỗ”.</p>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={save}
          disabled={saving || uploading}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-60"
        >
          Lưu sân đỗ
        </button>
      </div>
    </div>
  );
}


function SpotCard({
  spot,
  pricingOptions,
  
}: {
  spot: any;
  pricingOptions: any[];
  onRefresh: () => void;
}) {
  const [selectedPricingId, setSelectedPricingId] = useState<string>(spot.mabanggia ?? '');

  useEffect(() => {
    setSelectedPricingId(spot.mabanggia ?? '');
  }, [spot.mavitri, spot.mabanggia]);

  const rename = async () => {
    const next = window.prompt('Đổi tên vị trí', spot.tenvitri)?.trim();
    if (!next || next === spot.tenvitri) return;

    const { error } = await supabase
      .from('vitrido')
      .update({ tenvitri: next })
      .eq('mavitri', spot.mavitri);

    if (error) return toast.error(error.message);

    toast.success('Đã đổi tên vị trí');
    
  };

  const updateVehicle = async (mabanggia: string) => {
    const { error } = await supabase
      .from('vitrido')
      .update({ mabanggia: mabanggia || null })
      .eq('mavitri', spot.mavitri);

    if (error) return toast.error(error.message);

    setSelectedPricingId(mabanggia);
    toast.success('Đã cập nhật xe cho vị trí');
    
  };

  const remove = async () => {
    if (!window.confirm(`Xóa vị trí ${spot.tenvitri}?`)) return;

    const { error } = await supabase.from('vitrido').delete().eq('mavitri', spot.mavitri);
    if (error) return toast.error(error.message);

    toast.success('Đã xóa vị trí');
   
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button onClick={rename} className="font-semibold text-gray-800 hover:underline">
          {spot.tenvitri}
        </button>
        <button onClick={remove} className="text-red-500 text-sm">×</button>
      </div>

      <div className="text-xs text-gray-500">
        Trạng thái: {spot.trangthai === 0 ? 'Trống' : spot.trangthai === 1 ? 'Có người' : 'Đặt trước'}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Xe được phép</label>
        <select
          value={selectedPricingId}
          onChange={(e) => updateVehicle(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm"
        >
          <option value="">Chưa gán</option>
          {pricingOptions.map((p) => (
            <option key={p.mabanggia} value={p.mabanggia}>
              {p.loaixe} · {p.loaigia}
            </option>
          ))}
        </select>
      </div>

      {spot.pricing && (
        <div className="text-xs text-emerald-700">
          Đang gán: <strong>{spot.pricing.loaixe}</strong>
        </div>
      )}
    </div>
  );
}

type PricingDraftRow = PricingRow & {
  coinPrice?: number;
  isNew?: boolean;
};

function PricingManager({ lot, onRefresh }: { lot: any; onRefresh: () => void }) {
  const [rows, setRows] = useState<PricingDraftRow[]>(lot.pricing ?? []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRows(lot.pricing ?? []);
  }, [lot.mabaido]);

  const addRow = (group: 'car' | 'motorcycle') => {
    setRows((prev) => [
      ...prev,
      {
        mabanggia: `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        loaixe: '',
        loaigia: 'fixed',
        thanhtien: 0,
        thanhtoanxuao: false,
        mabaido: lot.mabaido,
        kieuxe: group,
        coinPrice: 0,
        isNew: true,
      },
    ]);
  };

  const updateRow = (idx: number, next: PricingDraftRow) => {
    setRows((prev) => prev.map((x, i) => (i === idx ? next : x)));
  };

  const removeRowLocal = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const save = async () => {
    setSaving(true);
    try {
      for (const row of rows) {
        const payload = {
          loaixe: row.loaixe,
          loaigia: row.thanhtoanxuao ? 'fixed' : row.loaigia,
          thanhtien: Number(row.thanhtien ?? 0),
          thanhtoanxuao: Boolean(row.thanhtoanxuao),
          mabaido: lot.mabaido,
          kieuxe: row.kieuxe, // car | motorcycle
        };

        if (row.isNew) {
          const { data, error } = await supabase
            .from('banggia')
            .insert(payload)
            .select()
            .single();

          if (error) throw error;

          if (row.thanhtoanxuao) {
            const { error: coinErr } = await supabase.from('banggiaxuao').insert({
              mabanggia: data.mabanggia,
              thanhxu: Number(row.coinPrice ?? 0),
            });

            if (coinErr) throw coinErr;
          }
        } else {
          const { error } = await supabase
            .from('banggia')
            .update(payload)
            .eq('mabanggia', row.mabanggia);

          if (error) throw error;

          if (row.thanhtoanxuao) {
            const { error: coinUpsertError } = await supabase.from('banggiaxuao').upsert({
              mabanggia: row.mabanggia,
              thanhxu: Number(row.coinPrice ?? 0),
            });

            if (coinUpsertError) throw coinUpsertError;
          } else {
            await supabase.from('banggiaxuao').delete().eq('mabanggia', row.mabanggia);
          }
        }
      }

      toast.success('Đã lưu bảng giá');
      onRefresh();
    } catch (error: any) {
      toast.error(error?.message ?? 'Lưu bảng giá thất bại');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: PricingDraftRow, idx: number) => {
    if (!window.confirm('Xóa dòng bảng giá này?')) return;

    if (row.isNew) {
      removeRowLocal(idx);
      return;
    }

    await supabase.from('banggiaxuao').delete().eq('mabanggia', row.mabanggia);
    await supabase.from('banggia').delete().eq('mabanggia', row.mabanggia);

    toast.success('Đã xóa dòng giá');
    onRefresh();
  };

  const renderGroup = (group: 'motorcycle' | 'car', title: string, titleColor: string, addText: string) => {
    const groupRows = rows
      .map((row, idx) => ({ row, idx }))
      .filter(({ row }) => row.kieuxe === group);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-bold ${titleColor}`}>{title}</h3>
          <button
            onClick={() => addRow(group)}
            className="border-2 border-dashed border-gray-300 px-4 py-2 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {addText}
          </button>
        </div>

        {groupRows.map(({ row, idx }, displayIndex) => (
          <PricingRowCard
            key={row.mabanggia}
            row={row}
            label={`Cấu hình loại xe #${displayIndex + 1}`}
            onChange={(next) => updateRow(idx, next)}
            onRemove={() => remove(row, idx)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-5">
      <EditorSectionTitle
        title="Bảng giá"
        desc="Tách riêng 2 miền: xe máy và xe ô tô. `kieuxe` chỉ lưu DB, không cần nhập tay trên UI."
      />

      <div className="space-y-8">
        {renderGroup('motorcycle', '🏍 Xe máy', 'text-purple-700', 'Thêm xe máy')}
        {renderGroup('car', '🚗 Xe ô tô', 'text-indigo-700', 'Thêm xe ô tô')}
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold disabled:opacity-60"
        >
          Lưu bảng giá
        </button>
      </div>
    </div>
  );
}

function PricingRowCard({
  row,
  label,
  onChange,
  onRemove,
}: {
  row: any;
  label: string;
  onChange: (next: any) => void;
  onRemove: () => void;
}) {
  const isCoin = Boolean(row.thanhtoanxuao);

  return (
    <div className={`rounded-3xl border p-4 ${isCoin ? 'border-yellow-300 bg-yellow-50/40' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-gray-700">{label}</span>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={isCoin}
            onChange={(e) =>
              onChange({
                ...row,
                thanhtoanxuao: e.target.checked,
                loaigia: e.target.checked ? 'fixed' : row.loaigia,
              })
            }
          />
          Thanh toán xu ảo
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <Field label="Loại xe" value={row.loaixe ?? ''} onChange={(v) => onChange({ ...row, loaixe: v })} />
        <div>
          <label className="block text-sm mb-2 text-gray-700 font-medium">Loại giá</label>
          <select
            value={row.loaigia ?? 'fixed'}
            disabled={isCoin}
            onChange={(e) => onChange({ ...row, loaigia: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white disabled:bg-gray-100"
          >
            <option value="fixed">Cố định</option>
            <option value="hourly">Theo giờ</option>
            <option value="daily">Theo ngày</option>
          </select>
        </div>

        <Field
          label="Giá VNĐ"
          value={String(row.thanhtien ?? 0)}
          onChange={(v) => onChange({ ...row, thanhtien: v })}
          type="number"
        />

        <Field
          label="Giá xu ảo"
          value={String(row.coinPrice ?? 0)}
          onChange={(v) => onChange({ ...row, coinPrice: v })}
          type="number"
          disabled={!isCoin}
        />

        <div className="space-y-2">
          <button
            onClick={onRemove}
            className="w-full px-4 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-semibold"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}



function AmenityManager({ lot, onRefresh }: { lot: any; onRefresh: () => void }) {
  const [items, setItems] = useState<AmenityRow[]>(lot.amenities ?? []);
  const [newName, setNewName] = useState('');

  useEffect(() => setItems(lot.amenities ?? []), [lot.mabaido]);

  const add = async () => {
    if (!newName.trim()) return;
    await supabase.from('tienich').insert({ mabaido: lot.mabaido, ten_tien_ich: newName.trim() });
    setNewName('');
    toast.success('Đã thêm tiện ích');
    onRefresh();
  };

  const rename = async (item: AmenityRow) => {
    const next = window.prompt('Sửa tiện ích', item.ten_tien_ich)?.trim();
    if (!next || next === item.ten_tien_ich) return;
    await supabase.from('tienich').update({ ten_tien_ich: next }).eq('matienich', item.matienich);
    toast.success('Đã cập nhật tiện ích');
    onRefresh();
  };

  const remove = async (item: AmenityRow) => {
    if (!window.confirm(`Xóa tiện ích ${item.ten_tien_ich}?`)) return;
    await supabase.from('tienich').delete().eq('matienich', item.matienich);
    toast.success('Đã xóa tiện ích');
    onRefresh();
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-5">
      <EditorSectionTitle title="Tiện ích" desc="Tiện ích là dữ liệu text riêng. Bạn tự thêm, sửa, xóa bất kỳ lúc nào." />
      <div className="flex gap-3">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ví dụ: Wifi tốt, Camera 24/7..." className="flex-1 px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-purple-500" />
        <button onClick={add} className="px-5 py-3 rounded-xl bg-purple-600 text-white font-semibold">Thêm</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item.matienich} className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm">
            <button onClick={() => rename(item)} className="font-medium text-gray-800 hover:underline">{item.ten_tien_ich}</button>
            <button onClick={() => remove(item)} className="text-red-500">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

function DangerZone({ lot, onDeleted }: { lot: any; onDeleted: () => void }) {
  const deleteAll = async () => {
    if (!window.confirm(`Xóa toàn bộ bãi đỗ ${lot.tenbaido}? Hành động này sẽ xóa sân, vị trí, bảng giá, xu ảo và tiện ích liên quan.`)) return;
    const zones = lot.zones ?? [];
    const pricing = lot.pricing ?? [];
    try {
      for (const zone of zones) {
        await supabase.from('phuongtienhotro').delete().eq('makhuvuc', zone.makhuvuc);
        await supabase.from('vitrido').delete().eq('makhuvuc', zone.makhuvuc);
        await supabase.from('khuvudo').delete().eq('makhuvuc', zone.makhuvuc);
      }
      for (const p of pricing) {
        await supabase.from('banggiaxuao').delete().eq('mabanggia', p.mabanggia);
        await supabase.from('banggia').delete().eq('mabanggia', p.mabanggia);
      }
      await supabase.from('tienich').delete().eq('mabaido', lot.mabaido);
      const { error } = await supabase.from('baido').delete().eq('mabaido', lot.mabaido);
      if (error) throw error;
      toast.success('Đã xóa bãi đỗ');
      onDeleted();
    } catch (error: any) {
      toast.error(error?.message ?? 'Xóa bãi đỗ thất bại');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-red-200 shadow-sm p-6 space-y-4">
      <EditorSectionTitle title="Khu vực nguy hiểm" desc="Xóa bãi đỗ chỉ nên dùng khi bạn chắc chắn muốn xóa toàn bộ dữ liệu liên quan." />
      <button onClick={deleteAll} className="px-5 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700">Xóa toàn bộ bãi đỗ</button>
    </div>
  );
}

function AddZoneForm({ lotId, onCreated }: { lotId: string; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const add = async () => {
    let imageUrl = '';
    if (file) {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('SanDo').upload(fileName, file);
      if (error) throw error;
      const { data: publicUrl } = supabase.storage.from('SanDo').getPublicUrl(data.path);
      imageUrl = publicUrl.publicUrl;
    }
    const { error } = await supabase.from('khuvudo').insert({ tenkhuvuc: name, mota: desc, hinhkhuvuc: imageUrl, mabaido: lotId });
    if (error) throw error;
    toast.success('Đã thêm sân đỗ');
    onCreated();
  };

  return (
    <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-5 space-y-4">
      <h3 className="text-lg font-bold text-gray-900">Thêm sân đỗ mới</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Tên sân" value={name} onChange={setName} />
        <div>
          <label className="block text-sm mb-2 text-gray-700 font-medium">Ảnh sân</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white" />
        </div>
        <Field label="Mô tả" value={desc} onChange={setDesc} textarea className="md:col-span-2" />
      </div>
      <button onClick={add} className="px-5 py-3 rounded-xl bg-gray-900 text-white font-semibold">Tạo sân đỗ</button>
    </div>
  );
}

function Field({ label, value, onChange, textarea, type = 'text', className = '', disabled = false }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; type?: string; className?: string; disabled?: boolean }) {
  return (
    <div className={className}>
      <label className="block text-sm mb-2 text-gray-700 font-medium">{label}</label>
      {textarea ? (
        <textarea value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-purple-500 resize-none disabled:bg-gray-100" />
      ) : (
        <input type={type} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100" />
      )}
    </div>
  );
}

function EditorSectionTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>
    </div>
  );
}

// ================================
// FILE: src/pages/admin/parking/ParkingLotDetailsPage.tsx
// Trang xem chi tiết để sau này mở rộng riêng, hiện giữ tối giản.
// ================================

export const ParkingLotDetailsPage = () => {
  const navigate = useNavigate();
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const lotId = pathParts[pathParts.length - 2] ?? '';

  return (
    <div className="min-h-screen bg-gray-50 grid place-items-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Trang chi tiết</h1>
        <p className="text-gray-600">Chỗ này bạn có thể làm dashboard chi tiết: thống kê, đánh giá, lịch sử chỗ trống, biểu đồ doanh thu, log thay đổi. Hiện tại mình để tối giản để không làm rối luồng chính.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(`/admin/parking-lot/${lotId}/edit`)} className="px-5 py-3 rounded-xl bg-purple-600 text-white font-semibold">Quay lại chỉnh sửa</button>
          <button onClick={() => navigate('/admin/my-parking-lots')} className="px-5 py-3 rounded-xl border border-gray-300 font-semibold">Về danh sách</button>
        </div>
      </div>
    </div>
  );
};
