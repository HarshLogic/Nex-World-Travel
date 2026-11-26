# BACKEND ENGINEERING RULES (rules/backend.md)

> **Status**: Active & Mandatory  
> **Runtime**: Node.js 20 (ES Modules), Express 4.21, Zod 3.23

---

## 1. Controller & Service Responsibilities

- **Controller Layer**:
  - Unmarshal HTTP request parameters (`req.params`, `req.query`, `req.body`).
  - Invoke Zod validation schemas and return structured 400 errors on failure.
  - Call appropriate service methods.
  - Select appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500).
  - Delegate unhandled errors to `next(error)`.
- **Service Layer**:
  - House all business logic, entitlement calculations, and ledger updates.
  - Manage hybrid persistence across MongoDB Atlas and in-memory store fallback.
  - Log audit trail entries for significant administrative mutations.

---

## 2. Server-Side Validation & Security

- **Mandatory Zod Schemas**: Every mutation endpoint (`POST`, `PUT`, `PATCH`) must validate input data using strict Zod schemas (`server/src/validators/`).
- **Sanitization**: Trim all strings, lowercase email addresses, and uppercase canonical Member IDs prior to processing.
- **Consistent Response Envelopes**: Always return uniform JSON envelopes:
  ```json
  { "success": true, "message": "...", "data": { ... } }
  ```

---

## 3. Error Handling & Logging

- **Centralized Middleware**: All unhandled exceptions must route through `server/src/middleware/errorHandler.js`.
- **Production Error Masking**: In `production` mode, internal error messages and database stack traces must never be exposed to the client. Return generic, safe descriptions.
- **Audit Logging**: All member creation, status toggling, payment recording, and permission changes must record an entry via `store.logAudit()`.
