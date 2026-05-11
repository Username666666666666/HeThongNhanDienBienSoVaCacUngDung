import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Building2, CalendarRange, Clock, Eye, EyeOff,
  Filter, Grid3x3, Layers3, MapPin, Search, Star, Users, Plus, Maximize, Minimize, Camera, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase.ts';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix icon map
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapController = ({ center, isFullscreen }: { center: [number, number], isFullscreen: boolean }) => {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 16, { animate: true, duration: 1.5 }); }, [center, map]);
  useEffect(() => { setTimeout(() => { map.invalidateSize(); }, 200); }, [isFullscreen, map]);
  return null;
};

// ================================
// TYPES
// ================================

type PublicFilter = 'all' | 'public' | 'private';
type SortBy = 'newest' | 'name' | 'capacity';

type ZoneRow1 = {
  makhuvuc: string;
  tenkhuvuc: string;
  mota: string;
  hinhkhuvuc: string;
  is_vip: boolean;
  succhua_toida: number;
  han_muc_dat_truoc: number;
  camera_id: string;
  mabaido: string;
  mabanggia: string | null; // Danh sách ID bảng giá được áp dụng
  gates: any[];
};

type PricingRow1 = {
  mabanggia: string;
  ten_goi_gia: string;
  kieuxe: 'car' | 'motorcycle';
  phut_an_han: number;
  phut_block_dau: number;
  gia_block_dau: number;
  phut_block_tiep: number;
  gia_block_tiep: number;
  phu_phi_dem: number;
  mabaido: string;
  gio_bat_dau_dem: string;      // MỚI
  gio_ket_thuc_dem: string;     // MỚI
  phi_toi_da_ngay: number;      // MỚI
  thoi_gian_toi_da_ngay: number;// MỚI
};

// THÊM TYPE MỚI DƯỚI AmenityRow
type CardRow = {
  mathe: string;
  mabaido: string;
  loaithe: string;
  loaixe: string;
  gia_tien: number;
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
  kinh_do: number | null;
  vi_do: number | null;
  sodienthoai: string;
  giohoatdong: string;
  mota: string;
  hinhanh: string;
  congkhai: boolean;
  manguoidung: string;
  totalCapacity: number;
  zonesCount: number;
  pricingCount: number;
  amenitiesCount: number;
  gatesCount: number;
  ratingsCount: number;
  cardsCount: number;
  zones: ZoneRow1[];
  pricing: PricingRow1[];
  amenities: AmenityRow[];
  cards: CardRow[];
};

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
    .select('*')
    .eq('manguoidung', userId)
    .order('tenbaido', { ascending: true });

  if (lotError) throw lotError;
  if (!lots || lots.length === 0) return [];

  const lotIds = lots.map((l) => l.mabaido);

 const [
    { data: zones, error: zoneError },
    { data: amenities, error: amenityError },
    { data: pricing, error: pricingError },
    { data: gates, error: gateError },
    { data: subCards, error: subCardError } // THÊM DÒNG NÀY
  ] = await Promise.all([
    supabase.from('khuvucdo1').select('*').in('mabaido', lotIds),
    supabase.from('tienich').select('*').in('mabaido', lotIds),
    supabase.from('banggia1').select('*').in('mabaido', lotIds),
    supabase.from('congtruc').select('*'),
    supabase.from('the_thang_quy').select('*').in('mabaido', lotIds) // THÊM DÒNG NÀY
  ]);

  if (zoneError) console.error("Lỗi Zone:", zoneError);
  if (pricingError) console.error("Lỗi Pricing:", pricingError);
  if (subCardError) console.error("Lỗi Sub Cards:", subCardError);

  const gateMap = new Map<string, any[]>();
  (gates ?? []).forEach((g: any) => {
    if (!gateMap.has(g.makhuvuc)) gateMap.set(g.makhuvuc, []);
    gateMap.get(g.makhuvuc)!.push(g);
  });

  return lots.map((lot: any) => {
    const lotZones = (zones ?? [])
      .filter((z: any) => z.mabaido === lot.mabaido)
      .map((z: any) => ({
        ...z,
        gates: gateMap.get(z.makhuvuc) ?? [],
      }));

    const lotPricing = (pricing ?? []).filter((p: any) => p.mabaido === lot.mabaido);
    const totalCapacity = lotZones.reduce((sum, z) => sum + Number(z.succhua_toida || 0), 0);
    const gatesCount = lotZones.reduce((sum, z) => sum + (z.gates?.length ?? 0), 0);
    const amenitiesCount = (amenities ?? []).filter((a: any) => a.mabaido === lot.mabaido).length;

const lotCards = (subCards ?? []).filter((c: any) => c.mabaido === lot.mabaido); // Lọc thẻ của bãi đỗ này

    return {
      ...lot,
      totalCapacity,
      zonesCount: lotZones.length,
      pricingCount: lotPricing.length,
      amenitiesCount,
      gatesCount,
      ratingsCount: 0,
      cardsCount: lotCards.length,  // BỔ SUNG DÒNG NÀY
      zones: lotZones,
      pricing: lotPricing,
      amenities: (amenities ?? []).filter((a: any) => a.mabaido === lot.mabaido),
      cards: lotCards,              // BỔ SUNG DÒNG NÀY
    } as ParkingLot;
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

  useEffect(() => { reload(); }, []);

  const stats = useMemo(() => {
    return lots.reduce(
      (acc, lot) => ({
        total: acc.total + 1,
        public: acc.public + (lot.congkhai ? 1 : 0),
        hidden: acc.hidden + (!lot.congkhai ? 1 : 0),
        capacity: acc.capacity + lot.totalCapacity,
        zones: acc.zones + lot.zonesCount,
      }),
      { total: 0, public: 0, hidden: 0, capacity: 0, zones: 0 }
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
        const text = [lot.tenbaido, lot.mathamgia, lot.diachi, ...lot.zones.map(z => z.tenkhuvuc)].join(' ').toLowerCase();
        return text.includes(q);
      });
    }

    list.sort((a, b) => {
      if (sortBy === 'name') return a.tenbaido.localeCompare(b.tenbaido, 'vi');
      if (sortBy === 'capacity') return b.totalCapacity - a.totalCapacity;
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
              <h1 className="text-2xl mb-1 font-bold">Bãi đỗ của tôi</h1>
              <p className="text-purple-100 text-sm">Quản lý bãi đỗ thông minh AI Camera.</p>
            </div>
            <button onClick={() => navigate('/admin/parking-config')} className="hidden md:inline-flex items-center gap-2 bg-white text-purple-700 px-4 py-2 rounded-xl font-semibold hover:bg-purple-50 transition shadow">
              <Plus className="w-4 h-4" />
              Khởi tạo bãi đỗ
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard icon={<Building2 />} label="Tổng bãi" value={stats.total} note="bãi đỗ đang quản lý" />
          <StatCard icon={<Eye />} label="Công khai" value={stats.public} note="hiển thị cho người dùng" />
          <StatCard icon={<EyeOff />} label="Đang ẩn" value={stats.hidden} note="chỉ admin nhìn thấy" />
          <StatCard icon={<Layers3 />} label="Tổng Sức chứa" value={stats.capacity} note={`${stats.zones} khu vực`} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm bãi đỗ, khu vực..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none" />
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
                <option value="capacity">Sức chứa</option>
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
      <button onClick={onCreate} className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 transition">
        <Building2 className="w-5 h-5" /> Tạo bãi đỗ mới
      </button>
    </div>
  );
}

function LotCard({ lot, onEdit, onDetails }: { lot: ParkingLot; onEdit: () => void; onDetails: () => void }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
      <div className="relative h-56 bg-gray-100">
        <img src={lot.hinhanh || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1600'} alt={lot.tenbaido} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${lot.congkhai ? 'bg-emerald-500 text-white' : 'bg-gray-900/80 text-white'}`}>{lot.congkhai ? 'Công khai' : 'Đang ẩn'}</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-purple-700">{lot.mathamgia}</span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-2xl font-bold mb-1 drop-shadow">{lot.tenbaido}</h3>
          <div className="flex items-center gap-2 text-sm text-white/90"><MapPin className="w-4 h-4" /><span className="line-clamp-1">{lot.diachi}</span></div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat label="Khu vực" value={lot.zonesCount} tone="purple" />
          <MiniStat label="Sức chứa" value={lot.totalCapacity} tone="blue" />
          <MiniStat label="Gói giá" value={lot.pricingCount} tone="emerald" />
          <MiniStat label="Tiện ích" value={lot.amenitiesCount} tone="amber" />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button onClick={onEdit} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition font-bold flex items-center justify-center gap-2">
            <Eye className="w-5 h-5" /> Chỉnh sửa
          </button>
          <button onClick={onDetails} className="bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition font-bold flex items-center justify-center gap-2">
            <Star className="w-5 h-5" /> Xem chi tiết
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
// ================================

export const ParkingLotEditPage = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const lotId = params.get('id') ?? window.location.pathname.split('/').filter(Boolean).slice(-2, -1)[0] ?? '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'media' | 'zones' | 'pricing' | 'cards' | 'amenities' | 'gates' | 'danger'>('overview');
  const [lot, setLot] = useState<ParkingLot | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      if (!lotId) throw new Error('Thiếu mã bãi đỗ');
      const full = await loadMyParkingLots(userId);
      const current = full.find((x) => x.mabaido === lotId);
      if (!current) throw new Error('Không tìm thấy bãi đỗ');
      setLot(current);
    } catch (error: any) {
      toast.error(error?.message ?? 'Không tải được bãi đỗ');
      navigate('/admin/my-parking-lots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [lotId]);

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

  if (loading || !lot) return <div className="min-h-screen grid place-items-center">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/admin/my-parking-lots')} className="p-2 rounded-full hover:bg-gray-100 transition"><ArrowLeft className="w-5 h-5" /></button>
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Chỉnh sửa bãi đỗ AI</div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{lot.tenbaido}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => saveLot({ congkhai: !lot.congkhai })} disabled={saving} className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 font-semibold shadow-sm">
              {lot.congkhai ? 'Ẩn bãi đỗ' : 'Công khai'}
            </button>
            <button onClick={() => navigate(`/admin/parking-lot/${lotId}/details`)} className="px-4 py-2 rounded-xl bg-gray-900 text-white font-semibold">Chi tiết</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto">
          {[
              ['overview', 'GPS & Thông tin'],
              ['media', 'Ảnh đại diện'],
              ['pricing', 'Giá Block'],
              ['cards', 'Thẻ dài hạn'], // THÊM DÒNG NÀY
              ['zones', 'Sân đỗ & Sức chứa'],
              ['amenities', 'Tiện ích'],
              ['gates', 'Thêm cổng'],
              ['danger', 'Xóa bãi'],
            ].map(([key, label]) => (
// ...
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
          {activeTab === 'pricing' && <PricingManager lot={lot} onRefresh={load} />}
          {activeTab === 'cards' && <CardManager lot={lot} onRefresh={load} />} {/* THÊM DÒNG NÀY */}
          {activeTab === 'zones' && <ZoneManager lot={lot} onRefresh={load} />}
          {activeTab === 'amenities' && <AmenityManager lot={lot} onRefresh={load} />}
          {activeTab === 'gates' && <GateManager lot={lot} onRefresh={load} />}
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

// ================================
// TAB: 1. OVERVIEW & GPS MAP
// ================================

function LotOverviewForm({ lot, onSave, saving }: { lot: ParkingLot; onSave: (p: any) => void; saving: boolean }) {
  const [form, setForm] = useState({
    tenbaido: lot.tenbaido ?? '',
    mathamgia: lot.mathamgia ?? '',
    diachi: lot.diachi ?? '',
    kinh_do: lot.kinh_do ? String(lot.kinh_do) : '',
    vi_do: lot.vi_do ? String(lot.vi_do) : '',
    sodienthoai: lot.sodienthoai ?? '',
    giohoatdong: lot.giohoatdong ?? '',
    mota: lot.mota ?? '',
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const searchTimeoutRef = useRef<any>(null);
  
  const initialLat = lot.vi_do || 10.762622;
  const initialLng = lot.kinh_do || 106.660172;
  const [mapCenter, setMapCenter] = useState<[number, number]>([initialLat, initialLng]);

  const handleInputSearch = (val: string) => {
    setSearchKey(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (val.trim().length < 3) { setSuggestions([]); return; }
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&countrycodes=vn&accept-language=vi-VN`);
        setSuggestions(await res.json());
      } catch (err) {}
    }, 500);
  };

  const LocationPicker = () => {
    useMapEvents({
      click: async (e) => {
        const lat = e.latlng.lat.toString();
        const lng = e.latlng.lng.toString();
        setForm(prev => ({ ...prev, vi_do: lat, kinh_do: lng }));
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi-VN`);
          const data = await res.json();
          setForm(prev => ({ ...prev, diachi: data.display_name || 'Vị trí đã ghim' }));
          toast.success('Đã cập nhật vị trí!');
        } catch (err) {}
      },
    });
    return form.vi_do ? <Marker position={[parseFloat(form.vi_do), parseFloat(form.kinh_do)]} /> : null;
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-5">
      <EditorSectionTitle title="Định vị & Thông tin cơ bản" desc="Cập nhật tọa độ GPS và thông tin liên hệ bãi đỗ." />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Tên bãi đỗ" value={form.tenbaido} onChange={(v) => setForm({ ...form, tenbaido: v })} />
        <Field label="Mã cộng đồng" value={form.mathamgia} disabled onChange={() => {}} />

        <div className="md:col-span-2 space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <label className="block text-sm font-bold text-blue-900">Bản đồ GPS</label>
          <div className="relative flex gap-2">
            <input type="text" value={searchKey} onChange={(e) => handleInputSearch(e.target.value)} placeholder="Gõ tìm địa chỉ (VD: Bến Nghé Quận 1)..." className="flex-1 px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500" />
            {suggestions.length > 0 && (
              <ul className="absolute top-[54px] left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-[10000] max-h-60 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <li key={idx} onClick={() => {
                    setMapCenter([parseFloat(item.lat), parseFloat(item.lon)]);
                    setForm(prev => ({ ...prev, vi_do: item.lat, kinh_do: item.lon, diachi: item.display_name }));
                    setSearchKey(item.display_name);
                    setSuggestions([]);
                  }} className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b text-sm"><MapPin className="w-4 h-4 inline-block mr-2 text-blue-500"/> {item.display_name}</li>
                ))}
              </ul>
            )}
          </div>

          <div className={isFullscreen ? 'fixed inset-4 z-[9999] bg-white p-2 rounded-2xl shadow-2xl flex flex-col' : 'h-[350px] relative rounded-xl border-2 border-blue-200 z-0'}>
            <button type="button" onClick={() => setIsFullscreen(!isFullscreen)} className="absolute top-4 right-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-md border hover:bg-gray-100 flex items-center gap-2 text-sm font-bold">
              {isFullscreen ? <Minimize className="w-4 h-4"/> : <Maximize className="w-4 h-4"/>} {isFullscreen ? 'Thu nhỏ' : 'Phóng to'}
            </button>
            <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%', borderRadius: '0.75rem', zIndex: 1 }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker />
              <MapController center={mapCenter} isFullscreen={isFullscreen} />
            </MapContainer>
          </div>
        </div>

        <Field label="Địa chỉ thực tế" value={form.diachi} onChange={(v) => setForm({ ...form, diachi: v })} className="md:col-span-2" disabled />
<Field label="Vĩ độ (Lat)" value={form.vi_do} onChange={(v) => setForm({ ...form, vi_do: v })} disabled />
<Field label="Kinh độ (Lng)" value={form.kinh_do} onChange={(v) => setForm({ ...form, kinh_do: v })} disabled />
        <Field label="Số điện thoại" value={form.sodienthoai} onChange={(v) => setForm({ ...form, sodienthoai: v })} />
        <Field label="Giờ hoạt động" value={form.giohoatdong} onChange={(v) => setForm({ ...form, giohoatdong: v })} />
        <Field label="Mô tả" value={form.mota} onChange={(v) => setForm({ ...form, mota: v })} textarea className="md:col-span-2" />
      </div>
      
      <div className="flex justify-end pt-2">
        <button onClick={() => onSave({ ...form, vi_do: parseFloat(form.vi_do), kinh_do: parseFloat(form.kinh_do) })} disabled={saving} className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:shadow-lg transition">Lưu Thông Tin</button>
      </div>
    </div>
  );
}

// ================================
// TAB: 2. MEDIA
// ================================
function LotMediaForm({ lot, onSaved }: { lot: ParkingLot; onSaved: () => void }) {
  // Logic giữ nguyên như cũ, chỉ upload ảnh cover
  const [uploading, setUploading] = useState(false);
  const upload = async (file: File) => {
    setUploading(true);
    try {
      const { data, error } = await supabase.storage.from('BaiDo').upload(`${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('BaiDo').getPublicUrl(data.path);
      await supabase.from('baido').update({ hinhanh: publicUrl }).eq('mabaido', lot.mabaido);
      toast.success('Cập nhật ảnh thành công');
      onSaved();
    } catch (e) { toast.error('Lỗi tải ảnh'); }
    setUploading(false);
  };
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
      <EditorSectionTitle title="Ảnh đại diện" desc="Ảnh này hiển thị ngoài danh sách bãi đỗ." />
      <div className="grid md:grid-cols-2 gap-6">
        <img src={lot.hinhanh || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a'} className="w-full h-64 object-cover rounded-xl border" alt="Cover" />
        <div className="space-y-4">
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} className="w-full border p-3 rounded-xl" />
          {uploading && <p className="text-sm text-purple-600 font-bold">Đang tải lên...</p>}
        </div>
      </div>
    </div>
  );
}

// ================================
// TAB: 3. PRICING (Khối Giá Lũy Tiến)
// ================================
function PricingManager({ lot, onRefresh }: { lot: ParkingLot; onRefresh: () => void }) {
  const [pricing, setPricing] = useState<PricingRow1[]>(lot.pricing || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => setPricing(lot.pricing || []), [lot.pricing]);

 const addPackage = (kieuxe: 'car' | 'motorcycle') => {
    setPricing([...pricing, {
      mabanggia: `tmp_${Date.now()}`,
      ten_goi_gia: `Gói mới`,
      kieuxe,
      phut_an_han: 15,
      phut_block_dau: 120,
      gia_block_dau: 0,
      phut_block_tiep: 60,
      gia_block_tiep: 0,
      phu_phi_dem: 0,
      gio_bat_dau_dem: '22:00',       // THÊM MỚI
      gio_ket_thuc_dem: '07:00',      // THÊM MỚI
      phi_toi_da_ngay: 20000,         // THÊM MỚI
      thoi_gian_toi_da_ngay: 720,     // THÊM MỚI
      mabaido: lot.mabaido
    }]);
  }

  const updatePkg = (idx: number, key: keyof PricingRow1, val: any) => {
    const newP = [...pricing];
    newP[idx] = { ...newP[idx], [key]: val } as PricingRow1;
    setPricing(newP);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      for (const p of pricing) {
        const payload = {
          ten_goi_gia: p.ten_goi_gia,
          kieuxe: p.kieuxe,
          phut_an_han: Number(p.phut_an_han),
          phut_block_dau: Number(p.phut_block_dau),
          gia_block_dau: Number(p.gia_block_dau),
          phut_block_tiep: Number(p.phut_block_tiep),
          gia_block_tiep: Number(p.gia_block_tiep),
          phu_phi_dem: Number(p.phu_phi_dem),
          mabaido: lot.mabaido
        };
        if (p.mabanggia.startsWith('tmp_')) {
          await supabase.from('banggia1').insert(payload);
        } else {
          await supabase.from('banggia1').update(payload).eq('mabanggia', p.mabanggia);
        }
      }
      toast.success('Đã lưu bảng giá');
      onRefresh();
    } catch (e) { toast.error('Lỗi lưu bảng giá'); }
    setSaving(false);
  };

  const removePkg = async (idx: number, id: string) => {
    if (!window.confirm("Xóa gói giá này?")) return;
    if (id.startsWith('tmp_')) {
      setPricing(pricing.filter((_, i) => i !== idx));
    } else {
      await supabase.from('phuongtienhotro').delete().eq('mabanggia', id);
      await supabase.from('banggia1').delete().eq('mabanggia', id);
      onRefresh();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-6">
      <EditorSectionTitle title="Cấu hình Giá Block" desc="Quản lý cấu trúc giá lũy tiến cho ô tô và xe máy." />
      
      {['car', 'motorcycle'].map((group) => (
        <div key={group} className="space-y-4 border-b pb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">{group === 'car' ? '🚗 Bảng giá Ô tô' : '🏍 Bảng giá Xe máy'}</h3>
            <button onClick={() => addPackage(group as any)} className="bg-blue-50 text-blue-700 font-bold px-4 py-2 rounded-lg text-sm">+ Thêm gói</button>
          </div>
          {pricing.map((p, i) => p.kieuxe === group && (
             <div key={i} className="border border-gray-200 rounded-2xl p-4 bg-gray-50 relative">
               <button onClick={() => removePkg(i, p.mabanggia)} className="absolute top-4 right-4 text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5"/></button>
               <Field label="Tên Gói (VD: Ô tô ngày thường)" value={p.ten_goi_gia} onChange={(v) => updatePkg(i, 'ten_goi_gia', v)} className="w-2/3 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <Field label="TG Ân hạn (phút)" type="number" value={String(p.phut_an_han)} onChange={(v) => updatePkg(i, 'phut_an_han', v)} />
                 <div className="hidden md:block"></div>
                 <Field label="Phút Block Đầu" type="number" value={String(p.phut_block_dau)} onChange={(v) => updatePkg(i, 'phut_block_dau', v)} />
                 <Field label="Giá Block Đầu (đ)" type="number" value={String(p.gia_block_dau)} onChange={(v) => updatePkg(i, 'gia_block_dau', v)} />
                 <Field label="Phút Block Tiếp" type="number" value={String(p.phut_block_tiep)} onChange={(v) => updatePkg(i, 'phut_block_tiep', v)} />
                 <Field label="Giá Block Tiếp (đ)" type="number" value={String(p.gia_block_tiep)} onChange={(v) => updatePkg(i, 'gia_block_tiep', v)} />
                 
                 {/* 4 CỘT MỚI TẠI ĐÂY */}
                 <Field label="Giờ bắt đầu đêm" type="time" value={p.gio_bat_dau_dem || '22:00'} onChange={(v) => updatePkg(i, 'gio_bat_dau_dem', v)} />
                 <Field label="Giờ kết thúc đêm" type="time" value={p.gio_ket_thuc_dem || '07:00'} onChange={(v) => updatePkg(i, 'gio_ket_thuc_dem', v)} />
                 <Field label="TG tối đa ngày (phút)" type="number" value={String(p.thoi_gian_toi_da_ngay || 720)} onChange={(v) => updatePkg(i, 'thoi_gian_toi_da_ngay', v)} />
                 <Field label="Giá trần ngày tối đa (đ)" type="number" value={String(p.phi_toi_da_ngay || 20000)} onChange={(v) => updatePkg(i, 'phi_toi_da_ngay', v)} />

                 <Field label="Phụ thu qua đêm (đ)" type="number" value={String(p.phu_phi_dem)} onChange={(v) => updatePkg(i, 'phu_phi_dem', v)} className="md:col-span-2" />
               </div>
             </div>
          ))}
        </div>
      ))}
      <div className="flex justify-end">
        <button onClick={saveAll} disabled={saving} className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700">Lưu Bảng Giá</button>
      </div>
    </div>
  );
}

// ================================
// TAB: 4. ZONES (AI Camera & Capacity)
// ================================
function ZoneManager({ lot, onRefresh }: { lot: ParkingLot; onRefresh: () => void }) {
  const [savingZone, setSavingZone] = useState<string|null>(null);

  const saveZone = async (z: ZoneRow1, imageFile: File | null) => {
    setSavingZone(z.makhuvuc);
    try {
      let imageUrl = z.hinhkhuvuc;
      if (imageFile) {
        const { data, error } = await supabase.storage.from('SanDo').upload(`zones/${Date.now()}_${imageFile.name}`, imageFile);
        if (!error && data) {
          imageUrl = supabase.storage.from('SanDo').getPublicUrl(data.path).data.publicUrl;
        }
      }

      const payload = {
        mabaido: lot.mabaido,
        tenkhuvuc: z.tenkhuvuc,
        mota: z.mota,
        hinhkhuvuc: imageUrl,
        is_vip: z.is_vip,
        succhua_toida: Number(z.succhua_toida),
        han_muc_dat_truoc: z.is_vip ? Number(z.han_muc_dat_truoc) : 0,
        camera_id: z.camera_id,
        mabanggia: z.mabanggia || null // Cập nhật trực tiếp khóa ngoại vào đây
      };

      if (z.makhuvuc.startsWith('tmp_')) {
        await supabase.from('khuvucdo1').insert(payload);
      } else {
        await supabase.from('khuvucdo1').update(payload).eq('makhuvuc', z.makhuvuc);
      }
      
      toast.success('Đã lưu Khu Vực');
      onRefresh();
    } catch (e) { toast.error('Lỗi lưu khu vực'); }
    setSavingZone(null);
  };

  const removeZone = async (id: string) => {
    if (!window.confirm("Xóa toàn bộ khu vực này?")) return;
    await supabase.from('congtruc').delete().eq('makhuvuc', id);
    await supabase.from('khuvucdo1').delete().eq('makhuvuc', id);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <EditorSectionTitle title="Khu vực đỗ (Zones)" desc="Sử dụng sức chứa tổng thay vì vẽ từng ô. AI Camera sẽ đếm số xe trống." />
      {lot.zones.map((z, i) => (
        <ZoneCard key={z.makhuvuc} zone={z} lotPricing={lot.pricing} onSave={saveZone} onRemove={() => removeZone(z.makhuvuc)} saving={savingZone === z.makhuvuc} />
      ))}
      <button onClick={() => saveZone({ makhuvuc: `tmp_${Date.now()}`, tenkhuvuc: 'Khu vực mới', mota:'', hinhkhuvuc:'', is_vip: false, succhua_toida: 50, han_muc_dat_truoc: 0, camera_id: '', mabaido: lot.mabaido, mabanggia: null, gates:[] }, null)} className="w-full border-2 border-dashed border-gray-300 py-4 rounded-xl text-gray-600 font-bold hover:border-purple-500 hover:text-purple-600">
  + Thêm Khu Vực Khác
</button>
    </div>
  );
}

// Thay thế TOÀN BỘ function ZoneCard bằng code sau:

function ZoneCard({ zone, lotPricing, onSave, onRemove, saving }: { zone: ZoneRow1, lotPricing: PricingRow1[], onSave: (z: ZoneRow1, f: File|null) => void, onRemove: () => void, saving: boolean }) {
  const [z, setZ] = useState(zone);
  const [file, setFile] = useState<File|null>(null);

  return (
    <div className={`bg-white rounded-3xl border-2 p-6 space-y-4 shadow-sm ${z.is_vip ? 'border-amber-400' : 'border-gray-200'}`}>
      <div className="flex justify-between border-b pb-3">
        <h3 className="text-xl font-bold flex items-center gap-2">
          {z.is_vip ? <Star className="text-amber-500"/> : <Layers3 className="text-gray-400"/>} {z.tenkhuvuc || 'Khu vực chưa đặt tên'}
        </h3>
        <button onClick={onRemove} className="text-red-500 text-sm font-bold">Xóa khu này</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Tên Khu Vực" value={z.tenkhuvuc} onChange={v => setZ({...z, tenkhuvuc: v})} />
        <label className="flex items-center gap-3 cursor-pointer bg-gray-50 border p-3 rounded-xl mt-7">
          <input type="checkbox" checked={z.is_vip} onChange={e => setZ({...z, is_vip: e.target.checked})} className="w-5 h-5 accent-amber-500" />
          <div><div className="font-bold">Là khu VIP / Đặt trước</div><div className="text-xs text-gray-500">Chặn khách vãng lai</div></div>
        </label>

        <Field label="Sức chứa vật lý tối đa" type="number" value={String(z.succhua_toida)} onChange={v => setZ({...z, succhua_toida: Number(v)})} />
        {z.is_vip && <Field label="Hạn mức Booking" type="number" value={String(z.han_muc_dat_truoc)} onChange={v => setZ({...z, han_muc_dat_truoc: Number(v)})} />}

        <div className="md:col-span-2 relative">
          <Camera className="w-5 h-5 absolute left-3 top-[34px] text-gray-400" />
          <Field label="Mã ID Camera AI đếm xe" value={z.camera_id || ''} onChange={v => setZ({...z, camera_id: v})} className="pl-10" />
        </div>

        {/* --- ĐOẠN ĐƯỢC SỬA: Chuyển sang Dropdown Select --- */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-bold text-gray-700">Áp dụng Gói Giá (Chỉ chọn 1)</label>
          <select 
            value={z.mabanggia || ''} 
            onChange={(e) => setZ({...z, mabanggia: e.target.value || null})}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="">-- Chọn một gói giá để áp dụng cho khu vực này --</option>
            {lotPricing.map(p => (
              <option key={p.mabanggia} value={p.mabanggia}>
                {p.ten_goi_gia} ({p.kieuxe === 'car' ? 'Ô tô' : 'Xe máy'})
              </option>
            ))}
          </select>
        </div>
        {/* ------------------------------------------------ */}

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-2">Ảnh Sơ Đồ/Khu Vực</label>
          {z.hinhkhuvuc && <img src={z.hinhkhuvuc} className="h-32 rounded-lg mb-2 object-cover" alt="zone"/>}
          <input type="file" onChange={e => setFile(e.target.files?.[0]||null)} className="w-full border p-2 rounded-xl" />
        </div>
      </div>

      <div className="flex justify-end pt-3">
        <button onClick={() => onSave(z, file)} disabled={saving} className="px-5 py-2 bg-purple-600 text-white rounded-lg font-bold">{saving ? 'Đang lưu...' : 'Lưu Khu Vực'}</button>
      </div>
    </div>
  );
}

// ================================
// TAB: 5 & 6 & 7 (Tiện ích, Cổng, Xóa)
// Giữ nguyên logic cũ
// ================================
function AmenityManager({ lot, onRefresh }: { lot: ParkingLot; onRefresh: () => void }) {
  const [name, setName] = useState('');
  const add = async () => {
    if(!name) return;
    await supabase.from('tienich').insert({ mabaido: lot.mabaido, ten_tien_ich: name });
    setName(''); onRefresh();
  };
  const remove = async (id: string) => {
    await supabase.from('tienich').delete().eq('matienich', id);
    onRefresh();
  };
  return (
    <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
      <EditorSectionTitle title="Tiện ích" desc="Ví dụ: Có mái che, Camera an ninh..." />
      <div className="flex gap-2"><input value={name} onChange={e=>setName(e.target.value)} className="border p-2 rounded-lg flex-1"/><button onClick={add} className="bg-purple-600 text-white px-4 rounded-lg">Thêm</button></div>
      <div className="flex flex-wrap gap-2 mt-4">
        {lot.amenities.map(a => <span key={a.matienich} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex gap-2 items-center">{a.ten_tien_ich} <button onClick={()=>remove(a.matienich)} className="text-red-500">×</button></span>)}
      </div>
    </div>
  );
}

function GateManager({ lot, onRefresh }: { lot: ParkingLot; onRefresh: () => void }) {
  const [zoneId, setZoneId] = useState(lot.zones?.[0]?.makhuvuc || '');
  const [name, setName] = useState('');
  const [type, setType] = useState('vao');
  const add = async () => {
    if(!zoneId || !name) return;
    await supabase.from('congtruc').insert({ makhuvuc: zoneId, tencong: name, loaicong: type });
    setName(''); onRefresh();
  };
  const remove = async (id: string) => { await supabase.from('congtruc').delete().eq('macong', id); onRefresh(); };
  return (
    <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
      <EditorSectionTitle title="Cổng ra vào" desc="Cổng LPR gán với khu vực cụ thể." />
      <div className="grid md:grid-cols-4 gap-2">
        <select value={zoneId} onChange={e=>setZoneId(e.target.value)} className="border p-2 rounded-lg">{lot.zones.map(z => <option key={z.makhuvuc} value={z.makhuvuc}>{z.tenkhuvuc}</option>)}</select>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Tên cổng" className="border p-2 rounded-lg"/>
        <select value={type} onChange={e=>setType(e.target.value)} className="border p-2 rounded-lg"><option value="vao">Vào</option><option value="ra">Ra</option><option value="ca_hai">Cả 2</option></select>
        <button onClick={add} className="bg-purple-600 text-white rounded-lg font-bold">Thêm cổng</button>
      </div>
      <div className="space-y-2">
        {lot.zones.map(z => z.gates.map(g => (
          <div key={g.macong} className="flex justify-between items-center border p-3 rounded-xl bg-gray-50">
            <div><strong>{g.tencong}</strong> ({g.loaicong}) - Thuộc khu: {z.tenkhuvuc}</div>
            <button onClick={()=>remove(g.macong)} className="text-red-500">Xóa</button>
          </div>
        )))}
      </div>
    </div>
  );
}

// ================================
// TAB: THẺ THÁNG QUÝ
// ================================
function CardManager({ lot, onRefresh }: { lot: ParkingLot; onRefresh: () => void }) {
  const [cards, setCards] = useState<CardRow[]>(lot.cards || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => setCards(lot.cards || []), [lot.cards]);

  const addCard = () => {
    setCards([...cards, { mathe: `tmp_${Date.now()}`, mabaido: lot.mabaido, loaithe: 'thang', loaixe: 'motorcycle', gia_tien: 0 }]);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      for (const c of cards) {
        const payload = { loaithe: c.loaithe, loaixe: c.loaixe, gia_tien: Number(c.gia_tien), mabaido: lot.mabaido };
        if (c.mathe.startsWith('tmp_')) {
          await supabase.from('the_thang_quy').insert(payload);
        } else {
          await supabase.from('the_thang_quy').update(payload).eq('mathe', c.mathe);
        }
      }
      toast.success('Đã lưu bảng thẻ');
      onRefresh();
    } catch (e) { toast.error('Lỗi lưu thẻ'); }
    setSaving(false);
  };

  const removeCard = async (idx: number, id: string) => {
    if (!window.confirm("Xóa cấu hình thẻ này?")) return;
    if (id.startsWith('tmp_')) {
      setCards(cards.filter((_, i) => i !== idx));
    } else {
      await supabase.from('the_thang_quy').delete().eq('mathe', id);
      onRefresh();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4 border-t-4 border-t-purple-500">
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <EditorSectionTitle title="Cấu hình Thẻ Dài Hạn" desc="Giá trọn gói Tháng/Quý cho khách thuê cố định." />
        <button onClick={addCard} className="bg-purple-100 text-purple-700 font-bold px-4 py-2 rounded-xl text-sm">+ Thêm Thẻ Mới</button>
      </div>
      
      {cards.map((c, i) => (
        <div key={i} className="flex flex-wrap md:flex-nowrap gap-4 mb-4 items-end bg-gray-50 p-4 rounded-2xl relative border">
          <button onClick={() => removeCard(i, c.mathe)} className="absolute top-4 right-4 text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5"/></button>
          
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Loại thẻ</label>
            <select value={c.loaithe} onChange={(e) => { const n = [...cards]; n[i]!.loaithe = e.target.value; setCards(n); }} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white outline-none">
              <option value="thang">Vé Tháng</option><option value="quy">Vé Quý</option>
            </select>
          </div>
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Loại xe</label>
            <select value={c.loaixe} onChange={(e) => { const n = [...cards]; n[i]!.loaixe = e.target.value; setCards(n); }} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white outline-none">
              <option value="motorcycle">Xe máy</option><option value="car">Ô tô</option>
            </select>
          </div>
          <Field label="Giá tiền trọn gói (VNĐ)" type="number" className="w-full md:w-1/3" value={String(c.gia_tien)} onChange={(v) => { const n = [...cards]; n[i]!.gia_tien = Number(v); setCards(n); }} />
        </div>
      ))}
      <div className="flex justify-end pt-4">
        <button onClick={saveAll} disabled={saving} className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700">Lưu Thẻ</button>
      </div>
    </div>
  );
}


function DangerZone({ lot, onDeleted }: { lot: ParkingLot; onDeleted: () => void }) {
  const del = async () => {
    if (!window.confirm('Xóa sạch dữ liệu?')) return;
    for(const z of lot.zones) {
      // Đã xóa lệnh gọi phuongtienhotro
      await supabase.from('congtruc').delete().eq('makhuvuc', z.makhuvuc);
      await supabase.from('khuvucdo1').delete().eq('makhuvuc', z.makhuvuc);
    }
    for(const p of lot.pricing) await supabase.from('banggia1').delete().eq('mabanggia', p.mabanggia);
    await supabase.from('tienich').delete().eq('mabaido', lot.mabaido);
    await supabase.from('baido').delete().eq('mabaido', lot.mabaido);
    onDeleted();
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-red-200 space-y-4">
      <EditorSectionTitle title="Xóa bãi đỗ" desc="Hành động không thể phục hồi." />
      <button onClick={del} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700">Xóa vĩnh viễn</button>
    </div>
  );
}

// ================================
// SHARED COMPONENTS
// ================================

function QuickSummary({ lot }: { lot: ParkingLot }) {
  return (
    <div className="bg-white rounded-3xl border shadow-sm p-5 space-y-4">
      <h3 className="text-lg font-bold">Tóm tắt</h3>
      <div className="space-y-3 text-sm">
        <SummaryRow label="Sức chứa AI" value={`${lot.totalCapacity} xe`} />
        <SummaryRow label="Khu vực" value={`${lot.zonesCount} khu`} />
        <SummaryRow label="Gói giá" value={`${lot.pricingCount} gói`} />
      </div>
    </div>
  );
}

function PreviewCard({ lot }: { lot: ParkingLot }) {
  return (
    <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
      <img src={lot.hinhanh || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a'} className="h-48 w-full object-cover" />
      <div className="p-5">
        <h3 className="font-bold text-xl">{lot.tenbaido}</h3>
        <p className="text-sm text-gray-500 truncate">{lot.diachi}</p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b pb-2 text-gray-600"><span className="font-medium">{label}</span><span className="font-bold text-gray-900">{value}</span></div>;
}

function EditorSectionTitle({ title, desc }: { title: string; desc: string }) {
  return <div><h2 className="text-2xl font-bold">{title}</h2><p className="text-sm text-gray-500 mt-1 mb-4">{desc}</p></div>;
}

function Field({ label, value, onChange, textarea, type = 'text', className = '', disabled = false }: { label: string; value: string|number; onChange: (v: string) => void; textarea?: boolean; type?: string; className?: string; disabled?: boolean }) {
  const commonClasses = "w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100";
  return (
    <div className={className}>
      <label className="block text-sm mb-2 text-gray-700 font-bold">{label}</label>
      {textarea ? (
        <textarea value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} rows={4} className={commonClasses + " resize-none"} />
      ) : (
        <input type={type} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={commonClasses} />
      )}
    </div>
  );
}

// ================================
// DETAILS PAGE (DUMMY)
// ================================
export const ParkingLotDetailsPage = () => {
  const navigate = useNavigate();
  const lotId = window.location.pathname.split('/').slice(-2, -1)[0] ?? '';
  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-3xl text-center space-y-4 shadow-sm border max-w-md w-full">
        <h1 className="text-2xl font-bold">Trang xem chi tiết</h1>
        <p className="text-gray-500 text-sm">Chuyển sang chế độ chỉnh sửa để thao tác dữ liệu.</p>
        <button onClick={() => navigate(`/admin/parking-lot/${lotId}/edit`)} className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold">Sửa bãi đỗ</button>
      </div>
    </div>
  );
};
