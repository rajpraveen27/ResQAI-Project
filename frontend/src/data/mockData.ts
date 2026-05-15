import { User, Incident, Resource, RescueTeam, Alert, AIPrediction, DashboardStats } from '../types';

export const currentUser: User = {
  id: 'usr_001',
  name: 'Admin Priya Sharma',
  email: 'priya@resqai.gov.in',
  role: 'admin',
  phone: '+91-9876543210',
  location: 'Delhi, India',
  isOnline: true,
};

export const mockUsers: User[] = [
  currentUser,
  { id: 'usr_002', name: 'Cdr. Rajan Mehta', email: 'rajan@resqai.gov.in', role: 'coordinator', phone: '+91-9123456780', location: 'Mumbai', isOnline: true },
  { id: 'usr_003', name: 'Lt. Aisha Khan', email: 'aisha@rescue.gov.in', role: 'rescue_team', phone: '+91-9345678901', location: 'Chennai', isOnline: false },
  { id: 'usr_004', name: 'Rohan Das', email: 'rohan@citizen.in', role: 'citizen', phone: '+91-8765432100', location: 'Kolkata', isOnline: true },
  { id: 'usr_005', name: 'Dr. Sunita Rao', email: 'sunita@rescue.gov.in', role: 'rescue_team', phone: '+91-9012345678', location: 'Hyderabad', isOnline: true },
];

export const mockIncidents: Incident[] = [
  {
    id: 'INC-001',
    title: 'Severe Flooding — Assam Valley Region',
    type: 'flood',
    severity: 'critical',
    status: 'active',
    location: 'Silchar, Assam',
    coordinates: [24.82, 92.79],
    reportedBy: 'Rohan Das',
    reportedAt: '2026-05-08T10:15:00Z',
    description: 'Brahmaputra river breached embankment causing catastrophic flooding across 12 villages. Over 5,000 residents displaced with rising waters.',
    affectedCount: 5200,
    rescueTeams: ['RT-Alpha', 'RT-Delta'],
    aiSeverityScore: 92,
    mediaUrls: [],
    updates: [
      { id: 'u1', message: 'NDRF team deployed at Silchar bridge', author: 'Cdr. Rajan Mehta', timestamp: '2026-05-08T10:45:00Z' },
      { id: 'u2', message: 'Water level rising at 2cm/hour', author: 'System', timestamp: '2026-05-08T11:00:00Z' },
    ],
  },
  {
    id: 'INC-002',
    title: 'Earthquake — Magnitude 6.2',
    type: 'earthquake',
    severity: 'critical',
    status: 'responding',
    location: 'Uttarkashi, Uttarakhand',
    coordinates: [30.73, 78.45],
    reportedBy: 'Seismic Monitor',
    reportedAt: '2026-05-08T08:30:00Z',
    description: 'Strong earthquake measuring 6.2 on Richter scale struck the hilly region. Multiple building collapses reported. Road access severely damaged.',
    affectedCount: 1800,
    rescueTeams: ['RT-Bravo'],
    aiSeverityScore: 88,
    updates: [{ id: 'u3', message: 'Air rescue operations commenced', author: 'Lt. Aisha Khan', timestamp: '2026-05-08T09:15:00Z' }],
  },
  {
    id: 'INC-003',
    title: 'Forest Fire — Western Ghats',
    type: 'fire',
    severity: 'high',
    status: 'responding',
    location: 'Coorg, Karnataka',
    coordinates: [12.33, 75.73],
    reportedBy: 'Satellite Alert',
    reportedAt: '2026-05-08T06:00:00Z',
    description: 'Wildfire spreading rapidly across 800 hectares. Wind conditions hampering firefighting efforts. 3 villages under evacuation orders.',
    affectedCount: 620,
    rescueTeams: ['RT-Charlie'],
    aiSeverityScore: 75,
  },
  {
    id: 'INC-004',
    title: 'Cyclone Warning — Bay of Bengal',
    type: 'cyclone',
    severity: 'high',
    status: 'monitoring',
    location: 'Coastal Odisha',
    coordinates: [20.29, 85.82],
    reportedBy: 'IMD Alert',
    reportedAt: '2026-05-07T20:00:00Z',
    description: 'Severe cyclone (Category 3) forming in Bay of Bengal. Expected landfall within 36 hours. Wind speeds 120-150 km/h. Coastal communities being pre-evacuated.',
    affectedCount: 12000,
    rescueTeams: [],
    aiSeverityScore: 79,
  },
  {
    id: 'INC-005',
    title: 'Landslide — Highway Blocked',
    type: 'landslide',
    severity: 'medium',
    status: 'active',
    location: 'Manali, Himachal Pradesh',
    coordinates: [32.24, 77.19],
    reportedBy: 'Highway Patrol',
    reportedAt: '2026-05-08T07:45:00Z',
    description: 'Major landslide on NH-03 blocking Manali-Leh highway. Estimated 200 vehicles stranded. No casualties reported yet.',
    affectedCount: 310,
    rescueTeams: ['RT-Echo'],
    aiSeverityScore: 60,
  },
  {
    id: 'INC-006',
    title: 'Chemical Leak — Industrial Zone',
    type: 'chemical',
    severity: 'high',
    status: 'resolved',
    location: 'Panipat, Haryana',
    coordinates: [29.38, 76.97],
    reportedBy: 'Factory Safety Officer',
    reportedAt: '2026-05-07T14:30:00Z',
    description: 'Minor ammonia leak at fertilizer plant. All workers evacuated. Hazmat team neutralized the leak within 3 hours.',
    affectedCount: 45,
    rescueTeams: ['RT-Foxtrot'],
    aiSeverityScore: 40,
  },
];

export const mockResources: Resource[] = [
  { id: 'RES-001', name: 'NDRF Rubber Boats (x20)', type: 'boat', quantity: 20, status: 'deployed', location: 'Silchar, Assam', assignedTo: 'INC-001', lastUpdated: '2026-05-08T10:30:00Z' },
  { id: 'RES-002', name: 'Medical Emergency Kits', type: 'medical', quantity: 500, status: 'in_transit', location: 'Guwahati Depot', lastUpdated: '2026-05-08T10:00:00Z' },
  { id: 'RES-003', name: 'IAF Rescue Helicopters', type: 'helicopter', quantity: 4, status: 'deployed', location: 'Uttarkashi', assignedTo: 'INC-002', lastUpdated: '2026-05-08T09:00:00Z' },
  { id: 'RES-004', name: 'Food & Water Packets (10k)', type: 'food', quantity: 10000, status: 'available', location: 'Delhi Warehouse', lastUpdated: '2026-05-08T08:00:00Z' },
  { id: 'RES-005', name: 'Temporary Shelter Tents', type: 'shelter', quantity: 300, status: 'deployed', location: 'Silchar Camp', assignedTo: 'INC-001', lastUpdated: '2026-05-08T11:00:00Z' },
  { id: 'RES-006', name: 'Rescue Personnel (NDRF)', type: 'personnel', quantity: 150, status: 'deployed', location: 'Assam/Uttarakhand', lastUpdated: '2026-05-08T10:45:00Z' },
  { id: 'RES-007', name: 'Fire Tankers', type: 'rescue_vehicle', quantity: 8, status: 'deployed', location: 'Coorg, Karnataka', assignedTo: 'INC-003', lastUpdated: '2026-05-08T07:00:00Z' },
  { id: 'RES-008', name: 'Ambulances (Advanced)', type: 'medical', quantity: 25, status: 'available', location: 'Regional Hospitals', lastUpdated: '2026-05-08T09:30:00Z' },
];

export const mockRescueTeams: RescueTeam[] = [
  { id: 'RT-Alpha', name: 'Alpha Strike Team', leader: 'Cdr. Rajan Mehta', members: 24, status: 'deployed', currentMission: 'INC-001', location: 'Silchar, Assam', coordinates: [24.82, 92.79], specialization: 'Flood Rescue' },
  { id: 'RT-Bravo', name: 'Bravo Mountain Unit', leader: 'Lt. Aisha Khan', members: 18, status: 'deployed', currentMission: 'INC-002', location: 'Uttarkashi', coordinates: [30.73, 78.45], specialization: 'Earthquake & Urban Search' },
  { id: 'RT-Charlie', name: 'Charlie Fire Brigade', leader: 'Capt. Vikram Singh', members: 30, status: 'deployed', currentMission: 'INC-003', location: 'Coorg, Karnataka', coordinates: [12.33, 75.73], specialization: 'Wildfire Suppression' },
  { id: 'RT-Delta', name: 'Delta Rapid Response', leader: 'Dr. Sunita Rao', members: 20, status: 'deployed', currentMission: 'INC-001', location: 'Assam', coordinates: [26.14, 91.74], specialization: 'Medical & Flood' },
  { id: 'RT-Echo', name: 'Echo Logistics Unit', leader: 'Sgt. Arjun Nair', members: 15, status: 'deployed', currentMission: 'INC-005', location: 'Manali, HP', coordinates: [32.24, 77.19], specialization: 'Road Clearance & Logistics' },
  { id: 'RT-Foxtrot', name: 'Foxtrot Hazmat Team', leader: 'Dr. Meera Iyer', members: 12, status: 'available', location: 'Delhi HQ', coordinates: [28.61, 77.20], specialization: 'Chemical & Biological' },
];

export const mockAlerts: Alert[] = [
  { id: 'ALT-001', title: 'CRITICAL: Cyclone Landfall Warning', message: 'IMD predicts Category 3 cyclone to make landfall near Puri within 36 hours. Immediate evacuation of coastal villages required.', severity: 'critical', type: 'weather', timestamp: '2026-05-08T11:00:00Z', acknowledged: false, location: 'Coastal Odisha', source: 'Indian Meteorological Department' },
  { id: 'ALT-002', title: 'SOS Signal — Stranded Civilians', message: 'GPS SOS activated by 3 civilians trapped on rooftop in Silchar Ward 7. Coordinates: 24.82°N, 92.79°E.', severity: 'critical', type: 'sos', timestamp: '2026-05-08T10:55:00Z', acknowledged: false, location: 'Silchar, Assam' },
  { id: 'ALT-003', title: 'Seismic Activity — Aftershock Risk', message: 'Seismology division warns of possible aftershocks (M4.5–5.0) in Uttarkashi region. Teams should exercise caution.', severity: 'high', type: 'seismic', timestamp: '2026-05-08T10:00:00Z', acknowledged: true, location: 'Uttarkashi, Uttarakhand', source: 'National Seismological Centre' },
  { id: 'ALT-004', title: 'Resource Shortage — Medical Kits', message: 'Medical supply inventory at Silchar camp below 20%. Immediate resupply required within 6 hours.', severity: 'high', type: 'resource', timestamp: '2026-05-08T09:30:00Z', acknowledged: false, source: 'Resource Management System' },
  { id: 'ALT-005', title: 'System Maintenance Window', message: 'Scheduled maintenance for satellite communication uplink: 2:00 AM – 3:00 AM IST. Backup channels will be active.', severity: 'low', type: 'system', timestamp: '2026-05-08T08:00:00Z', acknowledged: true, source: 'IT Operations' },
];

export const mockAIPrediction: AIPrediction = {
  incidentId: 'INC-001',
  severityScore: 92,
  estimatedAffected: 7500,
  predictedSpread: 'Flood waters projected to expand 15km northeast within next 12 hours if rainfall continues at current rate.',
  recommendedResources: ['20 additional boats', '500 medical kits', '2 helicopters', '100 NDRF personnel', '1000 shelter tents'],
  confidence: 87,
  riskFactors: ['Brahmaputra river level critical', 'Heavy rainfall forecast 72hrs', 'Embankment integrity compromised', 'Limited road access', 'Dense population in flood path'],
  timeline: [
    { label: '6 hrs', probability: 75 },
    { label: '12 hrs', probability: 88 },
    { label: '24 hrs', probability: 94 },
    { label: '48 hrs', probability: 65 },
    { label: '72 hrs', probability: 40 },
  ],
};

export const mockDashboardStats: DashboardStats = {
  activeIncidents: 5,
  rescueTeamsDeployed: 5,
  peopleAffected: 19970,
  resourcesDeployed: 6,
  resolvedToday: 1,
  pendingSOS: 3,
};

export const generateTimeSeriesData = (points = 12) => {
  return Array.from({ length: points }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    incidents: Math.floor(Math.random() * 8) + 1,
    resolved: Math.floor(Math.random() * 5),
    sos: Math.floor(Math.random() * 4),
  }));
};

export const incidentTypeIcons: Record<string, string> = {
  flood: '🌊', earthquake: '🌍', fire: '🔥', cyclone: '🌀',
  landslide: '⛰️', tsunami: '🌊', chemical: '☣️', other: '⚠️',
};
