import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getQuickActionsForRole,
  calculateReturnScheduleSummary,
  validateSupportTicket
} from './quickActions';
import { Booking } from '../types';

const mockBooking: Booking = {
  id: 'book-test-1',
  resource_id: 'res-3d-printer-01',
  resource_title: 'Industrial SLS 3D Printer (Formlabs Fuse 1+)',
  resource_category: 'Engineering Tools',
  resource_image: 'https://example.com/sls.jpg',
  location_label: 'Maker Wing, Room 204',
  requester_id: 'usr-sarah-chen',
  requester_name: 'Dr. Sarah Chen',
  requester_email: 'sarah.chen@apex.edu',
  requester_department: 'Robotics',
  start_at: new Date(Date.now() - 3600000).toISOString(),
  end_at: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
  purpose: 'Testing drone parts',
  num_users: 1,
  training_confirmed: true,
  rules_agreed: true,
  status: 'checked_out',
  eligibility_status: 'verified'
};

test('getQuickActionsForRole returns standard tasks for Borrower', () => {
  const actions = getQuickActionsForRole('requester', { activeLoansCount: 2, unreviewedCount: 1 });
  const actionIds = actions.map(a => a.id);

  assert.ok(actionIds.includes('report_incident'), 'Borrower menu must have Report Incident');
  assert.ok(actionIds.includes('request_support'), 'Borrower menu must have Request Support');
  assert.ok(actionIds.includes('check_return_schedule'), 'Borrower menu must have Check Return Schedule');
  assert.ok(actionIds.includes('review_booking'), 'Borrower menu must include review action when unreviewed count > 0');
});

test('getQuickActionsForRole returns approval queue for Custodian', () => {
  const actions = getQuickActionsForRole('owner', { pendingApprovalsCount: 3 });
  const actionIds = actions.map(a => a.id);

  assert.ok(actionIds.includes('report_incident'), 'Custodian menu must have Report Incident');
  assert.ok(actionIds.includes('request_support'), 'Custodian menu must have Request Support');
  assert.ok(actionIds.includes('check_return_schedule'), 'Custodian menu must have Check Return Schedule');
  assert.ok(actionIds.includes('approval_queue'), 'Custodian menu must have Approval Queue');
});

test('calculateReturnScheduleSummary detects due soon condition', () => {
  const summary = calculateReturnScheduleSummary(mockBooking, 'requester');
  assert.equal(summary.bookingId, 'book-test-1');
  assert.equal(summary.urgency, 'due_soon');
  assert.ok(summary.urgencyLabel.includes('Due in'));
  assert.equal(summary.resourceTitle, 'Industrial SLS 3D Printer (Formlabs Fuse 1+)');
});

test('validateSupportTicket validates required fields', () => {
  const invalidCategory = validateSupportTicket({
    category: '',
    subject: 'Emergency help',
    message: 'Machine is showing error code 502',
    urgency: 'urgent'
  });
  assert.equal(invalidCategory.valid, false);

  const shortSubject = validateSupportTicket({
    category: 'Technical Support',
    subject: 'Hi',
    message: 'Machine is showing error code 502',
    urgency: 'urgent'
  });
  assert.equal(shortSubject.valid, false);

  const validTicket = validateSupportTicket({
    category: 'Technical Support',
    subject: 'E-stop button indicator flashing yellow',
    message: 'The safety interlock sensor is not clearing after reboot in Room 204.',
    urgency: 'urgent'
  });
  assert.equal(validTicket.valid, true);
});
