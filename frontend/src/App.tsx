import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import LiveMap from './pages/LiveMap';
import SOS from './pages/SOS';
import Resources from './pages/Resources';
import Teams from './pages/Teams';
import AIAnalysis from './pages/AIAnalysis';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <Sidebar />
          <div className="main-content">
            <Header />
            <div className="page-wrapper">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/incidents" element={<Incidents />} />
                <Route path="/map" element={<LiveMap />} />
                <Route path="/sos" element={<SOS />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/ai-analysis" element={<AIAnalysis />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
