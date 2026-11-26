# CONTENT MANAGEMENT ENGINEERING RULES (rules/content-management.md)

> **Status**: Active & Mandatory  
> **Domain**: Destinations, Activities, Holiday Packages, Public Website Sync

---

## 1. Master Head Administrative Governance

- **Content Creation & Editing**: Master Head administrators retain full authority to create, edit, draft, and archive destinations, activities, and holiday packages.
- **Staff Permissions**: Employees may only create, edit, or delete content if granted explicit permissions (`add_destinations`, `edit_destinations`, `delete_destinations`).
- **Holiday Packages Exclusivity**: Holiday package creation, update, and deletion is strictly exclusive to the Master Head (`requireRole('master_head')`).

---

## 2. Public Synchronization & Caching

- **Dynamic Freshness**: Public catalog and detail pages must reflect newly published content and price edits immediately without requiring website redeployment.
- **No-Store Directives**: Public discovery fetches must use `{ cache: 'no-store' }` and `export const dynamic = 'force-dynamic'` on dynamic routes (`/packages/[slug]`, `/destinations/[slug]`).
- **Slug Integrity**: Slugs (`kebab-case`) are permanent routing identifiers. When updating content titles, preserve historical slugs or configure explicit redirects to prevent broken bookmark URLs.

---

## 3. Preservation of Client-Created Content

- **No Static Overwrites**: Never overwrite client-created destinations, excursions, or packages with hardcoded sample arrays.
- **Soft Deletion**: Content removals must use soft-delete flags (`isDeleted: true`, `publicationStatus: 'archived'`) to preserve historical booking references.
