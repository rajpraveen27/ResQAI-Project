import React, { useState } from 'react';
import { mockRescueTeams } from '../data/mockData';
import { RescueTeam } from '../types';
import './Teams.css';

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<RescueTeam[]>(mockRescueTeams);
  const [selected, setSelected] = useState<RescueTeam | null>(null);

  const statusColor: Record<string, string> = {
    available: '#22c55e', deployed: '#ef4444', returning: '#f97316',
  };

  const deployed = teams.filter(t => t.status === 'deployed').length;
  const available = teams.filter(t => t.status === 'available').length;

  return (
    <div className="teams-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 Rescue Teams</h1>
          <p className="page-subtitle">Monitor all rescue team deployments and missions</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '10px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 700 }}>AVAILABLE</div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '26px', fontWeight: 700, color: '#22c55e' }}>{available}</div>
          </div>
          <div className="glass-card" style={{ padding: '10px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700 }}>DEPLOYED</div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '26px', fontWeight: 700, color: '#ef4444' }}>{deployed}</div>
          </div>
        </div>
      </div>

      <div className="teams-grid">
        {teams.map(team => (
          <div
            key={team.id}
            className={`glass-card team-card ${team.status === 'deployed' ? 'danger' : ''}`}
            onClick={() => setSelected(team)}
          >
            <div className="team-card-header">
              <div className="team-card-avatar">{team.name[0]}</div>
              <div>
                <div className="team-card-id">{team.id}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="pulse-dot" style={{ background: statusColor[team.status] }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: statusColor[team.status], textTransform: 'capitalize' }}>{team.status}</span>
                </div>
              </div>
            </div>
            <div className="team-card-name">{team.name}</div>
            <div className="team-card-spec">{team.specialization}</div>
            <div className="team-card-stats">
              <div className="team-stat">
                <span className="team-stat-label">Leader</span>
                <span className="team-stat-val">{team.leader.split(' ').slice(-1)[0]}</span>
              </div>
              <div className="team-stat">
                <span className="team-stat-label">Members</span>
                <span className="team-stat-val text-green">{team.members}</span>
              </div>
              <div className="team-stat">
                <span className="team-stat-label">Location</span>
                <span className="team-stat-val" style={{ fontSize: '10px' }}>{team.location.split(',')[0]}</span>
              </div>
            </div>
            {team.currentMission && (
              <div className="team-mission">
                <span>🎯 Mission:</span>
                <span style={{ color: '#f97316', fontWeight: 600 }}>{team.currentMission}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700, marginBottom: '4px' }}>{selected.id}</div>
                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{selected.name}</h2>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{selected.specialization}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="grid-2" style={{ marginBottom: '20px' }}>
                {[
                  { label: 'Leader', value: selected.leader },
                  { label: 'Members', value: selected.members },
                  { label: 'Status', value: selected.status },
                  { label: 'Location', value: selected.location },
                ].map(item => (
                  <div key={item.label} className="detail-stat" style={{ textAlign: 'left', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div className="detail-stat-label">{item.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9', marginTop: '4px' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              {selected.currentMission && (
                <div style={{ padding: '14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', marginBottom: '4px', letterSpacing: '0.8px' }}>ACTIVE MISSION</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{selected.currentMission}</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
                <button className="btn btn-primary">📡 Contact Team</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
