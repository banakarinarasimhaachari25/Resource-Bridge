import React, { useState, useMemo } from 'react';
import { Booking, BookingStatus, UserProfile } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Filter,
  Star
} from 'lucide-react';

interface MyBookingsProps {
  bookings: Booking[];
  currentProfile: UserProfile;
  onCancelBooking: (bookingId: string) => void;
  onNavigateToHandover: (bookingId: string) => void;
  onReportIncident: (bookingId: string, resourceId: string) => void;
  onExplore: () => void;
  onOpenReviewModal?: (booking: Booking) => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({
  bookings,
  currentProfile,
  onCancelBooking,
  onNavigateToHandover,
  onReportIncident,
  onExplore,
  onOpenReviewModal
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const myBookings = useMemo(() => {
    // If requester, filter to own bookings; if manager/admin, show all
    if (currentProfile.role === 'requester') {
      return bookings.filter(b => b.requester_id === currentProfile.id);
    }
    return bookings;
  }, [bookings, currentProfile]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') return myBookings;
    if (activeTab === 'pending') return myBookings.filter(b => b.status === 'pending');
    if (activeTab === 'approved') return myBookings.filter(b => b.status === 'approved');
    if (activeTab === 'active') return myBookings.filter(b => b.status === 'checked_out' || b.status === 'return_pending');
    if (activeTab === 'returned') return myBookings.filter(b => b.status === 'returned' || b.status === 'review_required');
    if (activeTab === 'cancelled') return myBookings.filter(b => b.status === 'cancelled' || b.status === 'rejected');
    return myBookings;
  }, [myBookings, activeTab]);

  const counts = {
    all: myBookings.length,
    pending: myBookings.filter(b => b.status === 'pending').length,
    approved: myBookings.filter(b => b.status === 'approved').length,
    active: myBookings.filter(b => b.status === 'checked_out' || b.status === 'return_pending').length,
    returned: myBookings.filter(b => b.status === 'returned').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8C3A5] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
            // CUSTODIAL MANAGEMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34251F] mt-1">
            My Resource Bookings
          </h1>
          <p className="text-xs sm:text-sm text-[#50453e] mt-1 font-inter">
            Monitor reservation approvals, collection time slots, and return verification handovers.
          </p>
        </div>

        <button
          onClick={onExplore}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors shadow-xs"
        >
          <span>Book Another Resource</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D8C3A5] overflow-x-auto pb-px font-inter text-xs">
        {[
          { id: 'all', label: 'All Bookings', count: counts.all },
          { id: 'pending', label: 'Pending Approval', count: counts.pending },
          { id: 'approved', label: 'Approved Ready', count: counts.approved },
          { id: 'active', label: 'Active Borrowing', count: counts.active },
          { id: 'returned', label: 'Returned History', count: counts.returned }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-[#BF6B2E] text-[#BF6B2E] font-bold'
                : 'border-transparent text-stone-600 hover:text-[#6F4E37]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-[#BF6B2E] text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List / Empty State */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D8C3A5] p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F7E7CE] text-[#6F4E37] flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#6F4E37]">
            {activeTab === 'all'
              ? "You haven't made any booking requests yet."
              : `No ${activeTab} reservations found.`}
          </h3>
          <p className="text-xs text-[#50453e] font-inter">
            Browse our campus catalog of high-precision tools, computers, and spaces available for shared booking.
          </p>
          <button
            onClick={onExplore}
            className="px-4 py-2 rounded-lg text-xs font-semibold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors"
          >
            Explore Resources
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(b => {
            const startD = new Date(b.start_at);
            const endD = new Date(b.end_at);
            const isPendingOrApproved = b.status === 'pending' || b.status === 'approved';
            const isCheckedOut = b.status === 'checked_out' || b.status === 'return_pending';

            return (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-[#D8C3A5] p-5 shadow-xs hover:border-[#6F4E37] transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={b.resource_image}
                      alt={b.resource_title}
                      className="w-14 h-14 rounded-lg object-cover border border-[#D8C3A5] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider font-inter">
                          {b.resource_category}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-[11px] text-stone-500 font-inter font-mono">
                          Ref #{b.id.substring(b.id.length - 6)}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#34251F] mt-0.5">
                        {b.resource_title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#50453e] font-inter mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#6F4E37]" />
                        <span>{b.location_label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                    <StatusBadge status={b.status} />
                    <span className="text-[11px] text-stone-400 font-inter">
                      Requested {new Date(b.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FFFAF2] p-3 rounded-lg border border-[#D8C3A5]/60 text-xs font-inter">
                  <div>
                    <span className="text-stone-500 block">Scheduled Window:</span>
                    <span className="font-semibold text-[#34251F]">
                      {startD.toLocaleDateString()} ({startD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {endD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Project Purpose:</span>
                    <span className="font-semibold text-[#34251F] truncate block">
                      {b.purpose}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Borrower / Team:</span>
                    <span className="font-semibold text-[#34251F]">
                      {b.requester_name} ({b.requester_department})
                    </span>
                  </div>
                </div>

                {/* Owner Decision Note if present */}
                {b.decision_reason && (
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs font-inter text-stone-700">
                    <span className="font-bold text-[#6F4E37]">Decision Note from {b.decision_by || 'Owner'}:</span>{' '}
                    <span>{b.decision_reason}</span>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs font-inter">
                  <div className="flex items-center gap-2">
                    {isCheckedOut && (
                      <span className="inline-flex items-center gap-1 text-[#BF6B2E] font-medium bg-[#F7E7CE] px-2.5 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Currently Checked Out</span>
                      </span>
                    )}
                    {b.status === 'returned' && (
                      <span className="inline-flex items-center gap-1 text-[#4f5745] font-medium bg-[#879078]/15 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#879078]" />
                        <span>Returned in verified condition</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Star Rating Action for Returned Bookings */}
                    {b.status === 'returned' && (
                      b.reviewed ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#BF6B2E] bg-[#F7E7CE] px-3 py-1.5 rounded-lg border border-[#D8C3A5]">
                          <Star className="w-3.5 h-3.5 fill-[#BF6B2E] text-[#BF6B2E]" />
                          <span>Rated {b.rating ? `${b.rating}★` : 'Reviewed'}</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onOpenReviewModal?.(b)}
                          className="px-3 py-1.5 rounded-lg bg-[#BF6B2E] text-white hover:bg-[#a35922] font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                          title="Share operational feedback and rate equipment"
                        >
                          <Star className="w-3.5 h-3.5 fill-white text-white" />
                          <span>Rate Equipment</span>
                        </button>
                      )
                    )}

                    {/* Handover Inspection Button */}
                    {(b.status === 'approved' || isCheckedOut || b.status === 'returned') && (
                      <button
                        onClick={() => onNavigateToHandover(b.id)}
                        className="px-3 py-1.5 rounded-lg border border-[#6F4E37] text-[#6F4E37] hover:bg-[#F7E7CE] font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>
                          {b.status === 'approved'
                            ? 'Proceed to Pickup Handover'
                            : isCheckedOut
                            ? 'Complete Return Verification'
                            : 'View Handover Certificate'}
                        </span>
                      </button>
                    )}

                    {/* Incident Reporting */}
                    {(isCheckedOut || b.status === 'returned') && (
                      <button
                        onClick={() => onReportIncident(b.id, b.resource_id)}
                        className="px-3 py-1.5 rounded-lg border border-[#A94438] text-[#A94438] hover:bg-[#A94438]/10 font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Report Issue</span>
                      </button>
                    )}

                    {/* Cancel booking if pending */}
                    {isPendingOrApproved && (
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this booking request?')) {
                            onCancelBooking(b.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-stone-500 hover:text-[#A94438] hover:bg-red-50 transition-colors"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
