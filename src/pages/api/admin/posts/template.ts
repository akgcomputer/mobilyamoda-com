import type { APIRoute } from 'astro';
import * as xlsx from 'xlsx';

export const GET: APIRoute = async () => {
  try {
    // Şablon sütunları
    const headers = [
      'title',
      'slug',
      'content',
      'excerpt',
      'status',
      'category',
      'imageUrl',
      'tags',
      'readTime',
      'isSponsored',
      'views',
      'likes',
      'author1',
      'comment1',
      'author2',
      'comment2',
      'author3',
      'comment3',
      'author4',
      'comment4',
      'author5',
      'comment5'
    ];

    // Örnek bir satır
    const sampleRow = [
      'Örnek Başlık',
      'ornek-baslik',
      '<p>Örnek içerik buraya gelecek...</p>',
      'Kısa açıklama',
      'published', // veya 'draft'
      'Teknoloji', // Kategori Adı, Slug'ı veya ID'si yazılabilir
      'https://picsum.photos/800/400',
      'etiket1, etiket2',
      5,           // Okunma süresi (dakika)
      0,           // 0 (Hayır) veya 1 (Evet)
      150,         // views (okunma sayısı)
      25,          // likes (beğeni sayısı)
      'Ahmet Yılmaz', // Yazar 1
      'Harika bir içerik!', // Yorum 1
      'Ayşe Kaya',    // Yazar 2
      'Teşekkürler, çok faydalı.', // Yorum 2
      '', '', '', '', '', '' // Diğer yazar ve yorum alanları (boş bırakılabilir)
    ];

    const worksheet = xlsx.utils.aoa_to_sheet([headers, sampleRow]);
    
    // Sütun genişliklerini ayarla
    worksheet['!cols'] = [
      { wch: 30 }, // title
      { wch: 20 }, // slug
      { wch: 50 }, // content
      { wch: 30 }, // excerpt
      { wch: 15 }, // status
      { wch: 20 }, // category
      { wch: 30 }, // imageUrl
      { wch: 20 }, // tags
      { wch: 10 }, // readTime
      { wch: 15 }, // isSponsored
      { wch: 10 }, // views
      { wch: 10 }  // likes
    ];

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'İçerikler');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="icerik_sablonu.xlsx"'
      }
    });

  } catch (error) {
    console.error('Şablon oluşturma hatası:', error);
    return new Response('Şablon oluşturulurken bir hata meydana geldi.', { status: 500 });
  }
};
