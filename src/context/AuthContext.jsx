import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { PERMISSIONS } from '../config/roles';

const AuthContext = createContext();

const MOCK_USERS = [
  { id: '1', name: 'Johnny Ha', email: 'johnny@phiten.vn', role: 'manager', 
    department: 'CRM', store: null, avatar: null, createdAt: '2024-01-01', lastLogin: '2026-04-17' },
  { id: '2', name: 'CS Team Lead', email: 'cs@phiten.vn', role: 'cs', 
    department: 'CS', store: 'Nowzone', avatar: null, createdAt: '2024-02-15', lastLogin: '2026-04-16' },
  { id: '3', name: 'Sales Rep', email: 'sales@phiten.vn', role: 'sales', 
    department: 'Sales', store: 'Takashimaya', avatar: null, createdAt: '2024-03-10', lastLogin: '2026-04-17' },
  { id: '4', name: 'Admin', email: 'admin@phiten.vn', role: 'admin', 
    department: 'Management', store: null, avatar: null, createdAt: '2023-10-01', lastLogin: '2026-04-17' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  const login = useCallback((email, password) => {
    // In demo mode, we just check email from MOCK_USERS
    const foundUser = MOCK_USERS.find(u => u.email === email);
    
    // For demo, password doesn't matter or matches specific one
    if (foundUser) {
      setUser(foundUser);
      setError('');
      return true;
    } else {
      setError('Email không hợp lệ cho bản Demo này.');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
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
