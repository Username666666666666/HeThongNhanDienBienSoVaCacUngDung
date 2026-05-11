import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { toast } from 'sonner';
import {
  ArrowLeft, Receipt, CreditCard, CalendarClock,
  Clock, CheckCircle2, XCircle, RefreshCcw, MapPin, Car
} from 'lucide-react';

// --- TYPES ---
interface Transaction {
  order_code: number;
  loai_giaodich: string;
  sotien: number;
  trangthai: string;
  created_at: string;
}

interface Booking {
  id: string;
  thanhtien: number;
  trangthai: string;
  created_at: string;
  ngay_het_han: string;
  baido: any; // Dùng any để bypass lỗi TS của Supabase JS
  khuvucdo1: any;
}

interface SubscriptionCard {
  id: string;
  trangthai: string;
  created_at: string;
  ngay_het_han: string;
  baido: any;
  the_thang_quy: any;
}

export const InvoiceManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cards, setCards] = useState<SubscriptionCard[]>([]);

  // --- FETCH DATA ---
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Lấy Lịch sử giao dịch PayOS
      const { data: txData } = await supabase
        .from('giaodich_cho')
        .select('order_code, loai_giaodich, sotien, trangthai, created_at')
        .eq('manguoidung', user.id)
        .order('created_at', { ascending: false });

      // 2. Lấy Lịch sử đặt chỗ (Join lấy tên bãi và khu vực)
      const { data: bkData } = await supabase
        .from('bangdatchotruoc1')
        .select('id, thanhtien, trangthai, created_at, ngay_het_han, baido(tenbaido), khuvucdo1(tenkhuvuc)')
        .eq('manguoidung', user.id)
        .order('created_at', { ascending: false });

      // 3. Lấy Lịch sử thẻ dài hạn (Join lấy tên bãi và loại thẻ)
      const { data: cardData } = await supabase
        .from('bangthedaihan')
        .select('id, trangthai, created_at, ngay_het_han, baido(tenbaido), the_thang_quy(loaithe, loaixe)')
        .eq('manguoidung', user.id)
        .order('created_at', { ascending: false });

      // Ép kiểu (as any) để xử lý triệt để lỗi TypeScript mismatch
      setTransactions((txData as any) || []);
      setBookings((bkData as any) || []);
      setCards((cardData as any) || []);
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tải dữ liệu hóa đơn.');
    } finally {
      setLoading(false);
    }
  };

  // --- REALTIME SUBSCRIPTION ---
  useEffect(() => {
    fetchData();

    if (!user) return;
    
    // Lắng nghe thay đổi trên cả 3 bảng
    const channels = supabase.channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'giaodich_cho', filter: `manguoidung=eq.${user.id}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bangdatchotruoc1', filter: `manguoidung=eq.${user.id}` }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bangthedaihan', filter: `manguoidung=eq.${user.id}` }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channels);
    };
  }, [user]);

  // --- RENDER HELPERS ---
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusUI = (status: string) => {
    if (status === 'SUCCESS' || status === 'ACTIVE' || status === 'DA_THANH_TOAN') {
      return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: 'Thành công' };
    }
    if (status === 'PENDING') {
      return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Chờ xử lý' };
    }
    return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Thất bại/Hết hạn' };
  };

  // Hàm helper chống lỗi: Lấy dữ liệu an toàn kể cả khi Supabase trả về Mảng hay Object
  const getJoinedVal = (obj: any, key: string, fallback = '') => {
    if (!obj) return fallback;
    if (Array.isArray(obj)) return obj[0]?.[key] || fallback;
    return obj[key] || fallback;
  };

  const currentBookings = bookings.filter(b => new Date(b.ngay_het_han) > new Date() && b.trangthai === 'DA_THANH_TOAN');
  const pastBookings = bookings.filter(b => new Date(b.ngay_het_han) <= new Date() || b.trangthai !== 'DA_THANH_TOAN');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 text-white shadow-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/owner')} className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2"><Receipt className="w-6 h-6"/> Quản lý Hóa đơn & Dịch vụ</h1>
              <p className="text-slate-300 text-sm">Tra cứu lịch sử thanh toán và trạng thái thẻ, đặt chỗ</p>
            </div>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition">
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Làm mới</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CỘT TRÁI: LỊCH SỬ GIAO DỊCH CHUNG */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="w-6 h-6 text-blue-600"/>
              <h2 className="text-xl font-black text-gray-900">Lịch sử giao dịch</h2>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="max-h-[700px] overflow-y-auto p-2">
                {transactions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">Chưa có giao dịch nào.</div>
                ) : (
                  transactions.map((tx) => {
                    const ui = getStatusUI(tx.trangthai);
                    const Icon = ui.icon;
                    return (
                      <div key={tx.order_code} className="p-4 border-b border-gray-100 hover:bg-gray-50 flex items-center justify-between last:border-0">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-2xl ${ui.bg}`}>
                            <Icon className={`w-6 h-6 ${ui.color}`}/>
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">Mã ĐH: {tx.order_code}</div>
                            <div className="text-sm text-gray-500">{tx.loai_giaodich === 'BOOKING' ? 'Đặt chỗ trước' : 'Đăng ký thẻ dài hạn'}</div>
                            <div className="text-xs text-gray-400 mt-1">{formatTime(tx.created_at)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-blue-600 mb-1">{tx.sotien.toLocaleString()}đ</div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${ui.bg} ${ui.color}`}>{ui.label}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: THẺ HOẠT ĐỘNG & ĐẶT CHỖ */}
          <div className="space-y-8">
            
            {/* THẺ DÀI HẠN */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-6 h-6 text-purple-600"/>
                <h2 className="text-xl font-black text-gray-900">Thẻ dịch vụ của bạn</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {cards.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-500">Bạn chưa đăng ký thẻ dài hạn nào.</div>
                ) : (
                  cards.map((c) => {
                    const loaithe = getJoinedVal(c.the_thang_quy, 'loaithe');
                    const loaixe = getJoinedVal(c.the_thang_quy, 'loaixe');
                    return (
                      <div key={c.id} className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20"><CreditCard className="w-24 h-24"/></div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <div className="text-xs text-purple-200 uppercase font-bold tracking-wider mb-1">Loại thẻ</div>
                              <div className="text-xl font-black">Thẻ {loaithe === 'thang' ? 'Tháng' : 'Quý'} - {loaixe === 'car' ? 'Ô tô' : 'Xe máy'}</div>
                            </div>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/30 backdrop-blur-sm">
                              {new Date(c.ngay_het_han) > new Date() ? 'ĐANG HOẠT ĐỘNG' : 'HẾT HẠN'}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-purple-300"/> {getJoinedVal(c.baido, 'tenbaido', 'Không xác định')}</div>
                            <div className="text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-purple-300"/> HSD: {formatTime(c.ngay_het_han)}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* ĐẶT CHỖ TRƯỚC HIỆN TẠI & LỊCH SỬ */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CalendarClock className="w-6 h-6 text-emerald-600"/>
                <h2 className="text-xl font-black text-gray-900">Quản lý đặt chỗ</h2>
              </div>

              {/* Đang đặt */}
              {currentBookings.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Đang giữ chỗ</h3>
                  <div className="space-y-3">
                    {currentBookings.map(b => (
                      <div key={b.id} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-4">
                        <div className="bg-emerald-100 p-3 rounded-full"><Car className="w-6 h-6 text-emerald-600"/></div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900">{getJoinedVal(b.baido, 'tenbaido')} - Khu {getJoinedVal(b.khuvucdo1, 'tenkhuvuc')}</div>
                          <div className="text-sm text-emerald-700 font-medium">Giữ chỗ đến: {formatTime(b.ngay_het_han)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lịch sử */}
              <div>
                 <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">Lịch sử đặt chỗ</h3>
                 <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-2 max-h-[350px] overflow-y-auto">
                    {pastBookings.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-500">Chưa có lịch sử.</div>
                    ) : (
                      pastBookings.map(b => (
                        <div key={b.id} className="p-3 border-b border-gray-100 last:border-0 flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-gray-800 text-sm">{getJoinedVal(b.baido, 'tenbaido')}</div>
                            <div className="text-xs text-gray-500">Khu {getJoinedVal(b.khuvucdo1, 'tenkhuvuc')} • {formatTime(b.created_at)}</div>
                          </div>
                          <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">Đã kết thúc</div>
                        </div>
                      ))
                    )}
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};