import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import SalesCustomerList from './pages/SalesCustomerList';
import ReportAnalysis from './pages/ReportAnalysis';
import SalesOpportunityList from './pages/SalesOpportunityList';
import Clients from './pages/Clients';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { CRMProvider } from './context/CRMContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const PlaceholderPage = ({ title }) => (
  <div className="page-header animate-fade-in" style={{ padding: '24px 32px' }}>
    <h2 className="page-title">{title}</h2>
    <div style={{ marginTop: '20px', padding: '40px', background: 'var(--panel-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
      <p style={{ color: 'var(--text-medium)', fontSize: '15px' }}>Module này đang được xây dựng (Under Construction). Sẽ sớm ra mắt!</p>
    </div>
  </div>
);

// Wraps any route that requires authentication
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sales/customers" element={<SalesCustomerList />} />
              <Route path="/sales/reports" element={<ReportAnalysis />} />
              <Route path="/sales/opportunities" element={<SalesOpportunityList />} />
              <Route path="/marketing" element={<PlaceholderPage title="Marketing Module" />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
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
