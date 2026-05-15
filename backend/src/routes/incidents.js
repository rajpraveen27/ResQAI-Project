const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');
const db = require('../db');
const router = express.Router();

// GET /api/incidents
router.get('/', async (req, res) => {
  try {
    const { severity, status, type } = req.query;
    let query = 'SELECT * FROM incidents WHERE 1=1';
    const params = [];

    if (severity) {
      params.push(severity);
      query += ` AND severity = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (type) {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }

    query += ' ORDER BY reported_at DESC';
    
    const result = await db.query(query, params);
    res.json({ incidents: result.rows, total: result.rowCount });
  } catch (err) {
    logger.error('Error fetching incidents:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/incidents/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM incidents WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Incident not found' });
    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Error fetching incident:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/incidents
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, type, severity, location, description, affectedCount, coordinates } = req.body;
    if (!title || !type || !severity || !location) return res.status(400).json({ error: 'Missing required fields' });

    const id = `INC-${Date.now().toString().slice(-6)}`;
    const [lat, lng] = coordinates || [20.5937, 78.9629];

    const query = `
      INSERT INTO incidents (id, title, type, severity, status, location, latitude, longitude, reported_by, description, affected_count, ai_score)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, (SELECT id FROM users WHERE email = $9 LIMIT 1), $10, $11, $12)
      RETURNING *
    `;

    const values = [
      id, title, type, severity, 'active', location, lat, lng,
      req.user.email, description || '', affectedCount || 0,
      Math.floor(Math.random() * 40) + 50
    ];

    const result = await db.query(query, values);
    logger.info(`Incident created: ${id} by ${req.user.email}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error('Error creating incident:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/incidents/:id
router.patch('/:id', authenticate, authorize('admin', 'coordinator'), async (req, res) => {
  try {
    const { status, severity, title, description, affected_count } = req.body;
    
    // Dynamically build update query
    let query = 'UPDATE incidents SET updated_at = NOW()';
    const params = [req.params.id];
    let count = 2;

    if (status) { query += `, status = $${count++}`; params.push(status); }
    if (severity) { query += `, severity = $${count++}`; params.push(severity); }
    if (title) { query += `, title = $${count++}`; params.push(title); }
    if (description) { query += `, description = $${count++}`; params.push(description); }
    if (affected_count) { query += `, affected_count = $${count++}`; params.push(affected_count); }

    query += ' WHERE id = $1 RETURNING *';

    const result = await db.query(query, params);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Incident not found' });
    
    logger.info(`Incident updated: ${req.params.id}`);
    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Error updating incident:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/incidents/:id
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await db.query('DELETE FROM incidents WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Incident not found' });
    res.json({ message: 'Incident deleted' });
  } catch (err) {
    logger.error('Error deleting incident:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
