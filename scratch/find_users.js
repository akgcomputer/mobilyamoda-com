import fs from 'fs';
const db = JSON.parse(fs.readFileSync('C:\\Users\\dell\\.gemini\\antigravity\\scratch\\laflaf-Antigravity-Agent\\src\\lib\\local_db.json', 'utf8'));
console.log('Users:', db.users || db.data?.users);
