# NEXWORLD TRAVEL — PRODUCTION DEPLOYMENT & DEVOPS MANUAL (DEPLOYMENT.md)

> **Document Version**: 2.0.0  
> **Production Cloud Platform**: Railway (PaaS)  
> **Database Host**: MongoDB Atlas (Managed Cloud Cluster)  
> **Target Domains**: `nexworldtravel.com`, `www.nexworldtravel.com`  
> **Deployment Status**: Active in Production

---

## 1. Cloud Architecture & Service Topology

The platform deploys on Railway using a decoupled two-service architecture:
1. **Frontend Service**: Next.js 14 App Router server handling UI rendering, static page delivery, and reverse proxy rewrites.
2. **Backend Service**: Node.js 20 Express REST API server managing business logic, hybrid persistence, MongoDB connections, and binary media streaming.

```mermaid
flowchart LR
    subgraph Edge ["Edge Network & CDN"]
        UserBrowser["Client Browser"] --> CloudflareDNS["DNS / Cloudflare SSL\n(nexworldtravel.com)"]
    end

    subgraph RailwayEnvironment ["Railway Production Project"]
        CloudflareDNS --> NextJSService["Next.js Web Service\n(Build: npm run build | Start: npm start)"]
        NextJSService -->|Internal HTTP Proxy /api/*| ExpressService["Express REST API Service\n(Start: node index.js | Port: 5000)"]
    end

    subgraph ExternalDataServices ["External Cloud Services"]
        ExpressService --> MongoCluster[("MongoDB Atlas Cluster\n(TLS/SSL M0/M10 Replica Set)")]
        ExpressService --> SMTPGateway["SMTP Mail Server\n(Google / Titan / Mailgun)"]
    end
```

---

## 2. Environment Variables Reference

> **Security Rule**: Never store real passwords, secrets, or connection strings in Git. Configure these variables directly in the Railway Service Settings dashboard.

### 2.1 Backend Environment Variables

| Variable Name | Required | Example / Format | Purpose |
| :--- | :---: | :--- | :--- |
| `PORT` | Yes | `5000` | Port for Express HTTP listener. Assigned automatically by Railway. |
| `NODE_ENV` | Yes | `production` | Enables production optimizations, disables verbose logging. |
| `MONGODB_URI` | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/nex_world_travel?retryWrites=true&w=majority` | Primary MongoDB Atlas connection string with TLS/SSL. |
| `JWT_SECRET` | Yes | 64-character high-entropy hex string | Secret key for signing and verifying HS256 JWT tokens. |
| `JWT_EXPIRES_IN` | No | `7d` | Token validity duration. |
| `CLIENT_URL` | Yes | `https://nexworldtravel.com` | Primary client URL for CORS and notification link generation. |
| `NEXT_PUBLIC_API_URL` | Yes | `https://nexworldtravel.com` | Base API URL referenced by reverse proxy rewrites. |
| `UPLOADS_DIR` | No | `/app/public/uploads` | Path to persistent volume mount directory if attached. |
| `RAILWAY_VOLUME_MOUNT_PATH` | No | `/data/uploads` | Standard Railway volume mount path. |
| `SMTP_HOST` | Yes | `smtp.gmail.com` / `smtp.titan.email` | Transactional email server host. |
| `SMTP_PORT` | Yes | `587` | Transactional email server TLS/STARTTLS port. |
| `SMTP_USER` | Yes | `reservation@nexworldtravel.com` | Transactional email sending account. |
| `SMTP_PASSWORD` | Yes | Dedicated 16-character App Password | Secure application-specific password. |
| `SMTP_FROM_EMAIL` | Yes | `reservation@nexworldtravel.com` | Sender address appearing in email `From:` header. |
| `BOOKING_ASSISTANCE_EMAIL` | No | `reservation@nexworldtravel.com` | Target mailbox for booking requests. |
| `CUSTOMER_CARE_EMAIL` | No | `customercare@nexworldtravel.com` | Target mailbox for customer support inquiries. |

### 2.2 Frontend Environment Variables

| Variable Name | Required | Example / Format | Purpose |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Yes | `https://nexworldtravel.com` | Target for Next.js internal rewrites proxy. |
| `NODE_ENV` | Yes | `production` | Enforces production React and Next.js optimization. |

---

## 3. Build & Execution Commands

### 3.1 Backend Service
- **Root Directory**: `server`
- **Build Command**: `None` (Pure Node.js ES Modules)
- **Start Command**: `node index.js`
- **Health Check Endpoint**: `/api/v1/health` or `/health`

### 3.2 Frontend Service
- **Root Directory**: `client`
- **Build Command**: `npm run build` (runs `next build`)
- **Start Command**: `npm start` (runs `next start`)
- **Health Check Endpoint**: `/` (Returns HTTP 200 with rendered home page)

---

## 4. Railway RAM Optimization Settings

Railway containers operate under strict memory caps (typically 512 MB to 1 GB). The application includes verified RAM optimizations:

1. **MongoDB Connection Pooling**: Configured in [server/src/config/db.js](file:///home/harshvardhan/Desktop/Nexworldtravel/server/src/config/db.js) with:
   - `maxPoolSize: 10`: Restricts peak database connections per instance.
   - `minPoolSize: 2`: Maintains lightweight warm connection baseline.
   - `maxIdleTimeMS: 30000`: Closes idle connections after 30 seconds.
   - `socketTimeoutMS: 45000`: Protects against hung database queries.
2. **Package Import Optimization**: Configured in [client/next.config.mjs](file:///home/harshvardhan/Desktop/Nexworldtravel/client/next.config.mjs) with `optimizePackageImports: ['lucide-react']`, stripping hundreds of unused icons from the production JS bundle.
3. **Audit Log Memory Bound**: `storeService.js` bounds the in-memory audit log array to 100 entries (`this.auditLogs.length = 100`), preventing unbounded memory growth during high-activity admin sessions.
4. **Binary Media Projection Suppression**: Binary image fields use `{ select: false }`, ensuring queries for lists of 100+ destinations or members transfer only lightweight metadata (~2 kB) rather than loading 50+ MB of image buffers into RAM.
5. **Live Memory Diagnostics Endpoint**: Authenticated endpoint `GET /api/v1/dashboard/system/memory` allows administrators to monitor live RSS, heap usage, and uptime.

---

## 5. Dynamic Rendering & Cache Invalidation

To guarantee that newly added destinations, packages, and price edits reflect immediately on the public website without requiring a new deployment:
- Dynamic detail pages enforce dynamic evaluation via:
  ```javascript
  export const dynamic = 'force-dynamic';
  ```
- Public catalog queries use:
  ```javascript
  const res = await fetch(url, { cache: 'no-store' });
  ```
- Binary image endpoints stream with HTTP 304 conditional ETag validation (`If-None-Match`). Browsers re-validate with zero bandwidth when images have not changed, and immediately download updated bytes when an administrator replaces an asset.

---

## 6. Backup, Rollback & Incident Recovery

### 6.1 MongoDB Atlas Automated Backups
- **Policy**: Continuous cloud backup with point-in-time recovery enabled on MongoDB Atlas.
- **Pre-Release Invariant**: Prior to any significant database migration or schema evolution, verify that an Atlas snapshot was created within the preceding 12 hours.

### 6.2 Application Rollback Strategy
Railway supports 1-click deployment rollbacks:
1. In the Railway project dashboard, navigate to **Deployments**.
2. Identify the last known healthy deployment commit hash.
3. Click **Rollback** to instantly route traffic to the previous container build.

### 6.3 Incident Response Protocol
If the backend crashes or reports degraded health:
1. Check `/api/v1/health` response payload: inspect `database.mode` (`mongodb-live` vs `resilient-in-memory-active`).
2. Query `/api/v1/dashboard/system/memory` to verify whether container RSS memory breached Railway thresholds.
3. Inspect Railway runtime logs for MongoDB TLS/SSL handshake timeouts or unhandled exceptions.
