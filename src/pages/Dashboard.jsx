import React, { useMemo, useState, useEffect } from 'react';
import { useCRMData } from '../context/CRMContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Calendar, Cake, AlertTriangle, Target, ArrowRight, Zap, Users, Receipt, RefreshCcw, Landmark, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const GENDER_COLORS = ['#ff7675', '#74b9ff', '#ffeaa7'];
const MEMBER_COLORS = ['#8854d0', '#45aaf2', '#2bcbba', '#fed330', '#eb3b5a'];

import RFMWidget from '../components/dashboard/RFMWidget';

export default function Dashboard() {
  const { customers, opportunities, loading, t } = useCRMData();
  const [filterType, setFilterType] = useState('q1_2026'); // Default to Q1.2026

  // Mocked Business Health Metrics (Fixed based on Q1.2026 Report)
  const reportStats = {
     totalRevenueAllTime: 14343803983,
     totalRevenueQ1: 1531139500,
     totalCustomersReal: 4017,
     totalCustomersID: 3117,
     totalGroupIDs: 900,
     totalOrdersQ1: 3123,
     activeRate: 33.5,
     activeTarget: 50,
     repeatRate: 27.8,
     repeatTarget: 35,
     reactivatePotential: 2540000000,
     reactivateKHCount: 3042,
     birthdayCR: 12.1
  };

  // --- Campaign Data ---
  const activeCampaigns = [
    { name: 'PHITEN NHỚ BẠN', progress: 10, target: '1,392 KH', color: '#6366f1' },
    { name: 'VIP EXCLUSIVE', progress: 5, target: '71 KH', color: '#f59e0b' },
  ];

  // Logic for filtering (simplified for the new presets)
  // In a real app, this would filter 'opportunities' and 'customers'
  // For this sprint, we prioritize showing the specific Q1.2026 figures requested
  
  const currentStats = useMemo(() => {
    if (filterType === 'q1_2026') {
      return reportStats;
    }
    // Fallback to data-driven or other mocks
    return reportStats;
  }, [filterType]);

  const hasKPIAlert = currentStats.activeRate < currentStats.activeTarget || currentStats.repeatRate < currentStats.repeatTarget;

  // Chart Data calculation (Simplified to show trends)
  const revenueTrend = [
    { name: 'T1', Total: 457.4 },
    { name: 'T2', Total: 538.4 },
    { name: 'T3', Total: 535.3 },
  ];

  const memberData = [
    { name: 'VIP', value: 21 },
    { name: 'LOYAL', value: 1020 },
    { name: 'AT RISK', value: 518 },
    { name: 'LOST', value: 1552 },
  ];

  const birthdayCustomers = customers.slice(0, 5); // Just for UI display

  return (
    <div className="dashboard animate-fade-in">
      {/* Alert Banner when KPI is red */}
      {hasKPIAlert && (
        <div className="alert-banner" style={{ background: '#7f1d1d', border: '1px solid #991b1b', color: '#fca5a5', padding: '12px 24px', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(127,29,29,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Cảnh báo: 2 KPIs chủ chốt chưa đạt mục tiêu Q1 (Cần tập trung Win-back & Loyalty)</span>
          </div>
          <Link to="/sales/reports" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'white', fontWeight: 700, textDecoration: 'none' }}>
            XEM BÁO CÁO CHI TIẾT <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div className="page-header" style={{ marginBottom: 24 }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
               <h2 className="page-title">{t('dashboard')}</h2>
               <div className="breadcrumbs">
                 <span>{t('home')}</span> &gt; <span className="active">{t('dashboard')}</span>
               </div>
            </div>
            <div className="date-presets" style={{ display: 'flex', gap: 8 }}>
               {[
                 { id: 'this_month', label: 'Tháng này' },
                 { id: 'q1_2026', label: 'Q1.2026' },
                 { id: 'last_6m', label: '6 tháng gần nhất' },
                 { id: 'all', label: 'Toàn thời gian' }
               ].map(preset => (
                 <button 
                   key={preset.id}
                   onClick={() => setFilterType(preset.id)}
                   style={{
                     padding: '6px 16px',
                     borderRadius: '20px',
                     fontSize: '12px',
                     fontWeight: 700,
                     border: '1px solid var(--border-color)',
                     background: filterType === preset.id ? 'var(--primary-color)' : 'var(--panel-bg)',
                     color: filterType === preset.id ? 'white' : 'var(--text-medium)',
                     transition: 'all 0.2s'
                   }}
                 >
                   {preset.label}
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* 6 KPI CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Tổng Doanh Thu (Tích Lũy)" 
          value={`${currentStats.totalRevenueAllTime.toLocaleString()} VND`}
          subtitle={`Q1.2026: ${(currentStats.totalRevenueQ1/1000000000).toFixed(2)} tỷ`}
          color="#8854d0"
          icon={<Landmark size={24} />}
          updateInfo="Cập nhật đến 31/03/2026"
        />
        <StatCard 
          title="Tổng Khách Hàng" 
          value={currentStats.totalCustomersReal.toLocaleString()}
          subtitle={`${currentStats.totalCustomersID.toLocaleString()} ID + ${currentStats.totalGroupIDs} Group`}
          color="#45aaf2"
          icon={<Users size={24} />}
          tooltip="3,117 ID đăng ký + 900 Group ID ẩnd danh"
        />
        <StatCard 
          title="Tổng Đơn Hàng Q1" 
          value={currentStats.totalOrdersQ1.toLocaleString()}
          subtitle="Giao dịch thực tế Q1"
          color="#20bf6b"
          icon={<Receipt size={24} />}
        />
        <StatCard 
          title="Active Rate" 
          value={`${currentStats.activeRate}%`}
          subtitle={`Mục tiêu: ${currentStats.activeTarget}%`}
          badge={`Dưới target -${(currentStats.activeTarget - currentStats.activeRate).toFixed(1)}%`}
          badgeColor="red"
          color="#eb3b5a"
          icon={<Target size={24} />}
        />
        <StatCard 
          title="Repeat Rate" 
          value={`${currentStats.repeatRate}%`}
          subtitle={`Mục tiêu: ${currentStats.repeatTarget}%`}
          badge={`Dưới target -${(currentStats.repeatTarget - currentStats.repeatRate).toFixed(1)}%`}
          badgeColor="orange"
          color="#f7b731"
          icon={<RefreshCcw size={24} />}
        />
        <StatCard 
          title="Tiềm Năng Reactivate" 
          value={`${(currentStats.reactivatePotential/1000000000).toFixed(2)} tỷ VND`}
          subtitle={`${currentStats.reactivateKHCount.toLocaleString()} KH cần win-back`}
          badge="CƠ HỘI"
          badgeColor="purple"
          color="#a55eea"
          icon={<Zap size={24} />}
        />
      </div>

      <RFMWidget />

      {/* Analytics Rows */}
      <div className="charts-grid-alt">
        {/* Revenue Trend Area Chart */}
        <div className="card chart-card main-chart">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
             <h3 style={{ margin: 0 }}>Xu hướng Doanh thu (Triệu VND)</h3>
             <span style={{ fontSize: '11px', color: 'var(--text-medium)' }}>Dữ liệu Q1.2026</span>
          </div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8854d0" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8854d0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f2f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8395a7' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8395a7' }} />
                <Tooltip 
                  contentStyle={{ background: '#fff', border: '1px solid #f1f2f6', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Area type="monotone" dataKey="Total" stroke="#8854d0" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Widget */}
        <div className="card" style={{ padding: '24px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="#eb3b5a" fill="#eb3b5a30" /> Campaign Focus
              </h3>
              <Link to="/sales/reports" style={{ fontSize: '11px', color: 'var(--primary-color)', fontWeight: 700 }}>BÁO CÁO</Link>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {activeCampaigns.map((camp, idx) => (
                <div key={idx}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)' }}>{camp.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-medium)', fontWeight: 600 }}>{camp.target}</span>
                   </div>
                   <div style={{ height: '8px', width: '100%', backgroundColor: '#f1f2f6', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${camp.progress}%`, backgroundColor: camp.color, borderRadius: '4px' }} />
                   </div>
                </div>
              ))}
              <div style={{ marginTop: '8px', padding: '16px', backgroundColor: 'var(--primary-color)05', borderRadius: '12px', border: '1px dashed var(--primary-color)30' }}>
                 <div style={{ fontSize: '11px', color: 'var(--primary-color)', fontWeight: 700, marginBottom: '4px' }}>TIỀM NĂNG Q2</div>
                 <div style={{ fontSize: '13px', fontWeight: 600 }}>Tăng trưởng 15% Doanh thu qua Win-back KH cũ</div>
              </div>
           </div>
        </div>

        {/* Segment Distribution */}
        <div className="card chart-card side-chart">
          <h3>Phân bổ Phân khúc KH</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={memberData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f2f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8395a7' }} axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8395a7' }} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#8854d0" radius={[6, 6, 0, 0]} barSize={34}>
                  {memberData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MEMBER_COLORS[index % MEMBER_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Birthday Widget */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
             <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
               <Cake size={18} color="#eb3b5a" /> Khách hàng sinh nhật
             </h3>
             <div style={{ fontSize: '10px', fontWeight: 800, color: '#eb3b5a', background: '#eb3b5a10', padding: '2px 8px', borderRadius: '6px' }}>
               THÁNG 4
             </div>
          </div>
          <div className="birthday-list">
            {birthdayCustomers.slice(0, 4).map((c, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f2f6' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-dark)' }}>{c['Tên KH'] || 'Khách hàng'}</div>
                  <div style={{ color: 'var(--text-medium)', fontSize: '11px' }}>{c['SĐT'] || 'N/A'}</div>
                </div>
                <div style={{ fontWeight: 700, color: '#eb3b5a', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                   {c['Ngày sinh']?.split('/')[0]}/{c['Ngày sinh']?.split('/')[1]}
                </div>
              </div>
            ))}
            <button style={{ width: '100%', marginTop: '16px', padding: '10px', backgroundColor: 'transparent', border: '1px solid #f1f2f6', borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-medium)', cursor: 'pointer', transition: 'all 0.2s' }}>
              XEM TẤT CẢ DANH SÁCH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color, badge, badgeColor, updateInfo, tooltip }) {
  return (
    <div className="card stat-card-premium" style={{ borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
         <div className="stat-icon-wrapper" style={{ backgroundColor: `${color}15`, color: color }}>
            {icon}
         </div>
         {badge && (
           <span className={`badge-pill ${badgeColor}`}>
              {badge}
           </span>
         )}
      </div>
      
      <div style={{ marginTop: '16px' }}>
         <div className="stat-label-row" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '12px', color: 'var(--text-medium)', fontWeight: 600, textTransform: 'uppercase' }}>{title}</span>
            {tooltip && (
              <div className="tooltip-container" title={tooltip}>
                 <Info size={12} color="#8395a7" />
              </div>
            )}
         </div>
         <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)', margin: '4px 0', letterSpacing: '-0.5px' }}>{value}</div>
         <div style={{ fontSize: '12px', color: 'var(--text-medium)', fontWeight: 500 }}>{subtitle}</div>
      </div>

      {updateInfo && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f2f6', fontSize: '10px', color: '#8395a7', fontStyle: 'italic' }}>
           {updateInfo}
        </div>
      )}
    </div>
  );
}
