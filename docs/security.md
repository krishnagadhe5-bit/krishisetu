# KrishiSetu Security & Authorization Architecture

## 1. Authentication & Session Strategy
- **Token Format:** Short-lived JSON Web Tokens (JWT) signed with HMAC-SHA256.
- **Delivery:** Supported via Authorization Bearer headers and secure HttpOnly cookies.
- **Password Hashing:** Passwords hashed with `bcryptjs` using a minimum salt work factor of 10.
- **Account Protection:** Immediate lockout on account status check (`SUSPENDED` or `DEACTIVATED`).

---

## 2. Server-Side Role-Based Access Control (RBAC)
Client-side conditional rendering is treated strictly as UX enhancement. The Node.js Express server enforces role validation at the controller and route middleware levels.

| Role | Access Scope |
| :--- | :--- |
| **`FARMER`** | Manage owned farms, fields, crop cycles, harvests, expenses; upload crop scans for AI diagnosis; post marketplace listings; accept buyer inquiries; access AI assistant; browse government schemes. |
| **`BUYER`** | Search produce catalog; submit purchase orders; view assigned shipments; run requirement compatibility matchmaker. Cannot access farmer expense ledgers or private farm fields. |

---

## 3. Resource Ownership Isolation
- In every farm, field, crop cycle, or order operation, the database query filters by `userId` or checks ownership explicitly.
- Cross-tenant access attempts (e.g. Farmer A accessing Farmer B's farm ID) return `403 Forbidden` or `404 Not Found` without leaking record existence.

---

## 4. Input Validation & Defenses
- **Request Body & Query Validation:** Zod schemas validate every incoming payload before execution.
- **HTTP Security Headers:** `helmet` applies Content Security Policy, HSTS, X-Content-Type-Options, and Frameguard.
- **Rate Limiting:** `express-rate-limit` enforces 100 requests per 15 minutes globally, with specialized strict thresholds for auth endpoints (15 req/15 min) and AI endpoints (30 req/min).
- **Multipart Upload Sanitization:** File uploads restricted to image MIME types (JPEG, PNG, WebP) with a 10MB file size ceiling.
