import { UserProfile, UserRole } from '../types';
import { DEMO_PROFILES } from '../services/db';

export type DashboardType = 'borrower_dashboard' | 'custodian_dashboard' | 'admin_dashboard';

/**
 * Checks whether the given user profile is authorized to view the target dashboard
 * without additional re-authentication.
 * - Admin can access all dashboards.
 * - Manager can access Admin and Custodian dashboards.
 * - Owner/Custodian can access Custodian and Borrower dashboards.
 * - Requester/Borrower can access Borrower dashboard.
 */
export function canAccessDashboard(profile: UserProfile, targetDashboard: DashboardType): boolean {
  if (profile.role === 'admin') return true;

  switch (targetDashboard) {
    case 'borrower_dashboard':
      return true; // All authenticated institutional users can borrow
    case 'custodian_dashboard':
      return profile.role === 'owner' || profile.role === 'manager';
    case 'admin_dashboard':
      return profile.role === 'manager' || profile.role === 'admin';
    default:
      return false;
  }
}

/**
 * Verifies credentials when a user attempts to log in or switch to a dashboard.
 * Requires non-empty academic email and a password of at least 4 characters.
 */
export function verifyCredentials(
  email: string,
  password: string,
  targetDashboard?: DashboardType
): { success: boolean; profile?: UserProfile; error?: string } {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail) {
    return { success: false, error: 'Please enter your institutional academic email.' };
  }

  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Please enter a valid institutional email format.' };
  }

  if (!cleanPassword || cleanPassword.length < 4) {
    return { success: false, error: 'Please enter a valid password (minimum 4 characters).' };
  }

  // Find matching profile in DEMO_PROFILES or registered users
  let profile = DEMO_PROFILES.find(p => p.email.toLowerCase() === cleanEmail);

  if (!profile) {
    // Generate authenticated profile if custom valid email
    let role: UserRole = 'requester';
    if (targetDashboard === 'custodian_dashboard') role = 'owner';
    if (targetDashboard === 'admin_dashboard') role = 'admin';

    profile = {
      id: `usr-${Date.now()}`,
      display_name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: cleanEmail,
      role,
      organisation_id: 'org-apex',
      organisation_name: 'Apex Institute of Technology',
      department: role === 'owner' ? 'Laboratory Facilities' : 'Department of Engineering',
      verified_trainings: ['Institutional Safety Certification']
    };
  }

  // If a target dashboard is specified, ensure this profile has appropriate permissions
  if (targetDashboard && !canAccessDashboard(profile, targetDashboard)) {
    const roleLabels: Record<DashboardType, string> = {
      borrower_dashboard: 'Borrower',
      custodian_dashboard: 'Lab Custodian / Owner',
      admin_dashboard: 'System Administrator'
    };
    return {
      success: false,
      error: `Account ${cleanEmail} has role '${profile.role}', which is not authorized for the ${roleLabels[targetDashboard]}.`
    };
  }

  return { success: true, profile };
}
