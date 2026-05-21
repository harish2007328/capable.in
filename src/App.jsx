import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
const HomePage = React.lazy(() => import('./pages/HomePage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const VenturePage = React.lazy(() => import('./pages/VenturePage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const FeaturesPage = React.lazy(() => import('./pages/FeaturesPage'));
const CheckoutResult = React.lazy(() => import('./pages/CheckoutResult'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AuthCallbackPage = React.lazy(() => import('./pages/AuthCallbackPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

import FullScreenLoader from './components/FullScreenLoader';
import CookieConsent from './components/CookieConsent';

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
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
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
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </React.Suspense>
        </Layout>
      </Router>
      <CookieConsent />
    </AuthProvider>
  );
}

export default App;
