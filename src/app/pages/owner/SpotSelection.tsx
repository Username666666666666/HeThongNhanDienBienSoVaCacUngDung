import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bike,
  Car,
  CheckCircle,
  Clock,
  Coins,
  CreditCard,
  Image as ImageIcon,
  Info,
  MapPin,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase.ts';

type VehicleRow = {
  id: string;
  manguoidung: string;
  maphuongtien: string | null;
  tenchuphuongtien: string | null;
  sodienthoai: string | null;
  socccd: string | null;
  sogplx: string | null;
  maloai: string | null; // car | motorcycle
  bienso: string | null;
  hangxe: string | null;
  mauxe: string | null;
  trang_thai_xac_thuc: string | null;
  created_at: string | null;
};

type ParkingLotRow = {
  mabaido: string;
  tenbaido: string | null;
  diachi: string | null;
  giohoatdong: string | null;
  mota: string | null;
  hinhanh: string | null;
  mathamgia: string | null;
};

type ZoneRow = {
  makhuvuc: string;
  tenkhuvuc: string | null;
  hinhkhuvuc: string | null;
  mota: string | null;
  mabaido: string | null;
};

type PriceRow = {
  mabanggia: string;
  loaixe: string | null;
  loaigia: string | null;
  thanhtien: number | string | null;
  thanhtoanxuao: boolean | null;
  mabaido: string | null;
  kieuxe: string | null; // car | motorcycle
};

type CoinRow = {
  mabanggia: string;
  thanhxu: number | string | null;
};

type SpotRow = {
  mavitri: string;
  tenvitri: string | null;
  trangthai: number | string | null; // 0 = trống, 1 = đã đỗ, 2 = đã đặt
  makhuvuc: string | null;
  mabanggia: string | null;
};

type ReservationRow = {
  mavitri: string | null;
  ngayhethan: string | null;
  trangthai: string | null;
};

type PricingItem = {
  mabanggia: string;
  type: string;
  kieuxe: string | null;
  cashOnly: boolean;
  price: number;
  coinPrice: number | null;
};

type SpotView = {
  mavitri: string;
  tenvitri: string;
  status: 0 | 1 | 2;
  mabanggia: string | null;
  supported: boolean;
};

type PaymentMethod = 'transfer' | 'coin';

const formatMoney = (value: number | string | null | undefined) => {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return '0';
  return n.toLocaleString('vi-VN');
};

const resolveStorageImage = (bucket: string, value?: string | null) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;

  const clean = raw.replace(/^\/+/, '');
  return supabase.storage.from(bucket).getPublicUrl(clean).data.publicUrl;
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const isEmptyId = (value?: string | null) => {
  const v = String(value ?? '').trim().toLowerCase();
  return !v || v === 'undefined' || v === 'null';
};

const classifyVehicleType = (value: string) => {
  const text = normalizeText(value);

  if (
    text.includes('xe may') ||
    text.includes('motorcycle') ||
    text.includes('motor') ||
    text.includes('xe dap dien') ||
    text.includes('xe dap')
  ) {
    return 'motorcycle';
  }

  if (
    text.includes('oto') ||
    text.includes('o to') ||
    text.includes('car') ||
    text.includes('xe tai') ||
    text.includes('truck')
  ) {
    return 'car';
  }

  return 'other';
};

const isCompatibleVehicleType = (vehicleType: string, priceType: string) => {
  const vClass = classifyVehicleType(vehicleType);
  const pClass = classifyVehicleType(priceType);

  if (vClass !== 'other' && pClass !== 'other') {
    return vClass === pClass;
  }

  const v = normalizeText(vehicleType);
  const p = normalizeText(priceType);
  return v.includes(p) || p.includes(v);
};

const getVehicleIcon = (name: string) => {
  const text = normalizeText(name);

  if (text.includes('xe may') || text.includes('motor') || text.includes('xe dap dien')) {
    return Bike;
  }

  return Car;
};

const getSpotStatusLabel = (status: 0 | 1 | 2) => {
  if (status === 0) return 'Còn trống';
  if (status === 1) return 'Đã đỗ';
  return 'Đã đặt';
};

const getSpotButtonClass = (spot: SpotView, selected: boolean) => {
  if (!spot.supported) {
    return 'bg-gray-100 text-gray-400 border-gray-300 opacity-45 cursor-not-allowed';
  }

  if (selected) {
    return 'bg-blue-600 text-white border-blue-800 scale-105 shadow-lg';
  }

  if (spot.status === 0) {
    return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200 hover:scale-105';
  }

  if (spot.status === 1) {
    return 'bg-red-100 text-red-700 border-red-300 opacity-70 cursor-not-allowed';
  }

  return 'bg-yellow-100 text-yellow-700 border-yellow-300 opacity-70 cursor-not-allowed';
};

const getPaymentLabel = (method: PaymentMethod) => {
  return method === 'transfer' ? 'Chuyển khoản' : 'Xu ảo';
};

export const SpotSelection = () => {
  const params = useParams();
console.log("Current Params:", params);
  const navigate = useNavigate();
  const { lotId, zoneId, vehicleId } = useParams<{
    lotId?: string;
    zoneId?: string;
    vehicleId?: string;
  }>();

  const lastLoadedKeyRef = useRef<string>('');

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [parkingLot, setParkingLot] = useState<ParkingLotRow | null>(null);
  const [zone, setZone] = useState<ZoneRow | null>(null);
  const [vehicle, setVehicle] = useState<VehicleRow | null>(null);

const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
const [spots, setSpots] = useState<SpotView[]>([]);
const [coinBalance, setCoinBalance] = useState<number | null>(null);
const [selectedPriceId, setSelectedPriceId] = useState<string>('');

  const [selectedSpotId, setSelectedSpotId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadKey = `${lotId ?? ''}::${zoneId ?? ''}::${vehicleId ?? ''}`;
    if (lastLoadedKeyRef.current === loadKey) return;
    lastLoadedKeyRef.current = loadKey;

    let cancelled = false;

    const loadData = async () => {
      
      try {
        setLoading(true);
        setLoadError(null);

        if (isEmptyId(lotId) || isEmptyId(zoneId) || isEmptyId(vehicleId)) {
          setLoadError('Thiếu tham số URL.');
          return;
        }

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (cancelled) return;
        if (authError) throw authError;

        if (!user) {
          setLoadError('Bạn cần đăng nhập.');
          return;
        }

        const { data: userProfile, error: userProfileError } = await supabase
          .from('nguoidung')
          .select('manguoidung')
          .eq('manguoidung', user.id)
          .maybeSingle();

        if (cancelled) return;
        if (userProfileError) throw userProfileError;

        const userId = userProfile?.manguoidung ?? user.id;

        const [lotRes, zoneRes, vehicleRes, priceRes, spotRes, reservationRes, balanceRes] =
          await Promise.all([
            supabase
              .from('baido')
              .select('mabaido, tenbaido, diachi, giohoatdong, mota, hinhanh, mathamgia')
              .eq('mabaido', lotId!)
              .maybeSingle(),
            supabase
              .from('khuvudo')
              .select('makhuvuc, tenkhuvuc, hinhkhuvuc, mota, mabaido')
              .eq('makhuvuc', zoneId!)
              .maybeSingle(),
            supabase
              .from('phuongtien')
              .select(
                'id, manguoidung, maphuongtien, tenchuphuongtien, sodienthoai, socccd, sogplx, maloai, bienso, hangxe, mauxe, trang_thai_xac_thuc, created_at'
              )
              .eq('id', vehicleId!)
              .eq('manguoidung', userId)
              .maybeSingle(),
            supabase
              .from('banggia')
              .select('mabanggia, loaixe, loaigia, thanhtien, thanhtoanxuao, mabaido, kieuxe')
              .eq('mabaido', lotId!)
              .eq('loaigia', 'fixed')
              .order('loaixe', { ascending: true }),
            supabase
              .from('vitrido')
              .select('mavitri, tenvitri, trangthai, makhuvuc, mabanggia')
              .eq('makhuvuc', zoneId!)
              .order('tenvitri', { ascending: true }),
            supabase
              .from('bangdatchotruoc')
              .select('mavitri, ngayhethan, trangthai')
              .eq('mabaido', lotId!)
              .eq('makhuvuc', zoneId!),
            supabase
              .from('ctchuxe')
              .select('xuao')
              .eq('manguoidung', userId)
              .maybeSingle(),
          ]);

        if (cancelled) return;

        if (lotRes.error) throw lotRes.error;
        if (zoneRes.error) throw zoneRes.error;
        if (vehicleRes.error) throw vehicleRes.error;
        if (priceRes.error) throw priceRes.error;
        if (spotRes.error) throw spotRes.error;
        if (reservationRes.error) throw reservationRes.error;
        if (balanceRes.error) throw balanceRes.error;

        if (!lotRes.data) {
          setLoadError('Không tìm thấy bãi đỗ.');
          return;
        }

        if (!zoneRes.data) {
          setLoadError('Không tìm thấy khu vực.');
          return;
        }

        if (!vehicleRes.data) {
          setLoadError('Không tìm thấy phương tiện hoặc phương tiện không thuộc tài khoản này.');
          return;
        }

        const lotData = lotRes.data as ParkingLotRow;
        const zoneData = zoneRes.data as ZoneRow;
        const vehicleData = vehicleRes.data as VehicleRow;

        if (String(zoneData.mabaido ?? '') !== String(lotData.mabaido ?? '')) {
          setLoadError('Khu vực không thuộc bãi đỗ này.');
          return;
        }

        if (String(vehicleData.trang_thai_xac_thuc ?? '') !== 'Đã duyệt') {
          setLoadError('Phương tiện này chưa được duyệt.');
          return;
        }

        const priceList = (priceRes.data || []) as PriceRow[];
        const spotList = (spotRes.data || []) as SpotRow[];
        const reservationList = (reservationRes.data || []) as ReservationRow[];
        const balanceRow = balanceRes.data as { xuao?: number | string | null } | null;

        const coinMap = new Map<string, number>();
        const coinRows = priceList.length
          ? await supabase
              .from('banggiaxuao')
              .select('mabanggia, thanhxu')
              .in(
                'mabanggia',
                priceList.map((p) => String(p.mabanggia))
              )
          : { data: [] as CoinRow[], error: null as any };

        if (cancelled) return;
        if (coinRows.error) throw coinRows.error;

        (coinRows.data || []).forEach((row) => {
          coinMap.set(String(row.mabanggia), Number(row.thanhxu ?? 0));
        });

        const pricingMap = new Map<string, PricingItem>();
        priceList.forEach((row) => {
          const type = String(row.kieuxe ?? row.loaixe ?? '').trim();
          if (!type) return;

          const cashOnly = !Boolean(row.thanhtoanxuao);
          const coinPrice = row.thanhtoanxuao
            ? coinMap.get(String(row.mabanggia)) ?? null
            : null;

          pricingMap.set(normalizeText(`${type}-${row.mabanggia}`), {
            mabanggia: String(row.mabanggia),
            type,
            kieuxe: row.kieuxe,
            cashOnly,
            price: Number(row.thanhtien ?? 0),
            coinPrice,
          });
        });

const allPricingItems = Array.from(pricingMap.values());

const supportedPricingItems = allPricingItems.filter((item) =>
  isCompatibleVehicleType(
    String(vehicleData.maloai ?? ''),
    String(item.kieuxe ?? item.type)
  )
);

const initialPricingItems =
  supportedPricingItems.length > 0 ? supportedPricingItems : allPricingItems;

const initialSelectedPriceId = initialPricingItems[0]?.mabanggia ?? '';

const activeReservationBySpot = new Map<string, boolean>();
const now = Date.now();

reservationList.forEach((row) => {
  const spotId = String(row.mavitri ?? '');
  const expiresAt = row.ngayhethan ? new Date(row.ngayhethan).getTime() : 0;
  const active =
    !!spotId &&
    expiresAt > now &&
    String(row.trangthai ?? '').toLowerCase().includes('đã đặt chỗ');

  if (active) activeReservationBySpot.set(spotId, true);
});

const viewSpots: SpotView[] = spotList.map((row) => {
  const rawStatus = Number(row.trangthai ?? 0);
  const status = (rawStatus === 1 ? 1 : rawStatus === 2 ? 2 : 0) as 0 | 1 | 2;

  const reservedByBooking = activeReservationBySpot.has(String(row.mavitri ?? ''));
  const finalStatus: 0 | 1 | 2 = reservedByBooking
    ? 2
    : status === 1
      ? 1
      : status === 2
        ? 2
        : 0;

  return {
    mavitri: String(row.mavitri),
    tenvitri: row.tenvitri ?? String(row.mavitri),
    status: finalStatus,
    mabanggia: row.mabanggia ? String(row.mabanggia) : null,
    supported: true,
  };
});

setParkingLot(lotData);
setZone(zoneData);
setVehicle(vehicleData);
setPricingItems(initialPricingItems);
setSelectedPriceId(initialSelectedPriceId);
setSpots(viewSpots);
setCoinBalance(balanceRow?.xuao == null ? null : Number(balanceRow.xuao ?? 0));

const firstAvailable = viewSpots.find(
  (s) => s.mabanggia === initialSelectedPriceId && s.status === 0
);
setSelectedSpotId(firstAvailable?.mavitri ?? '');
setPaymentMethod('transfer');
      } catch (err: any) {
        if (cancelled) return;
        console.error(err);
        setLoadError(err?.message || 'Lỗi tải dữ liệu.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [lotId, zoneId, vehicleId]);

const selectedPrice = useMemo(() => {
  return pricingItems.find((item) => item.mabanggia === selectedPriceId) || null;
}, [pricingItems, selectedPriceId]);

const visibleSpots = useMemo(() => {
  if (!selectedPrice) return [];

  return spots.map((spot) => ({
    ...spot,
    supported: spot.mabanggia === selectedPrice.mabanggia,
  }));
}, [spots, selectedPrice]);
useEffect(() => {
  const firstAvailable = visibleSpots.find(
    (s) => s.supported && s.status === 0
  );

  setSelectedSpotId(firstAvailable?.mavitri ?? '');
}, [selectedPriceId, visibleSpots]);
const selectedSpot = useMemo(
  () => visibleSpots.find((s) => s.mavitri === selectedSpotId) || null,
  [visibleSpots, selectedSpotId]
);

  const selectedSpotSupported = Boolean(selectedSpot?.supported);
  const selectedSpotAvailable = Boolean(selectedSpot && selectedSpot.supported && selectedSpot.status === 0);

  const selectedPriceDisplay = useMemo(() => {
    if (!selectedPrice) return '';
    if (selectedPrice.cashOnly || selectedPrice.coinPrice == null) {
      return `${formatMoney(selectedPrice.price)}đ`;
    }
    return `${formatMoney(selectedPrice.price)}đ · ${formatMoney(selectedPrice.coinPrice)} xu`;
  }, [selectedPrice]);

const availableCount = visibleSpots.filter((s) => s.supported && s.status === 0).length;
const occupiedCount = visibleSpots.filter((s) => s.status === 1).length;
const reservedCount = visibleSpots.filter((s) => s.status === 2).length;
const unsupportedCount = visibleSpots.filter((s) => !s.supported).length;

  const handleConfirm = async () => {
    if (!parkingLot || !zone || !vehicle) return;

    if (!selectedSpot) {
      toast.error('Vui lòng chọn vị trí đỗ!');
      return;
    }

    if (!selectedSpotSupported) {
      toast.error('Vị trí này không hỗ trợ loại xe của bạn.');
      return;
    }

    if (!selectedSpotAvailable) {
      toast.error('Vị trí này không còn trống.');
      return;
    }

    if (!selectedPrice) {
      toast.error('Khu vực này chưa có bảng giá phù hợp cho xe của bạn.');
      return;
    }

    if (paymentMethod === 'coin') {
      const requiredCoin = selectedPrice.coinPrice;

      if (requiredCoin == null) {
        toast.error('Loại thanh toán xu ảo chưa được cấu hình cho vị trí này.');
        return;
      }

      if ((coinBalance ?? 0) < requiredCoin) {
        toast.error('Bạn không đủ xu ảo, đang chuyển đến trang nạp xu.');
        globalThis.location.href = 'http://localhost:5176/owner/topup';
        return;
      }
    }

    try {
      setSubmitting(true);

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const reservationId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

      const insertPayload = {
        mabang: reservationId,
        manguoidung: vehicle.manguoidung,
        mabaido: parkingLot.mabaido,
        makhuvuc: zone.makhuvuc,
        mavitri: selectedSpot.mavitri,
        loaithanhtoan: getPaymentLabel(paymentMethod),
        thanhtien: selectedPrice.price,
        ngayhethan: expiresAt,
        trangthai: 'đã đặt chỗ',
      };

      const { error: insertError } = await supabase
        .from('bangdatchotruoc')
        .insert(insertPayload as any);

      if (insertError) throw insertError;

      const { error: updateSpotError } = await supabase
        .from('vitrido')
        .update({ trangthai: 2 })
        .eq('mavitri', selectedSpot.mavitri)
        .eq('makhuvuc', zone.makhuvuc)
        .eq('mabanggia', selectedSpot.mabanggia ?? selectedPrice.mabanggia);

      if (updateSpotError) throw updateSpotError;

      if (paymentMethod === 'coin' && selectedPrice.coinPrice != null) {
        const nextBalance = Number(coinBalance ?? 0) - Number(selectedPrice.coinPrice ?? 0);

        const { error: balanceUpdateError } = await supabase
          .from('ctchuxe')
          .update({ xuao: nextBalance })
          .eq('manguoidung', vehicle.manguoidung);

        if (balanceUpdateError) throw balanceUpdateError;
      }

      toast.success('Đã đặt chỗ thành công!');

      globalThis.location.replace('/owner');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Không thể tạo đặt chỗ.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg px-6 py-4 text-gray-700 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          Đang tải dữ liệu vị trí đỗ...
        </div>
      </div>
    );
  }

  if (loadError || !parkingLot || !zone || !vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 mx-auto mb-4 flex items-center justify-center">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không thể tải dữ liệu</h1>
          <p className="text-gray-600 mb-6">{loadError ?? 'Dữ liệu không tồn tại.'}</p>
          <button
            onClick={() => globalThis.history.back()}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const VehicleIcon = getVehicleIcon(String(vehicle.maloai ?? ''));

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
            <div className="min-w-0">
              <h1 className="text-3xl mb-2 tracking-tight">Chọn vị trí đỗ</h1>
              <p className="text-blue-100 text-sm truncate">
                {parkingLot.tenbaido || 'Bãi đỗ'} · {zone.tenkhuvuc || 'Khu vực'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6 border border-white/70">
          <div className="relative h-64 md:h-80 bg-gray-100">
            {zone.hinhkhuvuc || parkingLot.hinhanh ? (
              <img
                src={resolveStorageImage('SanDo', zone.hinhkhuvuc || parkingLot.hinhanh)}
                alt={zone.tenkhuvuc || 'Khu vực'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                  <div>Chưa có hình ảnh</div>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
              <h2 className="text-2xl md:text-4xl font-bold mb-2">
                {zone.tenkhuvuc || 'Khu vực'}
              </h2>

              <div className="flex flex-wrap gap-4 text-sm text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{parkingLot.diachi || 'Chưa có địa chỉ'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{parkingLot.giohoatdong || 'Chưa có giờ hoạt động'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Giữ chỗ tối đa 24 giờ</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gradient-to-r from-purple-100 to-indigo-100">
            <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Còn trống</div>
              <div className="text-xl font-bold text-gray-900">{availableCount}</div>
            </div>
            <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Đã đỗ</div>
              <div className="text-xl font-bold text-gray-900">{occupiedCount}</div>
            </div>
            <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Đã đặt</div>
              <div className="text-xl font-bold text-gray-900">{reservedCount}</div>
            </div>
            <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Không hỗ trợ</div>
              <div className="text-xl font-bold text-gray-900">{unsupportedCount}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-2 border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <VehicleIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-2xl font-bold text-gray-900">Thông tin phương tiện</h3>
                  <p className="text-gray-600 truncate">
                    {vehicle.tenchuphuongtien || 'Chủ xe'} · {vehicle.bienso || 'Chưa có biển số'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
                  <div className="text-sm text-gray-500 mb-1">Loại xe</div>
                  <div className="font-bold text-gray-900">{vehicle.maloai || '—'}</div>
                </div>
                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
                  <div className="text-sm text-gray-500 mb-1">Hãng / màu</div>
                  <div className="font-bold text-gray-900">
                    {vehicle.hangxe || '—'} {vehicle.mauxe ? `· ${vehicle.mauxe}` : ''}
                  </div>
                </div>
                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
                  <div className="text-sm text-gray-500 mb-1">Trạng thái duyệt</div>
                  <div className="font-bold text-green-700">{vehicle.trang_thai_xac_thuc || 'Đã duyệt'}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-6 h-6 text-yellow-600" />
                <h3 className="font-bold text-gray-900 text-lg">Bảng giá áp dụng</h3>
              </div>

              {pricingItems.length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
                  Khu vực này chưa có bảng giá phù hợp với loại xe của bạn.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pricingItems.map((item) => {
  const Icon = item.kieuxe === 'motorcycle' ? Bike : Car;
  const isCurrent = selectedPrice?.mabanggia === item.mabanggia;

  return (
    <div
      key={item.mabanggia}
      onClick={() => setSelectedPriceId(item.mabanggia)}
      className={`cursor-pointer rounded-2xl p-4 border-2 transition ${
        isCurrent
          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400'
          : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 hover:border-blue-300'
      }`}
    >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                              <Icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {item.kieuxe || item.type}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {item.cashOnly
                                  ? 'Chỉ thanh toán chuyển khoản / tiền mặt'
                                  : 'Thanh toán chuyển khoản + xu ảo'}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {formatMoney(item.price)}đ
                            </div>
                            {!item.cashOnly && item.coinPrice != null && (
                              <div className="text-sm text-yellow-700 flex items-center justify-end gap-1">
                                <Coins className="w-4 h-4" />
                                {formatMoney(item.coinPrice)} xu
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-lg">Chọn vị trí đỗ</h3>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span className="text-gray-700">Còn trống</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded" />
                  <span className="text-gray-700">Đã đỗ</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded" />
                  <span className="text-gray-700">Đã đặt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded" />
                  <span className="text-gray-700">Không hỗ trợ</span>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
  {visibleSpots.map((spot) => (
                  <button
                    key={spot.mavitri}
                    onClick={() => {
                      if (spot.supported && spot.status === 0) {
                        setSelectedSpotId(spot.mavitri);
                      }
                    }}
                    disabled={!spot.supported || spot.status !== 0}
                    className={`aspect-square rounded-lg font-bold text-sm flex items-center justify-center transition border-2 ${getSpotButtonClass(
                      spot,
                      selectedSpotId === spot.mavitri
                    )}`}
                    title={`${spot.tenvitri} · ${getSpotStatusLabel(spot.status)}`}
                  >
                    {spot.tenvitri}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Thanh toán</h3>

              <div className="space-y-3">
                <label
                  className={`block rounded-2xl border-2 p-4 cursor-pointer transition ${
                    paymentMethod === 'transfer'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'transfer'}
                      onChange={() => setPaymentMethod('transfer')}
                      className="mt-1 w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Chuyển khoản</div>
                      <div className="text-sm text-gray-600">
                        Xác nhận đặt chỗ bằng hình thức chuyển khoản.
                      </div>
                    </div>
                  </div>
                </label>

                <label
                  className={`block rounded-2xl border-2 p-4 cursor-pointer transition ${
                    paymentMethod === 'coin'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300'
                  } ${selectedPrice?.coinPrice == null ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'coin'}
                      onChange={() => setPaymentMethod('coin')}
                      disabled={selectedPrice?.coinPrice == null}
                      className="mt-1 w-4 h-4 text-yellow-600"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        Xu ảo
                        <Coins className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedPrice?.coinPrice != null ? (
                          <>
                            Cần {formatMoney(selectedPrice.coinPrice)} xu · số dư hiện tại:{' '}
                            <span className="font-semibold">
                              {coinBalance == null ? '—' : formatMoney(coinBalance)} xu
                            </span>
                          </>
                        ) : (
                          'Loại vị trí này chưa hỗ trợ thanh toán xu ảo.'
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {selectedPrice && (
                <div className="mt-5 rounded-2xl bg-gray-50 border border-gray-200 p-4">
                  <div className="text-sm text-gray-500 mb-1">Tổng thanh toán</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedPriceDisplay}
                  </div>
                </div>
              )}

              <div className="mt-4 rounded-2xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
                Vị trí sẽ được giữ trong <span className="font-semibold">24 giờ</span> kể từ lúc xác nhận.
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Lưu ý</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>Chỉ chọn vị trí có màu xanh lá và đúng loại xe.</li>
                    <li>Vị trí đỏ là đã đỗ, vàng là đã đặt trước.</li>
                    <li>Nếu chọn xu ảo mà không đủ xu, hệ thống sẽ chuyển sang trang nạp xu.</li>
                    <li>Sau khi hoàn tất, hệ thống sẽ đưa bạn về trang <span className="font-semibold">/owner</span>.</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={submitting || !selectedSpot || !selectedPrice || !selectedSpotAvailable}
              className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg ${
                submitting || !selectedSpot || !selectedPrice || !selectedSpotAvailable
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              {submitting ? 'Đang xác nhận...' : 'Xác nhận đặt chỗ'}
            </button>

            {selectedSpot && (
             <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                  <h4 className="font-bold text-gray-900">Vị trí đã chọn</h4>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <div>
                    Mã vị trí:{' '}
                    <span className="font-semibold text-gray-900">{selectedSpot.tenvitri}</span>
                  </div>
                  <div>
                    Trạng thái:{' '}
                    <span className="font-semibold text-gray-900">
                      {getSpotStatusLabel(selectedSpot.status)}
                    </span>
                  </div>
                  <div>
                    Hỗ trợ xe:{' '}
                    <span className="font-semibold text-gray-900">
                      {selectedSpotSupported ? 'Có' : 'Không'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
