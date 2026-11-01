import React, { useState } from 'react';
import {
  GraduationCap,
  Wrench,
  Building2,
  Lock,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Layers,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../../types';
import { canAccessDashboard, DashboardType } from '../../utils/auth';
import { DashboardAuthModal } from '../auth/DashboardAuthModal';

interface DashboardHeaderNavProps {
  currentDashboard: DashboardType;
  currentProfile: UserProfile;
  onNavigateDashboard: (target: DashboardType) => void;
  onAuthenticateAndSwitch: (profile: UserProfile, target: DashboardType) => void;
  // Metrics summary
  borrowerActiveCount?: number;
  custodianPendingCount?: number;
  adminOpenIncidentsCount?: number;
  totalAssetsCount?: number;
}

export const DashboardHeaderNav: React.FC<DashboardHeaderNavProps> = ({
  currentDashboard,
  currentProfile,
  onNavigateDashboard,
  onAuthenticateAndSwitch,
  borrowerActiveCount = 0,
  custodianPendingCount = 0,
  adminOpenIncidentsCount = 0,
  totalAssetsCount = 0
}) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [targetAuthDashboard, setTargetAuthDashboard] = useState<DashboardType>('custodian_dashboard');

  const dashboards = [
    {
      id: 'borrower_dashboard' as DashboardType,
      title: 'Borrower Dashboard',
      category: 'Researcher & Student Portal',
      description: 'Active equipment in hand, requests, returns & star ratings',
      icon: <GraduationCap className="w-5 h-5 text-blue-600" />,
      activeColor: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40',
      badge: `${borrowerActiveCount} In Hand`,
      requiredRole: 'requester' as const
    },
    {
      id: 'custodian_dashboard' as DashboardType,
      title: 'Custodian Dashboard',
      category: 'Lab Operations & Inventory',
      description: 'Equipment custody, 1-click approvals & handover verification',
      icon: <Wrench className="w-5 h-5 text-amber-700" />,
      activeColor: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40',
      badge: custodianPendingCount > 0 ? `${custodianPendingCount} Awaiting Approval` : 'Queue Clear',
      requiredRole: 'owner' as const
    },
    {
      id: 'admin_dashboard' as DashboardType,
      title: 'Admin Dashboard',
      category: 'Institutional Oversight',
      description: 'Fleet metrics, cross-department capital savings & master audit',
      icon: <Building2 className="w-5 h-5 text-purple-700" />,
      activeColor: 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/40',
      badge: `${totalAssetsCount || 8} Assets • ${adminOpenIncidentsCount} Incidents`,
      requiredRole: 'admin' as const
    }
  ];

  const handleCardClick = (dashboardId: DashboardType) => {
    if (dashboardId === currentDashboard) return;

    const hasAccess = canAccessDashboard(currentProfile, dashboardId);
    if (hasAccess) {
      onNavigateDashboard(dashboardId);
    } else {
      // Prompt for login credentials!
      setTargetAuthDashboard(dashboardId);
      setAuthModalOpen(true);
    }
  };

  const handleManualLoginClick = (dashboardId: DashboardType, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetAuthDashboard(dashboardId);
    setAuthModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner explaining separated dashboards */}
      <div className="bg-white rounded-2xl border border-[#D8C3A5] p-5 shadow-xs space-y-3 font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#D8C3A5]/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#6F4E37] text-white flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-[#34251F] tracking-tight">
                  ResourceBridge Institutional Dashboards
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F7E7CE] text-[#6F4E37] border border-[#D8C3A5]">
                  Separated Role Views
                </span>
              </div>
              <p className="text-xs text-stone-500 font-inter">
                Distinct operational dashboards for Borrowers, Lab Custodians, and System Administrators.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-inter text-stone-600 bg-[#FFFAF2] px-3 py-1.5 rounded-xl border border-[#D8C3A5]">
            <span className="font-semibold text-stone-700">Logged in as:</span>
            <span className="font-bold text-[#6F4E37]">{currentProfile.display_name}</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-[#F7E7CE] text-[#6F4E37]">
              {currentProfile.role}
            </span>
          </div>
        </div>

        {/* 3 Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {dashboards.map(d => {
            const isCurrent = d.id === currentDashboard;
            const isAuthorized = canAccessDashboard(currentProfile, d.id);

            return (
              <div
                key={d.id}
                onClick={() => handleCardClick(d.id)}
                className={`relative rounded-xl border p-4 transition-all text-left flex flex-col justify-between gap-3 cursor-pointer select-none ${
                  isCurrent
                    ? `${d.activeColor} shadow-xs`
                    : 'bg-white border-[#D8C3A5]/80 hover:border-[#BF6B2E] hover:bg-[#FFFAF2]/50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white border border-[#D8C3A5]/70 shadow-xs">
                        {d.icon}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-inter">
                        {d.category}
                      </span>
                    </div>

                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6F4E37] text-white">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active View</span>
                      </span>
                    ) : isAuthorized ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Authorized
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Lock className="w-2.5 h-2.5 text-amber-700" />
                        <span>Requires Login</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#34251F] font-inter">
                      {d.title}
                    </h3>
                    <p className="text-[11px] text-stone-600 font-inter line-clamp-2 mt-0.5 leading-snug">
                      {d.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-inter">
                  <span className="font-semibold text-stone-700 text-[11px] bg-stone-100/80 px-2 py-0.5 rounded">
                    {d.badge}
                  </span>

                  {isCurrent ? (
                    <span className="text-[#6F4E37] font-bold text-[11px]">
                      Currently Active
                    </span>
                  ) : isAuthorized ? (
                    <button
                      type="button"
                      onClick={() => onNavigateDashboard(d.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#BF6B2E] hover:underline"
                    >
                      <span>Switch View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleManualLoginClick(d.id, e)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-100/60 hover:bg-amber-100 px-2 py-0.5 rounded transition-colors"
                    >
                      <KeyRound className="w-3 h-3 text-amber-700" />
                      <span>Enter Credentials</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Credential Login Modal */}
      <DashboardAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        targetDashboard={targetAuthDashboard}
        onSuccess={(profile, target) => {
          onAuthenticateAndSwitch(profile, target);
        }}
      />
    </div>
  );
};
