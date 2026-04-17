const xlsx = require('xlsx');

const firstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Đỗ", "Ngô"];
const midNames = ["Văn", "Đức", "Thị", "Ngọc", "Minh", "Thu", "Hải", "Tuấn"];
const lastNames = ["Anh", "Bình", "Châu", "Dung", "Hoa", "Kiên", "Linh", "Nhung", "Sơn", "Trang", "Vy", "Hùng", "Tùng", "Cường", "Tâm"];
const positions = ["Quận 1", "Quận 3", "Quận Thành Công", "Ba Đình", "Hoàn Kiếm", "Cầu Giấy", "Quận 7", "Bình Thạnh"];
const companies = [
  {"Tên công ty": "Phiten JSC", "Mã số thuế": "0101234567", "Địa chỉ văn phòng": "Tòa A, Hà Nội", "Người đại diện": "Mr. A"},
  {"Tên công ty": "TechViet", "Mã số thuế": "0309876543", "Địa chỉ văn phòng": "Tòa B, HCM", "Người đại diện": "Mr. B"}
];

function randomDate(start, end) {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

const data = [];
// Generate 50 mock customers with varied interactions
for(let i = 1; i <= 50; i++) {
  const isVip = Math.random() > 0.8;
  const isLost = Math.random() > 0.85;
  const numOpps = isLost ? (Math.random() > 0.5 ? 1 : 0) : (isVip ? Math.floor(Math.random() * 5) + 3 : Math.floor(Math.random() * 3) + 1);
  const kh_ma = `KH${i.toString().padStart(3, '0')}`;
  
  // Decide R, F, M through opportunities logic. We will put R, F, M implicit in Opps
  for(let j=0; j < (numOpps || 1); j++) {
     let dateOpts;
     if (isLost) {
       dateOpts = [new Date('2023-01-01'), new Date('2024-01-01')];
     } else if (isVip) {
       dateOpts = [new Date('2026-01-01'), new Date('2026-04-14')];
     } else {
       dateOpts = [new Date('2025-01-01'), new Date('2026-04-14')];
     }

     const oppDate = randomDate(dateOpts[0], dateOpts[1]);
     const price = Math.floor(Math.random() * 20 + 2) * 1000000; 

     data.push({
      "SĐT": "09" + Math.floor(Math.random()*100000000).toString().padStart(8, '0'),
      "Mã KH": kh_ma,
      "Tên KH": `${firstNames[Math.floor(Math.random()*firstNames.length)]} ${midNames[Math.floor(Math.random()*midNames.length)]} ${lastNames[Math.floor(Math.random()*lastNames.length)]}`,
      "Địa chỉ": "Việt Nam",
      "Vị trí": positions[Math.floor(Math.random()*positions.length)],
      "Giới tính": Math.random() > 0.5 ? "Nam" : "Nữ",
      "Ngày Thành Viên": randomDate(new Date('2022-01-01'), new Date('2026-01-01')),
      "Ngày sinh": randomDate(new Date('1970-01-01'), new Date('2000-01-01')),
      "E-mail": `kh${i}@example.com`,
      "Thành viên": isVip ? "DIAMOND" : (Math.random() > 0.3 ? "GOLD" : "SILVER"),
      "Tình trạng": "Success",
      "Thể thao": "Football",
      "Channel": ["Zalo", "Facebook", "Showroom", "Shopee", "Website"][Math.floor(Math.random() * 5)],
      "Account": "Online",
      "Follow Zalo Oa": "CÓ",
      "Tổng hợp bệnh lý": "Đau mỏi",
      "Nghề nghiệp": "Business",
      "KH nước ngoài": "Không",
      "Ghi chú khác": "",
      "Người phụ trách": ["Lucy Tan", "Andy Chen", "John Doe"][Math.floor(Math.random()*3)],
      "Tên cơ hội": numOpps > 0 ? `Đơn hàng ${kh_ma}-${j+1}` : "",
      "Giá trị dự kiến": numOpps > 0 ? price : 0,
      "Giai đoạn": numOpps > 0 ? "Closed Won" : "",
      "Ngày dự kiến chốt": numOpps > 0 ? oppDate : "",
      "Mã Client": Math.random() > 0.5 ? companies[Math.floor(Math.random()*companies.length)]["Mã số thuế"] : "" // mapping to Client
     });
  }
}

const worksheet = xlsx.utils.json_to_sheet(data);
const clientsSheet = xlsx.utils.json_to_sheet(companies);

const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "Customers");
xlsx.utils.book_append_sheet(workbook, clientsSheet, "Clients");

xlsx.writeFile(workbook, "public/data.xlsx");
console.log("Mock data created at public/data.xlsx");
