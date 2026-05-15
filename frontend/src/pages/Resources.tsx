import React, { useState } from 'react';
import { mockResources } from '../data/mockData';
import { Resource, ResourceStatus, ResourceType } from '../types';
import './Resources.css';

const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'medical', quantity: '', location: '' });

  const filtered = resources.filter(r =>
    (!filter || r.status === filter) &&
    (!typeFilter || r.type === typeFilter) &&
    true
  );

  const statusColor: Record<string, string> = {
    available: '#22c55e', deployed: '#ef4444', in_transit: '#f97316', maintenance: '#8b5cf6',
  };

  const typeIcon: Record<string, string> = {
    medical: '🏥', food: '🍱', shelter: '⛺', rescue_vehicle: '🚒', helicopter: '🚁', boat: '⛵', personnel: '👷',
  };

  const totals = {
    available: resources.filter(r => r.status === 'available').length,
    deployed: resources.filter(r => r.status === 'deployed').length,
    in_transit: resources.filter(r => r.status === 'in_transit').length,
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    const newRes: Resource = {
      id: `RES-${String(resources.length + 1).padStart(3, '0')}`,
      name: form.name,
      type: form.type as ResourceType,
      quantity: parseInt(form.quantity) || 1,
      status: 'available',
      location: form.location,
      lastUpdated: new Date().toISOString(),
    };
    setResources(prev => [...prev, newRes]);
    setShowForm(false);
    setForm({ name: '', type: 'medical', quantity: '', location: '' });
  };

  const deploy = (id: string) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, status: 'deployed' as ResourceStatus } : r));
  };

  return (
    <div className="resources-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📦 Resource Management</h1>
          <p className="page-subtitle">Track and allocate emergency resources across all disaster zones</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Resource</button>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-20">
        <div className="glass-card metric-card" style={{ borderColor: 'rgba(34,197,94,0.2)' }}>
          <div className="metric-label">Available</div>
          <div className="metric-value text-green">{totals.available}</div>
        </div>
        <div className="glass-card metric-card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
          <div className="metric-label">Deployed</div>
          <div className="metric-value text-red">{totals.deployed}</div>
        </div>
        <div className="glass-card metric-card" style={{ borderColor: 'rgba(249,115,22,0.2)' }}>
          <div className="metric-label">In Transit</div>
          <div className="metric-value text-orange">{totals.in_transit}</div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-label">Total Resources</div>
          <div className="metric-value">{resources.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card filter-bar mb-20">
        <div className="filter-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="deployed">Deployed</option>
            <option value="in_transit">In Transit</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="form-label">Type</label>
          <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All</option>
            <option value="medical">Medical</option>
            <option value="food">Food</option>
            <option value="shelter">Shelter</option>
            <option value="boat">Boat</option>
            <option value="helicopter">Helicopter</option>
            <option value="personnel">Personnel</option>
          </select>
        </div>
        <div className="filter-count">{filtered.length} resources</div>
      </div>

      {/* Table */}
      <div className="glass-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Location</th>
                <th>Assigned To</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(res => (
                <tr key={res.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{res.name}</div>
                    <div style={{ fontSize: '11px', color: '#475569' }}>{res.id}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '16px' }}>{typeIcon[res.type]}</span>{' '}
                    <span style={{ textTransform: 'capitalize', fontSize: '12px' }}>{res.type.replace('_', ' ')}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '20px', fontWeight: 700, color: '#f1f5f9' }}>
                      {res.quantity.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className="res-status-dot" style={{ background: statusColor[res.status] }} />
                    <span style={{ color: statusColor[res.status], fontWeight: 600, fontSize: '12px', textTransform: 'capitalize' }}>
                      {res.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{res.location}</td>
                  <td style={{ color: res.assignedTo ? '#f97316' : '#475569' }}>{res.assignedTo || '—'}</td>
                  <td>
                    {res.status === 'available' ? (
                      <button className="btn btn-warning btn-sm" onClick={() => deploy(res.id)}>Deploy</button>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#475569' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resource Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>📦 Add Resource</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddResource}>
                <div className="form-group">
                  <label className="form-label">Resource Name *</label>
                  <input className="form-input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Medical Kits (x100)" />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                      <option value="medical">Medical</option>
                      <option value="food">Food</option>
                      <option value="shelter">Shelter</option>
                      <option value="boat">Boat</option>
                      <option value="helicopter">Helicopter</option>
                      <option value="personnel">Personnel</option>
                      <option value="rescue_vehicle">Rescue Vehicle</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input className="form-input" type="number" required value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} placeholder="e.g. 100" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input className="form-input" required value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Storage location" />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Resource</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
