import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Plus, List, Upload, Settings, BarChart3 } from 'lucide-react';
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
      <Toaster />
      <ConnectionStatus />
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <Navigation />
        <MobileKeyboard>
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login/field-representative" element={<FieldRepresentativeLogin />} />
              <Route path="/login/admin" element={<AdminLogin />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/add-child" element={<ChildForm />} />
              <Route path="/records" element={<RecordsList />} />
              <Route path="/sync" element={<Sync />} />
              <Route path="/admin/dashboard" element={<AdminPortal />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
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
      <AppContent />
    </Router>
  );
}

export default App;
