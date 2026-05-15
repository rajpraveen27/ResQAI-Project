import React, { useState } from 'react';
import { mockIncidents, mockRescueTeams, incidentTypeIcons } from '../data/mockData';
import './LiveMap.css';

const LiveMap: React.FC = () => {
  const [selectedInc, setSelectedInc] = useState<string | null>(null);
  const [mapFilter, setMapFilter] = useState('all');

  const incidents = mockIncidents.filter(i =>
    mapFilter === 'all' || i.severity === mapFilter || i.status === mapFilter
  );

  const severityColor: Record<string, string> = {
    critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e', monitoring: '#3b82f6',
  };

  // SVG-based India map with incident pins
  const indiaViewBox = "55 5 45 40";

  const pins = incidents.map(inc => {
    // Convert lat/lng to SVG coords (approximate for India bounding box)
    const svgX = ((inc.coordinates[1] - 68) / 30) * 38 + 57;
    const svgY = ((36 - inc.coordinates[0]) / 30) * 35 + 7;
    return { ...inc, svgX, svgY };
  });

  const teamPins = mockRescueTeams.map(team => {
    const svgX = ((team.coordinates[1] - 68) / 30) * 38 + 57;
    const svgY = ((36 - team.coordinates[0]) / 30) * 35 + 7;
    return { ...team, svgX, svgY };
  });

  const selected = incidents.find(i => i.id === selectedInc);

  return (
    <div className="map-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🗺️ Live Disaster Map</h1>
          <p className="page-subtitle">Real-time incident locations, team positions and resource tracking</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'critical', 'high', 'active', 'responding'].map(f => (
            <button key={f} className={`btn btn-sm ${mapFilter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMapFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="map-layout">
        {/* Map Canvas */}
        <div className="glass-card map-canvas-wrap">
          <div className="map-legend">
            <div className="legend-item"><span className="leg-dot" style={{ background: '#ef4444' }} />Critical</div>
            <div className="legend-item"><span className="leg-dot" style={{ background: '#f97316' }} />High</div>
            <div className="legend-item"><span className="leg-dot" style={{ background: '#eab308' }} />Medium</div>
            <div className="legend-item"><span className="leg-dot leg-team" />Rescue Team</div>
          </div>
          <svg viewBox="55 5 45 40" className="map-svg" xmlns="http://www.w3.org/2000/svg">
            {/* India outline (simplified) */}
            <path
              d="M72,8 L76,7 L80,8 L84,10 L88,12 L91,15 L93,18 L94,22 L93,26 L91,29 L89,32 L86,35 L83,37 L80,38 L77,37 L74,35 L71,32 L69,28 L68,24 L68,20 L69,16 L70,12 Z"
              fill="rgba(59,130,246,0.06)"
              stroke="rgba(59,130,246,0.2)"
              strokeWidth="0.3"
            />
            {/* Grid lines */}
            {[60,65,70,75,80,85,90,95].map(x => (
              <line key={x} x1={x} y1="5" x2={x} y2="45" stroke="rgba(255,255,255,0.04)" strokeWidth="0.15" />
            ))}
            {[10,15,20,25,30,35,40].map(y => (
              <line key={y} x1="55" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.15" />
            ))}

            {/* Team pins */}
            {teamPins.map(team => (
              <g key={team.id}>
                <circle cx={team.svgX} cy={team.svgY} r="0.7" fill="#22c55e" opacity={0.9} />
                <circle cx={team.svgX} cy={team.svgY} r="1.4" fill="none" stroke="#22c55e" strokeWidth="0.2" opacity={0.4} />
              </g>
            ))}

            {/* Incident pins */}
            {pins.map(inc => (
              <g key={inc.id} onClick={() => setSelectedInc(inc.id === selectedInc ? null : inc.id)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={inc.svgX} cy={inc.svgY} r="1.8"
                  fill={severityColor[inc.severity]}
                  opacity={0.85}
                  stroke={inc.id === selectedInc ? 'white' : 'none'}
                  strokeWidth="0.4"
                />
                <circle cx={inc.svgX} cy={inc.svgY} r="3.2" fill="none" stroke={severityColor[inc.severity]} strokeWidth="0.3" opacity={0.35}>
                  <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x={inc.svgX} y={inc.svgY - 2.5} textAnchor="middle" fontSize="1.2" fill="white" opacity={0.9}>
                  {incidentTypeIcons[inc.type]}
                </text>
              </g>
            ))}
          </svg>

          {/* Selected tooltip */}
          {selected && (
            <div className="map-tooltip">
              <div className="map-tooltip-header">
                <span>{incidentTypeIcons[selected.type]} {selected.title}</span>
                <button onClick={() => setSelectedInc(null)}>✕</button>
              </div>
              <div className="map-tooltip-body">
                <div>📍 {selected.location}</div>
                <div>👥 {selected.affectedCount.toLocaleString()} affected</div>
                <div>🤖 AI Score: <strong style={{ color: severityColor[selected.severity] }}>{selected.aiSeverityScore}%</strong></div>
                <div>Teams: {selected.rescueTeams.join(', ') || 'None assigned'}</div>
              </div>
              <span className={`badge badge-${selected.severity}`}>{selected.severity}</span>
            </div>
          )}
        </div>

        {/* Sidebar list */}
        <div className="map-sidebar">
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: '#f1f5f9' }}>
              📍 Active Locations ({incidents.length})
            </div>
            {incidents.map(inc => (
              <div
                key={inc.id}
                className={`map-list-item ${selectedInc === inc.id ? 'selected' : ''}`}
                onClick={() => setSelectedInc(inc.id === selectedInc ? null : inc.id)}
              >
                <span style={{ fontSize: '18px' }}>{incidentTypeIcons[inc.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.title}</div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>{inc.location}</div>
                </div>
                <span className={`badge badge-${inc.severity}`} style={{ fontSize: '9px' }}>{inc.severity}</span>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ padding: '16px', marginTop: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: '#f1f5f9' }}>
              🚁 Team Positions
            </div>
            {mockRescueTeams.map(team => (
              <div key={team.id} className="map-list-item">
                <div className="team-avatar" style={{ width: '28px', height: '28px', fontSize: '12px' }}>{team.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9' }}>{team.name}</div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>{team.location}</div>
                </div>
                <span className={`badge ${team.status === 'deployed' ? 'badge-high' : 'badge-low'}`} style={{ fontSize: '9px' }}>{team.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
