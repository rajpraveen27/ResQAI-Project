import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const pageNames: Record<string, string> = {
  '/': 'Command Center',
  '/incidents': 'Incident Management',
  '/map': 'Live Disaster Map',
  '/sos': 'SOS & Alerts',
  '/resources': 'Resource Management',
  '/teams': 'Rescue Teams',
  '/ai-analysis': 'AI Analysis',
  '/admin': 'Admin Panel',
};

const Header: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [showNotif, setShowNotif] = useState(false);
  const [counts, setCounts] = useState({ incidents: 0, teams: 0 });

  const fetchCounts = async () => {
    try {
      const incRes = await fetch('http://localhost:5000/api/incidents?status=active');
      const incData = await incRes.json();
      
      const teamRes = await fetch('http://localhost:5000/api/teams?status=deployed');
      const teamData = await teamRes.json();
      
      setCounts({
        incidents: incData.total || 0,
        teams: teamData.total || 0
      });
    } catch (error) {
      console.error('Error fetching header counts:', error);
    }
  };

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    fetchCounts();
    const c = setInterval(fetchCounts, 30000); // Refresh every 30s
    return () => {
      clearInterval(t);
      clearInterval(c);
    };
  }, []);

  const pageName = pageNames[location.pathname] || 'ResQAI';
  const notifications = [
    { id: 1, text: 'Critical: Flooding in Silchar spreading NE', time: '2 min ago', color: '#ef4444' },
    { id: 2, text: 'SOS received from 3 civilians in Silchar Ward 7', time: '5 min ago', color: '#ef4444' },
    { id: 3, text: 'Cyclone warning issued for coastal Odisha', time: '10 min ago', color: '#f97316' },
  ];

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="breadcrumb">
          <span className="breadcrumb-root">ResQAI</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-page">{pageName}</span>
        </div>
      </div>
      <div className="header-right">
        {/* Live indicators */}
        <div className="header-indicators">
          <div className="indicator">
            <span className="pulse-dot red" />
            <span className="indicator-label">{counts.incidents} Active</span>
          </div>
          <div className="indicator separator">
            <span className="pulse-dot green" />
            <span className="indicator-label">{counts.teams} Teams Out</span>
          </div>
        </div>

        {/* Clock */}
        <div className="header-clock">
          {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
        </div>

        {/* Notifications */}
        <div className="notif-wrap" onClick={() => setShowNotif(!showNotif)}>
          <button className="notif-btn" title="Notifications">
            🔔
            <span className="notif-count">3</span>
          </button>
          {showNotif && (
            <div className="notif-dropdown">
              <div className="notif-header">Notifications</div>
              {notifications.map(n => (
                <div key={n.id} className="notif-item">
                  <div className="notif-dot" style={{ background: n.color }} />
                  <div>
                    <div className="notif-text">{n.text}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User chip */}
        <div className="header-user">
          <div className="header-user-avatar">{user.name[0]}</div>
          <div className="header-user-name">{user.name.split(' ')[0]}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
