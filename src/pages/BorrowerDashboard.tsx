import React, { useState, useMemo } from 'react';
import { Booking, ResourceItem, ResourceReview, UserProfile } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Star,
  FileText,
  DollarSign,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { DashboardHeaderNav } from '../components/dashboard/DashboardHeaderNav';
import { QuickActionsFloatingMenu } from '../components/dashboard/QuickActionsFloatingMenu';
import { DashboardType } from '../utils/auth';

interface BorrowerDashboardProps {
  bookings: Booking[];
  resources: ResourceItem[];
  reviews: ResourceReview[];
  currentProfile: UserProfile;
  onCancelBooking: (bookingId: string) => void;
  onNavigateToHandover: (bookingId: string) => void;
  onExplore: () => void;
  onOpenReviewModal: (booking: Booking) => void;
  onSelectResource: (resource: ResourceItem) => void;
  onNavigateDashboard?: (target: DashboardType) => void;
  onAuthenticateAndSwitch?: (profile: UserProfile, target: DashboardType) => void;
  onStateChange?: () => void;
}

export const BorrowerDashboard: React.FC<BorrowerDashboardProps> = ({
  bookings,
  resources,
  reviews,
  currentProfile,
  onCancelBooking,
  onNavigateToHandover,
  onExplore,
  onOpenReviewModal,
  onSelectResource,
  onNavigateDashboard,
  onAuthenticateAndSwitch,
  onStateChange
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'active' | 'completed'>('all');

  // Filter only current user's bookings (or all if admin)
  const myBookings = useMemo(() => {
    return bookings.filter(b => b.requester_id === currentProfile.id || currentProfile.role === 'admin');
  }, [bookings, currentProfile]);

  const activeLoans = useMemo(
    () => myBookings.filter(b => b.status === 'checked_out' || b.status === 'return_pending'),
    [myBookings]
  );

  const pendingRequests = useMemo(
    () => myBookings.filter(b => b.status === 'pending'),
    [myBookings]
  );

  const approvedReady = useMemo(
    () => myBookings.filter(b => b.status === 'approved'),
    [myBookings]
  );

  const completedReturns = useMemo(
    () => myBookings.filter(b => b.status === 'returned'),
    [myBookings]
  );

  const pendingReviews = useMemo(
    () => completedReturns.filter(b => !b.reviewed),
    [completedReturns]
  );

  const filteredBookings = useMemo(() => {
    if (activeTab === 'pending') return pendingRequests;
    if (activeTab === 'approved') return approvedReady;
    if (activeTab === 'active') return activeLoans;
    if (activeTab === 'completed') return completedReturns;
    return myBookings;
  }, [activeTab, myBookings, pendingRequests, approvedReady, activeLoans, completedReturns]);

  // Calculate estimated institutional savings
  const totalHoursBorrowed = myBookings.reduce((sum, b) => {
    const start = new Date(b.start_at).getTime();
    const end = new Date(b.end_at).getTime();
    const hrs = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
    return sum + hrs;
  }, 0);

  const estimatedCostSaved = totalHoursBorrowed * 85; // avg commercial equipment rental replacement rate

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Separated Dashboards Hub */}
      <DashboardHeaderNav
        currentDashboard="borrower_dashboard"
        currentProfile={currentProfile}
        onNavigateDashboard={onNavigateDashboard || (() => {})}
        onAuthenticateAndSwitch={onAuthenticateAndSwitch || (() => {})}
        borrowerActiveCount={activeLoans.length}
        custodianPendingCount={bookings.filter(b => b.status === 'pending').length}
        totalAssetsCount={resources.length}
      />

      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8C3A5] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
            <span className="w-2 h-2 rounded-full bg-[#BF6B2E]" />
            <span>Borrower &amp; Researcher Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34251F] mt-1">
            My Research Equipment Loans
          </h1>
          <p className="text-xs sm:text-sm text-[#50453e] mt-1 font-inter">
            Manage your personal reservations, handover checkouts, upcoming return deadlines, and quality reviews.
          </p>
        </div>

        <button
          onClick={onExplore}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors shadow-xs"
        >
          <Search className="w-4 h-4" />
          <span>Browse &amp; Reserve Equipment</span>
        </button>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#D8C3A5] p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 font-inter uppercase tracking-wider">
            Active in Possession
          </div>
          <div className="text-2xl font-bold text-[#6F4E37] mt-1">
            {activeLoans.length}
          </div>
          <div className="text-[11px] text-stone-500 font-inter mt-1">
            Checked out &amp; in use
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D8C3A5] p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 font-inter uppercase tracking-wider">
            Pending Owner Approval
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {pendingRequests.length}
          </div>
          <div className="text-[11px] text-stone-500 font-inter mt-1">
            Awaiting custodian review
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D8C3A5] p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 font-inter uppercase tracking-wider">
            Total Hours Utilized
          </div>
          <div className="text-2xl font-bold text-[#879078] mt-1">
            {totalHoursBorrowed}h
          </div>
          <div className="text-[11px] text-stone-500 font-inter mt-1">
            Across {myBookings.length} bookings
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D8C3A5] p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 font-inter uppercase tracking-wider">
            Grant Capital Preserved
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            ${estimatedCostSaved.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-500 font-inter mt-1">
            Shared vs commercial rental
          </div>
        </div>
      </div>

      {/* Review Callout Banner if borrower has pending reviews */}
      {pendingReviews.length > 0 && (
        <div className="bg-[#F7E7CE] border border-[#D8C3A5] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#BF6B2E] text-white flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#34251F]">
                Rate Your Recent Equipment Experience
              </h4>
              <p className="text-xs text-[#50453e] font-inter">
                You returned <strong>{pendingReviews[0].resource_title}</strong>. Please rate its reliability and cleanliness to help fellow researchers!
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenReviewModal(pendingReviews[0])}
            className="px-4 py-2 rounded-lg text-xs font-bold font-inter bg-[#6F4E37] text-white hover:bg-[#553722] transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Submit Star Rating ★
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D8C3A5] overflow-x-auto pb-px font-inter text-xs">
        {[
          { id: 'all', label: 'All Bookings', count: myBookings.length },
          { id: 'pending', label: 'Pending Approval', count: pendingRequests.length },
          { id: 'approved', label: 'Approved Ready', count: approvedReady.length },
          { id: 'active', label: 'Active in Hand', count: activeLoans.length },
          { id: 'completed', label: 'Completed & Returned', count: completedReturns.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-[#BF6B2E] text-[#BF6B2E] font-bold'
                : 'border-transparent text-stone-600 hover:text-[#6F4E37]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-[#BF6B2E] text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D8C3A5] p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F7E7CE] text-[#6F4E37] flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#6F4E37]">
            {activeTab === 'all'
              ? 'No equipment reservations found'
              : `No ${activeTab} reservations`}
          </h3>
          <p className="text-xs text-[#50453e] font-inter">
            Browse campus resources to reserve 3D printers, oscilloscopes, compute nodes, and labs.
          </p>
          <button
            onClick={onExplore}
            className="px-4 py-2 rounded-lg text-xs font-semibold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors"
          >
            Browse Resources
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => {
            const startDate = new Date(booking.start_at);
            const endDate = new Date(booking.end_at);
            const resource = resources.find(r => r.id === booking.resource_id);

            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-[#D8C3A5] p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
              >
                {/* Left Resource Info */}
                <div className="flex gap-4 items-start sm:items-center">
                  <img
                    src={booking.resource_image}
                    alt={booking.resource_title}
                    className="w-20 h-20 rounded-xl object-cover border border-[#D8C3A5] shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#BF6B2E] uppercase tracking-wider font-inter">
                        {booking.resource_category}
                      </span>
                      <StatusBadge status={booking.status} size="sm" />
                    </div>

                    <h3 className="text-base font-bold text-[#34251F]">
                      {booking.resource_title}
                    </h3>

                    {resource && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#879078]/15 text-[#4f5745] font-semibold text-[11px] font-inter">
                        <DollarSign className="w-3 h-3" />
                        <span>{resource.cost_label}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#50453e] font-inter pt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#6F4E37]" />
                        <span>{startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#6F4E37]" />
                        <span>
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                          {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#6F4E37]" />
                        <span>{booking.location_label}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => onCancelBooking(booking.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold font-inter border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
                    >
                      Withdraw Request
                    </button>
                  )}

                  {booking.status === 'approved' && (
                    <button
                      onClick={() => onNavigateToHandover(booking.id)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>Collect Equipment (Handover)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {booking.status === 'checked_out' && (
                    <button
                      onClick={() => onNavigateToHandover(booking.id)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold font-inter bg-[#879078] text-white hover:bg-[#6c7460] transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>Return &amp; Verify Inspection</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {booking.status === 'returned' && !booking.reviewed && (
                    <button
                      onClick={() => onOpenReviewModal(booking)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold font-inter bg-[#F7E7CE] text-[#6F4E37] border border-[#D8C3A5] hover:bg-[#BF6B2E] hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                      <span>Rate &amp; Review</span>
                    </button>
                  )}

                  {booking.status === 'returned' && booking.reviewed && (
                    <span className="inline-flex items-center gap-1 text-xs font-inter text-[#879078] font-semibold bg-[#879078]/10 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Review Submitted ({booking.rating}★)</span>
                    </span>
                  )}

                  {resource && (
                    <button
                      onClick={() => onSelectResource(resource)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium font-inter border border-[#D8C3A5] text-[#34251F] hover:bg-[#F7E7CE] transition-colors"
                    >
                      View Resource
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions Floating Menu */}
      <QuickActionsFloatingMenu
        currentProfile={currentProfile}
        bookings={bookings}
        resources={resources}
        onNavigateToHandover={onNavigateToHandover}
        onExplore={onExplore}
        onOpenReviewModal={onOpenReviewModal}
        onSelectTab={setActiveTab}
        onStateChange={onStateChange}
      />
    </div>
  );
};
