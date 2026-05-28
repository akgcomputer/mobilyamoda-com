import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const data = [
  {
    "Ürün Adı": "Örnek Ürün",
    "URL (Slug)": "ornek-urun",
    "Kategori ID": 1,
    "Marka ID": 1,
    "Satış Fiyatı": 299.90,
    "Eski Fiyat": 399.90,
    "Stok Kodu (SKU)": "SKU-1001",
    "Barkod": "123456789",
    "Stok Miktarı": 50,
    "Durum (aktif/pasif)": "aktif",
    "Kısa Açıklama": "Kısa bilgi...",
    "Detaylı Açıklama": "<p>Detaylı HTML içeriği</p>",
    "Stoksuz Sat (0/1)": 0,
    "Sol Üst Rozet": "Yeni",
    "Sağ Üst Rozet": "Kampanya"
  }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Ürünler");

const filePath = path.join(process.cwd(), 'public', 'downloads', 'ornek-urun-sablonu.xlsx');
XLSX.writeFile(wb, filePath);
console.log('Created ' + filePath);
