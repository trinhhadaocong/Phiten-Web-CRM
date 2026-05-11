const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../public/data.xlsx');
const workbook = XLSX.readFile(filePath);

const normKey = (k) => String(k || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const normVal = (v) => String(v || '').replace(/[^0-9]/g, '').replace(/^0+/, '');

console.log("--- SEARCHING ALL SHEETS ---");

workbook.SheetNames.forEach(name => {
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[name]);
    if (data.length === 0) return;
    
    let found = 0;
    data.forEach(row => {
        const rowNorm = {};
        for(let k in row) rowNorm[normKey(k)] = row[k];
        
        const id = normVal(rowNorm.customerid || rowNorm.makh || rowNorm.makhachhang);
        if (id === '9661') {
            found++;
        }
    });
    
    if (found > 0) {
        console.log(`Sheet: ${name}, Rows found: ${found}`);
        console.log("Sample row (normalized):", JSON.stringify(Object.assign({}, ...Object.keys(data[0]).map(k => ({ [normKey(k)]: data[0][k] }))), null, 2));
    }
});
