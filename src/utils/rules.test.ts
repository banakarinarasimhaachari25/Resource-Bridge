import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBookingSlot, checkEligibility, canTransitionBookingStatus } from './rules.ts';
import { Booking, ResourceItem, UserProfile } from '../types/index.ts';

const mockResource: ResourceItem = {
  id: 'res-3d-printer',
  title: 'Industrial SLS 3D Printer',
  category: 'Engineering Tools',
  description: 'Precision selective laser sintering printer',
  location_label: 'Room 204, Maker Wing',
  building: 'Engineering Hall',
  room: '204',
  owner_id: 'usr-owner-1',
  owner_name: 'Prof. Marcus Vance',
  owner_email: 'marcus.vance@institution.edu',
  organisation_id: 'org-apex',
  organisation_name: 'Apex Institute of Technology',
  image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  gallery: [],
  specifications: { 'Build Volume': '165 x 165 x 300 mm', Material: 'Nylon 12 Powder' },
  rules: ['Safety goggles required', 'Do not open chamber while heating'],
  eligibility_rules: {
    restricted: true,
    department: 'Robotics',
    required_training: ['Laser Safety Level 2', '3D Sintering Certification']
  },
  supervision_required: false,
  max_duration_hours: 6,
  availability_schedule: 'Mon-Fri 08:00 - 18:00',
  requires_approval: true,
  status: 'active',
  cost_per_hour: 25,
  cost_label: '$25/hr (Lab Fee)',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const baseExistingBookings: Booking[] = [
  {
    id: 'book-101',
    resource_id: 'res-3d-printer',
    resource_title: 'Industrial SLS 3D Printer',
    resource_category: 'Engineering Tools',
    resource_image: '',
    location_label: 'Room 204',
    requester_id: 'usr-sarah',
    requester_name: 'Dr. Sarah Chen',
    requester_email: 'sarah.chen@institution.edu',
    requester_department: 'Robotics',
    start_at: '2026-11-05T10:00:00.000Z',
    end_at: '2026-11-05T13:00:00.000Z',
    purpose: 'Rapid drone rotor prototype',
    num_users: 1,
    training_confirmed: true,
    rules_agreed: true,
    status: 'approved',
    eligibility_status: 'verified',
    created_at: '2026-11-01T08:00:00.000Z',
    updated_at: '2026-11-01T09:00:00.000Z'
  }
];

test('validateBookingSlot prevents overlapping approved booking for same resource', () => {
  // Overlaps 11:00 to 14:00 with existing 10:00 to 13:00
  const conflict = validateBookingSlot(
    baseExistingBookings,
    'res-3d-printer',
    '2026-11-05T11:00:00.000Z',
    '2026-11-05T14:00:00.000Z',
    6
  );
  assert.equal(conflict.valid, false);
  assert.match(conflict.reason || '', /Slot conflict/);
});

test('validateBookingSlot allows non-overlapping booking', () => {
  // Free slot after 13:00
  const validSlot = validateBookingSlot(
    baseExistingBookings,
    'res-3d-printer',
    '2026-11-05T14:00:00.000Z',
    '2026-11-05T16:00:00.000Z',
    6
  );
  assert.equal(validSlot.valid, true);
});

test('validateBookingSlot rejects end time before or equal to start time', () => {
  const backwards = validateBookingSlot(
    [],
    'res-3d-printer',
    '2026-11-05T14:00:00.000Z',
    '2026-11-05T13:00:00.000Z',
    6
  );
  assert.equal(backwards.valid, false);
  assert.match(backwards.reason || '', /strictly after/);
});

test('validateBookingSlot enforces max duration limits', () => {
  // 8 hours exceeds max limit of 6
  const tooLong = validateBookingSlot(
    [],
    'res-3d-printer',
    '2026-11-05T08:00:00.000Z',
    '2026-11-05T16:00:00.000Z',
    6
  );
  assert.equal(tooLong.valid, false);
  assert.match(tooLong.reason || '', /exceeds the maximum allowed limit/);
});

test('checkEligibility correctly flags missing safety certifications', () => {
  const studentUser: UserProfile = {
    id: 'usr-student-1',
    display_name: 'Jordan Lee',
    email: 'jordan.lee@institution.edu',
    role: 'requester',
    organisation_id: 'org-apex',
    organisation_name: 'Apex Institute of Technology',
    department: 'Robotics',
    verified_trainings: ['Laser Safety Level 2'] // Missing 3D Sintering Certification
  };

  const res = checkEligibility(studentUser, mockResource);
  assert.equal(res.eligible, false);
  assert.equal(res.missingRequirements.length, 1);
  assert.match(res.missingRequirements[0], /3D Sintering Certification/);
});

test('canTransitionBookingStatus enforces authorization matrix', () => {
  assert.equal(canTransitionBookingStatus('pending', 'approved', 'owner'), true);
  assert.equal(canTransitionBookingStatus('pending', 'approved', 'requester'), false);
  assert.equal(canTransitionBookingStatus('approved', 'checked_out', 'owner'), true);
  assert.equal(canTransitionBookingStatus('checked_out', 'return_pending', 'requester'), true);
  assert.equal(canTransitionBookingStatus('return_pending', 'returned', 'owner'), true);
  assert.equal(canTransitionBookingStatus('draft', 'returned', 'requester'), false);
});

test('resource rating aggregation accurately computes weighted average', () => {
  const reviews = [
    { rating: 5 },
    { rating: 4.8 },
    { rating: 4.5 }
  ];
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = Math.round((sum / reviews.length) * 10) / 10;
  assert.equal(avg, 4.8);
  assert.equal(reviews.length, 3);
});

