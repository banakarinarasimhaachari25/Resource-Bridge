import React from 'react';
import { AuditEvent, UserProfile } from '../types';
import {
  RotateCcw,
  ShieldCheck,
  Calendar,
  FileCheck,
  AlertTriangle,
  Layers,
  Clock,
  User
} from 'lucide-react';

interface ActivityHistoryProps {
  auditEvents: AuditEvent[];
  currentProfile: UserProfile;
}

export const ActivityHistory: React.FC<ActivityHistoryProps> = ({
  auditEvents,
  currentProfile
}) => {
  const getActionIcon = (action: string) => {
    if (action.includes('Booking Approved') || action.includes('Resource Returned')) {
      return <CheckCircle2Icon />;
    }
    if (action.includes('Checked Out') || action.includes('Handover')) {
      return <FileCheck className="w-4 h-4 text-[#BF6B2E]" />;
    }
    if (action.includes('Incident')) {
      return <AlertTriangle className="w-4 h-4 text-[#A94438]" />;
    }
    if (action.includes('Resource')) {
      return <Layers className="w-4 h-4 text-[#6F4E37]" />;
    }
    return <Calendar className="w-4 h-4 text-[#6F4E37]" />;
  };

  function CheckCircle2Icon() {
    return (
      <svg className="w-4 h-4 text-[#879078]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8C3A5] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
            // IMMUTABLE AUDIT TRAIL
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34251F] mt-1">
            System Activity & Handover History
          </h1>
          <p className="text-xs sm:text-sm text-[#50453e] mt-1 font-inter">
            Traceable chronological event ledger for all resource creations, booking approvals, and return inspections.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#F7E7CE] px-3 py-1.5 rounded-lg border border-[#D8C3A5] text-xs font-inter text-[#6F4E37]">
          <ShieldCheck className="w-4 h-4 text-[#BF6B2E]" />
          <span>Audit-Protected</span>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs">
        {auditEvents.length === 0 ? (
          <div className="text-center py-12 text-stone-400 text-xs font-inter">
            No activity events recorded yet.
          </div>
        ) : (
          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#D8C3A5]">
            {auditEvents.map(event => (
              <div key={event.id} className="relative group">
                {/* Node icon */}
                <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-[#FFFAF2] border-2 border-[#6F4E37] flex items-center justify-center shadow-xs">
                  {getActionIcon(event.action)}
                </div>

                <div className="space-y-1 text-xs font-inter">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-[#34251F]">
                      {event.action}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="font-semibold text-[#BF6B2E]">
                      {event.entity_title}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-[11px] text-stone-400">
                      {new Date(event.occurred_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[#50453e] text-xs leading-relaxed">
                    {event.details}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-1">
                    <User className="w-3 h-3 text-[#6F4E37]" />
                    <span>Actor: <strong className="text-[#34251F]">{event.actor_name}</strong> ({event.actor_role})</span>
                    <span className="text-stone-300">•</span>
                    <span className="font-mono text-[10px] text-stone-400">ID: {event.entity_id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
