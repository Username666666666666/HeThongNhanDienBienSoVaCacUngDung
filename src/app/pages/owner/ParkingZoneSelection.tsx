import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Car,
  Bike,
  Clock,
  RefreshCw,
  Image as ImageIcon,
  Sparkles,
  ParkingSquare,
  BadgeInfo,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '../../utils/supabase.ts';

interface ParkingLotRow {
  mabaido: string | number;
  tenbaido: string | null;
  diachi: string | null;
  giohoatdong: string | null;
  mota: string | null;
  hinhanh: string | null;
}

interface ZoneRow {
  makhuvuc: string | number;
  tenkhuvuc: string | null;
  hinhkhuvuc: string | null;
  mota: string | null;
  mabaido: string | number | null;
}

interface SpotRow {
  makhuvuc: string | number | null;
  mabanggia: string | number | null;
  trangthai: number | string | null;
}

interface PriceRow {
  mabanggia: string | number;
  loaixe: string | null;
  loaigia: string | null;
  thanhtien: number | string | null;
  thanhtoanxuao: boolean | null;
  kieuxe: string | null;
}

interface CoinRow {
  mabanggia: string | number;
  thanhxu: number | string | null;
}

interface PricingView {
  id: string;
  type: string;
  vehicleKind: 'car' | 'motorcycle';
  cashAndCoin: boolean;
  price: number;
  coinPrice: number;
}

interface ZoneView {
  makhuvuc: string | number;
  tenkhuvuc: string;
  hinhkhuvuc: string;
  mota: string;
  totalSpots: number;
  availableSpots: number;
  supportedVehicleTypes: string[];
  pricingItems: PricingView[];
  hasVirtualCoin: boolean;
}

interface ParkingLotView {
  id: string;
  name: string;
  address: string;
  openingHours: string;
  description: string;
  image: string;
}

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

const normalizeVehicleKind = (value?: string | null): 'car' | 'motorcycle' => {
  const text = String(value ?? '').trim().toLowerCase();

  if (
    text.includes('motorcycle') ||
    text.includes('mortocycle') ||
    text.includes('xe máy') ||
    text.includes('xe may') ||
    text.includes('xe-may') ||
    text.includes('moto') ||
    text.includes('motor')
  ) {
    return 'motorcycle';
  }

  return 'car';
};

const getVehicleIconByKind = (kind: 'car' | 'motorcycle') => {
  return kind === 'motorcycle' ? Bike : Car;
};

const getVehicleLabelByKind = (kind: 'car' | 'motorcycle') => {
  return kind === 'motorcycle' ? 'Xe máy' : 'Ô tô';
};

const uniq = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const formatPriceDisplay = (item: PricingView) => {
  if (!item.cashAndCoin) {
    return `${formatMoney(item.price)}đ`;
  }

  return `${formatMoney(item.price)}đ - ${formatMoney(item.coinPrice)} xu`;
};

export const ParkingZoneSelection = () => {
  const navigate = useNavigate();
  const { lotId } = useParams<{ lotId: string }>();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [parkingLot, setParkingLot] = useState<ParkingLotView | null>(null);
  const [zones, setZones] = useState<ZoneView[]>([]);

  const loadData = async () => { 
    try {
      setLoading(true);
      setLoadError(null);

      const rawLotId = String(lotId ?? '').trim();
      if (!rawLotId) {
        setLoadError('Thiếu mã bãi đỗ.');
        return;
      }

      const { data: lotData, error: lotError } = await supabase
        .from('baido')
        .select('mabaido,tenbaido,diachi,giohoatdong,mota,hinhanh')
        .eq('mabaido', rawLotId)
        .maybeSingle();

      if (lotError) throw lotError;
      if (!lotData) {
        setLoadError('Không tìm thấy bãi đỗ.');
        return;
      }

      const lot = lotData as ParkingLotRow;
      const resolvedLotId = String(lot.mabaido ?? rawLotId);

      const { data: zoneRows, error: zoneError } = await supabase
        .from('khuvudo')
        .select('makhuvuc,tenkhuvuc,hinhkhuvuc,mota,mabaido')
        .eq('mabaido', resolvedLotId)
        .order('makhuvuc', { ascending: true });

      if (zoneError) throw zoneError;

      const zoneIds = (zoneRows ?? []).map((z) => String(z.makhuvuc));

      const { data: spotRows, error: spotError } = zoneIds.length
        ? await supabase
            .from('vitrido')
            .select('makhuvuc,mabanggia,trangthai')
            .in('makhuvuc', zoneIds)
        : { data: [] as SpotRow[], error: null as any };

      if (spotError) throw spotError;

      const { data: priceRows, error: priceError } = await supabase
        .from('banggia')
        .select('mabanggia,loaixe,loaigia,thanhtien,thanhtoanxuao,kieuxe')
        .eq('mabaido', resolvedLotId)
        .eq('loaigia', 'fixed')
        .order('mabanggia', { ascending: true });

      if (priceError) throw priceError;

      const priceIds = (priceRows ?? []).map((p) => String(p.mabanggia));

      const { data: coinRows, error: coinError } = priceIds.length
        ? await supabase.from('banggiaxuao').select('mabanggia,thanhxu').in('mabanggia', priceIds)
        : { data: [] as CoinRow[], error: null as any };

      if (coinError) throw coinError;

      const priceMap = new Map<string, PricingView>();

      (priceRows ?? []).forEach((row: PriceRow) => {
        const id = String(row.mabanggia);
        const vehicleKind = normalizeVehicleKind(row.kieuxe);

        priceMap.set(id, {
          id,
          type: row.loaixe ?? '',
          vehicleKind,
          cashAndCoin: Boolean(row.thanhtoanxuao),
          price: Number(row.thanhtien ?? 0),
          coinPrice: row.thanhtoanxuao ? 0 : -1,
        });
      });

      (coinRows ?? []).forEach((row: CoinRow) => {
        const id = String(row.mabanggia);
        const current = priceMap.get(id);
        if (current && current.cashAndCoin) {
          current.coinPrice = Number(row.thanhxu ?? 0);
        }
      });

      const zoneSpotMap = new Map<string, SpotRow[]>();

      (spotRows ?? []).forEach((row: SpotRow) => {
        const key = String(row.makhuvuc ?? '');
        if (!key) return;
        const current = zoneSpotMap.get(key) ?? [];
        current.push(row);
        zoneSpotMap.set(key, current);
      });

      const transformedZones: ZoneView[] = (zoneRows ?? [])
        .map((zone: ZoneRow) => {
          const zoneKey = String(zone.makhuvuc);
          const spots = zoneSpotMap.get(zoneKey) ?? [];

          const pricingItems = uniq(
            spots.map((spot) => String(spot.mabanggia ?? '').trim()).filter(Boolean),
          )
            .map((pricingId) => priceMap.get(pricingId))
            .filter((item): item is PricingView => Boolean(item))
            .sort((a, b) => {
              const kindOrder = Number(a.vehicleKind !== b.vehicleKind);
              if (kindOrder !== 0) return kindOrder;
              return String(a.type).localeCompare(String(b.type), 'vi');
            });

          if (pricingItems.length === 0) {
            return null;
          }

          const supportedVehicleTypes = uniq(pricingItems.map((item) => getVehicleLabelByKind(item.vehicleKind)));
          const availableSpots = spots.filter((spot) => Number(spot.trangthai ?? 0) === 0).length;

          return {
            makhuvuc: zone.makhuvuc,
            tenkhuvuc: zone.tenkhuvuc ?? `Khu vực ${zoneKey}`,
            hinhkhuvuc: resolveStorageImage('SanDo', zone.hinhkhuvuc),
            mota: zone.mota ?? '',
            totalSpots: spots.length,
            availableSpots,
            supportedVehicleTypes,
            pricingItems,
            hasVirtualCoin: pricingItems.some((item) => item.cashAndCoin),
          };
        })
        .filter((zone): zone is ZoneView => Boolean(zone));

      setParkingLot({
        id: resolvedLotId,
        name: lot.tenbaido ?? 'Bãi đỗ xe',
        address: lot.diachi ?? '',
        openingHours: lot.giohoatdong ?? '24/7',
        description: lot.mota ?? '',
        image: resolveStorageImage('BaiDo', lot.hinhanh),
      });

      setZones(transformedZones);
    } catch (error: any) {
      setLoadError(error?.message ?? 'Lỗi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lotId]);

  const summary = useMemo(() => {
    const totalZones = zones.length;
    const totalSpots = zones.reduce((sum, z) => sum + z.totalSpots, 0);
    const availableSpots = zones.reduce((sum, z) => sum + z.availableSpots, 0);

    return { totalZones, totalSpots, availableSpots };
  }, [zones]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe_0%,_#eef2ff_38%,_#faf5ff_100%)] flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl px-6 py-5 text-gray-700 flex items-center gap-3 border border-white">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span>Đang tải dữ liệu bãi đỗ...</span>
        </div>
      </div>
    );
  }

  if (loadError || !parkingLot) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe_0%,_#eef2ff_38%,_#faf5ff_100%)] flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur rounded-[2rem] shadow-2xl p-8 max-w-lg w-full text-center border border-white">
          <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 mx-auto mb-5 flex items-center justify-center">
            <BadgeInfo className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không thể tải bãi đỗ</h1>
          <p className="text-gray-600 mb-6">{loadError ?? 'Dữ liệu không tồn tại.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (zones.length === 0) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe_0%,_#eef2ff_38%,_#faf5ff_100%)]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-2xl bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition border border-white"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Chọn khu vực đỗ</h1>
              <p className="text-gray-600 truncate">{parkingLot.name}</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-[2rem] shadow-2xl overflow-hidden border border-white">
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-slate-100 to-indigo-100">
              {parkingLot.image ? (
                <img
                  src={parkingLot.image}
                  alt={parkingLot.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                    <div>Chưa có hình ảnh bãi đỗ</div>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-2xl md:text-4xl font-bold mb-2">{parkingLot.name}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-white/90">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{parkingLot.address || 'Chưa có địa chỉ'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{parkingLot.openingHours}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Bãi đỗ không hỗ trợ tính năng đặt chỗ trước
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Hiện tại chưa có khu vực nào được cấu hình giá cố định hợp lệ cho vị trí đỗ trong bãi này.
                      Hệ thống sẽ chỉ hiển thị những khu vực có vị trí đã gán bảng giá cố định phù hợp.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-3xl bg-slate-50 border border-slate-200 p-4">
                  <div className="text-xs text-gray-500 mb-1">Khu vực hiển thị</div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                </div>
                <div className="rounded-3xl bg-slate-50 border border-slate-200 p-4">
                  <div className="text-xs text-gray-500 mb-1">Tổng vị trí</div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                </div>
                <div className="rounded-3xl bg-slate-50 border border-slate-200 p-4">
                  <div className="text-xs text-gray-500 mb-1">Đang trống</div>
                  <div className="text-2xl font-bold text-green-600">0</div>
                </div>
              </div>

              <button
                onClick={() => navigate(-1)}
                className="mt-8 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
              >
                Quay lại
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe_0%,_#eef2ff_38%,_#faf5ff_100%)]">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)
              }
              className="p-2.5 hover:bg-white/10 rounded-2xl transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="min-w-0">
              <h1 className="text-3xl mb-2 tracking-tight font-bold">Chọn khu vực đỗ</h1>
              <p className="text-blue-100 text-sm truncate">{parkingLot.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur rounded-[2.25rem] shadow-2xl overflow-hidden mb-6 border border-white">
          <div className="relative h-72 md:h-96 bg-gradient-to-br from-slate-100 to-indigo-100">
            {parkingLot.image ? (
              <img
                src={parkingLot.image}
                alt={parkingLot.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                  <div>Chưa có hình ảnh bãi đỗ</div>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/20 text-sm mb-3">
                <ParkingSquare className="w-4 h-4" />
                Danh sách khu vực khả dụng
              </div>

              <h2 className="text-2xl md:text-4xl font-bold mb-2">{parkingLot.name}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{parkingLot.address || 'Chưa có địa chỉ'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{parkingLot.openingHours}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
            <div className="rounded-3xl bg-white/90 p-4 shadow-sm border border-white">
              <div className="text-xs text-gray-500 mb-1">Khu vực</div>
              <div className="text-2xl font-bold text-gray-900">{summary.totalZones}</div>
            </div>
            <div className="rounded-3xl bg-white/90 p-4 shadow-sm border border-white">
              <div className="text-xs text-gray-500 mb-1">Tổng vị trí</div>
              <div className="text-2xl font-bold text-gray-900">{summary.totalSpots}</div>
            </div>
            <div className="rounded-3xl bg-white/90 p-4 shadow-sm border border-white">
              <div className="text-xs text-gray-500 mb-1">Đang trống</div>
              <div className="text-2xl font-bold text-emerald-600">{summary.availableSpots}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {zones.map((zone) => (
            <div
              key={String(zone.makhuvuc)}
              className="bg-white/90 backdrop-blur rounded-[2rem] shadow-lg overflow-hidden border border-white hover:shadow-2xl transition-all duration-200 hover:-translate-y-1"
            >
              <div className="relative h-48 bg-gradient-to-br from-slate-100 to-indigo-100">
                {zone.hinhkhuvuc ? (
                  <img
                    src={zone.hinhkhuvuc}
                    alt={zone.tenkhuvuc}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-sm font-bold shadow">
                  {zone.availableSpots}/{zone.totalSpots} chỗ trống
                </div>

                {zone.hasVirtualCoin && (
                  <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow">
                    Xu ảo
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{zone.tenkhuvuc}</h3>
                </div>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {zone.mota || ''}
                </p>

                {zone.supportedVehicleTypes.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {zone.supportedVehicleTypes.map((label) => {
                        const kind = normalizeVehicleKind(label);
                        const Icon = getVehicleIconByKind(kind);

                        return (
                          <span
                            key={label}
                            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-100"
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  {zone.pricingItems.map((item) => {
                    const Icon = getVehicleIconByKind(item.vehicleKind);

                    return (
                      <div
                        key={`${item.id}-${item.vehicleKind}-${item.cashAndCoin ? 'both' : 'cash'}`}
                        className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-blue-50 to-sky-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100">
                              <Icon className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 truncate">{item.type}</div>
                              <div className="text-xs text-gray-500">
                                {getVehicleLabelByKind(item.vehicleKind)}
                                {item.cashAndCoin ? ' · Tiền + xu ảo' : ' · Tiền'}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-bold text-indigo-700">
                              {formatPriceDisplay(item)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => globalThis.location.href = `/owner/parking/${lotId}/zone/${zone.makhuvuc}/select-vehicle`}
                  className="w-full mt-5 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
                >
                  Chọn khu vực này
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};