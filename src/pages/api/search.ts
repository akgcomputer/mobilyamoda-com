import type { APIRoute } from 'astro';
import { searchPosts } from '../../lib/db';

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  if (!query || query.length < 2) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const dbBinding = locals.runtime?.env?.DB;
  const results = await searchPosts(query, 5, dbBinding);

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
