-- ResourceBridge Seed Data for Supabase
-- Initial Organisation
INSERT INTO organisations (id, name, type, address_label, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Apex Institute of Technology', 'College / University', 'Apex Science Park, Innovation Blvd', 'active')
ON CONFLICT (id) DO NOTHING;

-- Demo Resources
INSERT INTO resources (
  id, owner_id, organisation_id, title, category, description, location_label, building, room,
  image_url, specifications, rules, eligibility_rules, supervision_required, max_duration_hours, requires_approval, status
)
VALUES
(
  '11111111-1111-1111-1111-111111111001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Industrial SLS 3D Printer (Formlabs Fuse 1+)',
  'Engineering Tools',
  'Commercial-grade Selective Laser Sintering (SLS) 3D printer for end-use nylon parts with zero support structures.',
  'Maker Wing, Room 204',
  'Engineering Hall',
  'Room 204',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  '{"Build Volume": "165 x 165 x 300 mm", "Material": "Nylon 11/12", "Laser": "30W Fiber Laser"}'::jsonb,
  '["Certified safety goggles and respirator required", "Pre-heating takes 45 mins", "Clean chamber sifter after use"]'::jsonb,
  '{"restricted": true, "department": "Robotics & Automation", "required_training": ["Laser Safety Level 2", "3D Sintering Certification"]}'::jsonb,
  false,
  8,
  true,
  'active'
),
(
  '11111111-1111-1111-1111-111111111002',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Digital Storage Oscilloscope 200MHz (Rigol DS1054Z)',
  'Laboratory Equipment',
  'High-precision 4-channel digital oscilloscope with deep memory capture and serial decoding.',
  'Electronics Wing, Lab B-12',
  'Science Complex',
  'Lab B-12',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
  '{"Bandwidth": "200 MHz", "Channels": "4 Analog", "Sample Rate": "1 GSa/s"}'::jsonb,
  '["Check ground polarity", "Max 300 Vrms CAT I", "Return probes to pouch"]'::jsonb,
  '{"restricted": false, "required_training": ["Electrical Hazard Training"]}'::jsonb,
  false,
  6,
  true,
  'active'
)
ON CONFLICT (id) DO NOTHING;
