const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:/Users/dell/.gemini/antigravity/brain/d1116e52-e92e-4e6b-8477-bd6c1f78a88b/.system_generated/logs/transcript.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('USER_INPUT') && line.includes('profil')) {
      try {
        const data = JSON.parse(line);
        if (data.type === 'USER_INPUT') {
          console.log(data.content);
          console.log('---');
        }
      } catch (e) {}
    }
  }
}

processLineByLine();
