const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

let resources = [
  { id: 'RES-001', name: 'NDRF Rubber Boats (x20)', type: 'boat', quantity: 20, status: 'deployed', location: 'Silchar, Assam', assignedTo: 'INC-001', lastUpdated: new Date().toISOString() },
  { id: 'RES-002', name: 'Medical Emergency Kits', type: 'medical', quantity: 500, status: 'in_transit', location: 'Guwahati Depot', lastUpdated: new Date().toISOString() },
  { id: 'RES-003', name: 'IAF Rescue Helicopters', type: 'helicopter', quantity: 4, status: 'deployed', location: 'Uttarkashi', assignedTo: 'INC-002', lastUpdated: new Date().toISOString() },
  { id: 'RES-004', name: 'Food & Water Packets', type: 'food', quantity: 10000, status: 'available', location: 'Delhi Warehouse', lastUpdated: new Date().toISOString() },
];

router.get('/', authenticate, (req, res) => {
  const { status, type } = req.query;
  let result = [...resources];
  if (status) result = result.filter(r => r.status === status);
  if (type) result = result.filter(r => r.type === type);
  res.json({ resources: result, total: result.length });
});

router.post('/', authenticate, authorize('admin', 'coordinator'), (req, res) => {
  const { name, type, quantity, location } = req.body;
  if (!name || !type || !quantity) return res.status(400).json({ error: 'name, type, quantity required' });
  const newRes = { id: `RES-${String(resources.length + 1).padStart(3, '0')}`, name, type, quantity: parseInt(quantity), status: 'available', location: location || 'HQ', lastUpdated: new Date().toISOString() };
  resources.push(newRes);
  res.status(201).json(newRes);
});

router.patch('/:id/deploy', authenticate, authorize('admin', 'coordinator'), (req, res) => {
  const res_ = resources.find(r => r.id === req.params.id);
  if (!res_) return res.status(404).json({ error: 'Resource not found' });
  res_.status = 'deployed';
  res_.assignedTo = req.body.incidentId;
  res_.lastUpdated = new Date().toISOString();
  res.json(res_);
});

router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const idx = resources.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  resources.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

module.exports = router;
