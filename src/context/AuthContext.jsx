import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext();

const CORRECT_PASSWORD = 'Phiten@2026';
const STORAGE_KEY = 'phiten_crm_auth';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [error, setError] = useState('');

  const login = useCallback((password) => {
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setError('');
      return true;
    } else {
      setError('Incorrect password. Please try again.');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
