// supabase/functions/send-otp/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend@3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizePurpose(purpose: string) {
  const p = (purpose || "").trim().toLowerCase();

  if (p.includes("pin")) return "reset_pin";
  if (p.includes("password") || p.includes("mật khẩu") || p.includes("mat khau")) return "reset_password";
  if (p.includes("login")) return "login";
  return p.replace(/\s+/g, "_") || "reset_password";
}

function getMessagePack(role: string, purpose: string) {
  const roleLabelMap: Record<string, string> = {
    admin: "Quản trị viên",
    nhanvien: "Nhân viên",
    chuxe: "Chủ xe",
    nhacungcap: "Nhà cung cấp",
  };

  const roleLabel = roleLabelMap[role] ?? "Người dùng";

  const packs: Record<string, Array<{ subject: string; intro: string; successMessage: string }>> = {
    reset_password: [
      {
        subject: `Mã OTP đặt lại mật khẩu - ${roleLabel}`,
        intro: `Bạn vừa yêu cầu đặt lại mật khẩu trên hệ thống.`,
        successMessage: `Mã OTP đặt lại mật khẩu đã được gửi tới ${roleLabel.toLowerCase()}.`,
      },
      {
        subject: `Xác thực đổi mật khẩu - ${roleLabel}`,
        intro: `Hệ thống đã ghi nhận yêu cầu đổi mật khẩu của bạn.`,
        successMessage: `OTP đổi mật khẩu đã gửi thành công.`,
      },
      {
        subject: `OTP bảo mật - ${roleLabel}`,
        intro: `Đây là mã OTP để xác nhận yêu cầu bảo mật.`,
        successMessage: `OTP bảo mật đã được gửi.`,
      },
    ],
    reset_pin: [
      {
        subject: `Mã OTP đặt lại PIN - ${roleLabel}`,
        intro: `Bạn vừa yêu cầu đặt lại PIN trên hệ thống.`,
        successMessage: `Mã OTP đặt lại PIN đã được gửi.`,
      },
      {
        subject: `Xác thực đổi PIN - ${roleLabel}`,
        intro: `Hệ thống đã ghi nhận yêu cầu đổi PIN của bạn.`,
        successMessage: `OTP đổi PIN đã gửi thành công.`,
      },
      {
        subject: `OTP PIN - ${roleLabel}`,
        intro: `Đây là mã OTP để xác nhận yêu cầu đổi PIN.`,
        successMessage: `OTP PIN đã được gửi.`,
      },
    ],
    login: [
      {
        subject: `Mã OTP đăng nhập - ${roleLabel}`,
        intro: `Bạn vừa yêu cầu mã OTP đăng nhập.`,
        successMessage: `Mã OTP đăng nhập đã được gửi.`,
      },
      {
        subject: `Xác thực đăng nhập - ${roleLabel}`,
        intro: `Hệ thống cần xác nhận yêu cầu đăng nhập của bạn.`,
        successMessage: `OTP đăng nhập đã gửi thành công.`,
      },
      {
        subject: `OTP truy cập - ${roleLabel}`,
        intro: `Đây là mã OTP để xác thực truy cập.`,
        successMessage: `OTP truy cập đã được gửi.`,
      },
    ],
  };

  const pool = packs[purpose] ?? packs.reset_password;
  return pool[Math.floor(Math.random() * pool.length)];
}

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const resendApiKey = Deno.env.get("RESEND_API_KEY");

if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
  throw new Error("Thiếu biến môi trường SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / RESEND_API_KEY");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return jsonResponse({ ok: true }, 200);
  }

  if (req.method !== "POST") {
    return jsonResponse(
      { success: false, code: "METHOD_NOT_ALLOWED", message: "Chỉ hỗ trợ POST" },
      405,
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const purpose = normalizePurpose(String(body?.purpose ?? "reset_password"));
    const userId = body?.userId ? String(body.userId) : null;

    if (!email || !email.includes("@")) {
      return jsonResponse({
        success: false,
        code: "INVALID_EMAIL",
        message: "Email không hợp lệ",
      }, 200);
    }

    // Tìm người dùng theo email trong bảng nguoidung
    const { data: profile, error: profileError } = await supabase
      .from("nguoidung")
      .select("manguoidung, email, tennguoidung, chucnang")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      return jsonResponse({
        success: false,
        code: "PROFILE_LOOKUP_FAILED",
        message: `Không thể tra cứu người dùng: ${profileError.message}`,
      }, 200);
    }

    const manguoidung = profile?.manguoidung ?? userId ?? null;
    const role = String(profile?.chucnang ?? "unknown").toLowerCase();

    if (!manguoidung) {
      return jsonResponse({
        success: false,
        code: "USER_NOT_FOUND",
        message: "Không tìm thấy người dùng với email này trong hệ thống",
      }, 200);
    }

    const otp = Math.floor(10000000 + Math.random() * 90000000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Nếu bảng của bạn không có so_lan_thu hoặc thoi_diem_tao thì xóa 2 field đó
    const { error: insertError } = await supabase
      .from("yeu_cau_dat_lai_pin")
      .insert({
        email,
        manguoidung,
        ma_otp_da_bam: otp,
        het_han_luc: expiresAt,
        da_su_dung: false,
        so_lan_thu: 1,
        thoi_diem_tao: new Date().toISOString(),
        vai_tro: purpose, // dùng vai_tro như chức năng/mục đích
      });

    if (insertError) {
      return jsonResponse({
        success: false,
        code: "DB_INSERT_FAILED",
        message: `Không lưu được OTP vào database: ${insertError.message}`,
      }, 200);
    }

    const pack = getMessagePack(role, purpose);

    const { data: mailData, error: mailError } = await resend.emails.send({
      from: "Xác thực <onboarding@resend.dev>",
      to: email,
      subject: pack.subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6">
          <h2>${pack.subject}</h2>
          <p>${pack.intro}</p>
          <p>Mã OTP của bạn là:</p>
          <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">
            ${otp}
          </div>
          <p>Mã này sẽ hết hạn sau 5 phút.</p>
        </div>
      `,
    });

    if (mailError) {
      return jsonResponse({
        success: false,
        code: "MAIL_SEND_FAILED",
        message: `Đã lưu OTP nhưng gửi mail thất bại: ${mailError.message}`,
      }, 200);
    }

    return jsonResponse({
      success: true,
      code: "OTP_SENT",
      email,
      role,
      purpose,
      message: pack.successMessage,
      expiresInMinutes: 5,
      mailId: mailData?.id ?? null,
    }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    return jsonResponse({
      success: false,
      code: "UNEXPECTED_ERROR",
      message,
    }, 500);
  }
});