import React, { useMemo, useState } from 'react';
import { Booking, IncidentReport, ResourceItem, UserProfile } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { calculateUtilizationStats } from '../utils/rules';
import {
  generateBookingsCSVContent,
  generateUtilizationSummaryCSVContent,
  downloadCSV
} from '../utils/csvExport';
import { CampusMapsAssistant } from '../components/common/CampusMapsAssistant';
import {
  BarChart3,
  Building,
  TrendingUp,
  Clock,
  Layers,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Users,
  Activity,
  Filter,
  Download,
  FileSpreadsheet,
  Check,
  Search,
  X
} from 'lucide-react';

interface ManagerDashboardProps {
  resources: ResourceItem[];
  bookings: Booking[];
  incidents: IncidentReport[];
  currentProfile: UserProfile;
  onNavigateToHandover: (bookingId: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  resources,
  bookings,
  incidents,
  currentProfile,
  onNavigateToHandover
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [exportNotification, setExportNotification] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const stats = useMemo(() => {
    return calculateUtilizationStats(resources, bookings);
  }, [resources, bookings]);

  // Breakdown by category
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { total: number; booked: number }> = {};
    resources.forEach(r => {
      if (!map[r.category]) {
        map[r.category] = { total: 0, booked: 0 };
      }
      map[r.category].total += 1;
    });

    bookings.forEach(b => {
      if (['approved', 'checked_out', 'return_pending'].includes(b.status)) {
        if (map[b.resource_category]) {
          map[b.resource_category].booked += 1;
        }
      }
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      total: data.total,
      booked: data.booked,
      utilizationPercent: Math.round((data.booked / Math.max(1, data.total * 3)) * 100)
    }));
  }, [resources, bookings]);

  const recentIncidents = useMemo(() => incidents.slice(0, 4), [incidents]);

  // Filtered table rows
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (selectedCategory !== 'All' && b.resource_category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== 'All' && b.status !== selectedStatus) {
        return false;
      }
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        const matchTitle = b.resource_title.toLowerCase().includes(q);
        const matchName = b.requester_name.toLowerCase().includes(q);
        const matchDept = b.requester_department.toLowerCase().includes(q);
        const matchLoc = b.location_label.toLowerCase().includes(q);
        if (!matchTitle && !matchName && !matchDept && !matchLoc) return false;
      }
      return true;
    });
  }, [bookings, selectedCategory, selectedStatus, tableSearch]);

  // CSV Export Handlers
  const handleExportBookings = (subsetOnly: boolean = false) => {
    const targetData = subsetOnly ? filteredBookings : bookings;
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `resourcebridge-bookings-report-${dateStr}.csv`;
    const csvContent = generateBookingsCSVContent(targetData);

    downloadCSV(csvContent, filename);
    setShowExportMenu(false);
    setExportNotification(`Exported ${targetData.length} booking records to ${filename}`);
    setTimeout(() => setExportNotification(null), 4500);
  };

  const handleExportUtilization = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `resourcebridge-utilization-report-${dateStr}.csv`;
    const csvContent = generateUtilizationSummaryCSVContent(resources, bookings);

    downloadCSV(csvContent, filename);
    setShowExportMenu(false);
    setExportNotification(`Exported ${resources.length} resource utilization metrics to ${filename}`);
    setTimeout(() => setExportNotification(null), 4500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8C3A5] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
            // INSTITUTIONAL OPERATIONS & ANALYTICS
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34251F] mt-1">
            Institutional Utilization Insights
          </h1>
          <p className="text-xs sm:text-sm text-[#50453e] mt-1 font-inter">
            Cross-departmental capacity monitoring, active equipment handovers, and administrative reporting for {currentProfile.organisation_name}.
          </p>
        </div>

        {/* Action Controls: CSV Export Dropdown & Real-time Indicator */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Reports</span>
            </button>

            {/* Export Menu Popover */}
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#D8C3A5] p-2.5 z-50 text-xs font-inter space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2 py-1 border-b border-stone-100 font-bold uppercase tracking-wider text-[#6F4E37] text-[11px]">
                  Administrative Data Exports
                </div>

                <button
                  onClick={() => handleExportBookings(false)}
                  className="w-full text-left p-2 rounded-lg hover:bg-[#FFFAF2] hover:text-[#6F4E37] flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-[#BF6B2E]" />
                    <div>
                      <div className="font-semibold text-[#34251F]">All Bookings Dataset</div>
                      <div className="text-[10px] text-stone-500">{bookings.length} full reservation records</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded font-mono">.csv</span>
                </button>

                <button
                  onClick={() => handleExportUtilization()}
                  className="w-full text-left p-2 rounded-lg hover:bg-[#FFFAF2] hover:text-[#6F4E37] flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#6F4E37]" />
                    <div>
                      <div className="font-semibold text-[#34251F]">Resource Utilization Summary</div>
                      <div className="text-[10px] text-stone-500">{resources.length} assets with capacity stats</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded font-mono">.csv</span>
                </button>

                {filteredBookings.length !== bookings.length && (
                  <button
                    onClick={() => handleExportBookings(true)}
                    className="w-full text-left p-2 rounded-lg bg-[#FFFAF2] hover:bg-[#F7E7CE] text-[#BF6B2E] flex items-center justify-between transition-colors font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <span>Filtered View ({filteredBookings.length} records)</span>
                    </div>
                    <span className="text-[10px] bg-stone-200 px-1.5 py-0.5 rounded font-mono">.csv</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-[#D8C3A5] px-3.5 py-2 text-xs font-inter text-[#6F4E37] flex items-center gap-2 shadow-2xs">
            <Activity className="w-4 h-4 text-[#BF6B2E] animate-pulse" />
            <span className="hidden sm:inline">Audit Telemetry Live</span>
          </div>
        </div>
      </div>

      {/* Export Confirmation Toast */}
      {exportNotification && (
        <div className="p-3.5 rounded-xl bg-[#879078]/20 border border-[#879078] text-[#4f5745] text-xs font-inter flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#879078] shrink-0" />
            <span className="font-semibold">{exportNotification}</span>
          </div>
          <button
            onClick={() => setExportNotification(null)}
            className="text-stone-500 hover:text-stone-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          label="Total Catalog Items"
          value={stats.totalResources}
          subtitle={`${stats.activeResources} active & available`}
          icon={<Layers className="w-5 h-5 text-[#6F4E37]" />}
        />
        <MetricCard
          label="Overall Utilization"
          value={`${stats.utilizationRate}%`}
          subtitle="Hours booked vs idle baseline"
          trendText="+14% this month"
          icon={<TrendingUp className="w-5 h-5 text-[#BF6B2E]" />}
        />
        <MetricCard
          label="Active Custody Loans"
          value={stats.activeLoans}
          subtitle="Equipments checked out now"
          icon={<Clock className="w-5 h-5 text-[#6F4E37]" />}
        />
        <MetricCard
          label="Pending Approvals"
          value={stats.pendingRequests}
          subtitle="Awaiting custodian decision"
          isPositive={stats.pendingRequests === 0}
          trendText={stats.pendingRequests > 0 ? 'Review Needed' : 'Zero Backlog'}
          icon={<AlertTriangle className="w-5 h-5 text-[#BF6B2E]" />}
        />
      </div>

      {/* Department & Category Capacity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Category Utilization Bars (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#D8C3A5] pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#6F4E37] font-inter">
                Category Utilization Index
              </h3>
              <p className="text-xs text-stone-500 font-inter">
                Active reservation density vs idle machinery capacity.
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-[#BF6B2E]" />
          </div>

          <div className="space-y-4">
            {categoryBreakdown.map(cat => (
              <div key={cat.name} className="space-y-1.5 text-xs font-inter">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-[#34251F] font-bold">{cat.name}</span>
                  <span className="text-stone-500">
                    {cat.booked} in use / {cat.total} listings ({cat.utilizationPercent}%)
                  </span>
                </div>
                {/* Visual Bar */}
                <div className="w-full h-3 rounded-full bg-[#FFFAF2] border border-[#D8C3A5] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(8, Math.min(100, cat.utilizationPercent))}%`,
                      backgroundColor:
                        cat.utilizationPercent > 70
                          ? '#BF6B2E'
                          : cat.utilizationPercent > 35
                          ? '#6F4E37'
                          : '#879078'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety & Incident Summary (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#D8C3A5] pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#6F4E37] font-inter">
              Recent Discrepancies
            </h3>
            <span className="text-xs font-bold text-[#A94438] font-inter">
              {incidents.filter(i => i.status === 'open').length} Open
            </span>
          </div>

          {recentIncidents.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs font-inter">
              Zero active incidents or damage flags logged.
            </div>
          ) : (
            <div className="space-y-3">
              {recentIncidents.map(inc => (
                <div
                  key={inc.id}
                  className="p-3 rounded-xl border border-stone-200 bg-[#FFFAF2] text-xs font-inter space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#34251F] truncate max-w-[160px]">
                      {inc.resource_title}
                    </span>
                    <StatusBadge status={inc.status} size="sm" />
                  </div>
                  <p className="text-[11px] text-[#50453e] line-clamp-2">
                    {inc.description}
                  </p>
                  <div className="text-[10px] text-stone-400 pt-0.5">
                    Logged by {inc.reported_by_name} • {new Date(inc.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Google Maps Grounded Logistics & Supplier Assistant */}
      <CampusMapsAssistant />

      {/* Live System Activity Table with CSV Export Filters */}
      <div className="bg-white rounded-2xl border border-[#D8C3A5] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8C3A5] pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#6F4E37] font-inter">
              Active Institutional Bookings Stream ({filteredBookings.length})
            </h3>
            <p className="text-xs text-stone-500 font-inter">
              Administrative records with instant CSV export and status verification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportBookings(true)}
              className="px-3 py-1.5 rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#6F4E37] hover:bg-[#F7E7CE] text-xs font-semibold font-inter flex items-center gap-1.5 transition-colors"
              title="Download currently filtered table data as CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#BF6B2E]" />
              <span>Export Table (CSV)</span>
            </button>
          </div>
        </div>

        {/* Table Filters Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-2 text-xs font-inter">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={tableSearch}
              onChange={e => setTableSearch(e.target.value)}
              placeholder="Search resource, borrower, department..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F]"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F]"
            >
              <option value="All">All Categories</option>
              {Array.from(new Set(bookings.map(b => b.resource_category))).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F]"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="checked_out">Checked Out</option>
              <option value="returned">Returned</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-inter">
            <thead>
              <tr className="border-b border-[#D8C3A5] text-[#6F4E37] uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Resource & ID</th>
                <th className="py-2.5 px-3">Borrower & Dept</th>
                <th className="py-2.5 px-3">Scheduled Slot</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Handover</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400">
                    No bookings found matching current table filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.slice(0, 10).map(b => (
                  <tr key={b.id} className="hover:bg-[#FFFAF2] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#34251F]">
                      <div>{b.resource_title}</div>
                      <div className="text-[10px] text-stone-400 font-mono">#{b.id.substring(b.id.length - 6)}</div>
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      <div>{b.requester_name}</div>
                      <div className="text-[10px] text-stone-400">{b.requester_department}</div>
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      {new Date(b.start_at).toLocaleDateString()} ({new Date(b.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      {['approved', 'checked_out', 'return_pending'].includes(b.status) && (
                        <button
                          onClick={() => onNavigateToHandover(b.id)}
                          className="text-[#6F4E37] hover:text-[#BF6B2E] font-semibold text-xs"
                        >
                          Inspect
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
