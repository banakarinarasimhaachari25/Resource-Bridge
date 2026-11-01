import React, { useState, useMemo } from 'react';
import { Booking, ResourceItem, UserProfile } from '../types';
import { validateBookingSlot } from '../utils/rules';
import {
  Calendar,
  Clock,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  ArrowLeft,
  MapPin,
  Building,
  Info,
  Sparkles
} from 'lucide-react';

interface BookingRequestProps {
  resource: ResourceItem;
  currentProfile: UserProfile;
  existingBookings: Booking[];
  onSubmitBooking: (bookingData: {
    resource_id: string;
    start_at: string;
    end_at: string;
    purpose: string;
    num_users: number;
    training_confirmed: boolean;
    rules_agreed: boolean;
  }) => { success: boolean; error?: string };
  onCancel: () => void;
  onSuccess: () => void;
}

export const BookingRequest: React.FC<BookingRequestProps> = ({
  resource,
  currentProfile,
  existingBookings,
  onSubmitBooking,
  onCancel,
  onSuccess
}) => {
  // Default to tomorrow 10:00 to 13:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [dateStr, setDateStr] = useState(defaultDateStr);
  const [startTimeStr, setStartTimeStr] = useState('10:00');
  const [endTimeStr, setEndTimeStr] = useState('13:00');
  const [purpose, setPurpose] = useState('');
  const [numUsers, setNumUsers] = useState(1);
  const [trainingConfirmed, setTrainingConfirmed] = useState(false);
  const [rulesAgreed, setRulesAgreed] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Compute ISO timestamps
  const { startISO, endISO, durationHours } = useMemo(() => {
    try {
      const s = new Date(`${dateStr}T${startTimeStr}:00`);
      const e = new Date(`${dateStr}T${endTimeStr}:00`);
      const diffHrs = (e.getTime() - s.getTime()) / (1000 * 60 * 60);
      return {
        startISO: s.toISOString(),
        endISO: e.toISOString(),
        durationHours: diffHrs > 0 ? diffHrs : 0
      };
    } catch {
      return { startISO: '', endISO: '', durationHours: 0 };
    }
  }, [dateStr, startTimeStr, endTimeStr]);

  // Real-time conflict validation
  const validation = useMemo(() => {
    if (!startISO || !endISO) return { valid: false, reason: 'Invalid dates.' };
    return validateBookingSlot(
      existingBookings,
      resource.id,
      startISO,
      endISO,
      resource.max_duration_hours
    );
  }, [existingBookings, resource, startISO, endISO]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!purpose.trim()) {
      setSubmissionError('Please describe the intended project purpose or experiment.');
      return;
    }

    if (!rulesAgreed) {
      setSubmissionError('You must agree to the equipment safety and usage rules.');
      return;
    }

    if (!validation.valid) {
      setSubmissionError(validation.reason || 'Invalid booking slot.');
      return;
    }

    const res = onSubmitBooking({
      resource_id: resource.id,
      start_at: startISO,
      end_at: endISO,
      purpose: purpose.trim(),
      num_users: Number(numUsers) || 1,
      training_confirmed: trainingConfirmed,
      rules_agreed: rulesAgreed
    });

    if (res.success) {
      setSubmittedSuccess(true);
    } else {
      setSubmissionError(res.error || 'Failed to submit booking request.');
    }
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#879078]/20 text-[#4f5745] flex items-center justify-center mx-auto border-2 border-[#879078]">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#34251F]">
            Booking Request Submitted Successfully!
          </h2>
          <p className="text-xs sm:text-sm text-[#50453e] font-inter max-w-md mx-auto leading-relaxed">
            Your request for <strong className="text-[#6F4E37]">{resource.title}</strong> has been transmitted to custodian <span className="font-semibold text-[#34251F]">{resource.owner_name}</span>. Initial status: <span className="font-bold text-[#BF6B2E]">Pending Approval</span>.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#D8C3A5] p-4 text-xs font-inter text-left max-w-sm mx-auto space-y-2">
          <div className="flex justify-between">
            <span className="text-stone-500">Date:</span>
            <span className="font-semibold">{new Date(startISO).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Time Slot:</span>
            <span className="font-semibold">{startTimeStr} – {endTimeStr} ({durationHours} hrs)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Location:</span>
            <span className="font-semibold truncate">{resource.location_label}</span>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={onSuccess}
            className="px-6 py-2.5 rounded-lg text-xs font-semibold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors shadow-xs"
          >
            View in My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-xs font-semibold font-inter text-[#6F4E37] hover:text-[#BF6B2E] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Cancel & Return</span>
      </button>

      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
          // SCHEDULE RESERVATION
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#34251F] mt-1">
          Request Resource Booking
        </h1>
        <p className="text-xs sm:text-sm text-[#50453e] mt-1 font-inter">
          Reserve your verified slot with real-time conflict protection and safety rule attestation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                Reservation Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="date"
                  value={dateStr}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setDateStr(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] focus:outline-none focus:border-[#6F4E37] font-inter"
                />
              </div>
            </div>

            {/* Time slot row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                  Start Time *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="time"
                    value={startTimeStr}
                    onChange={e => setStartTimeStr(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] focus:outline-none focus:border-[#6F4E37] font-inter"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                  End Time *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="time"
                    value={endTimeStr}
                    onChange={e => setEndTimeStr(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] focus:outline-none focus:border-[#6F4E37] font-inter"
                  />
                </div>
              </div>
            </div>

            {/* Live slot status alert */}
            {validation.valid ? (
              <div className="p-3 rounded-lg bg-[#879078]/15 border border-[#879078]/30 flex items-center gap-2 text-xs text-[#4f5745] font-inter">
                <CheckCircle2 className="w-4 h-4 text-[#879078] shrink-0" />
                <span>
                  Slot Available: {durationHours.toFixed(1)} hrs reservation (within {resource.max_duration_hours}h limit).
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-[#A94438]/15 border border-[#A94438]/30 flex items-center gap-2 text-xs text-[#A94438] font-inter">
                <AlertOctagon className="w-4 h-4 text-[#A94438] shrink-0" />
                <span>{validation.reason}</span>
              </div>
            )}

            {/* Purpose */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                Purpose / Research Project *
              </label>
              <textarea
                rows={3}
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder="State project details, materials to be used, and research scope..."
                required
                className="w-full p-3 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] focus:outline-none focus:border-[#6F4E37] font-inter"
              />
            </div>

            {/* Number of users */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F4E37] font-inter mb-1.5">
                Number of Operators / Collaborators
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={numUsers}
                onChange={e => setNumUsers(parseInt(e.target.value) || 1)}
                className="w-32 px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] font-inter"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-3 border-t border-[#D8C3A5] text-xs font-inter">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trainingConfirmed}
                  onChange={e => setTrainingConfirmed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-[#BF6B2E] border-[#D8C3A5] focus:ring-[#BF6B2E]"
                />
                <span className="text-[#34251F]">
                  I confirm that I have reviewed the operation manual and hold the prerequisite qualifications for this equipment.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rulesAgreed}
                  onChange={e => setRulesAgreed(e.target.checked)}
                  required
                  className="w-4 h-4 mt-0.5 rounded text-[#BF6B2E] border-[#D8C3A5] focus:ring-[#BF6B2E]"
                />
                <span className="text-[#34251F]">
                  I agree to adhere to all laboratory safety protocols and assume custodial responsibility until formal return inspection. *
                </span>
              </label>
            </div>

            {/* Submission Error Banner */}
            {submissionError && (
              <div className="p-3 rounded-lg bg-[#A94438]/15 border border-[#A94438]/30 text-xs font-inter text-[#A94438]">
                {submissionError}
              </div>
            )}

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!validation.valid || !rulesAgreed}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Booking Request
              </button>
            </div>
          </form>
        </div>

        {/* Right Summary Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#6F4E37] font-inter border-b border-[#D8C3A5] pb-2">
              Resource Summary
            </div>

            <div className="flex items-center gap-3">
              <img
                src={resource.image_url}
                alt={resource.title}
                className="w-16 h-16 rounded-lg object-cover border border-[#D8C3A5]"
              />
              <div className="text-xs font-inter">
                <div className="font-bold text-[#34251F] line-clamp-1">{resource.title}</div>
                <div className="text-stone-500">{resource.category}</div>
                <div className="text-[11px] text-[#BF6B2E] font-medium">{resource.location_label}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 space-y-2 text-xs font-inter">
              <div className="flex justify-between text-stone-600">
                <span>Borrower:</span>
                <span className="font-semibold text-[#34251F]">{currentProfile.display_name}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Department:</span>
                <span className="font-semibold text-[#34251F]">{currentProfile.department}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Approval Policy:</span>
                <span className="font-semibold text-[#6F4E37]">
                  {resource.requires_approval ? 'Manual Custodian Review' : 'Auto-Confirmed'}
                </span>
              </div>
              <div className="flex justify-between text-stone-600 pt-2 border-t border-stone-100">
                <span>Cost / Rate:</span>
                <span className="font-bold text-emerald-800">{resource.cost_label}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Estimated Charge ({durationHours} hrs):</span>
                <span className="font-extrabold text-[#34251F]">
                  {(resource.cost_per_hour || 0) === 0
                    ? '$0.00 (Grant Covered)'
                    : `$${(durationHours * resource.cost_per_hour).toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#F7E7CE] rounded-2xl border border-[#D8C3A5] p-5 text-xs font-inter text-[#6F4E37] space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <Info className="w-4 h-4 text-[#BF6B2E]" />
              <span>Anti-Monopolization Policy</span>
            </div>
            <p className="text-[11px] text-[#50453e] leading-relaxed">
              To guarantee fair distribution, consecutive bookings for the same apparatus by a single research team are restricted to {resource.max_duration_hours} consecutive hours during peak daylight windows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
