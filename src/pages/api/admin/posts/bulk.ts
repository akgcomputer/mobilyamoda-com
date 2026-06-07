import type { APIRoute } from 'astro';
import * as xlsx from 'xlsx';
import { createPost, getCategories, createComment, updateCommentStatus } from '../../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'Dosya bulunamadı.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = xlsx.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const rows = xlsx.utils.sheet_to_json<any>(sheet);
    const dbBinding = locals.runtime?.env?.DB;
    
    // Kategori eşleştirmesi için tüm kategorileri çek
    const categories = await getCategories(dbBinding);
    
    let successCount = 0;
    
    for (const row of rows) {
      if (!row.title) continue; // Başlık yoksa satırı atla
      
      const slug = row.slug || row.title
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Kategori ID'sini bul (İsim, slug veya ID olarak gelebilir)
      let resolvedCategoryId = null;
      if (row.category) {
        const catStr = String(row.category).toLowerCase().trim();
        const matched = categories.find(c => c.name.toLowerCase() === catStr || c.slug.toLowerCase() === catStr || String(c.id) === catStr);
        if (matched) resolvedCategoryId = matched.id;
      } else if (row.category_id) {
        resolvedCategoryId = Number(row.category_id);
      }

      const postData = {
        title: row.title,
        slug: slug,
        content: row.content || '<p></p>',
        excerpt: row.excerpt || '',
        status: row.status === 'published' ? 'published' : 'draft',
        category_id: resolvedCategoryId,
        imageUrl: row.imageUrl || '',
        tags: row.tags || '',
        readTime: row.readTime ? Number(row.readTime) : 3,
        isSponsored: row.isSponsored == 1 || String(row.isSponsored).toLowerCase() === 'true',
        views: row.views ? Math.round(Number(row.views)) : 0,
        likes: row.likes ? Math.round(Number(row.likes)) : 0,
        metaTitle: row.title,
        metaDescription: row.excerpt
      };
      
      const newPost = await createPost(postData, dbBinding);
      if (newPost && newPost.id) {
        successCount++;
        
        // Yorumları oluştur ve onayla
        for (let i = 1; i <= 5; i++) {
          const author = row['author' + i];
          const comment = row['comment' + i];
          
          if (author && comment) {
            const newComment = await createComment({
              post_id: newPost.id,
              author_name: author,
              content: comment
            }, dbBinding);
            
            if (newComment && newComment.id) {
              await updateCommentStatus(newComment.id, 'approved', dbBinding);
            }
          }
        }
      }
    }
    
    return new Response(JSON.stringify({ success: true, count: successCount }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Toplu yükleme hatası:', error);
    return new Response(JSON.stringify({ error: 'Yükleme sırasında bir hata oluştu: ' + (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
