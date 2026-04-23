import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Thiếu biến môi trường SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const newPassword = String(body?.newPassword ?? "");
    const userId = body?.userId ? String(body.userId) : null;

    if (!email || !email.includes("@")) {
      return jsonResponse({
        success: false,
        code: "INVALID_EMAIL",
        message: "Email không hợp lệ",
      }, 200);
    }

    if (!newPassword || newPassword.length < 6) {
      return jsonResponse({
        success: false,
        code: "WEAK_PASSWORD",
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      }, 200);
    }

    // Ưu tiên lấy manguoidung từ bảng nguoidung
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

    const authUserId = userId ?? profile?.manguoidung ?? null;

    if (!authUserId) {
      return jsonResponse({
        success: false,
        code: "USER_NOT_FOUND",
        message: "Không tìm thấy tài khoản để cập nhật mật khẩu",
      }, 200);
    }

    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(authUserId, {
      password: newPassword,
    });

    if (updateError) {
      return jsonResponse({
        success: false,
        code: "AUTH_UPDATE_FAILED",
        message: `Không cập nhật được mật khẩu: ${updateError.message}`,
      }, 200);
    }

    return jsonResponse({
      success: true,
      code: "PASSWORD_UPDATED",
      message: "Đổi mật khẩu thành công",
      userId: updatedUser?.user?.id ?? authUserId,
      email,
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