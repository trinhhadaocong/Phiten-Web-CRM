import React, { useMemo, useRef } from 'react';
import { useCRMData } from '../context/CRMContext';
import { DownloadCloud, UploadCloud, ArrowUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './ReportAnalysis.css';

export default function ReportAnalysis() {
  const { customers, opportunities, importData, exportData, t } = useCRMData();
  const fileRef = useRef(null);

  const totalSales = opportunities.reduce((sum, o) => sum + (Number(o.revenue) || 0), 0);
  const totalQuantity = opportunities.length;
  const averageSales = totalQuantity ? totalSales / totalQuantity : 0;

  const reportData = useMemo(() => {
    const months = {};
    opportunities.forEach(o => {
      // Dùng lastPurchaseDate (gần nhất) cho biểu đồ xu hướng, fallback expCloseDate (đầu tiên)
      const dateStr = o.lastPurchaseDate || o.expCloseDate;
      if (!dateStr) return;
      const parts = dateStr.split('/');
      if (parts.length >= 2) {
        const m = `${parts[1]}/${parts[2] ? parts[2].slice(-2) : '26'}`.replace(/^0+/, '');
        if (!months[m]) months[m] = { revenue: 0, volume: 0 };
        months[m].revenue += (Number(o.revenue) || 0) / 1000000;
        months[m].volume += 1;
      }
    });
    return Object.keys(months).map(k => ({
      name: k,
      revenue: Math.round(months[k].revenue),
      volume: months[k].volume
    })).sort((a, b) => {
      const [am, ay] = a.name.split('/');
      const [bm, by] = b.name.split('/');
      return new Date(`20${ay}-${am}-01`).getTime() - new Date(`20${by}-${bm}-01`).getTime();
    });
  }, [opportunities]);

  const analysisData = useMemo(() => {
    const counts = {};
    opportunities.forEach(o => { counts[o.id] = (counts[o.id] || 0) + 1; });
    let repeated = 0, oneTime = 0, zero = 0;
    customers.forEach(c => {
      const oc = counts[c['M\u00e3 KH']] || 0;
      if (oc > 1) repeated++;
      else if (oc === 1) oneTime++;
      else zero++;
    });
    const total = customers.length || 1;
    return [
      { name: 'Repeat', value: Number(((repeated / total) * 100).toFixed(1)), count: repeated, fill: '#2ed573' },
      { name: 'One-time', value: Number(((oneTime / total) * 100).toFixed(1)), count: oneTime, fill: '#1dd1a1' },
      { name: 'Non-purchasing', value: Number(((zero / total) * 100).toFixed(1)), count: zero, fill: '#01a3a4' }
    ];
  }, [customers, opportunities]);

  const importReport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const custSheet = wb.Sheets['Customers'] || wb.Sheets[wb.SheetNames[0]];
      importData(XLSX.utils.sheet_to_json(custSheet));
      e.target.value = '';
    } catch (err) {
      alert('Error reading file.');
    }
  };

  const newCustomersCount = customers.filter(c => {
    if (!c['Ng\u00e0y Th\u00e0nh Vi\u00ean']) return false;
    const currentMonth = new Date().getMonth() + 1;
    return String(c['Ng\u00e0y Th\u00e0nh Vi\u00ean']).includes(`/${currentMonth < 10 ? '0' + currentMonth : currentMonth}/`);
  }).length;

  return (
    <div className="report-analysis">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2 className="page-title">{t('sales')}</h2>
          <div className="breadcrumbs">
            <span>{t('home')}</span> &gt; <span>{t('sales')}</span> &gt; <span className="active">{t('reportsAnalysis')}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <input type="file" ref={fileRef} accept=".xlsx,.xls" style={{ display: 'none' }} onChange={importReport} />
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}><UploadCloud size={16} /> {t('importFullData')}</button>
          <button className="btn-primary" onClick={exportData}><DownloadCloud size={16} /> {t('exportFullData')}</button>
        </div>
      </div>

      <div className="report-grid-top">
        <div className="metrics-column">
          <div className="metric-box">
            <div className="metric-title">{t('totalSalesPipeline')}</div>
            <div className="metric-val">{totalSales.toLocaleString()} VND</div>
            <div className="metric-change pos">1.93%</div>
          </div>
          <div className="metric-box">
            <div className="metric-title">{t('totalSaleOpps')}</div>
            <div className="metric-val">{totalQuantity.toLocaleString()} ({t('units')})</div>
            <div className="metric-change pos">+0.62%</div>
          </div>
          <div className="metric-box">
            <div className="metric-title">{t('avgSalesPerDeal')}</div>
            <div className="metric-val">{averageSales.toLocaleString(undefined, { maximumFractionDigits: 0 })} VND</div>
            <div className="metric-change pos">1.93%</div>
          </div>
        </div>

        <div className="card trend-card">
          <h3>{t('salesTrend')}</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer>
              <ComposedChart data={reportData.length > 0 ? reportData : [{ name: 'No Data', revenue: 0, volume: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="volume" fill="#20bf6b" radius={[4, 4, 0, 0]} barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#6c5ce7" strokeWidth={3} dot={true} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>{t('customerAnalysis')}</h3>
        <div className="customer-analysis-breakdown">
          <div className="analysis-chart-mini">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={[{ name: 'Online', value: 70 }, { name: 'Retail', value: 30 }]} innerRadius={50} outerRadius={80} fill="#6c5ce7" dataKey="value">
                  <Cell fill="#a55eea" /><Cell fill="#6c5ce7" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="analysis-stats">
            <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
              <div className="stat-sm">
                <div className="lbl">{t('totalCustomers')}</div>
                <div className="val">{customers.length} <span className="pos"><ArrowUp size={12} /> 1.2%</span></div>
              </div>
              <div className="stat-sm">
                <div className="lbl">{t('newCustomersMonth')}</div>
                <div className="val">{newCustomersCount || 0} <span className="pos"><ArrowUp size={12} /> 0.4%</span></div>
              </div>
            </div>
            <div className="stacked-bar-horiz">
              {analysisData.map((d, i) => (
                <div key={i} style={{ width: `${d.value}%`, backgroundColor: d.fill }} className="stack-segment">{d.value}%</div>
              ))}
            </div>
            <div className="stack-legends">
              {analysisData.map(d => (
                <span key={d.name}><span className="dot" style={{ background: d.fill }}></span>{d.name} ({d.count} accounts)</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
