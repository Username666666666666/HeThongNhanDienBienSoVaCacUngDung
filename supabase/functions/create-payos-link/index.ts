import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // THÊM CÁI `mins` VÀO ĐÂY
    const { orderCode, amount, description, userId, lotId, type, zoneId, mathe, mins } = await req.json();

    const client_id = Deno.env.get('PAYOS_CLIENT_ID') || "";
    const api_key = Deno.env.get('PAYOS_API_KEY') || "";
    const checksum_key = Deno.env.get('PAYOS_CHECKSUM_KEY') || "";

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // TRUYỀN `mins` VÀO CỘT `thoi_gian_phut` ĐỂ LƯU XUỐNG DB
    const { error: dbError } = await supabase.from('giaodich_cho').insert({
      order_code: Number(orderCode),
      manguoidung: userId,
      mabaido: lotId,
      loai_giaodich: type,
      makhuvuc: zoneId || null,
      mathe: mathe || null,
      sotien: Number(amount),
      trangthai: 'PENDING',
      thoi_gian_phut: Number(mins || 0)
    });

    if (dbError) throw new Error("Lỗi Insert DB: " + dbError.message);

    const body = {
      orderCode: Number(orderCode),
      amount: Number(amount),
      description: description,
      cancelUrl: "https://google.com",
      returnUrl: "https://google.com"
    };

    const signData = `amount=${body.amount}&cancelUrl=${body.cancelUrl}&description=${body.description}&orderCode=${body.orderCode}&returnUrl=${body.returnUrl}`;
    const signature = createHmac("sha256", checksum_key).update(signData).digest("hex");

    const response = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-client-id": client_id, "x-api-key": api_key },
      body: JSON.stringify({ ...body, signature }),
    });

    const payosData = await response.json();
    return new Response(JSON.stringify(payosData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
  }
})
