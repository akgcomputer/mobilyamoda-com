import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const r2 = locals.runtime?.env?.MEDIA_BUCKET;
  
  if (!r2) {
    return new Response(JSON.stringify({ error: 'Media bucket not configured' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const listed = await r2.list();
    const mediaFiles = listed.objects.map((obj: any) => ({
      name: obj.key,
      url: `/api/media/${obj.key}`,
      size: obj.size,
      date: obj.uploaded ? new Date(obj.uploaded).toISOString() : ''
    }));
    
    // En yeniler en üstte
    mediaFiles.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return new Response(JSON.stringify(mediaFiles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('R2 list error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
