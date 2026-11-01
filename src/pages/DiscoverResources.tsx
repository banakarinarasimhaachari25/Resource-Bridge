import React, { useState, useMemo } from 'react';
import { ResourceCategory, ResourceItem, UserProfile } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { StarRating } from '../components/common/StarRating';
import { ResourceComparisonModal } from '../components/common/ResourceComparisonModal';
import { checkEligibility } from '../utils/rules';
import {
  Search,
  Filter,
  X,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Building,
  Coins,
  DollarSign,
  Tag,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Info,
  Scale,
  Trash2
} from 'lucide-react';

interface DiscoverResourcesProps {
  resources: ResourceItem[];
  currentProfile: UserProfile;
  onSelectResource: (resource: ResourceItem) => void;
  onRequestBooking?: (resource: ResourceItem) => void;
  initialCategory?: ResourceCategory | null;
}

export const DiscoverResources: React.FC<DiscoverResourcesProps> = ({
  resources,
  currentProfile,
  onSelectResource,
  onRequestBooking,
  initialCategory
}) => {
  // Input search text (user types here)
  const [searchInput, setSearchInput] = useState('');
  // Applied search query (triggered by Search button or Enter key)
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');

  // Description search toggle & detailed description preview toggle
  const [searchInDescription, setSearchInDescription] = useState(true);
  const [expandDescriptions, setExpandDescriptions] = useState(false);

  // Category and Building filters
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('All');

  // Cost and Basic Filters
  const [costFilter, setCostFilter] = useState<'all' | 'free' | 'under25' | 'over25'>('all');
  const [onlyEligible, setOnlyEligible] = useState<boolean>(false);
  const [onlyNoSupervision, setOnlyNoSupervision] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'rating' | 'cost_asc' | 'cost_desc' | 'title' | 'duration'>('rating');

  // Quick button filters
  const [quickButtonFilter, setQuickButtonFilter] = useState<string>('all');

  // Side-by-side comparison state (Requirement 7)
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [compareNotice, setCompareNotice] = useState<string | null>(null);

  const handleToggleCompare = (resourceId: string) => {
    if (selectedCompareIds.includes(resourceId)) {
      setSelectedCompareIds(prev => prev.filter(id => id !== resourceId));
      setCompareNotice(null);
    } else {
      if (selectedCompareIds.length >= 4) {
        setCompareNotice('You can compare up to 4 resources simultaneously.');
        setTimeout(() => setCompareNotice(null), 3500);
        return;
      }
      setSelectedCompareIds(prev => [...prev, resourceId]);
    }
  };

  const handleRemoveCompare = (resourceId: string) => {
    setSelectedCompareIds(prev => prev.filter(id => id !== resourceId));
  };

  const handleClearCompare = () => {
    setSelectedCompareIds([]);
    setCompareNotice(null);
  };

  const comparedResources = useMemo(() => {
    return selectedCompareIds
      .map(id => resources.find(r => r.id === id))
      .filter((r): r is ResourceItem => Boolean(r));
  }, [selectedCompareIds, resources]);

  const categories: string[] = [
    'All',
    'Computers and Laptops',
    'Laboratory Equipment',
    'Engineering Tools',
    'Robotics Equipment',
    'Photography and Audio Equipment',
    'Meeting Rooms',
    'Workshops and Makerspaces'
  ];

  const buildings = useMemo(() => {
    const list = Array.from(new Set(resources.map(r => r.building).filter(Boolean)));
    return ['All', ...list];
  }, [resources]);

  // Execute search handler
  const handleExecuteSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedSearchQuery(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setAppliedSearchQuery('');
  };

  // Quick button filter presets
  const handleQuickButtonClick = (filterKey: string) => {
    setQuickButtonFilter(filterKey);
    if (filterKey === 'all') {
      setSelectedCategory('All');
      setCostFilter('all');
      setOnlyNoSupervision(false);
    } else if (filterKey === 'free') {
      setCostFilter('free');
    } else if (filterKey === 'under25') {
      setCostFilter('under25');
    } else if (filterKey === 'lab') {
      setSelectedCategory('Laboratory Equipment');
    } else if (filterKey === 'engineering') {
      setSelectedCategory('Engineering Tools');
    } else if (filterKey === 'computing') {
      setSelectedCategory('Computers and Laptops');
    } else if (filterKey === 'robotics') {
      setSelectedCategory('Robotics Equipment');
    } else if (filterKey === 'self_service') {
      setOnlyNoSupervision(true);
    }
  };

  // Filter logic
  const filteredResources = useMemo(() => {
    return resources
      .filter(r => {
        // Search query evaluation (matching Title, Location, Specs, and optionally Description)
        if (appliedSearchQuery.trim()) {
          const q = appliedSearchQuery.toLowerCase();
          const matchTitle = r.title.toLowerCase().includes(q);
          const matchLocation = r.location_label.toLowerCase().includes(q) || r.building.toLowerCase().includes(q);
          const matchCategory = r.category.toLowerCase().includes(q);
          const matchSpecs = Object.entries(r.specifications || {}).some(
            ([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q)
          );
          const matchDesc = searchInDescription && r.description.toLowerCase().includes(q);

          if (!matchTitle && !matchLocation && !matchCategory && !matchSpecs && !matchDesc) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'All' && r.category !== selectedCategory) {
          return false;
        }

        // Building filter
        if (selectedBuilding !== 'All' && r.building !== selectedBuilding) {
          return false;
        }

        // Cost filter
        if (costFilter === 'free' && (r.cost_per_hour || 0) > 0) {
          return false;
        }
        if (costFilter === 'under25' && ((r.cost_per_hour || 0) === 0 || (r.cost_per_hour || 0) > 25)) {
          return false;
        }
        if (costFilter === 'over25' && (r.cost_per_hour || 0) <= 25) {
          return false;
        }

        // Supervision filter
        if (onlyNoSupervision && r.supervision_required) {
          return false;
        }

        // Eligibility filter
        if (onlyEligible) {
          const elig = checkEligibility(currentProfile, r);
          if (!elig.eligible) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          const rA = a.average_rating || 0;
          const rB = b.average_rating || 0;
          if (rB !== rA) return rB - rA;
          return (b.total_reviews || 0) - (a.total_reviews || 0);
        }
        if (sortBy === 'cost_asc') {
          return (a.cost_per_hour || 0) - (b.cost_per_hour || 0);
        }
        if (sortBy === 'cost_desc') {
          return (b.cost_per_hour || 0) - (a.cost_per_hour || 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'duration') {
          return b.max_duration_hours - a.max_duration_hours;
        }
        return 0;
      });
  }, [
    resources,
    appliedSearchQuery,
    searchInDescription,
    selectedCategory,
    selectedBuilding,
    costFilter,
    onlyEligible,
    onlyNoSupervision,
    sortBy,
    currentProfile
  ]);

  const resetAllFilters = () => {
    setSearchInput('');
    setAppliedSearchQuery('');
    setSelectedCategory('All');
    setSelectedBuilding('All');
    setCostFilter('all');
    setOnlyEligible(false);
    setOnlyNoSupervision(false);
    setQuickButtonFilter('all');
    setSortBy('rating');
  };

  const hasActiveFilters =
    appliedSearchQuery !== '' ||
    selectedCategory !== 'All' ||
    selectedBuilding !== 'All' ||
    costFilter !== 'all' ||
    onlyEligible ||
    onlyNoSupervision ||
    quickButtonFilter !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8C3A5] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
            // SHARED EQUIPMENT DIRECTORY
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34251F] mt-1">
            Discover Campus Resources
          </h1>
          <p className="text-xs sm:text-sm text-[#50453e] mt-1 font-inter">
            Explore {resources.length} active high-precision lab assets, compute nodes, and workspaces with transparent grant and usage rates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedCompareIds.length > 0 && (
            <button
              type="button"
              onClick={() => setIsComparisonModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-all shadow-xs"
            >
              <Scale className="w-4 h-4" />
              <span>Compare Selected ({selectedCompareIds.length})</span>
            </button>
          )}

          {/* Detailed Descriptions Option Toggle */}
          <button
            type="button"
            onClick={() => setExpandDescriptions(!expandDescriptions)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold font-inter transition-all border ${
              expandDescriptions
                ? 'bg-[#6F4E37] text-white border-[#6F4E37] shadow-xs'
                : 'bg-white text-[#6F4E37] border-[#D8C3A5] hover:bg-[#F7E7CE]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{expandDescriptions ? 'Hide Descriptions' : 'Show Clear Descriptions'}</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Primary Actions */}
      <div className="bg-white rounded-2xl border border-[#D8C3A5] p-5 shadow-xs space-y-4">
        {/* Search Input Row with Dedicated Search Button */}
        <form onSubmit={handleExecuteSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by equipment name, specifications, or description keywords..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D8C3A5] bg-[#FFFAF2] focus:bg-white focus:outline-none focus:border-[#6F4E37] focus:ring-2 focus:ring-[#BF6B2E]/20 text-[#34251F] font-inter"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Explicit Search Button */}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>

        {/* Description Search Option Toggle Checkbox & Search Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-inter pt-1">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-[#50453e]">
            <input
              type="checkbox"
              checked={searchInDescription}
              onChange={e => setSearchInDescription(e.target.checked)}
              className="w-4 h-4 rounded text-[#BF6B2E] border-[#D8C3A5] focus:ring-[#BF6B2E]"
            />
            <span className="font-medium">
              Search inside equipment descriptions &amp; technical specs
            </span>
          </label>

          <span className="text-[11px] text-stone-400">
            Press Enter or click <strong>Search</strong> to update results
          </span>
        </div>

        {/* Quick Button Filters */}
        <div className="pt-2 border-t border-[#D8C3A5]/60 space-y-2">
          <div className="text-[11px] font-bold text-[#6F4E37] uppercase tracking-wider font-inter">
            Quick Button Filters:
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'All Equipment' },
              { id: 'free', label: 'Free Access ($0/hr)' },
              { id: 'under25', label: 'Subsidized (< $25/hr)' },
              { id: 'lab', label: 'Laboratory Gear' },
              { id: 'engineering', label: 'Engineering Tools' },
              { id: 'computing', label: 'AI Compute & GPU' },
              { id: 'robotics', label: 'Robotics' },
              { id: 'self_service', label: 'Self-Service Only' }
            ].map(btn => (
              <button
                key={btn.id}
                type="button"
                onClick={() => handleQuickButtonClick(btn.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-inter font-semibold whitespace-nowrap transition-all border ${
                  quickButtonFilter === btn.id
                    ? 'bg-[#6F4E37] text-white border-[#6F4E37] shadow-xs'
                    : 'bg-[#FFFAF2] text-[#34251F] border-[#D8C3A5] hover:bg-[#F7E7CE]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Filters: Category, Campus Building, Cost Range, Sort By */}
        <div className="pt-3 border-t border-[#D8C3A5]/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-[#50453e] font-inter mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setQuickButtonFilter('custom');
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F] font-inter focus:outline-none focus:border-[#6F4E37]"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Building / Location Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-[#50453e] font-inter mb-1">
              Campus Location
            </label>
            <select
              value={selectedBuilding}
              onChange={e => setSelectedBuilding(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F] font-inter focus:outline-none focus:border-[#6F4E37]"
            >
              <option value="All">All Campus Buildings</option>
              {buildings.filter(b => b !== 'All').map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Cost Details Dropdown Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#50453e] font-inter mb-1">
              Cost &amp; Billing Rate
            </label>
            <select
              value={costFilter}
              onChange={e => {
                setCostFilter(e.target.value as any);
                setQuickButtonFilter('custom');
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F] font-inter focus:outline-none focus:border-[#6F4E37]"
            >
              <option value="all">All Rates (Free &amp; Paid)</option>
              <option value="free">Free Access ($0/hr Grant)</option>
              <option value="under25">Subsidized (≤ $25/hr)</option>
              <option value="over25">Specialized Facility (&gt; $25/hr)</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-[#50453e] font-inter mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F] font-inter focus:outline-none focus:border-[#6F4E37]"
            >
              <option value="rating">Highest Rated ★</option>
              <option value="cost_asc">Cost: Low to High ($0 first)</option>
              <option value="cost_desc">Cost: High to Low</option>
              <option value="title">Alphabetical (A-Z)</option>
              <option value="duration">Max Booking Duration</option>
            </select>
          </div>
        </div>

        {/* Eligibility Checkbox and Reset Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-inter">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[#50453e]">
            <input
              type="checkbox"
              checked={onlyEligible}
              onChange={e => setOnlyEligible(e.target.checked)}
              className="w-4 h-4 rounded text-[#BF6B2E] border-[#D8C3A5] focus:ring-[#BF6B2E]"
            />
            <span>Only show items I qualify for ({currentProfile.display_name})</span>
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-[#BF6B2E] hover:underline font-semibold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-inter text-[#50453e]">
        <div>
          Showing <span className="font-bold text-[#34251F]">{filteredResources.length}</span> of {resources.length} resources
          {appliedSearchQuery && (
            <span> matching &ldquo;<strong className="text-[#34251F]">{appliedSearchQuery}</strong>&rdquo;</span>
          )}
          {costFilter !== 'all' && (
            <span> • Filter: <strong className="text-[#34251F]">{costFilter}</strong></span>
          )}
        </div>

        <div className="text-[11px] text-stone-500">
          Click <strong>View Details</strong> on any card for specifications, rules &amp; reservations.
        </div>
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D8C3A5] p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F7E7CE] text-[#BF6B2E] flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#6F4E37]">No Matching Resources Found</h3>
          <p className="text-xs text-[#50453e] font-inter">
            No equipment matches your search query or filter settings. Try searching for generic terms like &ldquo;printer&rdquo;, &ldquo;scope&rdquo;, or reset your filters.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 rounded-xl text-xs font-bold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors"
          >
            Clear All Search &amp; Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(resource => {
            const eligibility = checkEligibility(currentProfile, resource);
            const isFree = (resource.cost_per_hour || 0) === 0;
            const isCompared = selectedCompareIds.includes(resource.id);

            return (
              <div
                key={resource.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all flex flex-col group justify-between ${
                  isCompared
                    ? 'border-[#BF6B2E] ring-2 ring-[#BF6B2E]/80 shadow-md'
                    : 'border-[#D8C3A5] hover:shadow-md shadow-xs'
                }`}
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={resource.image_url}
                      alt={resource.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={resource.status} size="sm" />
                    </div>

                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#6F4E37] border border-[#D8C3A5]">
                      Max {resource.max_duration_hours}h
                    </div>

                    {/* Quick Compare Overlay Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCompare(resource.id);
                      }}
                      className={`absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-inter backdrop-blur-md transition-all shadow-sm ${
                        isCompared
                          ? 'bg-[#BF6B2E] text-white ring-2 ring-white shadow-md'
                          : 'bg-stone-900/70 hover:bg-stone-900/90 text-white'
                      }`}
                      title={isCompared ? 'Remove from comparison' : 'Add to side-by-side comparison'}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>{isCompared ? 'Comparing' : '+ Compare'}</span>
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    {/* Category & Supervision */}
                    <div className="flex items-center justify-between text-[11px] font-inter text-[#BF6B2E] font-semibold uppercase tracking-wider">
                      <span>{resource.category}</span>
                      {resource.supervision_required && (
                        <span className="text-stone-500 font-normal">Supervision Req.</span>
                      )}
                    </div>

                    {/* Listing Title */}
                    <h3 className="text-base font-bold text-[#34251F] group-hover:text-[#6F4E37] transition-colors line-clamp-1">
                      {resource.title}
                    </h3>

                    {/* PROMINENT COST DETAILS BADGE (Requirement 4: Add cost details near every listing) */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-inter border ${
                          isFree
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-amber-50 border-amber-200 text-amber-900'
                        }`}
                        title={resource.cost_billing_model || 'Standard Allocation'}
                      >
                        {isFree ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Coins className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        )}
                        <span>{resource.cost_label}</span>
                      </div>
                    </div>

                    {/* Star Rating Display */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <StarRating
                        rating={resource.average_rating || 0}
                        totalReviews={resource.total_reviews}
                        showScore
                        size="sm"
                      />
                    </div>

                    {/* Description (Clear Snippet or Expanded View) */}
                    <div className="text-xs text-[#50453e] font-inter leading-relaxed bg-[#FFFAF2] p-2.5 rounded-xl border border-[#D8C3A5]/60">
                      <p className={expandDescriptions ? 'line-clamp-none' : 'line-clamp-2'}>
                        {resource.description}
                      </p>
                      {resource.cost_billing_model && (
                        <div className="text-[11px] text-stone-500 font-medium mt-1 pt-1 border-t border-[#D8C3A5]/40 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-[#BF6B2E]" />
                          <span>Billing: {resource.cost_billing_model}</span>
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-[#50453e] font-inter">
                      <MapPin className="w-3.5 h-3.5 text-[#6F4E37] shrink-0" />
                      <span className="truncate">{resource.location_label}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Eligibility & View Details CTA */}
                <div className="p-5 pt-3 border-t border-[#D8C3A5]/50 flex items-center justify-between">
                  <div>
                    {eligibility.eligible ? (
                      <div className="flex items-center gap-1 text-[11px] text-[#4f5745] font-inter font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#879078]" />
                        <span>Eligible</span>
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-1 text-[11px] text-[#A94438] font-inter font-medium"
                        title={eligibility.missingRequirements.join(', ')}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Training Needed</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleCompare(resource.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold font-inter transition-all border ${
                        isCompared
                          ? 'bg-amber-100 text-[#BF6B2E] border-amber-300 font-bold'
                          : 'bg-white text-stone-600 border-[#D8C3A5] hover:bg-[#F7E7CE] hover:text-[#6F4E37]'
                      }`}
                      title="Toggle equipment comparison"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>{isCompared ? 'Selected' : 'Compare'}</span>
                    </button>

                    <button
                      onClick={() => onSelectResource(resource)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold font-inter bg-[#F7E7CE] text-[#6F4E37] hover:bg-[#BF6B2E] hover:text-white transition-all shadow-2xs group-hover:bg-[#BF6B2E] group-hover:text-white"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Persistent Floating Comparison Dock (Requirement 7) */}
      {selectedCompareIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-4xl bg-[#34251F]/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-[#D8C3A5]/40 p-3 sm:p-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left: Selected Thumbnails & Labels */}
            <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-[#BF6B2E] flex items-center justify-center text-white shadow-xs">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold font-inter text-white flex items-center gap-1.5">
                    <span>Compare Tray</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                      {selectedCompareIds.length}/4
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-300">
                    {selectedCompareIds.length < 2
                      ? 'Pick at least 1 more resource'
                      : `${selectedCompareIds.length} items ready to compare`}
                  </div>
                </div>
              </div>

              {/* Selected Equipment Chips */}
              <div className="flex items-center gap-2 overflow-x-auto">
                {comparedResources.map(r => (
                  <div
                    key={r.id}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-xl border border-white/15 shrink-0 text-xs"
                  >
                    <img
                      src={r.image_url}
                      alt={r.title}
                      className="w-5 h-5 rounded-md object-cover"
                    />
                    <span className="font-medium max-w-[120px] truncate text-stone-200 text-[11px]">
                      {r.title}
                    </span>
                    <button
                      onClick={() => handleRemoveCompare(r.id)}
                      className="text-stone-400 hover:text-white p-0.5 rounded transition-colors"
                      title={`Remove ${r.title}`}
                      aria-label={`Remove ${r.title}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleClearCompare}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                Clear All
              </button>

              <button
                type="button"
                onClick={() => setIsComparisonModalOpen(true)}
                disabled={selectedCompareIds.length < 2}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-inter transition-all shadow-md ${
                  selectedCompareIds.length >= 2
                    ? 'bg-[#BF6B2E] text-white hover:bg-[#a35922] cursor-pointer'
                    : 'bg-stone-700 text-stone-400 cursor-not-allowed'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>Compare Side-by-Side ({selectedCompareIds.length})</span>
              </button>
            </div>
          </div>

          {compareNotice && (
            <div className="mt-2 text-center text-xs text-amber-200 bg-amber-900/60 py-1 px-3 rounded-lg border border-amber-500/40">
              {compareNotice}
            </div>
          )}
        </div>
      )}

      {/* Side-by-side Comparison Modal */}
      <ResourceComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        resources={comparedResources}
        currentProfile={currentProfile}
        onRemoveResource={handleRemoveCompare}
        onSelectResource={onSelectResource}
        onRequestBooking={onRequestBooking}
        onClearAll={handleClearCompare}
      />
    </div>
  );
};
