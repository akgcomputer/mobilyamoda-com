import type { APIRoute } from 'astro';
import { getOrderById, getProductById } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();
    const dbBinding = locals.runtime?.env?.DB;

    const orderIds = data.orderIds || [];
    const favIds = data.favIds || [];

    const orders = [];
    for (const id of orderIds) {
      const o = await getOrderById(parseInt(id), dbBinding);
      if (o) orders.push(o);
    }

    const favs = [];
    for (const id of favIds) {
      const p = await getProductById(parseInt(id), dbBinding);
      if (p) favs.push(p);
    }

    return new Response(JSON.stringify({
      success: true,
      orders,
      favs
    }), { status: 200 });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Sistem hatası.' }), { status: 500 });
  }
}
