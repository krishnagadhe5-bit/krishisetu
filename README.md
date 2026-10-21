# 🌾 KrishiSetu (कृषीसेतू)
> **Smart Farming & Agricultural Supply Chain Intelligence Platform**  
> *Bridging Farmers, Agricultural Intelligence, and Direct Markets*

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase%20Cloud-blue.svg)](https://supabase.com/)
[![Open--Meteo](https://img.shields.io/badge/Weather-Open--Meteo%20Live-orange.svg)](https://open-meteo.com/)

---

## 📖 What is KrishiSetu?

**KrishiSetu** is a full-stack agricultural intelligence and marketplace platform built to help farmers make better decisions, access accurate weather and crop intelligence, manage farm operations, and sell produce directly to buyers without middleman exploitation.

---

## 🔄 End-to-End Project Workflow

KrishiSetu connects the complete agricultural lifecycle in **6 simple, interconnected stages**:

```
 ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
 │ 1. Farm Setup   │ ────► │ 2. Crop Advisory│ ────► │ 3. Lifecycle    │
 │ Register farm & │       │ AI Crop Model   │       │ Sowing, growth  │
 │ soil parameters │       │ (91.67% Acc)    │       │ & activities    │
 └─────────────────┘       └─────────────────┘       └─────────────────┘
                                                              │
                                                              ▼
 ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
 │ 6. Financials   │ ◄──── │ 5. Marketplace  │ ◄──── │ 4. Real-Time    │
 │ Expense ledger  │       │ Direct P2P sale │       │ Weather & Spray │
 │ & Profit ROI    │       │ to verified buy │       │ Open-Meteo live │
 └─────────────────┘       └─────────────────┘       └─────────────────┘
```

### The 6 Stages Explained:
1. **🧑‍🌾 Farm & Field Setup:**
   The farmer registers their land holdings with GPS coordinates, acreage, soil classification (e.g. Black Cotton, Loamy), and irrigation sources.
2. **🌱 AI Crop Recommendation:**
   The farmer enters soil nutrient levels ($N, P, K, pH$) and climate indicators. A trained **Random Forest Machine Learning model** predicts the top 3 optimal crops with seasonal suitability and agronomic rationales.
3. **📅 Crop Cycle & Activity Tracking:**
   The farmer initializes a seasonal crop cycle (e.g., Sugarcane or Cotton) and logs farm activities (sowing, fertigation, weeding, spraying).
4. **⛅ Weather & Risk Management:**
   Live **Open-Meteo API** provides 7-day meteorological forecasts, hourly rain probability, FAO-56 Penman-Monteith evapotranspiration ($ET_0$), and calculated **precision chemical spray safety windows**. Leaf disease symptoms can be uploaded for instant diagnosis.
5. **🏪 Direct Marketplace Discovery:**
   Harvested yields are listed on the digital marketplace with quantity, grade, and price per quintal. Institutional and bulk buyers discover listings and place direct purchase orders.
6. **📊 Farm Financials & Net Profit:**
   Input costs (seeds, fertilizer, labor, fuel) are tracked against harvest sales revenue to calculate the true cost of cultivation per acre and net profit margins.

---

## 🏛️ System Architecture

KrishiSetu follows a decoupled 3-tier architecture with strict separation of concerns:

- **Frontend Client (Port `5173`):** React 18, Vite 6, Tailwind CSS, TanStack Query, Recharts, and React-Leaflet OpenStreetMap.
- **Backend API Gateway (Port `5000`):** Node.js 20+, Express 4.21, Prisma ORM 5.22, Bcrypt (12 salt rounds), JWT authentication, rate-limiting, and Helmet security.
- **Database (Cloud Port `5432`):** Supabase Cloud PostgreSQL with 42 relational models, 15 custom enums, and Row-Level Security.
- **AI Microservice (Port `8000`):** Python 3.11, FastAPI, Scikit-Learn Random Forest model, and grounded RAG assistant (with optional local Ollama LLM support).
- **External Meteorological API:** Open-Meteo High-Resolution Forecast API (100% free and open-access, zero API key required).

---

## 👥 User Roles & Personas

- **Farmer (`FARMER`):** Farm management, field & soil testing tracking, crop cycle tracking, AI crop & disease diagnosis, weather alerts, financial analytics, government scheme lookup, and direct produce listing.
- **Buyer (`BUYER`):** Real-time agricultural marketplace browsing, crop search & filtering, direct order placement, requirement matching, and purchase management.

---

## ⚡ Quick Start Guide (Local Setup)

### 1. Prerequisites
- **Node.js** v20+ LTS
- **Python** v3.11+
- **Git**

### 2. Clone Repository
```bash
git clone https://github.com/krishnagadhe5-bit/krishisetu.git
cd krishisetu
```

### 3. Install Dependencies
```bash
# Install backend dependencies
npm --prefix server install

# Install frontend dependencies
npm --prefix client install

# Setup Python AI service
cd ai-service
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
# source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 4. Configure Environment Files
Copy the `.env.example` templates:
```bash
# Server configuration
cp server/.env.example server/.env

# AI Service configuration
cp ai-service/.env.example ai-service/.env
```
*Update `server/.env` with your PostgreSQL `DATABASE_URL` and `JWT_SECRET`.*

### 5. Initialize Database
```bash
# Generate Prisma Client
npm --prefix server run prisma:generate

# Seed initial crops, mandis, and schemes
npm --prefix server run prisma:seed
```

### 6. Run the Application
Open 3 terminal windows:
```bash
# Terminal 1: Express Backend (Port 5000)
npm --prefix server run dev

# Terminal 2: React Frontend (Port 5173)
npm --prefix client run dev

# Terminal 3: FastAPI AI Service (Port 8000)
cd ai-service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Web App:** Open `http://localhost:5173`
- **REST API Health:** `http://localhost:5000/api/v1/health`
- **Swagger API Docs:** `http://localhost:5000/api/docs`

---

## 🧪 Verified Automated Test Results

The platform has been audited with **100% test pass rates (31/31 automated tests passed)**:
- **Full-Stack End-to-End Audit:** `15 / 15 PASSED` (`node server/scripts/test_all_features.js`)
- **Server API Jest Tests:** `7 / 7 PASSED` (`npm --prefix server test`)
- **Python AI Microservice Tests:** `5 / 5 PASSED` (`pytest ai-service/tests`)
- **Frontend Component Tests:** `4 / 4 PASSED` (`npm --prefix client test`)
- **Production Build:** Vite production bundle compiles with `0 errors`.

---

## 📚 Complete Engineering Documentation

Comprehensive technical documentation, architecture diagrams, and a client-ready vector PDF report are located in:
👉 **[`docs/complete-documentation/`](docs/complete-documentation/)**

- **Client PDF Report:** [`KrishiSetu_Complete_Technical_Documentation.pdf`](docs/complete-documentation/KrishiSetu_Complete_Technical_Documentation.pdf)
- **Master Documentation:** [`KrishiSetu_Complete_Technical_Documentation.md`](docs/complete-documentation/KrishiSetu_Complete_Technical_Documentation.md)
- **API Reference Guide:** [`KrishiSetu_API_Reference.md`](docs/complete-documentation/KrishiSetu_API_Reference.md)
- **Feature Implementation Matrix:** [`KrishiSetu_Feature_Implementation_Matrix.md`](docs/complete-documentation/KrishiSetu_Feature_Implementation_Matrix.md)
- **Architecture Diagrams (Mermaid):** [`KrishiSetu_Architecture_Diagrams/`](docs/complete-documentation/KrishiSetu_Architecture_Diagrams/)

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
