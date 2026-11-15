import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Presentation, CheckCircle2, Download, Layers } from 'lucide-react';

interface SlideDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SlideDeckModal: React.FC<SlideDeckModalProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const totalSlides = 7;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((prev) => Math.min(totalSlides, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(1, prev - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-[#fbf9f5] dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-3xl max-w-6xl w-full h-[88vh] flex flex-col justify-between shadow-2xl overflow-hidden relative">
        {/* Background Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e0d6_1px,transparent_1px),linear-gradient(to_bottom,#e5e0d6_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#262624_1px,transparent_1px),linear-gradient(to_bottom,#262624_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-40 pointer-events-none" />

        {/* Top Slide Header */}
        <div className="relative z-10 px-8 py-4 border-b border-[#e4dfd5] dark:border-stone-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-3">
            <Presentation className="w-4 h-4 text-waltz-rust" />
            <span className="font-serif italic font-bold text-lg text-waltz-ink dark:text-stone-100">Waltz</span>
            <span className="text-stone-400">/</span>
            <span className="text-stone-500 uppercase tracking-widest hidden sm:inline">
              NASA SPACE APPS 2026 · 7-SLIDE OFFICIAL DEMO DECK
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.print()}
              className="px-3 py-1 rounded-full border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-1.5 text-stone-600 dark:text-stone-300 text-[11px]"
              title="Print or Save as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <div className="flex items-center space-x-1.5 font-bold">
              <span className="text-waltz-rust">SLIDE {currentSlide}</span>
              <span className="text-stone-400">/</span>
              <span className="text-stone-500">{totalSlides}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4 text-stone-600 dark:text-stone-300" />
            </button>
          </div>
        </div>

        {/* Middle Slide Content */}
        <div className="relative z-10 flex-1 px-8 sm:px-14 py-8 flex flex-col justify-center overflow-y-auto">
          {/* SLIDE 1: TITLE & TEAM */}
          {currentSlide === 1 && (
            <div className="space-y-8 max-w-4xl mx-auto text-center animate-in fade-in">
              <div className="text-xs font-mono tracking-widest text-waltz-rust uppercase bg-[#fbece8] dark:bg-amber-950/40 px-4 py-1.5 rounded-full inline-block border border-waltz-rust/20">
                CHALLENGE: DANCING WITH THE SARS
              </div>
              <h1 className="font-serif text-6xl sm:text-7xl font-medium tracking-tight text-waltz-ink dark:text-stone-100 leading-[1.05]">
                Waltz: A NISAR Surface-Change Explorer
              </h1>
              <p className="text-xl sm:text-2xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto font-sans leading-relaxed">
                Turning L-band microwave radar into accessible, interactive stories of Earth's shifting surface.
              </p>
              <div className="pt-6 border-t border-[#e4dfd5] dark:border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-stone-500 max-w-2xl mx-auto">
                <div className="space-y-1">
                  <div className="uppercase text-[10px] text-stone-400">TEAM</div>
                  <div className="font-semibold text-stone-800 dark:text-stone-200">[Your Team Name]</div>
                </div>
                <div className="space-y-1">
                  <div className="uppercase text-[10px] text-stone-400">MEMBERS</div>
                  <div className="font-semibold text-stone-800 dark:text-stone-200">[Confirmed Members]</div>
                </div>
                <div className="space-y-1">
                  <div className="uppercase text-[10px] text-stone-400">DATA SOURCE</div>
                  <div className="font-semibold text-stone-800 dark:text-stone-200">NASA-ISRO NISAR L2</div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: THE PROBLEM */}
          {currentSlide === 2 && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
              <span className="text-xs font-mono tracking-widest text-stone-400 uppercase">
                THE CHALLENGE & PROBLEM
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-medium text-waltz-ink dark:text-stone-100 leading-tight">
                Radar reveals what cameras cannot—but nobody can open the files.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-sm font-sans text-stone-700 dark:text-stone-300">
                <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/50 p-6 rounded-2xl space-y-3">
                  <div className="text-xs font-mono uppercase font-bold text-stone-500">The Superpower</div>
                  <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">24/7 All-Weather Active Radar</h3>
                  <p className="leading-relaxed text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                    Unlike optical satellites that are blinded by clouds, rain, and darkness, NISAR's active L-band radar (1.25 GHz) penetrates straight through the atmosphere to record millimeter-scale surface motions.
                  </p>
                </div>
                <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/50 p-6 rounded-2xl space-y-3">
                  <div className="text-xs font-mono uppercase font-bold text-waltz-rust">The Bottleneck</div>
                  <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">8 GB Cryptic HDF5 Granules</h3>
                  <p className="leading-relaxed text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                    Raw products are massive matrices of covariance and unwrapped phase arrays. Local emergency responders, educators, and journalists cannot open or interpret them without advanced GIS toolchains.
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-paper-200/80 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 text-xs font-mono text-stone-800 dark:text-stone-200">
                <strong>Our Solution:</strong> Waltz precomputes open radar into zero-server interactive stories over real OpenStreetMap basemaps, delivering instant sub-second exploration.
              </div>
            </div>
          )}

          {/* SLIDE 3: PACK A - EARTHQUAKE */}
          {currentSlide === 3 && (
            <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
              <span className="text-xs font-mono tracking-widest text-stone-400 uppercase">
                PACK A · DEFORMATION (GUNW PRODUCT)
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-medium text-waltz-ink dark:text-stone-100 leading-tight">
                Measuring centimeters of tectonic motion with microwave phase.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 items-center">
                <div className="md:col-span-7 bg-white dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex justify-between text-xs font-mono text-stone-500">
                    <span>June 2026 Venezuela Earthquakes (Boconó Fault)</span>
                    <span className="font-bold text-waltz-rust">InSAR Coseismic Slip</span>
                  </div>
                  <div className="aspect-[16/9] bg-[#ede6da] rounded-xl overflow-hidden relative border flex items-center justify-center">
                    <svg viewBox="0 0 400 220" className="w-full h-full">
                      {[15, 30, 45, 60, 75, 90, 105, 120].map((r, i) => (
                        <circle key={i} cx="220" cy="110" r={r} fill="none" stroke={i % 2 === 0 ? '#b4432c' : '#155e75'} strokeWidth="2.5" opacity="0.8" />
                      ))}
                      <line x1="80" y1="160" x2="330" y2="70" stroke="#1c1917" strokeWidth="3" />
                      <circle cx="80" cy="160" r="8" fill="white" stroke="#1c1917" strokeWidth="2" />
                      <circle cx="330" cy="70" r="8" fill="white" stroke="#1c1917" strokeWidth="2" />
                    </svg>
                    <div className="absolute bottom-2 left-3 text-[9px] font-mono bg-white/90 px-2 py-0.5 rounded border">
                      OpenStreetMap Basemap · Active Fault Rupture
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 space-y-4 text-xs font-mono">
                  <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/60 p-4 rounded-xl space-y-2">
                    <div className="text-[10px] text-stone-400 uppercase font-bold">Interactive Innovation</div>
                    <div className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">Line A to B Fault Transect</div>
                    <p className="text-stone-600 dark:text-stone-400 font-sans text-xs leading-relaxed">
                      Users draw any cross-fault transect on the map to instantly plot a 50 km slip profile showing +18.2 cm uplift and -14.6 cm subsidence.
                    </p>
                  </div>
                  <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/60 p-4 rounded-xl space-y-2">
                    <div className="text-[10px] text-stone-400 uppercase font-bold">Radar Physics Lens</div>
                    <p className="text-stone-600 dark:text-stone-400 font-sans text-xs leading-relaxed">
                      Explains microwave wavelength (23.84 cm) and how each repeating fringe represents half-wavelength displacement (11.92 cm/cycle).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: PACK B - FLOODPLAIN */}
          {currentSlide === 4 && (
            <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
              <span className="text-xs font-mono tracking-widest text-stone-400 uppercase">
                PACK B · INUNDATION (GCOV PRODUCT)
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-medium text-waltz-ink dark:text-stone-100 leading-tight">
                Tracking water under canopies while preserving data truth.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 items-center">
                <div className="md:col-span-7 bg-white dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex justify-between text-xs font-mono text-stone-500">
                    <span>Pantanal Wet Season Alluvial Floodplain</span>
                    <span className="font-bold text-[#155e75]">Double-Bounce Scattering</span>
                  </div>
                  <div className="aspect-[16/9] bg-[#ede6da] rounded-xl overflow-hidden relative border flex items-center justify-center">
                    <svg viewBox="0 0 400 220" className="w-full h-full">
                      <ellipse cx="200" cy="110" rx="150" ry="85" fill="#c2410c" opacity="0.8" />
                      <ellipse cx="200" cy="110" rx="105" ry="55" fill="#155e75" />
                      <ellipse cx="320" cy="150" rx="45" ry="25" fill="#155e75" />
                    </svg>
                    <div className="absolute top-3 left-3 flex gap-2 text-[9px] font-mono bg-white/95 px-2 py-1 rounded border">
                      <span className="text-[#155e75] font-bold">● Open Water</span>
                      <span className="text-[#c2410c] font-bold">● Flooded Veg</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 space-y-4 text-xs font-mono">
                  <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/60 p-4 rounded-xl space-y-2">
                    <div className="text-[10px] text-stone-400 uppercase font-bold">Physical Discrimination</div>
                    <p className="text-stone-600 dark:text-stone-400 font-sans text-xs leading-relaxed">
                      Smooth water specularly bounces microwaves away (&lt; -18 dB); water standing beneath trees causes corner-reflector double-bounce (&gt; -5 dB).
                    </p>
                  </div>
                  <div className="border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl space-y-2 text-amber-900 dark:text-amber-200">
                    <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300">Data Honesty Innovation</div>
                    <p className="font-sans text-xs leading-relaxed">
                      Explicitly flags the permanent NISAR instrument gap (July 27 – Aug 10, 2026) with a hatched column. Waltz never interpolates or guesses missing observations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5: PACK C - CROP CYCLE */}
          {currentSlide === 5 && (
            <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
              <span className="text-xs font-mono tracking-widest text-stone-400 uppercase">
                PACK C · AGRICULTURE (GCOV TIME-SERIES)
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-medium text-waltz-ink dark:text-stone-100 leading-tight">
                Instant crop growth tracking from precomputed data cubes.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 items-center">
                <div className="md:col-span-7 bg-white dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex justify-between text-xs font-mono text-stone-500">
                    <span>West Bengal Delta · Monsoon Paddy Rice</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">Click-to-Chart (cube.bin)</span>
                  </div>
                  <div className="aspect-[16/9] bg-[#ded8ce] rounded-xl overflow-hidden relative border flex items-center justify-center">
                    <svg viewBox="0 0 400 220" className="w-full h-full">
                      <line x1="0" y1="100" x2="400" y2="100" stroke="#b4432c" strokeOpacity="0.4" />
                      <line x1="160" y1="0" x2="160" y2="220" stroke="#b4432c" strokeOpacity="0.4" />
                      <circle cx="160" cy="100" r="7" fill="#b4432c" />
                      <circle cx="280" cy="140" r="7" fill="#155e75" />
                    </svg>
                    <div className="absolute bottom-2 left-3 text-[9px] font-mono bg-white/90 px-2 py-0.5 rounded border">
                      OpenStreetMap Basemap · 100m Binary Data Cube
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 space-y-4 text-xs font-mono">
                  <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/60 p-4 rounded-xl space-y-2">
                    <div className="text-[10px] text-stone-400 uppercase font-bold">Sub-5ms Query Latency</div>
                    <p className="text-stone-600 dark:text-stone-400 font-sans text-xs leading-relaxed">
                      Pre-quantized 8-bit backscatter cubes loaded into memory allow users to click any agricultural parcel on Earth and see 9-pass growth curves instantly.
                    </p>
                  </div>
                  <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/60 p-4 rounded-xl space-y-2">
                    <div className="text-[10px] text-stone-400 uppercase font-bold">Phenological Curve Tracking</div>
                    <p className="text-stone-600 dark:text-stone-400 font-sans text-xs leading-relaxed">
                      Cross-polarized (HV) backscatter clearly reveals flooding transplantation (-24 dB), vegetative elongation (-12.3 dB peak), and harvest collapse.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 6: ARCHITECTURE & PROVENANCE */}
          {currentSlide === 6 && (
            <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
              <span className="text-xs font-mono tracking-widest text-stone-400 uppercase">
                SYSTEM ARCHITECTURE & DATA PROVENANCE
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-medium text-waltz-ink dark:text-stone-100 leading-tight">
                Reproducible, fast, and completely free to host.
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 text-xs font-mono">
                <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/60 p-5 rounded-2xl space-y-3">
                  <div className="text-waltz-rust font-bold">01 · Python Pipeline</div>
                  <div className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">waltz-pipeline CLI</div>
                  <p className="text-stone-600 dark:text-stone-400 font-sans text-xs leading-relaxed">
                    Automated CLI that ingests ASF DAAC HDF5 files, performs phase unwrapping conversion, applies 3x3 median despeckling, and writes deterministic manifests.
                  </p>
                </div>
                <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/60 p-5 rounded-2xl space-y-3">
                  <div className="text-emerald-600 font-bold">02 · Precomputed Packs</div>
                  <div className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">Zero Server Cost</div>
                  <p className="text-stone-600 dark:text-stone-400 font-sans text-xs leading-relaxed">
                    Precomputed Web Mercator rasters and quantized uint8 binary cubes ensure first contentful paint under 1.5 seconds with zero server runtime overhead.
                  </p>
                </div>
                <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/60 p-5 rounded-2xl space-y-3">
                  <div className="text-[#155e75] font-bold">03 · Full Provenance</div>
                  <div className="font-serif text-lg font-medium text-stone-900 dark:text-stone-100">Every Pixel Traced</div>
                  <p className="text-stone-600 dark:text-stone-400 font-sans text-xs leading-relaxed">
                    Dedicated modal displaying named ASF granule IDs, processing CRID (P05023 vs P05036), detection thresholds, and direct GeoTIFF downloads.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 7: IMPACT & ROADMAP */}
          {currentSlide === 7 && (
            <div className="space-y-8 max-w-4xl mx-auto text-center animate-in fade-in">
              <div className="text-xs font-mono tracking-widest text-emerald-800 uppercase bg-emerald-50 dark:bg-emerald-950/40 px-4 py-1.5 rounded-full inline-block border border-emerald-300">
                GLOBAL IMPACT & FUTURE ROADMAP
              </div>
              <h2 className="font-serif text-5xl sm:text-6xl font-medium tracking-tight text-waltz-ink dark:text-stone-100 leading-tight">
                Earth science made visible, accessible, and actionable.
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left font-sans text-xs sm:text-sm">
                <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/60 p-5 rounded-xl space-y-2">
                  <div className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100">Disaster Response</div>
                  <p className="text-stone-600 dark:text-stone-400 text-xs">
                    Rapid co-seismic slip and flood boundary quantification within hours of satellite pass.
                  </p>
                </div>
                <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/60 p-5 rounded-xl space-y-2">
                  <div className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100">STEM Education</div>
                  <p className="text-stone-600 dark:text-stone-400 text-xs">
                    Transforms abstract microwave radar physics into tangible, hands-on learning for classrooms worldwide.
                  </p>
                </div>
                <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/60 p-5 rounded-xl space-y-2">
                  <div className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100">Community Extensibility</div>
                  <p className="text-stone-600 dark:text-stone-400 text-xs">
                    Anyone can contribute their hometown pack with a simple YAML config file.
                  </p>
                </div>
              </div>

              <div className="pt-4 text-xs font-mono text-stone-500">
                Live App: <strong className="text-stone-800 dark:text-stone-200">http://127.0.0.1:3000</strong> · GitHub Repository · Open Source MIT
              </div>
            </div>
          )}
        </div>

        {/* Bottom Slide Navigation Bar */}
        <div className="relative z-10 px-8 py-4 border-t border-[#e4dfd5] dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSlides }, (_, i) => i + 1).map((idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-7 h-2 rounded-full transition-all ${
                  currentSlide === idx
                    ? 'bg-waltz-rust w-10'
                    : 'bg-stone-300 dark:bg-stone-700 hover:bg-stone-400'
                }`}
                title={`Go to slide ${idx}`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(1, prev - 1))}
              disabled={currentSlide === 1}
              className="px-4 py-2 rounded-full border border-stone-300 dark:border-stone-700 disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setCurrentSlide((prev) => Math.min(totalSlides, prev + 1))}
              disabled={currentSlide === totalSlides}
              className="px-5 py-2 rounded-full bg-[#1c1917] text-white dark:bg-stone-100 dark:text-stone-900 disabled:opacity-30 hover:bg-stone-800 transition-colors flex items-center gap-1.5 font-medium"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
