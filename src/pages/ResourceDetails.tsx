import React, { useState } from 'react';
import { Booking, ResourceItem, ResourceReview, UserProfile, WaitlistEntry } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { StarRating } from '../components/common/StarRating';
import { checkEligibility } from '../utils/rules';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Users,
  Hourglass,
  Star,
  Coins,
  DollarSign,
  Tag,
  Info,
  AlertTriangle,
  Building,
  Mail,
  User,
  HelpCircle
} from 'lucide-react';
import { EquipmentFAQSection } from '../components/resource/EquipmentFAQSection';

interface ResourceDetailsProps {
  resource: ResourceItem;
  currentProfile: UserProfile;
  waitlist: WaitlistEntry[];
  reviews?: ResourceReview[];
  userBookings?: Booking[];
  onBack: () => void;
  onRequestBooking: (resource: ResourceItem) => void;
  onJoinWaitlist: (resourceId: string) => void;
  onOpenReviewModal?: (booking: Booking) => void;
}

export const ResourceDetails: React.FC<ResourceDetailsProps> = ({
  resource,
  currentProfile,
  waitlist,
  reviews = [],
  userBookings = [],
  onBack,
  onRequestBooking,
  onJoinWaitlist,
  onOpenReviewModal
}) => {
  const [activePhoto, setActivePhoto] = useState(resource.image_url);
  const eligibility = checkEligibility(currentProfile, resource);

  const resourceWaitlist = waitlist.filter(w => w.resource_id === resource.id && w.status === 'waiting');
  const userAlreadyWaitlisted = resourceWaitlist.some(w => w.requester_id === currentProfile.id);

  // Check if borrower has an unreviewed returned booking
  const unreviewedCompletedBooking = userBookings.find(
    b => b.resource_id === resource.id && b.status === 'returned' && !b.reviewed
  );

  const resourceReviews = reviews.filter(r => r.resource_id === resource.id);
  const isFree = (resource.cost_per_hour || 0) === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* Back Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold font-inter text-[#6F4E37] hover:text-[#BF6B2E] transition-colors py-1"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Shared Resources</span>
      </button>

      {/* Title & Key Highlights Header */}
      <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-inter">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F7E7CE] text-[#6F4E37] font-bold uppercase tracking-wider text-[10px]">
                {resource.category}
              </span>
              <StatusBadge status={resource.status} size="sm" />
              <span className="text-stone-400">•</span>
              <span className="text-stone-500 font-medium">Asset ID: {resource.id}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#34251F] tracking-tight">
              {resource.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-inter text-[#50453e] pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#BF6B2E]" />
                <span className="font-semibold text-[#34251F]">
                  {resource.building}, {resource.room} ({resource.location_label})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <StarRating
                  rating={resource.average_rating || 0}
                  totalReviews={resource.total_reviews}
                  showScore
                  size="sm"
                />
              </div>

              <span className="text-stone-300">•</span>

              <a
                href="#equipment-faqs"
                className="flex items-center gap-1.5 text-[#6F4E37] hover:text-[#BF6B2E] transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#BF6B2E]" />
                <span className="font-semibold underline">Equipment FAQs &amp; Safety</span>
              </a>
            </div>
          </div>

          {/* Prominent Cost & Rate Summary */}
          <div className="bg-[#FFFAF2] border border-[#D8C3A5] rounded-xl p-4 sm:min-w-64 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6F4E37] font-inter">
              Cost &amp; Billing Rate
            </div>
            <div className="text-2xl font-black text-[#34251F]">
              {isFree ? '$0.00 / hour' : `$${resource.cost_per_hour}.00 / hr`}
            </div>
            <div className="text-xs text-stone-600 font-inter font-medium flex items-center gap-1">
              {isFree ? (
                <span className="text-emerald-700 font-bold">• 100% Academic Grant Covered</span>
              ) : (
                <span className="text-[#BF6B2E] font-bold">• Subsidized Internal Rate</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Clean Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visuals, Description, Specs & Rules (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo & Thumbnail Gallery */}
          <div className="space-y-3">
            <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden border border-[#D8C3A5] bg-stone-100 shadow-xs">
              <img
                src={activePhoto}
                alt={resource.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold text-[#6F4E37] border border-[#D8C3A5]">
                Max Reservation: {resource.max_duration_hours}h
              </div>
            </div>

            {resource.gallery && resource.gallery.length > 1 && (
              <div className="flex items-center gap-2">
                {resource.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhoto(img)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activePhoto === img
                        ? 'border-[#BF6B2E] ring-2 ring-[#BF6B2E]/20'
                        : 'border-[#D8C3A5] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Simple Description Card */}
          <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#6F4E37] font-inter">
              About This Equipment
            </div>
            <p className="text-sm text-[#34251F] leading-relaxed font-inter">
              {resource.description}
            </p>
          </div>

          {/* Technical Specifications Table */}
          <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#6F4E37] font-inter flex items-center gap-2">
              <Info className="w-4 h-4 text-[#BF6B2E]" />
              <span>Technical Specifications</span>
            </div>

            <div className="divide-y divide-stone-100 text-xs font-inter border-t border-stone-100 pt-2">
              {Object.entries(resource.specifications || {}).map(([key, val]) => (
                <div key={key} className="py-2.5 flex items-center justify-between gap-4">
                  <span className="text-stone-500 font-medium">{key}</span>
                  <span className="font-semibold text-[#34251F] text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety & Operating Rules */}
          <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#6F4E37] font-inter flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Lab Safety &amp; Usage Rules</span>
            </div>

            <ul className="space-y-2 text-xs font-inter text-[#50453e]">
              {resource.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#F7E7CE] text-[#6F4E37] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Equipment FAQ Section (Usage, Safety, Maintenance) */}
          <div id="equipment-faqs">
            <EquipmentFAQSection
              resource={resource}
              currentProfile={currentProfile}
            />
          </div>
        </div>

        {/* Right Column: Cost Breakdown, Booking Action, Custodian Card & Reviews (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Action Card: Cost, Availability & Reserve Button */}
          <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-md space-y-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
                Reserve Resource
              </div>
              <div className="text-xl font-bold text-[#34251F] mt-1">
                Booking Details &amp; Cost
              </div>
            </div>

            {/* Quick Details Pill Grid */}
            <div className="bg-[#FFFAF2] rounded-xl border border-[#D8C3A5] p-4 space-y-2.5 text-xs font-inter">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#BF6B2E]" />
                  <span>Max Duration:</span>
                </span>
                <span className="font-bold text-[#34251F]">{resource.max_duration_hours} Hours per slot</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-600 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#BF6B2E]" />
                  <span>Schedule:</span>
                </span>
                <span className="font-medium text-[#34251F]">{resource.availability_schedule}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-600 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#BF6B2E]" />
                  <span>Supervision:</span>
                </span>
                <span className="font-medium text-[#34251F]">
                  {resource.supervision_required ? 'Staff Attendant Required' : 'Self-Service After Certification'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#D8C3A5]/60">
                <span className="text-stone-600 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[#BF6B2E]" />
                  <span>Hourly Charge:</span>
                </span>
                <span className="font-black text-[#34251F]">
                  {isFree ? '$0.00' : `$${resource.cost_per_hour}.00 / hr`}
                </span>
              </div>
            </div>

            {/* Booking Action / Eligibility Guard */}
            <div className="space-y-3">
              {eligibility.eligible ? (
                <button
                  type="button"
                  onClick={() => onRequestBooking(resource)}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Request Booking Slot</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="bg-[#A94438]/10 border border-[#A94438]/30 rounded-xl p-3 text-xs font-inter text-[#A94438]">
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Missing Required Prerequisites</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {eligibility.missingRequirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl text-xs font-semibold font-inter bg-stone-200 text-stone-500 cursor-not-allowed"
                  >
                    Booking Disabled (Prerequisites Required)
                  </button>
                </div>
              )}

              {/* Fair Access Waitlist */}
              <div className="flex items-center justify-between pt-2 text-xs font-inter border-t border-stone-100">
                <div className="text-stone-500 flex items-center gap-1">
                  <Hourglass className="w-3.5 h-3.5 text-[#6F4E37]" />
                  <span>Waitlist: {resourceWaitlist.length} waiting</span>
                </div>
                {userAlreadyWaitlisted ? (
                  <span className="text-[11px] font-semibold text-[#879078] bg-[#879078]/15 px-2.5 py-0.5 rounded-full">
                    • In Waitlist Queue
                  </span>
                ) : (
                  <button
                    onClick={() => onJoinWaitlist(resource.id)}
                    className="text-[#BF6B2E] hover:underline font-bold text-[11px]"
                  >
                    Join Waitlist
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Responsible Custodian Card */}
          <div className="bg-white rounded-2xl border border-[#D8C3A5] p-5 shadow-xs space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#6F4E37] font-inter">
              Resource Custodian &amp; Contact
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#6F4E37] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                {resource.owner_name.charAt(0)}
              </div>
              <div className="text-xs font-inter space-y-0.5">
                <div className="font-bold text-[#34251F] text-sm">{resource.owner_name}</div>
                <div className="text-stone-500 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-stone-400" />
                  <span>{resource.owner_email}</span>
                </div>
                <div className="text-[11px] text-[#BF6B2E] font-semibold">
                  {resource.organisation_name}
                </div>
              </div>
            </div>
          </div>

          {/* User Reviews & Star Ratings */}
          <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8C3A5] pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#6F4E37] font-inter">
                  Researcher Reviews &amp; Star Ratings
                </h3>
                <p className="text-[11px] text-stone-500 font-inter">
                  Community feedback from verified equipment borrowers
                </p>
              </div>

              {unreviewedCompletedBooking && onOpenReviewModal && (
                <button
                  type="button"
                  onClick={() => onOpenReviewModal(unreviewedCompletedBooking)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922]"
                >
                  Rate Equipment ★
                </button>
              )}
            </div>

            {resourceReviews.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500 font-inter bg-[#FFFAF2] rounded-xl border border-[#D8C3A5]/60">
                No reviews submitted yet. Be the first researcher to review this equipment after your booking!
              </div>
            ) : (
              <div className="space-y-3">
                {resourceReviews.map(rev => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl bg-[#FFFAF2] border border-[#D8C3A5]/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-[#34251F]">
                        {rev.user_name}
                        <span className="text-stone-500 font-normal ml-1">({rev.user_department})</span>
                      </div>
                      <StarRating rating={rev.rating} size="sm" showScore />
                    </div>
                    <p className="text-xs text-[#50453e] font-inter italic leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                    <div className="text-[10px] text-stone-400 font-inter text-right">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
