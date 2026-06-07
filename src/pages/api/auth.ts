import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const password = body.password;
    
    if (password === 'laflaf123') {
      cookies.set('admin_auth', 'true', {
        path: '/',
        maxAge: 60 * 60 * 24,
        httpOnly: true,
        secure: false, // local'de false, production'da true
        sameSite: 'lax',
      });
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Wrong password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};