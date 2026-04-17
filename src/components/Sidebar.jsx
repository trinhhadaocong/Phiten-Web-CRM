import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Target, Users, BarChart2, 
  Settings, ChevronRight, ChevronDown, HelpCircle, 
  BadgeInfo, LogOut, User as UserIcon
} from 'lucide-react';
import { useCRMData } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({ isOpen, closeSidebar }) {
  const [salesExpanded, setSalesExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useCRMData();
  const { user, logout, hasPermission } = useAuth();

  const isSalesActive = location.pathname.includes('/sales');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { 
      to: '/dashboard', 
      icon: <LayoutDashboard size={20} />, 
      label: t('dashboard'),
      permission: 'VIEW_DASHBOARD'
    },
    {
      group: 'sales',
      icon: <ShoppingBag size={20} />,
      label: t('sales'),
      permission: 'VIEW_CUSTOMERS', // Base permission for sales group
      subItems: [
        { to: '/sales/opportunities', label: t('opportunities'), permission: 'VIEW_OPPORTUNITIES' },
        { to: '/sales/customers', label: t('customers'), permission: 'VIEW_CUSTOMERS' },
        { to: '/sales/reports', label: t('reportsAnalysis'), permission: 'VIEW_REPORTS' },
      ]
    },
    { 
      to: '/marketing', 
      icon: <Target size={20} />, 
      label: t('marketing'),
      permission: 'VIEW_MARKETING'
    },
    { 
      to: '/clients', 
      icon: <Users size={20} />, 
      label: t('clients'),
      permission: 'VIEW_CLIENTS'
    },
    { 
      to: '/analytics', 
      icon: <BarChart2 size={20} />, 
      label: t('analytics'),
      permission: 'VIEW_ANALYTICS'
    },
    { 
      to: '/settings', 
      icon: <Settings size={20} />, 
      label: t('setting'),
      permission: 'VIEW_SETTINGS'
    },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <h1 style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>
          PHITEN <span className="text-indigo-500">CRM</span>
        </h1>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, idx) => {
          if (item.permission && !hasPermission(item.permission)) return null;

          if (item.group === 'sales') {
            const visibleSubItems = item.subItems.filter(sub => hasPermission(sub.permission));
            if (visibleSubItems.length === 0) return null;

            return (
              <div className="nav-group" key={idx}>
                <div className={`nav-item ${isSalesActive ? 'active parent' : ''}`} onClick={() => setSalesExpanded(!salesExpanded)}>
                  {item.icon}
                  <span style={{flex: 1}}>{item.label}</span>
                  {salesExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                </div>
                
                {salesExpanded && (
                  <div className="nav-subgroup">
                    {visibleSubItems.map((sub, sidx) => (
                      <NavLink key={sidx} to={sub.to} onClick={closeSidebar} className={({isActive}) => isActive ? 'nav-item sub active' : 'nav-item sub'}>
                        <span>{sub.label}</span>
                        {location.pathname === sub.to && <div className="active-dot" />}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink key={idx} to={item.to} onClick={closeSidebar} className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {/* User Profile Section */}
        <div className="user-profile-card">
           <div className="user-avatar-container">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="user-avatar" />
              ) : (
                <div className="user-avatar-placeholder">
                   <UserIcon size={20} />
                </div>
              )}
           </div>
           <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role-badge">{user?.role?.toUpperCase()}</div>
           </div>
           <button onClick={handleLogout} className="logout-btn" title="Đăng xuất">
              <LogOut size={18} />
           </button>
        </div>

        <div className="help-desk-card">
          <div className="help-desk-icon">
            <HelpCircle size={24} color="#6c5ce7" />
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
