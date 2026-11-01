# ResourceBridge

> **Tagline:** Share Resources. Reduce Costs. Build More.  
> **Problem Statement:** Unlock Underused Equipment and Spaces.

https://resource-bridge.vercel.app

ResourceBridge is a centralized, role-based resource-sharing web platform built for colleges, educational institutions, research laboratories, makerspaces, and community organizations. It enables institutions to eliminate idle machinery waste, automate reservation requests, enforce safety training certifications, and verify physical equipment handovers through dual-stage custody logging.

---

## 1. Brand Colors & Design System

The application strictly adopts the editorial warm-earth design system tailored for high-stakes presentation stages and projector clarity:

| Token | Name | Hex Code | Functional Role |
| :--- | :--- | :--- | :--- |
| **Primary** | Mocha Brown | `#6F4E37` | Foundational brand identity, slide headers, modal frames |
| **Secondary** | Champagne Gold | `#F7E7CE` | Accent surface callouts, active cards, highlighted badges |
| **Accent / CTA** | Burnt Amber | `#BF6B2E` | Primary action buttons, active tabs, metric callouts |
| **Foreground** | Dark Espresso | `#34251F` | High-contrast body typography, table contents |
| **Canvas Base** | Warm Ivory | `#FFFAF2` | Main background substrate replacing harsh clinic white |
| **Borders** | Soft Taupe | `#D8C3A5` | Card dividers, form input boundaries |
| **Success** | Muted Sage | `#879078` | Approved reservations, verified returns, healthy metrics |
| **Alert / Error** | Muted Brick | `#A94438` | Rejected requests, open incidents, schedule conflicts |

- **Typography:** Plus Jakarta Sans (Headlines, display numbers, body text) & Inter (Data tables, status pills, navigation controls).
- **Component Geometry:** 8pt spatial baseline with rounded cards (0.5rem – 1.5rem) and full pill status tags.
- **Workflow Steppers:** Completed (Mocha Brown checkmark circle), Active (Burnt Amber outer ring + pulsing center pip), Upcoming (Soft Taupe border).

---

## 2. Multi-Role Matrix & Demo Personas

ResourceBridge provides 4 distinct user personas with 1-click instant switching for hackathon jury evaluation:

1. **Requester / Borrower (`Dr. Sarah Chen`)**
   - Department: *Robotics & Automation*
   - Verified Certifications: *Laser Safety Level 2, 3D Sintering Certification, Electrical Hazard Training*
   - Capabilities: Browse catalog, filter qualified equipment, submit booking requests with conflict detection, cancel eligible requests, and view handover certificates.

2. **Resource Owner / Custodian (`Prof. Marcus Vance`)**
   - Department: *Mechanical Engineering & FabLab*
   - Capabilities: Manage listed apparatus, review incoming requests, approve with custom pickup instructions, reject with reason, record check-out handovers, and verify equipment returns.

3. **Institution Manager (`Elena Rostova`)**
   - Department: *Dean of Research Infrastructure*
   - Capabilities: Campus-wide utilization index, cross-departmental capacity analytics, open incident tracking, and active loan telemetry.

4. **Platform Administrator (`David Kim`)**
   - Department: *Platform Systems Administration*
   - Capabilities: System integrity monitoring, audit history stream, and database status management.

---

## 3. End-to-End Core Demonstration Workflow

The following journey is pre-configured and demonstrable out-of-the-box:

1. **Discover:** Requester opens **Discover** and selects the *Industrial SLS 3D Printer (Formlabs Fuse 1+)*.
2. **Eligibility Check:** The details page verifies prerequisite certifications (*Laser Safety Level 2* and *3D Sintering Certification*).
3. **Reserve Slot:** Requester selects a date and time slot. The real-time conflict algorithm verifies zero collisions with other approved borrowers.
4. **Submit Request:** Requester agrees to laboratory safety protocols and submits. Status becomes `Pending Approval`.
5. **Owner Approval:** Switch persona to **Prof. Marcus Vance** via the top-right switcher. Open **Owner Queue**, review the purpose, and click **Approve Request**.
6. **Collection Handover (Check-in):** In **Handover & Return**, record the baseline condition (*Excellent*), verify issued accessories (*Power cable, Safety goggles*), and confirm handover. Status updates to `Checked Out`.
7. **Return Verification (Checkout):** Borrower conducts research session. Custodian inspects returned equipment, compares side-by-side condition records, verifies all accessories, and confirms return. Status updates to `Returned`.
8. **Audit Trail:** Open **Activity Log** to view the append-only record of every status transition and handover timestamp.

---

## 4. Architecture & Database Design

### Two-Tier Data Persistence
- **Deterministic Local Demo Engine (Default):** Runs in-browser via localStorage with full CRUD state, conflict validation, audit logging, and seed reset. No setup required.
- **Supabase PostgreSQL Ready:** Fully compatible client library (`@supabase/supabase-js`) integrated in `src/services/db.ts`.

### Migration Schema
The complete PostgreSQL migration script is provided in `/supabase/migrations/20261031_resourcebridge_init.sql` and includes:
- `organisations`: Institution boundaries
- `profiles`: User identities linked to `auth.users` with `user_role` enum
- `resources`: Asset inventory with JSONB specifications, rules, and eligibility policies
- `bookings`: Reservations with transactional exclusion constraint:
  ```sql
  ALTER TABLE bookings
  ADD CONSTRAINT prevent_overlapping_active_bookings
  EXCLUDE USING gist (
    resource_id WITH =,
    tstzrange(start_at, end_at) WITH &&
  )
  WHERE (status IN ('approved', 'checked_out', 'return_pending'));
  ```
- `checkin_records`: Initial collection condition and accessories issued
- `checkout_records`: Final condition inspection and return sign-off
- `incidents`: Discrepancy logs (damage, missing parts, delay)
- `waitlist_entries`: First-come fair access queue
- `audit_events`: Append-only activity log
- **Row Level Security (RLS)** policies for all tables

---

## 5. Local Setup & Configuration

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
# Clone the repository and install dependencies
npm install

# Run unit tests (rules and conflict validation)
npx --yes tsx --test src/utils/rules.test.ts

# Start the development server
npm run dev
```

### Connecting Live Supabase (Optional)
To connect to your own Supabase project:
1. Create a new project in [Supabase](https://supabase.com).
2. Execute the migration SQL from `/supabase/migrations/20261031_resourcebridge_init.sql` in the Supabase SQL Editor.
3. Optionally run `/supabase/seed.sql` to populate sample data.
4. Create a `.env` file with:
   ```env
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-public-key"
   ```
5. Restart the server. The telemetry bar will display `Supabase Live DB`.

---

## 6. Implemented Features Checklist

- [x] Responsive layout across mobile (320px–430px), tablet (768px), and desktop (1024px–1920px)
- [x] Mocha Brown, Champagne Gold, and Burnt Amber design system
- [x] Multi-persona 1-click role switcher
- [x] Real-time booking conflict prevention and duration capping
- [x] Safety certification eligibility checking
- [x] Dual-stage handover and return verification (side-by-side condition comparison)
- [x] Fair access waitlist queue
- [x] Incident reporting and resolution tracking
- [x] In-app notification center with read/unread tracking
- [x] Append-only audit log timeline
- [x] Institutional utilization index and capacity bar charts
- [x] PostgreSQL migration file with GiST conflict constraints and RLS rules
