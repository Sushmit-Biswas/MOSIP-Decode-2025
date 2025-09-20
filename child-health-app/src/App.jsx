import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Plus, List, Upload, Settings, BarChart3 } from 'lucide-react';
import Navigation from './components/Navigation';
import { PWAInstallPrompt, ConnectionStatus, MobileNavigation, MobileKeyboard } from './components/MobileComponents';
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
    { path: '/', icon: Heart, label: 'Home' },
    { path: '/add-child', icon: Plus, label: 'Add' },
    { path: '/records', icon: List, label: 'Records' },
    { path: '/sync', icon: Upload, label: 'Sync' },
  ];

  const handleMobileNavigate = (path) => {
    navigate(path);
  };

  return (
    <>
      <ConnectionStatus />
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <Navigation />
        <MobileKeyboard>
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add-child" element={<ChildForm />} />
              <Route path="/records" element={<RecordsList />} />
              <Route path="/sync" element={<Sync />} />
              <Route path="/admin" element={<AdminPortal />} />
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
