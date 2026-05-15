const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

const teams = [
  { id: 'RT-Alpha', name: 'Alpha Strike Team', leader: 'Cdr. Rajan Mehta', members: 24, status: 'deployed', currentMission: 'INC-001', location: 'Silchar, Assam', specialization: 'Flood Rescue' },
  { id: 'RT-Bravo', name: 'Bravo Mountain Unit', leader: 'Lt. Aisha Khan', members: 18, status: 'deployed', currentMission: 'INC-002', location: 'Uttarkashi', specialization: 'Earthquake & Urban Search' },
  { id: 'RT-Charlie', name: 'Charlie Fire Brigade', leader: 'Capt. Vikram Singh', members: 30, status: 'deployed', currentMission: 'INC-003', location: 'Coorg', specialization: 'Wildfire Suppression' },
  { id: 'RT-Delta', name: 'Delta Rapid Response', leader: 'Dr. Sunita Rao', members: 20, status: 'deployed', currentMission: 'INC-001', location: 'Assam', specialization: 'Medical & Flood' },
  { id: 'RT-Foxtrot', name: 'Foxtrot Hazmat Team', leader: 'Dr. Meera Iyer', members: 12, status: 'available', location: 'Delhi HQ', specialization: 'Chemical & Biological' },
];

router.get('/', (req, res) => {
  res.json({ teams, total: teams.length });
});

router.get('/:id', authenticate, (req, res) => {
  const team = teams.find(t => t.id === req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  res.json(team);
});

router.patch('/:id/status', authenticate, authorize('admin', 'coordinator'), (req, res) => {
  const team = teams.find(t => t.id === req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  team.status = req.body.status || team.status;
  team.currentMission = req.body.currentMission || team.currentMission;
  res.json(team);
});

module.exports = router;
