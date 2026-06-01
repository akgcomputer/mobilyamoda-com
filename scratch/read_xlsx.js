// scratch/read_xlsx.js
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const filePath = path.resolve(__dirname, '../public/downloads/ornek-urun-sablonu.xlsx');
  const buffer = fs.readFileSync(filePath);
  
  const xlsxObj = XLSX.default || XLSX;
  console.log("Available keys in xlsxObj:", Object.keys(xlsxObj).filter(k => typeof xlsxObj[k] === 'function'));
  
  const workbook = xlsxObj.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsxObj.utils.sheet_to_json(sheet);
  
  console.log("Sheet Name:", sheetName);
  console.log("Number of rows:", rows.length);
  if (rows.length > 0) {
    console.log("Headers/Keys in the first row:", Object.keys(rows[0]));
    console.log("First row data:", JSON.stringify(rows[0], null, 2));
  } else {
    console.log("Sheet is empty!");
  }
} catch (err) {
  console.error("Error reading xlsx:", err);
}
