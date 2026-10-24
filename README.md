# Nex World Travel & Tourism — Futuristic Next-Gen Travel Platform

A visually outstanding, responsive travel platform inspired by and built for **Nex World Travel & Tourism** ([nexworldtravel.com](https://nexworldtravel.com)). Designed with a premium white aesthetic, high-resolution destination photography, elegant typography, intuitive booking enquiry flows, and a scalable Node.js/Next.js technical architecture.

---

## 🌟 Key Features & Highlights

- **Aesthetic**: Predominantly white (`#FFFFFF`) with secondary mist surfaces (`#F7F9FC`), deep navy typography (`#172033`), subtle borders (`#E6EAF0`), futuristic cobalt blue (`#315EFB`), and sea teal (`#48B9B0`) accents.
- **Real Brand Information & Assets**: Reuses the original images and logos downloaded directly from the reference website:
  - Official brand logo (`/images/logo.png`)
  - Club Nexa affiliate network logo (`/images/club-nexa-logo.png`)
  - Real destination imagery for Asia, Europe, Africa, Australia, and UAE
  - Cruise service, desert safaris, and activity photography
  - Airline (FlyDubai, Air Arabia, Singapore Airlines) and hotel partner logos
- **End-to-End Booking Journey**:
  - Full booking enquiry form with prefix, lead traveler name, contact number, street address, state/province, nationality, departure date, adult/children count, requested activities, and terms consent.
  - Generates verifiable reference codes (e.g. `NEX-BK-2026-XXXX`).
  - Transparent messaging explaining that travel consultants craft a bespoke quotation without upfront charges.
- **RESTful API Backend**:
  - Express.js + Mongoose + Zod validation with rate limiting, Helmet security headers, CORS, and centralized error handling.
  - **Self-Contained Resilient Fallback**: Automatically connects to MongoDB when available; seamlessly falls back to an in-memory & verified seed store if MongoDB is offline, guaranteeing immediate 100% uptime for development and review.
- **Admin Review Endpoints**:
  - Protected by bearer authentication token for travel desk operations to inspect incoming bookings and contact tickets.

---

## 🏗️ Architecture & Project Structure

```text
Nexworldtravel/
├── client/                     # Next.js 14 App Router Frontend (JS/JSX)
│   ├── app/
│   │   ├── layout.jsx          # Root layout with responsive Navbar & Footer
│   │   ├── page.jsx            # Homepage (Hero, Search, Destinations, Services, Experiences, Partners, CTA)
│   │   ├── destinations/
│   │   │   ├── page.jsx        # Destinations directory with region filters
│   │   │   └── [slug]/page.jsx # In-depth destination guide & enquiry card
│   │   ├── activities/
│   │   │   └── page.jsx        # Activities directory (Desert safaris, marine dives, cultural access)
│   │   ├── packages/
│   │   │   ├── page.jsx        # Curated holiday packages with search params support
│   │   │   └── [slug]/page.jsx # Day-by-day itinerary summary & booking flow
│   │   ├── about/
│   │   │   └── page.jsx        # Company heritage, Abu Dhabi HQ, Club Nexa sister network
│   │   ├── contact/
│   │   │   └── page.jsx        # Office contact details & ticket submission
│   │   ├── booking/
│   │   │   └── page.jsx        # Dedicated trip planning & booking experience
│   │   └── globals.css         # Design system tokens & Tailwind CSS
│   ├── components/
│   │   ├── layout/             # Navbar and Footer components
│   │   ├── home/               # HeroSection, SearchPanel, FeaturedDestinations, Services, WhyChooseUs, etc.
│   │   └── booking/            # BookingForm with client-side validation & feedback
│   ├── data/                   # Centralized destination, activity, package, and partner configurations
│   ├── lib/api.js              # Resilient client API layer with offline fallback
│   ├── public/images/          # Locally preserved original brand assets and destination photography
│   └── package.json
├── server/                     # Node.js + Express REST API Backend
│   ├── src/
│   │   ├── config/db.js        # MongoDB connection with resilient fallback mode
│   │   ├── controllers/        # Destination, activity, package, booking, and contact controllers
│   │   ├── middleware/         # Auth, rate limiting, and error handling
│   │   ├── models/             # Mongoose schemas (Destination, Activity, Package, Booking, Contact)
│   │   ├── routes/             # REST endpoints (/api/destinations, /api/activities, /api/packages, /api/bookings, /api/contact)
│   │   ├── services/           # Dual-mode store service (MongoDB / Memory)
│   │   ├── validators/         # Zod schemas for input validation
│   │   └── app.js              # Express app configuration
│   ├── test/api.test.js        # Automated API test suite
│   ├── index.js                # Server entry point
│   ├── .env.example
│   └── package.json
├── package.json                # Root package with unified developer scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **npm** (v9+)
- *(Optional)* **MongoDB** running locally on `mongodb://localhost:27017` (not required; the server works out of the box with its resilient seed store).

### 2. Installation
Run from the repository root:
```bash
npm run install:all
```
*(Or install inside `client` and `server` individually: `cd client && npm install`, `cd server && npm install`)*.

### 3. Start Development Servers
Open two terminal windows or run concurrently:

**Start Backend API (Port 5000):**
```bash
npm run dev:server
```

**Start Next.js Client (Port 3000):**
```bash
npm run dev:client
```

Open your browser at: **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Testing the API Suite

Run the automated backend test suite:
```bash
node server/test/api.test.js
```
The test verifies:
- Health check `GET /api/health`
- Destinations listings & slug lookups
- Activities listings
- Holiday packages listings
- Booking validation & end-to-end enquiry persistence
- Contact ticket generation
- Protected admin review endpoints

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Health & database connection status | None |
| `GET` | `/api/destinations` | List destinations (supports `?region=`, `?featured=`) | None |
| `GET` | `/api/destinations/:slug` | Get specific destination guide | None |
| `GET` | `/api/activities` | List curated activities (supports `?category=`, `?region=`) | None |
| `GET` | `/api/packages` | List holiday packages (supports `?region=`) | None |
| `GET` | `/api/packages/:slug` | Get detailed itinerary package | None |
| `POST` | `/api/bookings` | Submit new journey enquiry | Rate Limited |
| `GET` | `/api/bookings` | Admin: Review all booking enquiries | `Bearer <ADMIN_TOKEN>` |
| `POST` | `/api/contact` | Submit general customer support message | Rate Limited |
| `GET` | `/api/contact` | Admin: Review all incoming messages | `Bearer <ADMIN_TOKEN>` |

---

## 🏢 Business Source of Truth & Contact Details

- **Company**: Nex World Travel & Tourism
- **Headquarters**: Office 1203, 12th Floor, Bin Hamooda Tower, Khalifa Bin Zayed The First St (St 2), Al Danah Zone 1, Abu Dhabi, United Arab Emirates (U.A.E.)
- **Telephone**: +971 2 639 5908 / +971 2 639 7786
- **Email**: info@nexworldtravel.com / enquiry@nexworldtravel.com
- **Sister Entity**: Club Nexa (Nexa Holidays & Resorts Pvt. Ltd, Est. 2015)
- **Partnership**: Official Travel Partner for Lulu Events (2025)
