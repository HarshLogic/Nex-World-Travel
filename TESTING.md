# NEXWORLD TRAVEL — VERIFICATION & TESTING MANUAL (TESTING.md)

> **Document Version**: 2.0.0  
> **Testing Status**: 100% Passing Across All Automated Test Suites  
> **Test Execution Environment**: Isolated Ephemeral Ports / Safe Memory Fallback

---

## 1. Testing Infrastructure Overview

The NexWorld Travel platform features an automated, zero-external-dependency integration and API test suite located in `server/test/`. The testing harness runs directly on Node.js using native `fetch` and Express ephemeral port binding, eliminating heavy testing framework overhead while delivering rapid, deterministic execution.

### 1.1 Existing Test Suites in Repository

| Test Suite File | Port | Test Count | Scope & Coverage |
| :--- | :---: | :---: | :--- |
| [server/test/api.test.js](file:///home/harshvardhan/Desktop/Nexworldtravel/server/test/api.test.js) | `5098` | 43 Tests | Complete Member Portal, Admin KPI metrics, RBAC permissions, Maker-Checker diff flow, 5,000-member scale test, Direct Image uploads, ETag 304 caching, and financial reconciliation. |
| [server/test/clientCorrections.test.js](file:///home/harshvardhan/Desktop/Nexworldtravel/server/test/clientCorrections.test.js) | `5099` | 18 Tests | Client-requested corrections: Trial Plan membership tier normalization, decoupled booking guest handling, night pool deduction formula, granular employee editing permissions, and password recovery. |
| [server/test/holidayPackageAndImageStorage.test.js](file:///home/harshvardhan/Desktop/Nexworldtravel/server/test/holidayPackageAndImageStorage.test.js) | `5096` | 15 Tests | Permanent image persistence, container restart simulation, fallback disk mirroring, Master Head exclusive Holiday Package CRUD, binary buffer streaming, and text-only edit preservation. |

---

## 2. Test Execution Commands

```bash
# 1. Run Complete Core API Integration Suite (43 Tests)
npm test
# or directly:
node server/test/api.test.js

# 2. Run Client Corrections Verification Suite (18 Tests)
node server/test/clientCorrections.test.js

# 3. Run Holiday Package & Image Persistence Suite (15 Tests)
node server/test/holidayPackageAndImageStorage.test.js

# 4. Run All Test Suites Sequentially
node server/test/api.test.js && node server/test/clientCorrections.test.js && node server/test/holidayPackageAndImageStorage.test.js

# 5. Verify Next.js Client Production Build
npm --prefix client run build
```

---

## 3. Test Isolation & Production Safety Guarantees

### 3.1 Ephemeral Port Binding
All test suites start an isolated Express server instance on unprivileged ephemeral loopback ports (`5096`, `5098`, `5099` on `127.0.0.1`). They close their listener within `finally` blocks, preventing port conflicts with active development servers (`3000` or `5000`).

### 3.2 Database Safety Invariant
- **In-Memory Store Isolation**: The test scripts import `app` directly from `server/src/app.js` without calling `connectDB()`. Consequently, all tests execute exclusively within the isolated in-memory store in `storeService.js`.
- **Zero Production Database Contamination**: Tests never connect to, query, or mutate live MongoDB Atlas collections. Seed accounts (`NEX-M-1001`, `admin@nexworldtravel.com`) are initialized in-memory for the duration of the test process and discarded upon exit.

### 3.3 Transactional Email Safety
The Nodemailer email transporter (`emailService.js`) checks for active SMTP credentials (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`). In test and local environments where credentials are not supplied, emails are automatically redirected to a simulated console logger, preventing accidental email dispatch to clients or reservations desks.

---

## 4. Key Functional Areas Tested

### 4.1 Authentication & Role-Based Access Control (RBAC)
- **Member Authentication**: Verified login with Member ID (`NEX-M-1001`) and case-insensitive normalization. Verified that members can access their own profile (`/api/v1/members/me`) but receive **HTTP 403 Forbidden** when attempting to access staff/admin member lists (`/api/v1/members`).
- **Staff Authentication**: Verified login with corporate email (`staff@nexworldtravel.com`). Verified that deactivated employees are immediately blocked from logging in.
- **Master Head Governance**: Full administrative permissions verified across all routes.

### 4.2 Granular Employee Permissions & Maker-Checker Flow
- **Permission Revocation**: Tested that revoking `create_member` immediately returns **HTTP 403 Forbidden** on subsequent registration attempts without requiring server restart.
- **Maker-Checker Enforcement**: Tested that an employee without direct financial editing permission cannot modify packages or nights, and must submit an `EmployeeChangeRequest` (CR).
- **Master Head Approval**: Verified that when the Master Head approves a Change Request via `/api/v1/change-requests/:id/approve`, the proposed changes apply atomically to the member record, the CR status transitions to `Approved`, and an audit log is recorded.

### 4.3 Financial Reconciliation & EMI Calculations
- **Settled Installment**: Verified that when an installment is fully paid, `dueAmount = 0` and `paymentStatus = 'Up to Date'`.
- **Fully Paid Balance**: Verified that when total payments equal product price, `outstandingBalance = 0`, `dueAmount = 0`, and `paymentStatus = 'Fully Paid'`.
- **Partial Payment**: Verified that remitting less than the installment due amount reduces `dueAmount` accurately and transitions status to `Due Soon`.

### 4.4 Room Night Entitlement Pool
- Verified that room night arithmetic strictly satisfies:
  $$\text{Available Nights} = \max(0, \text{Allotted Nights} - \text{Used Nights})$$
- Tested that booking stay night deductions decrease available nights correctly without allowing negative balances.

### 4.5 Permanent Image Storage & Fallback Resilience
- **Magic Byte Validation**: Tested rejection of invalid file extensions, spoofed MIME headers, and payloads exceeding the 1MB direct image limit (HTTP 400).
- **Container Wipe Simulation**: Tested deleting the image from disk `/public/uploads` and requesting `/uploads/:filename`—verified that the resilient fallback retrieves the binary buffer from MongoDB/memory, streams HTTP 200 with ETag, and self-heals the local disk cache.
- **Strict Image Preservation**: Tested updating package title and price without uploading an image—verified that the existing binary image buffer is 100% preserved without deletion or overwriting.

---

## 5. Next.js Production Build Verification

The frontend production build must be validated whenever client code is modified:

```bash
npm --prefix client run build
```

### Verification Criteria:
- Zero JavaScript syntax or compile errors.
- All 23 static and dynamic routes compiled successfully:
  - 20 Pre-rendered Static Pages (`○`)
  - 3 Server-Rendered Dynamic Pages (`ƒ`) (`/destinations/[slug]`, `/packages/[slug]`, etc.)
- Bundle size within optimal budgets (First Load JS shared by all: ~87.3 kB).
