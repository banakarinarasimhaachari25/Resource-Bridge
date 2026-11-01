import React, { useState, useMemo } from 'react';
import { Booking, CheckinRecord, CheckoutRecord, ItemCondition, UserProfile } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Stepper } from '../components/common/Stepper';
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Camera,
  FileCheck,
  User,
  ArrowRight,
  Sparkles,
  Star
} from 'lucide-react';

interface HandoverPageProps {
  bookings: Booking[];
  currentProfile: UserProfile;
  initialBookingId?: string | null;
  getHandoverRecords: (bookingId: string) => {
    checkin?: CheckinRecord;
    checkout?: CheckoutRecord;
  };
  onRecordCheckin: (params: {
    booking_id: string;
    condition: ItemCondition;
    accessories_issued: string[];
    notes: string;
    photo_refs?: string[];
  }) => { success: boolean; error?: string };
  onRecordReturn: (params: {
    booking_id: string;
    condition: ItemCondition;
    accessories_returned: string[];
    notes: string;
    photo_refs?: string[];
    requiresReview?: boolean;
  }) => { success: boolean; error?: string };
  onOpenReviewModal?: (booking: Booking) => void;
}

export const HandoverPage: React.FC<HandoverPageProps> = ({
  bookings,
  currentProfile,
  initialBookingId,
  getHandoverRecords,
  onRecordCheckin,
  onRecordReturn,
  onOpenReviewModal
}) => {
  // Handover-relevant bookings (approved, checked_out, return_pending, returned)
  const handoverBookings = useMemo(() => {
    return bookings.filter(b =>
      ['approved', 'checked_out', 'return_pending', 'returned', 'review_required'].includes(b.status)
    );
  }, [bookings]);

  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    initialBookingId || (handoverBookings.length > 0 ? handoverBookings[0].id : '')
  );

  const selectedBooking = useMemo(() => {
    return bookings.find(b => b.id === selectedBookingId);
  }, [bookings, selectedBookingId]);

  const { checkin, checkout } = useMemo(() => {
    if (!selectedBookingId) return { checkin: undefined, checkout: undefined };
    return getHandoverRecords(selectedBookingId);
  }, [selectedBookingId, getHandoverRecords, bookings]);

  // Form states for Checkin (Collection)
  const [initialCondition, setInitialCondition] = useState<ItemCondition>('excellent');
  const [accessoriesIssuedText, setAccessoriesIssuedText] = useState('Power cable, Operator safety goggles, Calibration manual');
  const [checkinNotes, setCheckinNotes] = useState('Apparatus inspected before handover. Clean optical/mechanical surfaces.');

  // Form states for Checkout (Return)
  const [finalCondition, setFinalCondition] = useState<ItemCondition>('excellent');
  const [accessoriesReturnedText, setAccessoriesReturnedText] = useState('Power cable, Operator safety goggles, Calibration manual');
  const [checkoutNotes, setCheckoutNotes] = useState('Equipment returned in complete working order. All accessory cables verified.');
  const [flagForReview, setFlagForReview] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Stepper calculations
  const stepperSteps = [
    { id: '1', label: 'Reservation Approved', description: 'Custodian approved booking' },
    { id: '2', label: 'Collection Handover', description: 'Condition logged & checked out' },
    { id: '3', label: 'Active Research', description: 'Equipment in custody' },
    { id: '4', label: 'Return Verified', description: 'Formal inspection completed' }
  ];

  const currentStepIndex = useMemo(() => {
    if (!selectedBooking) return 0;
    if (selectedBooking.status === 'approved') return 1;
    if (selectedBooking.status === 'checked_out' || selectedBooking.status === 'return_pending') return 2;
    if (selectedBooking.status === 'returned' || selectedBooking.status === 'review_required') return 3;
    return 0;
  }, [selectedBooking]);

  const handleExecuteCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    const accs = accessoriesIssuedText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const res = onRecordCheckin({
      booking_id: selectedBooking.id,
      condition: initialCondition,
      accessories_issued: accs,
      notes: checkinNotes
    });

    if (res.success) {
      setStatusMessage('Resource checked out successfully! Handover timestamp recorded.');
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      alert(res.error || 'Failed to record check-in.');
    }
  };

  const handleExecuteReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    const accs = accessoriesReturnedText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const res = onRecordReturn({
      booking_id: selectedBooking.id,
      condition: finalCondition,
      accessories_returned: accs,
      notes: checkoutNotes,
      requiresReview: flagForReview || finalCondition === 'damaged'
    });

    if (res.success) {
      setStatusMessage('Resource return verified and logged to audit ledger.');
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      alert(res.error || 'Failed to record return.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-[#D8C3A5] pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
          // ACCOUNTABILITY & CHAIN OF CUSTODY
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#34251F] mt-1">
          Handover & Return Verification
        </h1>
        <p className="text-xs sm:text-sm text-[#50453e] mt-1 font-inter">
          Dual-stage condition verification log ensuring transparent physical custody and equipment maintenance records.
        </p>
      </div>

      {/* Booking Selector Bar */}
      <div className="bg-white rounded-xl border border-[#D8C3A5] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#F7E7CE] text-[#6F4E37]">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6F4E37] font-inter">
              Select Booking Lifecycle Event
            </label>
            <select
              value={selectedBookingId}
              onChange={e => setSelectedBookingId(e.target.value)}
              className="mt-0.5 px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F] font-inter focus:outline-none focus:border-[#6F4E37]"
            >
              {handoverBookings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.resource_title} — {b.requester_name} ({b.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedBooking && (
          <div className="flex items-center gap-3">
            <StatusBadge status={selectedBooking.status} />
            <span className="text-xs text-stone-500 font-inter">
              Ref #{selectedBooking.id.substring(selectedBooking.id.length - 6)}
            </span>
          </div>
        )}
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-[#879078]/20 border border-[#879078] text-[#4f5745] text-xs sm:text-sm font-inter flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#879078] shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {selectedBooking ? (
        <div className="space-y-8">
          {/* Stepper Display */}
          <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs">
            <Stepper steps={stepperSteps} currentStepIndex={currentStepIndex} />
          </div>

          {/* Side-by-Side Condition Comparison View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Stage 1: Collection Handover (Check-in) */}
            <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-5 relative">
              <div className="flex items-center justify-between border-b border-[#D8C3A5] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#6F4E37] text-white text-xs font-bold flex items-center justify-center font-inter">
                    1
                  </span>
                  <h3 className="text-base font-bold text-[#6F4E37]">
                    Initial Handover (Pickup)
                  </h3>
                </div>
                {checkin ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#879078] bg-[#879078]/15 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </span>
                ) : (
                  <span className="text-xs text-[#BF6B2E] font-semibold">
                    {selectedBooking.status === 'approved' ? 'Awaiting Handover' : 'Pending'}
                  </span>
                )}
              </div>

              {checkin ? (
                /* Completed Check-in Record Display */
                <div className="space-y-4 text-xs font-inter">
                  <div className="bg-[#FFFAF2] p-4 rounded-xl border border-[#D8C3A5] space-y-2">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Initial Condition:</span>
                      <span className="font-bold capitalize text-[#6F4E37] bg-white px-2 py-0.5 rounded border border-[#D8C3A5]">
                        {checkin.initial_condition}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Handed Over By:</span>
                      <span className="font-semibold text-[#34251F]">{checkin.checked_in_by_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Timestamp:</span>
                      <span className="font-semibold text-[#34251F]">
                        {new Date(checkin.checked_in_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-stone-600 block mb-1">
                      Accessories Issued:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {checkin.accessories_issued.map((acc, i) => (
                        <span key={i} className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[11px] border border-stone-200">
                          ✓ {acc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-stone-600 block mb-1">Custodian Notes:</span>
                    <p className="p-3 bg-stone-50 rounded-lg text-stone-600 italic">
                      "{checkin.notes}"
                    </p>
                  </div>
                </div>
              ) : selectedBooking.status === 'approved' ? (
                /* Execute Check-in Form */
                <form onSubmit={handleExecuteCheckin} className="space-y-4 text-xs font-inter">
                  <p className="text-stone-500 leading-relaxed">
                    Verify borrower identity and record baseline condition before releasing equipment custody.
                  </p>

                  <div>
                    <label className="block font-semibold text-[#6F4E37] uppercase tracking-wider text-[11px] mb-1">
                      Initial Condition Assessment *
                    </label>
                    <select
                      value={initialCondition}
                      onChange={e => setInitialCondition(e.target.value as ItemCondition)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F] font-inter font-semibold"
                    >
                      <option value="excellent">Excellent — Pristine factory/calibrated state</option>
                      <option value="good">Good — Minor cosmetic wear, 100% operational</option>
                      <option value="fair">Fair — Functional with noted minor blemishes</option>
                      <option value="damaged">Damaged — Needs repair</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#6F4E37] uppercase tracking-wider text-[11px] mb-1">
                      Accessories Issued (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={accessoriesIssuedText}
                      onChange={e => setAccessoriesIssuedText(e.target.value)}
                      placeholder="e.g. Probes, Power cable, Case"
                      className="w-full px-3 py-2 rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F] font-inter"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#6F4E37] uppercase tracking-wider text-[11px] mb-1">
                      Handover Inspection Notes
                    </label>
                    <textarea
                      rows={2}
                      value={checkinNotes}
                      onChange={e => setCheckinNotes(e.target.value)}
                      placeholder="Add notes on physical state, battery levels..."
                      className="w-full p-2.5 rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] font-inter"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl text-xs font-semibold font-inter bg-[#6F4E37] text-white hover:bg-[#553722] transition-colors shadow-xs"
                  >
                    Confirm Handover & Release (Check Out)
                  </button>
                </form>
              ) : (
                <div className="text-center py-8 text-stone-400 text-xs font-inter">
                  Waiting for booking approval before handover can take place.
                </div>
              )}
            </div>

            {/* Stage 2: Return Verification (Checkout) */}
            <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-5 relative">
              <div className="flex items-center justify-between border-b border-[#D8C3A5] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#BF6B2E] text-white text-xs font-bold flex items-center justify-center font-inter">
                    2
                  </span>
                  <h3 className="text-base font-bold text-[#BF6B2E]">
                    Return Verification & Sign-off
                  </h3>
                </div>
                {checkout ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#879078] bg-[#879078]/15 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Returned</span>
                  </span>
                ) : (
                  <span className="text-xs text-stone-400 font-semibold">
                    {selectedBooking.status === 'checked_out' ? 'In Custody' : 'Pending Return'}
                  </span>
                )}
              </div>

              {checkout ? (
                /* Completed Return Record Display */
                <div className="space-y-4 text-xs font-inter">
                  <div className="bg-[#FFFAF2] p-4 rounded-xl border border-[#D8C3A5] space-y-2">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Final Condition:</span>
                      <span className="font-bold capitalize text-[#4f5745] bg-white px-2 py-0.5 rounded border border-[#D8C3A5]">
                        {checkout.final_condition}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Verified By Custodian:</span>
                      <span className="font-semibold text-[#34251F]">{checkout.return_confirmed_by}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Return Timestamp:</span>
                      <span className="font-semibold text-[#34251F]">
                        {new Date(checkout.return_confirmed_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-stone-600 block mb-1">
                      Accessories Accounted For:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {checkout.accessories_returned.map((acc, i) => (
                        <span key={i} className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[11px] border border-stone-200">
                          ✓ {acc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-stone-600 block mb-1">Final Inspection Notes:</span>
                    <p className="p-3 bg-stone-50 rounded-lg text-stone-600 italic">
                      "{checkout.notes}"
                    </p>
                  </div>

                  {/* Rating Prompt / Feedback */}
                  {selectedBooking && (
                    <div className="pt-3 border-t border-stone-200">
                      {selectedBooking.reviewed ? (
                        <div className="flex items-center justify-between p-3 bg-[#FFFAF2] rounded-xl border border-[#D8C3A5]">
                          <div className="flex items-center gap-2 text-xs font-inter text-[#6F4E37]">
                            <Star className="w-4 h-4 fill-[#BF6B2E] text-[#BF6B2E]" />
                            <span>You rated this equipment <strong>{selectedBooking.rating}★</strong></span>
                          </div>
                          <span className="text-[11px] text-[#4f5745] font-semibold">Review Attached</span>
                        </div>
                      ) : onOpenReviewModal ? (
                        <div className="p-3 bg-[#FFFAF2] rounded-xl border border-[#BF6B2E]/40 flex items-center justify-between gap-3 text-xs font-inter">
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#34251F] block">Return Complete — Rate Equipment</span>
                            <span className="text-stone-500">Share your rating to help other researchers.</span>
                          </div>
                          <button
                            onClick={() => onOpenReviewModal(selectedBooking)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#BF6B2E] text-white hover:bg-[#a35922] font-semibold transition-colors flex items-center gap-1.5 shrink-0"
                          >
                            <Star className="w-3.5 h-3.5 fill-white text-white" />
                            <span>Rate Equipment</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : selectedBooking.status === 'checked_out' || selectedBooking.status === 'return_pending' ? (
                /* Execute Return Form */
                <form onSubmit={handleExecuteReturn} className="space-y-4 text-xs font-inter">
                  <p className="text-stone-500 leading-relaxed">
                    Compare return condition against initial handover notes. Ensure all accessories are accounted for.
                  </p>

                  <div>
                    <label className="block font-semibold text-[#BF6B2E] uppercase tracking-wider text-[11px] mb-1">
                      Final Condition on Return *
                    </label>
                    <select
                      value={finalCondition}
                      onChange={e => setFinalCondition(e.target.value as ItemCondition)}
                      className="w-full px-3 py-2 rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F] font-inter font-semibold"
                    >
                      <option value="excellent">Excellent — No wear, pristine working order</option>
                      <option value="good">Good — Operational as expected</option>
                      <option value="fair">Fair — Mild wear</option>
                      <option value="damaged">Damaged / Missing Parts — Action required</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#BF6B2E] uppercase tracking-wider text-[11px] mb-1">
                      Accessories Returned (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={accessoriesReturnedText}
                      onChange={e => setAccessoriesReturnedText(e.target.value)}
                      placeholder="e.g. Probes, Power cable, Case"
                      className="w-full px-3 py-2 rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F] font-inter"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#BF6B2E] uppercase tracking-wider text-[11px] mb-1">
                      Return Inspection Notes
                    </label>
                    <textarea
                      rows={2}
                      value={checkoutNotes}
                      onChange={e => setCheckoutNotes(e.target.value)}
                      placeholder="Confirm cleanliness, calibration, and zero abnormalities..."
                      className="w-full p-2.5 rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] font-inter"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-stone-700">
                    <input
                      type="checkbox"
                      checked={flagForReview}
                      onChange={e => setFlagForReview(e.target.checked)}
                      className="w-4 h-4 text-[#A94438] rounded border-[#D8C3A5]"
                    />
                    <span>Flag for Manager Review (if minor issue or delayed return)</span>
                  </label>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl text-xs font-semibold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors shadow-xs"
                  >
                    Confirm Return & Close Booking
                  </button>
                </form>
              ) : (
                <div className="text-center py-8 text-stone-400 text-xs font-inter">
                  Equipment has not yet been checked out to the borrower.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-stone-400 text-xs font-inter">
          No bookings eligible for handover currently.
        </div>
      )}
    </div>
  );
};
