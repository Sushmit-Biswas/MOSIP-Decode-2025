import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Heart, Users, Upload, FileText } from 'lucide-react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import ChildForm from './pages/ChildForm';
import RecordsList from './pages/RecordsList';
import Sync from './pages/Sync';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-child" element={<ChildForm />} />
            <Route path="/records" element={<RecordsList />} />
            <Route path="/sync" element={<Sync />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
