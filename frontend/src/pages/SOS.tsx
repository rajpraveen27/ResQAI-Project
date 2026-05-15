import React, { useState, useEffect } from 'react';
import { Alert } from '../types';
import './SOS.css';

const SOS: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [sosLocation, setSosLocation] = useState('');
  const [sosMessage, setSosMessage] = useState('');

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/alerts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo_token'}`
        }
      });
      const data = await response.json();
      if (data.alerts) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching real alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter(a => a.acknowledged);

  const handleSOSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sosLocation || !sosMessage) return;
    
    try {
      await fetch('http://localhost:5000/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo_token'}`
        },
        body: JSON.stringify({
          title: 'SOS EMERGENCY SIGNAL',
          message: sosMessage,
          severity: 'critical',
          type: 'sos',
          location: sosLocation,
        }),
      });
      fetchAlerts();
      setIsSOSActive(false);
      setSosLocation('');
      setSosMessage('');
    } catch (error) {
      console.error('Error submitting SOS:', error);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/alerts/${id}/acknowledge`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo_token'}`
        }
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  return (
    <div className="sos-page">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ color: '#ef4444' }}>🚨 SOS & Alerts Center</h1>
          <p className="page-subtitle">Manage emergency signals and system alerts</p>
        </div>
        <button 
          className="btn btn-danger pulse-button" 
          onClick={() => setIsSOSActive(true)}
        >
          BROADCAST SOS
        </button>
      </div>

      <div className="grid-2">
        <div className="alerts-column">
          <h2 className="column-title">Active Alerts ({activeAlerts.length})</h2>
          <div className="alerts-list">
            {activeAlerts.map(alert => (
              <div key={alert.id} className={`glass-card alert-card severity-${alert.severity}`}>
                <div className="alert-header">
                  <div className="alert-title">
                    {alert.type === 'sos' ? '🆘' : '⚠️'} {alert.title}
                  </div>
                  <div className="alert-time">{new Date(alert.timestamp || alert.created_at || new Date().toISOString()).toLocaleTimeString()}</div>
                </div>
                <div className="alert-body">
                  <p>{alert.message}</p>
                  <div className="alert-meta">
                    <span>📍 {alert.location}</span>
                    <span>👤 {alert.reportedBy || alert.source || 'System'}</span>
                  </div>
                </div>
                <div className="alert-actions">
                  <button className="btn btn-sm btn-ghost" onClick={() => handleAcknowledge(alert.id)}>
                    ✓ Acknowledge
                  </button>
                </div>
              </div>
            ))}
            {activeAlerts.length === 0 && (
              <div className="empty-state">No active alerts. Situation normal.</div>
            )}
          </div>
        </div>

        <div className="alerts-column">
          <h2 className="column-title">Acknowledged Alerts</h2>
          <div className="alerts-list">
            {acknowledgedAlerts.map(alert => (
              <div key={alert.id} className="glass-card alert-card acknowledged">
                <div className="alert-header">
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-time">{new Date(alert.timestamp || alert.created_at || new Date().toISOString()).toLocaleTimeString()}</div>
                </div>
                <div className="alert-body">
                  <p>{alert.message}</p>
                  <div className="alert-meta">
                    <span>📍 {alert.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isSOSActive && (
        <div className="modal-overlay" onClick={() => setIsSOSActive(false)}>
          <div className="modal-box danger-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ color: '#ef4444' }}>🚨 ACTIVATE SOS</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsSOSActive(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '20px', color: '#fca5a5' }}>
                Warning: This will broadcast an immediate critical alert to all rescue coordinators in the vicinity.
              </p>
              <form onSubmit={handleSOSSubmit}>
                <div className="form-group">
                  <label className="form-label">Your Location</label>
                  <input 
                    className="form-input" 
                    required 
                    placeholder="E.g. Roof of building 4, MG Road"
                    value={sosLocation}
                    onChange={e => setSosLocation(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Situation / Message</label>
                  <textarea 
                    className="form-input" 
                    required 
                    rows={4}
                    placeholder="Describe the emergency..."
                    value={sosMessage}
                    onChange={e => setSosMessage(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setIsSOSActive(false)}>Cancel</button>
                  <button type="submit" className="btn btn-danger">BROADCAST SIGNAL</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOS;
