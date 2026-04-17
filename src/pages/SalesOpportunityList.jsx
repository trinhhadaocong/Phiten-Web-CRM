import React, { useState, useMemo, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { useCRMData } from '../context/CRMContext';
import './SalesCustomerList.css';
import { Filter, DownloadCloud, Plus, X } from 'lucide-react';
import * as XLSX from 'xlsx';

// ── Stage badge colours ────────────────────────────────────────────────────
const STAGE_COLORS = {
  'Closed Won': { bg: 'rgba(32,191,107,0.12)', color: '#20bf6b' },
  'Ask Price':  { bg: 'rgba(116,185,255,0.15)', color: '#0984e3' },
  'Potential':  { bg: 'rgba(253,203,110,0.2)',  color: '#e67e22' },
  'Won':        { bg: 'rgba(0,184,148,0.15)',   color: '#00b894' },
  'Lost':       { bg: 'rgba(231,76,60,0.12)',   color: '#e74c3c' },
};
const stageStyle = (s) => STAGE_COLORS[s] || { bg: 'rgba(99,110,114,0.1)', color: '#636e72' };

// ── Add Opportunity Modal ──────────────────────────────────────────────────
const AddOpportunityModal = memo(({ onClose, onSave, t }) => {
  // Track modal renders
  console.log("%c[Modal] AddOpportunityModal Rendered", "color: #3498db; font-weight: bold;");

  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState({});
  const formRef = useRef({});

  const setRef = (field) => (el) => { if (el) formRef.current[field] = el; };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = {
      'Tên cơ hội': formRef.current['Tên cơ hội']?.value || '',
      'Mã KH': formRef.current['Mã KH']?.value || '',
      'Giá trị dự kiến': formRef.current['Giá trị dự kiến']?.value || '',
      'Giai đoạn': formRef.current['Giai đoạn']?.value || 'Ask Price',
      'Ngày mua hàng đầu tiên': formRef.current['Ngày mua hàng đầu tiên']?.value || '',
      'Ngày mua hàng gần nhất': formRef.current['Ngày mua hàng gần nhất']?.value || '',
      'Người phụ trách': formRef.current['Người phụ trách']?.value || 'Dương Hoàng Như Bình',
    };

    const e_msgs = {};
    if (!data['Tên cơ hội'].trim()) e_msgs['Tên cơ hội'] = t('validationOppName');
    if (!data['Giá trị dự kiến'] || Number(data['Giá trị dự kiến']) <= 0)
      e_msgs['Giá trị dự kiến'] = t('validationRevenue');
    
    if (Object.keys(e_msgs).length > 0) {
      setErrors(e_msgs);
      setActiveTab('basic'); 
      return;
    }

    const newId = data['Mã KH'].trim() || `KH${Math.floor(Math.random() * 90000) + 10000}`;
    const firstDate  = data['Ngày mua hàng đầu tiên'];
    const latestDate = data['Ngày mua hàng gần nhất'] || firstDate;
    
    onSave({
      id: newId,
      name: data['Tên cơ hội'],
      revenue: Number(data['Giá trị dự kiến']),
      status: data['Giai đoạn'],
      expCloseDate: firstDate,
      lastPurchaseDate: latestDate,
      owner: data['Người phụ trách'],
      gender: '',
    });
  };

  const tabBtnStyle = (tab) => ({
    padding: '8px 20px', border: 'none', background: 'none', cursor: 'pointer',
    fontFamily: 'inherit', fontSize: '14px',
    fontWeight: activeTab === tab ? 700 : 400,
    color: activeTab === tab ? 'var(--primary-color)' : '#636e72',
    borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : '2px solid transparent',
    transition: 'all 0.2s',
  });

  return createPortal(
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ width: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
            ➕ {t('addNewOpportunity')}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#636e72' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #dfe6e9', marginBottom: '24px' }}>
          <button type="button" style={tabBtnStyle('basic')} onClick={() => setActiveTab('basic')}>{t('basicInfo')}</button>
          <button type="button" style={tabBtnStyle('advanced')} onClick={() => setActiveTab('advanced')}>{t('transaction')}</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {activeTab === 'basic' && (
            <div>
              <div className="form-group">
                <label>{t('oppNameLabel')} <span style={{ color: '#e74c3c' }}>*</span></label>
                <input type="text"
                  placeholder={t('oppNamePlaceholder')}
                  ref={setRef('Tên cơ hội')}
                  onKeyDown={() => console.log('Render prevented - Key pressed')}
                  style={{ borderColor: errors['Tên cơ hội'] ? '#e74c3c' : '' }} />
                {errors['Tên cơ hội'] && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors['Tên cơ hội']}</span>}
              </div>

              <div className="form-group">
                <label>{t('customerIdLabel')}</label>
                <input type="text"
                  placeholder={t('customerIdPlaceholder')}
                  ref={setRef('Mã KH')}
                  onKeyDown={() => console.log('Render prevented - Key pressed')} />
              </div>

              <div className="form-group">
                <label>{t('expectedRevenueLabel')} <span style={{ color: '#e74c3c' }}>*</span></label>
                <input type="number" min="0"
                  placeholder={t('revenuePlaceholder')}
                  ref={setRef('Giá trị dự kiến')}
                  onKeyDown={() => console.log('Render prevented - Key pressed')}
                  style={{ borderColor: errors['Giá trị dự kiến'] ? '#e74c3c' : '' }} />
                {errors['Giá trị dự kiến'] && <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors['Giá trị dự kiến']}</span>}
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div>
              <div className="form-group">
                <label>{t('stageLabel')}</label>
                <select defaultValue="Ask Price" ref={setRef('Giai đoạn')}>
                  <option value="Ask Price">Ask Price</option>
                  <option value="Potential">Potential</option>
                  <option value="Won">Won</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ngày mua hàng đầu tiên (DD/MM/YYYY)</label>
                <input type="text"
                  placeholder="Ví dụ: 15/04/2026"
                  ref={setRef('Ngày mua hàng đầu tiên')}
                  onKeyDown={() => console.log('Render prevented - Key pressed')} />
              </div>

              <div className="form-group">
                <label>Ngày mua hàng gần nhất (DD/MM/YYYY)</label>
                <input type="text"
                  placeholder="Ví dụ: 15/04/2026 (để trống = dùng ngày đầu tiên)"
                  ref={setRef('Ngày mua hàng gần nhất')}
                  onKeyDown={() => console.log('Render prevented - Key pressed')} />
              </div>

              <div className="form-group">
                <label>{t('assigneeLabel')}</label>
                <select defaultValue="Dương Hoàng Như Bình" ref={setRef('Người phụ trách')}>
                  <option>Dương Hoàng Như Bình</option>
                  <option>Nguyễn Trần Hữu Tuệ</option>
                  <option>Nguyễn Thị Quế Trân</option>
                  <option>Từ Gia Bảo</option>
                  <option>Võ Ngọc Thiên Ân</option>
                  <option>Bùi Hữu Bảo</option>
                </select>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn-primary">
              {t('saveOpportunity')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
});

// ── Main component ─────────────────────────────────────────────────────────
export default function SalesOpportunityList() {
  // Track page renders
  console.log("%c[Page] SalesOpportunityList Rendered", "color: #2ecc71; font-weight: bold;");
  const { opportunities, globalSearch, addOpportunity, t } = useCRMData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [stageFilter, setStageFilter] = useState('all');

  // Stage options từ data thực tế
  const stageOptions = useMemo(() => {
    const set = new Set(opportunities.map(o => o.status).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [opportunities]);

  // Lọc: search + stage — safe String() cast phòng tránh TypeError
  const filteredOpps = useMemo(() => {
    const q = String(globalSearch || '').toLowerCase();
    return opportunities.filter(o => {
      const nameMatch = String(o.name || '').toLowerCase().includes(q) ||
                        String(o.id   || '').toLowerCase().includes(q);
      const stageMatch = stageFilter === 'all' || o.status === stageFilter;
      return nameMatch && stageMatch;
    });
  }, [opportunities, globalSearch, stageFilter]);

  const totalRevenue = useMemo(
    () => filteredOpps.reduce((s, o) => s + (o.revenue || 0), 0),
    [filteredOpps]
  );

  const exportOpportunitiesData = () => {
    const rows = filteredOpps.map(o => ({
      'Mã KH': o.id,
      'Tên KH': o.name,
      'Doanh thu': o.revenue,
      'Giai đoạn': o.status,
      'Ngày mua hàng đầu tiên': o.expCloseDate,
      'Ngày mua hàng gần nhất': o.lastPurchaseDate,
      'Người phụ trách': o.owner,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Opportunities');
    XLSX.writeFile(wb, 'Opportunities_Data.xlsx');
  };

  const handleSave = (newOpp) => {
    addOpportunity(newOpp);
    setShowAddModal(false);
  };

  return (
    <div className="sales-customers">
      <div className="page-header">
        <h2 className="page-title">{t('sales')}</h2>
        <div className="breadcrumbs">
          <span>{t('home')}</span> &gt; <span>{t('sales')}</span> &gt; <span className="active">{t('opportunities')}</span>
        </div>
      </div>

      <div className="toolbar">
        <div className="filters">
          <select
            className="filter-select"
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
          >
            {stageOptions.map(s => (
              <option key={s} value={s}>{s === 'all' ? t('stageAll') : s}</option>
            ))}
          </select>
          <Filter size={18} style={{ color: 'var(--text-medium)', marginLeft: 4 }} />
        </div>
        <div className="actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-medium)' }}>
            {filteredOpps.length} {t('items')} — {totalRevenue.toLocaleString()} VND
          </span>
          <button className="btn-secondary" onClick={exportOpportunitiesData}>
            <DownloadCloud size={16} /> {t('bulkExport')}
          </button>
          <button id="add-opportunity-btn" className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> {t('addOpportunity')}
          </button>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" /></th>
                <th>Mã KH</th>
                <th>{t('custName')}</th>
                <th style={{ textAlign: 'right' }}>{t('expectedRevenue')}</th>
                <th>{t('stage')}</th>
                <th>Ngày mua đầu tiên</th>
                <th>Ngày mua gần nhất</th>
                <th>{t('assignee')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOpps.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#8395a7' }}>
                    {t('noResults')}
                  </td>
                </tr>
              ) : (
                filteredOpps.map((o, idx) => {
                  const sc = stageStyle(o.status);
                  return (
                    <tr key={idx}>
                      <td><input type="checkbox" /></td>
                      <td style={{ fontSize: 12, color: '#636e72' }}>{o.id}</td>
                      <td style={{ fontWeight: 600, color: '#1e272e' }}>{String(o.name || '—')}</td>
                      <td style={{ textAlign: 'right', color: '#20bf6b', fontWeight: 600 }}>
                        {(o.revenue || 0).toLocaleString()} VND
                      </td>
                      <td>
                        <span className="status-badge" style={{ background: sc.bg, color: sc.color }}>
                          {o.status || '—'}
                        </span>
                      </td>
                      <td style={{ fontSize: 13 }}>{o.expCloseDate || '—'}</td>
                      <td style={{ fontSize: 13 }}>{o.lastPurchaseDate || '—'}</td>
                      <td style={{ fontSize: 13 }}>{o.owner || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <AddOpportunityModal onClose={() => setShowAddModal(false)} onSave={handleSave} t={t} />
      )}
    </div>
  );
}
