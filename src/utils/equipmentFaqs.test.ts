import test from 'node:test';
import assert from 'node:assert/strict';
import { getEquipmentFAQs, filterEquipmentFAQs } from './equipmentFaqs';
import { ResourceItem } from '../types';

const mockPrinter: ResourceItem = {
  id: 'res-3d-printer-01',
  title: 'Industrial SLS 3D Printer (Formlabs Fuse 1+)',
  category: 'Engineering Tools',
  description: 'SLS 3D printer for nylon parts.',
  location_label: 'Maker Wing, Room 204',
  building: 'Engineering Hall',
  room: '204',
  owner_id: 'usr-1',
  owner_name: 'Prof. Marcus Vance',
  owner_email: 'm.vance@apex.edu',
  organisation_id: 'org-1',
  organisation_name: 'Apex Institute',
  image_url: 'https://example.com/printer.jpg',
  gallery: [],
  specifications: { 'Build Volume': '165 x 165 x 300 mm' },
  rules: ['Wear goggles', 'Clean chamber sifter'],
  eligibility_rules: { required_training: ['Laser Safety Level 2'] },
  supervision_required: false,
  max_duration_hours: 8,
  availability_schedule: 'Mon-Fri',
  requires_approval: true,
  status: 'active',
  cost_per_hour: 28,
  cost_label: '$28/hr',
  created_at: '2026-10-01',
  updated_at: '2026-10-01'
};

const mockGenericTool: ResourceItem = {
  id: 'res-generic-01',
  title: 'Digital Centrifuge High Speed',
  category: 'Laboratory Equipment',
  description: 'High speed refrigerated centrifuge.',
  location_label: 'Chemistry Lab 101',
  building: 'Science Hall',
  room: '101',
  owner_id: 'usr-2',
  owner_name: 'Dr. Lab Manager',
  owner_email: 'lab@apex.edu',
  organisation_id: 'org-1',
  organisation_name: 'Apex Institute',
  image_url: 'https://example.com/centrifuge.jpg',
  gallery: [],
  specifications: { Speed: '15000 RPM' },
  rules: ['Balance tubes symmetrically'],
  eligibility_rules: {},
  supervision_required: true,
  max_duration_hours: 4,
  availability_schedule: 'Mon-Fri',
  requires_approval: false,
  status: 'active',
  cost_per_hour: 0,
  cost_label: 'Free',
  created_at: '2026-10-01',
  updated_at: '2026-10-01'
};

test('getEquipmentFAQs generates usage, safety, and maintenance FAQs for SLS printer', () => {
  const faqs = getEquipmentFAQs(mockPrinter);
  assert.ok(faqs.length >= 4, 'Should generate at least 4 tailored questions');

  const categories = new Set(faqs.map(f => f.category));
  assert.ok(categories.has('usage'), 'Must contain usage FAQ');
  assert.ok(categories.has('safety'), 'Must contain safety FAQ');
  assert.ok(categories.has('maintenance'), 'Must contain maintenance FAQ');

  // Verify SLS specific details are present
  const hasSLSQuestions = faqs.some(f => f.question.toLowerCase().includes('sls') || f.answer.toLowerCase().includes('nylon'));
  assert.ok(hasSLSQuestions, 'Must have SLS or Nylon specific questions');
});

test('getEquipmentFAQs generates fallback contextual questions for generic equipment', () => {
  const faqs = getEquipmentFAQs(mockGenericTool);
  assert.ok(faqs.length >= 4, 'Generic equipment must also get full set of FAQs');

  const categories = new Set(faqs.map(f => f.category));
  assert.ok(categories.has('usage'));
  assert.ok(categories.has('safety'));
  assert.ok(categories.has('maintenance'));
  assert.ok(categories.has('booking'));

  const safetyFaq = faqs.find(f => f.category === 'safety');
  assert.ok(safetyFaq?.answer.includes('Balance tubes symmetrically'), 'Must include custom rules in safety answer');
});

test('filterEquipmentFAQs filters accurately by category and search keyword', () => {
  const faqs = getEquipmentFAQs(mockPrinter);

  // Filter by category
  const safetyOnly = filterEquipmentFAQs(faqs, '', 'safety');
  assert.ok(safetyOnly.length > 0);
  assert.ok(safetyOnly.every(f => f.category === 'safety'));

  // Filter by keyword
  const ppeSearch = filterEquipmentFAQs(faqs, 'respirator', 'all');
  assert.ok(ppeSearch.length > 0);
  assert.ok(ppeSearch.some(f => f.answer.toLowerCase().includes('respirator') || f.question.toLowerCase().includes('respirator')));

  // Filter by non-existent term
  const noMatch = filterEquipmentFAQs(faqs, 'xyzsupernonexistentword123', 'all');
  assert.equal(noMatch.length, 0);
});
