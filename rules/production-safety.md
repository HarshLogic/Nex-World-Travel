# PRODUCTION SAFETY & DATA PROTECTION RULES (rules/production-safety.md)

> **Status**: Active & Mandatory  
> **Highest Priority Invariant**: Protecting Live Client Data

---

## 1. Production Data Protection Invariants

The NexWorld Travel platform contains real client-managed accounts, active travel bookings, and legal financial records.

**Strict Prohibitions**:
- Never delete or drop any MongoDB database or collection.
- Never run seed scripts (`setupMasterHead.js`, etc.) against production databases.
- Never execute bulk migrations without verified point-in-time database snapshots.
- Never overwrite client-created member details, packages, destinations, or images.
- Never alter historical registration dates, payment transactions, or audit logs.

---

## 2. Release & Pre-Deployment Verification

Before any production deployment:
1. **Automated Test Run**: All test suites must execute and pass with 0 failures (`npm test`, etc.).
2. **Next.js Production Build**: `npm --prefix client run build` must compile 23/23 routes cleanly.
3. **Configuration Check**: Verify all production environment variables are configured in the Railway dashboard.
4. **Explicit User Authorization**: Deployment must be explicitly approved by the repository owner.

---

## 3. Incident Management & Rollback Protocol

- **Immediate Rollback**: If a production deployment exhibits degraded behavior, execute 1-click rollback in the Railway dashboard to the previous healthy container.
- **Failover Verification**: Check `/api/v1/health` to confirm database connectivity status (`mongodb-live`).
- **Post-Incident Analysis**: Document the root cause, business impact, and remediation in an Architecture Decision Record ([docs/adr/README.md](file:///home/harshvardhan/Desktop/Nexworldtravel/docs/adr/README.md)).
