# SECURITY ENGINEERING RULES (rules/security.md)

> **Status**: Active & Mandatory  
> **Standards**: OWASP Top 10, CWE / SANS Top 25

---

## 1. Authentication & Session Hygiene

- **Password Hashing**: Store passwords using `bcryptjs` with a minimum of 10 salt rounds. Never log, store, or transmit cleartext passwords.
- **Stateless JWT Security**: Sign JWTs with high-entropy SHA-256 secrets (`JWT_SECRET`). Verify tokens on every protected request.
- **Token Hygiene in Responses**: Never return password reset tokens or account activation tokens in JSON response bodies. Tokens must be transmitted exclusively via transactional email.

---

## 2. Authorization & Privilege Escalation Prevention

- **Defense in Depth**: Verify roles (`requireRole`) and granular employee permissions (`requirePermission`) on the backend API. Never rely on frontend UI hiding for access control.
- **Resource Ownership**: Members must strictly only access their own member ID (`requireMemberOwnership`). Prevent IDOR (Insecure Direct Object Reference) vulnerabilities on member dossiers, payments, and booking histories.
- **Eliminate Hardcoded Secrets**: Never include fallback master secrets (e.g. `'nex_admin_secret_key_2026'`) in middleware.

---

## 3. Injection & Input Sanitization

- **NoSQL Injection Guard**: Validate all query inputs with Zod schemas. Disallow raw object inputs in MongoDB query criteria.
- **File Upload Security**: Validate binary magic bytes (`detectImageSignature()`) to block executable file spoofing. Restrict payloads to genuine JPEG, PNG, and WebP formats $\le 1\text{MB}$ (direct) or $\le 5\text{MB}$ (generic).
- **CORS Configuration**: Restrict allowed origins to trusted production domains (`nexworldtravel.com`, `*.railway.app`) rather than wildcard origins with credentials.
