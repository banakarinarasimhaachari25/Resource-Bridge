import React, { useState, useMemo } from 'react';
import {
  Zap,
  X,
  AlertTriangle,
  LifeBuoy,
  CalendarClock,
  Compass,
  Star,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  Send,
  User,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Check
} from 'lucide-react';
import { Booking, IncidentType, ResourceItem, UserProfile } from '../../types';
import { db } from '../../services/db';
import {
  getQuickActionsForRole,
  calculateReturnScheduleSummary,
  validateSupportTicket
} from '../../utils/quickActions';

interface QuickActionsFloatingMenuProps {
  currentProfile: UserProfile;
  bookings: Booking[];
  resources: ResourceItem[];
  onNavigateToHandover?: (bookingId: string) => void;
  onExplore?: () => void;
  onOpenReviewModal?: (booking: Booking) => void;
  onAddResource?: () => void;
  onSelectTab?: (tab: any) => void;
  onStateChange?: () => void;
}

export const QuickActionsFloatingMenu: React.FC<QuickActionsFloatingMenuProps> = ({
  currentProfile,
  bookings,
  resources,
  onNavigateToHandover,
  onExplore,
  onOpenReviewModal,
  onAddResource,
  onSelectTab,
  onStateChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // In-context modal states
  const [activeModal, setActiveModal] = useState<
    'none' | 'incident' | 'support' | 'return_schedule'
  >('none');

  // Incident form state
  const [selectedIncidentBookingId, setSelectedIncidentBookingId] = useState<string>('');
  const [selectedIncidentResourceId, setSelectedIncidentResourceId] = useState<string>('');
  const [incidentType, setIncidentType] = useState<IncidentType>('malfunction');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentSuccessMessage, setIncidentSuccessMessage] = useState<string | null>(null);
  const [incidentSubmitting, setIncidentSubmitting] = useState(false);

  // Support form state
  const [supportCategory, setSupportCategory] = useState('Technical Operating Help');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportUrgency, setSupportUrgency] = useState<'routine' | 'urgent' | 'emergency'>('urgent');
  const [supportResourceId, setSupportResourceId] = useState('');
  const [supportSuccessMessage, setSupportSuccessMessage] = useState<string | null>(null);
  const [supportSubmitting, setSupportSubmitting] = useState(false);

  const isCustodian =
    currentProfile.role === 'owner' ||
    currentProfile.role === 'manager' ||
    currentProfile.role === 'admin';

  // Active loans for borrower or custodian
  const activeBookings = useMemo(() => {
    if (isCustodian) {
      const myResourceIds = new Set(
        resources.filter(r => r.owner_id === currentProfile.id).map(r => r.id)
      );
      return bookings.filter(
        b =>
          (b.status === 'checked_out' || b.status === 'return_pending') &&
          myResourceIds.has(b.resource_id)
      );
    }
    return bookings.filter(
      b =>
        (b.status === 'checked_out' || b.status === 'return_pending') &&
        b.requester_id === currentProfile.id
    );
  }, [bookings, resources, isCustodian, currentProfile]);

  const pendingApprovalsCount = useMemo(() => {
    if (!isCustodian) return 0;
    const myResourceIds = new Set(
      resources.filter(r => r.owner_id === currentProfile.id).map(r => r.id)
    );
    return bookings.filter(b => b.status === 'pending' && myResourceIds.has(b.resource_id)).length;
  }, [bookings, resources, isCustodian, currentProfile]);

  const unreviewedBookings = useMemo(() => {
    return bookings.filter(
      b => b.status === 'returned' && !b.reviewed && b.requester_id === currentProfile.id
    );
  }, [bookings, currentProfile]);

  // Quick actions list for this role
  const quickActions = useMemo(() => {
    return getQuickActionsForRole(currentProfile.role, {
      activeLoansCount: activeBookings.length,
      pendingApprovalsCount,
      unreviewedCount: unreviewedBookings.length
    });
  }, [currentProfile.role, activeBookings.length, pendingApprovalsCount, unreviewedBookings.length]);

  const handleActionClick = (actionId: string) => {
    setIsOpen(false);
    if (actionId === 'report_incident') {
      // Default to first active booking if available
      if (activeBookings.length > 0) {
        setSelectedIncidentBookingId(activeBookings[0].id);
        setSelectedIncidentResourceId(activeBookings[0].resource_id);
      } else if (bookings.length > 0) {
        setSelectedIncidentBookingId(bookings[0].id);
        setSelectedIncidentResourceId(bookings[0].resource_id);
      } else if (resources.length > 0) {
        setSelectedIncidentResourceId(resources[0].id);
      }
      setIncidentSuccessMessage(null);
      setActiveModal('incident');
    } else if (actionId === 'request_support') {
      setSupportSuccessMessage(null);
      setActiveModal('support');
    } else if (actionId === 'check_return_schedule') {
      setActiveModal('return_schedule');
    } else if (actionId === 'browse_equipment' && onExplore) {
      onExplore();
    } else if (actionId === 'review_booking' && unreviewedBookings.length > 0 && onOpenReviewModal) {
      onOpenReviewModal(unreviewedBookings[0]);
    } else if (actionId === 'approval_queue' && onSelectTab) {
      onSelectTab('queue');
    } else if (actionId === 'add_equipment' && onAddResource) {
      onAddResource();
    }
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentDescription.trim()) return;

    setIncidentSubmitting(true);
    const booking = bookings.find(b => b.id === selectedIncidentBookingId);
    const resourceId = selectedIncidentResourceId || booking?.resource_id || resources[0]?.id || 'res-gen';

    const res = db.reportIncident({
      booking_id: selectedIncidentBookingId || 'manual-entry',
      resource_id: resourceId,
      type: incidentType,
      description: incidentDescription.trim()
    });

    setIncidentSubmitting(false);

    if (res.success && res.incident) {
      setIncidentSuccessMessage(
        `Incident ${res.incident.id} logged successfully in the Master Audit Log.`
      );
      if (onStateChange) onStateChange();
      setTimeout(() => {
        setActiveModal('none');
        setIncidentDescription('');
        setIncidentSuccessMessage(null);
      }, 2200);
    }
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateSupportTicket({
      category: supportCategory,
      subject: supportSubject,
      message: supportMessage,
      urgency: supportUrgency
    });

    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setSupportSubmitting(true);
    const res = db.sendSupportTicket({
      category: supportCategory,
      subject: supportSubject.trim(),
      message: supportMessage.trim(),
      urgency: supportUrgency,
      related_resource_id: supportResourceId || undefined
    });

    setSupportSubmitting(false);

    if (res.success) {
      setSupportSuccessMessage(
        `Support ticket #${res.ticketId} dispatched to on-call lab supervisors.`
      );
      if (onStateChange) onStateChange();
      setTimeout(() => {
        setActiveModal('none');
        setSupportSubject('');
        setSupportMessage('');
        setSupportSuccessMessage(null);
      }, 2200);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) Anchor */}
      <div className="fixed bottom-6 right-6 z-40 select-none font-sans">
        {/* Expanded Quick Action Sheet Card */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 mb-3 w-80 sm:w-96 bg-white rounded-2xl border border-[#D8C3A5] shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#D8C3A5]/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F7E7CE] text-[#6F4E37] flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4 text-[#BF6B2E]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#34251F]">
                    Dashboard Quick Actions
                  </h3>
                  <p className="text-[10px] text-stone-500 font-inter">
                    Direct access without leaving your dashboard
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-1.5 font-inter">
              {quickActions.map(action => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleActionClick(action.id)}
                  className="w-full text-left p-2.5 rounded-xl border border-transparent hover:border-[#D8C3A5] hover:bg-[#FFFAF2] transition-all flex items-start gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-stone-100 group-hover:bg-[#F7E7CE] text-[#6F4E37] transition-colors mt-0.5">
                    {action.id === 'report_incident' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                    {action.id === 'request_support' && <LifeBuoy className="w-4 h-4 text-blue-600" />}
                    {action.id === 'check_return_schedule' && <CalendarClock className="w-4 h-4 text-emerald-600" />}
                    {action.id === 'browse_equipment' && <Compass className="w-4 h-4 text-[#BF6B2E]" />}
                    {action.id === 'review_booking' && <Star className="w-4 h-4 text-amber-500" />}
                    {action.id === 'approval_queue' && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                    {action.id === 'add_equipment' && <Plus className="w-4 h-4 text-purple-600" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#34251F] group-hover:text-[#6F4E37]">
                        {action.title}
                      </span>
                      {action.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                            action.badgeColor || 'bg-stone-100 text-stone-600 border-stone-200'
                          }`}
                        >
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5 leading-tight">
                      {action.subtitle}
                    </p>
                  </div>

                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#BF6B2E] transition-colors mt-2" />
                </button>
              ))}
            </div>

            {/* In-Dashboard Context Reassurance */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500 font-inter">
              <span>Keeps current dashboard view active</span>
              <span className="font-semibold text-[#BF6B2E]">Apex University Core</span>
            </div>
          </div>
        )}

        {/* Primary FAB Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-full text-xs font-bold shadow-xl transition-all border-2 ${
            isOpen
              ? 'bg-[#34251F] text-white border-stone-400 rotate-0'
              : 'bg-[#6F4E37] text-white border-[#D8C3A5] hover:bg-[#583e2c] hover:shadow-2xl'
          }`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="relative">
            {isOpen ? (
              <X className="w-4 h-4 text-stone-200 transition-transform rotate-90" />
            ) : (
              <Zap className="w-4 h-4 text-[#F7E7CE] animate-pulse" />
            )}
            {activeBookings.length > 0 && !isOpen && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#BF6B2E] ring-2 ring-white" />
            )}
          </div>
          <span className="tracking-tight">Quick Actions</span>
          {activeBookings.length > 0 && !isOpen && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#F7E7CE] text-[#6F4E37]">
              {activeBookings.length} Active
            </span>
          )}
        </button>
      </div>

      {/* MODAL 1: In-Context Incident Report Modal */}
      {activeModal === 'incident' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#D8C3A5] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#D8C3A5]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#34251F]">Report Lab / Equipment Incident</h3>
                  <p className="text-[11px] text-stone-500 font-inter">
                    Directly log malfunction or safety hazard without leaving dashboard
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {incidentSuccessMessage ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-[#34251F]">Incident Logged Successfully</div>
                <p className="text-xs text-stone-600 font-inter">{incidentSuccessMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleIncidentSubmit} className="space-y-4 font-inter text-xs">
                {/* Equipment / Booking Selector */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-600 text-[10px] mb-1">
                    Related Equipment / Booking
                  </label>
                  <select
                    value={selectedIncidentBookingId || selectedIncidentResourceId}
                    onChange={e => {
                      const val = e.target.value;
                      const matchedBooking = bookings.find(b => b.id === val);
                      if (matchedBooking) {
                        setSelectedIncidentBookingId(matchedBooking.id);
                        setSelectedIncidentResourceId(matchedBooking.resource_id);
                      } else {
                        setSelectedIncidentBookingId('');
                        setSelectedIncidentResourceId(val);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D8C3A5] bg-[#FFFAF2] text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#BF6B2E]/30 focus:border-[#BF6B2E]"
                  >
                    {activeBookings.length > 0 && (
                      <optgroup label="Active In Possession">
                        {activeBookings.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.resource_title} (Checked out: #{b.id})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="General Equipment Fleet">
                      {resources.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.title} ({r.building}, Room {r.room})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Incident Type Grid */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-600 text-[10px] mb-1">
                    Incident Classification
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'malfunction', label: 'Hardware Malfunction' },
                      { key: 'damage', label: 'Physical Damage' },
                      { key: 'safety_hazard', label: 'Safety / Environmental' },
                      { key: 'missing_accessory', label: 'Missing Cable / Kit' }
                    ].map(item => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setIncidentType(item.key as IncidentType)}
                        className={`p-2 rounded-xl text-left font-semibold text-xs border transition-colors ${
                          incidentType === item.key
                            ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description Textarea */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-600 text-[10px] mb-1">
                    Incident Details &amp; Immediate Risk
                  </label>
                  <textarea
                    rows={3}
                    value={incidentDescription}
                    onChange={e => setIncidentDescription(e.target.value)}
                    required
                    placeholder="Describe error codes, physical condition, smoke/spark, or missing items..."
                    className="w-full px-3 py-2 rounded-xl border border-[#D8C3A5] bg-[#FFFAF2] text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#BF6B2E]/30 focus:border-[#BF6B2E]"
                  />
                </div>

                {/* Immediate Safety Advice */}
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-0.5">
                  <div className="font-bold flex items-center gap-1 text-amber-800">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Immediate Safety Protocol:</span>
                  </div>
                  <p>
                    If active smoke, electrical short, or chemical spill is observed, hit the emergency cutoff switch and evacuate the station.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-1 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setActiveModal('none')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={incidentSubmitting}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#A94438] text-white hover:bg-[#8e372e] transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{incidentSubmitting ? 'Logging...' : 'Submit Incident Report'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: In-Context Request Support Modal */}
      {activeModal === 'support' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#D8C3A5] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#D8C3A5]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
                  <LifeBuoy className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#34251F]">Request Facility &amp; Lab Support</h3>
                  <p className="text-[11px] text-stone-500 font-inter">
                    Direct help desk assistance without leaving your dashboard
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {supportSuccessMessage ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-[#34251F]">Support Ticket Dispatched</div>
                <p className="text-xs text-stone-600 font-inter">{supportSuccessMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-4 font-inter text-xs">
                {/* Category & Urgency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-stone-600 text-[10px] mb-1">
                      Support Category
                    </label>
                    <select
                      value={supportCategory}
                      onChange={e => setSupportCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8C3A5] bg-[#FFFAF2] text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#BF6B2E]/30"
                    >
                      <option value="Technical Operating Help">Technical Operating Help</option>
                      <option value="Facility Access & Card Keys">Facility Access &amp; Card Keys</option>
                      <option value="Consumables & Powder Refills">Consumables &amp; Powder Refills</option>
                      <option value="Equipment Calibration Assistance">Calibration Assistance</option>
                      <option value="Billing & Grant Allocation">Billing &amp; Grant Allocation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-stone-600 text-[10px] mb-1">
                      Urgency Level
                    </label>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      {[
                        { key: 'routine', label: 'Routine' },
                        { key: 'urgent', label: 'Urgent' },
                        { key: 'emergency', label: 'Emergency' }
                      ].map(u => (
                        <button
                          key={u.key}
                          type="button"
                          onClick={() => setSupportUrgency(u.key as any)}
                          className={`py-1.5 text-center rounded-lg text-[10px] font-bold border transition-colors ${
                            supportUrgency === u.key
                              ? u.key === 'emergency'
                                ? 'bg-red-600 text-white border-red-700'
                                : 'bg-[#BF6B2E] text-white border-[#BF6B2E]'
                              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {u.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-600 text-[10px] mb-1">
                    Subject Summary
                  </label>
                  <input
                    type="text"
                    value={supportSubject}
                    onChange={e => setSupportSubject(e.target.value)}
                    required
                    placeholder="e.g. Sifter hood not drawing air in Fuse Sift station"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8C3A5] bg-[#FFFAF2] text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#BF6B2E]/30"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-600 text-[10px] mb-1">
                    Detailed Message
                  </label>
                  <textarea
                    rows={3}
                    value={supportMessage}
                    onChange={e => setSupportMessage(e.target.value)}
                    required
                    placeholder="Provide context, room location, and error messages to help lab staff assist you promptly..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8C3A5] bg-[#FFFAF2] text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#BF6B2E]/30"
                  />
                </div>

                {/* Related Resource (Optional) */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-stone-600 text-[10px] mb-1">
                    Associated Asset (Optional)
                  </label>
                  <select
                    value={supportResourceId}
                    onChange={e => setSupportResourceId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8C3A5] bg-[#FFFAF2] text-stone-900"
                  >
                    <option value="">General Facility Inquiry</option>
                    {resources.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.building}, Room {r.room})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setActiveModal('none')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={supportSubmitting}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6F4E37] text-white hover:bg-[#583e2c] transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{supportSubmitting ? 'Dispatching...' : 'Dispatch Support Ticket'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: In-Context Return Schedule Modal */}
      {activeModal === 'return_schedule' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-[#D8C3A5] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#D8C3A5]/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                  <CalendarClock className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#34251F]">
                    {isCustodian ? 'Incoming Equipment Returns Schedule' : 'My Active Return Schedule & Deadlines'}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-inter">
                    Live return countdowns, drop-off rooms, and inspection checklists
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of active loans */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1 font-inter">
              {activeBookings.length === 0 ? (
                <div className="p-8 text-center bg-[#FFFAF2] border border-[#D8C3A5] rounded-xl space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <div className="font-bold text-sm text-[#34251F]">
                    {isCustodian ? 'No Equipment Scheduled for Return Today' : 'No Overdue or Active Equipment Loans'}
                  </div>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    {isCustodian
                      ? 'All checked-out laboratory gear is currently within authorized borrowing windows.'
                      : 'You do not have any equipment in hand requiring return at this time.'}
                  </p>
                </div>
              ) : (
                activeBookings.map(b => {
                  const summary = calculateReturnScheduleSummary(b, currentProfile.role);
                  return (
                    <div
                      key={b.id}
                      className="p-4 rounded-xl border border-[#D8C3A5] bg-[#FFFAF2] space-y-3 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={summary.resourceImage}
                            alt={summary.resourceTitle}
                            className="w-10 h-10 rounded-lg object-cover border border-[#D8C3A5]"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-[#34251F]">
                              {summary.resourceTitle}
                            </h4>
                            <div className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#BF6B2E]" />
                              <span>{summary.locationLabel}</span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border self-start sm:self-auto ${summary.urgencyColor}`}
                        >
                          {summary.urgencyLabel}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-stone-600">
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">Due Date</span>
                          <span className="font-semibold text-stone-800">{summary.dueDate}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">Due Time</span>
                          <span className="font-semibold text-stone-800">{summary.dueTime}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">
                            {isCustodian ? 'Borrower' : 'Lab Custodian'}
                          </span>
                          <span className="font-semibold text-stone-800 truncate block">
                            {summary.counterpartName}
                          </span>
                        </div>
                      </div>

                      {onNavigateToHandover && (
                        <div className="pt-2 border-t border-stone-200/60 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveModal('none');
                              onNavigateToHandover(b.id);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors"
                          >
                            <span>Open Return Checklist &amp; Handover</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200"
              >
                Close Return Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
