import type { APIRoute } from 'astro';
import { createOrder } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();
    const dbBinding = locals.runtime?.env?.DB;

    // Validate required fields
    if (!data.customer_name || !data.customer_email || !data.shipping_address || !data.payment_method || !data.cart || data.cart.length === 0) {
      return new Response(JSON.stringify({ error: 'Eksik bilgi girdiniz.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Calculate totals
    let subtotal = 0;
    const itemsData = data.cart.map((item: any) => {
      const unit_price = Number(item.price) || 0;
      const qty = Number(item.qty) || 1;
      const total_price = unit_price * qty;
      subtotal += total_price;

      return {
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.name,
        variant_name: item.variant_name,
        quantity: qty,
        unit_price: unit_price,
        total_price: total_price
      };
    });

    const shipping_fee = 0; // For future implementation
    const tax = 0; // Included in price
    const total_amount = subtotal + shipping_fee + tax;

    const orderData = {
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      shipping_address: data.shipping_address,
      billing_address: data.billing_address || data.shipping_address,
      subtotal,
      shipping_fee,
      tax,
      total_amount,
      payment_method: data.payment_method,
      status: 'bekliyor',
      notes: data.notes
    };

    const newOrder = await createOrder(orderData, itemsData, dbBinding);

    if (!newOrder) {
      throw new Error('Sipariş oluşturulamadı.');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      order_id: newOrder.id,
      message: 'Siparişiniz başarıyla alındı.' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: 'Sunucu hatası: ' + error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
