import React, { useState, useCallback, memo } from 'react';
import { useCRMData } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Save, Download, Users as UsersIcon, Settings as SettingsIcon, ShieldCheck, UserPlus, ToggleLeft, UserCog } from 'lucide-react';

// ── Sub-component for individual dropdown items ─────
const DropdownItem = memo(({ item, idx, category, onRemove, onChange }) => {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
      <input
        style={{ flex: 1, padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: 4, fontFamily: 'inherit', background: 'var(--panel-bg)', color: 'var(--text-dark)' }}
        type="text"
        value={item || ''}
        onChange={e => onChange(category, idx, e.target.value)}
      />
      <button 
        onClick={() => onRemove(category, idx)} 
        style={{ color: 'var(--accent-red)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
});

// ── Sub-component for the entire dropdown section ──────────────────────────────
const DropdownSection = memo(({ titleKey, category, t, items, onAdd, onRemove, onChange }) => (
  <div style={{ flex: 1, minWidth: 250, border: '1px solid var(--border-color)', padding: 16, borderRadius: 8, background: 'var(--panel-bg)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <h4 style={{ margin: 0 }}>{t(titleKey)}</h4>
      <button onClick={() => onAdd(category)} className="btn-secondary" style={{ padding: '4px 8px' }}>
        <Plus size={14} />
      </button>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
      {(items || []).map((item, idx) => (
        <DropdownItem 
          key={`${category}-${idx}`} 
          item={item} 
          idx={idx} 
          category={category} 
          onRemove={onRemove} 
          onChange={onChange} 
        />
      ))}
    </div>
  </div>
));

export default function Settings() {
  const { settings, setSettings, t, exportData } = useCRMData();
  const { user, mockUsers, hasRole } = useAuth();
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'users'

  const isAdmin = hasRole('admin');

  const handleProfileChange = useCallback((key, value) => {
    setLocalSettings(prev => ({ ...prev, profile: { ...prev.profile, [key]: value } }));
  }, []);

  const handleDropdownChange = useCallback((category, idx, value) => {
    setLocalSettings(prev => {
      const newArr = [...(prev.dropdowns[category] || [])];
      newArr[idx] = value;
      return { ...prev, dropdowns: { ...prev.dropdowns, [category]: newArr } };
    });
  }, []);

  const addDropdownItem = useCallback((category) => {
    setLocalSettings(prev => ({ 
      ...prev, 
      dropdowns: { 
        ...prev.dropdowns, 
        [category]: [...(prev.dropdowns[category] || []), 'New Item'] 
      } 
    }));
  }, []);

  const removeDropdownItem = useCallback((category, idx) => {
    setLocalSettings(prev => ({ 
      ...prev, 
      dropdowns: { 
        ...prev.dropdowns, 
        [category]: (prev.dropdowns[category] || []).filter((_, i) => i !== idx) 
      } 
    }));
  }, []);

  const handlePipeChange = useCallback((idx, key, value) => {
    setLocalSettings(prev => {
      const newPipes = [...prev.pipelines];
      newPipes[idx] = { ...newPipes[idx], [key]: value };
      return { ...prev, pipelines: newPipes };
    });
  }, []);

  const addPipeline = useCallback(() => {
    setLocalSettings(prev => {
      const newId = prev.pipelines.length ? Math.max(...prev.pipelines.map(p => p.id)) + 1 : 1;
      return { ...prev, pipelines: [...prev.pipelines, { id: newId, name: 'New Stage', color: '#cccccc' }] };
    });
  }, []);

  const removePipeline = useCallback((idx) => {
    setLocalSettings(prev => ({ 
      ...prev, 
      pipelines: prev.pipelines.filter((_, i) => i !== idx) 
    }));
  }, []);

  const saveSettings = useCallback(() => {
    setSettings(localSettings);
    alert(t('settingsSaved'));
  }, [localSettings, setSettings, t]);

  const cardStyle = { flex: '1 1 300px', background: 'var(--panel-bg)', borderRadius: 'var(--radius-md)', padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 8 };
  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'transparent', color: 'var(--text-dark)' };

  return (
    <div className="settings-page animate-fade-in" style={{ padding: '0 32px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">{t('setting')}</h2>
          <div className="breadcrumbs">
            <span>{t('home')}</span> &gt; <span className="active">{t('settingsTitle')}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-secondary" onClick={exportData}>
            <Download size={16} /> {t('exportFullData') || 'Export Backup'}
          </button>
          <button className="btn-primary" onClick={saveSettings}>
            <Save size={16} /> {t('saveChanges')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid var(--border-color)', marginBottom: 32 }}>
        <button 
          onClick={() => setActiveTab('general')}
          style={{ 
            paddingBottom: 12, 
            borderBottom: activeTab === 'general' ? '2px solid var(--primary-color)' : '2px solid transparent',
            color: activeTab === 'general' ? 'var(--primary-color)' : 'var(--text-medium)',
            fontWeight: activeTab === 'general' ? 700 : 500,
            background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          <SettingsIcon size={18} /> Cấu hình chung
        </button>
        {isAdmin && (
          <button 
            onClick={() => setActiveTab('users')}
            style={{ 
              paddingBottom: 12, 
              borderBottom: activeTab === 'users' ? '2px solid var(--primary-color)' : '2px solid transparent',
              color: activeTab === 'users' ? 'var(--primary-color)' : 'var(--text-medium)',
              fontWeight: activeTab === 'users' ? 700 : 500,
              background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            <UsersIcon size={18} /> Quản lý người dùng
          </button>
        )}
      </div>

      {activeTab === 'general' ? (
        <>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {/* Company Profile */}
            <div style={cardStyle}>
              <h3>{t('companyProfile')}</h3>
              <div style={{ marginTop: 16 }}>
                <label style={labelStyle}>{t('companyBranch')}</label>
                <input 
                  style={inputStyle} 
                  value={localSettings.profile.companyName || ''}
                  onChange={e => handleProfileChange('companyName', e.target.value)} 
                  type="text" 
                />
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={labelStyle}>{t('currency')}</label>
                <select 
                  style={inputStyle} 
                  value={localSettings.profile.currency || 'VND'} 
                  onChange={e => handleProfileChange('currency', e.target.value)}
                >
                  <option value="VND">VND - Việt Nam Đồng</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>
            </div>

            {/* Pipelines */}
            <div style={{ ...cardStyle, flex: '1 1 500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{t('pipelineConfig')}</h3>
                <button onClick={addPipeline} className="btn-secondary" style={{ padding: '4px 8px' }}>
                  <Plus size={14} /> {t('addStage')}
                </button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-medium)', marginTop: 8 }}>{t('pipelineDesc')}</p>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {localSettings.pipelines.map((p, idx) => (
                  <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 13, flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <input 
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 6, fontFamily: 'inherit', background: 'transparent', color: 'var(--text-dark)' }}
                      value={p.name || ''} 
                      onChange={e => handlePipeChange(idx, 'name', e.target.value)} 
                      type="text" 
                    />
                    <input 
                      type="color" 
                      value={p.color || '#cccccc'} 
                      onChange={e => handlePipeChange(idx, 'color', e.target.value)}
                      style={{ width: 40, height: 40, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 4 }} 
                    />
                    <button 
                      onClick={() => removePipeline(idx)} 
                      style={{ color: 'var(--accent-red)', cursor: 'pointer', background: 'none', border: 'none' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Master Dropdowns */}
          <div style={{ ...cardStyle, marginTop: 24, flex: 'unset' }}>
            <h3>{t('masterDropdown')}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-medium)', marginTop: 8 }}>{t('masterDropdownDesc')}</p>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 24 }}>
              <DropdownSection 
                titleKey="channelDropdown" 
                category="channels" 
                t={t} 
                items={localSettings.dropdowns.channels} 
                onAdd={addDropdownItem} 
                onChange={handleDropdownChange} 
                onRemove={removeDropdownItem} 
              />
              <DropdownSection 
                titleKey="memberDropdown" 
                category="members" 
                t={t} 
                items={localSettings.dropdowns.members} 
                onAdd={addDropdownItem} 
                onChange={handleDropdownChange} 
                onRemove={removeDropdownItem} 
              />
              <DropdownSection 
                titleKey="ownerDropdown" 
                category="owners" 
                t={t} 
                items={localSettings.dropdowns.owners} 
                onAdd={addDropdownItem} 
                onChange={handleDropdownChange} 
                onRemove={removeDropdownItem} 
              />
            </div>
          </div>
        </>
      ) : (
        /* User Management Tab (Admin Only) */
        <div style={cardStyle} className="animate-fade-in">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ margin: 0 }}>Quản lý người dùng</h3>
                <p style={{ fontSize: 13, color: 'var(--text-medium)', marginTop: 4 }}>Chỉ ADMIN mới có quyền truy cập module này.</p>
              </div>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={16} /> Thêm nhân viên
              </button>
           </div>

           <div className="overflow-x-auto" style={{ border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.1)', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-medium)' }}>
                    <th style={{ padding: 16 }}>Nhân viên</th>
                    <th style={{ padding: 16 }}>Role</th>
                    <th style={{ padding: 16 }}>Phòng ban</th>
                    <th style={{ padding: 16 }}>Store/CN</th>
                    <th style={{ padding: 16 }}>Last Login</th>
                    <th style={{ padding: 16 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="user-row-hover">
                      <td style={{ padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                           <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justify: 'center', fontSize: 12, fontWeight: 700 }}>
                              {u.name.charAt(0)}
                           </div>
                           <div>
                              <div style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{u.name}</div>
                              <div style={{ color: 'var(--text-medium)', fontSize: 11 }}>{u.email}</div>
                           </div>
                        </div>
                      </td>
                      <td style={{ padding: 16 }}>
                         <span style={{ 
                            background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(108, 92, 231, 0.1)', 
                            color: u.role === 'admin' ? '#ef4444' : 'var(--primary-color)',
                            padding: '2px 8px', borderRadius: 4, fontWeight: 700, fontSize: 10, textTransform: 'uppercase'
                          }}>
                           {u.role}
                         </span>
                      </td>
                      <td style={{ padding: 16, color: 'var(--text-dark)' }}>{u.department}</td>
                      <td style={{ padding: 16, color: 'var(--text-dark)' }}>{u.store || 'Tất cả'}</td>
                      <td style={{ padding: 16, color: 'var(--text-medium)', fontSize: 11 }}>{u.lastLogin}</td>
                      <td style={{ padding: 16 }}>
                         <div style={{ display: 'flex', gap: 8 }}>
                            <button title="Chỉnh sửa role" style={{ background: 'none', border: 'none', color: 'var(--text-medium)', cursor: 'pointer' }}><UserCog size={16} /></button>
                            <button title="Vô hiệu hóa" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><ToggleLeft size={16} /></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
}
