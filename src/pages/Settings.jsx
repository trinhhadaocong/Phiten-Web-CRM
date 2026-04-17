import React, { useState, useCallback, memo } from 'react';
import { useCRMData } from '../context/CRMContext';
import { Plus, Trash2, Save, Download } from 'lucide-react';

// ── Sub-component for individual dropdown items to prevent re-rendering the whole list ─────
const DropdownItem = memo(({ item, idx, category, onRemove, onChange }) => {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
      <input
        style={{ flex: 1, padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: 4, fontFamily: 'inherit' }}
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
  <div style={{ flex: 1, minWidth: 250, border: '1px solid var(--border-color)', padding: 16, borderRadius: 8 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <h4 style={{ margin: 0 }}>{t(titleKey)}</h4>
      <button onClick={() => onAdd(category)} className="btn-secondary" style={{ padding: '4px 8px' }}>
        <Plus size={14} />
      </button>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
      {(items || []).map((item, idx) => (
        <DropdownItem 
          key={`${category}-${idx}`} // Stable enough if order doesn't shift frequently, but prefixing with category
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
  const [localSettings, setLocalSettings] = useState(settings);

  // Memoized handlers to maintain reference stability
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

  const cardStyle = { flex: '1 1 300px', background: '#fff', borderRadius: 'var(--radius-md)', padding: 24, boxShadow: 'var(--shadow-sm)' };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#2d3436', marginBottom: 8 };
  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', fontSize: 13, outline: 'none', boxSizing: 'border-box' };

  return (
    <div className="report-analysis">
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
          <p style={{ fontSize: 13, color: '#666', marginTop: 8 }}>{t('pipelineDesc')}</p>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {localSettings.pipelines.map((p, idx) => (
              <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 13, flexShrink: 0 }}>
                  {idx + 1}
                </div>
                <input 
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 6, fontFamily: 'inherit' }}
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
        <p style={{ fontSize: 13, color: '#666', marginTop: 8 }}>{t('masterDropdownDesc')}</p>
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
    </div>
  );
}
