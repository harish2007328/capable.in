import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const VenturePage = React.lazy(() => import('./pages/VenturePage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const DocsPage = React.lazy(() => import('./pages/DocsPage'));
const FeaturesPage = React.lazy(() => import('./pages/FeaturesPage'));
const CheckoutResult = React.lazy(() => import('./pages/CheckoutResult'));

import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

import FullScreenLoader from './components/FullScreenLoader';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <React.Suspense fallback={<FullScreenLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/checkout-result" element={<CheckoutResult />} />

              {/* Unified Venture Route - Public (Handles guests via localStorage) */}
              <Route path="/project" element={<VenturePage />} />
              <Route path="/project/:projectId" element={<VenturePage />} />

              {/* Redirects for legacy routes */}
              <Route path="/wizard" element={<Navigate to="/project" replace />} />
              <Route path="/report" element={<Navigate to="/project" replace />} />
              <Route path="/task/:id" element={<Navigate to="/project" replace />} />

              {/* Protected Routes - Only for registered users */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/settings" element={<Navigate to="/dashboard#settings" replace />} />
              <Route path="/metrics" element={<Navigate to="/dashboard#metrics" replace />} />
            </Routes>
          </React.Suspense>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
