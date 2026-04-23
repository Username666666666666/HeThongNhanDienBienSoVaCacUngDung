import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Car,
  Bike,
  Truck,
  DollarSign,
  Coins,
  Info,
  MapPin,
  Clock,
  RefreshCw,
  Image as ImageIcon,
  BadgeCheck,
} from 'lucide-react';
import { supabase } from '../../utils/supabase.ts';

type VehicleRow = {
  id: string;
  manguoidung: string;
  maphuongtien: string | null;
  tenchuphuongtien: string | null;
  sodienthoai: string | null;
  socccd: string | null;
  sogplx: string | null;
  maloai: string | null;
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
  kieuxe: string | null; // thêm cột mới
};

type CoinRow = {
  mabanggia: string;
  thanhxu: number | string | null;
};

type PricingItem = {
  mabanggia: string;
  type: string;
  kieuxe: string | null; // thêm cột mới
  cashOnly: boolean;
  price: number;
  coinPrice: number | null;
};

type ParkingLotView = {
  id: string;
  name: string;
  address: string;
  openingHours: string;
  description: string;
  image: string;
};

type ZoneView = {
  id: string;
  name: string;
  image: string;
  description: string;
};

type ResolvedIds = {
  lotId: string;
  zoneId: string;
};

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

const extractIdsFromPath = (pathname: string) => {
  const match = pathname.match(/parking\/([^\/]+)\/zone\/([^\/]+)/i);

  return {
    lotId: match?.[1] ? decodeURIComponent(match[1]) : '',
    zoneId: match?.[2] ? decodeURIComponent(match[2]) : '',
  };
};

const resolveRouteIds = (
  pathname: string,
  params: { lotId?: string; zoneId?: string }
): ResolvedIds | null => {
  const pathIds = extractIdsFromPath(pathname);

  const lotId = isEmptyId(params.lotId)
    ? pathIds.lotId
    : String(params.lotId).trim();

  const zoneId = isEmptyId(params.zoneId)
    ? pathIds.zoneId
    : String(params.zoneId).trim();

  if (isEmptyId(lotId) || isEmptyId(zoneId)) return null;

  return { lotId, zoneId };
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

  if (text.includes('xe may') || text.includes('motor') || text.includes('xe dap dien')) return Bike;
  if (text.includes('xe tai') || text.includes('truck')) return Truck;
  if (text.includes('oto') || text.includes('o to') || text.includes('car')) return Car;

  return Car;
};

// Icon riêng cho bảng giá theo kieuxe
const getPriceIcon = (kieuxe: string | null) => {
  const text = normalizeText(String(kieuxe ?? ''));

  if (text === 'motorcycle' || text.includes('motorcycle')) return Bike;
  if (text === 'car' || text.includes('car')) return Car;

  return Car;
};

const formatPricingDisplay = (item: PricingItem) => {
  if (item.cashOnly || item.coinPrice == null) {
    return `${formatMoney(item.price)}đ`;
  }
  return `${formatMoney(item.price)}đ · ${formatMoney(item.coinPrice)} xu`;
};

export const VehicleTypeSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ lotId?: string; zoneId?: string }>();

  const resolvedIds = useMemo(
    () => resolveRouteIds(location.pathname, params),
    [location.pathname, params.lotId, params.zoneId]
  );

  const lastLoadedKeyRef = useRef<string>('');

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [parkingLot, setParkingLot] = useState<ParkingLotView | null>(null);
  const [zone, setZone] = useState<ZoneView | null>(null);
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
  const [approvedVehicles, setApprovedVehicles] = useState<VehicleRow[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  useEffect(() => {
    if (!resolvedIds) return;

    const loadKey = `${resolvedIds.lotId}::${resolvedIds.zoneId}`;
    if (lastLoadedKeyRef.current === loadKey) return;
    lastLoadedKeyRef.current = loadKey;

    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setLoadError(null);

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

        const { data: zoneData, error: zoneError } = await supabase
          .from('khuvudo')
          .select('makhuvuc, tenkhuvuc, hinhkhuvuc, mota, mabaido')
          .eq('makhuvuc', resolvedIds.zoneId)
          .maybeSingle();

        if (cancelled) return;
        if (zoneError) throw zoneError;
        if (!zoneData) {
          setLoadError('Không tìm thấy khu vực.');
          return;
        }

        const zoneRow = zoneData as ZoneRow;

        if (isEmptyId(zoneRow.mabaido)) {
          setLoadError('Khu vực không có mã bãi đỗ.');
          return;
        }

        const resolvedLotId = String(zoneRow.mabaido);

        if (resolvedIds.lotId !== resolvedLotId) {
          console.warn('lotId trên URL không khớp với mabaido của khu vực:', {
            lotId: resolvedIds.lotId,
            resolvedLotId,
            zoneId: resolvedIds.zoneId,
          });
        }

        const { data: lotData, error: lotError } = await supabase
          .from('baido')
          .select('mabaido, tenbaido, diachi, giohoatdong, mota, hinhanh')
          .eq('mabaido', resolvedLotId)
          .maybeSingle();

        if (cancelled) return;
        if (lotError) throw lotError;
        if (!lotData) {
          setLoadError('Không tìm thấy bãi đỗ.');
          return;
        }

        const { data: vehicleData, error: vehicleError } = await supabase
          .from('phuongtien')
          .select(
            'id, manguoidung, maphuongtien, tenchuphuongtien, sodienthoai, socccd, sogplx, maloai, bienso, hangxe, mauxe, trang_thai_xac_thuc, created_at'
          )
          .eq('manguoidung', userId)
          .eq('trang_thai_xac_thuc', 'Đã duyệt')
          .order('created_at', { ascending: false });

        if (cancelled) return;
        if (vehicleError) throw vehicleError;

        const approvedVehicleList = (vehicleData || []) as VehicleRow[];

        const { data: priceRows, error: priceError } = await supabase
          .from('banggia')
          .select(
            'mabanggia, loaixe, loaigia, thanhtien, thanhtoanxuao, mabaido, kieuxe'
          )
          .eq('mabaido', resolvedLotId)
          .eq('loaigia', 'fixed')
          .order('loaixe', { ascending: true });

        if (cancelled) return;
        if (priceError) throw priceError;

        const priceList = (priceRows || []) as PriceRow[];
        const priceIds = priceList.map((p) => String(p.mabanggia));

        const { data: coinRows, error: coinError } = priceIds.length
          ? await supabase
              .from('banggiaxuao')
              .select('mabanggia, thanhxu')
              .in('mabanggia', priceIds)
          : { data: [] as CoinRow[], error: null as any };

        if (cancelled) return;
        if (coinError) throw coinError;

        const coinMap = new Map<string, number>();
        (coinRows || []).forEach((row) => {
          coinMap.set(String(row.mabanggia), Number(row.thanhxu ?? 0));
        });

        const pricingMap = new Map<string, PricingItem>();

        priceList.forEach((row) => {
          const type = String(row.loaixe ?? '').trim();
          if (!type) return;

          const cashOnly = !Boolean(row.thanhtoanxuao);
          const coinPrice = row.thanhtoanxuao
            ? coinMap.get(String(row.mabanggia)) ?? null
            : null;

          pricingMap.set(normalizeText(type), {
            mabanggia: String(row.mabanggia),
            type,
            kieuxe: row.kieuxe,
            cashOnly,
            price: Number(row.thanhtien ?? 0),
            coinPrice,
          });
        });

        const zonePricingItems = Array.from(pricingMap.values());

        const compatibleVehicles = approvedVehicleList.filter((vehicle) => {
          const vehicleType = String(vehicle.maloai ?? '').trim();
          if (!vehicleType) return false;

          return zonePricingItems.some((price) =>
            isCompatibleVehicleType(vehicleType, price.type)
          );
        });

        if (cancelled) return;

        setParkingLot({
          id: resolvedLotId,
          name: lotData.tenbaido ?? '',
          address: lotData.diachi ?? '',
          openingHours: lotData.giohoatdong ?? '',
          description: lotData.mota ?? '',
          image: resolveStorageImage('BaiDo', lotData.hinhanh),
        });

        setZone({
          id: zoneRow.makhuvuc,
          name: zoneRow.tenkhuvuc ?? '',
          image: resolveStorageImage('SanDo', zoneRow.hinhkhuvuc),
          description: zoneRow.mota ?? '',
        });

        setPricingItems(zonePricingItems);
        setApprovedVehicles(compatibleVehicles);
        setSelectedVehicleId('');
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
  }, [resolvedIds]);

  const selectedVehicle = useMemo(() => {
    if (!approvedVehicles.length) return null;
    return approvedVehicles.find((v) => v.id === selectedVehicleId) || null;
  }, [approvedVehicles, selectedVehicleId]);

  const selectedVehiclePrice = useMemo(() => {
    if (!selectedVehicle) return null;
    return (
      pricingItems.find((item) =>
        isCompatibleVehicleType(String(selectedVehicle.maloai ?? ''), item.type)
      ) || null
    );
  }, [pricingItems, selectedVehicle]);

  const handleContinue = () => {
    if (!selectedVehicle || !parkingLot || !zone) return;

    const targetUrl = `/owner/parking/${parkingLot.id}/zone/${zone.id}/vehicle/${selectedVehicle.id}/select-spot`;
    globalThis.location.replace(targetUrl);
  };

  const approvedVehicleCount = approvedVehicles.length;
  const cashOnlyCount = pricingItems.filter((item) => item.cashOnly).length;
  const coinEnabledCount = pricingItems.filter((item) => !item.cashOnly).length;

  if (loading) {
    if (!resolvedIds) {
      return (
        <div className="h-screen flex items-center justify-center">
          Thiếu tham số URL
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg px-6 py-4 text-gray-700 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          Đang tải dữ liệu bãi đỗ...
        </div>
      </div>
    );
  }

  if (loadError || !parkingLot || !zone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 mx-auto mb-4 flex items-center justify-center">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không thể tải dữ liệu
          </h1>
          <p className="text-gray-600 mb-6">
            {loadError ?? 'Dữ liệu không tồn tại.'}
          </p>
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
              <h1 className="text-3xl mb-2 tracking-tight">Chọn loại xe</h1>
              <p className="text-blue-100 text-sm truncate">
                {parkingLot.name} · {zone.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6 border border-white/70">
          <div className="relative h-64 md:h-80 bg-gray-100">
            {zone.image || parkingLot.image ? (
              <img
                src={zone.image || parkingLot.image}
                alt={zone.name}
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

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
              <h2 className="text-2xl md:text-4xl font-bold mb-2">{zone.name}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{parkingLot.address || 'Chưa có địa chỉ'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{parkingLot.openingHours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4" />
                  <span>Chỉ xe đã được duyệt</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gradient-to-r from-purple-100 to-indigo-100">
            <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Phương tiện hợp lệ</div>
              <div className="text-xl font-bold text-gray-900">
                {approvedVehicleCount}
              </div>
            </div>
            <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Bảng giá cố định</div>
              <div className="text-xl font-bold text-gray-900">
                {pricingItems.length}
              </div>
            </div>
            <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Chỉ tiền mặt</div>
              <div className="text-xl font-bold text-gray-900">
                {cashOnlyCount}
              </div>
            </div>
            <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Hỗ trợ xu ảo</div>
              <div className="text-xl font-bold text-green-600">
                {coinEnabledCount}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-2 border-gray-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-6 h-6 text-yellow-600" />
            <h3 className="font-bold text-gray-900 text-lg">
              Bảng giá 
            </h3>
          </div>

          {pricingItems.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
              Khu vực này chưa có bảng giá cố định.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pricingItems.map((item) => {
                const Icon = getPriceIcon(item.kieuxe);

                return (
                  <div
                    key={item.mabanggia}
                    className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {item.type}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.cashOnly
                              ? 'Chỉ thanh toán tiền mặt'
                              : 'Thanh toán tiền mặt + xu ảo'}
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

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-2 border-gray-200 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Chọn xe của bạn
          </h2>
          <p className="text-gray-600 mb-6">
            Chỉ hiển thị các phương tiện đã được duyệt và phù hợp với bảng giá
            của khu vực này.
          </p>

          {approvedVehicles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Không có xe phù hợp
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn chưa có phương tiện nào được duyệt hoặc phương tiện chưa
                khớp với bảng giá của khu vực này.
              </p>
              <button
                onClick={() => navigate('/owner/register-vehicle')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition"
              >
                Đăng ký xe mới
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedVehicles.map((vehicle) => {
                const matchedPrice = pricingItems.find((item) =>
                  isCompatibleVehicleType(String(vehicle.maloai ?? ''), item.type)
                );

                const isSelected = selectedVehicleId === vehicle.id;
                const Icon = getVehicleIcon(
                  String(vehicle.maloai ?? '') || matchedPrice?.type || ''
                );

                return (
                  <label
                    key={vehicle.id}
                    className={`block border-2 rounded-xl p-6 cursor-pointer transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedVehicleId((prev) =>
                            prev === vehicle.id ? '' : vehicle.id
                          );
                        }}
                        className="w-5 h-5 text-blue-600 mt-1"
                      />

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                            <Icon className="w-6 h-6 text-blue-600" />
                          </div>

                          <div>
                            <div className="font-bold text-gray-900 text-lg">
                              {vehicle.bienso || 'Chưa có biển số'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {vehicle.hangxe || '—'}{' '}
                              {vehicle.mauxe ? `· ${vehicle.mauxe}` : ''} ·{' '}
                              {vehicle.maloai || '—'}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600">
                          Chủ xe:{' '}
                          <span className="font-medium text-gray-900">
                            {vehicle.tenchuphuongtien || '—'}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 mt-1">
                          {matchedPrice ? (
                            <span className="text-green-700 font-medium">
                              Giá phù hợp: {formatPricingDisplay(matchedPrice)}
                            </span>
                          ) : (
                            <span className="text-amber-700">
                              Phương tiện này chưa có giá phù hợp trong khu vực.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Lưu ý</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  Chỉ hiển thị phương tiện có trạng thái{' '}
                  <span className="font-semibold">Đã duyệt</span>.
                </li>
                <li>
                  Chỉ lấy bảng giá <span className="font-semibold">fixed</span>{' '}
                  của bãi đỗ.
                </li>
                <li>
                  Nếu <span className="font-semibold">thanhtoanxuao = true</span>{' '}
                  thì hiển thị cả tiền và xu ảo.
                </li>
                <li>
                  Nếu{' '}
                  <span className="font-semibold">thanhtoanxuao = false</span>{' '}
                  thì chỉ hiển thị giá tiền mặt.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {approvedVehicles.length > 0 && (
          <button
            onClick={handleContinue}
            disabled={!selectedVehicle}
            className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg ${
              selectedVehicle
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Tiếp tục chọn vị trí đỗ
          </button>
        )}
      </div>
    </div>
  );
};