const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Simple in-memory mock storage for when Postgres is unavailable
const mockData = {
  incidents: [
    { id: 'INC-001', title: 'Severe Flooding — Assam', type: 'flood', severity: 'critical', status: 'active', location: 'Silchar, Assam', latitude: 24.82, longitude: 92.79, description: 'Brahmaputra river breached embankment.', ai_score: 92, affected_count: 5200 },
    { id: 'INC-002', title: 'Earthquake — Magnitude 6.2', type: 'earthquake', severity: 'critical', status: 'responding', location: 'Uttarkashi', latitude: 30.73, longitude: 78.45, description: 'Strong earthquake measuring 6.2 on Richter scale.', ai_score: 88, affected_count: 1800 }
  ],
  alerts: [
    { id: 1, title: 'Cyclone Landfall Warning', message: 'Category 3 cyclone predicted.', severity: 'critical', type: 'weather', location: 'Odisha', source: 'IMD' }
  ],
  users: [
    { id: 1, email: 'admin@resqai.com', password: 'password', role: 'admin', name: 'Admin User' }
  ]
};

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionTimeoutMillis: 2000, // Short timeout for fallback
});

let useMock = false;

pool.on('connect', () => {
  console.log('🐘 PostgreSQL connected successfully');
  useMock = false;
});

pool.on('error', (err) => {
  console.error('🐘 PostgreSQL connection failed, falling back to Mock DB');
  useMock = true;
});

const handleMockQuery = (text, params) => {
  const lowerText = text.toLowerCase();
  
  // Handle INSERT into incidents
  if (lowerText.includes('insert into incidents')) {
    const id = params[0];
    const existing = mockData.incidents.find(i => i.id === id);
    if (!existing) {
      console.log('✨ Mock DB: Inserting real incident:', params[1]);
      mockData.incidents.unshift({
        id: params[0], title: params[1], type: params[2], severity: params[3],
        status: params[4], location: params[5], latitude: params[6], longitude: params[7],
        description: params[8], ai_score: params[9], affected_count: Math.floor(Math.random() * 1000)
      });
    }
    return { rowCount: 1, rows: [] };
  }

  // Handle INSERT into alerts
  if (lowerText.includes('insert into alerts')) {
    console.log('✨ Mock DB: Inserting real alert:', params[0]);
    mockData.alerts.unshift({
      id: mockData.alerts.length + 1,
      title: params[0], message: params[1], severity: params[2],
      type: params[3], location: params[4], source: params[5]
    });
    return { rowCount: 1, rows: [] };
  }

  // Handle SELECT queries
  if (lowerText.includes('from incidents')) return { rows: mockData.incidents };
  if (lowerText.includes('from alerts')) return { rows: mockData.alerts };
  if (lowerText.includes('from users')) return { rows: [mockData.users[0]] };
  
  return { rows: [] };
};

module.exports = {
  query: async (text, params) => {
    if (useMock) return handleMockQuery(text, params);
    
    try {
      return await pool.query(text, params);
    } catch (err) {
      // If first query fails, switch to mock mode permanently for this session
      if (!useMock) {
        console.error('❌ Database query failed, switching to Mock DB fallback');
        useMock = true;
      }
      return handleMockQuery(text, params);
    }
  },
  pool
};
