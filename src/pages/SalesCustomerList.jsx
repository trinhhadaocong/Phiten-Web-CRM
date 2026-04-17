import React, { useState, useMemo, useRef, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { useCRMData } from '../context/CRMContext';
import { Filter, DownloadCloud, UploadCloud, Plus, Edit2, Trash2, X, ExternalLink } from 'lucide-react';
import * as XLSX from 'xlsx';
import './SalesCustomerList.css';

// ── CUSTOMER MODAL COMPONENT (Extracted for stability) ───────────────────────
const CustomerModal = memo(({ 
  isOpen, 
  onClose, 
  isEditMode, 
  formData, 
  errors, 
  setErrors, 
  onSubmit, 
  t, 
  activeTab, 
  setActiveTab 
}) => {
  if (!isOpen) return null;

  // Track parent renders
  console.log("%c[Modal] Re-rendered - " + (isEditMode ? "Edit" : "Add"), "color: #3498db; font-weight: bold;");

  // We use local refs for inputs to prevent state updates on every keystroke
  const formRef = useRef({});

  const handleLocalSubmit = (e) => {
    e.preventDefault();
    const finalData = { ...formData };
    // Collect values from all refs
    Object.keys(formRef.current).forEach(key => {
      if (formRef.current[key]) {
        finalData[key] = formRef.current[key].value;
      }
    });
    onSubmit(finalData);
  };

  const setRef = (field) => (el) => {
    if (el) formRef.current[field] = el;
  };

  const tabBtnStyle = (tab) => ({
    padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer',
    fontFamily: 'inherit', fontSize: '14px',
    fontWeight: activeTab === tab ? 700 : 400,
    color: activeTab === tab ? 'var(--primary-color)' : '#636e72',
    borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : '2px solid transparent',
  });

  const inputStyle = (field) => ({
    width: '100%', padding: '9px 12px', boxSizing: 'border-box',
    border: errors[field] ? '1.5px solid #e74c3c' : '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', fontSize: '13px', outline: 'none',
  });

  const lblStyle = { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 6, color: '#2d3436' };

  return ReactDOM.createPortal(
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 560, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{isEditMode ? t('editCustomer') : t('addNewCustomer')}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#636e72' }}><X size={22} /></button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #dfe6e9', marginBottom: 24 }}>
          <button type="button" style={tabBtnStyle('basic')} onClick={() => setActiveTab('basic')}>{t('basicInfoTab')}</button>
          <button type="button" style={tabBtnStyle('advanced')} onClick={() => setActiveTab('advanced')}>{t('crmClassTab')}</button>
        </div>

        <form onSubmit={handleLocalSubmit} noValidate>
          {activeTab === 'basic' && (
            <>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={lblStyle}>ID (Mã KH) <span style={{ color: 'red' }}>*</span></label>
                  <input style={inputStyle('Mã KH')} disabled={isEditMode} defaultValue={formData['Mã KH'] || ''} ref={setRef('Mã KH')} type="text" placeholder="e.g. KH001" onKeyDown={() => console.log('Render prevented - Key pressed')} />
                  {errors['Mã KH'] && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors['Mã KH']}</span>}
                </div>
                <div style={{ flex: 2 }}>
                  <label style={lblStyle}>{t('custName')} <span style={{ color: 'red' }}>*</span></label>
                  <input style={inputStyle('Tên KH')} defaultValue={formData['Tên KH'] || ''} ref={setRef('Tên KH')} type="text" onKeyDown={() => console.log('Render prevented - Key pressed')} />
                  {errors['Tên KH'] && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors['Tên KH']}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={lblStyle}>{t('phone')}</label>
                  <input style={inputStyle('SĐT')} defaultValue={formData['SĐT'] || ''} ref={setRef('SĐT')} type="text" onKeyDown={() => console.log('Render prevented - Key pressed')} />
                  {errors['SĐT'] && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors['SĐT']}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={lblStyle}>E-mail</label>
                  <input style={inputStyle('E-mail')} defaultValue={formData['E-mail'] || ''} ref={setRef('E-mail')} type="text" onKeyDown={() => console.log('Render prevented - Key pressed')} />
                  {errors['E-mail'] && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors['E-mail']}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={lblStyle}>Địa chỉ</label>
                  <input style={inputStyle('')} defaultValue={formData['Địa chỉ'] || ''} ref={setRef('Địa chỉ')} type="text" onKeyDown={() => console.log('Render prevented - Key pressed')} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={lblStyle}>{t('location')} <span style={{ color: 'red' }}>*</span></label>
                  <input style={inputStyle('Vị trí')} defaultValue={formData['Vị trí'] || ''} ref={setRef('Vị trí')} type="text" onKeyDown={() => console.log('Render prevented - Key pressed')} />
                  {errors['Vị trí'] && <span style={{ color: '#e74c3c', fontSize: 12 }}>{errors['Vị trí']}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={lblStyle}>{t('gender')}</label>
                  <select style={inputStyle('')} defaultValue={formData['Giới tính'] || 'Nam'} ref={setRef('Giới tính')}>
                    <option>Nam</option><option>Nữ</option><option>Khác</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={lblStyle}>Ngày sinh</label>
                  <input style={inputStyle('')} defaultValue={formData['Ngày sinh'] || ''} ref={setRef('Ngày sinh')} type="text" placeholder="DD/MM/YYYY" onKeyDown={() => console.log('Render prevented - Key pressed')} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={lblStyle}>Ngày Thành Viên</label>
                  <input style={inputStyle('')} defaultValue={formData['Ngày Thành Viên'] || ''} ref={setRef('Ngày Thành Viên')} type="text" onKeyDown={() => console.log('Render prevented - Key pressed')} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={lblStyle}>Thể thao / Bệnh lý / Nghề nghiệp</label>
                <input style={{ ...inputStyle(''), marginBottom: 8 }} defaultValue={formData['Thể thao'] || ''} ref={setRef('Thể thao')} type="text" placeholder="Thể thao" onKeyDown={() => console.log('Render prevented - Key pressed')} />
                <input style={{ ...inputStyle(''), marginBottom: 8 }} defaultValue={formData['Tổng hợp bệnh lý'] || ''} ref={setRef('Tổng hợp bệnh lý')} type="text" placeholder="Tổng hợp bệnh lý" onKeyDown={() => console.log('Render prevented - Key pressed')} />
                <input style={inputStyle('')} defaultValue={formData['Nghề nghiệp'] || ''} ref={setRef('Nghề nghiệp')} type="text" placeholder="Nghề nghiệp" onKeyDown={() => console.log('Render prevented - Key pressed')} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={lblStyle}>Ghi chú khác</label>
                <textarea style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical', minHeight: 60 }}
                  defaultValue={formData['Ghi chú khác'] || ''} ref={setRef('Ghi chú khác')} onKeyDown={() => console.log('Render prevented - Key pressed')} />
              </div>
            </>
          )}

          {activeTab === 'advanced' && (
            <>
              {[
                { label: t('member'), field: 'Thành viên', opts: ['SILVER', 'GOLD', 'DIAMOND', 'PLATINUM', 'JHB LOYALTY MEMBER', 'NON'] },
                { label: 'Tình trạng', field: 'Tình trạng', opts: ['Success', 'Delivery', 'Visit'] },
                { label: `Channel (${t('source')})`, field: 'Channel', opts: ['Zalo', 'Website', 'Facebook', 'Shopee', 'Lazada', 'Tiki', 'Chiaki', 'Tiktok', 'Showroom', 'Event', 'Kênh khác', 'Outright', 'Collaboration', 'Consignment'] },
                { label: 'Account', field: 'Account', opts: ['Takashimaya', 'Nowzone', 'Online'] },
                { label: 'Follow Zalo OA', field: 'Follow Zalo Oa', opts: ['CÓ', 'KHÔNG', 'KHÔNG BIẾT', 'CÓ, KHÔNG CHAT ĐƯỢC', 'KHÁCH DÙNG ZALO'] },
                { label: 'KH nước ngoài', field: 'KH nước ngoài', opts: ['Không', 'Khách Du Lịch', 'Khách nước ngoài ở Việt Nam'] },
              ].map(({ label, field, opts }) => (
                <div key={field} style={{ marginBottom: 16 }}>
                  <label style={lblStyle}>{label}</label>
                  <select style={inputStyle('')} defaultValue={formData[field]} ref={setRef(field)}>
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid #dfe6e9' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '10px 24px', border: '1px solid #dfe6e9', borderRadius: 8, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
              {t('cancel')}
            </button>
            <button type="submit"
              style={{ padding: '10px 28px', border: 'none', borderRadius: 8, background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700 }}>
              {isEditMode ? t('update') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
});

// ── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────
export default function SalesCustomerList() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, exportData, importData, globalSearch, t } = useCRMData();
  
  // Track page renders
  console.log("%c[Page] SalesCustomerList Rendered", "color: #2ecc71; font-weight: bold;");
  const fileInputRef = useRef(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [filterChannel, setFilterChannel] = useState('All');
  const [filterAccount, setFilterAccount] = useState('All');

  const emptyForm = useMemo(() => ({
    'SĐT': '', 'Mã KH': '', 'Tên KH': '', 'Địa chỉ': '', 'Vị trí': '',
    'Giới tính': 'Nam', 'Ngày Thành Viên': '', 'Ngày sinh': '',
    'E-mail': '', 'Thành viên': 'NON', 'Tình trạng': 'Success',
    'Thể thao': '', 'Channel': 'Online', 'Account': 'Online',
    'Follow Zalo Oa': 'KHÔNG BIẾT', 'Tổng hợp bệnh lý': '',
    'Nghề nghiệp': '', 'KH nước ngoài': 'Không', 'Ghi chú khác': ''
  }), []);

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const channelOptions = useMemo(() => Array.from(new Set(customers.map(c => c['Channel']).filter(Boolean))), [customers]);
  const accountOptions = useMemo(() => Array.from(new Set(customers.map(c => c['Account']).filter(Boolean))), [customers]);

  const filteredCustomers = useMemo(() => customers.filter(c => {
    const term = (globalSearch || '').toLowerCase();
    const matchesSearch =
      String(c['Tên KH'] || '').toLowerCase().includes(term) ||
      String(c['SĐT'] || '').includes(term);
    const matchesChannel = filterChannel === 'All' || c['Channel'] === filterChannel;
    const matchesAccount = filterAccount === 'All' || c['Account'] === filterAccount;
    return matchesSearch && matchesChannel && matchesAccount;
  }), [customers, globalSearch, filterChannel, filterAccount]);

  const validate = useCallback((data) => {
    const e = {};
    if (!data['Mã KH']?.trim()) e['Mã KH'] = t('required');
    if (!data['Tên KH']?.trim()) e['Tên KH'] = t('requiredOr');
    if (!data['Vị trí']?.trim()) e['Vị trí'] = t('locationRequired');
    if (data['SĐT'] && !/^\d+$/.test(data['SĐT'])) e['SĐT'] = t('phoneNumOnly');
    if (data['E-mail'] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data['E-mail'])) e['E-mail'] = t('invalidEmail');
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [t]);

  const handleSubmit = useCallback((data) => {
    if (validate(data)) {
      isEditMode ? updateCustomer(data) : addCustomer(data);
      setShowAddModal(false);
      setFormData(emptyForm);
      setErrors({});
      setActiveTab('basic');
      setIsEditMode(false);
    }
  }, [validate, isEditMode, updateCustomer, addCustomer, emptyForm]);

  const openAddModal = useCallback(() => { 
    setFormData(emptyForm); 
    setIsEditMode(false); 
    setShowAddModal(true); 
    setErrors({}); 
    setActiveTab('basic'); 
  }, [emptyForm]);

  const handleEdit = useCallback((customer) => { 
    setFormData({ ...emptyForm, ...customer }); 
    setIsEditMode(true); 
    setShowAddModal(true); 
    setErrors({}); 
    setActiveTab('basic'); 
  }, [emptyForm]);

  const handleDelete = useCallback((customerId) => { 
    if (window.confirm(t('confirmDelete'))) deleteCustomer(customerId); 
  }, [deleteCustomer, t]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      importData(XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]));
      e.target.value = '';
    } catch (err) { console.error(err); }
  };

  return (
    <div className="sales-customers">
      <div className="page-header">
        <h2 className="page-title">{t('sales')}</h2>
        <div className="breadcrumbs">
          <span>{t('home')}</span> &gt; <span>{t('sales')}</span> &gt; <span className="active">{t('customers')}</span>
        </div>
      </div>

      <div className="toolbar">
        <div className="filters">
          <select className="filter-select" value={filterChannel} onChange={e => setFilterChannel(e.target.value)}>
            <option value="All">{t('channelAll')}</option>
            {channelOptions.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <select className="filter-select" value={filterAccount} onChange={e => setFilterAccount(e.target.value)}>
            <option value="All">{t('accountAll')}</option>
            {accountOptions.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <button className="icon-btn-filter"><Filter size={18} /></button>
        </div>
        <div className="actions">
          <span>{filteredCustomers.length} {t('items')}</span>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}><UploadCloud size={16} /> {t('importExcel')}</button>
          <button className="btn-secondary" onClick={exportData}><DownloadCloud size={16} /> {t('bulkExport')}</button>
          <button className="btn-primary" onClick={openAddModal}><Plus size={16} /> {t('addCustomer')}</button>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" /> ID</th>
                <th>{t('custName')}</th>
                <th>{t('phone')}</th>
                <th>{t('location')}</th>
                <th>{t('gender')}</th>
                <th>{t('member')}</th>
                <th>{t('source')}</th>
                <th style={{ textAlign: 'center' }}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.slice(0, 15).map((c) => (
                <tr key={c['Mã KH'] || Math.random()}>
                  <td><input type="checkbox" /> {c['Mã KH']}</td>
                  <td style={{ fontWeight: 600 }}>
                    <Link to={`/sales/customers/${c['Mã KH']}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                      {c['Tên KH']}
                    </Link>
                  </td>
                  <td>{c['SĐT']}</td>
                  <td>{c['Vị trí']}</td>
                  <td>{c['Giới tính']}</td>
                  <td><span className="status-badge" style={{ background: 'rgba(52,152,219,0.1)', color: '#3498db' }}>{c['Thành viên']}</span></td>
                  <td>{c['Channel']}</td>
                  <td style={{ textAlign: 'center' }}>
                    <Link to={`/sales/customers/${c['Mã KH']}`} style={{ color: 'var(--text-light)', marginRight: 12 }}>
                      <ExternalLink size={16} />
                    </Link>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', marginRight: 12 }} onClick={() => handleEdit(c)}><Edit2 size={16} /></button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)' }} onClick={() => handleDelete(c['Mã KH'])}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>{filteredCustomers.length === 0 ? t('noResults') : `${t('totalItems')}: ${filteredCustomers.length}`}</span>
        </div>
      </div>

      <CustomerModal 
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setErrors({}); }}
        isEditMode={isEditMode}
        formData={formData}
        errors={errors}
        setErrors={setErrors}
        onSubmit={handleSubmit}
        t={t}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
