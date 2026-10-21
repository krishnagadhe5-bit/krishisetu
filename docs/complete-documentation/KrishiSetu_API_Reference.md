# KrishiSetu Complete API Reference

**Platform:** KrishiSetu (कृषीसेतू) — Smart Farming & Supply Chain Intelligence Platform  
**Protocol:** RESTful over HTTP/HTTPS  
**Data Format:** `application/json` (or `multipart/form-data` for file uploads)  
**Standard Response Envelope:**  
All Express endpoints return a standard structured response envelope:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```
Error responses return:
```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": [ ... ]
}
```

---

## 1. System Health & Documentation Endpoints

### 1.1 GET /api/v1/health
- **Purpose:** Returns platform health status, connected database state, and AI microservice descriptor.
- **Authentication:** None (Public)
- **Rate Limit:** General limiter (100 req / 15 min)
- **Source File:** `server/src/app.js`
- **Verification Status:** **VERIFIED (PASS)**
- **Response Example (200 OK):**
```json
{
  "success": true,
  "message": "KrishiSetu API is healthy",
  "data": {
    "status": "operational",
    "version": "1.0.0",
    "platform": "KrishiSetu",
    "region": "Maharashtra, India",
    "services": {
      "api": "operational",
      "database": "healthy",
      "aiService": "http://localhost:8000"
    },
    "uptime": 1420.5
  }
}
```

### 1.2 GET /api/docs
- **Purpose:** Interactive Swagger UI documentation.
- **Authentication:** None (Public)
- **Source File:** `server/src/app.js`

---

## 2. Authentication & Authorization Module (`/api/v1/auth`)

### 2.1 POST /api/v1/auth/register
- **Purpose:** Registers a new user account with role, location, and encrypted credentials.
- **Authentication:** None (Public)
- **Rate Limit:** 5 requests / 15 minutes (`authLimiter`)
- **Validation:** Zod `RegisterSchema` (email, password min 8 chars with uppercase/lowercase/number, role in enum, fullName min 2 chars).
- **Database Ops:** `prisma.user.findUnique`, `prisma.user.create` with nested `UserProfile`.
- **Source File:** `server/src/modules/auth/auth.controller.js`
- **Verification Status:** **VERIFIED (PASS)**
- **Request Body:**
```json
{
  "email": "farmer_ramesh@krishisetu.in",
  "password": "SecurePassword@123",
  "fullName": "Ramesh Dattatray Shinde",
  "role": "FARMER",
  "phone": "+919822334455",
  "state": "Maharashtra",
  "district": "Pune"
}
```
- **Response Example (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "c1f7b820-2c70-4e4b-910e-862d294bc123",
      "email": "farmer_ramesh@krishisetu.in",
      "role": "FARMER",
      "accountStatus": "ACTIVE",
      "profile": {
        "fullName": "Ramesh Dattatray Shinde",
        "state": "Maharashtra",
        "district": "Pune"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.2 POST /api/v1/auth/login
- **Purpose:** Authenticates user credentials via bcrypt verification and issues a signed JWT.
- **Authentication:** None (Public)
- **Rate Limit:** 5 attempts / 15 minutes (`authLimiter`)
- **Database Ops:** `prisma.user.findUnique` (includes profile and expertProfile).
- **Source File:** `server/src/modules/auth/auth.controller.js`
- **Verification Status:** **VERIFIED (PASS)**
- **Request Body:**
```json
{
  "email": "farmer_ramesh@krishisetu.in",
  "password": "SecurePassword@123"
}
```
- **Response Example (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "c1f7b820-2c70-4e4b-910e-862d294bc123",
      "email": "farmer_ramesh@krishisetu.in",
      "role": "FARMER",
      "profile": { "fullName": "Ramesh Dattatray Shinde" }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.3 GET /api/v1/auth/me
- **Purpose:** Retrieves the current authenticated session identity and profile.
- **Authentication:** Bearer JWT required
- **Source File:** `server/src/modules/auth/auth.controller.js`
- **Verification Status:** **VERIFIED (PASS)**

---

## 3. Farms & Field Management (`/api/v1/farms`, `/api/v1/fields`)

### 3.1 GET /api/v1/farms
- **Purpose:** Lists all registered agricultural holdings owned by the authenticated farmer.
- **Authentication:** Bearer JWT (`FARMER` or `ADMIN`)
- **Database Ops:** `prisma.farm.findMany` where `userId = req.user.id`.
- **Source File:** `server/src/modules/farms/farms.controller.js`
- **Verification Status:** **VERIFIED (PASS)**
- **Response Example (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "f8a912d0-1122-43e1-9aa2-771122334455",
      "name": "Shinde Krishi Farm",
      "state": "Maharashtra",
      "district": "Pune",
      "taluka": "Baramati",
      "village": "Malegaon",
      "areaAcres": 12.5,
      "latitude": 18.152,
      "longitude": 74.578,
      "soilType": "BLACK_COTTON",
      "irrigationType": "DRIP",
      "waterSource": "Borewell + Nira Left Canal",
      "fields": []
    }
  ]
}
```

### 3.2 POST /api/v1/farms
- **Purpose:** Creates a new farm asset with spatial coordinates and soil classification.
- **Authentication:** Bearer JWT (`FARMER`)
- **Validation:** Zod schema requiring `name`, `district`, optional `areaAcres`, `latitude`, `longitude`, `soilType`.

### 3.3 GET /api/v1/farms/dashboard
- **Purpose:** Aggregates farm metrics, active crop counts, recent expenses, and order updates for the farmer's portal.
- **Authentication:** Bearer JWT (`FARMER`)
- **Source File:** `server/src/modules/farms/farms.controller.js`
- **Verification Status:** **VERIFIED (PASS)**

### 3.4 POST /api/v1/fields
- **Purpose:** Adds an agricultural plot/field belonging to a specific farm.
- **Authentication:** Bearer JWT (`FARMER`)
- **Source File:** `server/src/modules/fields/fields.controller.js`

---

## 4. Crops & Crop Cycles (`/api/v1/crops`)

### 4.1 GET /api/v1/crops
- **Purpose:** Returns the reference directory of supported agricultural crops and botanical varieties.
- **Authentication:** None (Public)
- **Source File:** `server/src/modules/crops/crops.controller.js`

### 4.2 POST /api/v1/crops/cycles
- **Purpose:** Initiates a new crop lifecycle on a specific field.
- **Authentication:** Bearer JWT (`FARMER`)
- **Request Body:**
```json
{
  "fieldId": "field-uuid-1234",
  "cropId": "crop-sugarcane-uuid",
  "variety": "Co 86032 (Nira)",
  "season": "Suru",
  "sowingDate": "2026-02-15T00:00:00.000Z",
  "expectedHarvestDate": "2027-01-15T00:00:00.000Z",
  "targetYieldQuintal": 650.0
}
```

### 4.3 POST /api/v1/crops/cycles/:id/activities
- **Purpose:** Logs farm activity (sowing, irrigation, weeding, fertilizer top-dressing).
- **Authentication:** Bearer JWT (`FARMER`)

---

## 5. Weather Intelligence & Advisories (`/api/v1/weather`)

### 5.1 GET /api/v1/weather/current
- **Purpose:** Retrieves real-time weather metrics for a specified district or latitude/longitude.
- **Authentication:** None (Public)
- **Query Parameters:** `district` (string, e.g., "Pune"), `lat`, `lon`.
- **External Integration:** Open-Meteo Weather Forecast API.
- **Source File:** `server/src/modules/weather/weather.controller.js`
- **Verification Status:** **VERIFIED (PASS)**
- **Response Example (200 OK):**
```json
{
  "success": true,
  "data": {
    "provider": "openmeteo",
    "district": "Pune",
    "current": {
      "temp": 28.4,
      "feelsLike": 29.1,
      "humidity": 58,
      "windSpeed": 9.2,
      "rainfallMm": 0.0,
      "pressureHpa": 1012,
      "condition": "Mainly Clear",
      "description": "Mainly clear skies"
    }
  }
}
```

### 5.2 GET /api/v1/weather/forecast
- **Purpose:** Retrieves 7-day meteorological forecast, daily precipitation probability, and computed foliar spray windows.
- **Authentication:** None (Public)
- **Query Parameters:** `district`, `lat`, `lon`.
- **Source File:** `server/src/modules/weather/weather.controller.js`
- **Verification Status:** **VERIFIED (PASS)**

---

## 6. AI & Agricultural Intelligence (`/api/v1/ai`)

### 6.1 POST /api/v1/ai/recommend-crop
- **Purpose:** Feeds soil nutrients ($N, P, K, pH$) and climate metrics into the Scikit-Learn Random Forest model to predict optimal crops.
- **Authentication:** Bearer JWT required (or public advisory preview)
- **External Calls:** Internal HTTP POST to `http://localhost:8000/api/v1/recommend-crop` with `x-api-key`.
- **Database Ops:** `prisma.cropRecommendation.create`, `prisma.predictionRecord.create`.
- **Source File:** `server/src/modules/ai/ai.service.js`
- **Verification Status:** **VERIFIED (PASS)**
- **Request Body:**
```json
{
  "nitrogen": 85,
  "phosphorus": 45,
  "potassium": 40,
  "ph": 6.8,
  "temperature": 27.5,
  "humidity": 65,
  "rainfall": 850
}
```
- **Response Example (200 OK):**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "crop": "Cotton (कापूस)",
        "confidence": 0.9412,
        "matchRationale": "Optimal temperature and soil conditions favor high boll retention.",
        "season": "Kharif"
      },
      {
        "crop": "Soybean (सोयाबीन)",
        "confidence": 0.0388,
        "matchRationale": "Balanced soil nutrients provide ideal vegetative development.",
        "season": "Kharif"
      }
    ],
    "modelVersion": "RandomForest-ICAR-v1.0",
    "timestamp": "2026-10-20T16:15:00.000Z"
  }
}
```

### 6.2 POST /api/v1/ai/disease-detect
- **Purpose:** Evaluates crop foliage image uploads for plant pathology and provides pesticide/organic prescriptions.
- **Authentication:** Bearer JWT (`FARMER`)
- **Payload:** `multipart/form-data` with `image` (max 10MB) and optional `cropCycleId`.
- **Source File:** `server/src/modules/ai/ai.service.js`
- **Verification Status:** **VERIFIED (PASS)**

### 6.3 POST /api/v1/ai/chat
- **Purpose:** Agricultural AI Assistant providing agronomic answers with verified research citations.
- **Authentication:** Bearer JWT required
- **Source File:** `server/src/modules/ai/ai.service.js`
- **Verification Status:** **VERIFIED (PASS)**
- **Request Body:**
```json
{
  "question": "What is the recommended fertilizer split for Sugarcane in Maharashtra?"
}
```
- **Response Example (200 OK):**
```json
{
  "success": true,
  "data": {
    "answer": "For Sugarcane in Western Maharashtra (e.g. Pune, Ahmednagar, Kolhapur), the recommended varieties are Co 86032 (Nira) and CoM 0265 (Phule 265). Ensure balanced N:P:K of 250:115:115 kg/ha applied through drip fertigation in 14 to 16 splits.",
    "sources": [
      {
        "title": "Mahatma Phule Krishi Vidyapeeth (MPKV), Rahuri - Sugarcane Package of Practices",
        "url": "https://mpkv.ac.in"
      }
    ],
    "conversationId": "conv-uuid-12345"
  }
}
```

---

## 7. Markets, Mandi & Marketplace (`/api/v1/markets`, `/api/v1/marketplace`)

### 7.1 GET /api/v1/markets/prices (Alias: `/api/v1/mandi/prices`)
- **Purpose:** Fetches current APMC mandi market commodity prices with district filtering.
- **Authentication:** None (Public)
- **Source File:** `server/src/modules/markets/markets.controller.js`
- **Verification Status:** **VERIFIED (PASS)**

### 7.2 GET /api/v1/markets/forecast
- **Purpose:** Statistical price projection for agricultural commodities over a 7-day horizon.
- **Authentication:** None (Public)

### 7.3 GET /api/v1/marketplace (Alias: `/api/v1/marketplace/listings`)
- **Purpose:** Browses public farmer crop listings with commodity, district, and price filters.
- **Authentication:** None (Public)
- **Source File:** `server/src/modules/marketplace/marketplace.controller.js`
- **Verification Status:** **VERIFIED (PASS)**

### 7.4 POST /api/v1/marketplace/listings
- **Purpose:** Farmer lists harvested produce for sale in the digital mandi marketplace.
- **Authentication:** Bearer JWT (`FARMER`)

---

## 8. Orders, Shipments & Fulfillment (`/api/v1/orders`, `/api/v1/shipments`)

### 8.1 GET /api/v1/orders
- **Purpose:** Lists orders associated with the authenticated user (farmer listings or buyer purchases).
- **Authentication:** Bearer JWT required
- **Source File:** `server/src/modules/orders/orders.controller.js`
- **Verification Status:** **VERIFIED (PASS)**

### 8.2 POST /api/v1/orders
- **Purpose:** Buyer places an order against an active farmer crop listing.
- **Authentication:** Bearer JWT (`BUYER`)

### 8.3 PATCH /api/v1/orders/:id/status
- **Purpose:** Transitions order lifecycle status (ACCEPTED, REJECTED, PROCESSING, SHIPPED, DELIVERED).
- **Authentication:** Bearer JWT (`FARMER`, `BUYER`, or `ADMIN`)

---

## 9. Expenses, Financials & Analytics (`/api/v1/expenses`, `/api/v1/analytics`)

### 9.1 GET /api/v1/expenses
- **Purpose:** Retrieves farming expense records filtered by farm, crop cycle, and category.
- **Authentication:** Bearer JWT (`FARMER`)

### 9.2 POST /api/v1/expenses
- **Purpose:** Logs expenditure on seeds, fertilizer, labor, fuel, machinery, or irrigation.
- **Authentication:** Bearer JWT (`FARMER`)

### 9.3 GET /api/v1/analytics/financial
- **Purpose:** Financial performance metrics: total farm expenses, gross revenue, net profit margin, and category breakdown.
- **Authentication:** Bearer JWT (`FARMER`)

---

## 10. Government Schemes & Consultations (`/api/v1/schemes`, `/api/v1/consultations`)

### 10.1 GET /api/v1/schemes
- **Purpose:** Catalogs government agricultural subsidies and welfare schemes with eligibility guidelines.
- **Authentication:** None (Public)
- **Source File:** `server/src/modules/schemes/schemes.controller.js`
- **Verification Status:** **VERIFIED (PASS)**

### 10.2 POST /api/v1/consultations
- **Purpose:** Farmer creates an advisory ticket for verified agricultural experts.
- **Authentication:** Bearer JWT (`FARMER`)

---

## 11. Notifications & Administration (`/api/v1/notifications`, `/api/v1/admin`)

### 11.1 GET /api/v1/notifications
- **Purpose:** Retrieves in-app alerts and notifications for the authenticated user.
- **Authentication:** Bearer JWT required

### 11.2 GET /api/v1/admin/stats
- **Purpose:** System overview: total registered users, active farms, listings, orders, and database status.
- **Authentication:** Bearer JWT (`ADMIN` only)

### 11.3 GET /api/v1/admin/audit-logs
- **Purpose:** Inspects immutable security and operational audit trails.
- **Authentication:** Bearer JWT (`ADMIN` only)

---

## 12. Python FastAPI AI Service Endpoints (Port 8000)

### 12.1 POST /api/v1/recommend-crop
- **Authentication:** Header `x-api-key: <AI_SERVICE_API_KEY>`
- **Source File:** `ai-service/app/api/routes/recommend.py`
- **Verification Status:** **VERIFIED (PASS)** via Pytest

### 12.2 POST /api/v1/analyze-disease
- **Authentication:** Header `x-api-key: <AI_SERVICE_API_KEY>`
- **Source File:** `ai-service/app/api/routes/disease.py`
- **Verification Status:** **VERIFIED (PASS)** via Pytest

### 12.3 POST /api/v1/chat
- **Authentication:** Header `x-api-key: <AI_SERVICE_API_KEY>`
- **Source File:** `ai-service/app/api/routes/chat.py`
- **Verification Status:** **VERIFIED (PASS)** via Pytest

### 12.4 GET /api/v1/ollama/status
- **Authentication:** Header `x-api-key: <AI_SERVICE_API_KEY>`
- **Purpose:** Checks local Ollama daemon reachability and active LLM model descriptor.
- **Source File:** `ai-service/app/api/routes/chat.py`
