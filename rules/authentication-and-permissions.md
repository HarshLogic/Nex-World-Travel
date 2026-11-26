# AUTHENTICATION & PERMISSIONS ENGINEERING RULES (rules/authentication-and-permissions.md)

> **Status**: Active & Mandatory  
> **Domain**: Role-Based Access Control, Staff Permissions, Maker-Checker Governance

---

## 1. Persona Authentication Rules

- **Members**: Login using uppercase normalized Member ID (`NEX-M-XXXX`) and bcrypt password.
- **Employees**: Login using corporate email (`staff@nexworldtravel.com`) and bcrypt password.
- **Master Head**: Login using executive email (`admin@nexworldtravel.com`) and bcrypt password.

---

## 2. Granular 14-Point Employee Permission Matrix

The Master Head can selectively assign 14 distinct permission keys to staff accounts:

1. `view_members`: Read access to member directory and dossiers.
2. `create_member`: Onboard and register new members.
3. `create_member_change_request`: Submit package/financial change proposals for Master Head review.
4. `edit_member_details`: Update permitted contact information (phone, address, email).
5. `update_membership_status`: Change member status (Active, InActive, Hold, etc.).
6. `edit_membership_plans`: Direct modification of membership packages/tiers (Default: Blocked).
7. `update_financial_info`: Record payments and adjust balances (Default: Blocked).
8. `manage_bookings`: Review and process customer travel requests.
9. `manage_travel_availability`: Configure trip dates and allotment availability.
10. `add_destinations`: Author new destination articles.
11. `edit_destinations`: Update destination copy and images.
12. `delete_destinations`: Soft delete or archive destinations.
13. `view_reports`: Access executive dashboard KPI metrics and audit logs.
14. `export_records`: Generate and download member summary documents and reports.

---

## 3. Maker-Checker Enforcement Invariants

- **Staff Limitations**: Operational staff without direct financial permissions cannot modify packages, prices, or room nights directly.
- **Mandatory Change Proposal**: Staff must submit proposals via `EmployeeChangeRequest` with mandatory business justifications.
- **Immediate Permission Sync**: Changes to employee permissions must reflect immediately on the backend via `/api/v1/auth/me` without requiring re-login.
- **Revocation Safety**: If a permission is revoked, subsequent protected API calls must immediately return **HTTP 403 Forbidden**.
