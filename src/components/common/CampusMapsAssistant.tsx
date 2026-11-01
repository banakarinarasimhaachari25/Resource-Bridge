import React, { useState } from 'react';
import {
  MapPin,
  Search,
  ExternalLink,
  Navigation,
  Sparkles,
  AlertCircle,
  Loader2,
  ChevronDown,
  Building,
  Wrench
} from 'lucide-react';

interface GroundingChunk {
  maps?: {
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: Array<{
        snippet?: string;
      }>;
    };
  };
  web?: {
    uri?: string;
    title?: string;
  };
}

interface CampusMapsAssistantProps {
  defaultLocationLabel?: string;
  buildingName?: string;
}

export const CampusMapsAssistant: React.FC<CampusMapsAssistantProps> = ({
  defaultLocationLabel,
  buildingName
}) => {
  const [query, setQuery] = useState(
    buildingName
      ? `Where is ${buildingName} and what labs or equipment suppliers are nearby?`
      : 'Find technical equipment supply shops and electronics parts stores near the university'
  );
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const quickPrompts = [
    'Find 3D printing and rapid prototyping supply stores nearby',
    'Find electronics parts distributors and oscilloscope calibration labs nearby',
    'Where are the main university engineering halls and research facilities located?'
  ];

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    setResultText(null);
    setGroundingChunks([]);

    try {
      // Get browser geolocation if available
      let lat: number | undefined;
      let lng: number | undefined;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch {
          // Geolocation optional fallback
        }
      }

      const response = await fetch('/api/maps/grounding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: q,
          lat,
          lng,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch maps grounding information.');
      }

      setResultText(data.text || 'Location information retrieved successfully.');
      setGroundingChunks(data.groundingChunks || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while connecting to Google Maps grounding.');
    } finally {
      setLoading(false);
    }
  };

  // Extract maps chunks specifically
  const mapsChunks = groundingChunks.filter(c => c.maps && c.maps.uri);

  return (
    <div className="bg-white rounded-2xl border border-[#D8C3A5] shadow-xs overflow-hidden">
      {/* Accordion / Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#FFFAF2] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#F7E7CE] text-[#BF6B2E]">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#BF6B2E] font-inter">
                // GEOGRAPHIC INTELLIGENCE & LOGISTICS
              </span>
              <span className="bg-[#879078]/15 text-[#4f5745] px-2 py-0.5 rounded-full text-[10px] font-bold font-inter">
                Google Maps Grounded
              </span>
            </div>
            <h3 className="text-base font-bold text-[#34251F] mt-0.5">
              Campus Facilities & Equipment Suppliers Finder
            </h3>
            <p className="text-xs text-[#50453e] font-inter">
              Query real-world locations, materials stores, and campus facility directions powered by Gemini 3.8 Flash.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-2 rounded-lg text-stone-400 hover:text-[#6F4E37] transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-label={isOpen ? 'Collapse panel' : 'Expand panel'}
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <div className="p-6 pt-2 border-t border-stone-100 space-y-5 text-xs font-inter">
          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(p);
                  handleSearch(p);
                }}
                className="px-3 py-1.5 rounded-full bg-[#FFFAF2] border border-[#D8C3A5] text-[#6F4E37] hover:bg-[#F7E7CE] hover:border-[#6F4E37] transition-all text-[11px]"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="Ask about facilities, material suppliers, or directions (e.g. Find 3D print filament suppliers)..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D8C3A5] bg-[#FFFAF2] text-[#34251F] focus:outline-none focus:border-[#6F4E37]"
              />
            </div>

            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#BF6B2E] text-white font-semibold hover:bg-[#a35922] transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching Maps...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>Search Maps</span>
                </>
              )}
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-[#A94438]/10 border border-[#A94438]/30 text-[#A94438] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="leading-relaxed">
                <strong>Grounding Notice:</strong> {error}
              </div>
            </div>
          )}

          {/* Results Display */}
          {resultText && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-[#FFFAF2] border border-[#D8C3A5] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#6F4E37]">
                  <Sparkles className="w-4 h-4 text-[#BF6B2E]" />
                  <span>Grounded Facility & Logistics Response:</span>
                </div>
                <div className="text-stone-700 leading-relaxed whitespace-pre-line text-xs">
                  {resultText}
                </div>
              </div>

              {/* Verified Google Maps Links (Required per SKILL instructions) */}
              {mapsChunks.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold uppercase tracking-wider text-[#6F4E37] text-[11px] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#BF6B2E]" />
                    <span>Verified Google Maps Locations ({mapsChunks.length}):</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {mapsChunks.map((chunk, i) => {
                      const place = chunk.maps;
                      if (!place?.uri) return null;

                      const snippets = place.placeAnswerSources?.reviewSnippets || [];

                      return (
                        <a
                          key={i}
                          href={place.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl border border-[#D8C3A5] bg-white hover:bg-[#F7E7CE]/40 hover:border-[#6F4E37] transition-all flex flex-col justify-between group shadow-2xs"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold text-[#34251F] group-hover:text-[#6F4E37] line-clamp-1">
                                {place.title || 'View Location on Google Maps'}
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 text-[#BF6B2E] shrink-0" />
                            </div>

                            {snippets.length > 0 && snippets[0].snippet && (
                              <p className="text-[10px] text-stone-500 italic mt-1 line-clamp-2">
                                "{snippets[0].snippet}"
                              </p>
                            )}
                          </div>

                          <div className="text-[11px] font-semibold text-[#BF6B2E] mt-2 flex items-center gap-1">
                            <span>Open in Google Maps</span>
                            <span>→</span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
