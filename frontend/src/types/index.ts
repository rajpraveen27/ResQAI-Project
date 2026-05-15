export type UserRole = 'admin' | 'coordinator' | 'rescue_team' | 'citizen';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  location?: string;
  avatar?: string;
  isOnline?: boolean;
}

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'active' | 'responding' | 'resolved' | 'monitoring';
export type IncidentType = 'flood' | 'earthquake' | 'fire' | 'cyclone' | 'landslide' | 'tsunami' | 'chemical' | 'other';

export interface Incident {
  id: string;
  title: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: string;
  coordinates: [number, number];
  reportedBy: string;
  reportedAt: string;
  description: string;
  affectedCount: number;
  affected_count?: number;
  rescueTeams: string[];
  aiSeverityScore: number;
  mediaUrls?: string[];
  updates?: IncidentUpdate[];
}

export interface IncidentUpdate {
  id: string;
  message: string;
  author: string;
  timestamp: string;
}

export type ResourceType = 'medical' | 'food' | 'shelter' | 'rescue_vehicle' | 'helicopter' | 'boat' | 'personnel';
export type ResourceStatus = 'available' | 'deployed' | 'in_transit' | 'maintenance';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  quantity: number;
  status: ResourceStatus;
  location: string;
  assignedTo?: string;
  lastUpdated: string;
}

export interface RescueTeam {
  id: string;
  name: string;
  leader: string;
  members: number;
  status: 'available' | 'deployed' | 'returning';
  currentMission?: string;
  location: string;
  coordinates: [number, number];
  specialization: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: IncidentSeverity;
  type: 'weather' | 'seismic' | 'sos' | 'system' | 'resource';
  timestamp: string;
  created_at?: string;
  acknowledged: boolean;
  location?: string;
  source?: string;
  reportedBy?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface AIPrediction {
  incidentId: string;
  severityScore: number;
  estimatedAffected: number;
  predictedSpread: string;
  recommendedResources: string[];
  confidence: number;
  riskFactors: string[];
  timeline: { label: string; probability: number }[];
}

export interface DashboardStats {
  activeIncidents: number;
  rescueTeamsDeployed: number;
  peopleAffected: number;
  resourcesDeployed: number;
  resolvedToday: number;
  pendingSOS: number;
}
