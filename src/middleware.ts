import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  const { url, cookies, redirect } = context;

  // Sadece /admin ile başlayan yolları kontrol et
  if (url.pathname.startsWith('/admin')) {
    
    // Profil üzerinden giriş (user_session) kontrolü
    if (!cookies.has('user_session')) {
      return redirect('/profil');
    }

    try {
      const sessionCookie = cookies.get('user_session');
      const sessionData = sessionCookie ? sessionCookie.json() : null;
      
      if (!sessionData || !sessionData.role) {
        return redirect('/profil');
      }

      const userRole = sessionData.role;

      // Abone yetkisine sahip kullanıcıların veya geçersiz rolleri olanların admin paneline girmesi engellenir
      if (userRole === 'abone' || userRole === 'misafir') {
        return redirect('/profil');
      }
    } catch (e) {
      return redirect('/profil');
    }
  }

  return next();
});
