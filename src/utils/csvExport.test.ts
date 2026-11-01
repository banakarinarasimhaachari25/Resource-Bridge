import test from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeCSVCell,
  generateBookingsCSVContent,
  generateUtilizationSummaryCSVContent
} from './csvExport.ts';
import { Booking, ResourceItem } from '../types/index.ts';

test('escapeCSVCell properly escapes commas, quotes, and special characters', () => {
  assert.equal(escapeCSVCell('Simple Text'), '"Simple Text"');
  assert.equal(escapeCSVCell('Text with, comma'), '"Text with, comma"');
  assert.equal(escapeCSVCell('Text with "quotes"'), '"Text with ""quotes"""');
  assert.equal(escapeCSVCell(null), '""');
  assert.equal(escapeCSVCell(undefined), '""');
  assert.equal(escapeCSVCell(42), '"42"');
});

test('generateBookingsCSVContent formats rows with all required fields', () => {
  const sampleBookings: Booking[] = [
    {
      id: 'book-001',
      resource_id: 'res-001',
      resource_title: '5-Axis CNC Milling Center, Model A',
      resource_category: 'Engineering Tools',
      resource_image: '',
      location_label: 'Building 4, Room 101',
      requester_id: 'usr-001',
      requester_name: 'Dr. Jane Doe',
      requester_email: 'jane@institution.edu',
      requester_department: 'Mechanical Engineering',
      start_at: '2026-11-01T10:00:00.000Z',
      end_at: '2026-11-01T14:00:00.000Z',
      purpose: 'Prototype testing for "aerospace" structural wing ribs',
      num_users: 2,
      training_confirmed: true,
      rules_agreed: true,
      status: 'approved',
      eligibility_status: 'verified',
      decision_by: 'Prof. Marcus Vance',
      decision_at: '2026-10-31T12:00:00.000Z',
      decision_reason: 'Approved for research',
      created_at: '2026-10-31T10:00:00.000Z',
      updated_at: '2026-10-31T12:00:00.000Z'
    }
  ];

  const csv = generateBookingsCSVContent(sampleBookings);
  assert.ok(csv.includes('Booking ID,Resource ID,Resource Title'));
  assert.ok(csv.includes('"book-001"'));
  assert.ok(csv.includes('"5-Axis CNC Milling Center, Model A"'));
  assert.ok(csv.includes('"Prototype testing for ""aerospace"" structural wing ribs"'));
  assert.ok(csv.includes('"4.0"')); // 4 hours duration
  assert.ok(csv.includes('"APPROVED"'));
});

test('generateUtilizationSummaryCSVContent calculates totals and capacity', () => {
  const sampleResources: ResourceItem[] = [
    {
      id: 'res-001',
      title: 'Industrial SLS 3D Printer',
      category: 'Engineering Tools',
      description: 'Test description',
      location_label: 'Maker Wing',
      building: 'Engineering Hall',
      room: '204',
      owner_id: 'usr-owner',
      owner_name: 'Prof. Marcus Vance',
      owner_email: 'marcus@institution.edu',
      organisation_id: 'org-apex',
      organisation_name: 'Apex Tech',
      image_url: '',
      gallery: [],
      specifications: {},
      rules: [],
      eligibility_rules: { restricted: false },
      supervision_required: false,
      max_duration_hours: 6,
      availability_schedule: 'Mon-Fri',
      requires_approval: true,
      status: 'active',
      cost_per_hour: 0,
      cost_label: '$0/hr (Free)',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const sampleBookings: Booking[] = [
    {
      id: 'b1',
      resource_id: 'res-001',
      resource_title: 'Industrial SLS 3D Printer',
      resource_category: 'Engineering Tools',
      resource_image: '',
      location_label: 'Maker Wing',
      requester_id: 'u1',
      requester_name: 'Sarah',
      requester_email: 's@apex.edu',
      requester_department: 'Robotics',
      start_at: '2026-11-01T08:00:00.000Z',
      end_at: '2026-11-01T12:00:00.000Z',
      purpose: 'Testing',
      num_users: 1,
      training_confirmed: true,
      rules_agreed: true,
      status: 'returned',
      eligibility_status: 'verified',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const summaryCsv = generateUtilizationSummaryCSVContent(sampleResources, sampleBookings);
  assert.ok(summaryCsv.includes('Resource ID,Title,Category'));
  assert.ok(summaryCsv.includes('"Industrial SLS 3D Printer"'));
  assert.ok(summaryCsv.includes('"4.0"')); // 4 hours booked
  assert.ok(summaryCsv.includes('"1"')); // 1 completed return
});
