import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chrome, Facebook, Eye, EyeOff, Car } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase.ts';

export const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔐 ĐĂNG NHẬP EMAIL/PASSWORD
const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🔍 Biểu thức chính quy kiểm tra định dạng email tổng quát
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error('Vui lòng nhập đúng định dạng email (ví dụ: user@domain.com)');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // ... (giữ nguyên phần lấy userData và điều hướng)
      const { data: userData, error: dbError } = await supabase
        .from('nguoidung')
        .select('chucnang')
        .eq('manguoidung', data.user.id)
        .single();

      if (dbError) {
        console.error('Lỗi lấy profile:', dbError);
        toast.error('Không tìm thấy thông tin vai trò người dùng');
        setLoading(false);
        return;
      }

      toast.success('Đăng nhập thành công');
      navigate(`/${userData.chucnang}`);

    } catch (err: any) {
      toast.error(err.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  // 🌐 ĐĂNG NHẬP / ĐĂNG KÝ BẰNG GOOGLE
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redirect về trang chủ hoặc trang quản lý sau khi login Google thành công
          redirectTo: window.location.origin + '/auth/callback',
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || 'Lỗi đăng nhập bằng Google');
    }
  };

  const handleFacebookLogin = () => {
    toast.info('Tính năng Facebook hiện chưa khả dụng');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <Car className="w-8 h-8" />
          </div>
          <h1 className="text-3xl mb-2 font-bold">Hệ thống bãi đỗ xe</h1>
          <p className="text-blue-100">Đăng nhập để quản lý ngay</p>
        </div>

        {/* FORM */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-4">

            {/* EMAIL */}
            <div>
              <label className="block text-sm mb-2 font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="email@example.com"
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm mb-2 font-medium text-gray-700">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            {/* QUÊN MẬT KHẨU */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-blue-600 hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>

          {/* SOCIAL LOGIN */}
          <div className="mt-6 flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 text-sm text-gray-400">Hoặc</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50 transition"
            >
              <Chrome className="w-5 h-5 text-red-500" />
              <span className="font-medium">Google</span>
            </button>

            <button
              onClick={handleFacebookLogin}
              className="flex items-center justify-center gap-2 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50 transition"
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Facebook</span>
            </button>
          </div>

          {/* CHUYỂN QUA ĐĂNG KÝ */}
          <p className="text-sm text-center mt-8 text-gray-600">
            Chưa có tài khoản?
            <span
              onClick={() => navigate('/register')}
              className="text-blue-600 font-bold cursor-pointer ml-1 hover:underline"
            >
              Đăng ký ngay
            </span>
          </p>

        </div>
      </div>
    </div>
  );
};