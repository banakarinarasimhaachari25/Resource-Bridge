import React, { useState, useMemo } from 'react';
import { AuditEvent, Booking, IncidentReport, ResourceItem, UserProfile } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  BarChart3,
  Building,
  ShieldAlert,
  RotateCcw,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { DashboardHeaderNav } from '../components/dashboard/DashboardHeaderNav';
import { DashboardType } from '../utils/auth';

interface AdminDashboardProps {
  resources: ResourceItem[];
  bookings: Booking[];
  incidents: IncidentReport[];
  auditEvents: AuditEvent[];
  currentProfile: UserProfile;
  onNavigateToHandover?: (bookingId: string) => void;
  onSelectResource?: (resource: ResourceItem) => void;
  onNavigateDashboard?: (target: DashboardType) => void;
  onAuthenticateAndSwitch?: (profile: UserProfile, target: DashboardType) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  resources,
  bookings,
  incidents,
  auditEvents,
  currentProfile,
  onNavigateToHandover,
  onSelectResource,
  onNavigateDashboard,
  onAuthenticateAndSwitch
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'safety' | 'catalog'>('overview');
  const [auditSearch, setAuditSearch] = useState('');

  // Fleet Metrics
  const totalAssets = resources.length;
  const activeAssets = resources.filter(r => r.status === 'active').length;
  const totalBookings = bookings.length;
  const activeLoans = bookings.filter(b => b.status === 'checked_out' || b.status === 'return_pending').length;
  const openIncidents = incidents.filter(i => i.status !== 'resolved').length;

  // Calculation of institutional cost avoidance
  const totalHoursUsed = bookings.reduce((acc, b) => {
    const s = new Date(b.start_at).getTime();
    const e = new Date(b.end_at).getTime();
    return acc + Math.max(1, Math.round((e - s) / (1000 * 60 * 60)));
  }, 0);

  const estimatedDollarsSaved = totalHoursUsed * 110; // Institutional cross-sharing replacement value

  // Department breakdown
  const departmentBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach(b => {
      const dept = b.requester_department || 'General';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [bookings]);

  // Filtered audit events
  const filteredAudit = useMemo(() => {
    if (!auditSearch.trim()) return auditEvents.slice(0, 50);
    const q = auditSearch.toLowerCase();
    return auditEvents.filter(
      e =>
        e.action.toLowerCase().includes(q) ||
        e.actor_name.toLowerCase().includes(q) ||
        e.entity_title.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q)
    );
  }, [auditEvents, auditSearch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Separated Dashboards Hub */}
      <DashboardHeaderNav
        currentDashboard="admin_dashboard"
        currentProfile={currentProfile}
        onNavigateDashboard={onNavigateDashboard || (() => {})}
        onAuthenticateAndSwitch={onAuthenticateAndSwitch || (() => {})}
        borrowerActiveCount={activeLoans}
        custodianPendingCount={bookings.filter(b => b.status === 'pending').length}
        adminOpenIncidentsCount={openIncidents}
        totalAssetsCount={totalAssets}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8C3A5] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-800 font-inter">
            <span className="w-2 h-2 rounded-full bg-purple-700" />
            <span>Institutional Governance &amp; Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34251F] mt-1">
            Campus Shared Resource Administration
          </h1>
          <p className="text-xs sm:text-sm text-[#50453e] mt-1 font-inter">
            Campus-wide asset utilization metrics, inter-departmental capital savings, safety logs, and compliance audit trail.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-[#F7E7CE] border border-[#D8C3A5] px-3.5 py-1.5 rounded-xl text-xs font-inter font-semibold text-[#6F4E37]">
          <Activity className="w-4 h-4 text-[#BF6B2E]" />
          <span>Active Governance Mode: {currentProfile.display_name}</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#D8C3A5] p-5 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 font-inter uppercase tracking-wider">
            Total Equipment Fleet
          </div>
          <div className="text-3xl font-bold text-[#6F4E37] mt-1">
            {totalAssets} <span className="text-sm font-normal text-stone-500">Assets</span>
          </div>
          <div className="text-[11px] text-stone-500 font-inter mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{activeAssets} Active &amp; Available</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D8C3A5] p-5 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 font-inter uppercase tracking-wider">
            Cross-Dept Capital Saved
          </div>
          <div className="text-3xl font-bold text-emerald-700 mt-1">
            ${estimatedDollarsSaved.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-500 font-inter mt-1">
            Avoided third-party duplication
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D8C3A5] p-5 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 font-inter uppercase tracking-wider">
            Campus Bookings Handled
          </div>
          <div className="text-3xl font-bold text-[#BF6B2E] mt-1">
            {totalBookings}
          </div>
          <div className="text-[11px] text-stone-500 font-inter mt-1">
            {activeLoans} currently checked out
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#D8C3A5] p-5 shadow-xs">
          <div className="text-[11px] font-semibold text-stone-500 font-inter uppercase tracking-wider">
            Open Safety Incidents
          </div>
          <div className="text-3xl font-bold text-red-600 mt-1">
            {openIncidents}
          </div>
          <div className="text-[11px] text-stone-500 font-inter mt-1">
            {incidents.length - openIncidents} resolved successfully
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D8C3A5] font-inter text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-purple-800 text-purple-900 font-bold'
              : 'border-transparent text-stone-600 hover:text-[#6F4E37]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Utilization &amp; Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-purple-800 text-purple-900 font-bold'
              : 'border-transparent text-stone-600 hover:text-[#6F4E37]'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Institutional Audit Log</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800">
            {auditEvents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('safety')}
          className={`px-4 py-2.5 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'safety'
              ? 'border-purple-800 text-purple-900 font-bold'
              : 'border-transparent text-stone-600 hover:text-[#6F4E37]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Safety &amp; Incidents</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-100 text-red-800">
            {openIncidents}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2.5 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'border-purple-800 text-purple-900 font-bold'
              : 'border-transparent text-stone-600 hover:text-[#6F4E37]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Institution Resources</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-stone-100 text-stone-600">
            {resources.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[#34251F] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-800" />
              <span>Departmental Sharing Engagement</span>
            </h3>
            <p className="text-xs text-[#50453e] font-inter">
              Distribution of asset reservations across university departments:
            </p>

            <div className="space-y-3 pt-2">
              {departmentBreakdown.map(([dept, count]) => {
                const pct = Math.round((count / (totalBookings || 1)) * 100);
                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-inter">
                      <span className="font-semibold text-[#34251F]">{dept}</span>
                      <span className="text-stone-500">{count} bookings ({pct}%)</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-[#6F4E37] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[#34251F] flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-700" />
              <span>Cross-Campus Cost Savings Ledger</span>
            </h3>
            <div className="space-y-2 text-xs font-inter text-[#50453e]">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <strong className="text-emerald-900 block text-sm">Direct Equipment Re-use</strong>
                <span>Sharing existing 3D printers, oscilloscopes, and GPU compute clusters prevents redundant grant expenditures.</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <strong className="text-blue-900 block text-sm">Cross-Department Access</strong>
                <span>Researchers without dedicated cleanrooms or robotic test cells can leverage shared campus facilities safely.</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <strong className="text-amber-900 block text-sm">Transparent Cost Allocation</strong>
                <span>All resources clearly declare department grant coverage or hourly subsidized fees.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-[#34251F]">Immutable Institutional Audit Log</h3>
              <p className="text-xs text-stone-500 font-inter">
                Every action (reservation, approval, check-in inspection, return, review) is logged with timestamps.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                placeholder="Search audit trail..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-inter">
              <thead className="bg-[#FFFAF2] border-y border-[#D8C3A5] text-stone-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity Target</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredAudit.map(event => (
                  <tr key={event.id} className="hover:bg-stone-50/80">
                    <td className="py-2.5 px-3 text-stone-500 whitespace-nowrap">
                      {new Date(event.occurred_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#34251F] whitespace-nowrap">
                      {event.actor_name}
                      <span className="block text-[10px] text-stone-400 font-normal">({event.actor_role})</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-[#F7E7CE] text-[#6F4E37] font-semibold text-[10px]">
                        {event.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#34251F] max-w-xs truncate">
                      {event.entity_title}
                    </td>
                    <td className="py-2.5 px-3 text-stone-600 max-w-md">
                      {event.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Safety & Incidents */}
      {activeTab === 'safety' && (
        <div className="space-y-4">
          {incidents.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#D8C3A5] p-10 text-center text-xs text-stone-500 font-inter">
              Zero safety incidents recorded.
            </div>
          ) : (
            incidents.map(inc => (
              <div
                key={inc.id}
                className="bg-white rounded-xl border border-[#D8C3A5] p-5 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-sm text-[#34251F]">{inc.resource_title}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      inc.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {inc.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-[#50453e] font-inter">{inc.description}</p>
                <div className="text-[11px] text-stone-500 font-inter">
                  Reported by: {inc.reported_by_name} • Type: {inc.type} • {new Date(inc.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: All Catalog Resources */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map(r => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-[#D8C3A5] p-4 flex gap-3 items-center justify-between"
            >
              <img
                src={r.image_url}
                alt={r.title}
                className="w-16 h-16 rounded-lg object-cover border border-[#D8C3A5]"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-[#BF6B2E] uppercase truncate">{r.category}</div>
                <h4 className="text-xs font-bold text-[#34251F] truncate">{r.title}</h4>
                <div className="text-[11px] text-emerald-700 font-semibold">{r.cost_label}</div>
                <div className="text-[10px] text-stone-500 truncate">Custodian: {r.owner_name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
