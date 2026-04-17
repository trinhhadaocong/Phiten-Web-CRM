import React, { useState } from 'react';
import { FileText, Download, Filter, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import KPICard from '../../components/reports/KPICard';
import RevenueChart from '../../components/reports/RevenueChart';
import ChannelChart from '../../components/reports/ChannelChart';
import SegmentChart from '../../components/reports/SegmentChart';
import KPIScorecard from '../../components/reports/KPIScorecard';
import CampaignCards from '../../components/reports/CampaignCards';
import GroupIDTable from '../../components/reports/GroupIDTable';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('q1');
  const [currencyMode, setCurrencyMode] = useState('vnd'); // 'vnd' or 'billion'

  // --- MOCK DATA BASED ON Q1.2026 REPORT ---
  const kpiScorecardData = [
    { name: "Active customer rate", actual: "33.5%", target: "≥50%", gap: "-16.5%", status: "❌", action: "Chiến dịch PHITEN NHỚ BẠN (T4)" },
    { name: "Repeat purchase rate", actual: "27.8%", target: "≥35%", gap: "-7.2%", status: "❌", action: "Ưu đãi KH hiện hữu & Loyalty" },
    { name: "Revenue KH hiện hữu", actual: "66.17%", target: "≥60%", gap: "+6.17%", status: "✅", action: "Duy trì chăm sóc Zalo OA" },
    { name: "CRM revenue avg/tháng", actual: "250M", target: "≥200M", gap: "+50M", status: "✅", action: "Đẩy mạnh Upsell Q2" },
    { name: "Inactive KH >6 tháng", actual: "2,063", target: "<50%", gap: "+16.7%", status: "❌", action: "Phân loại KH để Reactivation" },
    { name: "Birthday CR avg", actual: "12.1%", target: "≥15%", gap: "-2.9%", status: "⚠️", action: "Cá nhân hóa quà tặng tháng sinh" },
    { name: "Data completeness", actual: "22%", target: "≥95%", gap: "-73%", status: "❌", action: "Rà soát & nhập liệu tại showroom" },
    { name: "CRM campaigns", actual: "1", target: "≥2", status: "❌", gap: "-1", action: "Tăng tần suất campaign CRM" },
    { name: "Reactivation potential", actual: "2.54 tỷ", target: "—", gap: "Cơ hội Q2", status: "✅", action: "Priority #1 trong Q2.2026" },
  ];

  const revenueByMonth = [
    { name: 'Tháng 1', new: 331600000, existing: 125800000 },
    { name: 'Tháng 2', new: 240100000, existing: 298300000 },
    { name: 'Tháng 3', new: 122600000, existing: 304700000 },
  ];

  const revenueByChannel = [
    { name: 'Nowzone', value: 3690000000 },
    { name: 'Zalo OA', value: 2800000000 },
    { name: 'Taka', value: 1850000000 },
    { name: 'Shopee', value: 1590000000 },
    { name: 'Website', value: 1040000000 },
    { name: 'Facebook', value: 940000000 },
    { name: 'Internal', value: 790000000 },
    { name: 'Event', value: 390000000 },
    { name: 'Lazada', value: 410000000 },
    { name: 'Tiki', value: 250000000 },
    { name: 'TikTok', value: 70000000 },
    { name: 'Collab', value: 60000000 },
  ].sort((a, b) => b.value - a.value);

  const segmentData = [
    { name: 'VIP', count: 21, percent: 0.7 },
    { name: 'Loyal', count: 1020, percent: 32.7 },
    { name: 'At Risk', count: 518, percent: 16.6 },
    { name: 'Lost', count: 1552, percent: 49.8 },
  ];

  const campaigns = [
    { title: 'PHITEN NHỚ BẠN', scale: '1,392 KH', expected: '120 - 200M' },
    { title: 'VIP EXCLUSIVE', scale: '71 KH', expected: '80 - 150M' },
    { title: 'BIRTHDAY CLUB', scale: '50 KH (T4)', expected: '30 - 60M' },
  ];

  const groupIds = [
    {
      id: 'KH000184',
      name: 'Khách Lẻ Sàn Shopee',
      spend: 840997963,
      orders: 317,
      channel: 'Shopee',
      note: 'Sàn ẩn — KH000184 dùng từ 01/2024 đến nay',
      status: 'Active'
    },
    {
      id: 'KH0008625',
      name: 'Khách Lẻ No Lấy Hóa Đơn',
      spend: 642308339,
      orders: 264,
      channel: 'All Channel',
      note: 'Takashimaya + Nowzon + Lazada + Tiki + Zalo + Website + Event',
      status: 'Active'
    },
    {
      id: 'KH000010',
      name: 'Khách Lẻ Nước Ngoài',
      spend: 469838160,
      orders: 154,
      channel: 'Takashimaya',
      note: 'Khách tourist — không đăng ký',
      status: 'Active'
    },
    {
      id: 'KH000009',
      name: 'Khách Lẻ Việt Nam',
      spend: 79771940,
      orders: 34,
      channel: 'Takashimaya',
      note: 'Mua lẻ tại quầy — không đăng ký',
      status: 'Active'
    },
    {
      id: 'KH000529',
      name: 'Khách Lẻ Sàn TikTok',
      spend: 32119400,
      orders: 17,
      channel: 'TikTok',
      note: 'TikTok ẩn — KH000529 dùng từ 05/2024 đến nay',
      status: 'Active'
    },
    {
      id: 'KH0005304',
      name: 'Takashimaya',
      spend: 42092250,
      orders: 10,
      channel: 'Takashimaya',
      note: 'Mua lẻ tại Event — chưa có store',
      status: 'Stop'
    },
    {
      id: 'KH0005108',
      name: 'Foreigner',
      spend: 83014500,
      orders: 26,
      channel: 'Online',
      note: 'Event ghi nhận kênh Online (CN3)',
      status: 'Stop'
    },
    {
      id: 'KH0007417',
      name: 'T*******h',
      spend: 189885575,
      orders: 78,
      channel: 'Shopee',
      note: 'Sàn ẩn — KH0007417 dùng từ 05/2024 đến nay',
      status: 'Stop'
    }
  ];

  const formatValue = (v) => {
    if (currencyMode === 'billion') {
        if (v >= 1000000000) return `${(v / 1000000000).toFixed(2)} tỷ`;
        return `${(v / 1000000).toFixed(0)} tr`;
    }
    return v.toLocaleString();
  };

  return (
    <div className="p-6 bg-[#0f172a] min-height-screen text-slate-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
             <FileText className="text-indigo-500" />
             Báo cáo & Phân tích CRM
          </h1>
          <p className="text-slate-400 mt-1">Dữ liệu tổng hợp Q1.2026 cho Ban Giám Đốc (CEO View)</p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-800/40 p-1.5 rounded-lg border border-slate-700/50">
          <button 
            onClick={() => setActiveTab('q1')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'q1' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            ALL Q1
          </button>
          <button className="px-4 py-1.5 rounded-md text-xs font-bold text-slate-400 hover:text-slate-200">T1</button>
          <button className="px-4 py-1.5 rounded-md text-xs font-bold text-slate-400 hover:text-slate-200">T2</button>
          <button className="px-4 py-1.5 rounded-md text-xs font-bold text-slate-400 hover:text-slate-200">T3</button>
          <div className="w-px h-6 bg-slate-700 mx-2" />
          <button 
            onClick={() => setCurrencyMode(currencyMode === 'vnd' ? 'billion' : 'vnd')}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-md text-[10px] font-bold text-indigo-400 hover:bg-slate-700 transition-all border border-indigo-500/30"
          >
            <TrendingUp size={12} />
            {currencyMode === 'vnd' ? 'XEM DẠNG TỶ' : 'XEM DẠNG VNĐ'}
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 text-emerald-400 rounded-md text-[10px] font-bold hover:bg-emerald-600/30 transition-all border border-emerald-500/30">
            <Download size={12} />
            XUẤT BÁO CÁO
          </button>
        </div>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Tổng KH thực tế" value="4,017" target="3.5k Q1" status="✅" suffix="KH" />
        <KPICard title="Doanh thu Q1" value={formatValue(1531139500)} target="1.8 tỷ" status="⚠️" suffix="VND" />
        <KPICard title="KH cần Reactivate" value="3,600" target="Max 2k" status="❌" suffix="Member" />
        <KPICard title="Active Rate" value="33.5%" target="≥50%" status="❌" suffix="" />
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Repeat Purchase Rate" value="27.8%" target="≥35%" status="❌" />
        <KPICard title="Revenue KH hiện hữu" value="66.17%" target="≥60%" status="✅" />
        <KPICard title="CRM Rev avg/tháng" value="250M" target="≥200M" status="✅" />
        <KPICard title="Data Completeness" value="22%" target="≥95%" status="❌" />
      </div>

      {/* Charts Section 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <RevenueChart data={activeTab === 'q1' ? revenueByMonth : revenueByMonth.slice(0, 1)} />
        <ChannelChart data={revenueByChannel} />
      </div>

      {/* Charts Section 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
         <div className="lg:col-span-1">
            <SegmentChart data={segmentData} />
         </div>
         <div className="lg:col-span-2">
            <KPIScorecard data={kpiScorecardData} />
         </div>
      </div>

      {/* Campaign Section */}
      <div className="mb-8">
         <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest text-sm italic">
           <Filter className="text-indigo-400" size={18} />
           Ưu tiên Chiến dịch Tháng 4
         </h3>
         <CampaignCards campaigns={campaigns} />
      </div>

      {/* Restricted Section */}
      <GroupIDTable groups={groupIds} />

      {/* Alert Footer */}
      <div className="mt-12 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-4">
        <div className="p-2 bg-red-500 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.4)]">
           <AlertTriangle className="text-white" size={20} />
        </div>
        <div>
          <h4 className="text-red-400 font-bold text-sm">CẢNH BÁO DATA INTEGRITY</h4>
          <p className="text-red-400/70 text-xs">Mức độ hoàn thiện dữ liệu (22%) đang ở mức báo động đỏ. Đề xuất chuẩn hóa quy trình nhập liệu tại quầy Nowzone và Zalo OA ngay tháng 4.</p>
        </div>
        <button className="ml-auto px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-all">
          XEM CHI TIẾT LỖI
        </button>
      </div>
    </div>
  );
};

export default Reports;
