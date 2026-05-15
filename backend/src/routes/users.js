const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

const users = [
  { id: 'usr_001', name: 'Admin Priya Sharma', email: 'priya@resqai.gov.in', role: 'admin', isActive: true },
  { id: 'usr_002', name: 'Cdr. Rajan Mehta', email: 'rajan@resqai.gov.in', role: 'coordinator', isActive: true },
];

router.get('/', authenticate, authorize('admin'), (req, res) => {
  res.json({ users: users.map(u => ({ ...u, passwordHash: undefined })), total: users.length });
});

router.patch('/:id/status', authenticate, authorize('admin'), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;
  res.json(user);
});

module.exports = router;
