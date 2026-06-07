import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walk(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

walk('C:\\Users\\dell\\.gemini\\antigravity\\scratch\\laflaf-Antigravity-Agent\\src', (filePath) => {
  if (filePath.endsWith('.astro') || filePath.endsWith('.ts') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.toLowerCase().includes('ödeme') || content.toLowerCase().includes('payment')) {
      // Find matching lines
      let lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes('ödeme') || line.toLowerCase().includes('payment')) {
          console.log(`${path.basename(filePath)}:${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
});
