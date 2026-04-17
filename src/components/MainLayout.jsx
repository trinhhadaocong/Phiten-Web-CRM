import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useCRMData } from '../context/CRMContext';

export default function MainLayout({ children }) {
  const { loading } = useCRMData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-container">
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
        onClick={closeSidebar}
      />
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      <div className="main-content">
        <TopBar toggleSidebar={toggleSidebar} />
        <div className="page-container animate-fade-in">
          {loading ? (
             <div className="loader-container">
               <div className="spinner"></div>
               <h3 style={{marginTop: 16}}>Khởi tạo dữ liệu...</h3>
               <p style={{fontSize: 13, color: 'var(--text-medium)'}}>Đang parse nội dung file Excel hệ thống CRM</p>
             </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
