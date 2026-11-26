# NEXWORLD TRAVEL — SENIOR ENGINEERING CODE AUDIT REPORT (CODE_AUDIT.md)

> **Audit Type**: Comprehensive Senior Engineering Read-Only Source Code & Architecture Audit  
> **Auditor**: Principal Software Engineer & Lead Security Architect  
> **Status**: Completed — All Findings Preserved (Read-Only Mode)  
> **Target System**: NexWorld Travel Production Web Platform

---

## 1. Executive Summary & Audit Methodology

This report presents an exhaustive, evidence-based code audit of the complete NexWorld Travel full-stack codebase. The audit was conducted in **Strict Read-Only Mode**: zero application files were modified, zero bug fixes were applied, and zero production database writes were executed.

### Summary of Audit Findings by Severity

| Severity Level | Definition | Confirmed Count | Potential Count |
| :--- | :--- | :---: | :---: |
| **P0 (Critical)** | Severe vulnerability leading to account takeover, authentication bypass, or direct loss of financial integrity. | 2 | 0 |
| **P1 (High)** | Major security risk, data inconsistency under race conditions, or entitlement calculation errors. | 4 | 0 |
| **P2 (Medium)** | Architecture debt, collision risks, lack of global rate limiting, or container restart state loss. | 5 | 0 |
| **P3 (Low)** | Maintainability issues, client-side storage hygiene, minor convention inconsistencies. | 1 | 0 |
| **Total** | | **12** | **0** |

---

## 2. Detailed Audit Findings Register

---

### Finding ID: `SEC-001`
* **Title**: Plaintext Password Reset Token Returned in API Response Body
* **Category**: Security / Authentication
* **Severity**: **P0 (Critical)**
* **Confidence**: High (Confirmed in Source)
* **File Path**: [server/src/controllers/authController.js](file:///home/harshvardhan/Desktop/Nexworldtravel/server/src/controllers/authController.js#L201-L240)
* **Lines**: 207, 237
* **Status**: **CONFIRMED**

#### Existing Behavior:
When a member or staff member invokes `POST /api/v1/auth/forgot-password`, the backend generates a valid reset token and returns it directly in the HTTP JSON response payload:
```javascript
// Lines 202-208 (Member Password Recovery):
return res.json({
  success: true,
  matched: true,
  message: 'If your provided membership details match our records...',
  token: result.token, // <--- Plaintext token exposed
});

// Lines 233-238 (Staff Password Recovery):
res.json({
  success: true,
  matched: !!result,
  message: 'If an account is associated with this email address...',
  token: result ? result.token : undefined, // <--- Plaintext token exposed
});
```

#### Expected Behavior:
The password reset token must remain strictly confidential on the server. The HTTP API response must only return a generic success message without leaking the token. The token must be transmitted exclusively via transactional email to the verified registered address.

#### Business & Security Impact:
Any malicious actor who discovers a valid Member ID and registered email can initiate a password recovery request, capture the reset token directly from the HTTP response, and immediately reset the victim's password via `POST /api/v1/auth/reset-password`, resulting in **complete account takeover**.

#### Recommended Solution:
Remove the `token` property entirely from both JSON responses in `authController.js`.
* **Estimated Effort**: Small (10 minutes)
* **Verification Method**: Execute `POST /api/v1/auth/forgot-password` in an isolated test and assert `expect(response.body.token).toBeUndefined()`.

---

### Finding ID: `SEC-002`
* **Title**: Hardcoded Secret Fallback in `requireAdmin` Authentication Middleware
* **Category**: Security / Authorization
* **Severity**: **P0 (Critical)**
* **Confidence**: High (Confirmed in Source)
* **File Path**: [server/src/middleware/auth.js](file:///home/harshvardhan/Desktop/Nexworldtravel/server/src/middleware/auth.js#L163-L181)
* **Lines**: 163–170
* **Status**: **CONFIRMED**

#### Existing Behavior:
In `server/src/middleware/auth.js`, the `requireAdmin` helper defines a fallback default token string if the environment variable `ADMIN_TOKEN` is unset:
```javascript
export const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_TOKEN || 'nex_admin_secret_key_2026';

  if (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1] === adminSecret) {
    return next();
  }
  // ...
```
This middleware protects `GET /api/v1/contact` in [server/src/routes/contactRoutes.js](file:///home/harshvardhan/Desktop/Nexworldtravel/server/src/routes/contactRoutes.js#L9).

#### Expected Behavior:
Authentication must never accept static hardcoded secrets embedded in source code. All routes must enforce standard JWT token validation via `authenticate` and verify administrative roles via `requireRole('master_head')`.

#### Business & Security Impact:
Anyone with access to the source code or who guesses the static secret `'nex_admin_secret_key_2026'` can query all customer contact messages, phone numbers, and travel inquiries without authenticating.

#### Recommended Solution:
Eliminate `requireAdmin` and refactor `contactRoutes.js` to use `authenticate, requireRole(['master_head', 'employee'])`.
* **Estimated Effort**: Small (15 minutes)
* **Verification Method**: Test `GET /api/v1/contact` with static bearer token and verify it returns HTTP 401/403.

---

### Finding ID: `SEC-003`
* **Title**: Overly Permissive CORS Configuration with Reflected Origin & Credentials
* **Category**: Security / Network
* **Severity**: **P1 (High)**
* **Confidence**: High (Confirmed in Source)
* **File Path**: [server/src/app.js](file:///home/harshvardhan/Desktop/Nexworldtravel/server/src/app.js#L53-L64)
* **Lines**: 53–64
* **Status**: **CONFIRMED**

#### Existing Behavior:
The Express CORS configuration reflects any incoming `Origin` header and pairs it with `credentials: true`:
```javascript
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      return callback(null, true); // <--- Accepts any origin
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
```

#### Expected Behavior:
CORS origins should be strictly whitelisted to trusted production domains (`https://nexworldtravel.com`, `https://www.nexworldtravel.com`, and approved Railway development origins).

#### Business & Security Impact:
If cookies are utilized for session tokens, a malicious external website could execute cross-origin authenticated API requests against the backend on behalf of an authenticated member or administrator (Cross-Site Request Forgery / CORS exploitation).

#### Recommended Solution:
Validate `origin` against an explicit whitelist array derived from `process.env.CLIENT_URL` and trusted domains.
* **Estimated Effort**: Small (20 minutes)
* **Verification Method**: Send request with `Origin: https://evil-travel.com` and assert CORS header is rejected or suppressed.

---

### Finding ID: `FIN-001`
* **Title**: Non-Atomic Financial Updates in `recordPayment`
* **Category**: Financial Integrity / Database
* **Severity**: **P1 (High)**
* **Confidence**: High (Confirmed in Source)
* **File Path**: [server/src/services/storeService.js](file:///home/harshvardhan/Desktop/Nexworldtravel/server/src/services/storeService.js#L1451-L1543)
* **Lines**: 1475–1533
* **Status**: **CONFIRMED**

#### Existing Behavior:
When a member payment is recorded, `storeService.js` first creates a `PaymentTransaction` record in MongoDB Atlas. Subsequently, it computes new financial balance totals in application memory and calls `this.updateMember(memberId, updatePayload)`:
```javascript
// Step 1: Create transaction record
if (this.isMongoLive()) {
  try {
    await PaymentTransaction.create(paymentRecord);
  } catch (e) { ... }
}

// Step 2: Compute balances in memory
const newPaid = Number(member.totalAmountPaid || 0) + amount;
const newBalance = Math.max(0, Number(member.productPrice || 0) - newPaid);

// Step 3: Update member profile in separate query
await this.updateMember(memberId, updatePayload, author);
```

#### Expected Behavior:
Financial ledger updates and member balance adjustments must execute as a single atomic unit of work inside a database transaction (`session.startTransaction()`).

#### Business Impact:
If the application crashes, restarts, or loses database connectivity between Step 1 and Step 3, the payment transaction exists in the financial ledger, but the member's `totalAmountPaid` and `outstandingBalance` remain uncredited, leading to accounting split-brain and customer disputes.

#### Recommended Solution:
Wrap both operations inside a Mongoose multi-document session transaction (see ADR-006).
* **Estimated Effort**: Medium (1–2 hours)
* **Verification Method**: Simulate a network failure before `updateMember` and verify transaction rollback.

---

### Finding ID: `FIN-002`
* **Title**: Race Condition on Concurrent Member Balance Updates
* **Category**: Financial Integrity / Concurrency
* **Severity**: **P2 (Medium)**
* **Confidence**: High (Confirmed in Source)
* **File Path**: [server/src/services/storeService.js](file:///home/harshvardhan/Desktop/Nexworldtravel/server/src/services/storeService.js#L1375-L1384)
* **Lines**: 1375–1384, 1485–1487
* **Status**: **CONFIRMED**

#### Existing Behavior:
`recordPayment` computes `newPaid` by reading `member.totalAmountPaid` into memory, adding `amount`, and issuing a `$set: { totalAmountPaid: newPaid }` update.

#### Expected Behavior:
Concurrent financial increments must execute using MongoDB atomic update operators:
```javascript
{ $inc: { totalAmountPaid: amount, outstandingBalance: -amount } }
```

#### Business Impact:
If two operational staff record separate installments for the same member simultaneously, the second write will overwrite the first with an incorrect balance, losing recorded revenue from the balance total.

#### Recommended Solution:
Refactor member balance updates to utilize `$inc` operators with schema validation constraints.
* **Estimated Effort**: Medium (2 hours)
* **Verification Method**: Dispatch 5 parallel payment requests of 1,000 AED each and verify the final balance decreases by exactly 5,000 AED.

---

### Finding ID: `FIN-003`
* **Title**: Weak Pseudo-Random Transaction ID Generator with Collision Risk
* **Category**: Financial Integrity / Database
* **Severity**: **P2 (Medium)**
* **Confidence**: High (Confirmed in Source)
* **File Path**: [server/src/services/storeService.js](file:///home/harshvardhan/Desktop/Nexworldtravel/server/src/services/storeService.js#L97-L101)
* **Lines**: 97–101, 1459
* **Status**: **CONFIRMED**

#### Existing Behavior:
`this.generateCode('TXN')` uses a 4-digit random number:
```javascript
generateCode(prefix = 'NEX') {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${random}`;
}
```
This generates identifiers such as `TXN-2026-4821`. With only 9,000 possible IDs per prefix per calendar year, the **Birthday Paradox** dictates a 50% probability of a collision after approximately 112 transactions.

#### Expected Behavior:
Transaction IDs must have sufficient entropy to guarantee global uniqueness without risking primary key collision.

#### Business Impact:
A transaction ID collision will throw an unhandled MongoDB duplicate key error (`E11000 duplicate key error collection: paymenttransactions`), causing a valid customer payment to fail.

#### Recommended Solution:
Include a microsecond timestamp or cryptographic random hex suffix:
```javascript
const random = crypto.randomBytes(4).toString('hex').toUpperCase();
return `${prefix}-${year}-${Date.now().toString().slice(-4)}${random}`;
```
* **Estimated Effort**: Small (15 minutes)
* **Verification Method**: Generate 100,000 transaction codes in an isolated script and assert 0 collisions.

---

### Finding ID: `ENT-001`
* **Title**: Unconfirmed Travel Enquiries Deduct Member Room Nights Before Approval
* **Category**: Membership Management / Entitlements
* **Severity**: **P1 (High)**
* **Confidence**: High (Confirmed in Source)
* **File Path**: [server/src/services/storeService.js](file:///home/harshvardhan/Desktop/Nexworldtravel/server/src/services/storeService.js#L1133-L1164)
* **Lines**: 1136–1140
* **Status**: **CONFIRMED**

#### Existing Behavior:
In `calculateMemberNights()`, stay nights are summed for all bookings that are not cancelled or rejected:
```javascript
const activeBookings = (bookings || []).filter((b) => {
  const s = (b.status || '').toLowerCase().trim();
  return s !== 'cancelled' && s !== 'refunded' && s !== 'closed - lost' && s !== 'rejected';
});
```
This includes bookings with status `Pending`, `New`, `Contacted`, `Awaiting Customer Response`, and `Awaiting Supplier Confirmation`.

#### Expected Behavior:
A customer enquiry or unapproved booking proposal must not deduct room nights from the member's contractual entitlement pool until the booking reaches `Confirmed` or `Approved` status.

#### Business Impact:
If a member submits an enquiry to explore options (e.g. asking about a 10-night stay), their available room nights immediately drop by 10 nights. If staff do not actively reject or cancel the enquiry, the member cannot book other trips, resulting in severe customer dissatisfaction.

#### Recommended Solution:
Invert the filter to only count nights for confirmed states:
```javascript
const s = (b.status || '').toLowerCase().trim();
return s === 'confirmed' || s === 'approved' || s === 'completed';
```
* **Estimated Effort**: Small (20 minutes)
* **Verification Method**: Create a member with 14 allotted nights, submit an enquiry for 7 nights, and verify available nights remains 14 until status becomes `Confirmed`.

---

### Finding ID: `REL-001`
* **Title**: In-Memory Storage of Security & Activation Tokens Causes Token Invalidation on Container Restart
* **Category**: Reliability / DevOps
* **Severity**: **P1 (High)**
* **Confidence**: High (Confirmed in Source)
* **File Path**: [server/src/services/storeService.js](file:///home/harshvardhan/Desktop/Nexworldtravel/server/src/services/storeService.js#L724,L761,L785)
* **Lines**: 724, 761, 785
* **Status**: **CONFIRMED**

#### Existing Behavior:
Password reset tokens and employee account activation tokens are stored in an in-memory `Map`:
```javascript
this.securityTokens.set(token, {
  userId: user._id ? user._id.toString() : user.id,
  email: cleanEmail,
  type: 'reset',
  expiresAt: Date.now() + 60 * 60 * 1000,
});
```

#### Expected Behavior:
Security tokens must persist across container lifecycles in a dedicated MongoDB collection with TTL indexes.

#### Business Impact:
On Railway, containers cycle during deployments, scale events, or RAM limit restarts. When this occurs, all active, unexpired password reset links and employee onboarding activation links immediately become invalid, locking staff and members out.

#### Recommended Solution:
Implement a MongoDB `SecurityToken` model with automated TTL expiration (see ADR-008).
* **Estimated Effort**: Medium (2 hours)
* **Verification Method**: Create a token, restart the server process, and assert the token can still be verified and consumed.

---

### Finding ID: `ARCH-001`
* **Title**: Monolithic `storeService.js` Exceeds 4,000 Lines Violating Single Responsibility
* **Category**: Architecture / Maintainability
* **Severity**: **P2 (Medium)**
* **Confidence**: High (Confirmed in Source)
* **File Path**: [server/src/services/storeService.js](file:///home/harshvardhan/Desktop/Nexworldtravel/server/src/services/storeService.js#L1-L4076)
* **Lines**: 1–4,076
* **Status**: **CONFIRMED**

#### Existing Behavior:
A single file, `storeService.js` (4,076 lines), acts as data access, in-memory store, business calculation engine, and audit logger for all 15 system models.

#### Expected Behavior:
Domain logic should be organized into discrete repository modules (`MemberRepository`, `BookingRepository`, `PackageRepository`, `MediaRepository`).

#### Business Impact:
High cognitive load, merge conflict risks, and elevated regression risks during feature additions.

#### Recommended Solution:
Gradually extract domain modules into a `server/src/repositories/` directory while keeping `storeService.js` as an orchestrating facade during the transition.
* **Estimated Effort**: Large (1–2 days)
* **Verification Method**: Execute all test suites after each domain extraction.

---

### Finding ID: `PERF-001`
* **Title**: Absence of Global API Rate Limiting Exposes System to Resource Exhaustion
* **Category**: Performance / Security
* **Severity**: **P2 (Medium)**
* **Confidence**: High (Confirmed in Source)
* **File Path**: [server/src/app.js](file:///home/harshvardhan/Desktop/Nexworldtravel/server/src/app.js)
* **Lines**: 32–75
* **Status**: **CONFIRMED**

#### Existing Behavior:
`submissionLimiter` is only applied to authentication and booking routes. General endpoints (`GET /api/v1/destinations`, `GET /api/v1/packages`, `GET /api/v1/availability`) have no rate limiting.

#### Expected Behavior:
A baseline global rate limiter (e.g. 150 requests per minute per IP) should protect the application from scraping and Denial-of-Service resource exhaustion on Railway.

#### Business Impact:
Aggressive crawlers or malicious denial-of-service traffic can exhaust Railway CPU and RAM, impacting legitimate users.

#### Recommended Solution:
Mount a global `rateLimit` middleware on `/api/v1` in `server/src/app.js`.
* **Estimated Effort**: Small (15 minutes)
* **Verification Method**: Send 200 requests within 10 seconds and assert HTTP 429 response.

---

### Finding ID: `CMS-001`
* **Title**: Unbounded In-Memory Fallback Arrays in `storeService.js`
* **Category**: Performance / Memory
* **Severity**: **P2 (Medium)**
* **Confidence**: High (Confirmed in Source)
* **File Path**: [server/src/services/storeService.js](file:///home/harshvardhan/Desktop/Nexworldtravel/server/src/services/storeService.js#L80-L95)
* **Lines**: 80–95, 1482, 3570
* **Status**: **CONFIRMED**

#### Existing Behavior:
Arrays such as `this.payments = []`, `this.bookings = []`, and `this.members = []` grow monotonically in process memory whenever mutations occur, without maximum size caps or eviction policies (unlike `this.auditLogs`, which was capped at 100).

#### Expected Behavior:
In-memory mirrors should either be bounded or restricted to cache-recently-used windows to prevent unbounded Node heap expansion.

#### Business Impact:
Over long uptimes with thousands of member interactions, in-memory arrays consume growing heap memory, conflicting with Railway's sub-500MB target.

#### Recommended Solution:
Cap in-memory history arrays or rely strictly on MongoDB Atlas queries when `isMongoLive()` is true.
* **Estimated Effort**: Medium (2 hours)
* **Verification Method**: Simulate 10,000 payments and observe heap usage remains bounded.

---

### Finding ID: `UI-001`
* **Title**: Client-Side Authentication Token Stored in `localStorage`
* **Category**: Security / Frontend
* **Severity**: **P3 (Low)**
* **Confidence**: High (Confirmed in Source)
* **File Path**: [client/lib/auth.js](file:///home/harshvardhan/Desktop/Nexworldtravel/client/lib/auth.js#L1-L15)
* **Lines**: 4–8, 11–15
* **Status**: **CONFIRMED**

#### Existing Behavior:
`saveAuth` stores the JWT token in browser `localStorage` (`nex_auth_token`).

#### Expected Behavior:
For optimal defense against Cross-Site Scripting (XSS), authentication tokens should be stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies.

#### Business Impact:
If a malicious third-party script or XSS vulnerability is introduced, scripts executing in the browser can read the JWT token from `localStorage`.

#### Recommended Solution:
Set an `HttpOnly` cookie in the backend login controller (`res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' })`).
* **Estimated Effort**: Medium (2–3 hours)
* **Verification Method**: Verify cookie is set with `HttpOnly` flag and inaccessible via `document.cookie`.
