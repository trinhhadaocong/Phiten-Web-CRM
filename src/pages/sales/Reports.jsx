import React, { useState } from 'react';
import { FileText, Download, Filter, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import KPICard from '../../components/reports/KPICard';
import RevenueChart from '../../components/reports/RevenueChart';
import ChannelChart from '../../components/reports/ChannelChart';
import SegmentChart from '../../components/reports/SegmentChart';
import KPIScorecard from '../../components/reports/KPIScorecard';
import CampaignCards from '../../components/reports/CampaignCards';
import GroupIDTable from '../../components/reports/GroupIDTable';

import { useCRMData } from '../../context/CRMContext';

const Reports = () => {
  const { transactions, customers, customerList, loading } = useCRMData();
  const [activeTab, setActiveTab] = useState('q1');
  const [currencyMode, setCurrencyMode] = useState('vnd'); 

  const stats = useMemo(() => {
    if (!transactions.length || !customers.length) return null;

    const today = new Date();
    const periodStart = new Date(2026, 0, 1); // Q1 2026 start

    // 1. Revenue by Month
    const monthlyRev = {};
    for (let m = 1; m <= 3; m++) {
      monthlyRev[`Tháng ${m}`] = { name: `Tháng ${m}`, new: 0, existing: 0 };
    }

    transactions.forEach(t => {
      if (t.Year === 2026 && t.Month >= 1 && t.Month <= 3) {
        const monthKey = `Tháng ${t.Month}`;
        const cust = customers.find(c => c.CustomerID === t.CustomerID);
        const fpdStr = cust?.FirstPurchaseDate;
        
        let isNew = false;
        if (fpdStr) {
          const parts = String(fpdStr).split('/');
          if (parts.length === 3) {
            const fpd = new Date(parts[2], parts[1] - 1, parts[0]);
            const tDate = new Date(t.Year, t.Month - 1, 1);
            if (fpd.getMonth() === tDate.getMonth() && fpd.getFullYear() === tDate.getFullYear()) {
              isNew = true;
            }
          }
        }

        if (isNew) monthlyRev[monthKey].new += t.Revenue;
        else monthlyRev[monthKey].existing += t.Revenue;
      }
    });

    // 2. Revenue by Channel
    const channelMap = {};
    transactions.forEach(t => {
      if (t.Year === 2026 && t.Month >= 1 && t.Month <= 3) {
        const ch = t.Channel_norm || 'Other';
        channelMap[ch] = (channelMap[ch] || 0) + t.Revenue;
      }
    });
    const channelData = Object.entries(channelMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // 3. Segments
    const segMap = { 'VIP': 0, 'Loyal': 0, 'At Risk': 0, 'Lost': 0 };
    customers.forEach(c => {
      const s = c.Segment || 'Lost';
      if (segMap[s] !== undefined) segMap[s]++;
    });
    const segmentData = Object.entries(segMap).map(([name, count]) => ({
      name,
      count,
      percent: customers.length > 0 ? (count / customers.length * 100).toFixed(1) : 0
    }));

    // 4. KPI Scorecard
    const totalCust = customers.length;
    const activeCount = customers.filter(c => c.Active).length;
    const repeatCount = customers.filter(c => c.Repeat).length;
    const totalRev = transactions.filter(t => t.Year === 2026 && t.Month >= 1 && t.Month <= 3).reduce((s, t) => s + t.Revenue, 0);
    const existingRev = transactions.filter(t => {
      if (!(t.Year === 2026 && t.Month >= 1 && t.Month <= 3)) return false;
      const cust = customers.find(c => c.CustomerID === t.CustomerID);
      if (!cust?.FirstPurchaseDate) return false;
      const parts = String(cust.FirstPurchaseDate).split('/');
      const fpd = new Date(parts[2], parts[1] - 1, parts[0]);
      return fpd < new Date(t.Year, t.Month - 1, 1);
    }).reduce((s, t) => s + t.Revenue, 0);

    const kpiData = [
      { name: "Active customer rate", actual: `${(activeCount/totalCust*100).toFixed(1)}%`, target: "≥50%", status: activeCount/totalCust >= 0.5 ? "✅" : "❌" },
      { name: "Repeat purchase rate", actual: `${(repeatCount/totalCust*100).toFixed(1)}%`, target: "≥35%", status: repeatCount/totalCust >= 0.35 ? "✅" : "❌" },
      { name: "Revenue KH hiện hữu", actual: `${(existingRev/totalRev*100).toFixed(1)}%`, target: "≥60%", status: existingRev/totalRev >= 0.6 ? "✅" : "❌" },
      { name: "CRM revenue avg/tháng", actual: `${Math.round(totalRev/3/1000000)}M`, target: "≥200M", status: totalRev/3 >= 200000000 ? "✅" : "❌" },
    ];

    return { 
      revenueByMonth: Object.values(monthlyRev), 
      channelData, 
      segmentData, 
      kpiData,
      totalCustomers: totalCust,
      totalRevenue: totalRev,
      activeRate: (activeCount/totalCust*100).toFixed(1) + '%',
      repeatRate: (repeatCount/totalCust*100).toFixed(1) + '%'
    };
  }, [transactions, customers]);

  const formatValue = (v) => {
    if (currencyMode === 'billion') {
        if (v >= 1000000000) return `${(v / 1000000000).toFixed(2)} tỷ`;
        return `${(v / 1000000).toFixed(0)} tr`;
    }
    return v.toLocaleString();
  };

  if (loading) return <div className="p-20 text-center text-white">Đang tổng hợp báo cáo...</div>;
  if (!stats) return <div className="p-20 text-center text-white">Vui lòng upload dữ liệu để xem báo cáo.</div>;

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
        <KPICard title="Tổng KH thực tế" value={stats.totalCustomers.toLocaleString()} target="3.5k Q1" status="✅" suffix="KH" />
        <KPICard title="Doanh thu Q1" value={formatValue(stats.totalRevenue)} target="1.8 tỷ" status={stats.totalRevenue < 1800000000 ? "⚠️" : "✅"} suffix="VND" />
        <KPICard title="KH cần Reactivate" value={stats.totalCustomers - parseInt(stats.activeRate)} target="Max 2k" status="❌" suffix="Member" />
        <KPICard title="Active Rate" value={stats.activeRate} target="≥50%" status={parseFloat(stats.activeRate) >= 50 ? "✅" : "❌"} suffix="" />
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Repeat Purchase Rate" value={stats.repeatRate} target="≥35%" status={parseFloat(stats.repeatRate) >= 35 ? "✅" : "❌"} />
        <KPICard title="Revenue KH hiện hữu" value={stats.kpiData[2].actual} target="≥60%" status={stats.kpiData[2].status} />
        <KPICard title="CRM Rev avg/tháng" value={stats.kpiData[3].actual} target="≥200M" status={stats.kpiData[3].status} />
        <KPICard title="Data Completeness" value="22%" target="≥95%" status="❌" />
      </div>

      {/* Charts Section 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <RevenueChart data={stats.revenueByMonth} />
        <ChannelChart data={stats.channelData} />
      </div>

      {/* Charts Section 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
         <div className="lg:col-span-1">
            <SegmentChart data={stats.segmentData} />
         </div>
         <div className="lg:col-span-2">
            <KPIScorecard data={stats.kpiData} />
         </div>
      </div>

      {/* Campaign Section */}
      <div className="mb-8">
         <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest text-sm italic">
           <Filter className="text-indigo-400" size={18} />
           Ưu tiên Chiến dịch Tháng 4
         </h3>
         <CampaignCards campaigns={[
           { title: 'PHITEN NHỚ BẠN', scale: `${(stats.totalCustomers * 0.35).toFixed(0)} KH`, expected: '120 - 200M' },
           { title: 'VIP EXCLUSIVE', scale: `${stats.segmentData.find(s => s.name === 'VIP')?.count || 0} KH`, expected: '80 - 150M' },
           { title: 'BIRTHDAY CLUB', scale: '50 KH (T4)', expected: '30 - 60M' },
         ]} />
      </div>

      {/* Restricted Section */}
      <GroupIDTable groups={[]} />

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
