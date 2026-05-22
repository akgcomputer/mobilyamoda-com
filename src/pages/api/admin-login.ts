export const POST = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const password = formData.get('password');
  
  if (password === 'laflaf123') {
    cookies.set('admin_auth', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24,
      httpOnly: true,
    });
    return redirect('/admin');
  } else {
    return redirect('/admin/login?error=1');
  }
};