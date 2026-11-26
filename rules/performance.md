# PERFORMANCE & RESOURCE OPTIMIZATION RULES (rules/performance.md)

> **Status**: Active & Mandatory  
> **Target**: Railway RAM Optimization (Sub-500MB Target)

---

## 1. Memory Management & Railway Constraints

Railway container hosting operates under strict RAM thresholds. Code contributions must preserve existing memory optimizations:

- **MongoDB Connection Pool**: Maintain bounds in `server/src/config/db.js` (`maxPoolSize: 10`, `minPoolSize: 2`, `maxIdleTimeMS: 30000`).
- **Audit Log In-Memory Bound**: Bound in-memory audit logs to a maximum of 100 entries (`this.auditLogs.length = 100`).
- **Binary Image Suppression**: Always query models with `{ select: false }` on binary buffers (`image.data`). Only load buffers on dedicated image streaming endpoints.
- **Client-Side PDF Rendering**: PDF generation runs 100% in the user's browser ([client/lib/pdfExport.js](file:///home/harshvardhan/Desktop/Nexworldtravel/client/lib/pdfExport.js)), requiring 0 MB of server RAM.

---

## 2. Query Optimization & Indexing

- **Indexed Queries**: All filtered queries must match declared indexes (`memberId`, `email`, `slug`, `status`).
- **Compound Text Search**: Maintain compound text index on `MemberProfile` for sub-5ms search over 5,000+ members.
- **Pagination**: All list endpoints must support `limit` and `page` parameters to prevent unbounded memory allocation.

---

## 3. Package & Bundle Sizing

- **Package Import Optimization**: Maintain `optimizePackageImports: ['lucide-react']` in `client/next.config.mjs`.
- **No Heavy Dependencies**: Avoid adding bulky libraries (e.g. Moment.js, heavy PDF engines) when lightweight native utilities suffice.
