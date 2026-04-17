import React from 'react';
import { Search, Bell, LogOut, Menu } from 'lucide-react';
import { useCRMData } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './TopBar.css';

export default function TopBar({ toggleSidebar }) {
  const { globalSearch, setGlobalSearch, language, setLanguage, t } = useCRMData();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="topbar">
      <button className="menu-toggle" onClick={toggleSidebar}>
        <Menu size={24} />
      </button>
      <div className="topbar-search">
        <Search size={20} color="var(--primary-color)" />
        <input 
          type="text" 
          placeholder={t('searchPlaceholder')}
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
        />
      </div>

      <div className="topbar-actions">
        <button className="icon-btn">
          <Bell size={20} color="var(--primary-color)" />
        </button>
        
        {language === 'en' ? (
           <button className="icon-btn" onClick={() => setLanguage('vi')} title="Switch to Vietnamese" style={{fontSize: '18px', border: 'none', background: 'transparent', cursor: 'pointer'}}>
             🇻🇳
           </button>
        ) : (
           <button className="icon-btn" onClick={() => setLanguage('en')} title="Chuyển sang Tiếng Anh" style={{fontSize: '18px', border: 'none', background: 'transparent', cursor: 'pointer'}}>
             🇺🇸
           </button>
        )}

        <button
          className="icon-btn"
          onClick={handleLogout}
          title="Logout"
          style={{ color: 'var(--primary-color)' }}
        >
          <LogOut size={20} color="var(--primary-color)" />
        </button>

        <div className="user-profile">
          <div className="avatar">
            <img src="https://ui-avatars.com/api/?name=Shirley+H&background=random" alt="User" />
          </div>
          <span className="user-name">Shirley.H</span>
        </div>
      </div>
    </div>
  );
}
