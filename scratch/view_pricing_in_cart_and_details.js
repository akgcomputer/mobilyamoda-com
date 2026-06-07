// scratch/view_pricing_in_cart_and_details.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../src/pages');

const filesToInspect = [
  'sepet/index.astro',
  'checkout/index.astro',
  'urunler/[slug].astro'
];

filesToInspect.forEach(relPath => {
  const filePath = path.join(rootDir, relPath);
  if (fs.existsSync(filePath)) {
    console.log(`\n--- Inspecting ${relPath} ---`);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('price') || line.includes('Price') || line.includes('₺') || line.includes('TL')) {
        console.log(`L${idx + 1}: ${line.trim()}`);
      }
    });
  } else {
    console.log(`File not found: ${relPath}`);
  }
});
