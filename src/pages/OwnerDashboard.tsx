import React, { useState, useMemo } from 'react';
import { Booking, ResourceItem, UserProfile } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { MetricCard } from '../components/common/MetricCard';
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
  Search
} from 'lucide-react';

interface OwnerDashboardProps {
  resources: ResourceItem[];
  bookings: Booking[];
  currentProfile: UserProfile;
  onApproveBooking: (bookingId: string, note?: string) => void;
  onRejectBooking: (bookingId: string, reason: string) => void;
  onNavigateToHandover: (bookingId: string) => void;
  onAddResource: () => void;
  onEditResource: (resource: ResourceItem) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  resources,
  bookings,
  currentProfile,
  onApproveBooking,
  onRejectBooking,
  onNavigateToHandover,
  onAddResource,
  onEditResource
}) => {
  const [rejectModalBookingId, setRejectModalBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approveNote, setApproveNote] = useState('');
  const [approveModalBookingId, setApproveModalBookingId] = useState<string | null>(null);

  // Filter resources owned by current user (or all if admin/manager)
  const myResources = useMemo(() => {
    if (currentProfile.role === 'admin' || currentProfile.role === 'manager') {
      return resources;
    }
    return resources.filter(r => r.owner_id === currentProfile.id);
  }, [resources, currentProfile]);

  const myResourceIds = useMemo(() => new Set(myResources.map(r => r.id)), [myResources]);

  // Bookings for resources managed by this owner
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8C3A5] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
            // CUSTODIAN CONTROL ROOM
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34251F] mt-1">
            Resource Custodian Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#50453e] mt-1 font-inter">
            Manage incoming reservation queues, verify handovers, and maintain high equipment reliability.
          </p>
        </div>

        <button
          onClick={onAddResource}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Resource</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          label="My Active Listings"
          value={myResources.length}
          subtitle="Equipments & spaces managed"
          icon={<Layers className="w-5 h-5" />}
        />
        <MetricCard
          label="Pending Queue"
          value={pendingRequests.length}
          subtitle="Awaiting custodian approval"
          isPositive={pendingRequests.length === 0}
          trendText={pendingRequests.length > 0 ? 'Action Required' : 'All Clear'}
          icon={<Clock className="w-5 h-5 text-[#BF6B2E]" />}
        />
        <MetricCard
          label="Currently Borrowed"
          value={activeLoans.length}
          subtitle="Assets in active custody"
          icon={<ArrowRightLeft className="w-5 h-5 text-[#6F4E37]" />}
        />
        <MetricCard
          label="Returns Completed"
          value={completedReturns.length}
          subtitle="Successfully audited returns"
          icon={<CheckCircle2 className="w-5 h-5 text-[#879078]" />}
        />
      </div>

      {/* Section 1: Pending Requests Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#34251F] flex items-center gap-2">
              <span>Pending Reservation Queue</span>
              {pendingRequests.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#A94438] text-white">
                  {pendingRequests.length}
                </span>
              )}
            </h2>
            <p className="text-xs text-[#50453e] font-inter">
              Review borrower identity, safety qualifications, and slot validity before approving.
            </p>
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#D8C3A5] p-8 text-center max-w-lg mx-auto space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#879078] mx-auto" />
            <h3 className="text-sm font-bold text-[#6F4E37]">No pending booking requests</h3>
            <p className="text-xs text-stone-500 font-inter">
              All reservation requests for your listed assets have been reviewed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map(req => {
              const start = new Date(req.start_at);
              const end = new Date(req.end_at);

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-xl border-2 border-[#BF6B2E]/40 p-5 shadow-xs hover:border-[#BF6B2E] transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={req.resource_image}
                        alt={req.resource_title}
                        className="w-16 h-16 rounded-lg object-cover border border-[#D8C3A5] shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider font-inter">
                            {req.resource_category}
                          </span>
                          <span className="text-stone-300">•</span>
                          <span className="text-[11px] text-stone-500 font-inter font-mono">
                            Request #{req.id.substring(req.id.length - 6)}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#34251F]">
                          {req.resource_title}
                        </h3>
                        <div className="text-xs text-[#50453e] font-inter">
                          Requested for:{' '}
                          <span className="font-semibold text-[#34251F]">
                            {start.toLocaleDateString()} at {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setApproveModalBookingId(req.id);
                          setApproveNote('Approved for stated research session.');
                        }}
                        className="px-4 py-2 rounded-lg text-xs font-semibold font-inter bg-[#879078] text-white hover:bg-[#6e7760] transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Request</span>
                      </button>

                      <button
                        onClick={() => {
                          setRejectModalBookingId(req.id);
                          setRejectReason('Scheduling conflict with maintenance window');
                        }}
                        className="px-3 py-2 rounded-lg text-xs font-semibold font-inter border border-[#A94438] text-[#A94438] hover:bg-red-50 transition-colors flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>

                  {/* Requester & Purpose Context Box */}
                  <div className="bg-[#FFFAF2] rounded-lg border border-[#D8C3A5]/60 p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-inter">
                    <div>
                      <span className="text-stone-500 block">Borrower / Requester:</span>
                      <div className="font-bold text-[#34251F] flex items-center gap-1 mt-0.5">
                        <User className="w-3.5 h-3.5 text-[#6F4E37]" />
                        <span>{req.requester_name}</span>
                      </div>
                      <span className="text-[11px] text-stone-500">{req.requester_department}</span>
                    </div>

                    <div>
                      <span className="text-stone-500 block">Project Purpose:</span>
                      <p className="font-medium text-[#34251F] mt-0.5 line-clamp-2">
                        {req.purpose}
                      </p>
                    </div>

                    <div>
                      <span className="text-stone-500 block">Eligibility & Attestation:</span>
                      <div className="flex items-center gap-1 mt-0.5 text-[#4f5745] font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#879078]" />
                        <span>Safety Checklist Confirmed</span>
                      </div>
                      <span className="text-[11px] text-stone-500">{req.num_users} designated operator(s)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Active Borrowings & Handover Management */}
      <div className="space-y-4 pt-6 border-t border-[#D8C3A5]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#34251F]">
              Handover & Return Inspections
            </h2>
            <p className="text-xs text-[#50453e] font-inter">
              Assets currently approved or out on loan requiring physical condition sign-off.
            </p>
          </div>
        </div>

        {relevantBookings.filter(b => ['approved', 'checked_out', 'return_pending'].includes(b.status)).length === 0 ? (
          <div className="bg-white rounded-xl border border-[#D8C3A5] p-6 text-center text-xs text-stone-500 font-inter">
            No active handovers or pending returns right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relevantBookings
              .filter(b => ['approved', 'checked_out', 'return_pending'].includes(b.status))
              .map(b => (
                <div
                  key={b.id}
                  className="bg-white rounded-xl border border-[#D8C3A5] p-4 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1 text-xs font-inter">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={b.status} size="sm" />
                      <span className="text-[11px] text-stone-400 font-mono">#{b.id.substring(b.id.length - 5)}</span>
                    </div>
                    <div className="font-bold text-[#34251F] text-sm">{b.resource_title}</div>
                    <div className="text-stone-500">Borrower: {b.requester_name}</div>
                  </div>

                  <button
                    onClick={() => onNavigateToHandover(b.id)}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold font-inter bg-[#6F4E37] text-white hover:bg-[#553722] transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>
                      {b.status === 'approved' ? 'Record Check-In' : 'Verify Return'}
                    </span>
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Section 3: My Listed Resources */}
      <div className="space-y-4 pt-6 border-t border-[#D8C3A5]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#34251F]">
              My Listed Equipment & Spaces ({myResources.length})
            </h2>
            <p className="text-xs text-[#50453e] font-inter">
              Update descriptions, availability hours, and maintenance status.
            </p>
          </div>

          <button
            onClick={onAddResource}
            className="text-xs font-semibold font-inter text-[#BF6B2E] hover:underline"
          >
            + Add Another Resource
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myResources.map(r => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-[#D8C3A5] overflow-hidden shadow-xs hover:border-[#6F4E37] transition-all flex flex-col justify-between"
            >
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#BF6B2E] uppercase tracking-wider font-inter">
                    {r.category}
                  </span>
                  <StatusBadge status={r.status} size="sm" />
                </div>
                <h3 className="text-sm font-bold text-[#34251F] line-clamp-1">
                  {r.title}
                </h3>
                <p className="text-xs text-[#50453e] font-inter line-clamp-2">
                  {r.description}
                </p>
                <div className="text-[11px] text-stone-500 font-inter pt-1">
                  📍 {r.location_label} • Max {r.max_duration_hours}h
                </div>
              </div>

              <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs font-inter">
                <button
                  onClick={() => onEditResource(r)}
                  className="font-semibold text-[#6F4E37] hover:underline"
                >
                  Edit Specifications
                </button>
                <span className="text-[11px] text-stone-400">
                  {r.requires_approval ? 'Approval Required' : 'Instant Book'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalBookingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D8C3A5] space-y-4">
            <h3 className="text-base font-bold text-[#34251F]">
              Decline Booking Request
            </h3>
            <p className="text-xs text-stone-600 font-inter">
              Please provide a clear reason to the requester (e.g. routine maintenance, missing specific material, priority research slot).
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="State reason for declining..."
              className="w-full p-3 text-xs rounded-lg border border-[#D8C3A5] font-inter"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalBookingId(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#A94438] hover:bg-red-700 rounded-lg"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModalBookingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D8C3A5] space-y-4">
            <h3 className="text-base font-bold text-[#34251F]">
              Approve Booking Request
            </h3>
            <p className="text-xs text-stone-600 font-inter">
              Add optional pickup instructions or lab access notes for the borrower.
            </p>
            <textarea
              rows={3}
              value={approveNote}
              onChange={e => setApproveNote(e.target.value)}
              placeholder="e.g. Please bring eye protection and sign in on clipboard at Room 204."
              className="w-full p-3 text-xs rounded-lg border border-[#D8C3A5] font-inter"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setApproveModalBookingId(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#879078] hover:bg-[#6e7760] rounded-lg"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
