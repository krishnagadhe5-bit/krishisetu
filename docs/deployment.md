# KrishiSetu Production Deployment & Docker Guide

## 1. Local Containerized Orchestration with Docker Compose

A production-ready `docker-compose.yml` is provided at the repository root.

```bash
# Start all 5 services with persistent volumes:
docker-compose up --build -d

# Check service status:
docker-compose ps

# Stream logs:
docker-compose logs -f server
```

### Services Deployed
1. **`postgres`** (PostgreSQL 16 on port 5432) with persistent volume `postgres_data`.
2. **`redis`** (Redis 7 on port 6379) for caching and session queues.
3. **`server`** (Node.js 20 Express REST API on port 5000).
4. **`ai-service`** (Python 3.11 FastAPI on port 8000).
5. **`client`** (React + Vite static client or dev server on port 5173).

---

## 2. Cloud Production Deployment Architecture

```
                       ┌────────────────────────────┐
                       │     Cloudflare CDN / DNS   │
                       └─────────────┬──────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 │                                       │
                 ▼                                       ▼
   ┌───────────────────────────┐           ┌───────────────────────────┐
   │ Static Frontend Hosting   │           │ Application Load Balancer │
   │ (Vercel / Cloudflare Pages│           └─────────────┬─────────────┘
   │       / AWS S3 + CF)      │                         │
   └───────────────────────────┘                         ▼
                                           ┌───────────────────────────┐
                                           │  Node.js Express Cluster  │
                                           │ (AWS ECS / GCP Cloud Run /│
                                           │       Render Web)         │
                                           └──────┬─────────────┬──────┘
                                                  │             │
                               ┌──────────────────┘             └──────────────────┐
                               ▼                                                   ▼
                 ┌───────────────────────────┐                       ┌───────────────────────────┐
                 │ Managed PostgreSQL 16     │                       │ Python FastAPI AI Cluster │
                 │ (AWS RDS / Neon / Supabase│                       │  (GCP Cloud Run / Modal)  │
                 └───────────────────────────┘                       └───────────────────────────┘
```

---

## 3. Environment Secrets Matrix

| Variable | Location | Purpose |
| :--- | :--- | :--- |
| `PORT` | Server | HTTP port (default `5000`) |
| `DATABASE_URL` | Server | PostgreSQL connection string |
| `JWT_SECRET` | Server | 256-bit cryptographically secure string |
| `CLIENT_ORIGIN` | Server | Allowed CORS domain (e.g. `https://krishisetu.in`) |
| `AI_SERVICE_URL` | Server | Private service URL (e.g. `http://ai-service:8000`) |
| `AI_SERVICE_API_KEY` | Server, AI | Shared internal HMAC/API secret |
| `VITE_API_BASE_URL` | Client | Public REST API base URL |
| `WEATHER_API_KEY` | Server | Optional OpenWeatherMap API key (uses fallback if empty) |
