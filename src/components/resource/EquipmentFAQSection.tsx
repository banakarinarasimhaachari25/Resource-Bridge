import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  BookOpen,
  Clock,
  Sparkles,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Mail,
  Send,
  X,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { EquipmentFAQ, FAQCategory, ResourceItem, UserProfile } from '../../types';
import {
  FAQ_CATEGORIES,
  getEquipmentFAQs,
  filterEquipmentFAQs
} from '../../utils/equipmentFaqs';

interface EquipmentFAQSectionProps {
  resource: ResourceItem;
  currentProfile: UserProfile;
}

export const EquipmentFAQSection: React.FC<EquipmentFAQSectionProps> = ({
  resource,
  currentProfile
}) => {
  const allFaqs = useMemo(() => getEquipmentFAQs(resource), [resource]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FAQCategory | 'all'>('all');
  
  // Default first two items expanded for instant clarity
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    return new Set(allFaqs.slice(0, 2).map(f => f.id));
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [inquirySubject, setInquirySubject] = useState(`Question about ${resource.title}`);
  const [inquiryText, setInquiryText] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return filterEquipmentFAQs(allFaqs, searchQuery, activeCategory);
  }, [allFaqs, searchQuery, activeCategory]);

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allFaqs.length };
    for (const faq of allFaqs) {
      counts[faq.category] = (counts[faq.category] || 0) + 1;
    }
    return counts;
  }, [allFaqs]);

  const toggleAccordion = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedIds(new Set(filteredFaqs.map(f => f.id)));
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleCopySteps = (faq: EquipmentFAQ) => {
    if (!faq.steps || faq.steps.length === 0) return;
    const textToCopy = `${faq.question}\n\nProcedure:\n${faq.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nEquipment: ${resource.title} (${resource.location_label})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(faq.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  const handleFeedback = (faqId: string, type: 'up' | 'down') => {
    setHelpfulFeedback(prev => ({
      ...prev,
      [faqId]: type
    }));
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryText.trim()) return;
    setInquirySent(true);
    setTimeout(() => {
      setIsContactModalOpen(false);
      setInquirySent(false);
      setInquiryText('');
    }, 2000);
  };

  // Helper to get category icon and colors
  const getCategoryBadge = (category: FAQCategory) => {
    switch (category) {
      case 'usage':
        return {
          icon: BookOpen,
          label: 'Usage & Protocols',
          className: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'safety':
        return {
          icon: ShieldAlert,
          label: 'Safety & PPE',
          className: 'bg-rose-50 text-rose-700 border-rose-200'
        };
      case 'maintenance':
        return {
          icon: Wrench,
          label: 'Maintenance & Care',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'booking':
        return {
          icon: Clock,
          label: 'Access & Check-In',
          className: 'bg-amber-50 text-amber-700 border-amber-200'
        };
    }
  };

  return (
    <section aria-labelledby="faq-section-title" className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8C3A5]/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6F4E37] font-inter">
            <HelpCircle className="w-4 h-4 text-[#BF6B2E]" />
            <h2 id="faq-section-title">Equipment FAQs &amp; Operational Protocols</h2>
          </div>
          <p className="text-xs text-stone-600 font-inter">
            Verified answers on operational setup, mandatory safety gear, and post-session maintenance for {resource.title}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsContactModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-inter bg-[#F7E7CE] text-[#6F4E37] hover:bg-[#ebd5b8] border border-[#D8C3A5] transition-colors shrink-0"
        >
          <Mail className="w-3.5 h-3.5 text-[#BF6B2E]" />
          <span>Ask Custodian</span>
        </button>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="space-y-3">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search FAQs (e.g. PPE, respirator, calibration, emergency, cleaning)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#D8C3A5] bg-[#FFFAF2] text-xs font-inter text-[#34251F] placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#BF6B2E]/30 focus:border-[#BF6B2E]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills & Expand/Collapse Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-inter">
            {FAQ_CATEGORIES.map(cat => {
              const count = categoryCounts[cat.key] || 0;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 text-xs border ${
                    isActive
                      ? 'bg-[#6F4E37] text-white border-[#6F4E37] shadow-xs'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border-stone-200'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-stone-200/70 text-stone-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-inter font-medium text-stone-500">
            <button
              type="button"
              onClick={handleExpandAll}
              className="hover:text-[#BF6B2E] transition-colors"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="hover:text-[#BF6B2E] transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3 pt-1">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center bg-[#FFFAF2] border border-[#D8C3A5]/60 rounded-xl space-y-2">
            <Info className="w-6 h-6 text-[#BF6B2E] mx-auto" />
            <div className="text-xs font-bold text-[#34251F] font-inter">
              No matching questions found
            </div>
            <p className="text-xs text-stone-500 font-inter max-w-md mx-auto">
              We couldn&apos;t find an answer matching &ldquo;{searchQuery}&rdquo;. Try a different search keyword or contact the equipment custodian.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#BF6B2E] text-white hover:bg-[#a35922]"
              >
                Ask Custodian
              </button>
            </div>
          </div>
        ) : (
          filteredFaqs.map(faq => {
            const isExpanded = expandedIds.has(faq.id);
            const badge = getCategoryBadge(faq.category);
            const BadgeIcon = badge.icon;
            const userVote = helpfulFeedback[faq.id];

            return (
              <div
                key={faq.id}
                className={`rounded-xl border transition-all ${
                  isExpanded
                    ? 'border-[#BF6B2E]/60 bg-white shadow-xs'
                    : 'border-[#D8C3A5]/70 bg-[#FFFAF2]/50 hover:bg-[#FFFAF2] hover:border-[#D8C3A5]'
                }`}
              >
                {/* Accordion Header Button */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  aria-expanded={isExpanded}
                  className="w-full p-4 text-left flex items-start justify-between gap-4 select-none focus:outline-hidden"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badge.className}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    <span className="text-xs sm:text-sm font-bold text-[#34251F] font-inter block leading-snug">
                      {faq.question}
                    </span>
                  </div>

                  <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center shrink-0 mt-0.5 text-stone-600 transition-transform">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#BF6B2E]" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Accordion Body Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-stone-100 space-y-3 font-inter text-xs">
                    {/* Primary Answer Paragraph */}
                    <div className="text-stone-700 leading-relaxed whitespace-pre-line pt-2">
                      {faq.answer}
                    </div>

                    {/* Important Note Callout */}
                    {faq.importantNote && (
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg space-y-1 text-amber-900">
                        <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider text-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Important Safety / Usage Note</span>
                        </div>
                        <p className="text-xs text-amber-800/90 leading-normal">
                          {faq.importantNote}
                        </p>
                      </div>
                    )}

                    {/* Step-by-Step Procedure Checklist */}
                    {faq.steps && faq.steps.length > 0 && (
                      <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] uppercase tracking-wider text-[#6F4E37] flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Step-by-Step Instructions</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleCopySteps(faq)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#BF6B2E] hover:text-[#a35922]"
                            title="Copy steps to clipboard"
                          >
                            {copiedId === faq.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Steps</span>
                              </>
                            )}
                          </button>
                        </div>

                        <ol className="space-y-2 text-stone-700">
                          {faq.steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="w-4 h-4 rounded-full bg-[#F7E7CE] text-[#6F4E37] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="leading-snug">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Tags and Helpful Feedback Footer */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 text-[11px] text-stone-500">
                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1">
                        {faq.tags?.map(tag => (
                          <span
                            key={tag}
                            className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-[10px] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Helpful Rating Interaction */}
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400">Was this helpful?</span>
                        <button
                          type="button"
                          onClick={() => handleFeedback(faq.id, 'up')}
                          className={`p-1 rounded transition-colors ${
                            userVote === 'up'
                              ? 'text-emerald-700 font-bold bg-emerald-100'
                              : 'text-stone-400 hover:text-stone-700'
                          }`}
                          title="Helpful"
                          aria-label="Mark FAQ as helpful"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedback(faq.id, 'down')}
                          className={`p-1 rounded transition-colors ${
                            userVote === 'down'
                              ? 'text-rose-700 font-bold bg-rose-100'
                              : 'text-stone-400 hover:text-stone-700'
                          }`}
                          title="Not helpful"
                          aria-label="Mark FAQ as not helpful"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        {userVote && (
                          <span className="text-emerald-600 font-medium text-[10px]">
                            Thanks for your feedback!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Direct Custodian Assistance Footer Card */}
      <div className="bg-[#FFFAF2] rounded-xl border border-[#D8C3A5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-inter">
        <div className="space-y-0.5">
          <div className="font-bold text-[#34251F] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#BF6B2E]" />
            <span>Have a specific protocol or experiment question?</span>
          </div>
          <p className="text-stone-600 text-[11px]">
            Custodian {resource.owner_name} ({resource.organisation_name}) can clarify complex sample preparations or safety exemptions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsContactModalOpen(true)}
          className="px-3.5 py-2 rounded-lg font-bold bg-[#6F4E37] text-white hover:bg-[#583e2c] transition-colors shrink-0 text-center"
        >
          Message Custodian
        </button>
      </div>

      {/* Custodian Question Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-inter">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#D8C3A5] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F7E7CE] text-[#6F4E37] flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4 text-[#BF6B2E]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#34251F]">Ask Equipment Custodian</h3>
                  <p className="text-[11px] text-stone-500">
                    To: {resource.owner_name} &lt;{resource.owner_email}&gt;
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inquirySent ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-[#34251F]">Inquiry Sent Successfully!</div>
                <p className="text-xs text-stone-500">
                  {resource.owner_name} has been notified via institutional email and will respond to {currentProfile.email}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={inquirySubject}
                    onChange={e => setInquirySubject(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#BF6B2E]/30 focus:border-[#BF6B2E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Your Question / Specification Request
                  </label>
                  <textarea
                    rows={4}
                    value={inquiryText}
                    onChange={e => setInquiryText(e.target.value)}
                    required
                    placeholder="Describe your research requirements, material safety data, or operational question..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-[#BF6B2E]/30 focus:border-[#BF6B2E]"
                  />
                </div>

                <div className="bg-[#FFFAF2] p-2.5 rounded-lg border border-[#D8C3A5] text-[11px] text-stone-600">
                  <span className="font-semibold text-[#6F4E37]">Borrower Note:</span> Custodians typically respond within 1 business day. For urgent emergencies, consult the room supervisor in {resource.building}, Room {resource.room}.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
