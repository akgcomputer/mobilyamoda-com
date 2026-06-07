// scratch/find_format_money.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../src');

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (stat.isFile() && (file.endsWith('.astro') || file.endsWith('.ts') || file.endsWith('.js'))) {
      callback(filePath);
    }
  }
}

const matches = [];

walkDir(rootDir, (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('formatMoney') || line.includes('function formatMoney') || line.includes('const formatMoney')) {
      matches.push({
        file: path.relative(rootDir, filePath),
        line: idx + 1,
        content: line.trim()
      });
    }
  });
});

console.log("Found formatMoney matches:");
console.log(JSON.stringify(matches, null, 2));
