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

walk('C:\\Users\\dell\\.gemini\\antigravity\\scratch\\laflaf-Antigravity-Agent\\src\\pages\\admin', (filePath) => {
  if (filePath.endsWith('.astro')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('cookies') || content.includes('session')) {
      let lines = content.split('\n');
      console.log(`=== ${path.relative('C:\\Users\\dell\\.gemini\\antigravity\\scratch\\laflaf-Antigravity-Agent\\src\\pages\\admin', filePath)} ===`);
      lines.slice(0, 15).forEach((line, idx) => {
        console.log(`${idx + 1}: ${line}`);
      });
    }
  }
});
