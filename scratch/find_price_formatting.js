import fs from 'fs';
const db = JSON.parse(fs.readFileSync('C:\\Users\\dell\\.gemini\\antigravity\\scratch\\laflaf-Antigravity-Agent\\src\\lib\\local_db.json', 'utf8'));
console.log('Keys:', Object.keys(db));
const products = db.products || db.data?.products || db;
console.log('Products:', products.slice(0, 3).map(p => ({ id: p.id, name: p.name, price: p.price, priceType: typeof p.price })));
