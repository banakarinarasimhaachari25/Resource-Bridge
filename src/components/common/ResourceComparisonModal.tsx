import React, { useState } from 'react';
import { ResourceItem, UserProfile } from '../../types';
import { StatusBadge } from './StatusBadge';
import { StarRating } from './StarRating';
import { checkEligibility } from '../../utils/rules';
import {
  X,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  MapPin,
  Building,
  User,
  Coins,
  CheckCircle2,
  Tag,
  Calendar,
  AlertTriangle,
  Info,
  Layers,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface ResourceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: ResourceItem[];
  currentProfile: UserProfile;
  onRemoveResource: (resourceId: string) => void;
  onSelectResource: (resource: ResourceItem) => void;
  onRequestBooking?: (resource: ResourceItem) => void;
  onClearAll: () => void;
}

export const ResourceComparisonModal: React.FC<ResourceComparisonModalProps> = ({
  isOpen,
  onClose,
  resources,
  currentProfile,
  onRemoveResource,
  onSelectResource,
  onRequestBooking,
  onClearAll
}) => {
  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'specs' | 'rules' | 'pricing'>('all');

  if (!isOpen || resources.length === 0) return null;

  // Extract all unique technical specification keys across all compared resources
  const allSpecKeys = Array.from(
    new Set(
      resources.flatMap(r => (r.specifications ? Object.keys(r.specifications) : []))
    )
  );

  // Helper to determine if values differ across resources for a given row
  const hasValueDifferences = (values: (string | number | boolean | undefined | null)[]) => {
    if (values.length <= 1) return false;
    const first = JSON.stringify(values[0]);
    return values.some(v => JSON.stringify(v) !== first);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-900/75 backdrop-blur-xs overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-modal-title"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D8C3A5] shadow-2xl max-w-7xl w-full h-[92vh] max-h-[920px] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#D8C3A5] bg-[#FFFAF2] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#6F4E37] text-white flex items-center justify-center shadow-xs">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
                // Side-by-Side Equipment Comparison
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#F7E7CE] text-[#6F4E37] text-xs font-bold font-inter">
                {resources.length} {resources.length === 1 ? 'Resource' : 'Resources'}
              </span>
            </div>
            <h2 id="comparison-modal-title" className="text-xl sm:text-2xl font-bold text-[#34251F] mt-1">
              Compare Technical Specs, Rates &amp; Access Policies
            </h2>
            <p className="text-xs text-[#50453e] font-inter mt-0.5">
              Simultaneously analyze performance characteristics, department custodian rules, and hourly costs to choose the right apparatus.
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Highlight Differences Switch */}
            <button
              type="button"
              onClick={() => setHighlightDifferences(!highlightDifferences)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-inter border transition-all ${
                highlightDifferences
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-white text-[#6F4E37] border-[#D8C3A5] hover:bg-[#F7E7CE]'
              }`}
              title="Visually highlight rows where specifications or rules differ across equipment"
            >
              <Sparkles className={`w-3.5 h-3.5 ${highlightDifferences ? 'text-amber-600' : 'text-stone-400'}`} />
              <span>{highlightDifferences ? 'Diff Highlight: ON' : 'Highlight Differences'}</span>
            </button>

            {/* Clear All Button */}
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold font-inter bg-white text-stone-600 border border-[#D8C3A5] hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white border border-[#D8C3A5] text-stone-500 hover:text-[#34251F] hover:bg-[#F7E7CE] flex items-center justify-center transition-colors shadow-2xs"
              aria-label="Close Comparison"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Filter Sub-Tabs */}
        <div className="px-4 sm:px-6 py-2.5 bg-stone-50 border-b border-[#D8C3A5]/60 flex items-center justify-between text-xs font-inter shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 font-semibold mr-1">Section Jump:</span>
            {[
              { id: 'all', label: 'All Attributes' },
              { id: 'pricing', label: 'Cost & Billing' },
              { id: 'specs', label: 'Technical Specs' },
              { id: 'rules', label: 'Access & Safety' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#6F4E37] text-white shadow-2xs'
                    : 'text-stone-600 hover:bg-stone-200/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-stone-500 hidden sm:block">
            {resources.length < 4 ? `Add up to ${4 - resources.length} more resources from Discover` : 'Max 4 resources selected'}
          </div>
        </div>

        {/* Scrollable Comparison Matrix */}
        <div className="flex-1 overflow-auto divide-y divide-[#D8C3A5]/60">
          <div className="min-w-[680px]">
            {/* Sticky Header Row with Equipment Cards */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-[#D8C3A5] shadow-xs">
              <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(240px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(260px,1fr))]">
                {/* Top-Left Corner Anchor */}
                <div className="p-4 bg-stone-50/80 border-r border-[#D8C3A5]/60 flex flex-col justify-end">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 font-inter">
                    Resource Profiles
                  </span>
                  <span className="text-xs font-semibold text-[#6F4E37] mt-0.5">
                    Side-by-Side Matrix
                  </span>
                </div>

                {/* Equipment Cards Columns */}
                {resources.map(resource => {
                  const isFree = (resource.cost_per_hour || 0) === 0;
                  const eligibility = checkEligibility(currentProfile, resource);

                  return (
                    <div
                      key={resource.id}
                      className="p-4 border-r border-[#D8C3A5]/60 last:border-r-0 flex flex-col justify-between bg-white group relative"
                    >
                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveResource(resource.id)}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-stone-100 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors z-10"
                        title="Remove from comparison"
                        aria-label={`Remove ${resource.title}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-2.5">
                        {/* Thumbnail & Badges */}
                        <div className="relative h-28 w-full rounded-xl overflow-hidden bg-stone-100 border border-[#D8C3A5]/50">
                          <img
                            src={resource.image_url}
                            alt={resource.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2">
                            <StatusBadge status={resource.status} size="sm" />
                          </div>
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-stone-900/80 text-white text-[10px] font-mono backdrop-blur-xs">
                            Max {resource.max_duration_hours}h
                          </div>
                        </div>

                        {/* Title & Category */}
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
                            {resource.category}
                          </div>
                          <h4
                            onClick={() => {
                              onSelectResource(resource);
                              onClose();
                            }}
                            className="text-sm font-bold text-[#34251F] hover:text-[#BF6B2E] cursor-pointer transition-colors line-clamp-2 mt-0.5"
                            title={resource.title}
                          >
                            {resource.title}
                          </h4>
                        </div>

                        {/* Cost Badge */}
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-inter border w-full ${
                            isFree
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-amber-50 border-amber-200 text-amber-900'
                          }`}
                        >
                          {isFree ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Coins className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          )}
                          <span className="truncate">{resource.cost_label}</span>
                        </div>

                        {/* Star Rating */}
                        <div className="flex items-center gap-1">
                          <StarRating
                            rating={resource.average_rating || 0}
                            totalReviews={resource.total_reviews}
                            size="sm"
                            showScore
                          />
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="mt-3 pt-3 border-t border-[#D8C3A5]/40 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectResource(resource);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold font-inter bg-white border border-[#D8C3A5] text-[#6F4E37] hover:bg-[#F7E7CE] transition-colors text-center"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onRequestBooking) {
                              onRequestBooking(resource);
                            } else {
                              onSelectResource(resource);
                            }
                            onClose();
                          }}
                          className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors text-center shadow-2xs"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION: PRICING & BILLING */}
            {(activeTab === 'all' || activeTab === 'pricing') && (
              <div className="divide-y divide-[#D8C3A5]/40">
                <div className="bg-[#FFFAF2] px-4 py-2 text-xs font-bold text-[#6F4E37] uppercase tracking-wider font-inter flex items-center gap-2">
                  <Coins className="w-3.5 h-3.5 text-[#BF6B2E]" />
                  <span>Cost, Hourly Rate &amp; Funding Models</span>
                </div>

                {/* Row: Hourly Rate */}
                {(() => {
                  const values = resources.map(r => r.cost_per_hour);
                  const isDiff = hasValueDifferences(values);
                  return (
                    <div
                      className={`grid grid-cols-[200px_repeat(auto-fit,minmax(240px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(260px,1fr))] transition-colors ${
                        highlightDifferences && isDiff ? 'bg-amber-50/70 border-l-4 border-l-[#BF6B2E]' : 'hover:bg-stone-50/60'
                      }`}
                    >
                      <div className="p-3.5 text-xs font-semibold text-stone-600 border-r border-[#D8C3A5]/60 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-stone-400" />
                        <span>Hourly Cost Rate</span>
                      </div>
                      {resources.map(r => (
                        <div key={r.id} className="p-3.5 text-xs border-r border-[#D8C3A5]/60 last:border-r-0">
                          <span className="font-bold text-[#34251F]">
                            {(r.cost_per_hour || 0) === 0 ? '$0 / hour (Free Allocation)' : `$${r.cost_per_hour} / hour`}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Row: Billing Model */}
                {(() => {
                  const values = resources.map(r => r.cost_billing_model);
                  const isDiff = hasValueDifferences(values);
                  return (
                    <div
                      className={`grid grid-cols-[200px_repeat(auto-fit,minmax(240px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(260px,1fr))] transition-colors ${
                        highlightDifferences && isDiff ? 'bg-amber-50/70 border-l-4 border-l-[#BF6B2E]' : 'hover:bg-stone-50/60'
                      }`}
                    >
                      <div className="p-3.5 text-xs font-semibold text-stone-600 border-r border-[#D8C3A5]/60 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-stone-400" />
                        <span>Billing &amp; Subsidy Policy</span>
                      </div>
                      {resources.map(r => (
                        <div key={r.id} className="p-3.5 text-xs text-[#50453e] border-r border-[#D8C3A5]/60 last:border-r-0">
                          <span className="font-medium">{r.cost_billing_model || 'Departmental Research Pool'}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SECTION: TECHNICAL SPECIFICATIONS */}
            {(activeTab === 'all' || activeTab === 'specs') && (
              <div className="divide-y divide-[#D8C3A5]/40">
                <div className="bg-[#FFFAF2] px-4 py-2 text-xs font-bold text-[#6F4E37] uppercase tracking-wider font-inter flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#BF6B2E]" />
                    <span>Technical Specifications Matrix</span>
                  </div>
                  <span className="text-[11px] font-normal text-stone-500 lowercase">
                    {allSpecKeys.length} hardware parameters
                  </span>
                </div>

                {allSpecKeys.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-500 font-inter">
                    No explicit technical parameters registered for the selected equipment items.
                  </div>
                ) : (
                  allSpecKeys.map(specKey => {
                    const values = resources.map(r => r.specifications?.[specKey] || null);
                    const isDiff = hasValueDifferences(values);

                    return (
                      <div
                        key={specKey}
                        className={`grid grid-cols-[200px_repeat(auto-fit,minmax(240px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(260px,1fr))] transition-colors ${
                          highlightDifferences && isDiff ? 'bg-amber-50/70 border-l-4 border-l-[#BF6B2E]' : 'hover:bg-stone-50/60'
                        }`}
                      >
                        <div className="p-3.5 text-xs font-semibold text-stone-700 border-r border-[#D8C3A5]/60 flex items-center justify-between">
                          <span className="truncate pr-1">{specKey}</span>
                          {highlightDifferences && isDiff && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Values differ" />
                          )}
                        </div>

                        {resources.map(r => {
                          const val = r.specifications?.[specKey];
                          return (
                            <div
                              key={r.id}
                              className="p-3.5 text-xs border-r border-[#D8C3A5]/60 last:border-r-0 flex items-center"
                            >
                              {val ? (
                                <span className="font-medium text-[#34251F]">{val}</span>
                              ) : (
                                <span className="text-stone-300 font-mono">—</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* SECTION: ACCESS, RULES & POLICIES */}
            {(activeTab === 'all' || activeTab === 'rules') && (
              <div className="divide-y divide-[#D8C3A5]/40">
                <div className="bg-[#FFFAF2] px-4 py-2 text-xs font-bold text-[#6F4E37] uppercase tracking-wider font-inter flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#BF6B2E]" />
                  <span>Access Rules, Safety &amp; Governance</span>
                </div>

                {/* Eligibility Check */}
                {(() => {
                  const values = resources.map(r => checkEligibility(currentProfile, r).eligible);
                  const isDiff = hasValueDifferences(values);
                  return (
                    <div
                      className={`grid grid-cols-[200px_repeat(auto-fit,minmax(240px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(260px,1fr))] transition-colors ${
                        highlightDifferences && isDiff ? 'bg-amber-50/70 border-l-4 border-l-[#BF6B2E]' : 'hover:bg-stone-50/60'
                      }`}
                    >
                      <div className="p-3.5 text-xs font-semibold text-stone-600 border-r border-[#D8C3A5]/60 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                        <span>Your Current Eligibility</span>
                      </div>
                      {resources.map(r => {
                        const elig = checkEligibility(currentProfile, r);
                        return (
                          <div key={r.id} className="p-3.5 text-xs border-r border-[#D8C3A5]/60 last:border-r-0">
                            {elig.eligible ? (
                              <div className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold font-inter">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verified &amp; Eligible</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="inline-flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 font-semibold font-inter">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>Training Required</span>
                                </div>
                                <div className="text-[11px] text-stone-500">
                                  Missing: {elig.missingRequirements.join(', ')}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Supervision Required */}
                {(() => {
                  const values = resources.map(r => r.supervision_required);
                  const isDiff = hasValueDifferences(values);
                  return (
                    <div
                      className={`grid grid-cols-[200px_repeat(auto-fit,minmax(240px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(260px,1fr))] transition-colors ${
                        highlightDifferences && isDiff ? 'bg-amber-50/70 border-l-4 border-l-[#BF6B2E]' : 'hover:bg-stone-50/60'
                      }`}
                    >
                      <div className="p-3.5 text-xs font-semibold text-stone-600 border-r border-[#D8C3A5]/60 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>Lab Supervision</span>
                      </div>
                      {resources.map(r => (
                        <div key={r.id} className="p-3.5 text-xs border-r border-[#D8C3A5]/60 last:border-r-0 font-medium">
                          {r.supervision_required ? (
                            <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Yes — Lab Staff Required
                            </span>
                          ) : (
                            <span className="text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                              No — Independent Self-Service
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Custodian Approval Policy */}
                {(() => {
                  const values = resources.map(r => r.requires_approval);
                  const isDiff = hasValueDifferences(values);
                  return (
                    <div
                      className={`grid grid-cols-[200px_repeat(auto-fit,minmax(240px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(260px,1fr))] transition-colors ${
                        highlightDifferences && isDiff ? 'bg-amber-50/70 border-l-4 border-l-[#BF6B2E]' : 'hover:bg-stone-50/60'
                      }`}
                    >
                      <div className="p-3.5 text-xs font-semibold text-stone-600 border-r border-[#D8C3A5]/60 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>Approval Policy</span>
                      </div>
                      {resources.map(r => (
                        <div key={r.id} className="p-3.5 text-xs border-r border-[#D8C3A5]/60 last:border-r-0 font-medium">
                          {r.requires_approval ? (
                            <span className="text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              Custodian Approval Required
                            </span>
                          ) : (
                            <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Instant Confirmation
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Max Booking Duration */}
                {(() => {
                  const values = resources.map(r => r.max_duration_hours);
                  const isDiff = hasValueDifferences(values);
                  return (
                    <div
                      className={`grid grid-cols-[200px_repeat(auto-fit,minmax(240px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(260px,1fr))] transition-colors ${
                        highlightDifferences && isDiff ? 'bg-amber-50/70 border-l-4 border-l-[#BF6B2E]' : 'hover:bg-stone-50/60'
                      }`}
                    >
                      <div className="p-3.5 text-xs font-semibold text-stone-600 border-r border-[#D8C3A5]/60 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>Max Slot Duration</span>
                      </div>
                      {resources.map(r => (
                        <div key={r.id} className="p-3.5 text-xs text-[#34251F] font-bold border-r border-[#D8C3A5]/60 last:border-r-0">
                          {r.max_duration_hours} Hours per Request
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Location & Room */}
                {(() => {
                  const values = resources.map(r => `${r.building}-${r.room}`);
                  const isDiff = hasValueDifferences(values);
                  return (
                    <div
                      className={`grid grid-cols-[200px_repeat(auto-fit,minmax(240px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(260px,1fr))] transition-colors ${
                        highlightDifferences && isDiff ? 'bg-amber-50/70 border-l-4 border-l-[#BF6B2E]' : 'hover:bg-stone-50/60'
                      }`}
                    >
                      <div className="p-3.5 text-xs font-semibold text-stone-600 border-r border-[#D8C3A5]/60 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>Facility &amp; Location</span>
                      </div>
                      {resources.map(r => (
                        <div key={r.id} className="p-3.5 text-xs text-[#50453e] border-r border-[#D8C3A5]/60 last:border-r-0">
                          <div className="font-bold text-[#34251F]">{r.building}, Room {r.room}</div>
                          <div className="text-[11px] text-stone-500">{r.location_label}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Faculty Custodian */}
                {(() => {
                  const values = resources.map(r => r.owner_name);
                  const isDiff = hasValueDifferences(values);
                  return (
                    <div
                      className={`grid grid-cols-[200px_repeat(auto-fit,minmax(240px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(260px,1fr))] transition-colors ${
                        highlightDifferences && isDiff ? 'bg-amber-50/70 border-l-4 border-l-[#BF6B2E]' : 'hover:bg-stone-50/60'
                      }`}
                    >
                      <div className="p-3.5 text-xs font-semibold text-stone-600 border-r border-[#D8C3A5]/60 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>Equipment Custodian</span>
                      </div>
                      {resources.map(r => (
                        <div key={r.id} className="p-3.5 text-xs text-[#50453e] border-r border-[#D8C3A5]/60 last:border-r-0">
                          <div className="font-semibold text-[#34251F]">{r.owner_name}</div>
                          <div className="text-[11px] text-stone-400">{r.owner_email}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Safety Rules Preview */}
                <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(240px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(260px,1fr))]">
                  <div className="p-3.5 text-xs font-semibold text-stone-600 border-r border-[#D8C3A5]/60 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-stone-400" />
                    <span>Safety Protocols &amp; Rules</span>
                  </div>
                  {resources.map(r => (
                    <div key={r.id} className="p-3.5 text-xs border-r border-[#D8C3A5]/60 last:border-r-0 space-y-1.5">
                      <div className="font-bold text-[#6F4E37] text-[11px]">
                        {r.rules.length} Required Operating Rules:
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-[#50453e]">
                        {r.rules.slice(0, 3).map((rule, idx) => (
                          <li key={idx} className="line-clamp-2">{rule}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="p-4 bg-stone-50/90 border-t border-[#D8C3A5] grid grid-cols-[200px_repeat(auto-fit,minmax(240px,1fr))] sm:grid-cols-[220px_repeat(auto-fit,minmax(260px,1fr))] items-center">
              <div className="text-xs font-bold text-stone-500">
                Direct Actions
              </div>
              {resources.map(resource => (
                <div key={resource.id} className="px-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onRequestBooking) {
                        onRequestBooking(resource);
                      } else {
                        onSelectResource(resource);
                      }
                      onClose();
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors shadow-xs text-center"
                  >
                    Reserve Now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectResource(resource);
                      onClose();
                    }}
                    className="p-2 rounded-xl border border-[#D8C3A5] bg-white text-[#6F4E37] hover:bg-[#F7E7CE] transition-colors"
                    title="View Full Profile"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
