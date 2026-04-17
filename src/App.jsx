import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import SalesCustomerList from './pages/SalesCustomerList';
import Reports from './pages/sales/Reports';
import SalesOpportunityList from './pages/SalesOpportunityList';
import Clients from './pages/Clients';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import CustomerDetail from './pages/CustomerDetail';
import Login from './pages/Login';
import { CRMProvider } from './context/CRMContext';
import { AuthProvider } from './context/AuthContext';

const PlaceholderPage = ({ title }) => (
  <div className="page-header animate-fade-in" style={{ padding: '24px 32px' }}>
    <h2 className="page-title">{title}</h2>
    <div style={{ marginTop: '20px', padding: '40px', background: 'var(--panel-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
      <p style={{ color: 'var(--text-medium)', fontSize: '15px' }}>Module này đang được xây dựng (Under Construction). Sẽ sớm ra mắt!</p>
    </div>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected — wrapped inside MainLayout */}
      <Route path="/*" element={
        <ProtectedRoute>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute permission="VIEW_DASHBOARD">
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/sales/customers" element={
                <ProtectedRoute permission="VIEW_CUSTOMERS">
                  <SalesCustomerList />
                </ProtectedRoute>
              } />

              <Route path="/sales/customers/:id" element={
                <ProtectedRoute permission="VIEW_CUSTOMERS">
                  <CustomerDetail />
                </ProtectedRoute>
              } />

              <Route path="/sales/reports" element={
                <ProtectedRoute permission="VIEW_REPORTS">
                  <Reports />
                </ProtectedRoute>
              } />

              <Route path="/sales/opportunities" element={
                <ProtectedRoute permission="VIEW_OPPORTUNITIES">
                  <SalesOpportunityList />
                </ProtectedRoute>
              } />

              <Route path="/marketing" element={
                <ProtectedRoute permission="VIEW_MARKETING">
                  <PlaceholderPage title="Marketing Module" />
                </ProtectedRoute>
              } />

              <Route path="/clients" element={
                <ProtectedRoute permission="VIEW_CLIENTS">
                  <Clients />
                </ProtectedRoute>
              } />

              <Route path="/analytics" element={
                <ProtectedRoute permission="VIEW_ANALYTICS">
                  <Analytics />
                </ProtectedRoute>
              } />

              <Route path="/settings" element={
                <ProtectedRoute permission="VIEW_SETTINGS">
                  <Settings />
                </ProtectedRoute>
              } />

              <Route path="*" element={
                <div className="page-header" style={{ padding: '24px 32px' }}>
                  <h2 className="page-title">404 — Not Found</h2>
                  <p>Please select a valid menu from the sidebar.</p>
                </div>
              } />
            </Routes>
          </MainLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CRMProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CRMProvider>
    </AuthProvider>
  );
}

export default App;
