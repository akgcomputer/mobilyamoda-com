import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
  const { key } = params;
  if (!key) return new Response('Not found', { status: 404 });
  
  const r2 = locals.runtime?.env?.MEDIA_BUCKET;
  
  if (!r2) {
    // R2 is not bound (likely running locally without wrangler or missing binding).
    // In local dev without R2, files are in /public/uploads/ and served statically by Astro/Vite.
    return new Response('Media bucket not configured', { status: 500 });
  }
  
  try {
    const object = await r2.get(key);
    
    if (object === null) {
      return new Response('File not found', { status: 404 });
    }
    
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    
    return new Response(object.body, { headers });
  } catch (err) {
    console.error('R2 fetching error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
