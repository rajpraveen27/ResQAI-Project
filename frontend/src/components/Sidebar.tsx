import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const navItems = [
  { path: '/', icon: '⬡', label: 'Command Center', roles: ['admin', 'coordinator', 'rescue_team', 'citizen'] },
  { path: '/incidents', icon: '🚨', label: 'Incidents', roles: ['admin', 'coordinator', 'rescue_team', 'citizen'] },
  { path: '/map', icon: '🗺️', label: 'Live Map', roles: ['admin', 'coordinator', 'rescue_team', 'citizen'] },
  { path: '/sos', icon: '🆘', label: 'SOS / Alerts', roles: ['admin', 'coordinator', 'rescue_team', 'citizen'] },
  { path: '/resources', icon: '📦', label: 'Resources', roles: ['admin', 'coordinator'] },
  { path: '/teams', icon: '👥', label: 'Rescue Teams', roles: ['admin', 'coordinator'] },
  { path: '/ai-analysis', icon: '🤖', label: 'AI Analysis', roles: ['admin', 'coordinator'] },
  { path: '/admin', icon: '⚙️', label: 'Admin Panel', roles: ['admin'] },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const roleLabel: Record<string, string> = {
    admin: 'Administrator',
    coordinator: 'Coordinator',
    rescue_team: 'Rescue Team',
    citizen: 'Citizen',
  };

  const roleColor: Record<string, string> = {
    admin: '#ef4444',
    coordinator: '#f97316',
    rescue_team: '#22c55e',
    citizen: '#3b82f6',
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <span>🚑</span>
        </div>
        {!collapsed && (
          <div className="logo-text">
            <span className="logo-name">ResQAI</span>
            <span className="logo-tagline">Disaster Response</span>
          </div>
        )}
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} title="Toggle sidebar">
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Status */}
      {!collapsed && (
        <div className="sidebar-status">
          <span className="pulse-dot red" />
          <span className="status-text">LIVE MONITORING</span>
        </div>
      )}

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems
          .filter(item => item.roles.includes(user.role))
          .map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
              {item.path === '/sos' && !collapsed && (
                <span className="nav-badge">3</span>
              )}
            </NavLink>
          ))}
      </nav>

      {/* User profile */}
      <NavLink to="/profile" className="sidebar-user-link">
        <div className="sidebar-user">
          <div className="user-avatar">{user.name[0]}</div>
          {!collapsed && (
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role" style={{ color: roleColor[user.role] }}>
                {roleLabel[user.role]}
              </div>
            </div>
          )}
        </div>
      </NavLink>
    </aside>
  );
};

export default Sidebar;
