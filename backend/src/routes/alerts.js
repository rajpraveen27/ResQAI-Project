const express = require('express');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');
const db = require('../db');
const router = express.Router();

// GET /api/alerts
router.get('/', async (req, res) => {
  try {
    const { type, acknowledged } = req.query;
    let query = 'SELECT * FROM alerts WHERE 1=1';
    const params = [];

    if (type) {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }
    if (acknowledged !== undefined) {
      params.push(acknowledged === 'true');
      query += ` AND acknowledged = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';
    
    const result = await db.query(query, params);
    res.json({ alerts: result.rows, total: result.rowCount });
  } catch (err) {
    logger.error('Error fetching alerts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/alerts (SOS / new alert)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, message, severity, type, location } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'title and message required' });
    
    const query = `
      INSERT INTO alerts (title, message, severity, type, location, source)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      title, message,
      severity || 'high',
      type || 'sos',
      location || 'Unknown',
      req.user.email
    ];

    const result = await db.query(query, values);
    logger.warn(`New alert created: ${result.rows[0].id} [${severity}]`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error('Error creating alert:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/alerts/:id/acknowledge
router.patch('/:id/acknowledge', authenticate, async (req, res) => {
  try {
    const query = `
      UPDATE alerts 
      SET acknowledged = true, 
          acknowledged_by = (SELECT id FROM users WHERE email = $2 LIMIT 1), 
          acknowledged_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `;
    
    const result = await db.query(query, [req.params.id, req.user.email]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Alert not found' });
    
    logger.info(`Alert ${req.params.id} acknowledged by ${req.user.email}`);
    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Error acknowledging alert:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
