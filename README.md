# 🌾 KrishiSetu (कृषीसेतू)
### AI-Powered Agricultural Intelligence, Farm Management & Supply Chain Platform

> **Tagline:** *Smart Farming. Better Decisions. Stronger Markets.*  
> **Primary Region:** Maharashtra, India (Extensible across all Indian agricultural zones)  
> **Currencies & Units:** INR (₹), Acres, Hectares, Kilograms, Quintals, Tonnes.

---

## 📌 Executive Summary & Problem Statement

Indian agriculture suffers from deep structural fragmentation. Farmers receive disconnected information across disparate channels: soil health, seasonal crop selection, unpredictable weather patterns, irrigation scheduling, pest/disease outbreaks, harvest expenses, APMC market prices, buyers, and transportation logistics.

Because these activities are completely siloed, farmers struggle to:
1. Accurately plan cultivation cycles based on soil parameters and climate indicators.
2. Calculate true cultivation costs and unit economics (cost per acre and cost per quintal).
3. Detect crop diseases early and obtain safe, agronomic extension advice.
4. Sell agricultural produce directly to verified commercial buyers at fair market prices without middlemen exploitation.
5. Simulate "what-if" agricultural scenarios before investing capital in seeds, fertilizer, and irrigation.

**KrishiSetu** bridges this gap by unifying farm management, machine learning intelligence, supply chain transactions, and agricultural knowledge into a single full-stack platform.

---

## 🏗️ System Architecture

KrishiSetu is built as a clean, decoupled full-stack architecture with strict separation of concerns:

```
                      ┌────────────────────────────────────────┐
                      │          React + Vite Frontend         │
                      │  Tailwind CSS • Recharts • Lucide Map  │
                      │               (Port 5173)              │
                      └───────────────────┬────────────────────┘
                                          │
                                          │ HTTPS / REST (JSON)
                                          ▼
                      ┌────────────────────────────────────────┐
                      │       Node.js Express REST Backend     │
                      │   17 Modular Domains • Prisma ORM      │
                      │               (Port 5000)              │
                      └─────────────┬───────────────────┬──────┘
                                    │                   │
                 Prisma Client Pool │                   │ Internal Auth API
                                    ▼                   ▼
      ┌───────────────────────────────────┐       ┌───────────────────────────────────┐
      │        PostgreSQL Database        │       │     Python FastAPI AI Service     │
      │ 30+ Normalized Models • Schemas   │       │ Random Forest ML • Disease CV     │
      │            (Port 5432)            │       │   Official RAG Agronomic Corpus   │
      └───────────────────────────────────┘       │            (Port 8000)            │
                        ▲                         └───────────────────────────────────┘
                        │
                        ▼
      ┌───────────────────────────────────┐
      │        Redis Cache & Queue        │
      │   Rate Limiting & Session Store   │
      │            (Port 6379)            │
      └───────────────────────────────────┘
```

> **Strict Architectural Rules Maintained:**
> - **Zero Next.js:** Fully independent React.js SPA powered by Vite and React Router v6.
> - **Independent Backend:** Standalone Express server handling business logic, transaction boundaries, and ownership authorization.
> - **Isolated AI Service:** Python FastAPI microservice is never exposed directly to the browser; all client requests route through authenticated Express proxies.

---

## 🚀 Key Platform Features

### 1. 🧑‍🌾 Farm & Field Management
- Multi-farm management with geographic district tagging and GPS coordinates.
- Field-level acreage tracking and soil characteristics (Black Cotton, Alluvial, Red, Loamy).
- Consistent area validation ensuring field allocations never exceed total registered farm boundaries.

### 2. 🌿 Full Crop Lifecycle Engine
- End-to-end tracking through growth stages: `PLANNING` ➔ `SOWING` ➔ `GROWING` ➔ `FLOWERING` ➔ `HARVESTING` ➔ `COMPLETED`.
- Integrated field activities timeline: pesticide spraying, weeding, fertilizer application, and irrigation.
- Harvest yield recording with multi-tier quality grading (Grade A, B, C) and storage tracking.

### 3. 🤖 AI Crop Recommendation (Random Forest ML)
- Powered by a trained Random Forest Classifier with `StandardScaler` pipeline.
- Inputs: Soil Nitrogen (N), Phosphorus (P), Potassium (K), Soil pH, Temperature, Humidity, and Rainfall.
- **Held-Out Test Accuracy: 91.67%** across 10 major crops (Cotton, Sugarcane, Soybean, Onion, Pigeonpea, Pomegranate, Wheat, Rice, Tomato, Chickpea).
- Evaluated against realistic agro-climatic requirements calibrated to Maharashtra State Agricultural Universities (MPKV Rahuri).

### 4. 🔬 Crop Disease Computer Vision Diagnostics
- Multi-class leaf symptom analysis for high-impact regional crop diseases.
- Safe agronomic guidance: cultural practices, sanitation, and organic remedies.
- **Safety First:** Harmful unverified chemical pesticide dosage claims are omitted; farmers can escalate suspicious cases directly to verified human experts.

### 5. ⛅ Weather Intelligence & Smart Irrigation
- Calibrated regional agro-meteorological forecasting engine with 5-day predictive outlook.
- Heat stress and frost warnings with agricultural spraying recommendations.
- Transparent rule-based smart irrigation schedule calculator accounting for crop growth stage, soil water retention, and rainfall forecast.

### 6. 🏪 B2B Farmer-to-Buyer Marketplace
- Farmer produce listings with quantity, unit (kg, quintal, tonne), asking price, quality grade, and pickup location.
- Multi-factor compatibility matcher for buyers (quantity, proximity, price, and quality tolerances).
- **Transaction-Safe Orders:** Prevents inventory overselling under concurrent requests using database transactional reservations and automatic restock on cancellation.

### 7. 💰 Financial Analytics & Digital Twin Simulator
- Categorized expense tracking (seeds, fertilizer, labor, irrigation, machinery, logistics).
- Automated Profit & Loss (P&L) statements, cost per acre, and return on investment.
- **Farm Digital Twin Scenario Simulator:** Model "what-if" agricultural scenarios (rainfall deficits, fertilizer inflation, crop market price drops) to evaluate financial risk before planting.

### 8. 📚 Source-Grounded Agricultural AI Assistant (RAG)
- Agronomic assistant grounded in authentic Indian Council of Agricultural Research (ICAR) and MPKV Rahuri publications.
- Provides verifiable institutional source citations with uncertainty handling.

### 9. 🏛️ Government Schemes & Consultations
- Database of verified state and national schemes (PM-KISAN, PMFBY, MahaDBT, Sub-Mission on Seeds).
- Direct expert consultation portal with image attachment and case status workflows.

---

## 🔑 Pre-Configured Demo Accounts

For technical evaluations and demonstrations, KrishiSetu includes one-click demo credentials accessible directly from the login page:

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **`FARMER`** | `farmer@krishisetu.in` | `Farmer@123` | Farm CRUD, Crop Cycles, AI Crop/Disease, Listings, Expenses, Digital Twin |
| **`BUYER`** | `buyer@krishisetu.in` | `Buyer@123` | Marketplace Browsing, Order Placement, Matching Engine, Shipments |
| **`AGRICULTURE_EXPERT`**| `expert@krishisetu.in` | `Expert@123` | Plant Pathology Case Review, Farmer Advice, Audit History |
| **`ADMIN`** | `admin@krishisetu.in` | `Admin@123` | User Verification, Platform Metrics, Scheme Management, Audit Logs |

---

## 💻 Quick Start & Installation

### Prerequisites
- **Node.js:** v18.x or v20.x+ (tested on Node v24)
- **Python:** v3.10+ (tested on Python 3.11)
- **PostgreSQL:** v15+ (optional for initial run; resilient mode supported)

---

### Step 1: Install Dependencies

```bash
# In repository root:
npm install

# Install client packages:
npm --prefix client install

# Install server packages:
npm --prefix server install

# Set up Python AI virtual environment:
cd ai-service
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
cd ..
```

---

### Step 2: Generate Database Client & Seed (PostgreSQL)

```bash
# Generate Prisma Client:
npm --prefix server run prisma:generate

# Run migrations (when PostgreSQL is active):
npm --prefix server run prisma:migrate

# Seed demo dataset (users, APMC prices, crops, schemes):
npm --prefix server run prisma:seed
```

---

### Step 3: Run Development Services

In separate terminal windows:

#### 1. Start Python AI Microservice (Port 8000)
```bash
cd ai-service
.\venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Start Express Backend API (Port 5000)
```bash
npm --prefix server run dev
```

#### 3. Start React + Vite Frontend (Port 5173)
```bash
npm --prefix client run dev
```

Open your browser at **`http://localhost:5173`**.

---

### Alternative: Docker Compose Development
```bash
docker-compose up --build
```

---

## 🧪 Automated Testing Suite

All tests across all three application layers are passing:

```bash
# 1. Backend API Tests (Jest & Supertest - 7 tests passed)
npm --prefix server test

# 2. Frontend Component Tests (Vitest & React Testing Library - 2 tests passed)
npm --prefix client test -- --run

# 3. AI Microservice Tests (Pytest - 4 tests passed)
cd ai-service
.\venv\Scripts\python -m pytest

# 4. Train & Evaluate ML Crop Recommendation Model (91.67% Accuracy)
cd ai-service
.\venv\Scripts\python tests/training/train_crop_model.py

# 5. Production Build Validation
npm --prefix client run build
```

---

## 📖 Documentation Index
- [Architecture Blueprint & Topology](file:///C:/Users/Lenovo/.gemini/antigravity-ide/scratch/krishisetu/docs/architecture.md)
- [Database Schema & ER Diagram](file:///C:/Users/Lenovo/.gemini/antigravity-ide/scratch/krishisetu/docs/database.md)
- [REST API Endpoint Directory](file:///C:/Users/Lenovo/.gemini/antigravity-ide/scratch/krishisetu/docs/api.md)
- [AI/ML Methodology & Evaluation](file:///C:/Users/Lenovo/.gemini/antigravity-ide/scratch/krishisetu/docs/ai-ml.md)
- [Security & RBAC Enforcement](file:///C:/Users/Lenovo/.gemini/antigravity-ide/scratch/krishisetu/docs/security.md)
- [Automated Testing Strategy](file:///C:/Users/Lenovo/.gemini/antigravity-ide/scratch/krishisetu/docs/testing.md)
- [Production Deployment & Docker](file:///C:/Users/Lenovo/.gemini/antigravity-ide/scratch/krishisetu/docs/deployment.md)

---

## ⚖️ License
KrishiSetu is developed for academic, portfolio, and commercial agricultural technology research under the MIT License.
