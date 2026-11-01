-- ResourceBridge PostgreSQL Schema for Supabase
-- Version 1.0 - October 31, 2026

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ENUMS
CREATE TYPE user_role AS ENUM ('requester', 'owner', 'manager', 'admin');
CREATE TYPE resource_status AS ENUM ('active', 'draft', 'paused', 'archived');
CREATE TYPE booking_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'cancelled', 'checked_out', 'return_pending', 'returned', 'overdue', 'review_required');
CREATE TYPE item_condition AS ENUM ('excellent', 'good', 'fair', 'damaged', 'not_assessed');
CREATE TYPE incident_type AS ENUM ('damage', 'missing_accessory', 'late_return', 'scheduling_conflict', 'safety_concern', 'other');
CREATE TYPE incident_status AS ENUM ('open', 'under_review', 'resolved');

-- 1. ORGANISATIONS
CREATE TABLE IF NOT EXISTS organisations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'University',
  address_label TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'requester',
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  department TEXT,
  avatar_url TEXT,
  verified_trainings JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. RESOURCES
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  location_label TEXT NOT NULL,
  building TEXT,
  room TEXT,
  image_url TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  rules JSONB DEFAULT '[]'::jsonb,
  eligibility_rules JSONB DEFAULT '{"restricted": false}'::jsonb,
  supervision_required BOOLEAN NOT NULL DEFAULT FALSE,
  max_duration_hours INTEGER NOT NULL DEFAULT 6,
  availability_schedule TEXT DEFAULT 'Mon-Fri 09:00 - 17:00',
  requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
  status resource_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  purpose TEXT NOT NULL,
  num_users INTEGER NOT NULL DEFAULT 1,
  training_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  rules_agreed BOOLEAN NOT NULL DEFAULT FALSE,
  status booking_status NOT NULL DEFAULT 'pending',
  eligibility_status TEXT NOT NULL DEFAULT 'verified',
  decision_by TEXT,
  decision_at TIMESTAMPTZ,
  decision_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_start_before_end CHECK (start_at < end_at)
);

-- Database-level exclusion constraint preventing overlapping active/approved bookings for the same resource
-- Note: GiST range exclusion ensures strict transactional conflict avoidance
ALTER TABLE bookings
ADD CONSTRAINT prevent_overlapping_active_bookings
EXCLUDE USING gist (
  resource_id WITH =,
  tstzrange(start_at, end_at) WITH &&
)
WHERE (status IN ('approved', 'checked_out', 'return_pending'));

-- 5. CHECKIN RECORDS (Handover on Collection)
CREATE TABLE IF NOT EXISTS checkin_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  checked_in_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  initial_condition item_condition NOT NULL DEFAULT 'good',
  accessories_issued JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  photo_refs JSONB DEFAULT '[]'::jsonb
);

-- 6. CHECKOUT RECORDS (Verification on Return)
CREATE TABLE IF NOT EXISTS checkout_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  checked_out_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  checked_out_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  final_condition item_condition NOT NULL DEFAULT 'good',
  accessories_returned JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  photo_refs JSONB DEFAULT '[]'::jsonb,
  return_confirmed_by TEXT NOT NULL,
  return_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. INCIDENTS
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  type incident_type NOT NULL DEFAULT 'damage',
  description TEXT NOT NULL,
  evidence_refs JSONB DEFAULT '[]'::jsonb,
  status incident_status NOT NULL DEFAULT 'open',
  assigned_to TEXT,
  resolution_note TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. WAITLIST ENTRIES
CREATE TABLE IF NOT EXISTS waitlist_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  desired_start_at TIMESTAMPTZ NOT NULL,
  desired_end_at TIMESTAMPTZ NOT NULL,
  queue_position INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  related_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  related_resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. AUDIT EVENTS
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_title TEXT NOT NULL,
  details TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Read profiles
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Self update profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Resources
CREATE POLICY "Public read active resources" ON resources FOR SELECT USING (status = 'active' OR auth.uid() = owner_id);
CREATE POLICY "Owner manage resources" ON resources FOR ALL USING (auth.uid() = owner_id);

-- Bookings
CREATE POLICY "Requesters and owners read bookings" ON bookings FOR SELECT USING (
  auth.uid() = requester_id OR 
  auth.uid() IN (SELECT owner_id FROM resources WHERE resources.id = bookings.resource_id)
);
CREATE POLICY "Requesters create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Owners update booking decisions" ON bookings FOR UPDATE USING (
  auth.uid() IN (SELECT owner_id FROM resources WHERE resources.id = bookings.resource_id) OR
  auth.uid() = requester_id
);

-- Notifications
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = recipient_id);
