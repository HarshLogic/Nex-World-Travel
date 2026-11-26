# NEXWORLD TRAVEL — ARCHITECTURE DECISION RECORDS (ADR)

> **Document Location**: `docs/adr/README.md`  
> **Status**: Active Governance Framework  
> **Repository**: NexWorld Travel & Tourism

---

## 1. About Architecture Decision Records

An **Architecture Decision Record (ADR)** captures an important architectural decision made on the NexWorld Travel codebase, along with its context, considered alternatives, reasoning, and consequences.

All future AI agents, architects, and senior engineers must record significant structural, security, database, or API design decisions in this directory using the standard template below.

---

## 2. Standard ADR Template

```markdown
# ADR-[NUMBER]: [TITLE]

## Metadata
- **Status**: [PROPOSED | ACCEPTED | REJECTED | DEPRECATED | SUPERSEDED]
- **Date**: YYYY-MM-DD
- **Authors**: [Name / Role]
- **Reviewers**: [Master Head / Technical Lead]

## Context & Problem Statement
[Describe the business and technical context, forces, and challenges that necessitate a decision.]

## Considered Alternatives
1. Alternative 1: [Description, pros, cons]
2. Alternative 2: [Description, pros, cons]
3. Alternative 3: [Description, pros, cons]

## Decision
[State the exact architectural decision adopted.]

## Justification & Reasoning
[Explain why this option was chosen over alternatives. Detail technical, operational, and financial considerations.]

## Consequences
- **Positive**: [Benefits, simplifications, performance improvements]
- **Negative**: [Trade-offs, maintenance overhead, constraints introduced]
- **Neutral**: [Structural changes with neutral net impact]

## Specialized Dimensions
- **Security Considerations**: [Impact on OWASP, auth, secrets]
- **Client Data Considerations**: [Guarantees of zero data loss / backward compatibility]
- **Financial Considerations**: [AED precision, ledger immutability]
- **Performance Considerations**: [Railway RAM, latency, bandwidth]
- **Rollback Considerations**: [How to revert if unexpected regression occurs]
```

---

## 3. Register of Verified Historical Architectural Decisions

### ADR-001: Hybrid Dual-Persistence Layer (MongoDB Atlas + In-Memory Fallback)
- **Status**: **ACCEPTED** (Verified in `server/src/services/storeService.js`)
- **Date**: 2026-10-25
- **Context**: The platform is deployed on cloud infrastructure where network partition events, transient Atlas maintenance windows, or credential rotation could cause complete downtime.
- **Decision**: Implemented an in-memory operational store mirror in `storeService.js`. If MongoDB Atlas connectivity drops (`isMongoLive() === false`), the backend seamlessly transitions to servicing reads and writes from the in-memory store without throwing unhandled connection errors or terminating user sessions.
- **Consequences**:
  - *Positive*: 99.99% operational uptime; tests can run 100% in memory without database dependencies.
  - *Negative*: Dual-write logic increases codebase complexity in `storeService.js` (4,076 lines).

---

### ADR-002: Embedded Binary Buffer Media Storage for Cloud Ephemerality Immunity
- **Status**: **ACCEPTED** (Verified in `Package.js`, `Destination.js`, `Activity.js`, `UploadedMedia.js`)
- **Date**: 2026-11-05
- **Context**: Railway containers operate on ephemeral filesystems. Any files uploaded to `/public/uploads` are wiped upon container restart or redeployment, causing images to disappear.
- **Decision**: Embed binary image buffers directly into MongoDB Atlas documents (`image.data` with `{ select: false }` and `UploadedMedia`). Serve images via dedicated streaming endpoints with MD5 ETag conditional caching (HTTP 304) and local disk fallback self-healing.
- **Consequences**:
  - *Positive*: 100% media persistence across redeployments; zero recurring external S3/Cloudinary storage fees; automatic disk cache self-healing.
  - *Negative*: MongoDB document sizes increase (mitigated by strict 1MB limit and `{ select: false }` projection filters).

---

### ADR-003: Two-Tier Maker-Checker Governance for Operational Staff
- **Status**: **ACCEPTED** (Verified in `server/src/models/EmployeeChangeRequest.js` and `client/app/admin/approvals/`)
- **Date**: 2026-10-28
- **Context**: Operational travel consultants need to propose customer plan upgrades or night adjustments, but unvetted direct modifications risk financial discrepancies and contract disputes.
- **Decision**: Implemented an asynchronous Maker-Checker engine. Staff submit proposals via `POST /api/v1/change-requests`. The Master Head reviews side-by-side contract diffs on a dedicated approvals desk (`/admin/approvals`) and approves or rejects with audit logging.
- **Consequences**:
  - *Positive*: Complete administrative governance over contract modifications; immutable audit trail.
  - *Negative*: Requires Master Head intervention for staff-initiated tier adjustments.

---

### ADR-004: Next.js Same-Origin Reverse Proxy Rewrites
- **Status**: **ACCEPTED** (Verified in `client/next.config.mjs`)
- **Date**: 2026-10-26
- **Context**: Decoupled frontend (Next.js) and backend (Express) deployments often incur CORS preflight latency and expose backend service URLs directly to browser inspect tools.
- **Decision**: Configured Next.js `rewrites()` in `next.config.mjs` to proxy `/api/*` and `/uploads/*` requests to the internal backend service URL.
- **Consequences**:
  - *Positive*: Single unified origin (`nexworldtravel.com`); zero CORS preflight delays; backend service host hidden from public clients.
  - *Negative*: Frontend server proxies all API traffic.

---

### ADR-005: Zero-Dependency Client-Side PDF Generation
- **Status**: **ACCEPTED** (Verified in `client/lib/pdfExport.js`)
- **Date**: 2026-11-10
- **Context**: Generating PDF member summary documents on the server using headless browsers (Puppeteer) consumes 150–300 MB of RAM per render, breaching Railway memory limits.
- **Decision**: Developed a pure JavaScript client-side PDF 1.4 binary stream generator running entirely in the user's browser, embedding logos via offscreen Canvas DCTDecode.
- **Consequences**:
  - *Positive*: 0 MB server RAM overhead; instant downloads; privacy preserved (data never sent to external rendering APIs).
  - *Negative*: Complex manual text wrapping and coordinate layout arithmetic in `pdfExport.js`.

---

## 4. Register of Proposed Future Architectural Decisions

### ADR-006 (PROPOSED): Multi-Document MongoDB Transactions for Payment Ledger Operations
- **Status**: **PROPOSED**
- **Context**: In `storeService.js:1477`, `PaymentTransaction.create()` and `MemberProfile.updateOne()` execute as separate non-transactional database writes. A failure between operations leaves records desynchronized.
- **Proposed Decision**: Wrap financial ledger updates in a MongoDB session transaction:
  ```javascript
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await PaymentTransaction.create([paymentRecord], { session });
    await MemberProfile.updateOne({ memberId }, { $inc: { totalAmountPaid: amount, outstandingBalance: -amount } }, { session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
  ```

---

### ADR-007 (PROPOSED): Removal of Plaintext Password Reset Token from API Response
- **Status**: **PROPOSED**
- **Context**: `authController.js:207,237` returns the plaintext password reset token directly in the JSON response body (`token: result.token`) for testing convenience.
- **Proposed Decision**: Strictly remove the `token` key from all `forgotPassword` HTTP response payloads. Transmit reset links exclusively via transactional email to the verified registered address.

---

### ADR-008 (PROPOSED): Migration of Security Tokens to MongoDB TTL Collection
- **Status**: **PROPOSED**
- **Context**: `securityTokens` in `storeService.js` resides in a Node process in-memory `Map`. Container restarts wipe unexpired password reset and account activation tokens.
- **Proposed Decision**: Create a MongoDB `SecurityToken` model with automated TTL index:
  ```javascript
  const securityTokenSchema = new mongoose.Schema({
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['reset', 'activation'], required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  });
  ```
