# 🚀 Deploying KrishiSetu on Render

This guide outlines how to deploy **KrishiSetu** on [Render.com](https://render.com).

---

## 💡 Architecture & Recommendation: Where to Deploy Each Component

| Component | Code Directory | Render Service Type | Why This Type? | Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | `client/` | **Static Site** | React 18 + Vite SPA compiles to HTML/CSS/JS. Served via global CDN. **Never goes to sleep** (zero cold starts). Free automatic SSL. | **FREE** |
| **Backend API** | `server/` | **Web Service (Node)** | Express dynamic server, handles JWT authentication, Supabase PostgreSQL queries via Prisma, and REST endpoints. | **FREE** |
| **AI Microservice** | `ai-service/` | **Web Service (Python)** | FastAPI microservice running Scikit-Learn crop prediction and Computer Vision leaf pathology. | **FREE** |

> [!IMPORTANT]
> **Key Takeaway:**  
> **DO NOT** deploy the frontend as a Web Service — deploy it as a **Static Site**. It is 100% free, faster, and won't spin down on inactivity.  
> Deploy the **backend API** as a **Web Service**.

---

## ⚡ Option 1: Automated 1-Click Blueprint (Recommended)

KrishiSetu includes a configured `render.yaml` blueprint. Render will automatically configure the Frontend Static Site, Backend Web Service, and AI Web Service together.

### Steps:
1. Push your latest code to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Log in to [dashboard.render.com](https://dashboard.render.com).
3. Click **New +** (top right) ➡️ select **Blueprint**.
4. Connect your repository: `krishnagadhe5-bit/krishisetu`.
5. Render will automatically read `render.yaml` and display all 3 services:
   - `krishisetu-client` (Static Site)
   - `krishisetu-server` (Web Service)
   - `krishisetu-ai` (Web Service)
6. In the environment configuration step, enter your **`DATABASE_URL`**:
   - `postgresql://postgres:YOUR_PASSWORD@db.litmqzzyrdunhpbbtqae.supabase.co:5432/postgres`
7. Click **Apply**. Render will build and deploy all services!

---

## 🛠️ Option 2: Step-by-Step Manual Deployment

If you prefer to create each service individually on Render:

---

### Step 1: Deploy Backend Web Service (`server`)
1. In Render Dashboard, click **New +** ➡️ **Web Service**.
2. Select your GitHub repository: `krishisetu`.
3. Fill in the service details:
   - **Name**: `krishisetu-server`
   - **Language / Runtime**: `Node`
   - **Root Directory**: `server`
   - **Region**: `Oregon (US West)` (or closest to your users)
   - **Branch**: `main`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `5000` | (Render automatically binds to this) |
   | `DATABASE_URL` | `postgresql://...` | Your Supabase PostgreSQL URI |
   | `JWT_SECRET` | *(Random 32-character secret)* | e.g. `krishisetu_super_secure_jwt_secret_2026` |
   | `CLIENT_ORIGIN` | `https://krishisetu-client.onrender.com` | (Update once frontend is created) |
   | `WEATHER_PROVIDER`| `openmeteo` | 100% free live weather |
   | `AI_SERVICE_API_KEY`| `dev-ai-service-key` | Auth for AI microservice |
5. Click **Create Web Service**.  
6. Note down your backend URL (e.g. `https://krishisetu-server.onrender.com`).

---

### Step 2: Deploy Frontend Static Site (`client`)
1. In Render Dashboard, click **New +** ➡️ **Static Site**.
2. Select your GitHub repository: `krishisetu`.
3. Fill in the service details:
   - **Name**: `krishisetu-client`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://krishisetu-server.onrender.com/api/v1` |
   *(Replace with your actual backend URL from Step 1, appending `/api/v1`)*
5. **CRITICAL STEP for Single Page Apps (React Router)**:
   - Scroll down to **Redirects / Rewrites**.
   - Click **Add Rule**:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
   - *This prevents 404 errors when refreshing pages like `/portal/farmer/crops`.*
6. Click **Create Static Site**.

---

### Step 3: Deploy AI Microservice (`ai-service`) (Optional / Recommended)
1. Click **New +** ➡️ **Web Service**.
2. Select your GitHub repository: `krishisetu`.
3. Fill in:
   - **Name**: `krishisetu-ai`
   - **Language / Runtime**: `Python`
   - **Root Directory**: `ai-service`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Under **Environment Variables**, add:
   - `AI_SERVICE_API_KEY`: `dev-ai-service-key`
   - `GEMINI_API_KEY`: *(Optional)* Your Gemini API key for multimodal vision.
5. In your `krishisetu-server` Web Service environment variables, set:
   - `AI_SERVICE_URL`: `https://krishisetu-ai.onrender.com`

---

## 🔍 Verification Checklist

Once deployed:
1. Open your frontend URL: `https://krishisetu-client.onrender.com`
2. Test user login or registration.
3. Test **AI Crop Recommendation** with soil values or preset.
4. Test **Crop Disease & Pathogen Diagnostic** with a sample photo.
5. Verify live weather updates for your farm location.
