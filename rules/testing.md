# TESTING ENGINEERING RULES (rules/testing.md)

> **Status**: Active & Mandatory  
> **Scope**: Unit, Integration, API & Regression Testing

---

## 1. Test Isolation & Safety Principles

- **Zero Production Database Contamination**: Automated tests must never connect to live MongoDB Atlas. All tests must execute against isolated ephemeral in-memory state.
- **Ephemeral Port Binding**: Tests must bind to dedicated ephemeral loopback ports (`5096`, `5098`, `5099` on `127.0.0.1`) and close listeners inside `finally` blocks.
- **Simulated Transactional Emails**: When running tests, SMTP email dispatch must be redirected to simulated loggers to prevent accidental email dispatch to customers.

---

## 2. Regression Test Requirements

- **Mandatory Regression Tests**: Every bugfix or business logic modification must include a companion automated test in `server/test/`.
- **Core Verification Suites**:
  1. `server/test/api.test.js`: Core REST API endpoints and RBAC.
  2. `server/test/clientCorrections.test.js`: Client business logic corrections.
  3. `server/test/holidayPackageAndImageStorage.test.js`: Image persistence and package CRUD.
- **Production Build Verification**: Always execute `npm --prefix client run build` to confirm zero compilation or type errors.

---

## 3. Truthful Reporting Invariant

- **Zero Fabricated Results**: AI agents must never claim tests passed without executing them and observing exit code 0.
- **Explicit Failure Disclosure**: If a test fails, report the exact error message, stack trace, and failed assertion immediately.
