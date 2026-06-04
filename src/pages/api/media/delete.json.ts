import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  // Check authorization
  const sessionCookie = cookies.get('user_session');
  const sessionData = sessionCookie ? sessionCookie.json() : null;
  if (!sessionData || !sessionData.role || sessionData.role === 'abone' || sessionData.role === 'misafir') {
    return new Response(JSON.stringify({ error: 'Yetkisiz işlem' }), { status: 403 });
  }

  const r2 = locals.runtime?.env?.MEDIA_BUCKET;
  if (!r2) {
    return new Response(JSON.stringify({ error: 'R2 not configured' }), { status: 500 });
  }

  try {
    const body = await request.json();
    const { name, names } = body as { name?: string; names?: string[] };

    if (name) {
      await r2.delete(name);
      return new Response(JSON.stringify({ success: true, message: 'Dosya başarıyla silindi.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (names && Array.isArray(names) && names.length > 0) {
      for (const n of names) {
        await r2.delete(n);
      }
      return new Response(JSON.stringify({ success: true, message: `${names.length} dosya başarıyla silindi.` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Geçersiz parametreler' }), { status: 400 });
  } catch (err: any) {
    console.error('Delete API error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
