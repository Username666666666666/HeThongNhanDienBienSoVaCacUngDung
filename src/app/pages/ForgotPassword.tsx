import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase.ts';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const resetTimer = useRef<NodeJS.Timeout | null>(null);
  const [step, setStep] = useState<'email' | 'pin' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // BƯỚC 1: GỬI MÃ PIN 8 SỐ VÀO LUỒNG RESET PASSWORD
  const handleSendEmail = async () => {
  if (!email || !email.includes('@')) {
    toast.error('❌ Vui lòng nhập email hợp lệ!');
    return;
  }
  setLoading(true);

  try {
    // Gọi Edge Function để tạo và lưu OTP vào bảng yeu_cau_dat_lai_pin
    const { data, error } = await supabase.functions.invoke('send-otp', {
  body: {
    email,
    purpose: "reset_password",
    userId: null
  },
});

if (error) throw error;

if (!data?.success) {
  toast.error(`❌ ${data?.message ?? 'Không gửi được OTP'}`);
  return;
}

toast.success(`✅ ${data.message}`);
setStep('pin');
  } catch (error: any) {
    toast.error('❌ Lỗi: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  // BƯỚC 2: XÁC THỰC MÃ PIN 8 SỐ
 const handleVerifyPin = async () => {
  if (pin.length !== 8) {
    toast.error('❌ Mã PIN phải nhập đủ 8 chữ số!');
    return;
  }
  setLoading(true);

  try {
    // Truy vấn bảng nhật ký để kiểm tra mã PIN
    const { data, error } = await supabase
      .from('yeu_cau_dat_lai_pin')
      .select('*')
      .eq('email', email)
      .eq('ma_otp_da_bam', pin)
      .eq('da_su_dung', false)
      .gt('het_han_luc', new Date().toISOString())
      .maybeSingle();

    if (error || !data) {
      toast.error('❌ Mã PIN không chính xác hoặc đã hết hạn!');
    } else {
      // Đánh dấu đã sử dụng mã này
      await supabase
        .from('yeu_cau_dat_lai_pin')
        .update({ da_su_dung: true })
        .eq('id', data.id);

      toast.success('✅ Xác thực thành công!');
      setStep('reset');
    }
  } catch (err) {
    toast.error('❌ Có lỗi xảy ra khi xác thực!');
  } finally {
    setLoading(false);
  }
};
  // BƯỚC 3: CẬP NHẬT MẬT KHẨU MỚI (SAU KHI ĐÃ XÁC THỰC PIN)
  const handleResetPassword = async () => {
  if (newPassword.length < 6) {
    toast.error('❌ Mật khẩu mới quá ngắn!');
    return;
  }
  if (newPassword !== confirmPassword) {
    toast.error('❌ Mật khẩu không khớp!');
    return;
  }

  setLoading(true);
  // Lưu ý: Để update mật khẩu mà không có session, bạn cần một API trung gian 
  // hoặc dùng phương thức Admin của Supabase nếu app có quyền.
  // Ở đây giả định bạn dùng Edge Function khác để cập nhật mật khẩu an toàn:
  const { data, error } = await supabase.functions.invoke('update-user-password', {
    body: { email, newPassword },
  });

  if (error) throw error;

  if (!data?.success) {
    toast.error(`❌ ${data?.message ?? 'Đổi mật khẩu thất bại'}`);
    return;
  }

  toast.success(`✅ ${data.message}`);
  resetTimer.current = setTimeout(() => navigate('/login'), 1500);
  setLoading(false);
};

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button onClick={() => navigate('/login')} className="mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold transition">
          <ArrowLeft className="w-5 h-5" /> Quay lại đăng nhập
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-purple-100">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-br from-purple-600 to-pink-500 p-4 rounded-full mb-4 shadow-lg">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Quên mật khẩu</h1>
            <p className="text-gray-500 text-sm font-medium">
              {step === 'email' && 'Nhập email để nhận mã xác thực'}
              {step === 'pin' && 'Nhập chính xác mã PIN 8 chữ số'}
              {step === 'reset' && 'Thiết lập lại mật khẩu bảo mật'}
            </p>
          </div>

          {step === 'email' && (
            <div className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 outline-none transition-all font-medium"
                />
              </div>
              <button onClick={handleSendEmail} disabled={loading} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-purple-700 transition-all active:scale-[0.98] disabled:opacity-50">
                {loading ? 'ĐANG GỬI...' : 'GỬI MÃ PIN 8 SỐ'}
              </button>
            </div>
          )}

          {step === 'pin' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 flex items-center gap-3 text-sm text-blue-700 font-semibold">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>Mã đã gửi đến: <strong>{email}</strong></span>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="********"
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-500 text-center text-3xl tracking-[0.5em] font-black outline-none"
                />
                <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">{pin.length} / 8 CHỮ SỐ</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('email')} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold transition">LÀM LẠI</button>
                <button onClick={handleVerifyPin} disabled={loading} className="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-black shadow-lg transition">XÁC THỰC</button>
              </div>
            </div>
          )}

          {step === 'reset' && (
            <div className="space-y-5">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới"
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 outline-none transition-all font-medium"
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận lại mật khẩu"
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-green-500 outline-none transition-all font-medium"
              />
              <button onClick={handleResetPassword} disabled={loading} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-green-700 transition-all active:scale-[0.98]">
                {loading ? 'ĐANG LƯU...' : 'ĐỔI MẬT KHẨU NGAY'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};