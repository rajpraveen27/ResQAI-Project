const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { generateTokens, authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');
const db = require('../db');
const router = express.Router();

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['citizen', 'rescue_team', 'coordinator', 'admin']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const checkUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkUser.rowCount > 0) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, passwordHash, role]
    );

    const newUser = result.rows[0];
    const { accessToken, refreshToken } = generateTokens(newUser);
    logger.info(`New user registered: ${email} (${role})`);
    res.status(201).json({ user: newUser, accessToken, refreshToken });
  } catch (err) {
    logger.error('Error registering user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = result.rows[0];
    if (!(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    logger.info(`Login: ${email}`);
    res.json({ 
      user: { id: user.id, name: user.name, email: user.email, role: user.role }, 
      accessToken, 
      refreshToken 
    });
  } catch (err) {
    logger.error('Error logging in:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, phone, location FROM users WHERE email = $1', [req.user.email]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/auth/profile
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    const query = `
      UPDATE users 
      SET name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          location = COALESCE($3, location),
          updated_at = NOW()
      WHERE email = $4
      RETURNING id, name, email, role, phone, location
    `;
    const result = await db.query(query, [name, phone, location, req.user.email]);
    
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    
    logger.info(`Profile updated for: ${req.user.email}`);
    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Error updating profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
