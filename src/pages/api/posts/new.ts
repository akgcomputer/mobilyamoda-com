export const POST = async ({ request, redirect }) => {
  try {
    const body = await request.json();
    const { title, content, status } = body;
    
    console.log('İçerik kaydedildi:', { title, content, status });
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Kayıt hatası' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};