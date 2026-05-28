import type { APIRoute } from 'astro';
import { getCouponByCode } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();
    const dbBinding = locals.runtime?.env?.DB;

    const coupon = await getCouponByCode(data.code, dbBinding);

    if (!coupon) {
      return new Response(JSON.stringify({ error: 'Geçersiz kupon kodu.' }), { status: 400 });
    }

    if (coupon.status !== 'aktif') {
      return new Response(JSON.stringify({ error: 'Bu kupon kodu aktif değil.' }), { status: 400 });
    }

    if (coupon.min_cart_amount > 0 && data.cart_amount < coupon.min_cart_amount) {
      return new Response(JSON.stringify({ error: `Bu kupon minimum ${coupon.min_cart_amount} ₺ tutarındaki sepetlerde geçerlidir.` }), { status: 400 });
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return new Response(JSON.stringify({ error: 'Bu kuponun kullanım limiti dolmuş.' }), { status: 400 });
    }

    // Tarih kontrolleri (Eğer valid_from/valid_until doluysa)
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return new Response(JSON.stringify({ error: 'Bu kupon henüz geçerli değil.' }), { status: 400 });
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return new Response(JSON.stringify({ error: 'Bu kuponun süresi dolmuş.' }), { status: 400 });
    }

    return new Response(JSON.stringify({
      success: true,
      coupon: {
        code: coupon.code,
        type: coupon.discount_type,
        value: coupon.discount_value
      }
    }), { status: 200 });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Sistem hatası.' }), { status: 500 });
  }
}
