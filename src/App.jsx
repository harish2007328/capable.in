import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import UseCasesPage from './pages/UseCasesPage';
import PricingPage from './pages/PricingPage';
import VenturePage from './pages/VenturePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';

import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Or a loading spinner

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
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/use-cases" element={<UseCasesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />

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
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
