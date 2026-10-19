# KrishiSetu Architecture Documentation

**Tagline:** Smart Farming. Better Decisions. Stronger Markets.  
**Platform:** AI-Powered Agricultural Intelligence, Farm Management & Supply Chain Platform  
**Target Region:** Maharashtra, India (extensible to all Indian states)

---

## 1. System Topology

```
                  ┌────────────────────────────────────────┐
                  │          React + Vite Client           │
                  │   Tailwind CSS / Lucide / Recharts     │
                  │              (Port 5173)               │
                  └───────────────────┬────────────────────┘
                                      │
                                      │ HTTPS / REST (JSON)
                                      ▼
                  ┌────────────────────────────────────────┐
                  │          Node.js Express Server        │
                  │       ES Modules / Prisma ORM          │
                  │              (Port 5000)               │
                  └─────────┬───────────────────┬──────────┘
                            │                   │
         SQL / Connection   │                   │ Service-to-Service
         Pool               │                   │ (HMAC / Bearer Token)
                            ▼                   ▼
     ┌──────────────────────────────┐   ┌──────────────────────────────┐
     │    PostgreSQL Database       │   │    Python FastAPI AI Service │
     │  (Entities, Geospatial, etc) │   │ (Scikit-Learn ML, Disease CV)│
     │         (Port 5432)          │   │         (Port 8000)          │
     └──────────────────────────────┘   └──────────────────────────────┘
                    ▲
                    │ Cache / Queue
                    ▼
     ┌──────────────────────────────┐
     │         Redis Cache          │
     │         (Port 6379)          │
     └──────────────────────────────┘
```

---

## 2. Core Architectural Principles

1. **Separation of Concerns:**
   - **Frontend (Client):** Single Page Application (SPA) powered by React, Vite, and React Router. Consumes REST APIs from the Node.js backend.
   - **Backend (Server):** Modular Express application handling authentication, role validation, farm lifecycle, transactions, inventory reservation, and business rules.
   - **AI/ML Service (Python):** Dedicated FastAPI service for crop recommendation (Random Forest), disease image analysis (Computer Vision), irrigation rule calculation, and agricultural RAG assistant.

2. **Strict Security Boundaries:**
   - The React client **never** talks directly to the Python AI service. All requests are routed through Express with role validation and ownership checks.
   - Client never holds database credentials or third-party API secrets.
   - Ownership isolation: Every request to `/api/v1/farms/:id` or `/api/v1/orders/:id` verifies that the current authenticated user owns the resource or has an appropriate role (e.g. ADMIN or assigned EXPERT).

3. **Data Integrity & Consistency:**
   - Relational integrity with PostgreSQL via Prisma ORM.
   - Transactional isolation for marketplace orders to avoid race conditions and double-selling.
   - Decimal storage for financial amounts and acreage.

---

## 3. Communication Protocols

| Source | Destination | Protocol / Auth | Purpose |
| :--- | :--- | :--- | :--- |
| Client | Express Server | REST (JSON), JWT Bearer / HttpOnly | User auth, CRUD, marketplace, analytics |
| Express Server | PostgreSQL | Prisma Client (TCP pool) | Relational persistence |
| Express Server | Redis | ioredis (TCP) | Rate limiting, weather cache |
| Express Server | FastAPI AI | REST (HTTP), Service API Key | Model inference, disease CV, predictions |
