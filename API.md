# NEXWORLD TRAVEL — REST API SPECIFICATION REFERENCE (API.md)

> **Document Version**: 2.0.0  
> **Base URL (Local)**: `http://localhost:5000` (Direct) or `http://localhost:3000/api` (Via Proxy)  
> **Base URL (Production)**: `https://nexworldtravel.com/api` (Via Next.js Rewrites)  
> **API Version**: `v1` (Dual-mounted: `/api/v1/...` and `/api/...`)

---

## 1. Authentication & Security Middleware Reference

| Middleware | Header / Credential | Scope & Enforcement |
| :--- | :--- | :--- |
| `authenticate` | `Authorization: Bearer <token>` or Cookie `token` | Validates JWT, verifies user `isActive: true`, attaches `req.user`. Returns 401 on failure. |
| `optionalAuthenticate` | Optional Bearer Token | Attaches `req.user` if valid; continues as guest if absent or invalid. Used for draft preview routes. |
| `requireRole(roles)` | `req.user.role` | Strictly restricts access to declared roles (`['master_head', 'employee']`, `['member']`). Returns 403 on failure. |
| `requirePermission(perm)` | `store.getEmployeePermissions()` | Enforces specific staff permissions. Master Head automatically bypasses all permission checks. |
| `requireMemberOwnership` | `req.user.memberId` | Validates that members can only query or mutate their own member ID. |
| `submissionLimiter` | Client IP Address | Rate limits sensitive endpoints (logins, bookings, password recovery) to 25 requests per 15-minute window. |

---

## 2. Authentication Endpoints (`/api/v1/auth`)

### 2.1 Member Login
- **Method**: `POST`
- **Route**: `/api/v1/auth/member/login`
- **Purpose**: Authenticates a registered luxury travel member.
- **Access**: Public (Protected by `submissionLimiter`).
- **Request Body**:
  ```json
  {
    "memberId": "NEX-M-1001",
    "password": "MemberPassword2026!"
  }
  ```
- **Validation Rules**: `memberId` normalized to uppercase trimmed string; `password` minimum 6 characters.
- **Success Response (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Welcome back, Dr. Tariq Al Nuaimi!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-member-1",
      "role": "member",
      "memberId": "NEX-M-1001",
      "name": "Dr. Tariq Al Nuaimi",
      "email": "member@nexworldtravel.com",
      "phone": "+971 50 123 4567"
    },
    "profile": { ... }
  }
  ```
- **Error Responses**: 
  - `400 Bad Request`: Validation failure.
  - `401 Unauthorized`: Invalid credentials.
  - `403 Forbidden`: Account suspended or deactivated.

### 2.2 Staff & Master Head Login
- **Method**: `POST`
- **Route**: `/api/v1/auth/staff/login`
- **Purpose**: Authenticates travel consultants and executive administrators.
- **Access**: Public (`submissionLimiter`).
- **Request Body**: `{ "email": "admin@nexworldtravel.com", "password": "AdminPassword2026!" }`
- **Success Response (HTTP 200 OK)**: Returns JWT token, user object, and array of assigned permissions (`['ALL']` for Master Head).

### 2.3 Current User Profile
- **Method**: `GET`
- **Route**: `/api/v1/auth/me`
- **Access**: Authenticated (`authenticate`).
- **Success Response (HTTP 200 OK)**: Returns authenticated identity, dynamic permissions, and linked profile.

### 2.4 Password Reset Request
- **Method**: `POST`
- **Route**: `/api/v1/auth/forgot-password`
- **Access**: Public (`submissionLimiter`).
- **Request Body**:
  - Member recovery: `{ "memberId": "NEX-M-1001", "email": "member@nexworldtravel.com" }`
  - Staff recovery: `{ "email": "staff@nexworldtravel.com" }`
- **Audit Note**: The endpoint currently leaks the raw reset token in the response JSON (`token: result.token`) for testing convenience. This must be remediated in production.

---

## 3. Member Management Endpoints (`/api/v1/members`)

### 3.1 Get Members Directory
- **Method**: `GET`
- **Route**: `/api/v1/members`
- **Access**: Staff / Master Head (`requireRole(['master_head', 'employee'])`, `requirePermission(['view_members', 'create_member'])`).
- **Query Parameters**: `page` (default: 1), `limit` (default: 20), `search`, `status`, `packageType`.
- **Response**: Paginated member records, total count, pages, and summary metrics.

### 3.2 Get Member Dossier by ID
- **Method**: `GET`
- **Route**: `/api/v1/members/:id`
- **Access**: Master Head, Staff, or Member matching own ID (`requireMemberOwnership`).
- **Response**: Complete member profile, payment transaction ledger, service tickets, and stay bookings.

### 3.3 Member Self-Profile
- **Method**: `GET`
- **Route**: `/api/v1/members/me`
- **Access**: Member exclusive (`requireRole('member')`).
- **Response**: Member dossier, payment history, room night balances, and active Terms & Conditions text.

### 3.4 Create Member
- **Method**: `POST`
- **Route**: `/api/v1/members`
- **Access**: Master Head or Staff with `create_member` permission.
- **Request Body**:
  ```json
  {
    "registeredName": "Fatima Al Zaabi",
    "email": "fatima@example.com",
    "phone": "+971 52 987 6543",
    "packageType": "Gold Plus",
    "productPrice": 35000,
    "totalAmountPaid": 10000,
    "hasEMI": true,
    "emiAmount": 1500,
    "emiTenureMonths": 24,
    "allottedNights": 14,
    "tenurePeriod": "5 Years",
    "travelCardBenefit": true
  }
  ```
- **Response (HTTP 201 Created)**: Created member dossier with generated `memberId` (`NEX-M-XXXX`) and default password.

### 3.5 Record Member Payment
- **Method**: `POST`
- **Route**: `/api/v1/members/:id/payments`
- **Access**: Master Head or Staff with `update_financial_info` permission.
- **Request Body**:
  ```json
  {
    "amount": 1500,
    "paymentType": "emi_installment",
    "paymentMethod": "Credit Card",
    "referenceNumber": "AUTH-982143",
    "notes": "Installment 3 of 24 settled via online portal."
  }
  ```
- **Response (HTTP 201 Created)**: Transaction record and updated member financial balance.

### 3.6 Acknowledge Terms & Conditions
- **Method**: `POST`
- **Route**: `/api/v1/members/acknowledge-terms`
- **Access**: Member exclusive (`requireRole('member')`).
- **Response (HTTP 200 OK)**: Sets `termsAccepted: true`, records `termsAcceptedAt` timestamp, and assigns active policy version.

---

## 4. Holiday Packages Endpoints (`/api/v1/packages`)

### 4.1 Browse Packages
- **Method**: `GET`
- **Route**: `/api/v1/packages`
- **Access**: Public (`optionalAuthenticate`). Guests receive published packages only; staff can query drafts with `?includeDrafts=true`.
- **Query Parameters**: `region`, `featured`, `search`, `includeDrafts`.

### 4.2 Get Package by Slug
- **Method**: `GET`
- **Route**: `/api/v1/packages/:slug`
- **Access**: Public (`optionalAuthenticate`).

### 4.3 Stream Package Binary Image
- **Method**: `GET`
- **Route**: `/api/v1/packages/:idOrSlug/image`
- **Access**: Public (`optionalAuthenticate`).
- **Headers Returned**: `Content-Type`, `Content-Length`, `ETag`, `Cache-Control: public, max-age=86400`.
- **Response Codes**: HTTP 200 (Binary stream), HTTP 304 (Not Modified if ETag matches), HTTP 404 (Not Found or unpublished draft).

### 4.4 Create Package
- **Method**: `POST`
- **Route**: `/api/v1/packages`
- **Access**: Master Head exclusive (`requireRole('master_head')`).
- **Payload**: Package metadata with optional binary base64 image data.

### 4.5 Update Package
- **Method**: `PATCH`
- **Route**: `/api/v1/packages/:id`
- **Access**: Master Head exclusive.
- **Strict Invariant**: Editing metadata without providing an image strictly preserves the existing binary image.

### 4.6 Delete Package
- **Method**: `DELETE`
- **Route**: `/api/v1/packages/:id`
- **Access**: Master Head exclusive. Soft-deletes (`isDeleted: true`).

---

## 5. Destinations & Activities Endpoints (`/api/v1/destinations`, `/api/v1/activities`)

- `GET /api/v1/destinations`: List destinations (filtered by `category`, `region`).
- `GET /api/v1/destinations/:slug`: Retrieve destination details.
- `GET /api/v1/destinations/:slug/image`: Stream binary image buffer with ETag caching.
- `POST /api/v1/destinations/:id/image`: Upload direct binary image ($\le 1 \text{MB}$).
- `POST /api/v1/destinations`: Create destination (`requirePermission('add_destinations')`).
- `PATCH /api/v1/destinations/:id`: Update destination (`requirePermission('edit_destinations')`).
- `DELETE /api/v1/destinations/:id`: Soft delete destination (`requirePermission('delete_destinations')`).
- `GET /api/v1/activities`: List excursions (filtered by `category`, `region`).
- `GET /api/v1/activities/:slug`: Retrieve excursion details.
- `GET /api/v1/activities/:slug/image`: Stream activity binary image buffer with ETag caching.

---

## 6. Bookings & Travel Inquiries (`/api/v1/bookings`)

- `POST /api/v1/bookings`: Public booking submission with rate limiting (`submissionLimiter`). Dispatches transactional notification emails to reservations desks.
- `GET /api/v1/bookings`: Staff / Admin query of bookings (`requirePermission('manage_bookings')`).
- `PATCH /api/v1/bookings/:id`: Update status (`Confirmed`, `Approved`, `Cancelled`, etc.).
- `POST /api/v1/bookings/:id/notes`: Append internal travel consultant notes.

---

## 7. Change Requests & Maker-Checker Desk (`/api/v1/change-requests`)

- `POST /api/v1/change-requests`: Staff submits proposed package/financial adjustment with mandatory reason.
- `GET /api/v1/change-requests`: Query pending requests (Master Head reviews diffs).
- `POST /api/v1/change-requests/:id/approve`: Master Head approves and applies changes atomically to `MemberProfile`.
- `POST /api/v1/change-requests/:id/reject`: Master Head rejects with notes.

---

## 8. Dashboard & System Diagnostics (`/api/v1/dashboard`)

- `GET /api/v1/dashboard/metrics`: Master Head / Staff KPI aggregation (active members, revenue, outstanding receivables, open bookings, staff counts).
- `GET /api/v1/dashboard/system/memory`: Authenticated diagnostic endpoint reporting live RSS, heap usage, heap total, uptime, and PID to monitor Railway memory consumption.

---

## 9. API Security Findings & Remediation Summary

1. **Password Reset Token in Response**: `POST /api/v1/auth/forgot-password` returns the plaintext reset token in the JSON body. Must be removed immediately for production security.
2. **Hardcoded Fallback Secret in `requireAdmin`**: `server/src/middleware/auth.js` checks `adminSecret = process.env.ADMIN_TOKEN || 'nex_admin_secret_key_2026'`. Must eliminate fallback and migrate all routes to standard `authenticate` + `requireRole`.
3. **Overly Permissive CORS**: `cors({ origin: (origin, cb) => cb(null, true), credentials: true })` permits any origin to send credentialed requests. Must restrict to trusted production domains (`nexworldtravel.com`, `*.railway.app`).
