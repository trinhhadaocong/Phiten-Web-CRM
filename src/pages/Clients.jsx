import React, { useState, useCallback, memo } from 'react';
import ReactDOM from 'react-dom';
import { useCRMData } from '../context/CRMContext';
import './SalesCustomerList.css';
import { Filter, DownloadCloud, Plus, Edit2, Trash2, Users, X } from 'lucide-react';
import * as XLSX from 'xlsx';

const emptyForm = {
  'Tên công ty': '', 'Mã số thuế': '', 'Địa chỉ văn phòng': '', 'Người đại diện': ''
};

// ── FORM MODAL COMPONENT (Extracted for stability) ───────────────────────────
const FormModal = memo(({ isOpen, onClose, isEditMode, formData, onSave, t }) => {
  if (!isOpen) return null;

  // Track modal renders
  console.log("%c[Modal] Client Form Modal Rendered", "color: #3498db; font-weight: bold;");
  const formRef = React.useRef({});
  const setRef = (field) => (el) => { if (el) formRef.current[field] = el; };

  const handleLocalSave = () => {
    const data = {
      'Tên công ty': formRef.current['Tên công ty']?.value || '',
      'Mã số thuế': formRef.current['Mã số thuế']?.value || '',
      'Địa chỉ văn phòng': formRef.current['Địa chỉ văn phòng']?.value || '',
      'Người đại diện': formRef.current['Người đại diện']?.value || '',
    };
    onSave(data);
  };

  const inputStyle = {
    width: '100%', padding: '9px 12px', boxSizing: 'border-box',
    border: '1px solid #dfe6e9', borderRadius: '6px',
    fontFamily: 'inherit', fontSize: '13px', outline: 'none',
  };
  const lblStyle = { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 6, color: '#2d3436', marginTop: 16 };

  return ReactDOM.createPortal(
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 480, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            {isEditMode ? `✏️ ${t('editClient')}` : `➕ ${t('addNewClient')}`}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#636e72' }}><X size={22} /></button>
        </div>

        <label style={lblStyle}>{t('companyName')} <span style={{ color: 'red' }}>*</span></label>
        <input style={inputStyle} type="text" placeholder={t('companyNamePlaceholder')}
          defaultValue={formData['Tên công ty'] || ''} ref={setRef('Tên công ty')} onKeyDown={() => console.log('Render prevented - Key pressed')} />

        <label style={lblStyle}>{t('taxCode')}</label>
        <input style={{ ...inputStyle, background: isEditMode ? '#f5f5f5' : '#fff' }}
          type="text" defaultValue={formData['Mã số thuế'] || ''} readOnly={isEditMode}
          ref={setRef('Mã số thuế')} onKeyDown={() => console.log('Render prevented - Key pressed')} />

        <label style={lblStyle}>{t('officeAddress')}</label>
        <input style={inputStyle} type="text"
          defaultValue={formData['Địa chỉ văn phòng'] || ''} ref={setRef('Địa chỉ văn phòng')} onKeyDown={() => console.log('Render prevented - Key pressed')} />

        <label style={lblStyle}>{t('legalRep')}</label>
        <input style={inputStyle} type="text"
          defaultValue={formData['Người đại diện'] || ''} ref={setRef('Người đại diện')} onKeyDown={() => console.log('Render prevented - Key pressed')} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28, paddingTop: 20, borderTop: '1px solid #dfe6e9' }}>
          <button onClick={onClose}
            style={{ padding: '10px 24px', border: '1px solid #dfe6e9', borderRadius: 8, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
            {t('cancel')}
          </button>
          <button onClick={handleLocalSave}
            style={{ padding: '10px 28px', border: 'none', borderRadius: 8, background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700 }}>
            {isEditMode ? t('update') : t('saveClient')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
});

// ── CUSTOMERS MODAL COMPONENT (Extracted for stability) ──────────────────────
const CustomersModal = memo(({ isOpen, onClose, client, customers, t }) => {
  if (!isOpen || !client) return null;

  return ReactDOM.createPortal(
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 700, maxWidth: '95vw', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>{t('staffList')}: {client?.['Tên công ty']}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#636e72' }}><X size={22} /></button>
        </div>
        <p style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>{t('taxCode')}: {client?.['Mã số thuế']}</p>

        <div className="table-container" style={{ maxHeight: 350, overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>{t('custName')}</th>
                <th>{t('occupation')}</th>
                <th>{t('phone')}</th>
              </tr>
            </thead>
            <tbody>
              {customers.filter(c => c['Mã Client'] === client?.['Mã số thuế']).map((c) => (
                <tr key={c['Mã KH'] || Math.random()}>
                  <td>{c['Mã KH']}</td>
                  <td>{c['Tên KH']}</td>
                  <td>{c['Nghề nghiệp']}</td>
                  <td>{c['SĐT']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onClose}
            style={{ padding: '10px 28px', border: 'none', borderRadius: 8, background: 'var(--primary-color)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700 }}>
            {t('close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
});

export default function Clients() {
  // Track page renders
  console.log("%c[Page] Clients Rendered", "color: #2ecc71; font-weight: bold;");
  const { clients, customers, addClient, updateClient, deleteClient, t } = useCRMData();
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaxCode, setEditingTaxCode] = useState(null);
  const [showCustomersModal, setShowCustomersModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const openAdd = useCallback(() => {
    setFormData(emptyForm);
    setIsEditMode(false);
    setEditingTaxCode(null);
    setShowFormModal(true);
  }, []);

  const openEdit = useCallback((client) => {
    setFormData({
      'Tên công ty': client['Tên công ty'] || '',
      'Mã số thuế': client['Mã số thuế'] || '',
      'Địa chỉ văn phòng': client['Địa chỉ văn phòng'] || '',
      'Người đại diện': client['Người đại diện'] || '',
    });
    setEditingTaxCode(client['Mã số thuế']);
    setIsEditMode(true);
    setShowFormModal(true);
  }, []);

  const handleDelete = useCallback((client) => {
    if (window.confirm(`${t('confirmDelete')}\n\n"${client['Tên công ty']}"`)) {
      deleteClient(client['Mã số thuế']);
    }
  }, [deleteClient, t]);

  const openCustomers = useCallback((client) => { 
    setSelectedClient(client); 
    setShowCustomersModal(true); 
  }, []);

  const handleExport = useCallback(() => {
    const ws = XLSX.utils.json_to_sheet(clients);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    XLSX.writeFile(wb, 'Clients_Export.xlsx');
  }, [clients]);

  const handleSave = useCallback((data) => {
    if (!data['Tên công ty']?.trim()) { alert(t('required')); return; }
    if (isEditMode) {
      updateClient({ ...data, 'Mã số thuế': editingTaxCode });
    } else {
      addClient({ ...data });
    }
    setShowFormModal(false);
    setFormData(emptyForm);
  }, [isEditMode, editingTaxCode, updateClient, addClient, t]);

  return (
    <div className="sales-customers">
      <div className="page-header">
        <h2 className="page-title">{t('clients')}</h2>
        <div className="breadcrumbs">
          <span>{t('home')}</span> &gt; <span className="active">{t('clients')}</span>
        </div>
      </div>

      <div className="toolbar">
        <div className="actions" style={{ marginLeft: 'auto' }}>
          <span>{clients.length} {t('items')}</span>
          <button className="btn-secondary" onClick={handleExport}><DownloadCloud size={16} /> {t('export')}</button>
          <button className="btn-primary" onClick={openAdd}><Plus size={16} /> {t('addClient')}</button>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('companyName')}</th>
                <th>{t('taxCode')}</th>
                <th>{t('officeAddress')}</th>
                <th>{t('legalRep')}</th>
                <th style={{ textAlign: 'center' }}>{t('staff')}</th>
                <th style={{ textAlign: 'center' }}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c['Mã số thuế'] || Math.random()}>
                  <td style={{ fontWeight: 600 }}>{c['Tên công ty']}</td>
                  <td>{c['Mã số thuế']}</td>
                  <td>{c['Địa chỉ văn phòng']}</td>
                  <td>{c['Người đại diện']}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="icon-btn" onClick={() => openCustomers(c)}>
                      <Users size={18} color="var(--primary-color)" />
                    </button>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="icon-btn" style={{ marginRight: 12 }} onClick={() => openEdit(c)}><Edit2 size={16} /></button>
                    <button className="icon-btn" style={{ color: 'var(--accent-red)' }} onClick={() => handleDelete(c)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FormModal 
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        isEditMode={isEditMode}
        formData={formData}
        onSave={handleSave}
        t={t}
      />

      <CustomersModal 
        isOpen={showCustomersModal}
        onClose={() => setShowCustomersModal(false)}
        client={selectedClient}
        customers={customers}
        t={t}
      />
    </div>
  );
}
