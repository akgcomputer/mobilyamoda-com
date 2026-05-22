import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const body = await request.json();
  const password = body.password;

  if (password === 'laflaf123') {
    cookies.set('admin_auth', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } else {
    return new Response(JSON.stringify({ error: 'Wrong password' }), { status: 401 });
  }
};