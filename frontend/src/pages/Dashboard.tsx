import React, { useState, useEffect } from 'react';
import { mockAlerts, mockDashboardStats, generateTimeSeriesData, mockIncidents, mockRescueTeams, incidentTypeIcons } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [timeData, setTimeData] = useState(generateTimeSeriesData(12));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = {
    ...mockDashboardStats,
    activeIncidents: incidents.filter(i => i.status !== 'resolved').length,
    pendingSOS: incidents.filter(i => i.type === 'sos' && i.status !== 'resolved').length
  };

  const unacknowledgedAlerts = mockAlerts.filter(a => !a.acknowledged);

  const fetchIncidents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/incidents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo_token'}`
        }
      });
      const data = await response.json();
      if (data.incidents) {
        setIncidents(data.incidents);
      }
    } catch (error) {
      console.error('Error fetching real incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      fetchIncidents(); // Refresh every 30 seconds
      setTimeData(prev => {
        const updated = [...prev.slice(1)];
        updated.push({
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          incidents: Math.floor(Math.random() * 8) + 1,
          resolved: Math.floor(Math.random() * 5),
          sos: Math.floor(Math.random() * 4),
        });
        return updated;
      });
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const severityColor: Record<string, string> = {
    critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e',
  };

  const statusColor: Record<string, string> = {
    active: '#ef4444', responding: '#f97316', monitoring: '#3b82f6', resolved: '#22c55e',
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🚨 Command Center</h1>
          <p className="page-subtitle">
            Real-time disaster monitoring &amp; response coordination
          </p>
        </div>
        <div className="header-right">
          <div className="live-clock">
            <span className="pulse-dot red" />
            <span className="clock-text font-mono">
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="clock-date">{currentTime.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          {unacknowledgedAlerts.length > 0 && (
            <div className="alert-banner">
              <span>⚠️</span>
              <span>{unacknowledgedAlerts.length} unacknowledged alerts</span>
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid-4 mb-20">
        <div className="glass-card metric-card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="metric-label">Active Incidents</div>
              <div className="metric-value text-red">{stats.activeIncidents}</div>
              <div className="metric-sub mt-4">↑ 2 since yesterday</div>
            </div>
            <div className="metric-icon" style={{ background: 'rgba(239,68,68,0.15)', fontSize: '22px' }}>🚨</div>
          </div>
        </div>

        <div className="glass-card metric-card" style={{ borderColor: 'rgba(34,197,94,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="metric-label">Teams Deployed</div>
              <div className="metric-value text-green">{stats.rescueTeamsDeployed}</div>
              <div className="metric-sub mt-4">of 6 total teams</div>
            </div>
            <div className="metric-icon" style={{ background: 'rgba(34,197,94,0.12)', fontSize: '22px' }}>👥</div>
          </div>
        </div>

        <div className="glass-card metric-card" style={{ borderColor: 'rgba(249,115,22,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="metric-label">People Affected</div>
              <div className="metric-value text-orange">{stats.peopleAffected.toLocaleString()}</div>
              <div className="metric-sub mt-4">Across all regions</div>
            </div>
            <div className="metric-icon" style={{ background: 'rgba(249,115,22,0.12)', fontSize: '22px' }}>🧑‍🤝‍🧑</div>
          </div>
        </div>

        <div className="glass-card metric-card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="metric-label">Pending SOS</div>
              <div className="metric-value text-red">{stats.pendingSOS}</div>
              <div className="metric-sub mt-4 text-red">⚠️ Immediate action needed</div>
            </div>
            <div className="metric-icon" style={{ background: 'rgba(239,68,68,0.15)', fontSize: '22px', animation: 'sos-pulse 1.5s infinite' }}>🆘</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2 mb-20">
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="chart-header">
            <div className="chart-title">Incident Activity (Live)</div>
            <div className="chart-legend">
              <span className="legend-dot" style={{ background: '#ef4444' }} />Incidents
              <span className="legend-dot" style={{ background: '#22c55e' }} />Resolved
              <span className="legend-dot" style={{ background: '#f97316' }} />SOS
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={timeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
              <Area type="monotone" dataKey="incidents" stroke="#ef4444" fill="url(#incGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="resolved" stroke="#22c55e" fill="url(#resGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="chart-header">
            <div className="chart-title">SOS Signals by Hour</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={timeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
              <Bar dataKey="sos" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Incidents + Teams */}
      <div className="grid-2">
        {/* Active Incidents */}
        <div className="glass-card">
          <div className="card-section-header">
            <span>🚨 Active Incidents (Real-time)</span>
            <span className="badge badge-critical">{incidents.length} ACTIVE</span>
          </div>
          <div className="incident-list">
            {incidents.slice(0, 5).map(inc => (
              <div key={inc.id} className="incident-row">
                <div className="incident-type-icon">{incidentTypeIcons[inc.type]}</div>
                <div className="incident-info">
                  <div className="incident-title">{inc.title}</div>
                  <div className="incident-meta">
                    <span>📍 {inc.location}</span>
                    <span>👥 {(inc.affectedCount || inc.affected_count || 0).toLocaleString()} affected</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span className={`badge badge-${inc.severity}`}>{inc.severity}</span>
                  <span style={{ fontSize: '11px', color: statusColor[inc.status] }}>{inc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rescue Teams */}
        <div className="glass-card">
          <div className="card-section-header">
            <span>👥 Rescue Teams</span>
            <span className="badge badge-info">
              {mockRescueTeams.filter(t => t.status === 'deployed').length} deployed
            </span>
          </div>
          <div className="incident-list">
            {mockRescueTeams.map(team => (
              <div key={team.id} className="team-row">
                <div className="team-avatar">
                  {team.name[0]}
                </div>
                <div className="incident-info">
                  <div className="incident-title">{team.name}</div>
                  <div className="incident-meta">
                    <span>👤 {team.leader}</span>
                    <span>👥 {team.members} members</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{team.specialization}</div>
                </div>
                <span className={`badge ${team.status === 'deployed' ? 'badge-high' : 'badge-low'}`}>
                  {team.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
