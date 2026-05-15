# 🚑 ResQAI — AI-Based Disaster Response System

> **Real-time emergency response, AI-powered severity prediction, resource allocation, and automated cloud deployment.**

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](docker-compose.yml)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-Jenkins-red?logo=jenkins&logoColor=white)](Jenkinsfile)

---

## 📋 Overview

ResQAI is a comprehensive AI-based disaster response and resource management platform that enables:

- 🚨 **Real-time incident reporting** from citizens and automated sensors
- 🗺️ **Live GPS tracking** of rescue teams and affected zones
- 🤖 **AI-powered severity prediction** and resource recommendations (ResQNet v2.1)
- 📦 **Dynamic resource allocation** across disaster zones
- 🆘 **SOS Emergency System** with instant alert broadcasting
- 📊 **Monitoring dashboards** via Prometheus + Grafana
- ☁️ **Cloud-native deployment** on AWS via Terraform + Kubernetes

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ResQAI Platform                          │
├──────────────┬──────────────┬──────────────┬───────────────┤
│   React.js   │  Express.js  │   FastAPI    │  PostgreSQL   │
│   Frontend   │   Backend    │  AI Module   │  + Redis      │
│   Port 3000  │  Port 5000   │  Port 8000   │  Port 5432    │
├──────────────┴──────────────┴──────────────┴───────────────┤
│          Kubernetes (EKS) │ Terraform │ Jenkins CI/CD Pipeline     │
├─────────────────────────────────────────────────────────────┤
│          Prometheus + Grafana │ ELK Stack (Logging)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker & Docker Compose

### Option 1: Docker Compose (Recommended)
```bash
cd resqai
docker-compose up --build
```
- Frontend: http://localhost:80
- Backend API: http://localhost:5000
- AI Module: http://localhost:8000
- Grafana: http://localhost:3001 (admin / resqai_admin)
- Prometheus: http://localhost:9090

### Option 2: Manual Local Setup
```bash
# Frontend
cd resqai/frontend
npm install --legacy-peer-deps
npm start           # http://localhost:3000

# Backend
cd resqai/backend
cp .env.example .env
npm install
npm run dev         # http://localhost:5000

# AI Module
cd resqai/ai-module
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## 📁 Project Structure

```
ResQAI Project/
└── resqai/
    ├── frontend/              # React.js + TypeScript UI
    │   ├── src/
    │   │   ├── pages/         # Dashboard, Incidents, Map, SOS, Resources, Teams, AI, Admin
    │   │   ├── components/    # Sidebar, Header
    │   │   ├── context/       # AuthContext (role-based access)
    │   │   ├── data/          # Mock data (dev mode)
    │   │   └── types/         # TypeScript interfaces
    │   └── Dockerfile
    ├── backend/               # Node.js + Express API
    │   ├── src/
    │   │   ├── routes/        # auth, incidents, alerts, resources, teams, ai, users
    │   │   ├── middleware/    # JWT auth, role authorization
    │   │   └── utils/         # Winston logger
    │   ├── database.sql       # PostgreSQL schema
    │   └── Dockerfile
    ├── ai-module/             # Python FastAPI AI Service
    │   ├── main.py            # Severity prediction, media analysis
    │   ├── requirements.txt
    │   └── Dockerfile
    ├── Jenkinsfile             # Jenkins CI/CD pipeline (root)
    ├── infrastructure/
    │   ├── kubernetes/        # K8s Deployments, Services, HPA
    │   ├── terraform/         # AWS EKS, RDS, Redis, S3
    │   ├── ansible/           # Server provisioning playbook
    │   └── monitoring/        # Prometheus config
    ├── devops/                # Infrastructure & deployment scripts
    └── docker-compose.yml     # All-in-one local stack
```

---

## 🔑 User Roles

| Role | Access |
|------|--------|
| `admin` | Full system access, user management |
| `coordinator` | Incident & resource management |
| `rescue_team` | View incidents, update status |
| `citizen` | Report incidents, activate SOS |

---

## 🤖 AI Module (ResQNet v2.1)

**Endpoints:**
- `POST /predict` — Severity score, spread prediction, resource recommendations
- `POST /analyze-media` — Disaster scene image analysis (CNN)
- `GET /models` — List available ML models
- `GET /health` — Service status

**Features:**
- Multi-factor risk scoring (rainfall, wind, magnitude, population density)
- 72-hour spread timeline probability
- Automatic resource recommendations based on disaster type
- Graceful fallback when AI module is offline

---

## 🔧 DevOps Stack

| Tool | Purpose |
|------|---------|
| **Docker** | Container packaging |
| **Kubernetes (EKS)** | Orchestration + auto-scaling (HPA) |
| **Terraform** | AWS infrastructure (VPC, RDS, Redis, S3) |
| **Ansible** | Server configuration management |
| **Jenkins** | CI/CD pipeline (Lint → Test → Build → Push → Deploy → Smoke Test → Rollback) |
| **Prometheus** | Metrics collection |
| **Grafana** | Monitoring dashboards |

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/incidents` | List all incidents |
| POST | `/api/incidents` | Report new incident |
| PATCH | `/api/incidents/:id` | Update incident |
| GET | `/api/alerts` | List alerts |
| POST | `/api/alerts` | Create SOS/alert |
| PATCH | `/api/alerts/:id/acknowledge` | Acknowledge alert |
| GET | `/api/resources` | List resources |
| POST | `/api/ai/predict` | Run AI prediction |
| GET | `/metrics` | Prometheus metrics |
| GET | `/health` | Health check |

---

## 🌐 Future Scope

- [ ] Drone integration for aerial surveillance
- [ ] IoT sensor real-time feeds (flood gauges, seismic sensors)
- [ ] Voice-based emergency reporting (Whisper AI)
- [ ] Mobile app (React Native)
- [ ] Advanced satellite imagery analysis
- [ ] Multi-language support (Hindi, Bengali, Tamil)

---

**Built with ❤️ for disaster response professionals across India.**
