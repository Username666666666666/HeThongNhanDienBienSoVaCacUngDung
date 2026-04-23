import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Car } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../utils/supabase.ts";

export const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      // 1. Tạo tài khoản trong Supabase Auth
      // Đưa thông tin vào metadata để Trigger phía DB (nếu có) có thể lấy được TenNguoiDung
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
            user_role: 'owner', // Vai trò mặc định cho người đăng ký mới
          },
        },
      });

      if (authError) throw authError;

      const user = data.user;
      if (!user) throw new Error("Không thể tạo tài khoản xác thực.");

      // 2. Chèn thông tin vào bảng public.nguoidung
      // Sử dụng tên cột đã được RENAME: MaNguoiDung, TenNguoiDung, ChucNang
      const { error: upsertError } = await supabase
        .from("nguoidung") 
        .upsert(
          {
            manguoidung: user.id,   // MaNguoiDung (id cũ)
            tennguoidung: name,     // TenNguoiDung (display_name cũ)
            email: email,
            chucnang: 'owner',      // ChucNang (user_role cũ)
          },
          { onConflict: 'manguoidung' }
        );

      if (upsertError) {
        console.error("Lỗi khi lưu thông tin user:", upsertError);
        // Lưu ý: Auth đã tạo nhưng DB lỗi, có thể do Trigger xung đột hoặc sai tên cột
        throw new Error("Tài khoản đã tạo nhưng không thể khởi tạo hồ sơ người dùng.");
      }

      toast.success("Đăng ký thành công! Vui lòng kiểm tra email xác nhận.");
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Lỗi đăng ký không xác định");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white text-center">
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
            <Car className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold">Đăng ký hệ thống</h1>
          <p className="text-indigo-100 text-sm">Quản lý bãi xe thông minh</p>
        </div>

        {/* FORM */}
        <div className="p-8">
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Họ và tên */}
            <div>
              <label className="text-sm font-medium text-gray-700">Họ và tên</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="example@domain.com"
                required
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng ký ngay"}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-sm text-center mt-6 text-gray-600">
            Đã có tài khoản?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-indigo-600 font-bold cursor-pointer hover:underline"
            >
              Đăng nhập
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};