import { useState } from "react";
import { toast } from "sonner";
import {
  sendPinResetOtp,
  verifyPinOtp,
  updateUserPin,
  markPinResetRequestUsed,
  PinResetRequest,
} from "../../service/pinService.ts";

export const ResetUserPin = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [request, setRequest] = useState<PinResetRequest | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes("@")) {
      toast.error("Nhập email hợp lệ");
      return;
    }

    setLoading(true);
    try {
      await sendPinResetOtp(normalized);
      toast.success("Đã gửi OTP về email");
      setStep(2);
    } catch (err: any) {
      toast.error(err?.message || "Không gửi được OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.trim().length !== 8) {
      toast.error("OTP phải đủ 8 số");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyPinOtp(email, otp);

      if (!res?.manguoidung) {
        toast.error("OTP sai hoặc đã hết hạn");
        return;
      }

      setRequest(res);
      setStep(3);
      toast.success("Xác thực OTP thành công");
    } catch (err: any) {
      toast.error(err?.message || "Xác thực thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = async () => {
    if (!request?.manguoidung) {
      toast.error("Thiếu dữ liệu reset");
      return;
    }

    if (pin.length !== 8) {
      toast.error("PIN phải 8 số");
      return;
    }

    if (pin !== confirmPin) {
      toast.error("PIN không khớp");
      return;
    }

    setLoading(true);
    try {
      await updateUserPin(request.manguoidung, pin);
      await markPinResetRequestUsed(request.id);

      toast.success("Đổi PIN thành công");

      setStep(1);
      setEmail("");
      setOtp("");
      setPin("");
      setConfirmPin("");
      setRequest(null);
    } catch (err: any) {
      toast.error(err?.message || "Không đổi được PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Đặt lại PIN người dùng</h2>

        {step === 1 && (
          <div className="space-y-4">
            <input
              className="w-full rounded-lg border px-4 py-3 outline-none"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white"
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi OTP"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              OTP đã gửi đến: <strong>{email}</strong>
            </div>
            <input
              className="w-full rounded-lg border px-4 py-3 outline-none"
              placeholder="Nhập OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
            />
            <button
              className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white"
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? "Đang kiểm tra..." : "Xác thực OTP"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <input
              className="w-full rounded-lg border px-4 py-3 outline-none"
              placeholder="PIN mới 8 số"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
            />
            <input
              className="w-full rounded-lg border px-4 py-3 outline-none"
              placeholder="Nhập lại PIN"
              value={confirmPin}
              onChange={(e) =>
                setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 8))
              }
            />
            <button
              className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white"
              onClick={handleResetPin}
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Đổi PIN"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};