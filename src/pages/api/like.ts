import type { APIRoute } from 'astro';
import { likePost } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    if (!body.postId) {
      return new Response(JSON.stringify({ error: 'Post ID gereklidir.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const dbBinding = locals.runtime?.env?.DB;
    const newLikeCount = await likePost(Number(body.postId), dbBinding);

    return new Response(JSON.stringify({ success: true, likes: newLikeCount }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'İşlem başarısız oldu.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
