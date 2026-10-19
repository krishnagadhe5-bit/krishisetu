# KrishiSetu AI/ML Architecture & Model Documentation

## 1. Machine Learning Pipelines Overview
KrishiSetu decouples business domain management (Node.js Express) from compute-intensive machine learning (Python FastAPI microservice).

```
[React Client] ────> [Node.js Express] ────(Internal Auth)────> [Python FastAPI]
                                                                        │
                 ┌──────────────────────────────────────────────────────┴───────────────┐
                 ▼                                  ▼                                   ▼
        Crop Recommendation                Disease Image CV                    Agronomic RAG
     (Random Forest Classifier)        (Leaf Feature Diagnostics)            (Official Corpus)
```

---

## 2. Crop Recommendation ML Pipeline

### Algorithm & Specification
- **Algorithm:** Random Forest Classifier (100 estimators, max depth 12).
- **Preprocessing:** `StandardScaler` on all soil nutrient and climate features.
- **Dataset Provenance:** Calibrated according to Indian Council of Agricultural Research (ICAR) and Maharashtra State Agricultural Universities (MPKV Rahuri, VNMKV Parbhani) agro-ecological zones.
- **Features (7 continuous inputs):**
  1. `nitrogen` (N) in kg/ha
  2. `phosphorus` (P) in kg/ha
  3. `potassium` (K) in kg/ha
  4. `temperature` (°C)
  5. `humidity` (%)
  6. `ph` (Soil reaction index, 0-14)
  7. `rainfall` (Annual/Seasonal precipitation in mm)
- **Target Classes (10 crops):** Cotton, Sugarcane, Soybean, Onion, Pigeonpea, Pomegranate, Wheat, Rice, Tomato, Chickpea.

### Evaluation Metrics (Held-Out Test Set)
- **Train/Test Split:** 80% Train, 20% Held-Out Test (Stratified by crop).
- **Test Accuracy:** **91.67%**
- **Evaluation Artifact:** `ai-service/app/models/model_evaluation_report.json`
- **Model Pipeline Artifact:** `ai-service/app/models/crop_rf_model.joblib`

---

## 3. Crop Disease Computer Vision Pipeline
- **Methodology:** Multi-class plant pathology image classifier identifying common diseases affecting Maharashtra crops (Cotton Bacterial Blight, Sugarcane Red Rot, Soybean Leaf Spot, Tomato Early Blight, Onion Purple Blotch).
- **Inference Pipeline:**
  1. Client sends multipart image to Node.js backend.
  2. Node.js backend validates MIME type (JPEG/PNG/WebP) and file size (≤ 10MB).
  3. Node.js backend saves image to secure storage and forwards stream to FastAPI `/api/v1/analyze-disease`.
  4. FastAPI performs computer vision inference returning predicted disease class, confidence score, visual symptom breakdown, and safe cultural/organic remedies.
- **Safety Protocol:** Chemical pesticide prescriptions and unverified dosages are strictly excluded in accordance with agronomic extension ethics. Farmer can escalate any uncertain scan to a verified human agricultural expert with one click.

---

## 4. Agricultural Knowledge RAG Assistant
- **Architecture:** Retrieval-Augmented Generation grounding responses in authentic agricultural university publications.
- **Corpus Sources:**
  - Mahatma Phule Krishi Vidyapeeth (MPKV), Rahuri agronomic guides
  - Indian Council of Agricultural Research (ICAR) crop advisories
  - Central Institute for Cotton Research (CICR), Nagpur technical bulletins
- **Grounding Principle:** Every generated response includes specific source documents, issuing institution, and publication references. If retrieved evidence is insufficient for a specialized question, the assistant explicitly states uncertainty and recommends consulting a regional Krishi Vigyan Kendra (KVK).
