import React from 'react';
import { ActiveView, ResourceCategory } from '../types';
import {
  Compass,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Cpu,
  Layers,
  Wrench,
  Camera,
  Users,
  Building,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: ActiveView, filterCategory?: ResourceCategory) => void;
  onExploreResources: () => void;
  onListResource: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onExploreResources,
  onListResource
}) => {
  const categories: { name: ResourceCategory; icon: React.ReactNode; count: string }[] = [
    { name: 'Engineering Tools', icon: <Wrench className="w-5 h-5 text-[#BF6B2E]" />, count: '14 Units' },
    { name: 'Laboratory Equipment', icon: <Cpu className="w-5 h-5 text-[#BF6B2E]" />, count: '28 Units' },
    { name: 'Robotics Equipment', icon: <Layers className="w-5 h-5 text-[#BF6B2E]" />, count: '9 Workcells' },
    { name: 'Computers and Laptops', icon: <Cpu className="w-5 h-5 text-[#BF6B2E]" />, count: '42 Stations' },
    { name: 'Meeting Rooms', icon: <Users className="w-5 h-5 text-[#BF6B2E]" />, count: '12 Spaces' },
    { name: 'Photography and Audio Equipment', icon: <Camera className="w-5 h-5 text-[#BF6B2E]" />, count: '18 Kits' }
  ];

  return (
    <div className="min-h-screen bg-[#FFFAF2] text-[#34251F]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 border-b border-[#D8C3A5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative (60%) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7E7CE] border border-[#D8C3A5] text-[#6F4E37] text-xs font-semibold font-inter">
                <Sparkles className="w-3.5 h-3.5 text-[#BF6B2E]" />
                <span>Inter-Department Resource Circulation Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#34251F] leading-[1.15]">
                Great Resources <br />
                <span className="text-[#6F4E37] underline decoration-[#BF6B2E] decoration-wavy decoration-2">
                  Should Never Sit Unused.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-[#50453e] font-normal leading-relaxed max-w-2xl">
                Discover, book, and share equipment and spaces through one trusted platform. Unlock cutting-edge 3D printers, specialized optical scopes, high-compute AI rigs, and collaborative facilities across colleges and institutions.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onExploreResources}
                  className="px-6 py-3.5 rounded-lg text-sm font-semibold font-inter bg-[#BF6B2E] text-[#FFFAF2] hover:bg-[#a35922] transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Resources</span>
                </button>

                <button
                  onClick={onListResource}
                  className="px-6 py-3.5 rounded-lg text-sm font-semibold font-inter border-2 border-[#6F4E37] text-[#6F4E37] hover:bg-[#F7E7CE] transition-all flex items-center gap-2"
                >
                  <Building className="w-4 h-4" />
                  <span>List a Resource</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-[#D8C3A5]/60 grid grid-cols-3 gap-4 max-w-lg">
                <div>
                  <div className="text-2xl font-extrabold text-[#6F4E37]">100%</div>
                  <div className="text-xs text-[#50453e] font-inter">Traceable Handover</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#BF6B2E]">0</div>
                  <div className="text-xs text-[#50453e] font-inter">Booking Conflicts</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#6F4E37]">Multi-Role</div>
                  <div className="text-xs text-[#50453e] font-inter">Verified Access</div>
                </div>
              </div>
            </div>

            {/* Right Visual Collage Showcase (40%) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Featured Mockup Card */}
                <div className="rounded-2xl border-2 border-[#D8C3A5] bg-white p-3 shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden bg-stone-100">
                    <img
                      src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
                      alt="Industrial SLS 3D Printer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-[#6F4E37] text-white px-2.5 py-1 rounded-full text-xs font-medium font-inter">
                      Available for Booking
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#BF6B2E] font-inter">
                        Engineering Tools
                      </span>
                      <span className="text-xs font-medium text-[#879078] bg-[#879078]/15 px-2 py-0.5 rounded-full">
                        • Verified
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#34251F] mt-1">
                      Industrial SLS 3D Printer (Formlabs Fuse 1+)
                    </h3>
                    <p className="text-xs text-[#50453e] mt-1 font-inter">
                      Maker Wing, Room 204 • Managed by Prof. Marcus Vance
                    </p>
                  </div>
                </div>

                {/* Floating secondary badge card */}
                <div className="absolute -bottom-6 -left-6 bg-[#F7E7CE] border border-[#D8C3A5] rounded-xl p-3.5 shadow-lg max-w-[220px] hidden sm:block">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#BF6B2E]" />
                    <span className="text-xs font-bold text-[#6F4E37]">Safety Certified</span>
                  </div>
                  <p className="text-[11px] text-[#34251F] leading-tight">
                    Requires verified training level before physical checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-white border-b border-[#D8C3A5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
              // STREAMLINED LIFECYCLE
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#34251F] mt-2">
              How ResourceBridge Works
            </h2>
            <p className="text-[#50453e] text-base mt-3">
              A four-step traceable chain of custody ensuring maximum equipment uptime with complete accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Discover Resources',
                desc: 'Search cross-departmental equipment, labs, and spaces filtered by building, category, and availability.'
              },
              {
                step: '02',
                title: 'Check Eligibility',
                desc: 'Instant verification of required safety training certifications and department booking policies.'
              },
              {
                step: '03',
                title: 'Request a Booking',
                desc: 'Conflict-free scheduling algorithm reserves the desired slot and notifies the lab owner for approval.'
              },
              {
                step: '04',
                title: 'Use & Return Responsibly',
                desc: 'Digital check-in condition logging and return verification maintain transparent equipment health.'
              }
            ].map(item => (
              <div
                key={item.step}
                className="bg-[#FFFAF2] rounded-xl border border-[#D8C3A5] p-6 relative group hover:border-[#6F4E37] transition-all"
              >
                <div className="text-4xl font-black text-[#F7E7CE] group-hover:text-[#BF6B2E]/20 transition-colors">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-[#6F4E37] mt-3">{item.title}</h3>
                <p className="text-xs text-[#50453e] mt-2 leading-relaxed font-inter">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-16 md:py-24 bg-[#FFFAF2] border-b border-[#D8C3A5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
              // DESIGNED FOR RIGOROUS INSTITUTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#34251F] mt-2">
              Enterprise-Grade Shared Resource Governance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-[#D8C3A5] p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-[#F7E7CE] flex items-center justify-center text-[#BF6B2E] mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#6F4E37]">Easy Discovery</h3>
              <p className="text-xs text-[#50453e] mt-2 font-inter leading-relaxed">
                Single pane of glass across distributed maker hubs, computer clusters, media studios, and cleanrooms.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#D8C3A5] p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-[#F7E7CE] flex items-center justify-center text-[#BF6B2E] mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#6F4E37]">Transparent Booking</h3>
              <p className="text-xs text-[#50453e] mt-2 font-inter leading-relaxed">
                Real-time conflict detection prevents double-booking. Transparent queue status with automated waitlist handoffs.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#D8C3A5] p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-[#F7E7CE] flex items-center justify-center text-[#BF6B2E] mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#6F4E37]">Accountable Handover</h3>
              <p className="text-xs text-[#50453e] mt-2 font-inter leading-relaxed">
                Initial condition vs return condition side-by-side verification with accessory auditing and incident tracking.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#D8C3A5] p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-[#F7E7CE] flex items-center justify-center text-[#BF6B2E] mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#6F4E37]">Better Utilization</h3>
              <p className="text-xs text-[#50453e] mt-2 font-inter leading-relaxed">
                Eliminates capital waste from duplicate equipment purchases by unlocking underused institutional capacity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Explorer Grid */}
      <section className="py-16 md:py-24 bg-white border-b border-[#D8C3A5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
                // COMPREHENSIVE CATALOG
              </span>
              <h2 className="text-3xl font-bold text-[#34251F] mt-2">
                Browse by Resource Category
              </h2>
            </div>
            <button
              onClick={onExploreResources}
              className="mt-4 sm:mt-0 text-sm font-semibold text-[#BF6B2E] hover:underline flex items-center gap-1 font-inter"
            >
              <span>View full directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => onNavigate('discover', cat.name)}
                className="text-left p-5 rounded-xl border border-[#D8C3A5] bg-[#FFFAF2] hover:bg-[#F7E7CE]/60 hover:border-[#6F4E37] transition-all group focus:outline-none"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-lg bg-white border border-[#D8C3A5] group-hover:scale-105 transition-transform">
                    {cat.icon}
                  </div>
                  <span className="text-xs font-inter font-medium text-[#6F4E37] bg-white px-2.5 py-1 rounded-full border border-[#D8C3A5]">
                    {cat.count}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#34251F] mt-4 group-hover:text-[#6F4E37] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#50453e] mt-1 font-inter">
                  Browse verified listings, schedule windows, and safety rules.
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="py-20 bg-[#6F4E37] text-[#FFFAF2]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F7E7CE] font-inter">
            // UNLOCK YOUR CAMPUS CAPACITY
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Make Better Use of What You Already Have.
          </h2>
          <p className="text-stone-200 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Eliminate idle lab hours, reduce friction in facility access, and empower researchers and builders with transparent, accountable resource sharing.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onExploreResources}
              className="px-8 py-3.5 rounded-lg text-sm font-semibold font-inter bg-[#BF6B2E] text-white hover:bg-[#a35922] transition-colors shadow-lg"
            >
              Start Discovering Resources
            </button>
            <button
              onClick={onListResource}
              className="px-8 py-3.5 rounded-lg text-sm font-semibold font-inter bg-[#F7E7CE] text-[#6F4E37] hover:bg-white transition-colors"
            >
              List Equipment & Spaces
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#34251F] text-stone-300 py-12 border-t border-[#50453e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <span className="font-bold text-lg text-white font-sans">
                ResourceBridge
              </span>
              <p className="text-xs text-stone-400 font-inter leading-relaxed">
                Trusted sharing of underused spaces and equipment. Built for universities, research labs, makerspaces, and regional innovation hubs.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#F7E7CE] uppercase tracking-wider mb-3 font-inter">
                Platform
              </h4>
              <ul className="space-y-2 text-xs font-inter">
                <li><button onClick={onExploreResources} className="hover:text-white">Discover Catalog</button></li>
                <li><button onClick={() => onNavigate('guidelines')} className="hover:text-white">Usage Guidelines</button></li>
                <li><button onClick={() => onNavigate('my_bookings')} className="hover:text-white">Booking Portal</button></li>
                <li><button onClick={() => onNavigate('handover')} className="hover:text-white">Handover Verification</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#F7E7CE] uppercase tracking-wider mb-3 font-inter">
                Institutional Safety
              </h4>
              <ul className="space-y-2 text-xs font-inter text-stone-400">
                <li>Safety Certification Matrix</li>
                <li>Chain of Custody Logs</li>
                <li>Incident Resolution Protocol</li>
                <li>Equipment Maintenance Sync</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#F7E7CE] uppercase tracking-wider mb-3 font-inter">
                Security & Data
              </h4>
              <p className="text-xs text-stone-400 font-inter leading-relaxed">
                PostgreSQL Row Level Security (RLS) enforcement. Zero unverified privilege escalation.
              </p>
              <div className="mt-3 text-[11px] text-[#BF6B2E]">
                Local Demo Persistent Storage Active
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-700 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 font-inter">
            <span>© 2026 ResourceBridge. All rights reserved.</span>
            <span>Version 1.0 • Hackathon Pitch System</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
