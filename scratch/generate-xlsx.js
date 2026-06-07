import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const data = [
  {
    "Ürün Adı": "Akıllı Akustik Bluetooth Hoparlör",
    "URL (Slug)": "akilli-akustik-bluetooth-hoparlor",
    "Kategori": "Teknoloji",
    "Marka": "Samsung",
    "Satış Fiyatı": 1899.90,
    "Eski Fiyat": 2499.90,
    "Stok Kodu (SKU)": "SKU-HPR-100",
    "Barkod": "8681234567890",
    "Stok Miktarı": 120,
    "Durum (aktif/pasif)": "aktif",
    "Kısa Açıklama": "Yüksek kaliteli ses performansı sunan akıllı bluetooth hoparlör.",
    "Detaylı Açıklama": "<p>Samsung Akıllı Akustik Bluetooth Hoparlör ile evinizde konser salonu deneyimini yaşayın. 360 derece ses dağılımı, derin baslar ve net tiz sesler ile müzik keyfinizi zirveye taşıyın.</p>",
    "Stoksuz Sat (0/1)": 0,
    "Sol Üst Rozet": "Yeni",
    "Sağ Üst Rozet": "Ücretsiz Kargo",
    "Satıcı Adı": "Samsung Türkiye",
    "Etiketler": "hoparlör,bluetooth,ses,teknoloji,samsung",
    "Ana Görsel URL": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=600&auto=format&fit=crop",
    "Görsel 1 URL": "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop",
    "Görsel 2 URL": "",
    "Görsel 3 URL": "",
    "Görsel 4 URL": "",
    "Görsel 5 URL": "",
    "Video URL": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "Satış Birimi": "Adet",
    "Min. Sipariş Miktarı": 1,
    "Özellik Adı 1": "Renk", "Özellik Değeri 1": "Kömür Grisi",
    "Özellik Adı 2": "Bağlantı", "Özellik Değeri 2": "Bluetooth 5.2",
    "Özellik Adı 3": "Güç", "Özellik Değeri 3": "40W RMS",
    "Özellik Adı 4": "Pil Ömrü", "Özellik Değeri 4": "12 Saate Kadar",
    "Özellik Adı 5": "Suya Dayanıklılık", "Özellik Değeri 5": "IPX7 Sertifikalı",
    "Varyasyon Adı 1": "Gri - Standart", "Varyasyon Stok 1": 50, "Varyasyon Fiyat 1": 0,
    "Varyasyon Adı 2": "Siyah - Pro Kit", "Varyasyon Stok 2": 40, "Varyasyon Fiyat 2": 400.00,
    "Varyasyon Adı 3": "Beyaz - Special Edition", "Varyasyon Stok 3": 30, "Varyasyon Fiyat 3": 150.00,
    "Varyasyon Adı 4": "", "Varyasyon Stok 4": "", "Varyasyon Fiyat 4": "",
    "Varyasyon Adı 5": "", "Varyasyon Stok 5": "", "Varyasyon Fiyat 5": "",
    "Toptan Min. Miktar 1": 5, "Toptan İndirim Oranı % 1": 10,
    "Toptan Min. Miktar 2": 10, "Toptan İndirim Oranı % 2": 15,
    "Toptan Min. Miktar 3": 20, "Toptan İndirim Oranı % 3": 22
  }
];

const ws = XLSX.utils.json_to_sheet(data);

// Adjust column widths automatically
const colWidths = Object.keys(data[0]).map(key => ({
  wch: Math.max(key.length + 4, 15)
}));
ws['!cols'] = colWidths;

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Ürün Şablonu");

const dir = path.join(process.cwd(), 'public', 'downloads');
if (!fs.existsSync(dir)){
  fs.mkdirSync(dir, { recursive: true });
}

const filePath = path.join(dir, 'ornek-urun-sablonu.xlsx');
XLSX.writeFile(wb, filePath);
console.log('Created comprehensive template successfully: ' + filePath);
