import React, { useState, useEffect, useRef } from 'react';
import { PackManifest } from '../types';
import { Search, MapPin, ArrowRight, ExternalLink, SlidersHorizontal, BookOpen, Layers } from 'lucide-react';

interface LandingViewProps {
  packs: PackManifest[];
  onSelectPack: (packId: string) => void;
  onOpenMethods: () => void;
  initialMode?: 'editorial' | 'map';
}

export const LandingView: React.FC<LandingViewProps> = ({
  packs,
  onSelectPack,
  onOpenMethods,
  initialMode = 'editorial',
}) => {
  const [viewMode, setViewMode] = useState<'editorial' | 'map'>(initialMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Deformation' | 'Inundation' | 'Time series'>('All');
  const [activePin, setActivePin] = useState<string | null>('venezuela-quake-2026');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated InSAR fringes canvas for Page 9 hero illustration
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width * 0.72;
      const cy = canvas.height * 0.52;

      // Draw concentric InSAR fringes
      for (let r = 8; r < canvas.width * 0.85; r += 9) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        const wave = Math.sin((r * 0.12) - frame * 0.03);
        ctx.strokeStyle = wave > 0 ? '#b4432c' : '#282826';
        ctx.lineWidth = wave > 0 ? 1.5 : 0.8;
        ctx.stroke();
      }

      frame++;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const filteredPacks = packs.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hook.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'All') return matchesSearch;
    if (selectedFilter === 'Deformation') return matchesSearch && p.type === 'deformation';
    if (selectedFilter === 'Inundation') return matchesSearch && p.type === 'inundation';
    if (selectedFilter === 'Time series') return matchesSearch && p.type === 'timeseries';
    return matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-57px)] flex flex-col justify-between">
      {/* View Switcher Pill Header */}
      <div className="bg-paper-200/60 dark:bg-paper-darkCard/40 border-b border-paper-border dark:border-paper-darkBorder px-6 py-2 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-stone-500 uppercase">View Layout:</span>
          <button
            onClick={() => setViewMode('editorial')}
            className={`px-3 py-1 rounded-full border transition-all ${
              viewMode === 'editorial'
                ? 'bg-waltz-ink text-white dark:bg-stone-100 dark:text-stone-900 border-transparent font-medium'
                : 'border-paper-border dark:border-paper-darkBorder text-stone-600 dark:text-stone-300 hover:bg-paper-200'
            }`}
          >
            Editorial Story (Screen 9)
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 rounded-full border transition-all ${
              viewMode === 'map'
                ? 'bg-waltz-ink text-white dark:bg-stone-100 dark:text-stone-900 border-transparent font-medium'
                : 'border-paper-border dark:border-paper-darkBorder text-stone-600 dark:text-stone-300 hover:bg-paper-200'
            }`}
          >
            Interactive Map & Search (Screen 1)
          </button>
        </div>
        <span className="hidden sm:inline text-stone-500">NISAR L2 Open Data</span>
      </div>

      {viewMode === 'editorial' ? (
        /* ================= SCREEN 9: EDITORIAL STORYTELLING LAYOUT ================= */
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full flex-grow space-y-16">
          {/* Hero Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-mono tracking-widest text-stone-500 uppercase">
                NISAR · L-BAND RADAR · OPEN SOURCE
              </div>
              <h1 className="font-serif text-5xl sm:text-6xl tracking-tight text-waltz-ink dark:text-white leading-[1.08]">
                Watch the <span className="italic text-waltz-rust font-normal">ground</span> move.
              </h1>
              <p className="text-stone-700 dark:text-stone-300 text-lg leading-relaxed max-w-xl">
                Waltz turns radar from the NASA-ISRO NISAR satellite into short, explorable stories:
                earthquakes that shift the land, floods that spread and retreat, crops that grow.
                No radar background needed.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setViewMode('map')}
                  className="px-6 py-2.5 rounded-full bg-waltz-ink text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white text-sm font-mono tracking-wide transition-colors"
                >
                  Explore a pack
                </button>
                <a
                  href="#how-radar-sees"
                  className="px-6 py-2.5 rounded-full border border-paper-border dark:border-paper-darkBorder text-sm font-mono tracking-wide hover:bg-paper-200 dark:hover:bg-paper-darkCard transition-colors"
                >
                  How radar sees
                </a>
              </div>
            </div>

            {/* Hero Interactive Fringe Graphic */}
            <div className="lg:col-span-5 relative bg-paper-200/50 dark:bg-stone-900/60 border border-paper-border dark:border-paper-darkBorder rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center shadow-inner">
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-3 text-[10px] font-mono tracking-wider text-stone-500 uppercase bg-paper-100/90 dark:bg-paper-dark/90 px-2 py-0.5 rounded border border-paper-border dark:border-paper-darkBorder">
                Illustration: Interferogram Fringes
              </div>
            </div>
          </section>

          {/* 3 Pack Cards Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pack A */}
            <div className="border border-paper-border dark:border-paper-darkBorder bg-paper-50 dark:bg-paper-darkCard rounded-xl p-6 flex flex-col justify-between space-y-4 hover:border-stone-400 dark:hover:border-stone-600 transition-all">
              <div className="space-y-4">
                <div className="aspect-[16/9] bg-stone-100 dark:bg-stone-900/80 rounded-lg border border-paper-border dark:border-paper-darkBorder overflow-hidden relative flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center p-3">
                    <svg viewBox="0 0 100 60" className="w-full h-full">
                      {[10, 18, 26, 34, 42, 50].map((r, i) => (
                        <circle
                          key={i}
                          cx="50"
                          cy="30"
                          r={r}
                          fill="none"
                          stroke={i % 2 === 0 ? '#b4432c' : '#155e75'}
                          strokeWidth="1.2"
                        />
                      ))}
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono text-stone-500 uppercase">
                    PACK A · DEFORMATION
                  </div>
                  <h3 className="font-serif text-xl font-medium mt-1 text-waltz-ink dark:text-stone-100">
                    Ground shift after the June 2026 Venezuela earthquakes
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 leading-snug">
                    Rainbow fringes show how far the surface moved toward or away from the satellite
                    between two passes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onSelectPack('venezuela-quake-2026')}
                className="w-full py-2 px-4 rounded-full border border-paper-border dark:border-paper-darkBorder hover:bg-waltz-ink hover:text-white dark:hover:bg-stone-100 dark:hover:text-stone-900 text-xs font-mono tracking-wider uppercase transition-colors text-center"
              >
                Open pack
              </button>
            </div>

            {/* Pack B */}
            <div className="border border-paper-border dark:border-paper-darkBorder bg-paper-50 dark:bg-paper-darkCard rounded-xl p-6 flex flex-col justify-between space-y-4 hover:border-stone-400 dark:hover:border-stone-600 transition-all">
              <div className="space-y-4">
                <div className="aspect-[16/9] bg-stone-100 dark:bg-stone-900/80 rounded-lg border border-paper-border dark:border-paper-darkBorder overflow-hidden relative flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="relative w-28 h-16">
                      <div className="absolute top-1 left-2 w-20 h-10 bg-waltz-rust/70 rounded-full blur-[1px]"></div>
                      <div className="absolute top-2 left-4 w-16 h-8 bg-waltz-teal rounded-full"></div>
                      <div className="absolute bottom-0 right-1 w-10 h-6 bg-waltz-teal rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono text-stone-500 uppercase">
                    PACK B · INUNDATION
                  </div>
                  <h3 className="font-serif text-xl font-medium mt-1 text-waltz-ink dark:text-stone-100">
                    A floodplain through the wet season
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 leading-snug">
                    Dark open water, bright flooded forest. Watch the flood spread and retreat
                    across passes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onSelectPack('floodplain-wet-season')}
                className="w-full py-2 px-4 rounded-full border border-paper-border dark:border-paper-darkBorder hover:bg-waltz-ink hover:text-white dark:hover:bg-stone-100 dark:hover:text-stone-900 text-xs font-mono tracking-wider uppercase transition-colors text-center"
              >
                Open pack
              </button>
            </div>

            {/* Pack C */}
            <div className="border border-paper-border dark:border-paper-darkBorder bg-paper-50 dark:bg-paper-darkCard rounded-xl p-6 flex flex-col justify-between space-y-4 hover:border-stone-400 dark:hover:border-stone-600 transition-all">
              <div className="space-y-4">
                <div className="aspect-[16/9] bg-stone-100 dark:bg-stone-900/80 rounded-lg border border-paper-border dark:border-paper-darkBorder overflow-hidden relative flex items-end justify-center p-4">
                  <div className="flex items-end space-x-1.5 h-16">
                    {[20, 28, 45, 62, 85, 70, 52, 38, 25].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className={`w-3.5 rounded-t-sm ${
                          i === 4 ? 'bg-waltz-rust' : 'bg-stone-800 dark:bg-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono text-stone-500 uppercase">
                    PACK C · TIME SERIES
                  </div>
                  <h3 className="font-serif text-xl font-medium mt-1 text-waltz-ink dark:text-stone-100">
                    A crop cycle, seen by radar
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 leading-snug">
                    Click a field and watch its radar signal rise and fall with the growing season.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onSelectPack('crop-cycle-radar')}
                className="w-full py-2 px-4 rounded-full border border-paper-border dark:border-paper-darkBorder hover:bg-waltz-ink hover:text-white dark:hover:bg-stone-100 dark:hover:text-stone-900 text-xs font-mono tracking-wider uppercase transition-colors text-center"
              >
                Open pack
              </button>
            </div>
          </section>

          {/* How Radar Sees & Open by Design Educational Cards */}
          <section id="how-radar-sees" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            <div className="lg:col-span-7 border border-paper-border dark:border-paper-darkBorder bg-paper-50 dark:bg-paper-darkCard rounded-xl p-8 space-y-6">
              <div className="text-xs font-mono text-stone-500 uppercase">HOW RADAR SEES</div>
              <h2 className="font-serif text-2xl text-waltz-ink dark:text-stone-100">
                Its own light, day or night
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <div className="space-y-2 border-t border-paper-border dark:border-paper-darkBorder pt-3">
                  <span className="text-xs font-mono text-stone-400">01</span>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                    The satellite sends its own microwave pulse, so it works at night and through clouds.
                  </p>
                </div>
                <div className="space-y-2 border-t border-paper-border dark:border-paper-darkBorder pt-3">
                  <span className="text-xs font-mono text-stone-400">02</span>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                    Wet, rough or tilted ground changes the echo that comes back.
                  </p>
                </div>
                <div className="space-y-2 border-t border-paper-border dark:border-paper-darkBorder pt-3">
                  <span className="text-xs font-mono text-stone-400">03</span>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                    Comparing two passes reveals change, down to centimeters of ground motion.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 border border-paper-border dark:border-paper-darkBorder bg-paper-50 dark:bg-paper-darkCard rounded-xl p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xs font-mono text-stone-500 uppercase">OPEN BY DESIGN</div>
                <h2 className="font-serif text-2xl text-waltz-ink dark:text-stone-100">
                  Every layer shows its sources
                </h2>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Granules, processing version and data maturity sit beside every map.
                </p>
              </div>
              <div className="flex items-center space-x-2 pt-4">
                <span className="px-3 py-1 rounded text-xs font-mono border border-paper-border dark:border-paper-darkBorder text-stone-500">
                  BETA
                </span>
                <span className="px-3 py-1 rounded text-xs font-mono border border-paper-border dark:border-paper-darkBorder text-stone-500">
                  PROVISIONAL
                </span>
                <span className="px-3 py-1 rounded text-xs font-mono bg-waltz-ink text-white dark:bg-stone-100 dark:text-stone-900 font-medium">
                  VALIDATED
                </span>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* ================= SCREEN 1: INTERACTIVE MAP & SEARCH LAYOUT ================= */
        <div className="flex-grow flex flex-col md:flex-row h-[calc(100vh-100px)] overflow-hidden">
          {/* Left Column: Search & Pack List */}
          <div className="w-full md:w-96 border-r border-paper-border dark:border-paper-darkBorder bg-paper-100 dark:bg-paper-dark p-4 sm:p-6 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-5">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="Place or pack"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-paper-50 dark:bg-paper-darkCard border border-paper-border dark:border-paper-darkBorder rounded-full focus:outline-none focus:border-stone-500 transition-colors"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                {(['All', 'Deformation', 'Inundation', 'Time series'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-3 py-1 rounded-full border transition-all ${
                      selectedFilter === filter
                        ? 'bg-waltz-ink text-white dark:bg-stone-100 dark:text-stone-900 border-transparent'
                        : 'border-paper-border dark:border-paper-darkBorder text-stone-600 dark:text-stone-400 hover:bg-paper-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Count */}
              <div className="text-xs font-mono text-stone-400 uppercase tracking-widest pt-2">
                {filteredPacks.length} PACKS
              </div>

              {/* Pack List Cards */}
              <div className="space-y-3">
                {filteredPacks.map((pack, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = activePin === pack.id;
                  return (
                    <div
                      key={pack.id}
                      onClick={() => {
                        setActivePin(pack.id);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-waltz-rust bg-paper-50 dark:bg-paper-darkCard shadow-sm'
                          : 'border-paper-border dark:border-paper-darkBorder bg-paper-50/50 dark:bg-paper-darkCard/50 hover:border-stone-400'
                      }`}
                    >
                      <div className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                        {letter} · {pack.type}
                      </div>
                      <h4 className="font-serif text-sm font-medium mt-1 leading-snug">
                        {pack.title}
                      </h4>
                      <div className="text-[10px] font-mono text-stone-400 mt-2">
                        {pack.id === 'crop-cycle-radar' ? 'PROVISIONAL + VALIDATED' : 'PROVISIONAL'} · [2026]
                      </div>
                    </div>
                  );
                })}

                {filteredPacks.length === 0 && (
                  <div className="p-6 text-center border border-dashed border-paper-border dark:border-paper-darkBorder rounded-xl space-y-2">
                    <p className="text-xs font-mono text-stone-500">No packs match your search.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedFilter('All');
                      }}
                      className="text-xs font-mono text-waltz-rust underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Contributor Note */}
            <div className="pt-4 border-t border-paper-border dark:border-paper-darkBorder text-[11px] text-stone-500 font-mono">
              Want your own place? Add a pack from a config file. See the{' '}
              <button onClick={onOpenMethods} className="text-waltz-rust underline hover:text-stone-900">
                contribution guide
              </button>
              .
            </div>
          </div>

          {/* Right Main Map Container */}
          <div className="flex-1 relative bg-paper-200/50 dark:bg-[#181817] flex items-center justify-center overflow-hidden">
            {/* Subtle background grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e0d6_1px,transparent_1px),linear-gradient(to_bottom,#e5e0d6_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#262624_1px,transparent_1px),linear-gradient(to_bottom,#262624_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-60" />

            {/* Soft Continental Landmasses (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-20">
              <ellipse cx="48%" cy="45%" rx="180" ry="120" fill="#ded7c8" />
              <ellipse cx="78%" cy="32%" rx="130" ry="90" fill="#ded7c8" />
              <ellipse cx="70%" cy="65%" rx="140" ry="110" fill="#ded7c8" />
            </svg>

            {/* Marker A: Venezuela */}
            <div className="absolute left-[45%] top-[42%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
              <button
                onClick={() => setActivePin('venezuela-quake-2026')}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-transform shadow-md ${
                  activePin === 'venezuela-quake-2026'
                    ? 'bg-waltz-rust text-white ring-4 ring-waltz-rust/20 scale-110'
                    : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white border border-stone-300'
                }`}
              >
                A
              </button>

              {/* Marker A Popover (Page 1) */}
              {activePin === 'venezuela-quake-2026' && (
                <div className="absolute top-11 bg-white dark:bg-stone-900 border border-paper-border dark:border-paper-darkBorder rounded-xl p-4 shadow-xl w-64 text-left z-30 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">
                    DEFORMATION
                  </div>
                  <h5 className="font-serif text-sm font-medium mt-1 leading-snug">
                    Ground shift after the June 2026 Venezuela earthquakes
                  </h5>
                  <p className="text-[11px] text-stone-500 mt-1 leading-tight">
                    See how far the surface moved between two passes.
                  </p>
                  <button
                    onClick={() => onSelectPack('venezuela-quake-2026')}
                    className="mt-3 w-full py-1.5 px-3 rounded-full bg-waltz-ink text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-mono tracking-wider uppercase text-center"
                  >
                    Open pack
                  </button>
                </div>
              )}
            </div>

            {/* Marker B: Floodplain (Pantanal) */}
            <div className="absolute left-[70%] top-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
              <button
                onClick={() => setActivePin('floodplain-wet-season')}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-transform shadow-md ${
                  activePin === 'floodplain-wet-season'
                    ? 'bg-waltz-rust text-white ring-4 ring-waltz-rust/20 scale-110'
                    : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white border border-stone-300'
                }`}
              >
                B
              </button>

              {activePin === 'floodplain-wet-season' && (
                <div className="absolute top-11 bg-white dark:bg-stone-900 border border-paper-border dark:border-paper-darkBorder rounded-xl p-4 shadow-xl w-64 text-left z-30 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">
                    INUNDATION
                  </div>
                  <h5 className="font-serif text-sm font-medium mt-1 leading-snug">
                    A floodplain through the wet season
                  </h5>
                  <p className="text-[11px] text-stone-500 mt-1 leading-tight">
                    Compare dry and wet season backscatter.
                  </p>
                  <button
                    onClick={() => onSelectPack('floodplain-wet-season')}
                    className="mt-3 w-full py-1.5 px-3 rounded-full bg-waltz-ink text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-mono tracking-wider uppercase text-center"
                  >
                    Open pack
                  </button>
                </div>
              )}
            </div>

            {/* Marker C: Crop cycle */}
            <div className="absolute left-[80%] top-[34%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
              <button
                onClick={() => setActivePin('crop-cycle-radar')}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-transform shadow-md ${
                  activePin === 'crop-cycle-radar'
                    ? 'bg-waltz-rust text-white ring-4 ring-waltz-rust/20 scale-110'
                    : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white border border-stone-300'
                }`}
              >
                C
              </button>

              {activePin === 'crop-cycle-radar' && (
                <div className="absolute top-11 bg-white dark:bg-stone-900 border border-paper-border dark:border-paper-darkBorder rounded-xl p-4 shadow-xl w-64 text-left z-30 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">
                    TIME SERIES
                  </div>
                  <h5 className="font-serif text-sm font-medium mt-1 leading-snug">
                    A crop cycle, seen by radar
                  </h5>
                  <p className="text-[11px] text-stone-500 mt-1 leading-tight">
                    Multi-pass backscatter evolution across planting & harvest.
                  </p>
                  <button
                    onClick={() => onSelectPack('crop-cycle-radar')}
                    className="mt-3 w-full py-1.5 px-3 rounded-full bg-waltz-ink text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-mono tracking-wider uppercase text-center"
                  >
                    Open pack
                  </button>
                </div>
              )}
            </div>

            {/* Attribution note */}
            <div className="absolute bottom-3 left-4 text-[10px] font-mono text-stone-400 bg-paper-100/80 dark:bg-paper-dark/80 px-2 py-0.5 rounded border border-paper-border dark:border-paper-darkBorder">
              Basemap attribution shown here · OpenStreetMap & Natural Earth
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-paper-border dark:border-paper-darkBorder px-6 py-4 text-[11px] font-mono text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          Educational use only. Not an emergency or official hazard product.
        </div>
        <div>
          Contains NASA-ISRO NISAR data from ASF DAAC. Not endorsed by NASA.
        </div>
      </footer>
    </div>
  );
};
