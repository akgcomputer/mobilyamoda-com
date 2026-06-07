import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const r2 = locals.runtime?.env?.MEDIA_BUCKET;
  if (!r2) {
    return new Response(JSON.stringify({ error: 'R2 not configured' }), { status: 500 });
  }

  try {
    const rawFileName = request.headers.get('X-File-Name') || 'upload.jpg';
    const fileName = decodeURIComponent(rawFileName);
    const contentType = request.headers.get('Content-Type') || 'image/jpeg';
    
    // Read raw body! No formData bugs.
    const buffer = await request.arrayBuffer();
    if (!buffer || buffer.byteLength === 0) {
      return new Response(JSON.stringify({ error: 'Empty file' }), { status: 400 });
    }

    const key = `products/${Date.now()}-${fileName}`;
    await r2.put(key, buffer, { httpMetadata: { contentType } });

    return new Response(JSON.stringify({ url: `/api/media/${key}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Upload API error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
