import { Booking, UserRole } from '../types';

export interface QuickActionItem {
  id: 'report_incident' | 'request_support' | 'check_return_schedule' | 'browse_equipment' | 'review_booking' | 'approval_queue' | 'add_equipment';
  title: string;
  subtitle: string;
  category: 'safety' | 'support' | 'schedule' | 'action';
  icon: string;
  badge?: string;
  badgeColor?: string;
}

export interface ReturnScheduleSummary {
  bookingId: string;
  resourceTitle: string;
  resourceImage: string;
  locationLabel: string;
  dueDate: string;
  dueTime: string;
  hoursRemaining: number;
  urgency: 'overdue' | 'due_soon' | 'active';
  urgencyLabel: string;
  urgencyColor: string;
  counterpartName: string;
  counterpartRole: string;
}

/**
 * Returns available quick actions based on user role.
 */
export function getQuickActionsForRole(
  role: UserRole,
  counts?: {
    activeLoansCount?: number;
    pendingApprovalsCount?: number;
    unreviewedCount?: number;
  }
): QuickActionItem[] {
  const isCustodian = role === 'owner' || role === 'manager' || role === 'admin';

  const commonActions: QuickActionItem[] = [
    {
      id: 'report_incident',
      title: 'Report Incident',
      subtitle: 'Log malfunction, physical damage, or lab safety hazard',
      category: 'safety',
      icon: 'AlertTriangle',
      badge: 'Safety Priority',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
    },
    {
      id: 'request_support',
      title: 'Request Support',
      subtitle: 'Contact technician, facility staff, or report access issues',
      category: 'support',
      icon: 'LifeBuoy',
      badge: 'Help Desk',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      id: 'check_return_schedule',
      title: 'Check Return Schedule',
      subtitle: isCustodian
        ? 'Monitor incoming returns and inspect drop-offs'
        : 'View active loan countdowns & return drop-off locations',
      category: 'schedule',
      icon: 'CalendarClock',
      badge: counts?.activeLoansCount ? `${counts.activeLoansCount} Active` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
    }
  ];

  if (!isCustodian) {
    // Borrower specific quick actions
    if (counts?.unreviewedCount && counts.unreviewedCount > 0) {
      commonActions.push({
        id: 'review_booking',
        title: 'Rate Completed Booking',
        subtitle: 'Share feedback and star ratings on recently returned equipment',
        category: 'action',
        icon: 'Star',
        badge: `${counts.unreviewedCount} Due`,
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      });
    }

    commonActions.push({
      id: 'browse_equipment',
      title: 'Browse & Reserve Equipment',
      subtitle: 'Find and book lab instruments, compute clusters & spaces',
      category: 'action',
      icon: 'Compass'
    });
  } else {
    // Custodian specific quick actions
    if (counts?.pendingApprovalsCount && counts.pendingApprovalsCount > 0) {
      commonActions.unshift({
        id: 'approval_queue',
        title: 'Review Approval Queue',
        subtitle: '1-click authorize or decline researcher loan requests',
        category: 'action',
        icon: 'CheckCircle2',
        badge: `${counts.pendingApprovalsCount} Awaiting`,
        badgeColor: 'bg-red-500 text-white border-red-600'
      });
    }

    commonActions.push({
      id: 'add_equipment',
      title: 'Publish New Equipment',
      subtitle: 'List an instrument, workstation, or space for sharing',
      category: 'action',
      icon: 'Plus'
    });
  }

  return commonActions;
}

/**
 * Calculates return schedule urgency and remaining time.
 */
export function calculateReturnScheduleSummary(
  booking: Booking,
  currentProfileRole: UserRole
): ReturnScheduleSummary {
  const now = new Date().getTime();
  const end = new Date(booking.end_at).getTime();
  const diffHours = (end - now) / (1000 * 60 * 60);

  let urgency: 'overdue' | 'due_soon' | 'active' = 'active';
  let urgencyLabel = 'On Schedule';
  let urgencyColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (diffHours < 0) {
    urgency = 'overdue';
    urgencyLabel = `Overdue by ${Math.abs(Math.round(diffHours))}h`;
    urgencyColor = 'bg-red-50 text-red-700 border-red-200 animate-pulse';
  } else if (diffHours <= 4) {
    urgency = 'due_soon';
    urgencyLabel = `Due in ${Math.max(1, Math.round(diffHours))}h`;
    urgencyColor = 'bg-amber-50 text-amber-800 border-amber-200';
  } else {
    urgency = 'active';
    urgencyLabel = `Due in ${Math.round(diffHours)}h`;
    urgencyColor = 'bg-blue-50 text-blue-700 border-blue-200';
  }

  const isCustodian = currentProfileRole === 'owner' || currentProfileRole === 'manager' || currentProfileRole === 'admin';

  return {
    bookingId: booking.id,
    resourceTitle: booking.resource_title,
    resourceImage: booking.resource_image,
    locationLabel: booking.location_label,
    dueDate: new Date(booking.end_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    dueTime: new Date(booking.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    hoursRemaining: Math.round(diffHours * 10) / 10,
    urgency,
    urgencyLabel,
    urgencyColor,
    counterpartName: isCustodian ? booking.requester_name : 'Prof. Marcus Vance',
    counterpartRole: isCustodian ? `Borrower (${booking.requester_department})` : 'Lab Custodian'
  };
}

/**
 * Validates a support ticket submission.
 */
export function validateSupportTicket(ticket: {
  category: string;
  subject: string;
  message: string;
  urgency: string;
}): { valid: boolean; error?: string } {
  if (!ticket.category || !ticket.category.trim()) {
    return { valid: false, error: 'Please select a support category.' };
  }
  if (!ticket.subject || ticket.subject.trim().length < 4) {
    return { valid: false, error: 'Please provide a clear subject (minimum 4 characters).' };
  }
  if (!ticket.message || ticket.message.trim().length < 10) {
    return { valid: false, error: 'Please describe your request in detail (minimum 10 characters).' };
  }
  return { valid: true };
}
