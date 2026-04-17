import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Target, Users, BarChart2, Settings, ChevronRight, ChevronDown, HelpCircle, BadgeInfo } from 'lucide-react';
import { useCRMData } from '../context/CRMContext';
import './Sidebar.css';

export default function Sidebar({ isOpen, closeSidebar }) {
  const [salesExpanded, setSalesExpanded] = useState(true);
  const location = useLocation();
  const { t } = useCRMData();

  const isSalesActive = location.pathname.includes('/sales');

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <h1 style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>PHITEN VIETNAM</h1>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" onClick={closeSidebar} className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <LayoutDashboard size={20} />
          <span>{t('dashboard')}</span>
        </NavLink>

        <div className="nav-group">
          <div className={`nav-item ${isSalesActive ? 'active parent' : ''}`} onClick={() => setSalesExpanded(!salesExpanded)}>
            <ShoppingBag size={20} />
            <span style={{flex: 1}}>{t('sales')}</span>
            {salesExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
          </div>
          
          {salesExpanded && (
            <div className="nav-subgroup">
              <NavLink to="/sales/opportunities" onClick={closeSidebar} className={({isActive}) => isActive ? 'nav-item sub active' : 'nav-item sub'}>
                <span>{t('opportunities')}</span>
                {location.pathname === '/sales/opportunities' && <div className="active-dot" />}
              </NavLink>
              <NavLink to="/sales/customers" onClick={closeSidebar} className={({isActive}) => isActive ? 'nav-item sub active' : 'nav-item sub'}>
                <span>{t('customers')}</span>
                {location.pathname === '/sales/customers' && <div className="active-dot" />}
              </NavLink>
              <NavLink to="/sales/reports" onClick={closeSidebar} className={({isActive}) => isActive ? 'nav-item sub active' : 'nav-item sub'}>
                <span>{t('reportsAnalysis')}</span>
                {location.pathname === '/sales/reports' && <div className="active-dot" />}
              </NavLink>
            </div>
          )}
        </div>

        <NavLink to="/marketing" onClick={closeSidebar} className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <Target size={20} />
          <span>{t('marketing')}</span>
        </NavLink>

        <NavLink to="/clients" onClick={closeSidebar} className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <Users size={20} />
          <span>{t('clients')}</span>
        </NavLink>

        <NavLink to="/analytics" onClick={closeSidebar} className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <BarChart2 size={20} />
          <span>{t('analytics')}</span>
        </NavLink>

        <NavLink to="/settings" onClick={closeSidebar} className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <Settings size={20} />
          <span>{t('setting')}</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          {t('moreService')} <BadgeInfo size={16} />
        </button>

        <div className="help-desk-card">
          <div className="help-desk-icon">
            <HelpCircle size={32} color="#6c5ce7" />
          </div>
          <button
            className="btn-primary help-btn"
            onClick={() => window.open('https://zalo.me/0945702063', '_blank', 'noopener,noreferrer')}
          >
            {t('helpDesk')}
          </button>
        </div>
      </div>
    </div>
  );
}
