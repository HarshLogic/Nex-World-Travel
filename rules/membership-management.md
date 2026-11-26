# MEMBERSHIP MANAGEMENT ENGINEERING RULES (rules/membership-management.md)

> **Status**: Active & Mandatory  
> **Domain**: Luxury Membership Tiers, Member IDs, Entitlement Pools

---

## 1. Member Identity & Normalization

- **Member ID Format**: Canonical format is `NEX-M-XXXX` (uppercase, trimmed).
- **Lookup Normalization**: All database lookups and authentication queries must normalize member ID inputs:
  ```javascript
  const cleanId = String(memberId).trim().toUpperCase();
  ```
- **Immutable Identifiers**: Once assigned, a member's `memberId`, `userId`, `_id`, and `createdAt` timestamp must never be overwritten, reset, or altered during profile updates.

---

## 2. Membership Tiers & Backward Compatibility

- **Supported Tiers**: Titanium, Platinum+, Platinum, Gold Plus, Gold, Silver Plus, Silver, Trial Plan.
- **Legacy Compatibility**: Ensure full backward compatibility for both `Trial Plan` and `Trail Plan` string variants in validation schemas and UI tier maps:
  ```javascript
  const isTrial = tier === 'Trial Plan' || tier === 'Trial' || tier === 'Trail Plan' || tier === 'Trail';
  ```
- **Tier Configuration**: Master Head retains sole authority to edit tier pricing, default room nights, and travel card perks.

---

## 3. Room Night Entitlement Pool Rules

- **Authoritative Entitlement Formula**:
  $$\text{Available Nights} = \max(0, \text{Allotted Nights} - \text{Total Used Nights})$$
- **Total Used Nights Calculation**: Sum of initial baseline used nights plus stay nights from confirmed bookings.
- **Deduction Invariant**: Future agents must never automatically reset or recalculate existing member night pools without verified business approval.
