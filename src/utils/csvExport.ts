import { Booking, ResourceItem } from '../types';

/**
 * Escapes a cell value for standard CSV compatibility.
 * Surrounds with double quotes if the value contains commas, quotes, or newlines.
 */
export function escapeCSVCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }

  const str = String(value);

  // If the cell contains quotes, escape them by doubling them
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return `"${str}"`;
}

/**
 * Generates CSV string content for a list of bookings.
 */
export function generateBookingsCSVContent(bookings: Booking[]): string {
  const headers = [
    'Booking ID',
    'Resource ID',
    'Resource Title',
    'Category',
    'Location',
    'Borrower Name',
    'Borrower Email',
    'Borrower Department',
    'Start Timestamp',
    'Start Date',
    'Start Time',
    'End Timestamp',
    'End Date',
    'End Time',
    'Duration (Hours)',
    'Status',
    'Eligibility Status',
    'Purpose',
    'Number of Operators',
    'Safety Training Confirmed',
    'Rules Agreed',
    'Decision Custodian',
    'Decision Date',
    'Decision Note',
    'Submitted Timestamp',
    'Updated Timestamp'
  ];

  const rows = bookings.map(b => {
    const startDate = new Date(b.start_at);
    const endDate = new Date(b.end_at);
    const durationHours = !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())
      ? ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)).toFixed(1)
      : '0';

    return [
      escapeCSVCell(b.id),
      escapeCSVCell(b.resource_id),
      escapeCSVCell(b.resource_title),
      escapeCSVCell(b.resource_category),
      escapeCSVCell(b.location_label),
      escapeCSVCell(b.requester_name),
      escapeCSVCell(b.requester_email),
      escapeCSVCell(b.requester_department),
      escapeCSVCell(b.start_at),
      escapeCSVCell(startDate.toLocaleDateString()),
      escapeCSVCell(startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
      escapeCSVCell(b.end_at),
      escapeCSVCell(endDate.toLocaleDateString()),
      escapeCSVCell(endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
      escapeCSVCell(durationHours),
      escapeCSVCell(b.status.toUpperCase()),
      escapeCSVCell(b.eligibility_status),
      escapeCSVCell(b.purpose),
      escapeCSVCell(b.num_users),
      escapeCSVCell(b.training_confirmed ? 'YES' : 'NO'),
      escapeCSVCell(b.rules_agreed ? 'YES' : 'NO'),
      escapeCSVCell(b.decision_by || 'Pending'),
      escapeCSVCell(b.decision_at ? new Date(b.decision_at).toLocaleString() : 'N/A'),
      escapeCSVCell(b.decision_reason || ''),
      escapeCSVCell(b.created_at),
      escapeCSVCell(b.updated_at)
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generates CSV string content for resource capacity and utilization reporting.
 */
export function generateUtilizationSummaryCSVContent(
  resources: ResourceItem[],
  bookings: Booking[]
): string {
  const headers = [
    'Resource ID',
    'Title',
    'Category',
    'Building',
    'Room',
    'Location Label',
    'Custodian Owner',
    'Owner Email',
    'Status',
    'Max Duration (Hours)',
    'Operating Schedule',
    'Supervision Required',
    'Requires Approval',
    'Total Bookings',
    'Pending Approvals',
    'Approved Bookings',
    'Active Checked Out',
    'Completed Returns',
    'Cancelled or Rejected',
    'Total Booked Hours',
    'Estimated Utilization Index (%)'
  ];

  const rows = resources.map(r => {
    const resBookings = bookings.filter(b => b.resource_id === r.id);
    const pending = resBookings.filter(b => b.status === 'pending').length;
    const approved = resBookings.filter(b => b.status === 'approved').length;
    const activeLoans = resBookings.filter(b => b.status === 'checked_out' || b.status === 'return_pending').length;
    const returned = resBookings.filter(b => b.status === 'returned').length;
    const cancelled = resBookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length;

    let totalBookedHours = 0;
    resBookings
      .filter(b => ['approved', 'checked_out', 'return_pending', 'returned'].includes(b.status))
      .forEach(b => {
        const s = new Date(b.start_at).getTime();
        const e = new Date(b.end_at).getTime();
        if (e > s) {
          totalBookedHours += (e - s) / (1000 * 60 * 60);
        }
      });

    // Estimation baseline: 40 active hours per resource cycle
    const utilizationRate = Math.min(100, Math.round((totalBookedHours / 40) * 100));

    return [
      escapeCSVCell(r.id),
      escapeCSVCell(r.title),
      escapeCSVCell(r.category),
      escapeCSVCell(r.building),
      escapeCSVCell(r.room),
      escapeCSVCell(r.location_label),
      escapeCSVCell(r.owner_name),
      escapeCSVCell(r.owner_email),
      escapeCSVCell(r.status.toUpperCase()),
      escapeCSVCell(r.max_duration_hours),
      escapeCSVCell(r.availability_schedule),
      escapeCSVCell(r.supervision_required ? 'YES' : 'NO'),
      escapeCSVCell(r.requires_approval ? 'YES' : 'NO'),
      escapeCSVCell(resBookings.length),
      escapeCSVCell(pending),
      escapeCSVCell(approved),
      escapeCSVCell(activeLoans),
      escapeCSVCell(returned),
      escapeCSVCell(cancelled),
      escapeCSVCell(totalBookedHours.toFixed(1)),
      escapeCSVCell(utilizationRate)
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers a browser download of CSV content with standard UTF-8 BOM for Excel compatibility.
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // UTF-8 BOM ensures Microsoft Excel and Google Sheets render international characters properly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
