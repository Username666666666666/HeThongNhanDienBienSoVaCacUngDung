import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  MapPin,
  Map,
  Camera,
  Layers3,
  Star,
  DollarSign,
  Maximize,
  Minimize,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase.ts'; // Kiểm tra lại đường dẫn này
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useMap } from 'react-leaflet'; // Bổ sung useMap vào danh sách import trên cùng nếu chưa có

const MapController = ({ center, isFullscreen }: { center: [number, number], isFullscreen: boolean }) => {
  const map = useMap();
  
  // Hiệu ứng bay mượt mà tới vị trí mới thay vì giật cục
  useEffect(() => {
    map.flyTo(center, 16, { animate: true, duration: 1.5 });
  }, [center, map]);

  // Fix lỗi xám bản đồ khi phóng to
  useEffect(() => {
    setTimeout(() => { map.invalidateSize(); }, 200);
  }, [isFullscreen, map]);

  return null;
};

// ==========================================
// ĐIỀN API KEY GOOGLE MAPS CỦA BẠN VÀO ĐÂY
// ==========================================
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface PricingItem {
  type: string;
  vehicleGroup: 'car' | 'motorcycle';
  phut_an_han: number;
  phut_block_dau: number;
  gia_block_dau: number;
  phut_block_tiep: number;
  gia_block_tiep: number;
  phu_phi_dem: number;
  gio_bat_dau_dem: string;      // THÊM MỚI
  gio_ket_thuc_dem: string;     // THÊM MỚI
  phi_toi_da_ngay: number;      // THÊM MỚI
  thoi_gian_toi_da_ngay: number;// THÊM MỚI
}

interface SubscriptionCard {
  loaithe: 'thang' | 'quy';
  loaixe: 'car' | 'motorcycle';
  gia_tien: number;
}

interface ZoneItem {
  id: number;
  name: string;
  description: string;
  imageFile: File | null;
  is_vip: boolean;
  succhua_toida: number;
  han_muc_dat_truoc: number;
  camera_id: string;
}

export const ParkingLotConfig = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);

  // --- Thêm đoạn này vào ---
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchKey, setSearchKey] = useState('');
const [mapCenter, setMapCenter] = useState<[number, number]>([10.762622, 106.660172]);
 // -- CODE MỚI: TÍNH NĂNG GỢI Ý TỰ ĐỘNG --
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const searchTimeoutRef = React.useRef<any>(null);

  // Vừa gõ vừa tự động gọi API tìm kiếm
  const handleInputSearch = (val: string) => {
    setSearchKey(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (val.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
       const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&countrycodes=vn&accept-language=vi-VN`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.log("Lỗi tìm gợi ý");
      }
    }, 500); // Đợi gõ xong 0.5s mới tìm để tránh bị block API
  };

  // Khi click chọn 1 dòng gợi ý
  const handleSelectSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setMapCenter([lat, lon]);
    setLotInfo(prev => ({ ...prev, vi_do: item.lat, kinh_do: item.lon, address: item.display_name }));
    setSearchKey(item.display_name); // Hiển thị tên ngắn gọn lên ô input
    setSuggestions([]); // Ẩn danh sách gợi ý
    toast.success('Đã ghim vị trí!');
  };

  const [lotInfo, setLotInfo] = useState({
    name: '',
    communityCode: '',
    address: '',
    kinh_do: '',
    vi_do: '',
    phone: '',
    description: '',
    operatingHours: '24/7',
    imageFile: null as File | null,
  });

const [pricing, setPricing] = useState<PricingItem[]>([
    {
      type: 'Gói Xe máy tiêu chuẩn', vehicleGroup: 'motorcycle',
      phut_an_han: 15, phut_block_dau: 120, gia_block_dau: 5000, phut_block_tiep: 60, gia_block_tiep: 2000, phu_phi_dem: 10000,
      gio_bat_dau_dem: '22:00', gio_ket_thuc_dem: '07:00', phi_toi_da_ngay: 20000, thoi_gian_toi_da_ngay: 720
    },
    {
      type: 'Gói Ô tô tiêu chuẩn', vehicleGroup: 'car',
      phut_an_han: 15, phut_block_dau: 120, gia_block_dau: 30000, phut_block_tiep: 60, gia_block_tiep: 10000, phu_phi_dem: 50000,
      gio_bat_dau_dem: '22:00', gio_ket_thuc_dem: '07:00', phi_toi_da_ngay: 150000, thoi_gian_toi_da_ngay: 720
    },
  ]);

  // THÊM STATE NÀY
  const [cards, setCards] = useState<SubscriptionCard[]>([
    { loaithe: 'thang', loaixe: 'motorcycle', gia_tien: 150000 }
  ]);

  const [zones, setZones] = useState<ZoneItem[]>([
    {
      id: Date.now(),
      name: 'Tầng hầm B1',
      description: 'Khu vực đỗ xe chung',
      imageFile: null,
      is_vip: false,
      succhua_toida: 100,
      han_muc_dat_truoc: 0,
      camera_id: '',
    },
  ]);


  

  // HÀM FETCH API GOOGLE MAPS LẤY GPS
  const LocationPicker = () => {
    useMapEvents({
      click: async (e) => {
        const lat = e.latlng.lat.toString();
        const lng = e.latlng.lng.toString();
        setLotInfo(prev => ({ ...prev, vi_do: lat, kinh_do: lng }));
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi-VN`);
          const data = await res.json();
          setLotInfo(prev => ({ ...prev, address: data.display_name || 'Vị trí đã ghim' }));
          toast.success('Đã ghim vị trí!');
        } catch (err) {
          toast.error('Lỗi lấy tên đường');
        }
      },
    });
    return lotInfo.vi_do ? <Marker position={[parseFloat(lotInfo.vi_do), parseFloat(lotInfo.kinh_do)]} /> : null;
  };

  const uploadImage = async (file: File, bucket: 'BaiDo' | 'SanDo'): Promise<string> => {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}_${safeName}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error('Bạn cần đăng nhập');

      // 1. Kiểm tra Unique Code
      const { data: existingLot } = await supabase
        .from('baido')
        .select('mathamgia')
        .eq('mathamgia', lotInfo.communityCode.trim())
        .maybeSingle();

      if (existingLot) throw new Error(`Mã "${lotInfo.communityCode}" đã tồn tại!`);

      // 2. Upload Ảnh Bãi Đỗ
      let lotImageUrl = '';
      if (lotInfo.imageFile) {
        lotImageUrl = await uploadImage(lotInfo.imageFile, 'BaiDo');
      }

      // 3. Insert Bãi đỗ (Cast any để ép kiểu nếu file types.ts của bạn chưa update bảng mới)
      const { data: lotData, error: lotErr } = await (supabase.from('baido') as any)
        .insert([{
          tenbaido: lotInfo.name,
          mathamgia: lotInfo.communityCode.trim(),
          diachi: lotInfo.address,
          kinh_do: parseFloat(lotInfo.kinh_do) || null,
          vi_do: parseFloat(lotInfo.vi_do) || null,
          sodienthoai: lotInfo.phone,
          giohoatdong: lotInfo.operatingHours,
          mota: lotInfo.description,
          hinhanh: lotImageUrl,
          manguoidung: authData.user.id,
          congkhai: false,
        }])
        .select()
        .single();

      if (lotErr) throw lotErr;

      // 4. Insert Bảng Giá (banggia1)
      // 4. Insert Bảng Giá (banggia1) - SỬA LẠI
      const { error: pErr } = await (supabase.from('banggia1') as any).insert(
        pricing.map((p) => ({
          mabaido: lotData.mabaido,
          ten_goi_gia: p.type,
          kieuxe: p.vehicleGroup,
          phut_an_han: p.phut_an_han,
          phut_block_dau: p.phut_block_dau,
          gia_block_dau: p.gia_block_dau,
          phut_block_tiep: p.phut_block_tiep,
          gia_block_tiep: p.gia_block_tiep,
          phu_phi_dem: p.phu_phi_dem,
          gio_bat_dau_dem: p.gio_bat_dau_dem,
          gio_ket_thuc_dem: p.gio_ket_thuc_dem,
          phi_toi_da_ngay: p.phi_toi_da_ngay,
          thoi_gian_toi_da_ngay: p.thoi_gian_toi_da_ngay,
        }))
      );
      if (pErr) throw pErr;

      // 4.1 THÊM MỚI: Insert Thẻ Tháng/Quý
      if (cards.length > 0) {
        const { error: cErr } = await supabase.from('the_thang_quy').insert(
          cards.map((c) => ({
            mabaido: lotData.mabaido,
            loaithe: c.loaithe,
            loaixe: c.loaixe,
            gia_tien: c.gia_tien
          }))
        );
        if (cErr) throw cErr;
      }

      if (pErr) throw pErr;

      // 5. Insert Khu vực (khuvucdo1)
      for (const zone of zones) {
        let zoneImageUrl = '';
        if (zone.imageFile) {
          zoneImageUrl = await uploadImage(zone.imageFile, 'SanDo');
        }

        const { error: zErr } = await (supabase.from('khuvucdo1') as any).insert([{
          mabaido: lotData.mabaido,
          tenkhuvuc: zone.name,
          mota: zone.description,
          hinhkhuvuc: zoneImageUrl,
          is_vip: zone.is_vip,
          succhua_toida: zone.succhua_toida,
          han_muc_dat_truoc: zone.is_vip ? zone.han_muc_dat_truoc : 0,
          camera_id: zone.camera_id,
        }]);

        if (zErr) throw zErr;
      }

      toast.success('Khởi tạo Bãi đỗ thông minh thành công!');
      navigate('/admin/my-parking-lots');
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => (step > 1 ? setStep(step - 1) : navigate('/admin'))} className="p-2 hover:bg-white/10 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold mb-0.5">Khởi tạo Bãi đỗ mới</h1>
            <p className="text-blue-200 text-xs">Bước {step}/3: {step === 1 ? 'Thông tin & GPS' : step === 2 ? 'Cấu hình Giá Block' : 'Quản lý Sức chứa Khu vực'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Thông tin cơ bản & Định vị</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Tên bãi đỗ" value={lotInfo.name} onChange={(v) => setLotInfo({ ...lotInfo, name: v })} />
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Mã cộng đồng (Dùng cấp quyền App) *</label>
                <input
                  type="text"
                  value={lotInfo.communityCode}
                  onChange={(e) => setLotInfo({ ...lotInfo, communityCode: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono uppercase bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: VINCOM-Q1"
                />
              </div>

           <div className="md:col-span-2 space-y-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <label className="block text-sm font-bold text-blue-900">Tìm kiếm & Ghim vị trí trên bản đồ</label>
                
               
                {/* Thanh Search Có Gợi Ý */}
                <div className="relative flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchKey}
                      onChange={(e) => handleInputSearch(e.target.value)}
                      placeholder="Gõ địa chỉ để hiện gợi ý (VD: Bến Nghé Quận 1)..."
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="button" onClick={() => handleInputSearch(searchKey)} className="bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2">
                      <Search className="w-5 h-5" /> Tìm
                    </button>
                  </div>

                  {/* Bảng Danh sách xổ xuống */}
                  {suggestions.length > 0 && (
                    <ul className="absolute top-[54px] left-0 right-[100px] bg-white border border-gray-200 rounded-xl shadow-2xl z-[10000] max-h-60 overflow-y-auto">
                      {suggestions.map((item, idx) => (
                        <li 
                          key={idx} 
                          onClick={() => handleSelectSuggestion(item)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 text-sm text-gray-700"
                        >
                          <MapPin className="w-4 h-4 inline-block mr-2 text-blue-500" />
                          {item.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Khung Bản Đồ (Hỗ trợ Fullscreen) */}
                <div className={isFullscreen ? 'fixed inset-4 z-[9999] bg-white p-2 rounded-2xl shadow-2xl flex flex-col' : 'h-[400px] relative rounded-xl border-2 border-blue-300 z-0'}>
                  <div className="absolute top-4 right-4 z-[1000]">
                    <button type="button" onClick={() => setIsFullscreen(!isFullscreen)} className="bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-100 text-gray-800 font-bold flex items-center gap-2">
                      {isFullscreen ? <><Minimize className="w-5 h-5"/> Thu nhỏ</> : <><Maximize className="w-5 h-5"/> Phóng to</>}
                    </button>
                  </div>
                  
                  <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%', borderRadius: isFullscreen ? '0.75rem' : '0.75rem', zIndex: 1 }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker />
                    <MapController center={mapCenter} isFullscreen={isFullscreen} />
                  </MapContainer>
                </div>
              </div>

              {/* KHÓA CỨNG CÁC Ô NHẬP TỌA ĐỘ */}
              <div className="md:col-span-2">
                <Field label="Địa chỉ thực tế (Khóa - Lấy tự động từ bản đồ)" value={lotInfo.address} onChange={() => {}} disabled />
              </div>
              <Field label="Vĩ độ (Lat)" type="number" value={lotInfo.vi_do} onChange={() => {}} disabled />
              <Field label="Kinh độ (Lng)" type="number" value={lotInfo.kinh_do} onChange={() => {}} disabled />

              <Field label="Số điện thoại CSKH" value={lotInfo.phone} onChange={(v) => setLotInfo({ ...lotInfo, phone: v })} />
              <Field label="Giờ hoạt động" value={lotInfo.operatingHours} onChange={(v) => setLotInfo({ ...lotInfo, operatingHours: v })} placeholder="VD: 24/7" />

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1 text-gray-700">Ảnh toàn cảnh bãi xe</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setLotInfo({ ...lotInfo, imageFile: file });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              <strong>Hệ thống tính giá lũy tiến:</strong> Xe vào bãi sẽ được miễn phí trong "TG Ân hạn". Sau đó bị tính tiền "Block đầu". Quá giờ sẽ cộng thêm "Block tiếp theo".
            </div>

            {['motorcycle', 'car'].map((group) => (
              <div key={group} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                  <h3 className="text-lg font-bold text-gray-900">{group === 'car' ? '🚗 Bảng giá Ô tô' : '🏍 Bảng giá Xe máy'}</h3>
                 <button
  onClick={() => setPricing([...pricing, { type: 'Gói mới', vehicleGroup: group as any, phut_an_han: 15, phut_block_dau: 120, gia_block_dau: 0, phut_block_tiep: 60, gia_block_tiep: 0, phu_phi_dem: 0, gio_bat_dau_dem: '22:00', gio_ket_thuc_dem: '07:00', phi_toi_da_ngay: 20000, thoi_gian_toi_da_ngay: 720 }])}
  className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded"
>
  + Thêm Gói
</button>
                </div>

                {pricing.map((p, idx) => p.vehicleGroup === group && (
                  <div key={idx} className="border border-gray-200 rounded-xl p-4 mb-4 relative bg-gray-50">
                    <button onClick={() => setPricing(pricing.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <Field label="Tên Gói" value={p.type} onChange={(v) => { const newP = [...pricing]; newP[idx]!.type = v; setPricing(newP); }} className="w-2/3 mb-4" />

                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Field label="TG Ân hạn (phút)" type="number" value={String(p.phut_an_han)} onChange={(v) => { const newP = [...pricing]; newP[idx]!.phut_an_han = Number(v) || 0; setPricing(newP); }} />
                      <div className="hidden md:block"></div>
                      <Field label="Phút Block Đầu" type="number" value={String(p.phut_block_dau)} onChange={(v) => { const newP = [...pricing]; newP[idx]!.phut_block_dau = Number(v) || 0; setPricing(newP); }} />
                      <Field label="Giá Block Đầu (đ)" type="number" value={String(p.gia_block_dau)} onChange={(v) => { const newP = [...pricing]; newP[idx]!.gia_block_dau = Number(v) || 0; setPricing(newP); }} />
                      <Field label="Phút Block Tiếp" type="number" value={String(p.phut_block_tiep)} onChange={(v) => { const newP = [...pricing]; newP[idx]!.phut_block_tiep = Number(v) || 0; setPricing(newP); }} />
                      <Field label="Giá Block Tiếp (đ)" type="number" value={String(p.gia_block_tiep)} onChange={(v) => { const newP = [...pricing]; newP[idx]!.gia_block_tiep = Number(v) || 0; setPricing(newP); }} />
                      
                      {/* --- THÊM 4 CỘT MỚI TẠI ĐÂY --- */}
                      <Field label="Giờ bắt đầu đêm (VD: 22:00)" type="time" value={p.gio_bat_dau_dem} onChange={(v) => { const newP = [...pricing]; newP[idx]!.gio_bat_dau_dem = v; setPricing(newP); }} />
                      <Field label="Giờ kết thúc đêm (VD: 07:00)" type="time" value={p.gio_ket_thuc_dem} onChange={(v) => { const newP = [...pricing]; newP[idx]!.gio_ket_thuc_dem = v; setPricing(newP); }} />
                      <Field label="TG tối đa ngày (phút)" type="number" value={String(p.thoi_gian_toi_da_ngay)} onChange={(v) => { const newP = [...pricing]; newP[idx]!.thoi_gian_toi_da_ngay = Number(v) || 0; setPricing(newP); }} />
                      <Field label="Giá trần ngày tối đa (đ)" type="number" value={String(p.phi_toi_da_ngay)} onChange={(v) => { const newP = [...pricing]; newP[idx]!.phi_toi_da_ngay = Number(v) || 0; setPricing(newP); }} />
                      
                      <Field label="Phụ thu qua đêm trọn gói (đ)" type="number" value={String(p.phu_phi_dem)} onChange={(v) => { const newP = [...pricing]; newP[idx]!.phu_phi_dem = Number(v) || 0; setPricing(newP); }} className="md:col-span-2" />
                        
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {/* THÊM MỚI GIAO DIỆN THẺ THÁNG QUÝ */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-purple-200">
              <div className="flex justify-between items-center mb-4 border-b pb-3 border-purple-100">
                <h3 className="text-lg font-bold text-purple-900">💳 Bảng giá Thẻ Tháng / Quý</h3>
                <button onClick={() => setCards([...cards, { loaithe: 'thang', loaixe: 'motorcycle', gia_tien: 0 }])} className="text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded">+ Thêm Thẻ</button>
              </div>
              {cards.map((c, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap gap-4 mb-4 items-end bg-purple-50/50 p-4 rounded-xl relative">
                  <button onClick={() => setCards(cards.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-red-500"><Trash2 className="w-5 h-5"/></button>
             <div className="w-full md:w-1/3">
  <label className="block text-sm font-semibold mb-1">Loại thẻ</label>
  <select value={c.loaithe} onChange={(e) => { const n = [...cards]; n[idx]!.loaithe = e.target.value as any; setCards(n); }} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white outline-none">
    <option value="thang">Vé Tháng</option><option value="quy">Vé Quý</option>
  </select>
</div>
<div className="w-full md:w-1/3">
  <label className="block text-sm font-semibold mb-1">Loại xe</label>
  <select value={c.loaixe} onChange={(e) => { const n = [...cards]; n[idx]!.loaixe = e.target.value as any; setCards(n); }} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white outline-none">
    <option value="motorcycle">Xe máy</option><option value="car">Ô tô</option>
  </select>
</div>
<Field label="Giá tiền (đ)" type="number" className="w-full md:w-1/3" value={String(c.gia_tien)} onChange={(v) => { const n = [...cards]; n[idx]!.gia_tien = Number(v); setCards(n); }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>Không vẽ sơ đồ ô đỗ:</strong> Chỉ cần thiết lập "Tổng sức chứa" của khu vực. Hệ thống AI Camera sẽ tự động đếm xe ra vào để tính chỗ trống.
            </div>

            {zones.map((zone, idx) => (
              <div key={zone.id} className={`bg-white rounded-2xl shadow-sm p-6 border-2 ${zone.is_vip ? 'border-amber-400' : 'border-gray-200'}`}>
                <div className="flex justify-between border-b pb-3 mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    {zone.is_vip ? <Star className="text-amber-500 w-5 h-5" /> : <Layers3 className="text-gray-400 w-5 h-5" />}
                    Khu vực #{idx + 1}
                  </h3>
                  {zones.length > 1 && (
                    <button onClick={() => setZones(zones.filter((z) => z.id !== zone.id))} className="text-red-500 font-semibold hover:underline">Xóa khu này</button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Tên Khu Vực (VD: Tầng G)" value={zone.name} onChange={(v) => { const newZ = [...zones]; newZ[idx]!.name = v; setZones(newZ); }} />

                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-3 cursor-pointer bg-gray-50 border border-gray-200 p-3 rounded-xl w-full">
                      <input type="checkbox" checked={zone.is_vip} onChange={(e) => { const newZ = [...zones]; newZ[idx]!.is_vip = e.target.checked; setZones(newZ); }} className="w-5 h-5 accent-amber-500" />
                      <div>
                        <div className="font-bold text-gray-900">Là khu vực Đặt trước (VIP)</div>
                        <div className="text-xs text-gray-500">Khách vãng lai sẽ bị chặn lại ở khu này</div>
                      </div>
                    </label>
                  </div>

                  <Field label="Sức chứa vật lý tối đa" type="number" value={String(zone.succhua_toida)} onChange={(v) => { const newZ = [...zones]; newZ[idx]!.succhua_toida = Number(v) || 0; setZones(newZ); }} />
                  {zone.is_vip && (
                    <Field label="Hạn mức Booking trên App" type="number" value={String(zone.han_muc_dat_truoc)} onChange={(v) => { const newZ = [...zones]; newZ[idx]!.han_muc_dat_truoc = Number(v) || 0; setZones(newZ); }} />
                  )}

                  <div className="md:col-span-2 relative">
                    <Camera className="w-5 h-5 absolute left-3 top-[34px] text-gray-400" />
                    <Field label="Mã ID Camera đếm xe (Để AI tự động cập nhật chỗ trống)" value={zone.camera_id} onChange={(v) => { const newZ = [...zones]; newZ[idx]!.camera_id = v; setZones(newZ); }} className="pl-10" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Sơ đồ khu vực (Dùng hiện lên App)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const newZ = [...zones];
                          newZ[idx]!.imageFile = file;
                          setZones(newZ);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={() => setZones([...zones, { id: Date.now(), name: '', description: '', imageFile: null, is_vip: false, succhua_toida: 50, han_muc_dat_truoc: 0, camera_id: '' }])} className="w-full border-2 border-dashed border-gray-300 py-4 rounded-xl text-gray-600 font-bold hover:border-blue-500 hover:text-blue-600 flex justify-center items-center gap-2 transition">
              <Plus className="w-5 h-5" /> Thêm Khu Vực Khác
            </button>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button onClick={() => (step < 3 ? setStep(step + 1) : handleSave())} disabled={saving} className="w-full bg-blue-700 text-white py-4 rounded-xl hover:bg-blue-800 transition font-bold text-lg shadow-lg disabled:opacity-50">
            {saving ? 'Đang xử lý...' : step < 3 ? 'Tiếp tục' : 'Hoàn tất Khởi tạo'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Helper Component chặt chẽ ---
interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, value, onChange, type = 'text', placeholder, className = '', disabled = false }) => {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold mb-1 text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition ${disabled ? 'bg-gray-200 cursor-not-allowed text-gray-500' : 'bg-gray-50 focus:bg-white'}`}
      />
    </div>
  );
};