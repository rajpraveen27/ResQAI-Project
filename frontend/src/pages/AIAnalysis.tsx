import React, { useState } from 'react';
import { mockAIPrediction, mockIncidents } from '../data/mockData';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import './AIAnalysis.css';

const AIAnalysis: React.FC = () => {
  const [selectedIncident, setSelectedIncident] = useState('INC-001');
  const [analyzing, setAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(true);
  const pred = mockAIPrediction;

  const radarData = [
    { subject: 'Severity', value: pred.severityScore },
    { subject: 'Spread', value: 78 },
    { subject: 'Urgency', value: 90 },
    { subject: 'Resources', value: 65 },
    { subject: 'Lives at Risk', value: 88 },
    { subject: 'Infrastructure', value: 72 },
  ];

  const handleAnalyze = () => {
    setAnalyzing(true);
    setShowResult(false);
    setTimeout(() => { setAnalyzing(false); setShowResult(true); }, 2000);
  };

  const timelineColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  return (
    <div className="ai-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🤖 AI Disaster Analysis</h1>
          <p className="page-subtitle">Machine learning powered severity prediction and resource recommendations</p>
        </div>
        <div className="ai-status-badge">
          <span className="pulse-dot green" />
          <span>AI Engine Online</span>
          <span className="ai-model-tag">ResQNet v2.1</span>
        </div>
      </div>

      {/* Input */}
      <div className="ai-layout">
        <div className="glass-card ai-input-panel">
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-glass)', fontWeight: 700, fontSize: '14px' }}>
            ⚙️ Analysis Parameters
          </div>
          <div style={{ padding: '20px' }}>
            <div className="form-group">
              <label className="form-label">Select Incident</label>
              <select className="form-select" value={selectedIncident} onChange={e => setSelectedIncident(e.target.value)}>
                {mockIncidents.map(i => (
                  <option key={i.id} value={i.id}>{i.id} — {i.title.substring(0, 35)}...</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Model Type</label>
              <select className="form-select">
                <option>ResQNet v2.1 (Recommended)</option>
                <option>FloodPredict ML</option>
                <option>SeismicAI 3.0</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Analysis Depth</label>
              <select className="form-select">
                <option>Full Analysis (72hr forecast)</option>
                <option>Quick Analysis (24hr)</option>
                <option>Real-time Monitoring</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? '⏳ Analyzing...' : '🤖 Run AI Analysis'}
            </button>

            {analyzing && (
              <div className="ai-progress">
                <div className="ai-progress-bar">
                  <div className="ai-progress-fill" />
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '8px' }}>Processing satellite imagery and seismic data...</div>
              </div>
            )}
          </div>

          {/* Risk Factors */}
          {showResult && (
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px' }}>
                ⚠️ Risk Factors
              </div>
              {pred.riskFactors.map((rf, i) => (
                <div key={i} className="risk-factor-item">
                  <span className="risk-dot" />
                  <span>{rf}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="ai-results">
          {showResult && (
            <>
              {/* Score Cards */}
              <div className="grid-3 mb-20">
                <div className="glass-card metric-card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
                  <div className="metric-label">Severity Score</div>
                  <div className="metric-value text-red">{pred.severityScore}%</div>
                  <div style={{ marginTop: '8px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${pred.severityScore}%`, background: '#ef4444', borderRadius: '2px' }} />
                  </div>
                </div>
                <div className="glass-card metric-card" style={{ borderColor: 'rgba(249,115,22,0.2)' }}>
                  <div className="metric-label">Est. Affected</div>
                  <div className="metric-value text-orange">{pred.estimatedAffected.toLocaleString()}</div>
                </div>
                <div className="glass-card metric-card" style={{ borderColor: 'rgba(34,197,94,0.2)' }}>
                  <div className="metric-label">AI Confidence</div>
                  <div className="metric-value text-green">{pred.confidence}%</div>
                  <div style={{ marginTop: '8px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: `${pred.confidence}%`, background: '#22c55e', borderRadius: '2px' }} />
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid-2 mb-20">
                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '16px' }}>🎯 Multi-Factor Risk Radar</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      {/* @ts-ignore */}
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
                      <Radar name="Risk" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '16px' }}>📈 Spread Probability Timeline</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={pred.timeline} margin={{ left: -20 }}>
                      <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#475569', fontSize: 11 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: '#0b1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9' }} />
                      <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                        {pred.timeline.map((_, i) => (
                          <Cell key={i} fill={timelineColors[i % timelineColors.length]} opacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Prediction & Recommendations */}
              <div className="grid-2">
                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>🔮 AI Prediction</div>
                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.7' }}>{pred.predictedSpread}</p>
                </div>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>✅ Recommended Resources</div>
                  {pred.recommendedResources.map((rec, i) => (
                    <div key={i} className="rec-item">
                      <span className="rec-check">✓</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;
