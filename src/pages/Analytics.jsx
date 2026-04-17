import React, { useMemo } from 'react';
import { useCRMData } from '../context/CRMContext';
import { calculateRFM } from '../utils/rfmCalculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a55eea'];
const SEGMENT_COLORS = { 'VIP': '#ff4757', 'Loyal': '#ffa502', 'At Risk': '#eccc68', 'Lost': '#747d8c', 'New/Promising': '#1e90ff' };

export default function Analytics() {
  const { opportunities, customers, t } = useCRMData();

  const rfmData = useMemo(() => calculateRFM(opportunities), [opportunities]);

  const segmentStats = useMemo(() => {
    const counts = {};
    rfmData.forEach(item => { counts[item.segment] = (counts[item.segment] || 0) + 1; });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [rfmData]);

  const bucketStats = useMemo(() => {
    const counts = {};
    rfmData.forEach(item => { counts[item.revBucket] = (counts[item.revBucket] || 0) + 1; });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [rfmData]);

  const forecastData = useMemo(() => {
    const today = new Date();
    let m1 = 0, m2 = 0, m3 = 0;
    opportunities.forEach(opp => {
      if (opp.revenue > 0) {
        // Dùng lastPurchaseDate (gần nhất) để xác định tháng, fallback expCloseDate
        const dateStr = opp.lastPurchaseDate || opp.expCloseDate;
        if (!dateStr) return;
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const oppDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          if (isNaN(oppDate.getTime())) return;
          const dMonth = (today.getFullYear() - oppDate.getFullYear()) * 12 + (today.getMonth() - oppDate.getMonth());
          if (dMonth === 0) m1 += opp.revenue;
          if (dMonth === 1) m2 += opp.revenue;
          if (dMonth === 2) m3 += opp.revenue;
        }
      }
    });
    const avgChange = ((m1 - m2) + (m2 - m3)) / 2;
    const mLabels = [];
    for (let i = 1; i <= 3; i++) {
      let nDt = new Date();
      nDt.setMonth(today.getMonth() + i);
      mLabels.push(nDt.toLocaleString('default', { month: 'short' }));
    }
    return [
      { name: mLabels[0], forecast: Math.max(0, m1 + avgChange) },
      { name: mLabels[1], forecast: Math.max(0, m1 + avgChange * 2) },
      { name: mLabels[2], forecast: Math.max(0, m1 + avgChange * 3) }
    ];
  }, [opportunities]);

  const top10Customers = useMemo(() => {
    return rfmData.map(c => {
      const cr = customers.find(x => x['M\u00e3 KH'] === c.id);
      return { id: c.id, name: cr ? cr['T\u00ean KH'] : 'Unknown', revenue: c.m };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [rfmData, customers]);

  const topChannels = useMemo(() => {
    const ch = {};
    opportunities.forEach(opp => {
      const cr = customers.find(x => x['M\u00e3 KH'] === opp.id);
      const chan = cr ? cr['Channel'] : 'Unknown';
      if (chan) ch[chan] = (ch[chan] || 0) + (opp.revenue || 0);
    });
    return Object.keys(ch).map(k => ({ channel: k, revenue: ch[k] })).sort((a, b) => b.revenue - a.revenue);
  }, [opportunities, customers]);

  return (
    <div className="report-analysis">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2 className="page-title">{t('analytics')}</h2>
          <div className="breadcrumbs">
            <span>{t('home')}</span> &gt; <span className="active">{t('aiAnalyticsCenter')}</span>
          </div>
        </div>
      </div>

      {/* RFM Analysis */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 16 }}>
          {t('rfmTitle')}
        </h3>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 40%', minWidth: 350 }}>
            <h4>{t('segmentDistribution')}</h4>
            <div style={{ width: '100%', height: 300, marginTop: 16 }}>
              <ResponsiveContainer>
                <BarChart data={segmentStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {segmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SEGMENT_COLORS[entry.name] || '#ccc'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ flex: '1 1 40%', minWidth: 350 }}>
            <h4>{t('revenueBucket')}</h4>
            <div style={{ width: '100%', height: 300, marginTop: 16 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={bucketStats} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={entry => entry.name}>
                    {bucketStats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast + Top Channels */}
      <div className="report-grid-top">
        <div className="card" style={{ flex: 2 }}>
          <h3>{t('salesForecast')}</h3>
          <div style={{ height: 280, marginTop: 16 }}>
            <ResponsiveContainer>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => `${value.toLocaleString()} VND`} />
                <Line type="monotone" dataKey="forecast" stroke="#2ed573" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ flex: 1, overflowY: 'auto', maxHeight: 370 }}>
          <h3><TrendingUp size={18} style={{ marginRight: 8, verticalAlign: 'sub' }} /> {t('topROIChannels')}</h3>
          <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
            <tbody>
              {topChannels.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f2f6' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>{c.channel}</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', color: 'var(--primary-color)' }}>
                    {c.revenue.toLocaleString()} VND
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 10 Customers */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3><Users size={18} style={{ marginRight: 8, verticalAlign: 'sub' }} /> {t('top10KeyCustomers')}</h3>
        <div className="table-container" style={{ marginTop: 16 }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 60 }}>{t('rank')}</th>
                <th>ID</th>
                <th>{t('custName')}</th>
                <th style={{ textAlign: 'right' }}>{t('totalMonetary')}</th>
              </tr>
            </thead>
            <tbody>
              {top10Customers.map((c, i) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 'bold', color: i < 3 ? 'var(--accent-orange)' : 'inherit' }}>#{i + 1}</td>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary-color)' }}>
                    {c.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
