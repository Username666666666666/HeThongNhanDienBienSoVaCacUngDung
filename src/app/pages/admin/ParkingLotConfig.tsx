import { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  MapPin,
  DollarSign,
  Grid3x3,
  Coins,
  Info,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase.ts';

interface PricingItem {
  type: string;
  priceType: 'fixed' | 'hourly' | 'daily';
  price: string;
  coinPrice: string;
  isVirtualCoin: boolean;
  vehicleGroup: 'car' | 'motorcycle';
}

export const ParkingLotConfig = () => {
  const [step, setStep] = useState(1);

  const uploadImage = async (file: File, bucket: 'BaiDo' | 'SanDo') => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  };

  const updatePricing = (index: number, field: keyof PricingItem, value: any) => {
    const newPricing = [...pricing];
    if (field === 'isVirtualCoin') {
      newPricing[index].isVirtualCoin = value;
      if (value === true) newPricing[index].priceType = 'fixed';
    } else {
      (newPricing[index][field] as any) = value;
    }
    setPricing(newPricing);
  };

  // Mock: Admin đã đăng ký gói có xu ảo hay không
  const hasVirtualCoinPackage = true; // true nếu đăng ký gói Cao cấp + Xu ảo

  const [lotInfo, setLotInfo] = useState({
    name: '',
    communityCode: '',
    address: '',
    phone: '',
    description: '',
    operatingHours: '24/7',
    imageFile: null as File | null,
  });

  const [pricing, setPricing] = useState<PricingItem[]>([
    {
      type: 'Xe máy',
      priceType: 'fixed',
      price: '5000',
      coinPrice: '5',
      isVirtualCoin: false,
      vehicleGroup: 'motorcycle',
    },
    {
      type: 'Xe ô tô',
      priceType: 'fixed',
      price: '20000',
      coinPrice: '20',
      isVirtualCoin: false,
      vehicleGroup: 'car',
    },
  ]);

  const [zones, setZones] = useState([
    {
      id: 1,
      name: 'Sân A',
      spots: ['A001', 'A002', 'A003', 'A004', 'A005'],
      description: '',
      imageFile: null as File | null,
      supportedVehicleTypes: [] as string[],
    },
  ]);

  // Cấu hình xu ảo từ Provider (SỐ LƯỢNG xu tối thiểu/tối đa)
  const providerCoinSettings = {
    minCoins: 5,
    maxCoins: 200,
  };

  const addPricing = (group: 'car' | 'motorcycle') => {
    setPricing([
      ...pricing,
      {
        type: '',
        priceType: 'fixed',
        price: '',
        coinPrice: '',
        isVirtualCoin: false,
        vehicleGroup: group,
      },
    ]);
  };

  const removePricing = (index: number) => {
    setPricing(pricing.filter((_, i) => i !== index));
  };

  const addZone = () => {
    setZones([
      ...zones,
      {
        id: Date.now(),
        name: '',
        spots: [],
        description: '',
        imageFile: null,
        supportedVehicleTypes: [],
      },
    ]);
  };

  const addSpot = (zoneId: number) => {
    setZones(
      zones.map((zone) => {
        if (zone.id === zoneId) {
          const newSpotNumber = zone.spots.length + 1;
          const newSpot = `${zone.name}${String(newSpotNumber).padStart(3, '0')}`;
          return { ...zone, spots: [...zone.spots, newSpot] };
        }
        return zone;
      })
    );
  };

  const handleSave = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Bạn cần đăng nhập');

      // 1. Kiểm tra Unique mã bãi đỗ
      const { data: existingLot } = await supabase
        .from('baido')
        .select('mathamgia')
        .eq('mathamgia', lotInfo.communityCode.trim())
        .maybeSingle();

      if (existingLot) {
        toast.error(`Mã "${lotInfo.communityCode}" đã tồn tại!`);
        return;
      }

      // 2. Upload ảnh bãi đỗ
      let lotImageUrl = '';
      if (lotInfo.imageFile instanceof File) {
        lotImageUrl = await uploadImage(lotInfo.imageFile, 'BaiDo');
      }

      // 3. LƯU BẢNG BÃI ĐỖ TRƯỚC (Để lấy lotData)
      const { data: lotData, error: lotErr } = await supabase
        .from('baido')
        .insert([
          {
            tenbaido: lotInfo.name,
            mathamgia: lotInfo.communityCode.trim(),
            diachi: lotInfo.address,
            sodienthoai: lotInfo.phone,
            giohoatdong: lotInfo.operatingHours,
            mota: lotInfo.description,
            hinhanh: lotImageUrl,
            manguoidung: user.id,
            congkhai: false,
            danhgia: false,
          },
        ])
        .select()
        .single();

      if (lotErr) throw lotErr;

      // 4. LƯU BẢNG GIÁ
      const { data: pricingData, error: pErr } = await supabase
        .from('banggia')
        .insert(
          pricing.map((p) => ({
            loaixe: p.type,
            thanhtien: parseFloat(p.price) || 0,
            mabaido: lotData.mabaido,
            loaigia: p.priceType,
            thanhtoanxuao: p.isVirtualCoin,
            kieuxe: p.vehicleGroup,
          }))
        )
        .select();

      if (pErr) throw pErr;

      // 4.1 LƯU SỐ XU VÀO BẢNG banggiaxuao
      if (pricingData) {
        const virtualCoinData = pricing
          .map((p, index) => {
            if (p.isVirtualCoin) {
              return {
                mabanggia: pricingData[index].mabanggia,
                thanhxu: parseInt(p.coinPrice) || 0,
              };
            }
            return null;
          })
          .filter((item): item is { mabanggia: string; thanhxu: number } => item !== null);

        if (virtualCoinData.length > 0) {
          const { error: coinErr } = await supabase.from('banggiaxuao').insert(virtualCoinData);
          if (coinErr) console.error('Lỗi lưu số xu ảo:', coinErr);
        }
      }

      // 5. Lưu từng khu vực và các bảng liên quan
      for (const zone of zones) {
        let zoneImageUrl = '';
        if (zone.imageFile instanceof File) {
          zoneImageUrl = await uploadImage(zone.imageFile, 'SanDo');
        }

        const { data: zData, error: zErr } = await supabase
          .from('khuvudo')
          .insert([
            {
              tenkhuvuc: zone.name,
              hinhkhuvuc: zoneImageUrl,
              mota: zone.description,
              mabaido: lotData.mabaido,
            },
          ])
          .select()
          .single();

        if (zErr) throw zErr;

        if (zData) {
          // Lưu vị trí (Vitrido)
          if (zone.spots.length > 0) {
            const spots = zone.spots.map((s) => ({
              makhuvuc: zData.makhuvuc,
              tenvitri: s,
              trangthai: 0,
            }));
            await supabase.from('vitrido').insert(spots);
          }

          // Lưu phương tiện hỗ trợ (Lấy UUID từ pricingData)
          if (zone.supportedVehicleTypes.length > 0) {
            const supports = zone.supportedVehicleTypes
              .map((typeName) => {
                const matchedPrice = pricingData?.find((p) => p.loaixe === typeName);
                return {
                  makhuvuc: zData.makhuvuc,
                  mabanggia: matchedPrice?.mabanggia,
                };
              })
              .filter((s) => s.mabanggia);

            if (supports.length > 0) {
              const { error: spErr } = await supabase.from('phuongtienhotro').insert(supports);
              if (spErr) console.error('Lỗi lưu phương tiện hỗ trợ:', spErr);
            }
          }
        }
      }

      toast.success('Cấu hình bãi đỗ và sân đỗ hoàn tất!');
      globalThis.location.replace('/admin');
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    }
  };

  const renderPricingGroup = (
    group: 'motorcycle' | 'car',
    title: string,
    titleColor: string,
    addButtonText: string
  ) => {
    const groupItems = pricing
      .map((item, index) => ({ item, index }))
      .filter((p) => p.item.vehicleGroup === group);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-bold ${titleColor}`}>{title}</h3>
          <button
            onClick={() => addPricing(group)}
            className="border-2 border-dashed border-gray-300 px-4 py-2 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {addButtonText}
          </button>
        </div>

        {groupItems.map(({ item, index }, displayIndex) => (
          <div
            key={`${group}-${index}`}
            className={`border-2 rounded-lg p-4 transition-all ${
              item.isVirtualCoin ? 'border-yellow-400 bg-yellow-50/30' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-gray-700">Cấu hình loại xe #{displayIndex + 1}</span>
              <label className="flex items-center gap-2 cursor-pointer group">
                <span className="text-sm font-semibold text-gray-600 group-hover:text-yellow-700">
                  Sử dụng Xu ảo?
                </span>
                <input
                  type="checkbox"
                  checked={item.isVirtualCoin}
                  onChange={(e) => updatePricing(index, 'isVirtualCoin', e.target.checked)}
                  className="w-4 h-4 accent-yellow-500"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Loại xe</label>
                <input
                  type="text"
                  value={item.type}
                  onChange={(e) => updatePricing(index, 'type', e.target.value)}
                  placeholder={group === 'motorcycle' ? 'VD: Xe máy' : 'VD: Xe ô tô'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Loại giá</label>
                <select
                  value={item.priceType}
                  disabled={item.isVirtualCoin}
                  onChange={(e) => updatePricing(index, 'priceType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="fixed">Cố định</option>
                  <option value="hourly">Theo giờ</option>
                  <option value="daily">Theo ngày</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Giá tiền mặt (VNĐ)</label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updatePricing(index, 'price', e.target.value)}
                  placeholder="20000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700 flex items-center gap-1">
                  <Coins className={`w-4 h-4 ${item.isVirtualCoin ? 'text-yellow-600' : 'text-gray-400'}`} />
                  Giá xu ảo
                </label>
                <input
                  type="number"
                  value={item.coinPrice}
                  disabled={!item.isVirtualCoin}
                  onChange={(e) => updatePricing(index, 'coinPrice', e.target.value)}
                  placeholder="20"
                  className={`w-full px-3 py-2 border rounded-lg outline-none transition-all ${
                    item.isVirtualCoin
                      ? 'border-yellow-400 bg-white focus:ring-2 focus:ring-yellow-500'
                      : 'border-gray-200 bg-gray-50 text-gray-400'
                  }`}
                />
              </div>

              <div>
                <button
                  onClick={() => removePricing(index)}
                  className="w-full bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa
                </button>
              </div>
            </div>

            {item.isVirtualCoin && (
              <div className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold text-yellow-700 bg-yellow-100/50 p-2 rounded border border-yellow-200">
                <AlertTriangle className="w-3 h-3" />
                <span>Hệ thống tự động khóa "Cố định" cho thanh toán bằng Xu.</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : globalThis.location.replace('/admin'))}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl mb-1">Cấu hình bãi đỗ</h1>
              <p className="text-purple-100 text-sm">
                Bước {step}/3: {step === 1 ? 'Thông tin cơ bản' : step === 2 ? 'Bảng giá' : 'Vị trí đỗ'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl text-gray-900">Thông tin bãi đỗ</h2>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Tên bãi đỗ</label>
              <input
                type="text"
                value={lotInfo.name}
                onChange={(e) => setLotInfo({ ...lotInfo, name: e.target.value })}
                placeholder="VD: Bãi đỗ xe A"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                Mã bãi đỗ / Mã cộng đồng
                <span className="text-purple-600 ml-1">*</span>
              </label>
              <input
                type="text"
                value={lotInfo.communityCode}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                  setLotInfo({ ...lotInfo, communityCode: value });
                }}
                placeholder="VD: PARK-A001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Mã này sẽ được dùng để quản lý trang cộng đồng và nhóm hỗ trợ của bãi đỗ
              </p>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Địa chỉ</label>
              <input
                type="text"
                value={lotInfo.address}
                onChange={(e) => setLotInfo({ ...lotInfo, address: e.target.value })}
                placeholder="Nhập địa chỉ chính xác"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Số điện thoại</label>
              <input
                type="tel"
                value={lotInfo.phone}
                onChange={(e) => setLotInfo({ ...lotInfo, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Giờ hoạt động</label>
              <input
                type="text"
                value={lotInfo.operatingHours}
                onChange={(e) => setLotInfo({ ...lotInfo, operatingHours: e.target.value })}
                placeholder="VD: 06:00 - 22:00 hoặc 24/7"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Mô tả</label>
              <textarea
                value={lotInfo.description}
                onChange={(e) => setLotInfo({ ...lotInfo, description: e.target.value })}
                placeholder="Mô tả về bãi đỗ..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Hình ảnh bãi đỗ</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setLotInfo({ ...lotInfo, imageFile: file });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
              />
              {lotInfo.imageFile && <p className="text-xs text-green-600 mt-1">đã chọn: {lotInfo.imageFile.name}</p>}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Tính năng tự động khi tạo bãi mới:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Tạo trang đánh giá (review) cho bãi đỗ</li>
                <li>✓ Tạo nhóm cộng đồng với mã: {lotInfo.communityCode || '[Mã cộng đồng]'}</li>
                <li>✓ Khởi tạo hệ thống kiểm duyệt bài đăng</li>
                <li>✓ Thiết lập kênh hỗ trợ khách hàng</li>
              </ul>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl text-gray-900">Cấu hình bảng giá</h2>
            </div>

            {hasVirtualCoinPackage && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Coins className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      Thông tin xu ảo từ nhà cung cấp
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">Nhà cung cấp đã cấu hình giá xu ảo cho toàn hệ thống:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-green-300">
                        <div className="text-xs text-gray-600 mb-1">Tỷ giá tối thiểu</div>
                        <div className="text-lg font-bold text-green-600">
                          {providerCoinSettings.minCoins} xu/lần đặt
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-red-300">
                        <div className="text-xs text-gray-600 mb-1">Tỷ giá tối đa</div>
                        <div className="text-lg font-bold text-red-600">
                          {providerCoinSettings.maxCoins} xu/lần đặt
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Chỉ nhà cung cấp mới có quyền thay đổi cấu hình xu ảo
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {renderPricingGroup('motorcycle', '🏍 Xe máy', 'text-purple-700', 'Thêm xe máy')}
              {renderPricingGroup('car', '🚗 Xe ô tô', 'text-indigo-700', 'Thêm xe ô tô')}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Grid3x3 className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl text-gray-900">Cấu hình vị trí đỗ</h2>
              </div>

              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="mb-6 border-2 border-purple-200 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-blue-50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm mb-2 text-gray-700 font-semibold">Tên sân/khu vực</label>
                      <input
                        type="text"
                        value={zone.name}
                        onChange={(e) => {
                          setZones(zones.map((z) => (z.id === zone.id ? { ...z, name: e.target.value } : z)));
                        }}
                        placeholder="VD: Sân A"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-gray-700 font-semibold">Hình ảnh sân/khu vực</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setZones(zones.map((z) => (z.id === zone.id ? { ...z, imageFile: file } : z)));
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      {zone.imageFile && <p className="text-[10px] text-green-600">Đã nhận ảnh sân</p>}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm mb-2 text-gray-700 font-semibold">Mô tả khu vực</label>
                    <textarea
                      value={zone.description}
                      onChange={(e) => {
                        setZones(zones.map((z) => (z.id === zone.id ? { ...z, description: e.target.value } : z)));
                      }}
                      placeholder="Mô tả về khu vực này, vị trí, đặc điểm..."
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm mb-2 text-gray-700 font-semibold">
                      Loại xe được đỗ tại khu vực này
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {pricing.map((p, pIndex) => (
                        <label
                          key={`${p.vehicleGroup}-${p.type}-${pIndex}`}
                          className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-purple-400 transition"
                        >
                          <input
                            type="checkbox"
                            checked={zone.supportedVehicleTypes.includes(p.type)}
                            onChange={(e) => {
                              setZones(
                                zones.map((z) => {
                                  if (z.id === zone.id) {
                                    if (e.target.checked) {
                                      return {
                                        ...z,
                                        supportedVehicleTypes: [...z.supportedVehicleTypes, p.type],
                                      };
                                    } else {
                                      return {
                                        ...z,
                                        supportedVehicleTypes: z.supportedVehicleTypes.filter((v) => v !== p.type),
                                      };
                                    }
                                  }
                                  return z;
                                })
                              );
                            }}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">
                            {p.type}
                            <span className="text-[10px] text-gray-500 ml-1">
                              ({p.vehicleGroup === 'car' ? 'ô tô' : 'xe máy'})
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                    {zone.supportedVehicleTypes.length === 0 && (
                      <p className="text-xs text-red-500">⚠️ Vui lòng chọn ít nhất 1 loại xe</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm text-gray-700 font-semibold">Vị trí đỗ</label>
                      <button
                        onClick={() => addSpot(zone.id)}
                        className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition text-sm font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm vị trí
                      </button>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {zone.spots.map((spot, spotIndex) => (
                        <div
                          key={spotIndex}
                          className="bg-green-50 border-2 border-green-300 text-green-700 px-3 py-2 rounded text-center text-sm font-semibold"
                        >
                          {spot}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addZone}
                className="w-full border-2 border-dashed border-gray-300 py-4 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Thêm sân/khu vực mới
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 border border-gray-300 text-gray-700 py-4 rounded-lg hover:bg-gray-50 transition"
            >
              Quay lại
            </button>
          )}
          <button
            onClick={() => (step < 3 ? setStep(step + 1) : handleSave())}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
          >
            {step < 3 ? 'Tiếp tục' : 'Hoàn tất'}
          </button>
        </div>
      </div>
    </div>
  );
};