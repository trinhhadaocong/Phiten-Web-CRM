const XLSX = require('xlsx');
const workbook = XLSX.readFile('c:/Users/adver/.claude/work/Phiten-Vietnam/CRM-Manager/My_AI_CRM/web-crm/public/data.xlsx');
const dbSheet = workbook.Sheets['Database'];
const data = XLSX.utils.sheet_to_json(dbSheet);
console.log('--- DATABASE SHEET SAMPLE (First 5 Rows) ---');
console.log(JSON.stringify(data.slice(0, 5), null, 2));

const listSheet = workbook.Sheets['Customer_List'];
const listData = XLSX.utils.sheet_to_json(listSheet);
const kh9661 = listData.find(c => String(c['Customer ID']).includes('9661'));
console.log('--- KH0009661 in Customer_List ---');
console.log(JSON.stringify(kh9661, null, 2));

const tx9661 = data.filter(t => String(t['Mã khách hàng'] || t['Mã KH'] || t['Customer ID']).includes('9661'));
console.log('--- KH0009661 in Database ---');
console.log(JSON.stringify(tx9661, null, 2));
