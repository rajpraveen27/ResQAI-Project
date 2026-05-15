-- ResQAI PostgreSQL Schema
-- Run: psql -U postgres -d resqai_db -f database.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role        VARCHAR(50) NOT NULL DEFAULT 'citizen' CHECK (role IN ('admin','coordinator','rescue_team','citizen')),
    phone       VARCHAR(20),
    location    VARCHAR(255),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Incidents
CREATE TABLE incidents (
    id              VARCHAR(20) PRIMARY KEY,
    title           VARCHAR(500) NOT NULL,
    type            VARCHAR(50) NOT NULL,
    severity        VARCHAR(20) NOT NULL CHECK (severity IN ('critical','high','medium','low')),
    status          VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active','responding','resolved','monitoring')),
    location        VARCHAR(255),
    latitude        DECIMAL(9,6),
    longitude       DECIMAL(9,6),
    reported_by     UUID REFERENCES users(id),
    reported_at     TIMESTAMPTZ DEFAULT NOW(),
    description     TEXT,
    affected_count  INTEGER DEFAULT 0,
    ai_score        DECIMAL(5,2),
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Resources
CREATE TABLE resources (
    id          VARCHAR(20) PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    type        VARCHAR(50) NOT NULL,
    quantity    INTEGER NOT NULL DEFAULT 0,
    status      VARCHAR(30) NOT NULL DEFAULT 'available' CHECK (status IN ('available','deployed','in_transit','maintenance')),
    location    VARCHAR(255),
    assigned_to VARCHAR(20) REFERENCES incidents(id) ON DELETE SET NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Rescue Teams
CREATE TABLE rescue_teams (
    id              VARCHAR(20) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    leader          VARCHAR(255),
    members_count   INTEGER DEFAULT 0,
    status          VARCHAR(30) DEFAULT 'available' CHECK (status IN ('available','deployed','returning')),
    current_mission VARCHAR(20) REFERENCES incidents(id) ON DELETE SET NULL,
    location        VARCHAR(255),
    specialization  VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(500) NOT NULL,
    message         TEXT NOT NULL,
    severity        VARCHAR(20) NOT NULL CHECK (severity IN ('critical','high','medium','low')),
    type            VARCHAR(30) NOT NULL CHECK (type IN ('weather','seismic','sos','system','resource')),
    location        VARCHAR(255),
    source          VARCHAR(255),
    acknowledged    BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Incident Updates (audit trail)
CREATE TABLE incident_updates (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id VARCHAR(20) REFERENCES incidents(id) ON DELETE CASCADE,
    message     TEXT NOT NULL,
    author_id   UUID REFERENCES users(id),
    author_name VARCHAR(255),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- AI Predictions (log)
CREATE TABLE ai_predictions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id     VARCHAR(20) REFERENCES incidents(id),
    severity_score  DECIMAL(5,2),
    estimated_affected INTEGER,
    confidence      DECIMAL(5,2),
    predicted_spread TEXT,
    recommended_resources JSONB,
    risk_factors    JSONB,
    model_version   VARCHAR(50),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_type ON incidents(type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX idx_resources_status ON resources(status);

-- Sample admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role, location)
VALUES ('Admin Priya Sharma', 'priya@resqai.gov.in', '$2b$10$PlaceholderHashForDemo', 'admin', 'Delhi, India');
