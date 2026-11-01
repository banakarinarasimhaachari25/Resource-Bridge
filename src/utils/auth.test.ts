import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessDashboard, verifyCredentials } from './auth';
import { UserProfile } from '../types';

const requesterProfile: UserProfile = {
  id: 'usr-sarah',
  display_name: 'Dr. Sarah Chen',
  email: 'sarah.chen@apex.edu',
  role: 'requester',
  organisation_id: 'org-apex',
  organisation_name: 'Apex Institute',
  department: 'Robotics',
  verified_trainings: []
};

const custodianProfile: UserProfile = {
  id: 'usr-marcus',
  display_name: 'Prof. Marcus Vance',
  email: 'm.vance@apex.edu',
  role: 'owner',
  organisation_id: 'org-apex',
  organisation_name: 'Apex Institute',
  department: 'Mechanical',
  verified_trainings: []
};

const adminProfile: UserProfile = {
  id: 'usr-admin',
  display_name: 'David Kim',
  email: 'admin@apex.edu',
  role: 'admin',
  organisation_id: 'org-apex',
  organisation_name: 'Apex Institute',
  department: 'Administration',
  verified_trainings: []
};

test('canAccessDashboard enforces strict role boundaries', () => {
  // Requester
  assert.equal(canAccessDashboard(requesterProfile, 'borrower_dashboard'), true);
  assert.equal(canAccessDashboard(requesterProfile, 'custodian_dashboard'), false);
  assert.equal(canAccessDashboard(requesterProfile, 'admin_dashboard'), false);

  // Custodian / Owner
  assert.equal(canAccessDashboard(custodianProfile, 'borrower_dashboard'), true);
  assert.equal(canAccessDashboard(custodianProfile, 'custodian_dashboard'), true);
  assert.equal(canAccessDashboard(custodianProfile, 'admin_dashboard'), false);

  // Admin
  assert.equal(canAccessDashboard(adminProfile, 'borrower_dashboard'), true);
  assert.equal(canAccessDashboard(adminProfile, 'custodian_dashboard'), true);
  assert.equal(canAccessDashboard(adminProfile, 'admin_dashboard'), true);
});

test('verifyCredentials validates email and password rules', () => {
  // Empty email
  const emptyEmail = verifyCredentials('', 'password123');
  assert.equal(emptyEmail.success, false);
  assert.ok(emptyEmail.error?.includes('email'));

  // Short password
  const shortPass = verifyCredentials('sarah.chen@apex.edu', '12');
  assert.equal(shortPass.success, false);
  assert.ok(shortPass.error?.includes('password'));

  // Valid credentials for Sarah Chen
  const validUser = verifyCredentials('sarah.chen@apex.edu', 'password123', 'borrower_dashboard');
  assert.equal(validUser.success, true);
  assert.equal(validUser.profile?.email, 'sarah.chen@apex.edu');

  // Sarah Chen attempting to log into Custodian dashboard without owner permissions
  const unauthorized = verifyCredentials('sarah.chen@apex.edu', 'password123', 'custodian_dashboard');
  assert.equal(unauthorized.success, false);
  assert.ok(unauthorized.error?.includes('not authorized'));

  // Prof Vance logging into Custodian dashboard
  const validCustodian = verifyCredentials('m.vance@apex.edu', 'password123', 'custodian_dashboard');
  assert.equal(validCustodian.success, true);
  assert.equal(validCustodian.profile?.role, 'owner');
});
