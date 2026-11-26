# NEXWORLD TRAVEL — SYSTEM ARCHITECTURE DOCUMENTATION (ARCHITECTURE.md)

> **Document Version**: 2.1.0  
> **Platform**: NexWorld Travel & Tourism Enterprise Web Application  
> **Architecture Status**: Verified from Repository Inspection  
> **Target Environment**: Railway Cloud Deployment (Next.js 14 + Node.js/Express + MongoDB Atlas)

---

## 1. System Overview & Technology Stack

NexWorld Travel & Tourism ([nexworldtravel.com](https://nexworldtravel.com)) is an enterprise-grade luxury travel management platform designed to service members, travel consultants, and administrative executives. The platform operates on a decoupled client-server architecture with dynamic same-origin proxy rewrites, dual-layer persistent storage, and an in-browser zero-dependency PDF rendering engine.

### 1.1 Verified Technology Stack

| Layer | Technology | Version | Purpose & Implementation Details |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | 14.2.15 | React 18 server and client components, dynamic rewrites proxy, hybrid static generation and client rendering. |
| **Styling & Icons** | Tailwind CSS / Lucide React | 3.4.14 / 0.454.0 | Luxury branding theme, responsive layouts, accessible UI icons. |
| **Animation** | Framer Motion | 11.11.17 | Interactive transitions, carousel animations, modal viewports. |
| **Backend Runtime** | Node.js (ES Modules) | 20.x | High-throughput asynchronous runtime utilizing native ES Modules (`"type": "module"`). |
| **API Framework** | Express.js | 4.21.1 | REST API micro-routes, centralized middleware pipeline, static uploads serving with binary fallbacks. |
| **Database** | MongoDB Atlas | Mongoose 8.7.2 | Document database with custom connection pooling, schema validations, and binary media buffer storage. |
| **Resilient Persistence** | Hybrid Store (`storeService.js`) | Custom | In-memory operational store acting as immediate zero-downtime failover if MongoDB connectivity drops. |
| **Security & Auth** | JWT & bcryptjs | 9.0.3 / 3.0.3 | Stateless SHA-256 JWT sessions, 10-round salted bcrypt password hashing, HTTP-only cookie support. |
| **Input Validation** | Zod | 3.23.8 | Strict server-side schema validation on all mutations (members, bookings, contacts, change requests). |
| **Transactional Email** | Nodemailer | 10.2.1 | Multi-destination transactional SMTP dispatcher with simulated fallbacks. |
| **Hosting Platform** | Railway | PaaS | Decoupled Node.js backend service and Next.js frontend with ephemeral container disks. |

---

## 2. Complete System Architecture & Module Boundaries

```mermaid
flowchart TD
    subgraph PublicLayer ["1. Client Layer (Next.js 14 App Router)"]
        UI_Home["Public Discovery\n(/, /destinations, /activities, /packages)"]
        UI_MemberPortal["Member Self-Service Portal\n(/member/dashboard, /member/login)"]
        UI_EmployeePortal["Employee Operations Desk\n(/employee/dashboard, /employee/login)"]
        UI_AdminPortal["Master Head Command Center\n(/admin/dashboard, /admin/approvals)"]
        UI_AuthPages["Password Recovery & Activation\n(/forgot-password, /reset-password, /activate)"]
        ClientProxy["Next.js Dynamic Rewrites Proxy\n(/api/*, /uploads/*)"]
    end

    subgraph SecurityGateway ["2. Security & Gateway Pipeline"]
        HelmetMW["Helmet Security Headers\n(CORP: cross-origin)"]
        CORSMW["CORS Layer\n(Credentials & Origin Management)"]
        URLNorm["URL Normalizer\n(Double-slash & Prefix Sanitizer)"]
        RateLimitMW["Rate Limiter\n(express-rate-limit 25 req/15min)"]
        AuthMW["Authentication Middleware\n(Bearer JWT & Cookie Extraction)"]
        RBACMW["Role & Permission Guards\n(requireRole, requirePermission, requireMemberOwnership)"]
    end

    subgraph BackendControllers ["3. Application Controllers Layer"]
        AuthCtrl["AuthController\n(Logins, Tokens, Recovery)"]
        MemberCtrl["MemberController\n(Dossiers, Payments, Profiles)"]
        ReqCtrl["RequestController\n(Member Inquiries & Change Requests)"]
        BookingCtrl["BookingController\n(Bookings, Notes, Statuses)"]
        PkgCtrl["PackageController\n(Holiday Packages & Image Streaming)"]
        CMSCtrl["Destination & Activity Controllers\n(CMS Content & Direct Media)"]
        TermsCtrl["TermsController\n(Legal Policies & Versioning)"]
        DashCtrl["DashboardController\n(Metrics & RAM Diagnostics)"]
        MediaCtrl["MediaController\n(Dual Disk/Mongo Uploads)"]
    end

    subgraph DataServices ["4. Core Services Layer"]
        StoreSvc["StoreService (4,076 lines)\n(Central Data Access & In-Memory Fallback)"]
        AuthSvc["AuthService\n(JWT Sign/Verify, bcrypt compare)"]
        EmailSvc["EmailService\n(Nodemailer SMTP Transporter)"]
        ImageValidator["ImageValidator\n(Magic Bytes & Size Verification)"]
    end

    subgraph PersistenceLayer ["5. Persistence & Storage Layer"]
        MongoAtlas[("MongoDB Atlas Primary DB\n(15 Collections)")]
        MemStore[("In-Memory State Store\n(High-Availability Resilient Mirror)")]
        DiskUploads[("Ephemeral Container Disk\n(/public/uploads)")]
    end

    UI_Home --> ClientProxy
    UI_MemberPortal --> ClientProxy
    UI_EmployeePortal --> ClientProxy
    UI_AdminPortal --> ClientProxy
    UI_AuthPages --> ClientProxy

    ClientProxy --> HelmetMW --> CORSMW --> URLNorm --> RateLimitMW --> AuthMW --> RBACMW

    RBACMW --> AuthCtrl
    RBACMW --> MemberCtrl
    RBACMW --> ReqCtrl
    RBACMW --> BookingCtrl
    RBACMW --> PkgCtrl
    RBACMW --> CMSCtrl
    RBACMW --> TermsCtrl
    RBACMW --> DashCtrl
    RBACMW --> MediaCtrl

    AuthCtrl --> AuthSvc & EmailSvc & StoreSvc
    MemberCtrl --> StoreSvc
    ReqCtrl --> StoreSvc & EmailSvc
    BookingCtrl --> StoreSvc & EmailSvc
    PkgCtrl --> StoreSvc & ImageValidator
    CMSCtrl --> StoreSvc & ImageValidator
    TermsCtrl --> StoreSvc
    DashCtrl --> StoreSvc
    MediaCtrl --> StoreSvc & ImageValidator

    StoreSvc --> MongoAtlas
    StoreSvc -.->|Failover / Sync| MemStore
    MediaCtrl --> DiskUploads
    MediaCtrl --> MongoAtlas
```

---

## 3. Frontend-to-Backend Request Flow & Reverse Proxy

All client-side API requests and media asset requests route through the Next.js `rewrites()` reverse proxy configured in `client/next.config.mjs`. This architecture ensures same-origin communication, eliminating cross-origin CORS preflight latency in production and concealing the backend Railway service URL.

```mermaid
sequenceDiagram
    autonumber
    actor User as Browser / Member Client
    participant NextClient as Next.js App (Port 3000)
    participant RewriteProxy as Next.js Rewrites Engine
    participant ExpressServer as Express REST API (Port 5000)
    participant Store as StoreService
    participant MongoDB as MongoDB Atlas

    User->>NextClient: Navigate /member/dashboard
    NextClient->>RewriteProxy: GET /api/v1/members/me (Bearer Token)
    RewriteProxy->>ExpressServer: Forward to ${BACKEND_URL}/api/v1/members/me
    ExpressServer->>ExpressServer: Authenticate JWT & Extract User Identity
    ExpressServer->>Store: getMemberById(req.user.memberId)
    alt MongoDB Live (ReadyState === 1)
        Store->>MongoDB: MemberProfile.findOne({ memberId })
        MongoDB-->>Store: Member Document
    else MongoDB Unreachable
        Store->>Store: Retrieve from this.members Map
    end
    Store-->>ExpressServer: Return Member Dossier + Financials
    ExpressServer-->>RewriteProxy: HTTP 200 OK (JSON Payload)
    RewriteProxy-->>NextClient: Pass through Response
    NextClient-->>User: Render Dashboard with Live Metrics
```

---

## 4. Authentication Architecture & Session Lifecycle

Authentication supports three distinct personas:
1. **Members**: Login using unique uppercase **Member ID** (e.g. `NEX-M-1001`) and password via `/api/v1/auth/member/login`.
2. **Employees / Travel Consultants**: Login using corporate email (e.g. `staff@nexworldtravel.com`) and password via `/api/v1/auth/staff/login`.
3. **Master Head Administrators**: Login using executive email (e.g. `admin@nexworldtravel.com`) and password via `/api/v1/auth/staff/login`.

```mermaid
sequenceDiagram
    autonumber
    actor Client as User / Browser
    participant API as Auth Controller (/auth/*)
    participant Validator as Zod Auth Validator
    participant Store as StoreService
    participant Bcrypt as bcryptjs Engine
    participant JWT as AuthService (jsonwebtoken)

    Client->>API: POST /api/v1/auth/member/login { memberId, password }
    API->>Validator: validateMemberLogin(req.body)
    Validator-->>API: Validated Credentials
    API->>Store: getUserByMemberId(memberId)
    Store-->>API: User Record with Salted passwordHash
    API->>Bcrypt: compare(password, user.passwordHash)
    alt Invalid Password
        Bcrypt-->>API: false
        API-->>Client: HTTP 401 Unauthorized ("Invalid Member ID or password.")
    else Valid Password
        Bcrypt-->>API: true
        API->>JWT: generateToken({ id, role, memberId, name })
        JWT-->>API: Signed JWT (HS256, 7d Expiry)
        API->>Store: getMemberById(memberId)
        Store-->>API: Full Member Profile
        API-->>Client: HTTP 200 OK { token, user, profile }
    end
```

---

## 5. Master Head & Employee Maker-Checker Permission Governance

To prevent unauthorized tampering with client financial contracts, package tiers, and room night entitlements, operational staff operate under a maker-checker engine. Staff can directly edit permitted contact information (phone, address), but any modification to packages, nights, or financials requires formal proposal submission.

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Travel Consultant (Employee)
    participant Portal as Employee Portal (/employee/dashboard)
    participant API as Request Controller (/change-requests)
    participant Store as StoreService
    participant DB as MongoDB Atlas
    actor MasterHead as Master Head Admin (/admin/approvals)

    Staff->>Portal: Propose Night Allocation Increase (+5 Nights)
    Portal->>API: POST /api/v1/change-requests { memberId, proposedValue, reason }
    API->>Store: createChangeRequest(data, employee)
    Store->>DB: Insert into EmployeeChangeRequests (Status: "Pending")
    Store-->>API: Created Request (CR-2026-XXXX)
    API-->>Portal: HTTP 201 Created ("Submitted for Master Head review")

    Note over MasterHead: Master Head reviews pending requests in real time
    MasterHead->>API: GET /api/v1/change-requests?status=Pending
    API->>DB: Fetch pending change requests
    DB-->>API: Requests List
    API-->>MasterHead: Display Side-by-Side Diff (Current vs. Proposed)

    alt Master Head Approves
        MasterHead->>API: POST /api/v1/change-requests/:id/approve
        API->>Store: approveChangeRequest(id, reviewer)
        Store->>DB: Update MemberProfile with proposedValue
        Store->>DB: Update EmployeeChangeRequests status="Approved"
        Store->>DB: Append to AuditLogs collection
        API-->>MasterHead: HTTP 200 OK ("Approved and applied.")
    else Master Head Rejects
        MasterHead->>API: POST /api/v1/change-requests/:id/reject { reason }
        API->>Store: rejectChangeRequest(id, reviewer, reason)
        Store->>DB: Update EmployeeChangeRequests status="Rejected"
        API-->>MasterHead: HTTP 200 OK ("Request rejected; member untouched.")
    end
```

---

## 6. Member Registration Lifecycle

New members can be registered by the Master Head or by employees with the `create_member` permission.

```mermaid
sequenceDiagram
    autonumber
    actor AdminStaff as Master Head / Authorized Staff
    participant API as Member Controller (POST /api/v1/members)
    participant Validator as Zod Member Validator
    participant Store as StoreService
    participant DB as MongoDB Atlas

    AdminStaff->>API: POST /api/v1/members { registeredName, email, phone, packageType, productPrice, ... }
    API->>Validator: validateCreateMember(payload)
    Validator-->>API: Sanitized & Validated Data
    API->>Store: createMember(data, author)
    Store->>Store: Generate Unique Member ID (e.g. NEX-M-8492)
    Store->>Store: Generate Default Password (e.g. NexWorld@2026!)
    Store->>DB: Create User Document (role="member", passwordHash)
    Store->>DB: Create MemberProfile Document (financials, nights, terms)
    Store->>DB: Log Audit Entry ("MEMBER_CREATED")
    Store-->>API: Return Created Member Dossier
    API-->>AdminStaff: HTTP 201 Created { member, defaultCredentials }
```

---

## 7. Booking Management & Room Night Entitlement Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Member / Public Guest
    participant BookingAPI as Booking Controller (POST /api/v1/bookings)
    participant RateLimit as submissionLimiter (25/15min)
    participant Store as StoreService
    participant Email as EmailService
    actor Staff as Travel Operations Team

    Customer->>RateLimit: Submit Booking Form
    RateLimit->>BookingAPI: Pass Request
    BookingAPI->>Store: createBooking(bookingData)
    Store->>Store: Generate Enquiry Number (NEX-BK-2026-XXXX)
    Store->>Store: Save to Bookings (Status: "Pending")
    Store-->>BookingAPI: Booking Record
    BookingAPI->>Email: sendBookingNotificationEmail(booking)
    Email-->>Staff: Dispatch to reservation@nexworldtravel.com
    BookingAPI-->>Customer: HTTP 201 Created { enquiryNumber, status: "Pending" }

    Note over Staff: Staff processes booking
    Staff->>BookingAPI: PATCH /api/v1/bookings/:id { status: "Confirmed" }
    BookingAPI->>Store: updateBooking(id, { status: "Confirmed" })
    Store->>Store: Recalculate member available nights: Allotted - Used
    BookingAPI-->>Staff: HTTP 200 OK ("Booking status updated.")
```

---

## 8. Financial Reconciliation & EMI Management Lifecycle

Financial operations enforce deterministic balance reconciliation and installment schedule management across AED currency contracts.

```mermaid
sequenceDiagram
    autonumber
    actor Cashier as Master Head / Financial Consultant
    participant PaymentAPI as Member Controller (POST /:id/payments)
    participant Store as StoreService
    participant DB as MongoDB Atlas

    Cashier->>PaymentAPI: POST /api/v1/members/NEX-M-1001/payments { amount: 2000, paymentType: "emi_installment", paymentMethod: "Credit Card" }
    PaymentAPI->>Store: recordPayment(memberId, paymentData, author)
    Store->>Store: Generate Transaction ID (TXN-2026-XXXX)
    Store->>DB: Insert PaymentTransaction record
    Store->>Store: Calculate newPaid = totalAmountPaid + amount
    Store->>Store: Calculate newBalance = max(0, productPrice - newPaid)
    alt newBalance === 0
        Store->>Store: Set paymentStatus = "Fully Paid", dueAmount = 0
    else Partial / Installment Payment
        Store->>Store: Increment emiPaidMonths & advance nextEMIDueDate by 1 month
    end
    Store->>DB: Update MemberProfile (totalAmountPaid, outstandingBalance, paymentStatus, nextEMIDueDate)
    Store->>DB: Log Audit Entry ("PAYMENT_RECORDED")
    Store-->>PaymentAPI: Payment Transaction Summary
    PaymentAPI-->>Cashier: HTTP 201 Created { paymentRecord, updatedProfile }
```

---

## 9. Permanent Image Storage & Media Delivery Pipeline

The media storage architecture protects uploaded assets from ephemeral cloud container wipe-outs. Images are stored in MongoDB as binary buffers (`hasDirectImage: true` / `UploadedMedia`), served with ETags, and mirrored to disk for high-performance static caching.

```mermaid
flowchart TD
    subgraph Ingestion ["1. Image Ingestion Pipeline"]
        UploadReq["Upload Request\n(POST /destinations/:id/image or /media/upload)"] --> Detect["detectImageSignature()\n(Verify Magic Bytes: JPEG, PNG, WebP)"]
        Detect --> CheckSize{"Size <= 1MB (Direct)\nor <= 5MB (Media)?"}
        CheckSize -- No --> Err400["HTTP 400 Bad Request\n(Size or Format Error)"]
        CheckSize -- Yes --> SaveMongo["Write Binary Buffer directly to MongoDB\n(Document image.data or UploadedMedia)"]
        SaveMongo --> WriteDisk["Mirror to /public/uploads on Local Disk"]
    end

    subgraph Serving ["2. Resilient Retrieval Pipeline"]
        Req["Incoming Request\n(GET /api/v1/:model/:slug/image or /uploads/:file)"] --> ETagCheck{"If-None-Match matches\nMD5(buffer)?"}
        ETagCheck -- Yes --> HTTP304["HTTP 304 Not Modified\n(0 bytes sent)"]
        ETagCheck -- No --> CheckDisk{"File exists on\nContainer Disk?"}
        CheckDisk -- Yes --> ServeStatic["Serve via express.static()"]
        CheckDisk -- No --> FetchMongo["Fetch Buffer from MongoDB Atlas\n(select('+image.data') or UploadedMedia)"]
        FetchMongo --> StreamBuffer["Stream Raw Image Bytes\n(Content-Type, ETag, Cache-Control: 24h)"]
        StreamBuffer --> RecreateDisk["Self-Healing: Write back to disk cache"]
    end
```

---

## 10. Holiday Package Content Management Workflow

Holiday Package management is exclusively restricted to Master Head administrators (`requireRole('master_head')`).

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Master Head Admin
    participant Client as Admin Dashboard (/admin/dashboard -> Packages Tab)
    participant API as Package Controller (/api/v1/packages)
    participant Validator as ImageValidator (parseAndValidateImage)
    participant Store as StoreService
    participant DB as MongoDB Atlas
    actor PublicUser as Public Traveler (/packages)

    Admin->>Client: Open "Add Holiday Package" Modal
    Admin->>Client: Enter title, region, days/nights, price, and select image
    Client->>API: POST /api/v1/packages (JSON + Base64 image payload)
    API->>Validator: Validate binary image signature & <= 1MB
    Validator-->>API: Valid Buffer (image/jpeg)
    API->>Store: createPackage(data, "Master Head")
    Store->>DB: Package.create() with binary image buffer & hasDirectImage=true
    Store-->>API: Created Package Object (imageUrl: /api/v1/packages/:slug/image)
    API-->>Client: HTTP 201 Created
    Client-->>Admin: Show Success Toast & Refresh Table

    Note over PublicUser: Public user browses holiday packages
    PublicUser->>Client: Open /packages
    Client->>API: GET /api/v1/packages (cache: 'no-store')
    API->>DB: Package.find({ publicationStatus: 'published', isDeleted: false })
    DB-->>API: Packages List (without binary buffer)
    API-->>Client: JSON Array
    Client->>API: GET /api/v1/packages/alpine-splendour/image
    API-->>Client: Stream Raw Image Bytes (HTTP 200, ETag)
    Client-->>PublicUser: Render High-Resolution Package Card
```

---

## 11. Railway Cloud Deployment Architecture & Ephemerality Handling

```mermaid
flowchart TD
    subgraph InternetGateway ["Internet & DNS Gateway"]
        Domain["nexworldtravel.com / www.nexworldtravel.com\n(Managed DNS / Cloudflare)"]
    end

    subgraph RailwayPaaS ["Railway Production Environment"]
        subgraph WebService ["Next.js Frontend Service"]
            NextServer["Next.js Node Server\n(next start, PORT 3000)"]
            StaticAssets["Next.js Static Pages & Cache"]
            ProxyRewrites["Rewrites Engine\n(/api/* -> backend, /uploads/* -> backend)"]
        end

        subgraph BackendService ["Node.js / Express Backend Service"]
            ExpressApp["Express API Server\n(node index.js, PORT 5000)"]
            RAMMonitor["System Memory Diagnostics\n(/api/v1/dashboard/system/memory)"]
            DiskCache["Ephemeral Storage Cache\n(/public/uploads - resets on deploy)"]
        end
    end

    subgraph ExternalServices ["External Cloud Services"]
        AtlasCluster[("MongoDB Atlas Cloud Database\n(Primary Persistence & Binary Media)")]
        SMTPServer["Transactional SMTP Gateway\n(Google Workspace / Titan / Mailgun)"]
    end

    Domain --> NextServer
    NextServer --> ProxyRewrites
    ProxyRewrites -->|Internal HTTP / Network| ExpressApp
    ExpressApp --> AtlasCluster
    ExpressApp --> SMTPServer
    ExpressApp -.->|Best-Effort Disk Mirror| DiskCache
```

---

## 12. Architectural Limitations & Technical Debt Boundaries

While the current architecture delivers high resilience and fast sub-100ms response times, the following limitations are documented for future architectural evolution:

1. **Monolithic Store Service (`storeService.js`)**: At 4,076 lines, `storeService.js` handles data access, in-memory mirroring, business calculations, and audit logging for all 15 domains. It should be refactored into domain repositories.
2. **In-Memory Security Tokens**: Password reset tokens and account activation tokens reside in an in-memory `Map` on the Node process. Process restarts invalidate unconsumed tokens.
3. **Password Reset Token In HTTP Response**: In `authController.js`, password reset tokens are returned directly in the JSON response for debugging/testing convenience, presenting a critical security risk.
4. **Non-Atomic Payment Updates**: `recordPayment` updates `PaymentTransaction` and `MemberProfile` in separate non-transactional database operations. Under high concurrency or network partition, transaction records and member balances could diverge.
5. **Enquiry-Level Night Deductions**: `calculateMemberNights` sums stay nights from all active bookings including unconfirmed enquiries (`Pending`, `New`), deducting room nights before administrative confirmation.
