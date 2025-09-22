import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Plus, List, Upload, Settings, BarChart3 } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import { PWAInstallPrompt, ConnectionStatus, MobileNavigation, MobileKeyboard } from './components/MobileComponents';
import { Toaster } from './services/notificationService';
import LandingPage from './pages/LandingPage';
import FieldRepresentativeLogin from './pages/FieldRepresentativeLogin';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import ChildForm from './pages/ChildForm';
import RecordsList from './pages/RecordsList';
import Sync from './pages/Sync';
import AdminPortal from './pages/AdminPortal';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const mobileNavItems = [
    { path: '/dashboard', icon: Heart, label: 'Home' },
    { path: '/add-child', icon: Plus, label: 'Add' },
    { path: '/records', icon: List, label: 'Records' },
    { path: '/sync', icon: Upload, label: 'Sync' },
  ];

  const handleMobileNavigate = (path) => {
    navigate(path);
  };

  return (
    <>
      <Toaster 
        position="top-center"
        containerStyle={{
          top: 20,
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
            padding: '16px',
            fontWeight: '500',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <ConnectionStatus />
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <Navigation />
        <MobileKeyboard>
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login/field-representative" element={<FieldRepresentativeLogin />} />
              <Route path="/login/admin" element={<AdminLogin />} />
              
              {/* Protected Routes for Field Representatives */}
              <Route path="/dashboard" element={
                <ProtectedRoute requiredRoles={['field_representative', 'admin']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/add-child" element={
                <ProtectedRoute requiredRoles={['field_representative', 'admin']}>
                  <ChildForm />
                </ProtectedRoute>
              } />
              <Route path="/records" element={
                <ProtectedRoute requiredRoles={['field_representative', 'admin']}>
                  <RecordsList />
                </ProtectedRoute>
              } />
              <Route path="/sync" element={
                <ProtectedRoute requiredRoles={['field_representative', 'admin']}>
                  <Sync />
                </ProtectedRoute>
              } />
              
              {/* Protected Routes for Admins Only */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPortal />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute requiredRole="admin">
                  <AnalyticsDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </MobileKeyboard>
        
        <MobileNavigation 
          items={mobileNavItems}
          currentPath={location.pathname}
          onNavigate={handleMobileNavigate}
        />
      </div>
      
      <PWAInstallPrompt />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
