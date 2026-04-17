import React, { useMemo, useState } from 'react';
import { useCRMData } from '../context/CRMContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { Calendar, Cake } from 'lucide-react';
import './Dashboard.css';

const GENDER_COLORS = ['#ff7675', '#74b9ff', '#ffeaa7'];
const MEMBER_COLORS = ['#fdcb6e', '#0984e3', '#00b894', '#6c5ce7', '#fd79a8'];

export default function Dashboard() {
  const { customers, opportunities, loading, t } = useCRMData();
  const [filterType, setFilterType] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Parse DD/MM/YYYY → Date object
  const parseDDMMYYYY = (dateStr) => {
    if (!dateStr) return null;
    const p = String(dateStr).split('/');
    if (p.length === 3) {
      const d = new Date(`${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

  // ── (1) filteredOpps: lọc theo tùy chỉnh thời gian ──────────────────────
  const filteredOpps = useMemo(() => {
    return opportunities.filter(opp => {
      if (filterType === 'all') return true;
      const d = parseDDMMYYYY(opp.expCloseDate);
      if (!d) return false; // bỏ qua record không có ngày hợp lệ
      if (filterType === 'year') return d.getFullYear() === Number(selectedYear);
      if (filterType === 'custom') {
        const s = startDate ? new Date(startDate) : new Date('1970-01-01');
        const e = endDate ? new Date(endDate) : new Date('2100-01-01');
        e.setHours(23, 59, 59, 999);
        return d >= s && d <= e;
      }
      return true;
    });
  }, [opportunities, filterType, selectedYear, startDate, endDate]);

  const totalRevenue = useMemo(() => filteredOpps.reduce((sum, o) => sum + (o.revenue || 0), 0), [filteredOpps]);
  const averageOrder = filteredOpps.length > 0 ? Math.round(totalRevenue / filteredOpps.length) : 0;

  // ── (3) genderData: chạy theo số lượng thực tế từ tùy chỉnh thời gian ──
  const genderData = useMemo(() => {
    const counts = {};
    filteredOpps.forEach(opp => {
      let g = opp.gender || 'Khác';
      const norm = g.toLowerCase().trim();
      if (norm === 'female' || norm === 'nữ') g = 'Nữ';
      else if (norm === 'male' || norm === 'nam') g = 'Nam';
      else if (norm === 'unknown' || norm === '') g = 'Khác';
      else g = 'Khác';
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.keys(counts)
      .map(key => ({ name: key, value: counts[key] }))
      .filter(x => x.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredOpps]);

  // ── (4) memberData: giữ nguyên — tính từ TOÀN BỘ khách hàng ─────────────
  const memberData = useMemo(() => {
    const counts = {};
    customers.forEach(c => {
      const type = c['Thành viên'] || c['THÀNH VIÊN'] || 'NON';
      if (!type || type === 'NON' || type === '' ) return; // bỏ qua NON để chart gọn
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.keys(counts)
      .map(key => ({ name: key, value: counts[key] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [customers]);

  // ── (4) birthdayCustomers: giữ nguyên — tính tháng hiện tại động ─────────
  const birthdayCustomers = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    return customers.filter(c => {
      const bd = c['Ngày sinh'] || c['NGÀY SINH'] || '';
      if (!bd || bd === 'NON' || bd === '') return false;
      const parts = String(bd).split('/');
      // Định dạng DD/MM/YYYY → parts[1] là tháng
      if (parts.length >= 3) return parseInt(parts[1], 10) === currentMonth;
      return false;
    }).slice(0, 8);
  }, [customers]);

  // ── (2) revenueTrend: luôn đúng dữ liệu, tháng 0 doanh thu hiển thị 0 ───
  const revenueTrend = useMemo(() => {
    if (filterType === 'year') {
      // 12 tháng của năm đã chọn — tháng chưa phát sinh = 0
      const monthly = {};
      filteredOpps.forEach(opp => {
        const d = parseDDMMYYYY(opp.expCloseDate);
        if (d) {
          const m = d.getMonth() + 1;
          monthly[m] = (monthly[m] || 0) + opp.revenue;
        }
      });
      return Array.from({ length: 12 }, (_, i) => ({
        name: `T${i + 1}`,
        Total: Math.round((monthly[i + 1] || 0) / 1000000 * 100) / 100
      }));
    }

    if (filterType === 'custom') {
      // Xác định khoảng tháng từ startDate → endDate
      const s = startDate ? new Date(startDate) : null;
      const e = endDate ? new Date(endDate) : null;

      if (!s && !e) {
        // Không chọn ngày — hiển thị tất cả theo year-month
        return buildAllTimeChart(filteredOpps);
      }

      const rangeStart = s || new Date(filteredOpps.reduce((min, o) => {
        const d = parseDDMMYYYY(o.expCloseDate);
        return (d && d.getTime() < min) ? d.getTime() : min;
      }, Date.now()));
      const rangeEnd = e || new Date();

      // Xây dựng danh sách các tháng trong khoảng
      const months = [];
      const cur = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
      const stop = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);
      while (cur <= stop) {
        months.push({ year: cur.getFullYear(), month: cur.getMonth() + 1 });
        cur.setMonth(cur.getMonth() + 1);
      }

      // Tổng hợp doanh thu theo year-month key
      const monthly = {};
      filteredOpps.forEach(opp => {
        const d = parseDDMMYYYY(opp.expCloseDate);
        if (d) {
          const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
          monthly[key] = (monthly[key] || 0) + opp.revenue;
        }
      });

      // Label ngắn nếu chỉ trong 1 năm, dài hơn nếu nhiều năm
      const multiYear = months.some(m => m.year !== (months[0]?.year));
      return months.map(({ year, month }) => ({
        name: multiYear ? `T${month}/${String(year).slice(2)}` : `T${month}`,
        Total: Math.round((monthly[`${year}-${month}`] || 0) / 1000000 * 100) / 100
      }));
    }

    // filterType === 'all'
    return buildAllTimeChart(filteredOpps);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredOpps, filterType, selectedYear, startDate, endDate]);

  // Helper: tổng hợp doanh thu theo year-month cho toàn bộ dữ liệu
  function buildAllTimeChart(opps) {
    const monthly = {};
    opps.forEach(opp => {
      const d = parseDDMMYYYY(opp.expCloseDate);
      if (d) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthly[key] = (monthly[key] || 0) + opp.revenue;
      }
    });
    const keys = Object.keys(monthly).sort();
    if (keys.length === 0) return [];
    return keys.map(key => {
      const [year, month] = key.split('-');
      return {
        name: `T${parseInt(month)}/${String(year).slice(2)}`,
        Total: Math.round(monthly[key] / 1000000 * 100) / 100
      };
    });
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2 className="page-title">{t('dashboard')}</h2>
        <div className="breadcrumbs">
          <span>{t('home')}</span> &gt; <span className="active">{t('dashboard')}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', background: 'var(--panel-bg)', padding: '12px 24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} color="var(--primary-color)" />
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none' }}>
            <option value="all">{t('allTime')}</option>
            <option value="year">{t('byYear')}</option>
            <option value="custom">{t('custom')}</option>
          </select>
        </div>

        {filterType === 'year' && (
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none' }}>
            {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        )}

        {filterType === 'custom' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
            <span>{t('to')}</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }} />
          </div>
        )}

        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-medium)' }}>
          {t('filteringData')}: {filteredOpps.length} {t('orders')}
        </span>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard title={t('totalRevenue')} value={`${totalRevenue.toLocaleString()} VND`} change={t('updated')} isPositive={true} />
        <StatCard title={t('totalQuantity')} value={filteredOpps.length.toLocaleString()} change={t('new')} isPositive={true} />
        <StatCard title={t('numberOrders')} value={filteredOpps.length.toLocaleString()} change="" isPositive={true} />
        <StatCard title={t('averageOrder')} value={`${averageOrder.toLocaleString()} VND`} change="" isPositive={true} />
        <StatCard title={t('customerCount')} value={customers.length.toLocaleString()} change={t('totalUsers')} isPositive={true} />
      </div>

      {/* Charts */}
      <div className="charts-grid-alt">
        {/* (2) Biểu đồ xu hướng doanh thu — theo dữ liệu lọc, tháng 0 = 0 */}
        <div className="card chart-card main-chart">
          <h3>{t('revenueTrends')} ({t('millionsVND')})</h3>
          <div style={{ width: '100%', height: 250, marginTop: 10 }}>
            <ResponsiveContainer>
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`${v.toLocaleString()} ${t('millionsVND')}`, t('totalRevenue')]} />
                <Area type="monotone" dataKey="Total" stroke="#6c5ce7" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* (3) Phân bố giới tính — theo filteredOpps (tùy chỉnh thời gian) */}
        <div className="card chart-card side-chart">
          <h3>{t('customerGenesis')}</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [v, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* (4) Phân khúc thành viên — giữ nguyên từ toàn bộ customers */}
        <div className="card chart-card side-chart" style={{ gridColumn: '1 / span 1' }}>
          <h3>{t('memberSegments')}</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={memberData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#45aaf2" radius={[4, 4, 0, 0]} barSize={30}>
                  {memberData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MEMBER_COLORS[index % MEMBER_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* (4) Sinh nhật trong tháng — giữ nguyên, tháng hiện tại động */}
        <div className="card chart-card side-chart">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cake size={18} color="#eb3b5a" /> {t('birthdaysThisMonth')}
          </h3>
          <div className="birthday-list" style={{ marginTop: 16 }}>
            {birthdayCustomers.length === 0
              ? <p style={{ color: '#8395a7', fontSize: 13 }}>{t('noBirthdays')}</p>
              : null}
            {birthdayCustomers.map((c, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f2f6' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c['Tên KH'] || c['TÊN KH']}</div>
                  <div style={{ color: '#8395a7', fontSize: 12 }}>{c['SĐT']}</div>
                </div>
                <div style={{ fontWeight: 600, color: '#eb3b5a', fontSize: 13 }}>
                  {c['Ngày sinh'] || c['NGÀY SINH']}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isPositive }) {
  return (
    <div className="card stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value-row">
        <span className="stat-value">{value}</span>
        <span className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>{change}</span>
      </div>
    </div>
  );
}
