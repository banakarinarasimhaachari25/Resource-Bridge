import React from 'react';
import { BookingStatus, ResourceStatus } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ArrowUpRight, RotateCcw, AlertOctagon } from 'lucide-react';

interface StatusBadgeProps {
  status: BookingStatus | ResourceStatus | 'open' | 'under_review' | 'resolved';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';
  const padding = isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  switch (status) {
    case 'approved':
    case 'active':
    case 'returned':
    case 'resolved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-inter ${padding}`}
          style={{
            backgroundColor: 'rgba(135, 144, 120, 0.18)',
            color: '#4f5745',
            border: '1px solid rgba(135, 144, 120, 0.35)'
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#879078]" />
          <span className="capitalize">{status === 'active' ? 'Active' : status}</span>
        </span>
      );

    case 'pending':
    case 'under_review':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-inter ${padding}`}
          style={{
            backgroundColor: '#F7E7CE',
            color: '#6F4E37',
            border: '1px solid #D8C3A5'
          }}
        >
          <Clock className="w-3 h-3 text-[#BF6B2E]" />
          <span className="capitalize">{status === 'pending' ? 'Pending Approval' : 'Under Review'}</span>
        </span>
      );

    case 'checked_out':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-inter ${padding}`}
          style={{
            backgroundColor: 'rgba(191, 107, 46, 0.15)',
            color: '#944a0d',
            border: '1px solid rgba(191, 107, 46, 0.35)'
          }}
        >
          <ArrowUpRight className="w-3 h-3 text-[#BF6B2E]" />
          <span>Checked Out</span>
        </span>
      );

    case 'return_pending':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-inter ${padding}`}
          style={{
            backgroundColor: '#F7E7CE',
            color: '#BF6B2E',
            border: '1px solid #BF6B2E'
          }}
        >
          <RotateCcw className="w-3 h-3 text-[#BF6B2E] animate-spin" />
          <span>Return Pending</span>
        </span>
      );

    case 'rejected':
    case 'cancelled':
    case 'review_required':
    case 'overdue':
    case 'open':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-inter ${padding}`}
          style={{
            backgroundColor: 'rgba(169, 68, 56, 0.15)',
            color: '#A94438',
            border: '1px solid rgba(169, 68, 56, 0.35)'
          }}
        >
          <AlertOctagon className="w-3 h-3 text-[#A94438]" />
          <span className="capitalize">
            {status === 'review_required' ? 'Review Required' : status}
          </span>
        </span>
      );

    case 'draft':
    case 'paused':
    case 'archived':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 font-inter ${padding}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
          <span className="capitalize">{status}</span>
        </span>
      );
  }
};
