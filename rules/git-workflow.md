# GIT WORKFLOW & VERSION CONTROL RULES (rules/git-workflow.md)

> **Status**: Active & Mandatory  
> **VCS Standard**: Git Branching, Atomic Commits & Safe Merges

---

## 1. Repository Hygiene & Baseline Checks

- **Pre-Task Check**: Always run `git status` at the beginning of every turn to record clean working tree state and existing uncommitted user changes.
- **Preserve User Changes**: Never execute destructive Git commands (`git reset --hard`, `git clean -fd`, `git checkout -- .`) that discard uncommitted user work.

---

## 2. Branching & Commit Conventions

- **Branch Naming**:
  - Features: `feature/<feature-name>`
  - Bugfixes: `fix/<defect-description>`
  - Documentation / Audits: `docs/<audit-topic>`
  - Performance: `perf/<optimization-scope>`
- **Commit Message Standard**: Conventional Commits format:
  - `feat: add trail plan membership tier`
  - `fix: resolve image persistence on ephemeral containers`
  - `docs: add comprehensive system architecture manual`
  - `perf: optimize railway memory connection pooling`

---

## 3. Safe Merge & Deployment Rules

- **No Unauthorized Commits / Pushes**: Never automatically commit, push to remote branches, or trigger production deployments without explicit user approval.
- **No Force Pushes**: Never force-push (`git push --force`) to shared branches (`main`, `master`).
