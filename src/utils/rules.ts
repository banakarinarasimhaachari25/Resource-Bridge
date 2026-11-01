import { Booking, BookingStatus, ResourceItem, UserProfile, UserRole } from '../types';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateBookingSlot(
  existingBookings: Booking[],
  resourceId: string,
  requestedStart: string | Date,
  requestedEnd: string | Date,
  maxDurationHours: number = 8,
  ignoreBookingId?: string
): ValidationResult {
  const start = new Date(requestedStart).getTime();
  const end = new Date(requestedEnd).getTime();

  if (isNaN(start) || isNaN(end)) {
    return { valid: false, reason: 'Invalid start or end date format.' };
  }

  if (end <= start) {
    return { valid: false, reason: 'End time must be strictly after the start time.' };
  }

  const durationHours = (end - start) / (1000 * 60 * 60);
  if (durationHours > maxDurationHours) {
    return {
      valid: false,
      reason: `Requested duration (${durationHours.toFixed(1)} hrs) exceeds the maximum allowed limit of ${maxDurationHours} hrs for this resource.`
    };
  }

  // Check for conflicts with already approved or active bookings for the same resource
  const blockingStatuses: BookingStatus[] = ['approved', 'checked_out', 'return_pending'];

  for (const b of existingBookings) {
    if (b.resource_id !== resourceId) continue;
    if (ignoreBookingId && b.id === ignoreBookingId) continue;
    if (!blockingStatuses.includes(b.status)) continue;

    const bStart = new Date(b.start_at).getTime();
    const bEnd = new Date(b.end_at).getTime();

    // Overlap condition: (StartA < EndB) and (EndA > StartB)
    if (start < bEnd && end > bStart) {
      const conflictStartStr = new Date(b.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const conflictEndStr = new Date(b.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        valid: false,
        reason: `Slot conflict: This resource is already reserved from ${conflictStartStr} to ${conflictEndStr} by another approved borrower.`
      };
    }
  }

  return { valid: true };
}

export function checkEligibility(
  user: UserProfile,
  resource: ResourceItem
): { eligible: boolean; missingRequirements: string[] } {
  const missing: string[] = [];

  const reqs = resource.eligibility_rules;
  if (!reqs) return { eligible: true, missingRequirements: [] };

  if (reqs.department && reqs.department !== 'All' && user.department !== reqs.department) {
    // If user is owner/manager/admin, department restriction may be waived
    if (user.role === 'requester') {
      missing.push(`Department restriction: priority for ${reqs.department} members`);
    }
  }

  if (reqs.required_training && reqs.required_training.length > 0) {
    for (const training of reqs.required_training) {
      if (!user.verified_trainings.includes(training)) {
        missing.push(`Requires verified safety certification: ${training}`);
      }
    }
  }

  return {
    eligible: missing.length === 0,
    missingRequirements: missing
  };
}

export function canTransitionBookingStatus(
  current: BookingStatus,
  next: BookingStatus,
  role: UserRole
): boolean {
  // Admins & managers can execute all valid state progressions
  if (role === 'admin' || role === 'manager') {
    return true;
  }

  if (role === 'requester') {
    // Borrower can cancel if still pending or approved prior to checkout
    if (next === 'cancelled' && (current === 'pending' || current === 'approved')) {
      return true;
    }
    // Borrower can flag for return
    if (next === 'return_pending' && current === 'checked_out') {
      return true;
    }
    return false;
  }

  if (role === 'owner') {
    if (current === 'pending' && (next === 'approved' || next === 'rejected')) return true;
    if (current === 'approved' && (next === 'checked_out' || next === 'cancelled')) return true;
    if (current === 'checked_out' && (next === 'returned' || next === 'return_pending' || next === 'review_required')) return true;
    if (current === 'return_pending' && (next === 'returned' || next === 'review_required')) return true;
    return false;
  }

  return false;
}

export function calculateUtilizationStats(resources: ResourceItem[], bookings: Booking[]) {
  const totalResources = resources.length;
  const activeResources = resources.filter(r => r.status === 'active').length;
  const pendingRequests = bookings.filter(b => b.status === 'pending').length;
  const activeLoans = bookings.filter(b => b.status === 'checked_out' || b.status === 'return_pending').length;
  const completedReturns = bookings.filter(b => b.status === 'returned').length;
  const overdueBookings = bookings.filter(b => {
    if (b.status === 'checked_out' || b.status === 'return_pending') {
      return new Date(b.end_at).getTime() < Date.now();
    }
    return false;
  }).length;

  const totalCompletedOrActive = bookings.filter(b => ['approved', 'checked_out', 'returned'].includes(b.status)).length;
  const utilizationRate = totalResources > 0 ? Math.min(100, Math.round((totalCompletedOrActive / (totalResources * 4)) * 100)) : 0;

  return {
    totalResources,
    activeResources,
    pendingRequests,
    activeLoans,
    completedReturns,
    overdueBookings,
    utilizationRate
  };
}
