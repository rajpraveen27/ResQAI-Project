import React, { useState } from 'react';
import { mockIncidents, incidentTypeIcons } from '../data/mockData';
import { Incident, IncidentSeverity, IncidentStatus, IncidentType } from '../types';
import './Incidents.css';

const Incidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [filter, setFilter] = useState<{ severity: string; status: string; type: string }>({ severity: '', status: '', type: '' });
  const [selected, setSelected] = useState<Incident | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'flood', severity: 'high', location: '', description: '', affectedCount: '' });

  const filtered = incidents.filter(i =>
    (!filter.severity || i.severity === filter.severity) &&
    (!filter.status || i.status === filter.status) &&
    (!filter.type || i.type === filter.type)
  );

  const severityColor: Record<string, string> = {
    critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInc: Incident = {
      id: `INC-00${incidents.length + 1}`,
      title: form.title,
      type: form.type as IncidentType,
      severity: form.severity as IncidentSeverity,
      status: 'active',
      location: form.location,
      coordinates: [20.5937, 78.9629],
      reportedBy: 'You',
      reportedAt: new Date().toISOString(),
      description: form.description,
      affectedCount: parseInt(form.affectedCount) || 0,
      rescueTeams: [],
      aiSeverityScore: Math.floor(Math.random() * 40) + 50,
    };
    setIncidents(prev => [newInc, ...prev]);
    setShowForm(false);
    setForm({ title: '', type: 'flood', severity: 'high', location: '', description: '', affectedCount: '' });
  };

  return (
    <div className="incidents-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🚨 Incident Management</h1>
          <p className="page-subtitle">Track, manage and respond to all disaster incidents</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Report Incident</button>
      </div>

      {/* Filters */}
      <div className="glass-card filter-bar mb-20">
        <div className="filter-group">
          <label className="form-label">Severity</label>
          <select className="form-select" value={filter.severity} onChange={e => setFilter(p => ({ ...p, severity: e.target.value }))}>
            <option value="">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="responding">Responding</option>
            <option value="monitoring">Monitoring</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="form-label">Type</label>
          <select className="form-select" value={filter.type} onChange={e => setFilter(p => ({ ...p, type: e.target.value }))}>
            <option value="">All</option>
            <option value="flood">Flood</option>
            <option value="earthquake">Earthquake</option>
            <option value="fire">Fire</option>
            <option value="cyclone">Cyclone</option>
            <option value="landslide">Landslide</option>
            <option value="chemical">Chemical</option>
          </select>
        </div>
        <div className="filter-count">
          <span>{filtered.length}</span> incidents
        </div>
      </div>

      {/* Incident Cards */}
      <div className="incidents-grid">
        {filtered.map(inc => (
          <div
            key={inc.id}
            className={`glass-card incident-card ${inc.severity === 'critical' ? 'danger' : ''}`}
            onClick={() => setSelected(inc)}
          >
            <div className="inc-card-header">
              <div className="inc-type-badge">
                <span className="inc-icon">{incidentTypeIcons[inc.type]}</span>
                <span className="inc-type-text">{inc.type}</span>
              </div>
              <span className={`badge badge-${inc.severity}`}>{inc.severity}</span>
            </div>
            <div className="inc-title">{inc.title}</div>
            <div className="inc-location">📍 {inc.location}</div>
            <p className="inc-desc">{inc.description.substring(0, 100)}...</p>
            <div className="inc-footer">
              <div className="inc-stat">
                <span className="inc-stat-label">Affected</span>
                <span className="inc-stat-value text-orange">{inc.affectedCount.toLocaleString()}</span>
              </div>
              <div className="inc-stat">
                <span className="inc-stat-label">AI Score</span>
                <span className="inc-stat-value" style={{ color: severityColor[inc.severity] }}>{inc.aiSeverityScore}%</span>
              </div>
              <div className="inc-stat">
                <span className="inc-stat-label">Teams</span>
                <span className="inc-stat-value text-green">{inc.rescueTeams.length}</span>
              </div>
              <span className={`badge badge-${inc.status === 'active' ? 'critical' : inc.status === 'responding' ? 'high' : inc.status === 'monitoring' ? 'info' : 'resolved'}`}>
                {inc.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 600, marginBottom: '4px' }}>{selected.id}</div>
                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{selected.title}</h2>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>📍 {selected.location}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-badges" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <span className={`badge badge-${selected.severity}`}>{selected.severity}</span>
                <span className={`badge badge-info`}>{selected.type}</span>
                <span className={`badge badge-${selected.status === 'resolved' ? 'resolved' : 'high'}`}>{selected.status}</span>
              </div>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '20px' }}>{selected.description}</p>
              <div className="grid-3" style={{ marginBottom: '20px' }}>
                <div className="detail-stat">
                  <div className="detail-stat-label">Affected</div>
                  <div className="detail-stat-value text-orange">{selected.affectedCount.toLocaleString()}</div>
                </div>
                <div className="detail-stat">
                  <div className="detail-stat-label">AI Severity</div>
                  <div className="detail-stat-value text-red">{selected.aiSeverityScore}%</div>
                </div>
                <div className="detail-stat">
                  <div className="detail-stat-label">Teams</div>
                  <div className="detail-stat-value text-green">{selected.rescueTeams.join(', ') || 'None'}</div>
                </div>
              </div>
              {selected.updates && selected.updates.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '10px' }}>Updates</div>
                  {selected.updates.map(u => (
                    <div key={u.id} className="update-row">
                      <div style={{ fontSize: '13px', color: '#f1f5f9' }}>{u.message}</div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{u.author} · {new Date(u.timestamp).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>🚨 Report New Incident</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Incident Title *</label>
                  <input className="form-input" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Brief description of the disaster" />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                      <option value="flood">Flood</option>
                      <option value="earthquake">Earthquake</option>
                      <option value="fire">Fire</option>
                      <option value="cyclone">Cyclone</option>
                      <option value="landslide">Landslide</option>
                      <option value="chemical">Chemical</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Severity</label>
                    <select className="form-select" value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input className="form-input" required value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="City, State" />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Affected</label>
                  <input className="form-input" type="number" value={form.affectedCount} onChange={e => setForm(p => ({ ...p, affectedCount: e.target.value }))} placeholder="Number of people affected" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea className="form-textarea" required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the situation in detail..." />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Submit Report</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
