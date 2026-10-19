# KrishiSetu REST API Specification

**Base URL:** `http://localhost:5000/api/v1`  
**Interactive Swagger Docs:** `http://localhost:5000/api/docs`  
**Authentication Scheme:** Bearer Token (JWT in Authorization header or HttpOnly cookie)

---

## 1. Authentication & Users
- `POST /auth/register` — Register a new account (`FARMER`, `BUYER`, `AGRICULTURE_EXPERT`).
- `POST /auth/login` — Authenticate credentials and receive JWT access token.
- `GET /auth/me` — Retrieve current authenticated session and profile.
- `PUT /users/profile` — Update address, district, state, phone, language preferences.
- `PUT /users/password` — Update user security credentials.

## 2. Farms & Fields
- `GET /farms` — List farms owned by authenticated farmer (with filtering, pagination).
- `POST /farms` — Register a new farm (name, district, coordinates, soil type, irrigation method).
- `GET /farms/:id` — Get full farm dossier including fields, crop cycles, and historical soil tests.
- `PUT /farms/:id` — Update farm properties.
- `DELETE /farms/:id` — Archive/delete farm.
- `GET /fields` — List fields across farms.
- `POST /fields` — Add field to farm with area validation.

## 3. Crop Lifecycle & Activities
- `GET /crops` — Agricultural crop catalog (sugarcane, cotton, onion, soybean, pomegranate, etc.).
- `GET /crops/cycles` — Active and historical crop cycles with growth stages.
- `POST /crops/cycles` — Initiate a crop cycle in a specific field.
- `PATCH /crops/cycles/:id/stage` — Advance crop growth stage.
- `POST /crops/cycles/:id/activities` — Record timeline actions (spraying, weeding, fertilizer).
- `POST /crops/cycles/:id/harvest` — Record harvest yield, grading, and storage location.

## 4. Agricultural AI Microservice Proxies
- `POST /ai/recommend-crop` — ML inference based on N, P, K, pH, rainfall, temperature, and soil type.
- `POST /ai/analyze-disease` — Multipart image upload for leaf disease computer vision diagnostics.
- `POST /ai/irrigation/:farmId` — Transparent rule-based smart irrigation schedule calculator.
- `POST /ai/chat` — Source-grounded RAG agricultural assistant with citations.

## 5. Weather Intelligence
- `GET /weather/current?district=Pune&state=Maharashtra` — Real-time climate conditions and 5-day forecast with agricultural advisory.
- `GET /weather/farm/:farmId` — Farm-specific micro-climate analysis based on registered coordinates.

## 6. Markets & Price Intelligence
- `GET /markets` — List APMC mandis across Maharashtra.
- `GET /markets/prices` — Filter historical and current commodity prices by crop and market.
- `GET /markets/trends/:cropId` — 15-day price trajectories, modal price trends, and volume.

## 7. Marketplace & Orders
- `GET /marketplace/listings` — Search and filter farmer produce listings (quality, district, quantity).
- `POST /marketplace/listings` — Publish a produce lot for sale (farmer only).
- `POST /orders` — Create a purchase order with transactional inventory reservation.
- `GET /orders` — Buyer purchase orders or farmer sales orders.
- `PATCH /orders/:id/status` — Advance order state (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `COMPLETED`, `CANCELLED`).

## 8. Logistics & Shipments
- `GET /shipments` — Active logistics manifests.
- `POST /shipments` — Dispatch consignment with vehicle details and route checkpoints.
- `PATCH /shipments/:id/status` — Update transit status with driver check-ins.

## 9. Financial Analytics & Digital Twin
- `GET /expenses` — Itemized expenditures with category summaries.
- `POST /expenses` — Record farm input costs (seeds, labor, fertilizer, machinery).
- `GET /analytics/farm-pnl/:farmId` — Profit & Loss statement comparing harvest sales with input costs.
- `POST /analytics/digital-twin/simulate` — What-if scenario analysis with rainfall, cost, and price variance modeling.

## 10. Consultations, Schemes & Administration
- `GET /consultations` — Active expert cases and farmer inquiries.
- `POST /consultations` — Submit consultation question with crop and field linkage.
- `POST /consultations/:id/messages` — Post expert advice or farmer follow-up.
- `GET /schemes` — Verified government schemes (PM-KISAN, PMFBY, MahaDBT, Sub-Mission on Seeds).
- `GET /admin/users` — Account management and expert credential verification (Admin only).
- `GET /admin/audit-logs` — Security and platform transaction audit trail (Admin only).
