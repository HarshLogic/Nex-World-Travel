# FRONTEND ENGINEERING RULES (rules/frontend.md)

> **Status**: Active & Mandatory  
> **Framework**: Next.js 14 App Router, React 18, Tailwind CSS 3.4

---

## 1. Component Architecture & Responsibilities

- **Separation of Presentation & Business Logic**: UI components render visual state and capture user interactions. Complex state calculations (financial reconciliation, night balances) must be computed in utility helpers or retrieved from backend APIs.
- **Client vs. Server Components**: Mark interactive components requiring hooks (`useState`, `useEffect`, `useRouter`) with `'use client'` at the top of the file. Pre-render public discovery catalogs on the server where appropriate.
- **Responsive Design**: All screens must adapt smoothly across mobile ($320\text{px}$), tablet ($768\text{px}$), and luxury desktop ($1440\text{px}+$) viewports using Tailwind CSS responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`).

---

## 2. State Management & API Integration

- **Asynchronous Error States**: Every asynchronous fetch operation must handle three distinct states:
  - `loading`: Visual skeleton or spinner (`Loader2 className="animate-spin"`).
  - `error`: Informative, accessible error banner with retry option.
  - `success / empty`: Clear data presentation or polished empty state illustration.
- **Reverse Proxy Routing**: All client API requests must route through relative paths starting with `/api/` (e.g. `/api/v1/destinations`), delegating to Next.js rewrites to prevent CORS issues.
- **Memory Leak Prevention**: Always clean up timers, intervals, and event listeners in `useEffect` return functions.

---

## 3. Content Rendering & Asset Integrity

- **Dynamic Content Freshness**: Use `export const dynamic = 'force-dynamic'` and `{ cache: 'no-store' }` on public catalog and detail pages to ensure newly added packages or price edits appear immediately.
- **Image Fallbacks**: When rendering uploaded images via `next/image` or native `img`, always provide an accessible fallback to default branded assets (`/images/hero.jpg`) on `onError`.
- **Sensitive Data Suppression**: Never render raw passwords, password reset tokens, security tokens, or internal error stack traces in frontend markup.
