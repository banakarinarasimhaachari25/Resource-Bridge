import React, { useState } from 'react';
import {
  ActiveView,
  NotificationItem,
  UserProfile,
  UserRole
} from '../../types';
import { DEMO_PROFILES, isSupabaseConfigured } from '../../services/db';
import {
  Compass,
  CalendarCheck,
  ClipboardList,
  ArrowRightLeft,
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle,
  Menu,
  X,
  RotateCcw,
  UserCheck,
  ShieldAlert,
  Sliders,
  ExternalLink,
  BookOpen,
  Info,
  LogOut,
  User,
  GraduationCap,
  Wrench,
  Building2,
  ChevronDown,
  Layers,
  Lock,
  KeyRound
} from 'lucide-react';
import { DashboardAuthModal } from '../auth/DashboardAuthModal';
import { canAccessDashboard, DashboardType } from '../../utils/auth';

interface NavbarProps {
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  currentProfile: UserProfile;
  onSwitchProfile: (profile: UserProfile) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onResetData: () => void;
  pendingApprovalsCount: number;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  currentProfile,
  onSwitchProfile,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onResetData,
  pendingApprovalsCount,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [dashboardsDropdownOpen, setDashboardsDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [targetAuthDashboard, setTargetAuthDashboard] = useState<DashboardType>('custodian_dashboard');
  const [authSuggestedEmail, setAuthSuggestedEmail] = useState<string>('');

  const unreadNotifs = notifications.filter(n => !n.read);

  // Clearly separated dashboard navigation options (Requirement 3: Separate the dashboards)
  const dashboardItems = [
    {
      id: 'borrower_dashboard',
      label: 'Borrower Dashboard',
      description: 'Active loans, return deadlines & ratings',
      icon: <GraduationCap className="w-4 h-4 text-blue-600" />,
      badge: undefined
    },
    {
      id: 'custodian_dashboard',
      label: 'Custodian Dashboard',
      description: 'Equipment custody & approval queue',
      icon: <Wrench className="w-4 h-4 text-amber-700" />,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined
    },
    {
      id: 'admin_dashboard',
      label: 'Admin Dashboard',
      description: 'Fleet metrics, audit ledger & savings',
      icon: <Building2 className="w-4 h-4 text-purple-700" />,
      badge: undefined
    }
  ];

  const standardNavItems = [
    { id: 'discover', label: 'Discover Equipment', icon: <Compass className="w-4 h-4" /> },
    { id: 'handover', label: 'Handover & Return', icon: <ArrowRightLeft className="w-4 h-4" /> },
    { id: 'incidents', label: 'Incidents', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'activity_history', label: 'Audit Log', icon: <RotateCcw className="w-4 h-4" /> }
  ];

  const isCurrentViewDashboard =
    currentView === 'borrower_dashboard' ||
    currentView === 'custodian_dashboard' ||
    currentView === 'admin_dashboard' ||
    currentView === 'my_bookings' ||
    currentView === 'owner_dashboard' ||
    currentView === 'manager_dashboard';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFAF2] border-b border-[#D8C3A5] shadow-xs">
      {/* Top Hackathon Telemetry Bar */}
      <div className="bg-[#6F4E37] text-[#FFFAF2] px-4 py-1.5 text-xs font-inter flex flex-wrap items-center justify-between gap-2 border-b border-[#553722]">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-[#F7E7CE] uppercase">
            // RESOURCEBRIDGE ACADEMIC SYSTEM
          </span>
          <span className="hidden sm:inline text-stone-300">•</span>
          <span className="hidden sm:inline text-stone-200">
            Authenticated as <strong className="text-white">{currentProfile.display_name}</strong> ({currentProfile.role.toUpperCase()})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Supabase status badge */}
          <div className="flex items-center gap-1.5 bg-[#553722] px-2.5 py-0.5 rounded-full text-[11px] text-[#F7E7CE]">
            <span className="w-2 h-2 rounded-full bg-[#879078] animate-pulse" />
            <span>{isSupabaseConfigured ? 'Supabase Live DB' : 'Local Demo Storage (Supabase Ready)'}</span>
          </div>

          {/* Quick Reset Demo */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo resources, bookings, and test records to initial state?')) {
                onResetData();
              }
            }}
            title="Reset dataset to initial state"
            className="hover:text-amber-200 text-stone-300 transition-colors flex items-center gap-1 text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Seed Data</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setCurrentView('discover')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-[#6F4E37] flex items-center justify-center text-[#FFFAF2] shadow-sm group-hover:bg-[#553722] transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M4 19h16v2H4zm2-4h12v2H6zm-2-6h16v2H4zm3-5h10v2H7z" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-[#6F4E37] font-sans group-hover:text-[#553722]">
                  ResourceBridge
                </span>
                <span className="hidden lg:block text-[10px] text-[#50453e] font-inter uppercase tracking-widest -mt-1">
                  Share • Reduce Costs • Build
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setCurrentView('discover')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold font-inter flex items-center gap-1.5 transition-all ${
                  currentView === 'discover'
                    ? 'bg-[#BF6B2E] text-[#FFFAF2] shadow-xs'
                    : 'text-[#34251F] hover:bg-[#F7E7CE] hover:text-[#6F4E37]'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Discover</span>
              </button>

              {/* SEPARATED DASHBOARDS DROPDOWN (Requirement 3: Separate the dashboards) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDashboardsDropdownOpen(!dashboardsDropdownOpen)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold font-inter flex items-center gap-1.5 transition-all ${
                    isCurrentViewDashboard
                      ? 'bg-[#6F4E37] text-white shadow-xs'
                      : 'text-[#34251F] hover:bg-[#F7E7CE] hover:text-[#6F4E37]'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Dashboards</span>
                  {pendingApprovalsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#A94438] text-white">
                      {pendingApprovalsCount}
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {dashboardsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white border border-[#D8C3A5] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-inter px-3 py-1.5 border-b border-[#D8C3A5]/50">
                      Separated Portals &amp; Dashboards
                    </div>

                    <div className="space-y-1 pt-1.5">
                      {dashboardItems.map(d => {
                        const isSelected =
                          currentView === d.id ||
                          (d.id === 'borrower_dashboard' && currentView === 'my_bookings') ||
                          (d.id === 'custodian_dashboard' && currentView === 'owner_dashboard') ||
                          (d.id === 'admin_dashboard' && currentView === 'manager_dashboard');

                        const isAuthorized = canAccessDashboard(currentProfile, d.id as DashboardType);

                        return (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => {
                              if (isAuthorized) {
                                setCurrentView(d.id as ActiveView);
                                setDashboardsDropdownOpen(false);
                              } else {
                                setTargetAuthDashboard(d.id as DashboardType);
                                setAuthSuggestedEmail('');
                                setAuthModalOpen(true);
                                setDashboardsDropdownOpen(false);
                              }
                            }}
                            className={`w-full text-left p-2.5 rounded-lg text-xs font-inter flex items-start gap-3 transition-colors ${
                              isSelected
                                ? 'bg-[#F7E7CE] text-[#6F4E37] font-bold border border-[#D8C3A5]'
                                : 'hover:bg-stone-50 text-stone-800'
                            }`}
                          >
                            <div className="mt-0.5">{d.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#34251F]">{d.label}</span>
                                {d.badge ? (
                                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-bold">
                                    {d.badge}
                                  </span>
                                ) : !isAuthorized ? (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                                    <Lock className="w-2.5 h-2.5" />
                                    <span>Sign In</span>
                                  </span>
                                ) : null}
                              </div>
                              <div className="text-[11px] text-stone-500 font-normal truncate mt-0.5">
                                {d.description}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {standardNavItems.map(item => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id as ActiveView);
                      setDashboardsDropdownOpen(false);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium font-inter flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-[#BF6B2E] text-[#FFFAF2] shadow-xs'
                        : 'text-[#34251F] hover:bg-[#F7E7CE] hover:text-[#6F4E37]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Utilities & User Menu */}
          <div className="flex items-center gap-3">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-lg text-[#6F4E37] hover:bg-[#F7E7CE] transition-colors focus:outline-none"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#BF6B2E] ring-2 ring-[#FFFAF2]" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-[#D8C3A5] shadow-lg p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-[#D8C3A5] text-xs font-inter">
                    <span className="font-bold text-[#34251F]">Notifications ({unreadNotifs.length})</span>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-[11px] text-[#BF6B2E] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 py-1 font-inter">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-stone-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 5).map(n => (
                        <div
                          key={n.id}
                          onClick={() => onMarkNotificationRead(n.id)}
                          className={`p-2.5 text-xs hover:bg-[#FFFAF2] rounded-lg cursor-pointer transition-colors ${
                            !n.read ? 'bg-[#F7E7CE]/40 font-semibold' : 'text-stone-600'
                          }`}
                        >
                          <div className="text-[#34251F] font-medium">{n.title}</div>
                          <div className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">{n.body}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-[#D8C3A5] bg-white hover:bg-[#F7E7CE] transition-all focus:outline-none"
              >
                <div className="w-7 h-7 rounded-lg bg-[#6F4E37] text-white flex items-center justify-center font-bold text-xs">
                  {currentProfile.display_name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left text-xs font-inter pr-1">
                  <div className="font-bold text-[#34251F] leading-tight truncate max-w-28">
                    {currentProfile.display_name}
                  </div>
                  <div className="text-[10px] text-stone-500 capitalize">{currentProfile.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-[#D8C3A5] shadow-xl p-3 z-50">
                  <div className="pb-3 border-b border-[#D8C3A5]">
                    <div className="font-bold text-xs text-[#34251F]">{currentProfile.display_name}</div>
                    <div className="text-[11px] text-stone-500">{currentProfile.email}</div>
                    <div className="text-[10px] text-[#BF6B2E] font-medium mt-0.5">{currentProfile.department}</div>
                  </div>

                  {/* Switch Persona */}
                  <div className="pt-2 text-[11px] font-bold uppercase tracking-wider text-stone-500 font-inter mb-1.5">
                    Switch Test Persona:
                  </div>

                  <div className="space-y-1">
                    {DEMO_PROFILES.map(prof => {
                      const isCurrent = prof.id === currentProfile.id;
                      return (
                        <button
                          key={prof.id}
                          type="button"
                          onClick={() => {
                            if (isCurrent) return;
                            setAuthSuggestedEmail(prof.email);
                            setTargetAuthDashboard(
                              prof.role === 'owner'
                                ? 'custodian_dashboard'
                                : prof.role === 'admin' || prof.role === 'manager'
                                ? 'admin_dashboard'
                                : 'borrower_dashboard'
                            );
                            setAuthModalOpen(true);
                            setProfileDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            isCurrent
                              ? 'bg-[#F7E7CE] text-[#6F4E37] font-semibold border border-[#D8C3A5]'
                              : 'hover:bg-stone-50 text-stone-700'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-[#34251F]">{prof.display_name}</div>
                            <div className="text-[10px] text-stone-500 capitalize">{prof.role} • {prof.department}</div>
                          </div>
                          {isCurrent ? (
                            <UserCheck className="w-4 h-4 text-[#BF6B2E]" />
                          ) : (
                            <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-semibold border border-amber-200 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Sign In</span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* PROMINENT LOGOUT / SIGN OUT BUTTON (Requirement 1 & 2) */}
                  <div className="mt-3 pt-2 border-t border-[#D8C3A5] space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full py-2 px-3 rounded-lg text-xs font-bold font-inter bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out of ResourceBridge</span>
                    </button>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <button
                        onClick={() => {
                          setCurrentView('user_profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="text-[#6F4E37] hover:underline"
                      >
                        Profile Details
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView('guidelines');
                          setProfileDropdownOpen(false);
                        }}
                        className="text-[#BF6B2E] hover:underline"
                      >
                        Lab Rules &amp; FAQ
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu hamburger */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#6F4E37] hover:bg-[#F7E7CE] focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFAF2] border-b border-[#D8C3A5] px-4 pt-2 pb-4 space-y-2">
          <div className="text-[11px] font-bold text-[#6F4E37] uppercase tracking-wider font-inter">
            Dashboards:
          </div>
          {dashboardItems.map(d => {
            const hasAccess = canAccessDashboard(currentProfile, d.id as DashboardType);
            return (
              <button
                key={d.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (hasAccess) {
                    setCurrentView(d.id as ActiveView);
                  } else {
                    setTargetAuthDashboard(d.id as DashboardType);
                    setAuthSuggestedEmail('');
                    setAuthModalOpen(true);
                  }
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between bg-white border border-[#D8C3A5]"
              >
                <div className="flex items-center gap-2">
                  {d.icon}
                  <span>{d.label}</span>
                </div>
                {d.badge ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-bold">
                    {d.badge}
                  </span>
                ) : !hasAccess ? (
                  <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-semibold border border-amber-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Sign In</span>
                  </span>
                ) : null}
              </button>
            );
          })}

          <div className="text-[11px] font-bold text-[#6F4E37] uppercase tracking-wider font-inter pt-2">
            Navigation:
          </div>
          {standardNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id as ActiveView);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 hover:bg-[#F7E7CE]"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

          <div className="pt-2 border-t border-[#D8C3A5]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full py-2 rounded-lg text-xs font-bold text-red-700 bg-red-50 border border-red-200 flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Dashboard & Role Authentication Modal */}
      <DashboardAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        targetDashboard={targetAuthDashboard}
        suggestedEmail={authSuggestedEmail}
        onSuccess={(profile, target) => {
          onSwitchProfile(profile);
          setCurrentView(target as ActiveView);
        }}
      />
    </header>
  );
};
