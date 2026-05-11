import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Eye, Clock, Search, Car, Star, Coins, Navigation, CreditCard, X, Info, ArrowLeft, Layers3
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase.ts';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet Icon
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom User Location Icon
const UserIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1004/1004093.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

interface PricingSummary {
  phut_block_dau: number;
  gia_block_dau: number;
  phi_toi_da_ngay: number;
  phu_phi_dem: number;
}

interface SubscriptionCard {
  loaithe: string;
  loaixe: string;
  gia_tien: number;
}

interface ParkingLot {
  id: string;
  name: string;
  communityCode: string;
  address: string;
  lat: number | null;
  lng: number | null;
  totalSpots: number;
  availableSpots: number;
  image: string;
  amenities: string[];
  supportedVehicles: string[];
  pricing: PricingSummary | null;
  subscriptionCards: SubscriptionCard[];
  rating: number | null;
  reviews: number;
  operatingHours: string;
}

// Map Controller for dynamic center update
const MapController = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

export const BrowseParkingLots = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [activeQR, setActiveQR] = useState<{ lot: ParkingLot, amount: number, desc: string } | null>(null);

  // ================= LẤY VỊ TRÍ REAL-TIME =================
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ GPS');
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => console.log('Lỗi lấy vị trí:', err),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ================= LOAD DATA =================
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('baido')
        .select(`
          mabaido, tenbaido, mathamgia, diachi, giohoatdong, hinhanh, kinh_do, vi_do, congkhai,
          khuvucdo1 ( succhua_toida ),
          banggia1 ( kieuxe, phut_block_dau, gia_block_dau, phi_toi_da_ngay, phu_phi_dem ),
          the_thang_quy ( loaithe, loaixe, gia_tien ),
          tienich ( ten_tien_ich )
        `)
        .eq('congkhai', true);

      if (!error && data) {
        const mapped = data.map((lot: any) => {
          // Tính tổng sức chứa (Giả lập chỗ trống ngẫu nhiên vì chưa có luồng camera real-time)
          const totalSpots = lot.khuvucdo1?.reduce((s: number, z: any) => s + (Number(z.succhua_toida) || 0), 0) || 0;
          const availableSpots = Math.floor(totalSpots * (Math.random() * 0.5 + 0.2)); 

          // Lấy loại xe & Giá
          const vehicleSet = new Set<string>();
          let pricingSum: PricingSummary | null = null;
          
          if (lot.banggia1 && lot.banggia1.length > 0) {
            lot.banggia1.forEach((p: any) => {
              if (p.kieuxe) vehicleSet.add(p.kieuxe);
            });
            pricingSum = {
              phut_block_dau: lot.banggia1[0].phut_block_dau,
              gia_block_dau: lot.banggia1[0].gia_block_dau,
              phi_toi_da_ngay: lot.banggia1[0].phi_toi_da_ngay,
              phu_phi_dem: lot.banggia1[0].phu_phi_dem,
            };
          }

          return {
            id: lot.mabaido,
            name: lot.tenbaido,
            communityCode: lot.mathamgia,
            address: lot.diachi,
            lat: lot.vi_do ? parseFloat(lot.vi_do) : null,
            lng: lot.kinh_do ? parseFloat(lot.kinh_do) : null,
            totalSpots,
            availableSpots,
            image: lot.hinhanh || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
            amenities: lot.tienich?.map((t: any) => t.ten_tien_ich) || [],
            supportedVehicles: Array.from(vehicleSet),
            pricing: pricingSum,
            subscriptionCards: lot.the_thang_quy || [],
            rating: (Math.random() * 1 + 4).toFixed(1) as unknown as number, // Random 4.0 - 5.0
            reviews: Math.floor(Math.random() * 100) + 10,
            operatingHours: lot.giohoatdong || '24/7',
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

  // Mở Google Maps chỉ đường
  const openDirections = (lat: number, lng: number) => {
    if (userLocation) {
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${lat},${lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      {/* HEADER TÌM KIẾM */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Khám phá Bãi đỗ & Bản đồ</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bãi, đường, quận..."
              className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 bg-white shadow-inner focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* BẢN ĐỒ TỔNG QUAN REAL-TIME */}
      <div className="w-full h-[40vh] md:h-[50vh] relative z-0 border-b-4 border-blue-600">
        <MapContainer 
          center={userLocation || [10.762622, 106.660172]} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {userLocation && (
            <>
              <Marker position={userLocation} icon={UserIcon}>
                <Popup><div className="font-bold text-blue-600 text-center">Vị trí của bạn</div></Popup>
              </Marker>
              <MapController center={userLocation} />
            </>
          )}

          {filteredLots.map((lot) => lot.lat && lot.lng && (
            <Marker key={lot.id} position={[lot.lat, lot.lng]}>
              <Popup className="custom-popup">
                <div className="w-64">
                  <img src={lot.image} className="w-full h-32 object-cover rounded-xl mb-2 shadow-sm" alt={lot.name} />
                  <h3 className="font-bold text-lg leading-tight mb-1 text-gray-900">{lot.name}</h3>
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3"/>{lot.address}</p>
                  
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded-lg mb-3">
                    <span className="text-sm font-semibold text-blue-800">Chỗ trống:</span>
                    <span className="text-lg font-black text-blue-600">{lot.availableSpots}/{lot.totalSpots}</span>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => openDirections(lot.lat!, lot.lng!)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-4 h-4"/> Chỉ đường
                    </button>
                    <button 
                      onClick={() => navigate(`/shared/parking-lot/${lot.id}`)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Nút định vị lại */}
        <button 
          onClick={() => {
            if (userLocation) {
              const map = document.querySelector('.leaflet-container') as any;
              map?._leaflet_map?.flyTo(userLocation, 16);
            }
          }}
          className="absolute bottom-6 right-6 z-[1000] bg-white p-3 rounded-full shadow-xl border border-gray-200 text-blue-600 hover:bg-blue-50 transition"
        >
          <MapPin className="w-6 h-6" />
        </button>
      </div>

      {/* DANH SÁCH BÃI ĐỖ */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Layers3 className="w-6 h-6 text-blue-600"/> Danh sách bãi đỗ lân cận ({filteredLots.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLots.map((lot) => (
            <div key={lot.id} className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all flex flex-col">
              
              {/* Image & Badges */}
              <div className="relative h-56 cursor-pointer" onClick={() => navigate(`/shared/parking-lot/${lot.id}`)}>
                <img src={lot.image} className="w-full h-full object-cover" alt="Parking" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                  <Car className="w-4 h-4"/> Còn {lot.availableSpots} chỗ
                </div>
                <div className="absolute top-4 right-4 bg-white/90 text-yellow-600 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500"/> {lot.rating}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white leading-tight mb-1 drop-shadow-md">{lot.name}</h3>
                  <p className="text-sm text-gray-200 flex items-center gap-1 line-clamp-1"><MapPin className="w-4 h-4"/>{lot.address}</p>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 flex flex-col">
                
                {/* Rule / Pricing Panel (Mô tả luật tính phí cho khách hiểu) */}
                {lot.pricing && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-5 h-5 text-blue-600"/>
                      <span className="font-bold text-blue-900">Bảng giá tóm tắt</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1.5 ml-1">
                      <li>• <span className="font-semibold text-gray-900">{lot.pricing.gia_block_dau.toLocaleString()}đ</span> cho <span className="font-semibold">{lot.pricing.phut_block_dau} phút</span> đầu tiên.</li>
                      <li>• Qua thời gian trên sẽ cộng thêm phí block tiếp theo.</li>
                      <li>• Gửi quá giờ đêm (+{lot.pricing.phu_phi_dem.toLocaleString()}đ) | Tối đa ngày: <span className="font-semibold text-red-600">{lot.pricing.phi_toi_da_ngay.toLocaleString()}đ</span>.</li>
                    </ul>
                  </div>
                )}

                {/* Subscriptions */}
                {lot.subscriptionCards.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-bold text-gray-700 mb-2">Gói Vé Dài Hạn (Mua trước):</div>
                    <div className="flex flex-wrap gap-2">
                      {lot.subscriptionCards.map((card, i) => (
                        <button 
                          key={i} 
                          onClick={() => setActiveQR({ 
                            lot, 
                            amount: card.gia_tien, 
                            desc: `Đăng ký vé ${card.loaithe === 'thang' ? 'Tháng' : 'Quý'} - ${card.loaixe === 'car' ? 'Ô tô' : 'Xe máy'}` 
                          })}
                          className="bg-purple-100 border border-purple-200 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-200 transition flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3"/> 
                          {card.loaithe === 'thang' ? 'Vé Tháng' : 'Vé Quý'} {card.loaixe === 'car' ? '🚗' : '🏍'} - {(card.gia_tien/1000)}K
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-4 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => navigate(`/shared/parking-lot/${lot.id}`)}
                    className="w-full py-3 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
                  >
                    Xem chi tiết
                  </button>
                  <button 
                    onClick={() => lot.lat && lot.lng && openDirections(lot.lat, lot.lng)}
                    className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4"/> Chỉ đường
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLots.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 mt-6">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-500">Không tìm thấy bãi đỗ nào khu vực này</h3>
          </div>
        )}
      </div>

      {/* MODAL MÔ PHỎNG THANH TOÁN QR VIETQR LẬP TỨC */}
      {activeQR && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white text-center relative">
              <button onClick={() => setActiveQR(null)} className="absolute top-4 right-4 bg-white/20 p-1.5 rounded-full hover:bg-white/40 transition">
                <X className="w-5 h-5"/>
              </button>
              <h3 className="text-xl font-bold mb-1">Thanh Toán Trực Tiếp</h3>
              <p className="text-sm text-purple-100 opacity-90">{activeQR.lot.name}</p>
            </div>
            
            <div className="p-6 text-center">
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                <div className="text-sm text-gray-500 mb-1">Nội dung đăng ký</div>
                <div className="font-bold text-gray-900 mb-3">{activeQR.desc}</div>
                <div className="text-sm text-gray-500 mb-1">Số tiền thanh toán</div>
                <div className="text-3xl font-black text-blue-600">{activeQR.amount.toLocaleString()} VNĐ</div>
              </div>

              {/* MÔ PHỎNG VIETQR THEO CHUẨN NAPAS */}
              <div className="border-4 border-blue-600 p-2 rounded-2xl inline-block mb-4 shadow-lg bg-white">
                <img 
                  src={`https://img.vietqr.io/image/970436-0987654321-compact2.png?amount=${activeQR.amount}&addInfo=DK ${activeQR.lot.communityCode}`} 
                  alt="VietQR"
                  className="w-48 h-48 object-contain"
                />
              </div>
              <p className="text-sm text-gray-500">Mở App Ngân hàng bất kỳ để quét mã.<br/>Hệ thống sẽ tự động kích hoạt thẻ sau khi nhận tiền.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};