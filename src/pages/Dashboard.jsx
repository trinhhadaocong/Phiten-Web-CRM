import React, { useMemo, useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Target, Zap, Users, Receipt, RefreshCcw, Landmark, Info, Download, Upload, AlertTriangle, Cake } from 'lucide-react';
import './Dashboard.css';

import RFMWidget from '../components/dashboard/RFMWidget';

const COLORS = ['#8854d0', '#45aaf2', '#2bcbba', '#fed330', '#eb3b5a'];

const toast = {
  success: (msg) => alert(`Success: ${msg}`),
  error: (msg) => alert(`Error: ${msg}`)
};

const REQUIRED_DB_COLS = [
  'Customer ID',
  'Year',
  'Month', 
  'Revenue',
  'Channel_norm',
  'OrderKey',
];

const REQUIRED_CL_COLS = [
  'Customer ID',
  'First Purchase Date',
  'Last Purchase Date',
  'Total Spend',
  'Number of Orders',
  'Segment (VIP/Loyal/At Risk/Lost)',
];

const parseDate = (str) => {
  if (!str || str === '' || str === 'NON') return null;
  const parts = String(str).split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y || y < 1900) return null;
  return new Date(y, m - 1, d);
};

const getFilterPeriodStart = (filter) => {
  const today = new Date();
  switch (filter) {
    case 'thisMonth': return new Date(today.getFullYear(), today.getMonth(), 1);
    case 'Q1':        return new Date(2026, 0, 1);
    case '6months': {
      const d = new Date(today);
      d.setMonth(d.getMonth() - 6);
      d.setDate(1);
      return d;
    }
    default: return new Date(2000, 0, 1);
  }
};

const buildBirthdayList = (db) => {
  const today = new Date();
  const thisMonth = today.getMonth() + 1;
  const seen = new Set();
  const result = [];

  db.forEach(row => {
    const id = row.CustomerID_norm || row['Customer ID'];
    if (seen.has(id)) return;
    const dob = row['DOB'];
    if (!dob || dob === '' || dob === 'NON') return;
    const parts = String(dob).split('/');
    if (parts.length < 3) return;
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);
    if (year < 1930 || year > 2010 || isNaN(month)) return;
    if (month !== thisMonth) return;
    seen.add(id);
    result.push({
      id, day, month,
      name: row['Full Name'] || 'Khách hàng',
      channel: row['Channel_norm'] || row['Channel'] || '',
      dob,
    });
  });

  return result.sort((a, b) => a.day - b.day);
};

const KPI_TARGETS = { activeRate: 50, repeatRate: 35, existingRate: 60 };

const getWarnings = (kpis) => {
  const warns = [];
  if (kpis.activeRate < KPI_TARGETS.activeRate) warns.push('Active Rate');
  if (kpis.repeatRate < KPI_TARGETS.repeatRate) warns.push('Repeat Rate');
  if (kpis.existingRate < KPI_TARGETS.existingRate) warns.push('Revenue KH Hiện Hữu');
  return warns;
};

export default function Dashboard() {
  const { transactions: database, customerList, loading: isLoading } = useCRMData();
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const { uploadExcel } = useCRMData();
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isLoading) {
      if (database.length === 0 && customerList.length === 0) {
        setShowEmptyState(true);
      } else {
        setShowEmptyState(false);
      }
    }
  }, [isLoading, database, customerList]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      setIsUploading(true);
      const res = await uploadExcel(file);
      if (res.success) {
        toast.success(`Đọc thành công ${res.dbCount} dòng DB, ${res.clCount} khách`);
      } else {
        toast.error(res.error);
      }
      setIsUploading(false);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(`Lỗi đọc file: ${err.message}`);
      setIsUploading(false);
    }
  };

  const getFilteredDB = (filter = activeFilter) => {
    const today = new Date();
    switch (filter) {
      case 'thisMonth': {
        const y = today.getFullYear();
        const m = today.getMonth() + 1;
        return database.filter(r => r.Year === y && r.Month === m);
      }
      case 'Q1': {
        return database.filter(r => r.Year === 2026 && r.Month >= 1 && r.Month <= 3);
      }
      case '6months': {
        const cutoff = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        return database.filter(r => new Date(r.Year, r.Month - 1, 1) >= cutoff);
      }
      case 'all':
      default:
        return database;
    }
  };

  const filteredDB = useMemo(() => getFilteredDB(activeFilter), [database, activeFilter]);

  const kpis = useMemo(() => {
    if (!database.length || !customerList.length) return null;

    const total = customerList.length;
    
    // STATIC — từ Customer_List (Sử dụng key đã normalize từ CRMContext)
    const activeCount = customerList.filter(c => c.Active === true).length;
    const repeatCount = customerList.filter(c => c.Repeat === true).length;
    const activeRate = total > 0 ? (activeCount / total * 100) : 0;
    const repeatRate = total > 0 ? (repeatCount / total * 100) : 0;
    
    const countSegVIP = customerList.filter(c => c.Segment === 'VIP');
    const countSegLoyal = customerList.filter(c => c.Segment === 'Loyal');
    const countSegAtRisk = customerList.filter(c => c.Segment === 'At Risk');
    const countSegLost = customerList.filter(c => c.Segment === 'Lost');

    const segmentVIP = countSegVIP.length;
    const segmentLoyal = countSegLoyal.length;
    const segmentAtRisk = countSegAtRisk.length;
    const segmentLost = countSegLost.length;

    const revVIP = countSegVIP.reduce((s, c) => s + (c.TotalSpend || 0), 0);
    const revLoyal = countSegLoyal.reduce((s, c) => s + (c.TotalSpend || 0), 0);
    const revAtRisk = countSegAtRisk.reduce((s, c) => s + (c.TotalSpend || 0), 0);
    const revLost = countSegLost.reduce((s, c) => s + (c.TotalSpend || 0), 0);
    
    const potentialRev = revAtRisk + revLost;

    // DYNAMIC — từ filteredDB
    const totalRevenue  = filteredDB.reduce((s, r) => s + (r.Revenue || 0), 0);
    const totalOrders   = new Set(filteredDB.map(r => r.OrderKey)).size;
    const aov           = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const custMap = new Map(customerList.map(c => [String(c.CustomerID || '').trim(), c]));
    const periodStart = getFilterPeriodStart(activeFilter);
    
    const newCustomers = filteredDB.filter(r => {
      const cust = custMap.get(String(r.CustomerID_norm || r.CustomerID || r['Customer ID'] || '').trim());
      if (!cust) return false;
      const fpd = parseDate(cust.FirstPurchaseDate);
      return fpd && fpd >= periodStart;
    });
    const newCustomerCount = new Set(newCustomers.map(r => String(r.CustomerID_norm || r.CustomerID || r['Customer ID'] || '').trim())).size;

    const existingRevenue = filteredDB
      .filter(r => {
        const cust = custMap.get(String(r.CustomerID_norm || r.CustomerID || r['Customer ID'] || '').trim());
        if (!cust) return false;
        const fpd = parseDate(cust.FirstPurchaseDate);
        return fpd && fpd < periodStart;
      })
      .reduce((s, r) => s + (r.Revenue || 0), 0);
    const existingRate = totalRevenue > 0 ? existingRevenue / totalRevenue * 100 : 0;

    const targetActive = KPI_TARGETS.activeRate / 100;
    const missingCustomers = Math.max(0, Math.round((targetActive - activeRate/100) * total));

    // Trend mapping
    const trendMap = {};
    database.forEach(r => {
        const k = `${r.Year}-${String(r.Month).padStart(2, '0')}`;
        trendMap[k] = (trendMap[k] || 0) + r.Revenue;
    });
    const trendData = Object.entries(trendMap).sort().slice(-24).map(([k, v]) => ({
        name: `${k.split('-')[1]}/${k.slice(2,4)}`,
        Total: v
    }));

    // Channels
    const channels = {};
    filteredDB.forEach(r => {
        const ch = r.Channel_norm || r.Channel || 'Other';
        channels[ch] = (channels[ch] || 0) + r.Revenue;
    });
    const channelData = Object.entries(channels).map(([n, v]) => ({ name: n, revenue: v })).sort((a,b) => b.revenue - a.revenue);

    return {
      totalCustomers: total, activeCount, activeRate, repeatRate, existingRate,
      segmentVIP, segmentLoyal, segmentAtRisk, segmentLost,
      totalRevenue, totalOrders, aov, newCustomerCount, missingCustomers, potentialRev,
      rfm: [
        { name: 'VIP', count: segmentVIP, totalRev: revVIP, color: '#8854d0' },
        { name: 'Loyal', count: segmentLoyal, totalRev: revLoyal, color: '#20bf6b' },
        { name: 'At Risk', count: segmentAtRisk, totalRev: revAtRisk, color: '#f7b731' },
        { name: 'Lost', count: segmentLost, totalRev: revLost, color: '#eb3b5a' }
      ],
      trendData, channelData,
      birthdays: buildBirthdayList(database)
    };
  }, [database, customerList, filteredDB, activeFilter]);

  if (isLoading) return <div className="dashboard-loading">Đang tải cấu hình...</div>;

  if (showEmptyState) {
    return (
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh', gap:'16px'}}>
        <div style={{fontSize:'48px'}}>📊</div>
        <h2 style={{fontSize:'20px', fontWeight:'600', color:'#374151'}}>Chưa có dữ liệu Dashboard</h2>
        <p style={{color:'#6B7280', textAlign:'center', maxWidth:'400px'}}>
          Upload file data.xlsx để bắt đầu. Hệ thống sẽ đọc sheet "Database" và "Customer_List" tự động.
        </p>
        <button
          onClick={() => document.getElementById('file-upload-input').click()}
          disabled={isUploading}
          style={{padding:'10px 24px', background:'#7C3AED', color:'white', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'500'}}
        >
          {isUploading ? 'Đang đọc file...' : '📤 Upload data.xlsx ngay'}
        </button>
        <input type="file" id="file-upload-input" style={{ display: 'none' }} onChange={handleFileUpload} />
        <a href="/data.xlsx" download style={{color:'#7C3AED', fontSize:'14px'}}>
          ⬇️ Tải file mẫu
        </a>
      </div>
    );
  }

  const warnings = kpis ? getWarnings(kpis) : [];

  return (
    <div className="dashboard animate-fade-in">
      <div className="page-header" style={{ marginBottom: 30 }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
               <h2 className="page-title">Dashboard</h2>
               <div style={{ fontSize: 12, color: 'var(--text-medium)', marginTop: 8 }}>
                  <Info size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> 
                  Dữ liệu phân tích trực tiếp từ Excel
               </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
               <div className="date-presets">
                 {['thisMonth', 'Q1', '6months', 'all'].map(p => (
                   <button key={p} onClick={() => setActiveFilter(p)} className={activeFilter === p ? 'active' : ''}>
                     {p === 'thisMonth' ? 'Tháng này' : p === 'Q1' ? 'Q1/2026' : p === '6months' ? '6 tháng' : 'Toàn thời gian'}
                   </button>
                 ))}
               </div>
               <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
               <button className="btn-primary" onClick={() => fileInputRef.current.click()}><Upload size={16} /> Cập nhật</button>
            </div>
         </div>
      </div>

      {warnings.length > 0 && (
        <div style={{background:'#7f1d1d', color:'white', padding:'12px 20px', borderRadius:'8px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px'}}>
          ⚠️ Cảnh báo: {warnings.length} KPIs chưa đạt mục tiêu ({warnings.join(' & ')})
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="DOANH THU" value={`${kpis?.totalRevenue?.toLocaleString() || 0} VND`} subtitle={`KH Cũ: ${kpis?.existingRate?.toFixed(1) || 0}%`} color="#8854d0" icon={<Landmark size={24} />} />
        <StatCard title="TỔNG KHÁCH HÀNG" value={kpis?.totalCustomers?.toLocaleString() || 0} subtitle={`${kpis?.newCustomerCount || 0} KH MỚI TRONG KỲ`} color="#45aaf2" icon={<Users size={24} />} />
        <StatCard title="ACTIVE RATE" value={`${kpis?.activeRate?.toFixed(1) || 0}%`} subtitle={`Cần thêm ${kpis?.missingCustomers || 0} KH Active`} color={kpis?.activeRate < KPI_TARGETS.activeRate ? '#eb3b5a' : '#20bf6b'} icon={<Target size={24} />} />
        <StatCard title="REPEAT RATE" value={`${kpis?.repeatRate?.toFixed(1) || 0}%`} subtitle="Target: 35%" color={kpis?.repeatRate < KPI_TARGETS.repeatRate ? '#f7b731' : '#20bf6b'} icon={<RefreshCcw size={24} />} />
        <StatCard title="AOV" value={`${Math.round(kpis?.aov || 0).toLocaleString()} VND`} subtitle={`Số đơn hàng: ${kpis?.totalOrders || 0}`} color="#20bf6b" icon={<Receipt size={24} />} />
        <StatCard title="TIỀM NĂNG" value={`${(kpis?.potentialRev ? (kpis.potentialRev / 1000000000).toFixed(2) : 0)} tỷ`} subtitle="Dựa trên KH At-Risk & Lost" color="#a55eea" icon={<Zap size={24} />} />
      </div>

      <RFMWidget data={kpis?.rfm || []} activeRate={Number(kpis?.activeRate) || 0} totalCustomerIDs={kpis?.totalCustomers || 0} inactiveRevPotential={kpis?.potentialRev} />

      <div className="charts-grid-alt" style={{ marginTop: 30 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Biểu đồ Doanh thu</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={kpis?.trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f2f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={v => (v/1000000).toFixed(0) + 'M'} />
                <Tooltip />
                <Area type="monotone" dataKey="Total" stroke="#8854d0" strokeWidth={3} fill="#8854d020" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ marginBottom: 20 }}>Cơ cấu Kênh bán hàng</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={kpis?.channelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f2f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={v => (v/1000000000).toFixed(1) + 'B'} />
                <Tooltip />
                <Bar dataKey="revenue" radius={[5, 5, 0, 0]} barSize={40}>
                    {kpis?.channelData?.map((e, index) => <Cell key={index} fill={COLORS[index % 5]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 30 }}>
        <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cake size={20} color="#eb3b5a" /> Khách hàng sinh nhật tháng {new Date().getMonth() + 1}
        </h3>
        {kpis?.birthdays && kpis.birthdays?.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 15 }}>
            {kpis.birthdays.map((b) => (
              <div key={b.id} style={{ padding: 15, border: '1px solid #f1f2f6', borderRadius: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-medium)' }}>Sinh nhật: {b.dob}</div>
                <div style={{ fontSize: 12, color: 'var(--text-medium)' }}>Kênh: {b.channel || 'N/A'}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-medium)' }}>Không có khách hàng nào sinh nhật trong tháng này.</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="card stat-card-premium" style={{ borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ background: `${color}10`, color: color, padding: 15, borderRadius: 12 }}>{icon}</div>
      <div>
         <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-medium)', textTransform: 'uppercase' }}>{title}</div>
         <div style={{ fontSize: 20, fontWeight: 900, margin: '2px 0' }}>{value}</div>
         <div style={{ fontSize: 11, color: 'var(--text-medium)' }}>{subtitle}</div>
      </div>
    </div>
  );
}
