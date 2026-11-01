import React, { useState, useMemo } from 'react';
import { Booking, ResourceItem, UserProfile } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Check,
  X,
  Plus,
  Clock,
  Layers,
  ArrowRightLeft,
  Calendar,
  AlertTriangle,
  User,
  ShieldCheck,
  Building,
  CheckCircle2,
  FileCheck,
  Search,
  DollarSign,
  Edit3,
  Star
} from 'lucide-react';
import { DashboardHeaderNav } from '../components/dashboard/DashboardHeaderNav';
import { DashboardType } from '../utils/auth';

interface CustodianDashboardProps {
  resources: ResourceItem[];
  bookings: Booking[];
  currentProfile: UserProfile;
  onApproveBooking: (bookingId: string, note?: string) => void;
  onRejectBooking: (bookingId: string, reason: string) => void;
  onNavigateToHandover: (bookingId: string) => void;
  onAddResource: () => void;
  onEditResource: (resource: ResourceItem) => void;
  onSelectResource?: (resource: ResourceItem) => void;
  onNavigateDashboard?: (target: DashboardType) => void;
  onAuthenticateAndSwitch?: (profile: UserProfile, target: DashboardType) => void;
}

export const CustodianDashboard: React.FC<CustodianDashboardProps> = ({
  resources,
  bookings,
  currentProfile,
  onApproveBooking,
  onRejectBooking,
  onNavigateToHandover,
  onAddResource,
  onEditResource,
  onSelectResource,
  onNavigateDashboard,
  onAuthenticateAndSwitch
}) => {
  const [rejectModalBookingId, setRejectModalBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approveNote, setApproveNote] = useState('');
  const [approveModalBookingId, setApproveModalBookingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'inventory' | 'handover_log'>('queue');

  // Filter resources owned by current user (or all if admin/manager)
  const myResources = useMemo(() => {
    if (currentProfile.role === 'admin' || currentProfile.role === 'manager') {
      return resources;
    }
    return resources.filter(r => r.owner_id === currentProfile.id);
  }, [resources, currentProfile]);

  const myResourceIds = useMemo(() => new Set(myResources.map(r => r.id)), [myResources]);

  // Bookings for resources managed by this custodian
  const relevantBookings = useMemo(() => {
    return bookings.filter(b => myResourceIds.has(b.resource_id));
  }, [bookings, myResourceIds]);

  const pendingRequests = useMemo(() => {
    return relevantBookings.filter(b => b.status === 'pending');
  }, [relevantBookings]);

  const activeLoans = useMemo(() => {
    return relevantBookings.filter(b => b.status === 'checked_out' || b.status === 'return_pending');
  }, [relevantBookings]);

  const completedReturns = useMemo(() => {
    return relevantBookings.filter(b => b.status === 'returned');
  }, [relevantBookings]);

  const handleConfirmReject = () => {
    if (!rejectModalBookingId) return;
    if (!rejectReason.trim()) {
      alert('Please provide a reason for declining the reservation request.');
      return;
    }
    onRejectBooking(rejectModalBookingId, rejectReason.trim());
    setRejectModalBookingId(null);
    setRejectReason('');
  };

  const handleConfirmApprove = () => {
    if (!approveModalBookingId) return;
    onApproveBooking(approveModalBookingId, approveNote.trim() || undefined);
    setApproveModalBookingId(null);
    setApproveNote('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Separated Dashboards Hub */}
      <DashboardHeaderNav
        currentDashboard="custodian_dashboard"
        currentProfile={currentProfile}
        onNavigateDashboard={onNavigateDashboard || (() => {})}
        onAuthenticateAndSwitch={onAuthenticateAndSwitch || (() => {})}
        borrowerActiveCount={bookings.filter(b => b.status === 'checked_out' || b.status === 'return_pending').length}
        custodianPendingCount={pendingRequests.length}
        totalAssetsCount={resources.length}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8C3A5] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6F4E37] font-inter">
            <span className="w-2 h-2 rounded-full bg-[#6F4E37]" />
            <span>Custodian &amp; Lab Management Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34251F] mt-1">
            Equipment Custody &amp; Approval Queue
          </h1>
          <p className="text-xs sm:text-sm text-[#50453e] mt-1 font-inter">
            Authorize researcher bookings, supervise equipment condition, and publish new campus assets.
          </p>
        </div>

        <button
          onClick={onAddResource}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold font-inter bg-[#6F4E37] text-white hover:bg-[#553722] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Equipment Listing</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#D8C3A5] p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 font-inter uppercase tracking-wider">
            Pending Queue
          </div>
          <div className="text-2xl font-bold text-[#BF6B2E] mt-1">
            {pendingRequests.length}
          </div>
          <div className="text-[11px] text-stone-500 font-inter mt-1">
            Requires your authorization
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D8C3A5] p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 font-inter uppercase tracking-wider">
            Currently Loaned Out
          </div>
          <div className="text-2xl font-bold text-[#879078] mt-1">
            {activeLoans.length}
          </div>
          <div className="text-[11px] text-stone-500 font-inter mt-1">
            Active in campus labs
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D8C3A5] p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 font-inter uppercase tracking-wider">
            Total Custody Assets
          </div>
          <div className="text-2xl font-bold text-[#34251F] mt-1">
            {myResources.length}
          </div>
          <div className="text-[11px] text-stone-500 font-inter mt-1">
            Active &amp; published
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D8C3A5] p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 font-inter uppercase tracking-wider">
            Successful Handovers
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {completedReturns.length}
          </div>
          <div className="text-[11px] text-stone-500 font-inter mt-1">
            Fully returned &amp; verified
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D8C3A5] font-inter text-xs">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2.5 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'border-[#6F4E37] text-[#6F4E37] font-bold'
              : 'border-transparent text-stone-600 hover:text-[#6F4E37]'
          }`}
        >
          <span>Pending Approvals</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === 'queue' ? 'bg-[#6F4E37] text-white' : 'bg-stone-100 text-stone-600'
            }`}
          >
            {pendingRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'border-[#6F4E37] text-[#6F4E37] font-bold'
              : 'border-transparent text-stone-600 hover:text-[#6F4E37]'
          }`}
        >
          <span>Managed Inventory</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === 'inventory' ? 'bg-[#6F4E37] text-white' : 'bg-stone-100 text-stone-600'
            }`}
          >
            {myResources.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('handover_log')}
          className={`px-4 py-2.5 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'handover_log'
              ? 'border-[#6F4E37] text-[#6F4E37] font-bold'
              : 'border-transparent text-stone-600 hover:text-[#6F4E37]'
          }`}
        >
          <span>Active &amp; Past Handovers</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === 'handover_log' ? 'bg-[#6F4E37] text-white' : 'bg-stone-100 text-stone-600'
            }`}
          >
            {activeLoans.length + completedReturns.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Pending Approvals Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#D8C3A5] p-12 text-center max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#879078]/20 text-[#879078] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#34251F]">Queue Is All Clear!</h3>
              <p className="text-xs text-[#50453e] font-inter">
                No reservation requests are waiting for authorization on your equipment.
              </p>
            </div>
          ) : (
            pendingRequests.map(booking => {
              const start = new Date(booking.start_at);
              const end = new Date(booking.end_at);
              const resource = resources.find(r => r.id === booking.resource_id);

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-[#D8C3A5] p-5 shadow-xs flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
                        {booking.resource_category}
                      </span>
                      <StatusBadge status={booking.status} size="sm" />
                    </div>

                    <h3 className="text-base font-bold text-[#34251F]">
                      {booking.resource_title}
                    </h3>

                    {resource && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-inter font-semibold text-[#6F4E37] bg-[#F7E7CE] px-2 py-0.5 rounded-md">
                        <DollarSign className="w-3 h-3" />
                        <span>Billing: {resource.cost_label}</span>
                      </div>
                    )}

                    <div className="text-xs text-[#50453e] font-inter">
                      <strong>Requester:</strong> {booking.requester_name} ({booking.requester_department}) • {booking.requester_email}
                    </div>

                    <div className="text-xs text-stone-600 font-inter bg-[#FFFAF2] p-2.5 rounded-lg border border-[#D8C3A5]/60">
                      <strong>Stated Purpose:</strong> {booking.purpose}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#50453e] font-inter pt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#6F4E37]" />
                        <span>{start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#6F4E37]" />
                        <span>
                          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                          {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                    <button
                      onClick={() => setRejectModalBookingId(booking.id)}
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold font-inter border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => setApproveModalBookingId(booking.id)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold font-inter bg-[#879078] text-white hover:bg-[#6c7460] transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Booking</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Managed Inventory */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myResources.map(resource => (
            <div
              key={resource.id}
              className="bg-white rounded-xl border border-[#D8C3A5] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-stone-100">
                  <img
                    src={resource.image_url}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={resource.status} size="sm" />
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#BF6B2E] uppercase tracking-wider font-inter">
                    <span>{resource.category}</span>
                    <span className="flex items-center gap-1 text-amber-600">
                      <Star className="w-3 h-3 fill-current" />
                      {resource.average_rating || 5.0} ({resource.total_reviews || 0})
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#34251F] line-clamp-1">
                    {resource.title}
                  </h3>

                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#879078]/15 text-[#4f5745] font-bold text-xs font-inter">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>{resource.cost_label}</span>
                  </div>

                  <p className="text-xs text-[#50453e] font-inter line-clamp-2">
                    {resource.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-2 border-t border-[#D8C3A5]/60 flex items-center justify-between">
                <button
                  onClick={() => onEditResource(resource)}
                  className="inline-flex items-center gap-1 text-xs font-semibold font-inter text-[#6F4E37] hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details &amp; Rates</span>
                </button>

                {onSelectResource && (
                  <button
                    onClick={() => onSelectResource(resource)}
                    className="text-xs text-stone-500 hover:text-stone-800 font-inter"
                  >
                    View Public Page
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Active & Past Handovers */}
      {activeTab === 'handover_log' && (
        <div className="space-y-4">
          {[...activeLoans, ...completedReturns].length === 0 ? (
            <div className="bg-white rounded-xl border border-[#D8C3A5] p-10 text-center text-xs text-stone-500 font-inter">
              No handover records found.
            </div>
          ) : (
            [...activeLoans, ...completedReturns].map(b => (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-[#D8C3A5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#34251F]">{b.resource_title}</span>
                    <StatusBadge status={b.status} size="sm" />
                  </div>
                  <div className="text-xs text-stone-500 font-inter mt-1">
                    Borrower: <strong>{b.requester_name}</strong> ({b.requester_department}) • Slot: {new Date(b.start_at).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToHandover(b.id)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold font-inter bg-[#F7E7CE] text-[#6F4E37] border border-[#D8C3A5] hover:bg-[#6F4E37] hover:text-white transition-all self-start sm:self-auto"
                >
                  Open Handover &amp; Return Console
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Approve Modal */}
      {approveModalBookingId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-[#6F4E37]">Authorize Reservation</h3>
            <p className="text-xs text-[#50453e] font-inter">
              Confirm safety eligibility and reservation time window. You can optionally add collection instructions.
            </p>
            <textarea
              value={approveNote}
              onChange={e => setApproveNote(e.target.value)}
              placeholder="e.g. Please collect the badge key from Room 204 safety desk before 13:00."
              className="w-full p-3 rounded-lg border border-[#D8C3A5] text-xs font-inter focus:outline-none focus:border-[#6F4E37] h-24"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setApproveModalBookingId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-inter border border-[#D8C3A5]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-4 py-2 rounded-lg text-xs font-semibold font-inter bg-[#879078] text-white hover:bg-[#6c7460]"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalBookingId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-red-700">Decline Reservation</h3>
            <p className="text-xs text-[#50453e] font-inter">
              Please state why this request cannot be approved (e.g., conflicting scheduled maintenance or missing prerequisite certification).
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for declining..."
              className="w-full p-3 rounded-lg border border-[#D8C3A5] text-xs font-inter focus:outline-none focus:border-[#6F4E37] h-24"
              required
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalBookingId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-inter border border-[#D8C3A5]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg text-xs font-semibold font-inter bg-red-700 text-white hover:bg-red-800"
              >
                Decline Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
