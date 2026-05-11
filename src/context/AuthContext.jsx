import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { PERMISSIONS } from '../config/roles';

const AuthContext = createContext();

const MOCK_USERS = [
  { id: '1', name: 'Shirley.H', email: 'shirley@phiten.vn', role: 'manager', 
    department: 'CRM', store: 'All', avatar: null, createdAt: '2024-01-01', lastLogin: '2026-04-17' },
  { id: '2', name: 'CS Staff', email: 'cs@phiten.vn', role: 'cs', 
    department: 'CSKH', store: 'Nowzone', avatar: null, createdAt: '2024-02-15', lastLogin: '2026-04-16' },
  { id: '3', name: 'Sales Staff', email: 'sales@phiten.vn', role: 'sales', 
    department: 'Retail', store: 'Takashimaya', avatar: null, createdAt: '2024-03-10', lastLogin: '2026-04-17' },
  { id: '4', name: 'Admin User', email: 'admin@phiten.vn', role: 'admin', 
    department: 'Management', store: 'All', avatar: null, createdAt: '2023-10-01', lastLogin: '2026-04-17' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('phiten_crm_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState('');

  const login = useCallback((email, password) => {
    const foundUser = MOCK_USERS.find(u => u.email === email);
    
    // Mật khẩu Admin mới
    const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'Admin@Phiten2026!';
    // Mật khẩu cho các tài khoản demo khác
    const DEMO_PASS = 'demo';

    if (foundUser) {
      const isValid = (foundUser.role === 'admin' && password === ADMIN_PASS) || 
                      (foundUser.role !== 'admin' && (password === DEMO_PASS || password === ADMIN_PASS));

      if (isValid) {
        setUser(foundUser);
        localStorage.setItem('phiten_crm_user', JSON.stringify(foundUser));
        setError('');
        return true;
      } else {
        setError('Mật khẩu không chính xác. Vui lòng thử lại.');
        return false;
      }
    } else {
      setError('Email không hợp lệ cho hệ thống này.');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('phiten_crm_user');
  }, []);

  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) return false;
    return allowedRoles.includes(user.role);
  }, [user]);

  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
    error,
    setError,
    hasPermission,
    hasRole,
    mockUsers: MOCK_USERS // For the settings page
  }), [user, error, login, logout, hasPermission, hasRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
