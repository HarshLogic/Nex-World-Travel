# ENGINEERING RULES & ARCHITECTURAL PRINCIPLES (rules/engineering.md)

> **Status**: Active & Mandatory  
> **Applicability**: All Code Modifications & System Additions

---

## 1. Core Engineering Principles

### 1.1 SOLID Principles
- **Single Responsibility (SRP)**: Each class, module, and React component must have a single reason to change. Controllers handle HTTP plumbing; services execute domain logic; repositories interact with persistence; React components present state.
- **Open/Closed (OCP)**: Design modules to be open for extension but closed for modification. Use strategy maps and polymorphic dictionaries rather than sprawling `switch` statements across tier types.
- **Liskov Substitution (LSP)**: Derived types or polymorphic variations (e.g. `Trail Plan` vs `Titanium`) must honor the contract of their base abstractions.
- **Interface Segregation (ISP)**: Clients should not be forced to depend upon methods they do not use. Split broad schemas and DTOs into cohesive, purpose-specific interfaces.
- **Dependency Inversion (DIP)**: Depend on abstractions rather than concrete implementations. Decouple data access via repository interfaces.

### 1.2 DRY, KISS & YAGNI
- **DRY (Don't Repeat Yourself)**: Eliminate duplicated financial calculations, validation regexes, and currency formatters. Consolidate into authoritative utility modules (`lib/currency.js`, `validators/`).
- **KISS (Keep It Simple, Stupid)**: Prefer straightforward, idiomatic JavaScript/Node.js solutions over convoluted metaprogramming, excessive abstractions, or unnecessary middleware.
- **YAGNI (You Aren't Gonna Need It)**: Do not introduce distributed caches (Redis), message queues (Kafka), microservices, or complex state machines unless actual business requirements justify them.

---

## 2. Root Cause Analysis Before Code Changes

Whenever addressing an issue:
1. **Reproduce & Trace**: Reproduce the defect deterministically using an isolated test script. Trace execution from client input through network rewrites, controllers, services, and MongoDB queries.
2. **Identify Primary Root Cause**: Differentiate symptoms from root causes. Do not apply surface-level monkey patches or client-side visual masks.
3. **Plan Minimal Scoped Fix**: Formulate a solution that addresses the root cause while maintaining 100% backward compatibility with existing client records.
4. **Add Regression Test**: Ensure every bug fix is accompanied by an automated test in `server/test/` to prevent regressions.

---

## 3. Minimal Change Principle for Production Fixes

- **Scope Discipline**: Change only what is necessary to fulfill the user's specific request.
- **Preserve Unrelated Code**: Never refactor unrelated files, reformat unchanged code blocks, or rename working components during a bugfix or documentation task.
- **No Mass Dependencies**: Do not install third-party packages or update lockfiles unless explicitly instructed.
