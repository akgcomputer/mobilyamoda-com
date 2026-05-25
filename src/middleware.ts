import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  const { url, cookies, redirect } = context;

  // Sadece /admin ile başlayan yolları kontrol et
  if (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login') && !url.pathname.startsWith('/api/admin-login')) {
    
    // Basit şifreli giriş (admin_auth) kontrolü
    const hasAdminAuth = cookies.has('admin_auth') && cookies.get('admin_auth')?.value === 'true';
    if (hasAdminAuth) {
      return next();
    }

    // Profil üzerinden giriş (user_session) kontrolü
    if (!cookies.has('user_session')) {
      return redirect('/admin/login');
    }

    try {
      const sessionCookie = cookies.get('user_session');
      const sessionData = sessionCookie ? sessionCookie.json() : null;
      
      if (!sessionData || !sessionData.role) {
        return redirect('/admin/login');
      }

      const userRole = sessionData.role;

      // Abone yetkisine sahip kullanıcıların veya geçersiz rolleri olanların admin paneline girmesi engellenir
      if (userRole === 'abone' || userRole === 'misafir') {
        return redirect('/admin/login');
      }
    } catch (e) {
      return redirect('/admin/login');
    }
  }

  return next();
});
