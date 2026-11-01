import React, { useState } from 'react';
import { Booking, IncidentReport, IncidentStatus, IncidentType, ResourceItem, UserProfile } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  ShieldAlert,
  FileText,
  User,
  Filter
} from 'lucide-react';

interface IncidentReportsProps {
  incidents: IncidentReport[];
  resources: ResourceItem[];
  bookings: Booking[];
  currentProfile: UserProfile;
  initialBookingId?: string | null;
  onReportIncident: (params: {
    booking_id: string;
    resource_id: string;
    type: IncidentType;
    description: string;
  }) => { success: boolean; error?: string };
  onResolveIncident: (incidentId: string, resolutionNote: string) => void;
}

export const IncidentReports: React.FC<IncidentReportsProps> = ({
  incidents,
  resources,
  bookings,
  currentProfile,
  initialBookingId,
  onReportIncident,
  onResolveIncident
}) => {
  const [showReportModal, setShowReportModal] = useState(Boolean(initialBookingId));
  const [selectedBookingId, setSelectedBookingId] = useState(initialBookingId || (bookings[0]?.id || ''));
  const [incidentType, setIncidentType] = useState<IncidentType>('damage');
  const [description, setDescription] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [resolveModalId, setResolveModalId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const canManageIncidents =
    currentProfile.role === 'owner' ||
    currentProfile.role === 'manager' ||
    currentProfile.role === 'admin';

  const filteredIncidents = incidents.filter(i => {
    if (filterStatus === 'all') return true;
    return i.status === filterStatus;
  });

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please describe what occurred.');
      return;
    }

    const b = bookings.find(book => book.id === selectedBookingId);
    const resourceId = b ? b.resource_id : (resources[0]?.id || 'res-gen');

    const res = onReportIncident({
      booking_id: selectedBookingId,
      resource_id: resourceId,
      type: incidentType,
      description: description.trim()
    });

    if (res.success) {
      setShowReportModal(false);
      setDescription('');
    } else {
      alert(res.error || 'Failed to submit incident report.');
    }
  };

  const handleConfirmResolve = () => {
    if (!resolveModalId || !resolutionNote.trim()) {
      alert('Please provide a resolution summary note.');
      return;
    }
    onResolveIncident(resolveModalId, resolutionNote.trim());
    setResolveModalId(null);
    setResolutionNote('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8C3A5] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#A94438] font-inter">
            // SAFETY & QUALITY INTEGRITY
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34251F] mt-1">
            Incident & Discrepancy Tracking
          </h1>
          <p className="text-xs sm:text-sm text-[#50453e] mt-1 font-inter">
            Transparent reporting for equipment damage, missing accessories, schedule conflicts, or safety flags.
          </p>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold font-inter bg-[#A94438] text-white hover:bg-red-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Incident</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D8C3A5] overflow-x-auto pb-px text-xs font-inter">
        {['all', 'open', 'resolved'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2.5 font-medium border-b-2 capitalize transition-colors ${
              filterStatus === status
                ? 'border-[#A94438] text-[#A94438] font-bold'
                : 'border-transparent text-stone-600 hover:text-[#6F4E37]'
            }`}
          >
            {status} Incidents ({incidents.filter(i => status === 'all' || i.status === status).length})
          </button>
        ))}
      </div>

      {/* Incidents List */}
      {filteredIncidents.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#D8C3A5] p-12 text-center max-w-md mx-auto space-y-3">
          <CheckCircle2 className="w-10 h-10 text-[#879078] mx-auto" />
          <h3 className="text-sm font-bold text-[#6F4E37]">No incidents recorded</h3>
          <p className="text-xs text-stone-500 font-inter">
            All equipment handovers and returns are currently in good standing.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map(inc => (
            <div
              key={inc.id}
              className="bg-white rounded-xl border border-[#D8C3A5] p-5 shadow-xs hover:border-[#6F4E37] transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#A94438]/15 text-[#A94438]">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#6F4E37] uppercase font-inter tracking-wider">
                        {inc.type.replace('_', ' ')}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="text-[11px] text-stone-400 font-inter">
                        Reported {new Date(inc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#34251F]">
                      {inc.resource_title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={inc.status} />
                  {canManageIncidents && inc.status !== 'resolved' && (
                    <button
                      onClick={() => setResolveModalId(inc.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold font-inter bg-[#879078] text-white hover:bg-[#6e7760] transition-colors"
                    >
                      Resolve Incident
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs font-inter text-[#34251F] leading-relaxed bg-[#FFFAF2] p-3 rounded-lg border border-[#D8C3A5]/60">
                <span className="font-semibold text-stone-600 block mb-0.5">
                  Report by {inc.reported_by_name} ({inc.reported_by_role}):
                </span>
                <p className="italic">"{inc.description}"</p>
              </div>

              {inc.resolution_note && (
                <div className="p-3 bg-[#879078]/10 border border-[#879078]/30 rounded-lg text-xs font-inter text-[#4f5745]">
                  <span className="font-bold block mb-0.5">
                    Resolution by {inc.assigned_to || 'Custodian'} on{' '}
                    {inc.resolved_at ? new Date(inc.resolved_at).toLocaleDateString() : 'recently'}:
                  </span>
                  <p>{inc.resolution_note}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Incident Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#D8C3A5] space-y-4">
            <h3 className="text-base font-bold text-[#34251F]">
              Submit Incident or Safety Report
            </h3>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs font-inter">
              <div>
                <label className="block font-semibold text-[#6F4E37] uppercase tracking-wider text-[11px] mb-1">
                  Related Booking / Equipment *
                </label>
                <select
                  value={selectedBookingId}
                  onChange={e => setSelectedBookingId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F]"
                >
                  {bookings.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.resource_title} (Borrower: {b.requester_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#6F4E37] uppercase tracking-wider text-[11px] mb-1">
                  Incident Category *
                </label>
                <select
                  value={incidentType}
                  onChange={e => setIncidentType(e.target.value as IncidentType)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F]"
                >
                  <option value="damage">Physical or Component Damage</option>
                  <option value="missing_accessory">Missing Accessory / Cable / Tooling</option>
                  <option value="late_return">Late Return Past Window</option>
                  <option value="scheduling_conflict">Physical Access / Room Conflict</option>
                  <option value="safety_concern">Safety Protocol Non-Compliance</option>
                  <option value="other">Other Operational Issue</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#6F4E37] uppercase tracking-wider text-[11px] mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detail observations, what happened, serial numbers, or immediate actions taken..."
                  required
                  className="w-full p-2.5 rounded-lg border border-[#D8C3A5] bg-[#FFFAF2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-[#A94438] hover:bg-red-700 rounded-lg shadow-xs"
                >
                  Submit Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModalId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D8C3A5] space-y-4">
            <h3 className="text-base font-bold text-[#34251F]">
              Resolve Incident
            </h3>
            <p className="text-xs text-stone-600 font-inter">
              Record repair details, replacement parts, or policy follow-up.
            </p>
            <textarea
              rows={3}
              value={resolutionNote}
              onChange={e => setResolutionNote(e.target.value)}
              placeholder="e.g. Optical lens replaced from spares cache. Equipment tested and calibrated."
              className="w-full p-3 text-xs rounded-lg border border-[#D8C3A5] font-inter"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setResolveModalId(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolve}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#879078] hover:bg-[#6e7760] rounded-lg"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
