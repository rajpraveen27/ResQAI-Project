const axios = require('axios');
const cron = require('node-cron');
const db = require('./db');
const logger = require('./utils/logger');

// APIs for Real Data
const USGS_EARTHQUAKE_API = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson';
const GDACS_API = 'https://www.gdacs.org/xml/rss.xml'; // Note: In real app, use their JSON API

async function syncEarthquakes() {
  try {
    logger.info('🔄 Syncing real-time Earthquake data from USGS...');
    const response = await axios.get(USGS_EARTHQUAKE_API);
    const earthquakes = response.data.features;

    for (const quake of earthquakes) {
      const { mag, place, time, ids } = quake.properties;
      const [lng, lat] = quake.geometry.coordinates;
      const id = `EQ-${ids.split(',')[0]}`;

      // Insert into incidents table if not exists
      const query = `
        INSERT INTO incidents (id, title, type, severity, status, location, latitude, longitude, description, ai_score)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `;

      const severity = mag >= 6 ? 'critical' : (mag >= 5 ? 'high' : 'medium');
      const values = [
        id,
        `Real Earthquake: Magnitude ${mag}`,
        'earthquake',
        severity,
        'active',
        place,
        lat,
        lng,
        `Automated USGS Report: Magnitude ${mag} earthquake detected at ${place}.`,
        mag * 10 // Mock AI score based on magnitude
      ];

      await db.query(query, values);

      // Also create an alert if it's high severity
      if (severity === 'critical' || severity === 'high') {
        await db.query(`
          INSERT INTO alerts (title, message, severity, type, location, source)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING
        `, [
          `REAL-TIME ALERT: Earthquake M${mag}`,
          `Automated detection of a Magnitude ${mag} earthquake at ${place}.`,
          severity,
          'seismic',
          place,
          'USGS API'
        ]);
      }
    }
  } catch (err) {
    logger.error('❌ Error syncing earthquakes:', err.message);
  }
}

// Mocking GDACS for now as parsing RSS requires extra libs, but USGS gives real GeoJSON
async function syncGDACS() {
  try {
    logger.info('🔄 Syncing real-time Cyclone & Flood data from GDACS...');
    const response = await axios.get(GDACS_API);
    const xml = response.data;
    
    // Simple regex parser for RSS items
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    
    for (const item of items) {
      const title = (item.match(/<title>(.*?)<\/title>/) || [])[1];
      const description = (item.match(/<description>(.*?)<\/description>/) || [])[1];
      const guid = (item.match(/<guid.*?>(.*?)<\/guid>/) || [])[1] || `GDACS-${Date.now()}`;
      const geo = item.match(/<georss:point>(.*?)<\/georss:point>/);
      
      let lat = 20.5937, lng = 78.9629; // Default India
      if (geo) {
        [lat, lng] = geo[1].split(' ').map(Number);
      }

      const type = title.toLowerCase().includes('flood') ? 'flood' : 
                   (title.toLowerCase().includes('cyclone') ? 'cyclone' : 'other');
      
      const query = `
        INSERT INTO incidents (id, title, type, severity, status, location, latitude, longitude, description, ai_score)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `;

      const values = [
        guid,
        `GDACS Alert: ${title}`,
        type,
        'high',
        'active',
        'Global Monitoring',
        lat,
        lng,
        description,
        85
      ];

      await db.query(query, values);
    }
    logger.info(`✅ Synced ${items.length} global alerts from GDACS.`);
  } catch (err) {
    logger.error('❌ Error syncing GDACS:', err.message);
  }
}

async function startSync() {
  // Run once on startup
  await syncEarthquakes();
  await syncGDACS();

  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    await syncEarthquakes();
    await syncGDACS();
  });
}

module.exports = { startSync };
