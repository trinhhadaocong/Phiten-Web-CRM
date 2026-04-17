import { Calendar, Cake, AlertTriangle, LayoutGrid, Target, ArrowRight, Zap, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const GENDER_COLORS = ['#ff7675', '#74b9ff', '#ffeaa7'];
const MEMBER_COLORS = ['#fdcb6e', '#0984e3', '#00b894', '#6c5ce7', '#fd79a8'];

export default function Dashboard() {
  const { customers, opportunities, loading, t } = useCRMData();
  const [filterType, setFilterType] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Mocked Business Health Metrics (Based on Q1 Report)
  const activeRate = 33.5;
  const repeatRate = 27.8;
  const birthdayCR = 12.1;

  // --- KPI Alert Logic ---
  const hasKPIAlert = activeRate < 50 || repeatRate < 35;

  // --- Campaign Data ---
  const activeCampaigns = [
    { name: 'PHITEN NHỚ BẠN', progress: 10, target: '1,392 KH', color: '#6366f1' },
    { name: 'VIP EXCLUSIVE', progress: 5, target: '71 KH', color: '#f59e0b' },
  ];

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
    <div className="dashboard animate-fade-in">
      {/* (1) Alert Banner when KPI is red */}
      {hasKPIAlert && (
        <div className="alert-banner" style={{ background: '#7f1d1d', border: '1px solid #991b1b', color: '#fca5a5', padding: '12px 24px', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(127,29,29,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Cảnh báo: 3 KPIs chưa đạt target Q1 (Active: {activeRate}%, Repeat: {repeatRate}%)</span>
          </div>
          <Link to="/sales/reports" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'white', fontWeight: 700, textDecoration: 'none' }}>
            XEM BÁO CÁO CHI TIẾT <ArrowRight size={14} />
          </Link>
        </div>
      )}

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

      {/* Stats - ROW 1 */}
      <div className="stats-grid">
        <StatCard title={t('totalRevenue')} value={`${totalRevenue.toLocaleString()} VND`} change={t('updated')} isPositive={true} />
        <StatCard title={t('totalQuantity')} value={filteredOpps.length.toLocaleString()} change={t('new')} isPositive={true} />
        <StatCard title={t('numberOrders')} value={filteredOpps.length.toLocaleString()} change="" isPositive={true} />
        <StatCard title={t('averageOrder')} value={`${averageOrder.toLocaleString()} VND`} change="" isPositive={true} />
      </div>

      {/* Stats - ROW 2: Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
         <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: 'var(--text-medium)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Active Rate</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ fontSize: '24px', fontWeights: 800, color: activeRate < 50 ? '#ef4444' : '#10b981' }}>{activeRate}%</div>
               <div style={{ height: '6px', flex: 1, backgroundColor: '#1e293b', borderRadius: '3px' }}>
                  <div style={{ height: '100%', width: `${activeRate}%`, backgroundColor: activeRate < 50 ? '#ef4444' : '#10b981', borderRadius: '3px' }} />
               </div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-medium)', marginTop: '8px' }}>Mục tiêu Q1: ≥ 50%</div>
         </div>
         <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: 'var(--text-medium)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Repeat rate</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ fontSize: '24px', fontWeights: 800, color: repeatRate < 35 ? '#ef4444' : '#10b981' }}>{repeatRate}%</div>
               <div style={{ height: '6px', flex: 1, backgroundColor: '#1e293b', borderRadius: '3px' }}>
                  <div style={{ height: '100%', width: `${repeatRate}%`, backgroundColor: repeatRate < 35 ? '#ef4444' : '#10b981', borderRadius: '3px' }} />
               </div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-medium)', marginTop: '8px' }}>Mục tiêu Q1: ≥ 35%</div>
         </div>
         <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: 'var(--text-medium)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Birthday Conv. Rate</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ fontSize: '24px', fontWeights: 800, color: '#f59e0b' }}>{birthdayCR}%</div>
               <div style={{ height: '6px', flex: 1, backgroundColor: '#1e293b', borderRadius: '3px' }}>
                  <div style={{ height: '100%', width: `${birthdayCR}%`, backgroundColor: '#f59e0b', borderRadius: '3px' }} />
               </div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-medium)', marginTop: '8px' }}>Mục tiêu Q1: ≥ 15%</div>
         </div>
      </div>

      {/* Charts */}
      <div className="charts-grid-alt">
        {/* (2) Biểu đồ xu hướng doanh thu */}
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

        {/* Campaign Status Widget */}
        <div className="card" style={{ padding: '24px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="#6366f1" /> Campaign T4
              </h3>
              <Link to="/sales/reports" style={{ fontSize: '11px', color: '#6366f1', fontWeight: 700 }}>XEM TẤT CẢ</Link>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {activeCampaigns.map((camp, idx) => (
                <div key={idx}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{camp.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-medium)' }}>Target: {camp.target}</span>
                   </div>
                   <div style={{ height: '6px', width: '100%', backgroundColor: '#1e293b', borderRadius: '3px', position: 'relative' }}>
                      <div style={{ height: '100%', width: `${camp.progress}%`, backgroundColor: camp.color, borderRadius: '3px', boxShadow: `0 0 8px ${camp.color}66` }} />
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span style={{ fontSize: '10px', color: camp.color }}>Launch Ready</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>{camp.progress}% Progress</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Member Segments Dashboard View */}
        <div className="card chart-card side-chart">
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

        {/* Improved Birthday Widget */}
        <div className="card chart-card side-chart">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
             <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
               <Cake size={18} color="#eb3b5a" /> {t('birthdaysThisMonth')}
             </h3>
             <div style={{ fontSize: '10px', fontWeight: 800, color: '#f59e0b', background: '#f59e0b15', padding: '2px 8px', borderRadius: '10px', border: '1px solid #f59e0b30' }}>
               CR: {birthdayCR}%
             </div>
          </div>
          <div className="birthday-list">
            {birthdayCustomers.length === 0
              ? <p style={{ color: '#8395a7', fontSize: 13 }}>{t('noBirthdays')}</p>
              : null}
            {birthdayCustomers.map((c, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'white' }}>{c['Tên KH'] || c['TÊN KH']}</div>
                  <div style={{ color: 'var(--text-medium)', fontSize: 12 }}>{c['SĐT']}</div>
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

