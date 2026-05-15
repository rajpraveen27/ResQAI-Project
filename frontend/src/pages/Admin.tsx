import React, { useState } from 'react';
import { mockUsers, mockIncidents, mockResources, mockRescueTeams } from '../data/mockData';
import { User, UserRole } from '../types';
import './Admin.css';

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'logs'>('users');

  const roleColor: Record<string, string> = {
    admin: '#ef4444', coordinator: '#f97316', rescue_team: '#22c55e', citizen: '#3b82f6',
  };

  const systemHealth = [
    { name: 'API Server', status: 'online', uptime: '99.98%', latency: '12ms' },
    { name: 'AI Engine (FastAPI)', status: 'online', uptime: '99.91%', latency: '45ms' },
    { name: 'PostgreSQL DB', status: 'online', uptime: '100%', latency: '3ms' },
    { name: 'Redis Cache', status: 'online', uptime: '99.99%', latency: '1ms' },
    { name: 'Notification Service', status: 'online', uptime: '99.85%', latency: '88ms' },
    { name: 'WebSocket Server', status: 'online', uptime: '99.92%', latency: '8ms' },
    { name: 'Kubernetes Cluster', status: 'online', uptime: '99.97%', latency: '—' },
    { name: 'Grafana Dashboard', status: 'online', uptime: '99.89%', latency: '—' },
  ];

  const auditLogs = [
    { id: 1, action: 'Incident INC-001 created', user: 'Admin Priya Sharma', time: '2026-05-08T10:15:00Z', type: 'incident' },
    { id: 2, action: 'Team RT-Alpha deployed to Silchar', user: 'Cdr. Rajan Mehta', time: '2026-05-08T10:30:00Z', type: 'team' },
    { id: 3, action: 'SOS Alert acknowledged (ALT-002)', user: 'Admin Priya Sharma', time: '2026-05-08T10:55:00Z', type: 'alert' },
    { id: 4, action: 'Resource RES-005 deployed to Silchar', user: 'Admin Priya Sharma', time: '2026-05-08T11:00:00Z', type: 'resource' },
    { id: 5, action: 'AI Analysis run for INC-001', user: 'System', time: '2026-05-08T11:05:00Z', type: 'ai' },
    { id: 6, action: 'User Dr. Sunita Rao logged in', user: 'System', time: '2026-05-08T09:45:00Z', type: 'auth' },
    { id: 7, action: 'Cyclone warning alert generated', user: 'IMD Integration', time: '2026-05-08T11:00:00Z', type: 'alert' },
  ];

  const logTypeColor: Record<string, string> = {
    incident: '#ef4444', team: '#22c55e', alert: '#f97316', resource: '#3b82f6', ai: '#a855f7', auth: '#06b6d4',
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isOnline: !u.isOnline } : u));
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Admin Panel</h1>
          <p className="page-subtitle">System management, user control and health monitoring</p>
        </div>
      </div>

      {/* Overview */}
      <div className="grid-4 mb-20">
        <div className="glass-card metric-card">
          <div className="metric-label">Total Users</div>
          <div className="metric-value">{users.length}</div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-label">Total Incidents</div>
          <div className="metric-value text-red">{mockIncidents.length}</div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-label">Resources Tracked</div>
          <div className="metric-value text-blue">{mockResources.length}</div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-label">Rescue Teams</div>
          <div className="metric-value text-green">{mockRescueTeams.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs mb-20">
        {(['users', 'system', 'logs'] as const).map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'users' ? '👥 Users' : tab === 'system' ? '💻 System Health' : '📋 Audit Logs'}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="glass-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #ef4444, #7c3aed)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', color: 'white', flexShrink: 0 }}>
                          {user.name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '13px' }}>{user.name}</div>
                          <div style={{ fontSize: '11px', color: '#475569' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: `${roleColor[user.role]}20`, color: roleColor[user.role], border: `1px solid ${roleColor[user.role]}40` }}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{user.location || '—'}</td>
                    <td className="font-mono" style={{ fontSize: '12px' }}>{user.phone || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`pulse-dot ${user.isOnline ? 'green' : ''}`} style={{ background: user.isOnline ? '#22c55e' : '#475569' }} />
                        <span style={{ fontSize: '12px', color: user.isOnline ? '#22c55e' : '#475569', fontWeight: 600 }}>
                          {user.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleUserStatus(user.id)}>
                        {user.isOnline ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Health Tab */}
      {activeTab === 'system' && (
        <div className="glass-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Uptime</th>
                  <th>Latency</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {systemHealth.map((svc, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{svc.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="pulse-dot green" />
                        <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>{svc.status.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="font-mono" style={{ color: '#22c55e', fontSize: '12px' }}>{svc.uptime}</td>
                    <td className="font-mono" style={{ fontSize: '12px' }}>{svc.latency}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm">Restart</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'logs' && (
        <div className="glass-card">
          {auditLogs.map(log => (
            <div key={log.id} className="log-row">
              <div className="log-type-dot" style={{ background: logTypeColor[log.type] }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: 500 }}>{log.action}</div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                  👤 {log.user} · 🕐 {new Date(log.time).toLocaleString('en-IN')}
                </div>
              </div>
              <span className="badge badge-info" style={{ fontSize: '10px' }}>{log.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
