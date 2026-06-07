const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:/Users/dell/.gemini/antigravity/brain/d1116e52-e92e-4e6b-8477-bd6c1f78a88b/.system_generated/logs/transcript.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('"type":"USER_INPUT"')) {
      try {
        const data = JSON.parse(line);
        if (data.type === 'USER_INPUT' && data.content.toLowerCase().includes('profil')) {
          console.log(data.created_at);
          console.log(data.content);
          console.log('----------------------------------------------------');
        }
      } catch (e) {}
    }
  }
}

processLineByLine();
