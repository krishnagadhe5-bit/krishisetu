# KrishiSetu Automated Testing Strategy

## 1. Testing Pyramid & Tools
- **Frontend Unit & Component Testing:** Vitest, React Testing Library, JSDOM
- **Backend API Integration Testing:** Jest, Supertest
- **AI Microservice Testing:** Pytest, FastAPI TestClient

---

## 2. Test Execution Commands

### A. All Backend API Integration Tests
```bash
npm --prefix server test
```
*Covers:*
- Platform health check (`/api/v1/health`)
- 404 handler envelopes
- Authentication payload validation (registration & login)
- Protected route 401 enforcement
- Regional weather climate engine and advisory calculations
- AI proxy authentication gates

### B. All Frontend Component Tests
```bash
npm --prefix client test -- --run
```
*Covers:*
- Core layout and typography rendering
- Agricultural branding and Marathi/Hindi localization badges
- Call-to-action routing and navigation bar links

### C. All AI Microservice Tests
```bash
cd ai-service
.\venv\Scripts\python -m pytest
```
*Covers:*
- Microservice health status and model versions
- ML crop recommendation authentication header enforcement
- Crop suitability multi-class prediction and confidence scores
- Grounded RAG knowledge citations and institutional source references

### D. Machine Learning Training & Evaluation
```bash
cd ai-service
.\venv\Scripts\python tests/training/train_crop_model.py
```
*Covers:*
- Held-out 20% stratified test set evaluation
- Preprocessing pipeline validation
- 91.67% test accuracy reproduction
