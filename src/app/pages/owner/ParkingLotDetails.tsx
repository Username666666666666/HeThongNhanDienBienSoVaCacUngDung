import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Star, Clock, DollarSign, Phone, Navigation,
  Car, Bike, Shield, Camera, Wifi, AlertCircle, X, Info, CreditCard,
  CheckCircle, Map
} from 'lucide-react';
import { supabase } from '../../utils/supabase.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { toast } from 'sonner';

// ================= TYPES =================
interface ParkingPricing {
  mabanggia: string;
  ten_goi_gia: string;
  kieuxe: 'car' | 'motorcycle';
  phut_an_han: number;
  phut_block_dau: number;
  gia_block_dau: number;
  phut_block_tiep: number;
  gia_block_tiep: number;
  phu_phi_dem: number;
  gio_bat_dau_dem: string;
  gio_ket_thuc_dem: string;
  phi_toi_da_ngay: number;
  thoi_gian_toi_da_ngay: number;
}

interface ParkingZone {
  makhuvuc: string;
  tenkhuvuc: string;
  mota: string;
  hinhkhuvuc: string;
  is_vip: boolean;
  succhua_toida: number;
  han_muc_dat_truoc: number;
  mabanggia: string | null;
  cho_dang_su_dung: number; 
  cho_vip_dang_dat: number;
  availableSpots: number; 
  slotDatTruocKhaDung: number;
}

interface SubscriptionCard {
  mathe: string;
  loaithe: string;
  loaixe: string;
  gia_tien: number;
}

interface ParkingLotInfo {
  id: string;
  name: string;
  communityCode: string;
  address: string;
  phone: string;
  rating: number;
  reviews: number;
  image: string;
  openingHours: string;
  description: string;
}

const customerReviews = [
  { id: 1, name: 'Nguyễn Văn A', rating: 5, comment: 'Bãi xe rộng rãi, camera AI nhận diện biển số rất nhanh!', date: '25/03/2026' },
  { id: 2, name: 'Trần Thị B', rating: 4, comment: 'Khu VIP đặt chỗ trước rất tiện, không sợ hết chỗ giờ cao điểm.', date: '22/03/2026' },
];

const resolveFacilityIcon = (name: string) => {
  const text = name.toLowerCase();
  if (text.includes('camera')) return Camera;
  if (text.includes('wifi') || text.includes('internet')) return Wifi;
  if (text.includes('bảo vệ') || text.includes('an ninh')) return Shield;
  return CheckCircle;
};

// ================= COMPONENT CHÍNH =================
export const ParkingLotDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [parkingLot, setParkingLot] = useState<ParkingLotInfo | null>(null);
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [pricingList, setPricingList] = useState<ParkingPricing[]>([]);
  const [cards, setCards] = useState<SubscriptionCard[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);

  const [activeZoneId, setActiveZoneId] = useState<string>('');

  // Modals & Payment State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingBlocks, setBookingBlocks] = useState(2);
  const [showQRModal, setShowQRModal] = useState<{ amount: number; desc: string; type: string; mathe?: string } | null>(null);
  


  // State mới cho luồng PayOS
  const [currentOrderCode, setCurrentOrderCode] = useState<number | null>(null);
  const [payosQrData, setPayosQrData] = useState<any>(null);
  const [isProcessingQR, setIsProcessingQR] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false); // Trạng thái hiện hiệu ứng xanh

  // ================= LẮNG NGHE REALTIME =================
  useEffect(() => {
    if (!currentOrderCode) return;

    const channel = supabase.channel(`payment_status_${currentOrderCode}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'giaodich_cho', filter: `order_code=eq.${currentOrderCode}` },
        (payload) => {
          if (payload.new.trangthai === 'SUCCESS') {
            setPaymentSuccess(true); // Bật hiệu ứng thành công
            toast.success('Thanh toán thành công! Dịch vụ đã được kích hoạt.');
            
            // Đợi 2.5 giây cho khách xem chữ Thành Công rồi mới tắt
            setTimeout(() => {
              setShowBookingModal(false);
              setShowQRModal(null);
              setCurrentOrderCode(null);
              setPayosQrData(null);
              setPaymentSuccess(false);
            }, 2500);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentOrderCode]);

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const lotId = String(id ?? '').trim();
        if (!lotId) throw new Error('Thiếu mã bãi đỗ.');

        const { data: lotData, error: lotErr } = await supabase.from('baido').select('*').eq('mabaido', lotId).maybeSingle();
        if (lotErr || !lotData) throw new Error('Không tìm thấy bãi đỗ.');

        const { data: zoneData } = await supabase.from('khuvucdo1').select('*').eq('mabaido', lotId);
        const { data: priceData } = await supabase.from('banggia1').select('*').eq('mabaido', lotId);
        const { data: cardData } = await supabase.from('the_thang_quy').select('*').eq('mabaido', lotId);
        const { data: facilityData } = await supabase.from('tienich').select('*').eq('mabaido', lotId);

        setParkingLot({
          id: lotData.mabaido,
          name: lotData.tenbaido,
          communityCode: lotData.mathamgia,
          address: lotData.diachi,
          phone: lotData.sodienthoai,
          rating: 4.8,
          reviews: 124,
          image: lotData.hinhanh || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1200',
          openingHours: lotData.giohoatdong || '24/7',
          description: lotData.mota || 'Bãi đỗ xe thông minh ứng dụng AI LPR nhận diện biển số.',
        });

        const mappedZones: ParkingZone[] = (zoneData || []).map(z => {
          const sucChua = Number(z.succhua_toida || 0);
          const dangSuDung = Number(z.cho_dang_su_dung || 0);
          const dangDat = Number(z.cho_vip_dang_dat || 0);
          const hanMuc = Number(z.han_muc_dat_truoc || 0);

          return {
            ...z,
            succhua_toida: sucChua,
            cho_dang_su_dung: dangSuDung,
            cho_vip_dang_dat: dangDat,
            availableSpots: Math.max(0, sucChua - dangSuDung), 
            slotDatTruocKhaDung: Math.max(0, hanMuc - dangDat) 
          };
        });
        
        setZones(mappedZones);
        if (mappedZones.length > 0) setActiveZoneId(mappedZones[0]!.makhuvuc);

        setPricingList(priceData || []);
        setCards(cardData || []);
        setFacilities(facilityData || []);

      } catch (err: any) {
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleJoinCommunity = async () => {
    if (!user) {
      toast.error('Bạn chưa đăng nhập!');
      return;
    }
    toast.success('Đã tham gia cộng đồng!');
    navigate(`/community/feed?code=${parkingLot?.communityCode}`);
  };

  const activeZone = zones.find(z => z.makhuvuc === activeZoneId) || zones[0];
  const activePricing = pricingList.find(p => p.mabanggia === activeZone?.mabanggia) || pricingList[0];
  const totalCapacity = zones.reduce((sum, z) => sum + z.succhua_toida, 0);
  const totalAvailable = zones.reduce((sum, z) => sum + z.availableSpots, 0);

  const calculateBooking = () => {
    if (!activePricing) return { mins: 0, price: 0, fee: 0, total: 0 };
    const reservationFee = 15000; 
    const parkingTime = activePricing.phut_block_dau + (bookingBlocks * activePricing.phut_block_tiep);
    const parkingPrice = activePricing.gia_block_dau + (bookingBlocks * activePricing.gia_block_tiep);
    return {
      mins: parkingTime,
      price: parkingPrice,
      fee: reservationFee,
      total: parkingPrice + reservationFee
    };
  };
  const bookingInfo = calculateBooking();

 
// ================= TẠO GIAO DỊCH CHUẨN =================
// ================= TẠO GIAO DỊCH =================
  const handleInitiatePayment = async (type: 'BOOKING' | 'CARD', amount: number, mathe?: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thực hiện thanh toán.');
      return;
    }

    setIsProcessingQR(true);

    // 1. RÀNG BUỘC: CHẶN MUA NHIỀU THẺ NẾU ĐANG CÓ THẺ HOẠT ĐỘNG TẠI BÃI NÀY
    if (type === 'CARD') {
      const { data: activeCards } = await supabase
        .from('bangthedaihan')
        .select('id')
        .eq('manguoidung', user.id)
        .eq('mabaido', parkingLot?.id)
        .eq('trangthai', 'ACTIVE')
        .gte('ngay_het_han', new Date().toISOString());

      if (activeCards && activeCards.length > 0) {
        toast.error('Quý khách cần hủy thẻ đang hoạt động hiện tại trước khi đăng ký thẻ mới!');
        setIsProcessingQR(false);
        return;
      }
    }

    // 1.5. CHẶN ĐẶT CHỖ NẾU ĐANG CÓ ĐẶT CHỖ HOẠT ĐỘNG
    if (type === 'BOOKING') {
      const { data: activeBookings } = await supabase
        .from('bangdatchotruoc1')
        .select('id')
        .eq('manguoidung', user.id)
        .eq('mabaido', parkingLot?.id)
        .eq('trangthai', 'DA_THANH_TOAN')
        .gte('ngay_het_han', new Date().toISOString());

      if (activeBookings && activeBookings.length > 0) {
        toast.error('Bạn đang có một dịch vụ đặt chỗ trước chưa sử dụng tại bãi này. Vui lòng hoàn thành hoặc chờ hết hạn!');
        setIsProcessingQR(false);
        return;
      }
    }

    // 2. CHỐNG SPAM DB: TÌM VÀ XÓA GIAO DỊCH PENDING CŨ (BẮT BUỘC ĐỂ PAYOS KHÔNG LỖI TRÙNG MÃ)
    const colCheck = type === 'CARD' ? 'mathe' : 'makhuvuc';
    const valCheck = type === 'CARD' ? mathe : activeZone?.makhuvuc;

    const { data: pendingTx } = await supabase
      .from('giaodich_cho')
      .select('order_code')
      .eq('manguoidung', user.id)
      .eq('mabaido', parkingLot?.id)
      .eq('loai_giaodich', type)
      .eq('trangthai', 'PENDING')
      .eq(colCheck, valCheck)
      .maybeSingle();

    if (pendingTx) {
      await supabase.from('giaodich_cho').delete().eq('order_code', pendingTx.order_code);
    }

    // 3. LUÔN TẠO MÃ ĐƠN MỚI 100% CHO PAYOS
    const newOrderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 10));
    setCurrentOrderCode(newOrderCode);

    if (type === 'BOOKING') {
      setShowBookingModal(true);
    } else {
      setShowQRModal({ amount, desc: `Thẻ Dài Hạn`, type: 'Thẻ Dài Hạn', mathe });
    }

    // 4. GỌI LÊN PAYOS KÈM THÊM `mins` ĐỂ DB TÍNH GIỜ
    const { data: payosRes, error: payosErr } = await supabase.functions.invoke('create-payos-link', {
      body: { 
        orderCode: newOrderCode, 
        amount: amount, 
        description: `Thanh toan ${newOrderCode}`, 
        userId: user.id, 
        lotId: parkingLot?.id, 
        type: type, 
        zoneId: activeZone?.makhuvuc || null, 
        mathe: mathe || null,
        mins: type === 'BOOKING' ? bookingInfo.mins : 0 // TRUYỀN PHÚT QUA ĐÂY
      }
    });

    // 5. NẾU BỊ CORS HOẶC PAYOS BÁO LỖI -> HỦY GIAO DỊCH TRONG DB, BÁO LỖI VÀ ĐÓNG MODAL
    if (payosErr || !payosRes || payosRes.code !== "00") {
      toast.error('Không thể kết nối tới máy chủ thanh toán. Vui lòng thử lại sau!');
      // Rollback: Xóa mẹ cái dòng PENDING vừa tạo ở trên hàm create-payos-link
      await supabase.from('giaodich_cho').delete().eq('order_code', newOrderCode);
      
      setShowBookingModal(false);
      setShowQRModal(null);
      setIsProcessingQR(false);
      return;
    }

    // 6. NẾU THÀNH CÔNG -> LẤY DATA CHUẨN CỦA PAYOS ĐỂ VẼ QR
    setPayosQrData({
      bin: payosRes.data.bin, 
      accountNo: payosRes.data.accountNumber, 
      amount: payosRes.data.amount, 
      description: payosRes.data.description 
    });
    
    setIsProcessingQR(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
  }
  if (loadError || !parkingLot) {
    return <div className="min-h-screen flex items-center justify-center">{loadError}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition"><ArrowLeft /></button>
          <div>
            <h1 className="text-xl font-bold line-clamp-1">{parkingLot.name}</h1>
            <p className="text-blue-200 text-xs">Mã: {parkingLot.communityCode}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative rounded-3xl overflow-hidden shadow-lg h-64 md:h-96 mb-6 group">
          <img src={parkingLot.image} alt={parkingLot.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div>
              <div className="flex gap-2 mb-2">
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">{totalAvailable} chỗ trống</span>
                <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center"><Star className="w-3 h-3 mr-1"/> {parkingLot.rating}</span>
              </div>
              <h2 className="text-3xl font-black text-white">{parkingLot.name}</h2>
              <p className="text-gray-200 flex items-center mt-1 text-sm"><MapPin className="w-4 h-4 mr-1"/>{parkingLot.address}</p>
            </div>
            <button className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-white/40 hover:bg-white hover:text-blue-900 font-bold transition flex items-center gap-2">
              <Navigation className="w-4 h-4"/> Chỉ đường
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <p className="text-gray-600 leading-relaxed mb-6">{parkingLot.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">Giờ mở cửa</div>
                  <div className="font-bold text-blue-900 flex items-center gap-1"><Clock className="w-4 h-4"/> {parkingLot.openingHours}</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">Sức chứa</div>
                  <div className="font-bold text-blue-900 flex items-center gap-1"><Car className="w-4 h-4"/> {totalCapacity} xe</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 md:col-span-2">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">Hotline CSKH</div>
                  <div className="font-bold text-blue-900 flex items-center gap-1"><Phone className="w-4 h-4"/> {parkingLot.phone}</div>
                </div>
              </div>
              {facilities.length > 0 && (
                <>
                  <h3 className="font-bold text-lg mb-3">Tiện ích bãi đỗ</h3>
                  <div className="flex flex-wrap gap-3">
                    {facilities.map(f => {
                      const Icon = resolveFacilityIcon(f.ten_tien_ich);
                      return (
                        <div key={f.matienich} className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-gray-700">
                          <Icon className="w-4 h-4 text-green-600"/> {f.ten_tien_ich}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2"><Map className="w-6 h-6 text-blue-600"/> Sơ đồ Khu vực đỗ</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
                {zones.map(z => (
                  <button 
                    key={z.makhuvuc} 
                    onClick={() => setActiveZoneId(z.makhuvuc)}
                    className={`whitespace-nowrap px-5 py-3 rounded-xl font-bold border-2 transition-all ${activeZoneId === z.makhuvuc ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-100 bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    {z.is_vip && <Star className="w-4 h-4 inline-block mr-1 text-yellow-500 fill-yellow-500"/>}
                    {z.tenkhuvuc}
                  </button>
                ))}
              </div>

              {activeZone && (
                <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <div className="rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 relative aspect-video">
                    {activeZone.hinhkhuvuc ? (
                      <img src={activeZone.hinhkhuvuc} className="w-full h-full object-cover" alt="Map"/>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <Map className="w-10 h-10 mb-2 opacity-50"/>
                        <span className="text-sm font-medium">Chưa có sơ đồ</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                      <span className="text-gray-500">Chỗ trống:</span> <span className="text-green-600">{activeZone.availableSpots}/{activeZone.succhua_toida}</span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <h4 className="font-bold text-gray-800 mb-2">Chính sách giá khu vực này</h4>
                    {activePricing ? (
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border border-blue-100 p-4 flex-1">
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                          {activePricing.kieuxe === 'car' ? <Car className="w-5 h-5 text-blue-600"/> : <Bike className="w-5 h-5 text-blue-600"/>}
                          <span className="font-black text-blue-900">{activePricing.ten_goi_gia}</span>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex justify-between">
                            <span className="text-gray-500">Miễn phí (Ân hạn):</span>
                            <span className="font-bold">{activePricing.phut_an_han} phút</span>
                          </li>
                          <li className="flex justify-between bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                            <span className="text-gray-500">Block đầu ({activePricing.phut_block_dau}p):</span>
                            <span className="font-bold text-blue-600">{activePricing.gia_block_dau.toLocaleString()}đ</span>
                          </li>
                          <li className="flex justify-between px-2">
                            <span className="text-gray-500">Các block sau ({activePricing.phut_block_tiep}p):</span>
                            <span className="font-bold">+{activePricing.gia_block_tiep.toLocaleString()}đ</span>
                          </li>
                          <li className="flex justify-between px-2 text-purple-700">
                            <span>Qua đêm ({activePricing.gio_bat_dau_dem}-{activePricing.gio_ket_thuc_dem}):</span>
                            <span className="font-bold">+{activePricing.phu_phi_dem.toLocaleString()}đ</span>
                          </li>
                          <li className="flex justify-between px-2 text-red-600 mt-2 pt-2 border-t border-gray-200">
                            <span>Phí kịch trần (tối đa/ngày):</span>
                            <span className="font-black">{activePricing.phi_toi_da_ngay.toLocaleString()}đ</span>
                          </li>
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-xl text-center text-sm text-gray-500 italic flex-1 border border-dashed">Khu vực này chưa cấu hình bảng giá.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-gray-900">Cộng đồng đánh giá</h3>
                <button className="text-blue-600 font-bold text-sm hover:underline">Xem tất cả</button>
              </div>
              <div className="space-y-4">
                {customerReviews.map(r => (
                  <div key={r.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-gray-900">{r.name}</div>
                        <div className="text-xs text-gray-400">{r.date}</div>
                      </div>
                      <div className="flex bg-white px-2 py-1 rounded-md shadow-sm">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 space-y-6">
              
              {/* WIDGET ĐẶT CHỖ TRƯỚC */}
              <div className="bg-gradient-to-b from-blue-900 to-indigo-900 rounded-3xl p-1 shadow-2xl">
                <div className="bg-white rounded-[22px] p-5 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-yellow-100 p-2 rounded-lg"><Star className="w-5 h-5 text-yellow-600 fill-yellow-600"/></div>
                    <h3 className="text-lg font-black text-gray-900">Đặt chỗ trước</h3>
                  </div>

                  {activeZone?.is_vip ? (
                    <>
                     {/* GIAO DIỆN CHỌN KHU VỰC & HƯỚNG DẪN */}
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-sm flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span>Khu vực: <strong className="text-blue-800">{activeZone.tenkhuvuc}</strong></span>
                          <span className="font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                            {/* Phép tính: Hạn mức - Số chỗ VIP đang đặt */}
                            Còn {activeZone.slotDatTruocKhaDung} slot
                          </span>
                        </div>
                        {/* Nút Hướng Dẫn (dùng details/summary html5 để thu gọn, đéo cần state) */}
                        <details className="text-[11px] text-gray-600 bg-white p-2 rounded border border-blue-100 group">
                          <summary className="font-semibold cursor-pointer text-blue-600 flex items-center gap-1 list-none">
                            <Info className="w-3 h-3"/> Quy định & Quyền lợi (Bấm xem)
                          </summary>
                          <div className="mt-2 space-y-1.5 leading-relaxed">
                            <p>- Quý khách được giữ chỗ trong vòng <strong>24h</strong>.</p>
                            <p>- Vui lòng có mặt tại bãi trong 24h này. Sau khi vào bãi, hệ thống tính thời gian đỗ theo block đã mua.</p>
                            <p>- Đỗ vượt quá block đã mua sẽ phát sinh phụ phí khi ra cổng.</p>
                            <p className="text-red-600 font-medium">- Lần đầu sử dụng: Vui lòng vào đúng khu vực đặt trước và quét QR tại bãi để hệ thống đồng bộ dữ liệu.</p>
                          </div>
                        </details>
                      </div>

                      {activeZone.slotDatTruocKhaDung > 0 ? (
                        <>
                          <div className="mb-4">
                            <label className="text-sm font-bold text-gray-700 block mb-2">Thời gian dự kiến đỗ:</label>
                            <div className="flex bg-gray-100 rounded-xl p-1">
                              {[0, 1, 2, 4].map(b => (
                                <button 
                                  key={b} onClick={() => setBookingBlocks(b)}
                                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${bookingBlocks === b ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                  +{b} block
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                              <span>Tổng thời gian giữ:</span>
                              <span className="font-bold text-gray-900">{bookingInfo.mins} phút</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                              <span>Tiền đỗ xe:</span>
                              <span className="font-bold text-gray-900">{bookingInfo.price.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-2">
                              <span>Phí nền tảng (giữ chỗ):</span>
                              <span className="font-bold text-gray-900">{bookingInfo.fee.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between pt-1">
                              <span className="font-black text-gray-900">TỔNG CỘNG:</span>
                              <span className="font-black text-blue-600 text-lg">{bookingInfo.total.toLocaleString()}đ</span>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleInitiatePayment('BOOKING', bookingInfo.total)}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all"
                          >
                            THANH TOÁN ĐẶT CHỖ
                          </button>
                        </>
                      ) : (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-bold border border-red-200">
                          Rất tiếc, khu vực này đã hết hạn mức đặt chỗ trước!
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="w-8 h-8 text-gray-400"/>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Khu vực này là khu thường, KHÔNG hỗ trợ đặt chỗ trước.</p>
                      <p className="text-xs text-gray-400 mt-1">Vui lòng đến trực tiếp bãi đỗ (hiện còn <strong className="text-green-600">{activeZone?.availableSpots}</strong> chỗ trống).</p>
                    </div>
                  )}
                </div>
              </div>

              {/* WIDGET THẺ DÀI HẠN */}
              {cards.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-purple-600"/>
                    <h3 className="text-lg font-black text-gray-900">Đăng ký Thẻ Dài Hạn</h3>
                  </div>
                  {/* Hướng dẫn thẻ dài hạn */}
                    <details className="text-[11px] text-gray-600 bg-purple-50 p-2 rounded-xl border border-purple-100 group">
                      <summary className="font-semibold cursor-pointer text-purple-700 flex items-center gap-1 list-none">
                        <Info className="w-3 h-3"/> Quyền lợi Thẻ (Bấm xem)
                      </summary>
                      <div className="mt-2 space-y-1.5 leading-relaxed">
                        <p>- Sử dụng <strong>TẤT CẢ</strong> khu vực (thường & VIP) không giới hạn thời gian.</p>
                        <p>- <strong>Lưu ý:</strong> Hệ thống đảm bảo 100% chỗ cho khách mua thẻ. Nhưng nếu TOÀN BỘ bãi đã đầy vật lý, sẽ không thể cung cấp chỗ.</p>
                        <p className="text-red-600 font-medium">- Lần đầu đến bãi: Vui lòng quét QR tại cổng để hệ thống đồng bộ thẻ.</p>
                      </div>
                    </details>
                  <div className="space-y-3">
                    {cards.map(c => (
                      <button 
                        key={c.mathe}
                        onClick={() => handleInitiatePayment('CARD', c.gia_tien, c.mathe)}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition group text-left"
                      >
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-purple-700 transition">Thẻ {c.loaithe === 'thang'?'Tháng':'Quý'} {c.loaixe === 'car'?'🚗':'🏍'}</div>
                          <div className="text-xs text-gray-500">Kích hoạt ngay bằng VietQR</div>
                        </div>
                        <div className="font-black text-purple-600">{c.gia_tien.toLocaleString()}đ</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={handleJoinCommunity} className="w-full bg-white border-2 border-dashed border-gray-300 text-gray-600 font-bold py-4 rounded-2xl hover:border-blue-500 hover:text-blue-600 transition flex items-center justify-center gap-2">
                <Shield className="w-5 h-5"/> Tham gia nhóm cư dân bãi đỗ
              </button>

            </div>
          </div>
        </div>
      </div>

  {/* MODAL QUÉT QR */}
      {(showBookingModal || showQRModal) && currentOrderCode && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white relative">
              <button 
                onClick={() => {
                  setShowBookingModal(false); setShowQRModal(null); setCurrentOrderCode(null); setPayosQrData(null); setPaymentSuccess(false);
                }} 
                className="absolute top-4 right-4 bg-white/20 p-1.5 rounded-full hover:bg-white/40"
              >
                <X className="w-5 h-5"/>
              </button>
              <h2 className="text-xl font-black mb-1">Thanh toán tự động</h2>
              <p className="text-sm text-blue-200">{showQRModal ? showQRModal.type : 'Đặt chỗ trước (Booking)'}</p>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 text-center">
                <div className="text-sm text-gray-500 mb-1">Số tiền cần thanh toán</div>
                <div className="text-3xl font-black text-blue-600 mb-3">
                  {(showQRModal ? showQRModal.amount : bookingInfo.total).toLocaleString()} VNĐ
                </div>
                <div className="text-sm font-bold text-gray-700 bg-white p-2 rounded-lg inline-block border shadow-sm">
                  {showQRModal ? showQRModal.desc : `Giữ chỗ ${bookingInfo.mins}p - Khu ${activeZone?.tenkhuvuc}`}
                </div>
              </div>

              <div className="flex flex-col items-center">
                {paymentSuccess ? (
                  <div className="py-8 flex flex-col items-center justify-center animate-in zoom-in duration-300">
                    <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
                    <h3 className="text-xl font-black text-green-600">THANH TOÁN THÀNH CÔNG!</h3>
                    <p className="text-sm text-gray-500 mt-2">Đang tự động chuyển hướng...</p>
                  </div>
                ) : isProcessingQR || !payosQrData ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-gray-500 font-medium">Đang khởi tạo mã QR từ PayOS...</p>
                  </div>
                ) : (
                  <>
                    <div className="p-2 border-4 border-blue-100 rounded-2xl bg-white shadow-lg relative">
                      <img 
                        src={`https://img.vietqr.io/image/${payosQrData.bin}-${payosQrData.accountNo}-compact2.png?amount=${payosQrData.amount}&addInfo=${encodeURIComponent(payosQrData.description)}`}
                        alt="PayOS QR" 
                        className="w-48 h-48 object-contain rounded-xl"
                      />
                      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-[scan_2s_ease-in-out_infinite]" />
                    </div>
                    
                    <div className="mt-6 flex items-start gap-3 bg-blue-50 text-blue-800 p-3 rounded-xl text-sm leading-relaxed">
                      <Info className="w-5 h-5 shrink-0 mt-0.5"/>
                      <p>Mở App Ngân hàng quét mã. <strong>Hệ thống đang chờ nhận thanh toán...</strong></p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
};