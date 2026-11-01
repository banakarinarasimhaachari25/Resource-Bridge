import React, { useState, useEffect } from 'react';
import {
  ActiveView,
  Booking,
  IncidentReport,
  NotificationItem,
  ResourceCategory,
  ResourceItem,
  ResourceReview,
  UserProfile
} from './types';
import { db } from './services/db';
import { Navbar } from './components/layout/Navbar';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { DiscoverResources } from './pages/DiscoverResources';
import { ResourceDetails } from './pages/ResourceDetails';
import { BookingRequest } from './pages/BookingRequest';
import { BorrowerDashboard } from './pages/BorrowerDashboard';
import { CustodianDashboard } from './pages/CustodianDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { HandoverPage } from './pages/HandoverPage';
import { IncidentReports } from './pages/IncidentReports';
import { AddEditResource } from './pages/AddEditResource';
import { ActivityHistory } from './pages/ActivityHistory';
import { ProfilePage } from './pages/ProfilePage';
import { GuidelinesPage } from './pages/GuidelinesPage';
import { SubmitReviewModal } from './components/booking/SubmitReviewModal';
import { ChevronRight, Sparkles, X } from 'lucide-react';
import { DashboardType } from './utils/auth';

export default function App() {
  // Requirement 1 & 2: First login details need to be asked & no access before login
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('rb_session_active') === 'true';
  });

  const [currentView, setCurrentView] = useState<ActiveView>('discover');
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(db.getCurrentProfile());
  const [resources, setResources] = useState<ResourceItem[]>(db.getResources());
  const [bookings, setBookings] = useState<Booking[]>(db.getBookings());
  const [reviews, setReviews] = useState<ResourceReview[]>(db.getReviews());
  const [incidents, setIncidents] = useState<IncidentReport[]>(db.getIncidents());
  const [notifications, setNotifications] = useState<NotificationItem[]>(db.getNotifications());
  const [auditEvents, setAuditEvents] = useState(db.getActivityLogs());
  const [waitlist, setWaitlist] = useState(db.getWaitlist());

  // Navigation & Modal state helpers
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [resourceToEdit, setResourceToEdit] = useState<ResourceItem | null>(null);
  const [handoverBookingId, setHandoverBookingId] = useState<string | null>(null);
  const [incidentBookingId, setIncidentBookingId] = useState<string | null>(null);
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null);
  const [initialCategoryFilter, setInitialCategoryFilter] = useState<ResourceCategory | null>(null);
  const [showDemoTour, setShowDemoTour] = useState(false);

  // Sync state helper
  const syncState = () => {
    setResources(db.getResources());
    setBookings(db.getBookings());
    setReviews(db.getReviews());
    setIncidents(db.getIncidents());
    setNotifications(db.getNotifications(currentProfile.id));
    setAuditEvents(db.getActivityLogs());
    setWaitlist(db.getWaitlist());
  };

  useEffect(() => {
    syncState();
  }, [currentProfile]);

  const handleLogin = (profile: UserProfile) => {
    db.setCurrentProfile(profile);
    setCurrentProfile(profile);
    setIsAuthenticated(true);
    localStorage.setItem('rb_session_active', 'true');
    syncState();

    // Direct routing to appropriate initial view based on role
    if (profile.role === 'requester') {
      setCurrentView('discover');
    } else if (profile.role === 'owner') {
      setCurrentView('custodian_dashboard');
    } else {
      setCurrentView('admin_dashboard');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('rb_session_active');
    setSelectedResource(null);
  };

  const handleSwitchProfile = (profile: UserProfile) => {
    db.setCurrentProfile(profile);
    setCurrentProfile(profile);
  };

  const handleResetData = () => {
    db.resetToDemo();
    setCurrentProfile(db.getCurrentProfile());
    syncState();
    setSelectedResource(null);
    setCurrentView('discover');
  };

  // Booking creation
  const handleBookingSubmit = (params: {
    resource_id: string;
    start_at: string;
    end_at: string;
    purpose: string;
    num_users: number;
    training_confirmed: boolean;
    rules_agreed: boolean;
  }) => {
    const res = db.createBooking(params);
    if (res.success && res.booking) {
      syncState();
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  // Booking approvals
  const handleApproveBooking = (bookingId: string, note?: string) => {
    const res = db.approveBooking(bookingId, note);
    if (res.success) {
      syncState();
    } else {
      alert(res.error || 'Failed to approve booking.');
    }
  };

  const handleRejectBooking = (bookingId: string, reason: string) => {
    const res = db.rejectBooking(bookingId, reason);
    if (res.success) {
      syncState();
    } else {
      alert(res.error || 'Failed to decline booking.');
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    const res = db.cancelBooking(bookingId);
    if (res.success) {
      syncState();
    }
  };

  // Handover actions
  const handleRecordCheckin = (params: any) => {
    const res = db.recordCheckin(params);
    if (res.success) {
      syncState();
    }
    return res;
  };

  const handleRecordReturn = (params: any) => {
    const res = db.recordReturn(params);
    if (res.success) {
      syncState();
    }
    return res;
  };

  // Incidents
  const handleReportIncident = (params: any) => {
    const res = db.reportIncident(params);
    if (res.success) {
      syncState();
      setCurrentView('incidents');
    }
    return res;
  };

  const handleResolveIncident = (incidentId: string, note: string) => {
    db.resolveIncident(incidentId, note);
    syncState();
  };

  // Equipment Star Rating & Review Submission
  const handleReviewSubmit = (params: {
    booking_id: string;
    resource_id: string;
    rating: number;
    comment: string;
    reliability_score?: number;
    cleanliness_score?: number;
  }) => {
    const res = db.submitReview(params);
    if (res.success) {
      syncState();
      if (selectedResource && selectedResource.id === params.resource_id) {
        setSelectedResource(db.getResourceById(params.resource_id) || selectedResource);
      }
    } else {
      alert(res.error || 'Failed to submit review.');
    }
  };

  // Waitlist
  const handleJoinWaitlist = (resourceId: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = tomorrow.toISOString();
    tomorrow.setHours(tomorrow.getHours() + 3);
    const end = tomorrow.toISOString();

    const res = db.joinWaitlist({
      resource_id: resourceId,
      desired_start_at: start,
      desired_end_at: end
    });

    if (res.success) {
      syncState();
      alert(`Joined waitlist successfully! You are #${res.position} in line.`);
    }
  };

  // Save resource listing
  const handleSaveResource = (resourceData: any) => {
    try {
      db.saveResource(resourceData);
      syncState();
      setCurrentView('custodian_dashboard');
    } catch (e: any) {
      alert(e.message || 'Error saving resource');
    }
  };

  const pendingApprovalsCount = bookings.filter(b => b.status === 'pending').length;

  // STRICT AUTHENTICATION GATE (Requirement 1 & 2):
  // If not authenticated, render ONLY the login page.
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#FFFAF2] text-[#34251F] flex flex-col font-sans selection:bg-[#F7E7CE] selection:text-[#34251F]">
      {/* Global Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentProfile={currentProfile}
        onSwitchProfile={handleSwitchProfile}
        notifications={notifications}
        onMarkNotificationRead={id => {
          db.markNotificationRead(id);
          syncState();
        }}
        onMarkAllNotificationsRead={() => {
          db.markAllNotificationsRead();
          syncState();
        }}
        onResetData={handleResetData}
        pendingApprovalsCount={pendingApprovalsCount}
        onLogout={handleLogout}
      />

      {/* Floating Demo Tour Assistant Banner */}
      <div className="bg-[#F7E7CE] border-b border-[#D8C3A5] px-4 py-2 text-xs font-inter flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#6F4E37]">
            <Sparkles className="w-4 h-4 text-[#BF6B2E]" />
            <span className="font-semibold">Hackathon Jury Navigation:</span>
            <span className="hidden sm:inline text-stone-600">
              Active Persona: <strong className="text-[#34251F]">{currentProfile.display_name}</strong> ({currentProfile.role.toUpperCase()}) • Switch anytime in the top right profile menu.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDemoTour(!showDemoTour)}
              className="text-[#BF6B2E] font-bold hover:underline flex items-center gap-1"
            >
              <span>{showDemoTour ? 'Hide Test Guide' : 'View Demo Script'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Demo Tour Checklist Modal */}
      {showDemoTour && (
        <div className="bg-white border-b border-[#D8C3A5] p-5 shadow-md">
          <div className="max-w-4xl mx-auto space-y-3 text-xs font-inter">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm uppercase text-[#6F4E37] tracking-wider">
                End-to-End Evaluation Flow
              </span>
              <button onClick={() => setShowDemoTour(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              <div className="p-2.5 rounded-lg bg-[#FFFAF2] border border-[#D8C3A5]">
                <strong className="text-[#6F4E37] block">1. Discover &amp; Cost Badges</strong>
                <span>Inspect cost badges on every listing card. Click &ldquo;Show Clear Descriptions&rdquo; or filter by Free / Subsidized.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FFFAF2] border border-[#D8C3A5]">
                <strong className="text-[#6F4E37] block">2. Simple &amp; Clear Details</strong>
                <span>Click &ldquo;View Details&rdquo; on any asset to review simple specs, safety rules, and direct booking actions.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FFFAF2] border border-[#D8C3A5]">
                <strong className="text-[#6F4E37] block">3. Borrower Dashboard</strong>
                <span>Switch to Borrower Dashboard to monitor active loans, return countdowns, and rate completed bookings.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FFFAF2] border border-[#D8C3A5]">
                <strong className="text-[#6F4E37] block">4. Custodian Dashboard</strong>
                <span>Open Custodian Dashboard (or switch to Prof. Marcus Vance) to approve/decline pending requests.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FFFAF2] border border-[#D8C3A5]">
                <strong className="text-[#6F4E37] block">5. Admin Dashboard</strong>
                <span>Open Admin Dashboard (Elena Rostova) for campus utilization metrics and full immutable audit ledger.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FFFAF2] border border-[#D8C3A5]">
                <strong className="text-[#6F4E37] block">6. Authentication Gate</strong>
                <span>Click &ldquo;Sign Out&rdquo; in the top right to verify that access is strictly gated before login.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={(view, cat) => {
              if (cat) setInitialCategoryFilter(cat);
              setCurrentView(view);
            }}
            onExploreResources={() => setCurrentView('discover')}
            onListResource={() => {
              if (currentProfile.role === 'requester') {
                db.switchRole('owner');
                setCurrentProfile(db.getCurrentProfile());
              }
              setCurrentView('add_resource');
            }}
          />
        )}

        {currentView === 'discover' && (
          <DiscoverResources
            resources={resources}
            currentProfile={currentProfile}
            initialCategory={initialCategoryFilter}
            onSelectResource={r => {
              setSelectedResource(r);
              setCurrentView('resource_details');
            }}
            onRequestBooking={r => {
              setSelectedResource(r);
              setCurrentView('booking_request');
            }}
          />
        )}

        {currentView === 'resource_details' && selectedResource && (
          <ResourceDetails
            resource={selectedResource}
            currentProfile={currentProfile}
            waitlist={waitlist}
            reviews={reviews}
            userBookings={bookings.filter(b => b.requester_id === currentProfile.id)}
            onBack={() => setCurrentView('discover')}
            onRequestBooking={r => {
              setSelectedResource(r);
              setCurrentView('booking_request');
            }}
            onJoinWaitlist={handleJoinWaitlist}
            onOpenReviewModal={b => setReviewModalBooking(b)}
          />
        )}

        {currentView === 'booking_request' && selectedResource && (
          <BookingRequest
            resource={selectedResource}
            currentProfile={currentProfile}
            existingBookings={bookings}
            onSubmitBooking={handleBookingSubmit}
            onCancel={() => setCurrentView('resource_details')}
            onSuccess={() => setCurrentView('borrower_dashboard')}
          />
        )}

        {/* Separated Dashboards (Requirement 3 & Dashboard Hub) */}
        {(currentView === 'borrower_dashboard' || currentView === 'my_bookings') && (
          <BorrowerDashboard
            bookings={bookings}
            resources={resources}
            reviews={reviews}
            currentProfile={currentProfile}
            onCancelBooking={handleCancelBooking}
            onNavigateToHandover={bookingId => {
              setHandoverBookingId(bookingId);
              setCurrentView('handover');
            }}
            onExplore={() => setCurrentView('discover')}
            onOpenReviewModal={b => setReviewModalBooking(b)}
            onSelectResource={r => {
              setSelectedResource(r);
              setCurrentView('resource_details');
            }}
            onNavigateDashboard={target => setCurrentView(target as ActiveView)}
            onAuthenticateAndSwitch={(newProfile, target) => {
              handleSwitchProfile(newProfile);
              setCurrentView(target as ActiveView);
            }}
          />
        )}

        {(currentView === 'custodian_dashboard' || currentView === 'owner_dashboard') && (
          <CustodianDashboard
            resources={resources}
            bookings={bookings}
            currentProfile={currentProfile}
            onApproveBooking={handleApproveBooking}
            onRejectBooking={handleRejectBooking}
            onNavigateToHandover={bookingId => {
              setHandoverBookingId(bookingId);
              setCurrentView('handover');
            }}
            onAddResource={() => {
              setResourceToEdit(null);
              setCurrentView('add_resource');
            }}
            onEditResource={r => {
              setResourceToEdit(r);
              setCurrentView('add_resource');
            }}
            onSelectResource={r => {
              setSelectedResource(r);
              setCurrentView('resource_details');
            }}
            onNavigateDashboard={target => setCurrentView(target as ActiveView)}
            onAuthenticateAndSwitch={(newProfile, target) => {
              handleSwitchProfile(newProfile);
              setCurrentView(target as ActiveView);
            }}
          />
        )}

        {(currentView === 'admin_dashboard' || currentView === 'manager_dashboard') && (
          <AdminDashboard
            resources={resources}
            bookings={bookings}
            incidents={incidents}
            auditEvents={auditEvents}
            currentProfile={currentProfile}
            onNavigateToHandover={bookingId => {
              setHandoverBookingId(bookingId);
              setCurrentView('handover');
            }}
            onSelectResource={r => {
              setSelectedResource(r);
              setCurrentView('resource_details');
            }}
            onNavigateDashboard={target => setCurrentView(target as ActiveView)}
            onAuthenticateAndSwitch={(newProfile, target) => {
              handleSwitchProfile(newProfile);
              setCurrentView(target as ActiveView);
            }}
          />
        )}

        {currentView === 'handover' && (
          <HandoverPage
            bookings={bookings}
            currentProfile={currentProfile}
            initialBookingId={handoverBookingId}
            getHandoverRecords={id => db.getHandoverRecords(id)}
            onRecordCheckin={handleRecordCheckin}
            onRecordReturn={handleRecordReturn}
            onOpenReviewModal={b => setReviewModalBooking(b)}
          />
        )}

        {currentView === 'incidents' && (
          <IncidentReports
            incidents={incidents}
            resources={resources}
            bookings={bookings}
            currentProfile={currentProfile}
            initialBookingId={incidentBookingId}
            onReportIncident={handleReportIncident}
            onResolveIncident={handleResolveIncident}
          />
        )}

        {currentView === 'add_resource' && (
          <AddEditResource
            resourceToEdit={resourceToEdit}
            currentProfile={currentProfile}
            onSave={handleSaveResource}
            onCancel={() => {
              setResourceToEdit(null);
              setCurrentView('custodian_dashboard');
            }}
          />
        )}

        {currentView === 'activity_history' && (
          <ActivityHistory
            auditEvents={auditEvents}
            currentProfile={currentProfile}
          />
        )}

        {currentView === 'user_profile' && (
          <ProfilePage
            currentProfile={currentProfile}
            onSwitchProfile={handleSwitchProfile}
          />
        )}

        {currentView === 'guidelines' && (
          <GuidelinesPage />
        )}
      </main>

      {/* Submit Star Rating & Review Modal */}
      {reviewModalBooking && (
        <SubmitReviewModal
          booking={reviewModalBooking}
          isOpen={Boolean(reviewModalBooking)}
          onClose={() => setReviewModalBooking(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
