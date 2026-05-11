import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import PayOS from "https://esm.sh/@payos/node@1.0.7";

serve(async (req) => {
  try {
    const body = await req.json();

    // 1. Dùng đủ 3 Key và SDK chính chủ PayOS để triệt tiêu 100% lỗi chữ ký
    const clientId = Deno.env.get('PAYOS_CLIENT_ID') || "";
    const apiKey = Deno.env.get('PAYOS_API_KEY') || "";
    const checksumKey = Deno.env.get('PAYOS_CHECKSUM_KEY') || "";

    const payos = new PayOS(clientId, apiKey, checksumKey);
    
    // SDK tự động xác minh chữ ký bảo mật, sai sẽ tự văng lỗi 400
    const webhookData = payos.verifyPaymentWebhookData(body);

    if (body.code === '00' || webhookData.code === '00') {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!, 
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      // 2. LỌC KÝ TỰ RÁC TỪ MÔ TẢ THEO ĐÚNG YÊU CẦU
      const description = String(webhookData.description || "");
      const matchCode = description.match(/\d{6,10}/); 
      const orderCode = matchCode ? Number(matchCode[0]) : Number(webhookData.orderCode);

      // 3. Tra cứu DB
      const { data: tx } = await supabase.from('giaodich_cho')
        .select('*')
        .eq('order_code', orderCode)
        .eq('trangthai', 'PENDING')
        .single();

      if (tx) {
        // ĐỌC CẤU HÌNH DEMO
        const { data: demoCfg } = await supabase.from('cauhinh_demo').select('time_option').eq('id', 1).single();
        const mode = demoCfg?.time_option || 'normal';

        let durationMs = 0;
        if (mode === '30s') durationMs = 30 * 1000;
        else if (mode === '1m') durationMs = 60 * 1000;
        else if (mode === '5m') durationMs = 5 * 60 * 1000;

        let expiry = new Date();
        
        if (tx.loai_giaodich === 'BOOKING') {
          if (mode !== 'normal') {
            expiry = new Date(Date.now() + durationMs);
          } else {
            expiry = new Date(Date.now() + (Number(tx.thoi_gian_phut || 0) + 24 * 60) * 60000);
          }
          
          await supabase.from('bangdatchotruoc1').insert({
            manguoidung: tx.manguoidung, mabaido: tx.mabaido, makhuvuc: tx.makhuvuc, 
            thanhtien: tx.sotien, trangthai: 'DA_THANH_TOAN', ngay_het_han: expiry.toISOString()
          });
        } else {
          if (mode !== 'normal') {
            expiry = new Date(Date.now() + durationMs);
          } else {
            const { data: the } = await supabase.from('the_thang_quy').select('loaithe').eq('mathe', tx.mathe).single();
            expiry.setMonth(expiry.getMonth() + (the?.loaithe === 'quy' ? 3 : 1));
          }
          
          await supabase.from('bangthedaihan').insert({
            manguoidung: tx.manguoidung, mabaido: tx.mabaido, mathe: tx.mathe, 
            trangthai: 'ACTIVE', ngay_het_han: expiry.toISOString()
          });
        }
        
        await supabase.from('giaodich_cho').update({ trangthai: 'SUCCESS' }).eq('order_code', tx.order_code);
      }
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e: any) { 
    return new Response(JSON.stringify({ error: e.message }), { status: 400 }); 
  }
});