import React from 'react';
import {
  BookOpen,
  ShieldCheck,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Users
} from 'lucide-react';

export const GuidelinesPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#D8C3A5] pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
          // COMMUNITY COMPLIANCE & SAFETY
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#34251F] mt-1">
          Usage Guidelines & Governance Rules
        </h1>
        <p className="text-xs sm:text-sm text-[#50453e] mt-1 font-inter">
          Established protocols for cross-laboratory equipment sharing, custody handovers, and accountability.
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm font-inter text-[#34251F]">
        {/* Section 1 */}
        <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#6F4E37] font-bold text-base font-sans">
            <Clock className="w-5 h-5 text-[#BF6B2E]" />
            <h2>1. Fair Access and Reservation Windows</h2>
          </div>
          <ul className="list-disc list-inside space-y-2 text-[#50453e] leading-relaxed">
            <li>
              <strong>Duration Caps:</strong> To avoid monopolization, bookings are limited to the maximum consecutive duration specified on each listing (typically 4–8 hours).
            </li>
            <li>
              <strong>Punctuality:</strong> If equipment is not picked up within 30 minutes of the reserved start time without prior custodian notice, the slot may be offered to the waitlist queue.
            </li>
            <li>
              <strong>Cancellation:</strong> Requesters may cancel unfulfilled bookings up to 2 hours before the scheduled start without penalty.
            </li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#6F4E37] font-bold text-base font-sans">
            <ShieldCheck className="w-5 h-5 text-[#879078]" />
            <h2>2. Safety Accreditations & Prerequisites</h2>
          </div>
          <p className="text-[#50453e] leading-relaxed">
            Specialized machinery (e.g. Class 3/4 laser sintering, high-voltage oscilloscopes, heavy CNC tooling) requires verified campus safety certifications. Operators must have completed required departmental onboarding before reservations are approved.
          </p>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#6F4E37] font-bold text-base font-sans">
            <RotateCcw className="w-5 h-5 text-[#6F4E37]" />
            <h2>3. Dual-Stage Handover Verification</h2>
          </div>
          <p className="text-[#50453e] leading-relaxed">
            All physical handovers require a two-part digital audit check:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-[#FFFAF2] border border-[#D8C3A5]">
              <span className="font-bold text-[#6F4E37] block mb-1">Check-In (Pickup)</span>
              <span className="text-xs text-stone-600">
                Baseline condition, included cables/tooling, and serial numbers verified and logged into the audit ledger.
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FFFAF2] border border-[#D8C3A5]">
              <span className="font-bold text-[#BF6B2E] block mb-1">Return (Inspection)</span>
              <span className="text-xs text-stone-600">
                Apparatus tested and confirmed clean. Final condition side-by-side comparison stamped by custodian.
              </span>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#6F4E37] font-bold text-base font-sans">
            <AlertTriangle className="w-5 h-5 text-[#A94438]" />
            <h2>4. Incident & Damage Reporting</h2>
          </div>
          <p className="text-[#50453e] leading-relaxed">
            In the event of hardware malfunction, broken bits, or missing cables, borrowers must immediately file an in-app Incident Report. The incident management protocol prioritizes transparent repair and calibration without punitive defaults.
          </p>
        </div>
      </div>
    </div>
  );
};
