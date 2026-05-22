import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const password = formData.get('password')?.toString();

  if (password === 'laflaf123') {
    cookies.set('admin_auth', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24
    });
    return redirect('/admin');
  } else {
    return redirect('/admin/login?error=1');
  }
};