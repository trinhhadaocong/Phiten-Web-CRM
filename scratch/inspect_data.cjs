const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'data.xlsx');
try {
  const workbook = XLSX.readFile(filePath);
  console.log('Sheet Names:', workbook.SheetNames);
  workbook.SheetNames.forEach(name => {
    const sheet = workbook.Sheets[name];
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log(`Sheet: ${name}, Rows: ${data.length}`);
    if (data.length > 0) {
      console.log('Headers:', Object.keys(data[0]));
    }
  });
} catch (e) {
  console.error('Error reading file:', e);
}
