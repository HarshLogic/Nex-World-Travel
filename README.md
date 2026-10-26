# Nex World Travel & Tourism — Role-Based Authentication, Member Creation & Package Approval System

A complete, visually outstanding, responsive travel platform and membership management architecture inspired by and built for **Nex World Travel & Tourism** ([nexworldtravel.com](https://nexworldtravel.com)). Designed with a premium white aesthetic (`#FFFFFF`), high-resolution destination photography, elegant typography, intuitive booking enquiry flows, and a scalable Node.js/Next.js technical architecture.

---

## 🌟 Core System Highlights & Architecture

The platform supports up to **5,000 registered members** with room to grow and features three distinct role-based experiences:

### 1. Master Head (Full Administrative Authority)
- **Login Route**: [`/admin/login`](http://localhost:3000/admin/login) (Email & Password, "Forgot password?" recovery link).
- **One-Time Setup Script**: `npm run setup:admin` initializes or verifies the Master Head account securely with hashed credentials.
- **Admin Dashboard**: [`/admin/dashboard`](http://localhost:3000/admin/dashboard) with 8 real-time KPI cards, member dossier inspection, financial payment recording, destination content management, and employee governance.
- **Dedicated Approvals Desk**: [`/admin/approvals`](http://localhost:3000/admin/approvals) for reviewing pending employee change requests with a **side-by-side diff view** (Current vs. Proposed values), employee business justification, member dossier modal, and one-click **Approve & Apply** or **Reject with Reason**.
- **Employee Account Deactivation**: Master Head can toggle staff status between Active and Deactivated. Deactivated staff accounts are immediately blocked from logging in.

### 2. Employee (Operational & Permission-Based Access)
- **Login Route**: [`/employee/login`](http://localhost:3000/employee/login) (Email & Password, "Forgot password?" recovery link).
- **Account Activation**: Created by Master Head and activated via secure activation link ([`/activate?token=...`](http://localhost:3000/activate)) where staff members set their own private passwords.
- **Member Creation**: Employees with the `create_member` permission can register new member accounts directly without requiring Master Head pre-approval.
- **Protected Package & Financial Restrictions**: Employees **cannot** directly change existing member package tiers (Gold/Silver), available nights, tenure, extra offers, or financial terms. Direct `PATCH` calls to protected fields are strictly blocked by the backend (`403 requiresApproval: true`).
- **Request Package Change Workflow**: Employees submit package changes via the **"Request Package Change"** action with proposed values and business justification, saved as `Pending` for Master Head approval.
- **Permitted Contact Updates**: Employees with `edit_member_details` can directly update non-sensitive contact information (such as phone numbers).

### 3. Member Portal (Self-Service Experience)
- **Login Route**: [`/member/login`](http://localhost:3000/member/login) (**Member ID** and password; no email required).
- **Dashboard**: [`/member/dashboard`](http://localhost:3000/member/dashboard).
- **Membership Status**: Gold vs. Silver package badge, available room nights pool, contract extra offers, tenure period, purchase date.
- **Travel Card Benefit Indicator**: Accessible visual indicator (**Green checkmark badge for Yes**, **Red cross badge for No** with high-contrast text).
- **Amount & Payment Summary**: Total Product Price, Total Amount Paid, Outstanding Balance, and EMI schedule (monthly installment, next due date).
- **Terms & Conditions**: Integrated legal terms modal requiring member acknowledgement on initial login.
- **Member Support & Travel Requests**: Ticket submission with the exact required confirmation:
  > *"Your request has been submitted successfully. Our team will contact you within 24 hours."*

---

## 🔑 Demo Access Credentials

The platform includes verified demo accounts configured out of the box:

| Role | Login Route | Identifier | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Master Head** | `/admin/login` | `admin@nexworldtravel.com` | `AdminPassword2026!` | Full Administrative Control |
| **Employee** | `/employee/login` | `staff@nexworldtravel.com` | `StaffPassword2026!` | Staff Operations (`create_member`, etc.) |
| **Member** | `/member/login` | `NEX-M-1001` | `MemberPassword2026!` | Personal Gold Member Portal |

> **Unified Gateway**: Access [`/login`](http://localhost:3000/login) to switch between Member, Master Head, and Employee portals with 1-click test fillers.

---

## 🛡️ Granular Permission Matrix

The Master Head can grant or revoke any of the following permissions individually:

| Action | Master Head | Employee | Backend Permission Key |
| :--- | :---: | :---: | :--- |
| **View member records** | Yes | If permitted | `view_members` |
| **Create member accounts** | Yes | Yes, if permitted | `create_member` |
| **Edit permitted contact info (phone)** | Yes | If permitted | `edit_member_details` |
| **Change member package directly** | Yes | **No (Blocked)** | *Master Head Only* |
| **Request package change** | Yes | Yes | `create_member_change_request` |
| **Approve / reject package changes** | Yes | **No (Blocked)** | *Master Head Only* |
| **Change protected financial terms** | Yes | **No (Blocked)** | *Master Head Only* |
| **Manage employees & permissions** | Yes | **No (Blocked)** | *Master Head Only* |
| **Add / edit destinations** | Yes | If permitted | `add_destinations`, `edit_destinations` |
| **Publish / delete destinations** | Yes | If permitted | `delete_destinations` |
| **Manage booking enquiries** | Yes | If permitted | `manage_bookings` |
| **View reports & audit logs** | Yes | If permitted | `view_reports` |
| **Export member records to CSV** | Yes | If permitted | `export_records` |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **npm** (v9+)
- *(Optional)* **MongoDB** on `mongodb://localhost:27017` (A self-contained, in-memory store automatically runs if MongoDB is offline).

### 2. Run Initial Master Head Setup Script
Initialize or verify the Master Head account:
```bash
npm run setup:admin
```

### 3. Run Automated Integration Test Suite (20 Tests)
Run the full automated test suite verifying auth, permission enforcement, member creation, approval workflows, and 5,000 member scale:
```bash
npm test
# or
node server/test/api.test.js
```
*Expected: 20/20 tests pass with a 100% success rate.*

### 4. Build Next.js Application
Verify the Next.js App Router frontend:
```bash
npm run build
```
*Expected: All 23 static and dynamic routes compile cleanly with zero errors.*

### 5. Start Development Servers
Open two terminal windows:

**Start Backend Server (Port 5000):**
```bash
npm run dev:server
```

**Start Frontend Application (Port 3000):**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser!

---

## 🏗️ Technical Architecture & Key Files

```text
Nexworldtravel/
├── client/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── approvals/page.jsx    # Dedicated Master Head Approvals Desk (Diff view, Approve/Reject)
│   │   │   ├── dashboard/page.jsx    # Master Head Admin Control Hub (8 KPIs, Member Directory, Staff)
│   │   │   └── login/page.jsx        # Master Head Login
│   │   ├── employee/
│   │   │   ├── dashboard/page.jsx    # Employee Portal (Add Member modal, Request Package Change modal)
│   │   │   └── login/page.jsx        # Employee Login
│   │   ├── member/
│   │   │   ├── dashboard/page.jsx    # Member Portal (Gold/Silver, Available Nights, Travel Card badge)
│   │   │   └── login/page.jsx        # Member ID & Password Login
│   │   ├── forgot-password/page.jsx  # Forgot Password flow
│   │   ├── reset-password/page.jsx   # Reset Password flow
│   │   ├── activate/page.jsx         # Employee account activation flow
│   │   └── booking/page.jsx          # Public Booking Form
│   ├── lib/
│   │   ├── api.js                    # Unified REST client with offline fallback
│   │   └── auth.js                   # Client auth storage and token handlers
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js     # Login, forgot/reset password, account activation
│   │   │   ├── memberController.js   # Member creation, update protection, payments
│   │   │   ├── requestController.js  # Support requests and package change approvals
│   │   │   └── employeeController.js # Staff accounts, permissions, and status toggle
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT authentication and granular permission checks
│   │   │   └── rateLimiter.js        # Rate limiting on authentication routes
│   │   ├── models/                   # Mongoose models with dual-mode storage
│   │   ├── scripts/
│   │   │   └── setupMasterHead.js    # One-time Master Head setup script
│   │   ├── services/
│   │   │   ├── authService.js        # bcrypt hashing and JWT tokens
│   │   │   ├── emailService.js       # Nodemailer SMTP with safe simulated fallback
│   │   │   └── storeService.js       # Dual-mode resilient data layer (supports 5,000+ members)
│   │   └── app.js                    # Express application routes
│   └── test/api.test.js              # 20 end-to-end integration tests
├── .env.example                      # Root environment configuration template
└── package.json                      # Workspace scripts
```

---

## 🧪 Automated Test Suite Results

```text
--- Starting Complete Member Portal & Admin Verification Test Suite ---
 ✅ PASS: Health Endpoint (/api/v1/health)
 ✅ PASS: Member Login with Member ID (NEX-M-1001)
 ✅ PASS: Master Head Login (admin@nexworldtravel.com)
 ✅ PASS: Employee Login (staff@nexworldtravel.com)
 ✅ PASS: Member access to own profile (/api/v1/members/me)
 ✅ PASS: Member CANNOT access admin member list (403 Forbidden)
 ✅ PASS: Member submits support request and receives 24h commitment
 ✅ PASS: Master Head creates new member (NEX-M-2002)
 ✅ PASS: Employee creates Change Request for Master Head approval
 ✅ PASS: Master Head approves Employee Change Request
 ✅ PASS: Record EMI payment and verify balance adjustment
 ✅ PASS: Destinations category filtering (Dream vs Top)
 ✅ PASS: Master Head Dashboard Metrics (/api/v1/dashboard/metrics)
 ✅ PASS: Employee with create_member creates a new member (NEX-M-3003)
 ✅ PASS: Employee CANNOT directly change package fields (403 requires approval)
 ✅ PASS: Employee can update permitted contact information after permission granted
 ✅ PASS: Password Reset Flow (forgot-password and reset-password)
 ✅ PASS: Employee Account Creation & Activation Flow
 ✅ PASS: Deactivated employee cannot log in (blocked)
 ✅ PASS: 5,000 Members Scale Performance Test (< 100ms response)

--- Test Suite Completed: ALL 20 TESTS PASSED 🎉 ---
```
