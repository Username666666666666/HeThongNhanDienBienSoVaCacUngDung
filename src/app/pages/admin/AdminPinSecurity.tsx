import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Mail, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../utils/supabase.ts";
import {
  createAdminPin,
  changeAdminPinWithOldPin,
  sendPinResetOtp,
  verifyPinOtp,
  updateAdminPin,
  markPinResetRequestUsed,
  PinResetRequest,
  getAdminPinHash,
} from "../../service/pinService.ts";

export const AdminPinSecurity = () => {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [hasAdminPin, setHasAdminPin] = useState(false);

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingChange, setLoadingChange] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const [createPin, setCreatePin] = useState("");
  const [createConfirmPin, setCreateConfirmPin] = useState("");

  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");

  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [otp, setOtp] = useState("");
  const [resetNewPin, setResetNewPin] = useState("");
  const [resetConfirmPin, setResetConfirmPin] = useState("");
  const [resetRequest, setResetRequest] = useState<PinResetRequest | null>(null);

  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);

  useEffect(() => {
    const loadAdmin = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        toast.error("Bạn chưa đăng nhập");
        navigate("/login");
        return;
      }

      const authId = data.user.id;
      const email = (data.user.email ?? "").toLowerCase();

      const { data: adminRow, error: adminError } = await supabase
        .from("nguoidung")
        .select("manguoidung, chucnang")
        .eq("manguoidung", authId)
        .maybeSingle();

      if (adminError || !adminRow || adminRow.chucnang !== "admin") {
        toast.error("Không phải admin");
        navigate("/login");
        return;
      }

      const pinRow = await getAdminPinHash(authId);

      setUserId(authId);
      setAdminEmail(email);
      setHasAdminPin(Boolean(pinRow?.mapinadmin));
    };

    loadAdmin();
  }, [navigate]);

  const handleCreatePin = async () => {
    if (createPin.length !== 8) {
      toast.error("PIN phải 8 số");
      return;
    }

    if (createPin !== createConfirmPin) {
      toast.error("PIN xác nhận không khớp");
      return;
    }

    setLoadingCreate(true);
    try {
      await createAdminPin(userId, createPin);
      toast.success("Đã tạo PIN admin");

      setHasAdminPin(true);
      setCreatePin("");
      setCreateConfirmPin("");
    } catch (err: any) {
      toast.error(err?.message || "Không tạo được PIN");
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleChangePin = async () => {
    if (!hasAdminPin) {
      toast.error("Chưa có PIN, hãy tạo lần đầu trước");
      return;
    }

    if (oldPin.length !== 8) {
      toast.error("PIN cũ phải đủ 8 chữ số");
      return;
    }

    if (newPin.length !== 8) {
      toast.error("PIN mới phải đủ 8 chữ số");
      return;
    }

    if (newPin !== confirmNewPin) {
      toast.error("PIN mới xác nhận không khớp");
      return;
    }

    setLoadingChange(true);
    try {
      await changeAdminPinWithOldPin(userId, oldPin, newPin);
      toast.success("Đổi PIN admin thành công");

      setOldPin("");
      setNewPin("");
      setConfirmNewPin("");
    } catch (err: any) {
      toast.error(err?.message || "Không đổi được PIN");
    } finally {
      setLoadingChange(false);
    }
  };

  const handleSendOtp = async () => {
    if (!adminEmail) {
      toast.error("Không lấy được email admin");
      return;
    }

    setLoadingReset(true);
    try {
      await sendPinResetOtp(adminEmail);
      toast.success("Đã gửi OTP về email admin");
      setStep("otp");
    } catch (err: any) {
      toast.error(err?.message || "Không gửi được OTP");
    } finally {
      setLoadingReset(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 8) {
      toast.error("OTP phải đủ 8 chữ số");
      return;
    }

    setLoadingReset(true);
    try {
      const request = await verifyPinOtp(adminEmail, otp);

      if (!request?.manguoidung) {
        toast.error("OTP sai hoặc đã hết hạn");
        return;
      }

      setResetRequest(request);
      setStep("reset");
      toast.success("Xác thực OTP thành công");
    } catch (err: any) {
      toast.error(err?.message || "Xác thực thất bại");
    } finally {
      setLoadingReset(false);
    }
  };

  const handleResetPin = async () => {
    if (!resetRequest?.manguoidung) {
      toast.error("Thiếu dữ liệu reset");
      return;
    }

    if (resetNewPin.length !== 8) {
      toast.error("PIN mới phải đủ 8 chữ số");
      return;
    }

    if (resetNewPin !== resetConfirmPin) {
      toast.error("PIN xác nhận không khớp");
      return;
    }

    setLoadingReset(true);
    try {
      await updateAdminPin(resetRequest.manguoidung, resetNewPin);
      await markPinResetRequestUsed(resetRequest.id);

      toast.success("Reset PIN admin thành công");

      setStep("email");
      setOtp("");
      setResetNewPin("");
      setResetConfirmPin("");
      setResetRequest(null);
    } catch (err: any) {
      toast.error(err?.message || "Không đặt lại PIN được");
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-4">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => navigate("/admin")}
          className="mb-6 flex items-center gap-2 text-purple-600 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại trang admin
        </button>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white shadow-xl border border-purple-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {hasAdminPin ? "Đổi mã PIN hiện tại" : "Tạo mã PIN lần đầu"}
                </h2>
                <p className="text-sm text-gray-500">
                  {hasAdminPin ? "Dùng khi còn nhớ PIN cũ" : "Chưa có PIN thì tạo lần đầu"}
                </p>
              </div>
            </div>

            {!hasAdminPin ? (
              <div className="space-y-4">
                <input
                  type="password"
                  value={createPin}
                  onChange={(e) =>
                    setCreatePin(e.target.value.replace(/\D/g, "").slice(0, 8))
                  }
                  placeholder="PIN mới 8 số"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-4 outline-none focus:border-purple-500"
                />
                <input
                  type="password"
                  value={createConfirmPin}
                  onChange={(e) =>
                    setCreateConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 8))
                  }
                  placeholder="Nhập lại PIN mới"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-4 outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleCreatePin}
                  disabled={loadingCreate}
                  className="w-full rounded-2xl bg-emerald-600 py-4 font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {loadingCreate ? "Đang tạo..." : "Tạo PIN admin"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showOldPin ? "text" : "password"}
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="Nhập PIN cũ 8 số"
                    className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-4 pr-12 outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPin(!showOldPin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showOldPin ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showNewPin ? "text" : "password"}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="Nhập PIN mới 8 số"
                    className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-4 pr-12 outline-none focus:border-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showNewPin ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <input
                  type="password"
                  value={confirmNewPin}
                  onChange={(e) =>
                    setConfirmNewPin(e.target.value.replace(/\D/g, "").slice(0, 8))
                  }
                  placeholder="Nhập lại PIN mới"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-4 outline-none focus:border-green-500"
                />

                <button
                  onClick={handleChangePin}
                  disabled={loadingChange}
                  className="w-full rounded-2xl bg-emerald-600 py-4 font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {loadingChange ? "Đang đổi..." : "Đổi mã PIN"}
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white shadow-xl border border-blue-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Quên mã PIN</h2>
                <p className="text-sm text-gray-500">Email → OTP → PIN mới</p>
              </div>
            </div>

            {step === "email" && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
                  Email nhận OTP: <strong>{adminEmail || "Không lấy được email"}</strong>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loadingReset || !adminEmail}
                  className="w-full rounded-2xl bg-blue-600 py-4 font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {loadingReset ? "Đang gửi..." : "Gửi mã OTP"}
                </button>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
                  Email nhận OTP: <strong>{adminEmail}</strong>
                </div>

                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="Nhập OTP 8 số"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-4 text-center text-2xl tracking-[0.4em] font-black outline-none focus:border-blue-500"
                />

                <button
                  onClick={handleVerifyOtp}
                  disabled={loadingReset}
                  className="w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {loadingReset ? "Đang kiểm tra..." : "Xác thực OTP"}
                </button>
              </div>
            )}

            {step === "reset" && (
              <div className="space-y-4">
                <input
                  type="password"
                  value={resetNewPin}
                  onChange={(e) =>
                    setResetNewPin(e.target.value.replace(/\D/g, "").slice(0, 8))
                  }
                  placeholder="PIN mới 8 số"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-4 outline-none focus:border-emerald-500"
                />

                <input
                  type="password"
                  value={resetConfirmPin}
                  onChange={(e) =>
                    setResetConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 8))
                  }
                  placeholder="Nhập lại PIN mới"
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-4 outline-none focus:border-emerald-500"
                />

                <button
                  onClick={handleResetPin}
                  disabled={loadingReset}
                  className="w-full rounded-2xl bg-emerald-600 py-4 font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {loadingReset ? "Đang lưu..." : "Đặt lại PIN"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};