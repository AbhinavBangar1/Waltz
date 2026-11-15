import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

// Smooth cubic easing for snappy cursor motion
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface Keyframe {
  frame: number;
  x: number;
  y: number;
  clicking?: boolean;
  pointer?: boolean;
}

// User-specified keyframes:
// 1. "explore a pack button at (957, 669)"
// 2. Remove "Draw line" button click
// 3. Point A at (310, 744)
// 4. Point B at (834, 504)
const CURSOR_KEYFRAMES: Keyframe[] = [
  // Scene 1: Landing / Hero (0 - 80 frames)
  { frame: 0, x: 960, y: 500 },
  { frame: 25, x: 960, y: 500 },
  { frame: 45, x: 957, y: 669, pointer: true }, // Snap directly to (957, 669)
  { frame: 52, x: 957, y: 669, clicking: true, pointer: true }, // CLICK Explore a pack!
  { frame: 62, x: 957, y: 669, pointer: true },
  { frame: 78, x: 600, y: 650 },

  // Scene 2: Earthquake Deformation (80 - 280 frames)
  // Direct movement to Point A (310, 744) without clicking "Draw line"
  { frame: 85, x: 450, y: 680 },
  { frame: 110, x: 310, y: 744, pointer: true }, // Snap to Point A (310, 744)
  { frame: 118, x: 310, y: 744, clicking: true, pointer: true }, // CLICK Point A!
  { frame: 126, x: 310, y: 744 },
  { frame: 160, x: 834, y: 504, pointer: true }, // Drag across to Point B (834, 504)
  { frame: 168, x: 834, y: 504, clicking: true, pointer: true }, // CLICK Point B!
  { frame: 180, x: 834, y: 504 },
  // Inspect right-side chart
  { frame: 215, x: 1400, y: 460, pointer: true },
  { frame: 255, x: 1400, y: 460 },
  { frame: 275, x: 960, y: 540 },

  // Scene 3: Floodplain Inundation (280 - 480 frames)
  // Clean neutral position waiting for user coordinates
  { frame: 290, x: 600, y: 500 },
  { frame: 340, x: 620, y: 520 },
  { frame: 410, x: 1350, y: 560 },
  { frame: 475, x: 960, y: 540 },

  // Scene 4: Crop Cycle (480 - 720 frames)
  // Clean neutral position waiting for user coordinates
  { frame: 495, x: 600, y: 480 },
  { frame: 550, x: 640, y: 520 },
  { frame: 620, x: 1350, y: 520 },
  { frame: 715, x: 960, y: 540 },

  // Scene 5: Outro (720 - 900 frames)
  { frame: 730, x: 960, y: 540 },
  { frame: 800, x: 960, y: 680, pointer: true },
  { frame: 810, x: 960, y: 680, clicking: true, pointer: true },
  { frame: 900, x: 960, y: 540 },
];

function getCursorState(currentFrame: number) {
  let prev = CURSOR_KEYFRAMES[0];
  let next = CURSOR_KEYFRAMES[CURSOR_KEYFRAMES.length - 1];

  for (let i = 0; i < CURSOR_KEYFRAMES.length - 1; i++) {
    if (currentFrame >= CURSOR_KEYFRAMES[i].frame && currentFrame <= CURSOR_KEYFRAMES[i + 1].frame) {
      prev = CURSOR_KEYFRAMES[i];
      next = CURSOR_KEYFRAMES[i + 1];
      break;
    }
  }

  const duration = next.frame - prev.frame;
  const progress = duration === 0 ? 1 : (currentFrame - prev.frame) / duration;
  const eased = easeInOutCubic(progress);

  const x = prev.x + (next.x - prev.x) * eased;
  const y = prev.y + (next.y - prev.y) * eased;
  const isClicking = Boolean(prev.clicking && progress > 0.05 && progress < 0.95);
  const isPointer = Boolean(prev.pointer || next.pointer);

  return { x, y, isClicking, isPointer };
}

export interface VideoCompositionProps {
  showCursor?: boolean;
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({ showCursor = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig(); // 30 fps, 900 frames = 30.00s

  const { x, y, isClicking, isPointer } = getCursorState(frame);

  // Active scenes
  const isScene1 = frame < 80;
  const isScene2 = frame >= 80 && frame < 280;
  const isScene3 = frame >= 280 && frame < 480;
  const isScene4 = frame >= 480 && frame < 720;
  const isScene5 = frame >= 720;

  // Scene 2 state: Line drawn once Point B is clicked (frame >= 168)
  const lineDrawn = frame >= 168;

  return (
    <div className="w-[1920px] h-[1080px] bg-[#fbf9f5] text-[#1c1917] font-sans relative overflow-hidden flex flex-col justify-between p-10 select-none">
      {/* Background Carto/OSM Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e0d6_1px,transparent_1px),linear-gradient(to_bottom,#e5e0d6_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-60 pointer-events-none" />

      {/* Top Application Header Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#e4dfd5] pb-3">
        <div className="flex items-center space-x-4">
          <span className="font-serif italic text-3xl font-bold">Waltz</span>
          <span className="text-xs font-mono tracking-widest text-stone-500 uppercase">
            / NASA SPACE APPS 2026 · DANCING WITH THE SARS
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="px-3 py-1 rounded-full border border-stone-300 bg-white shadow-sm">
            NISAR L2 DATA · ASF DAAC
          </span>
          <span className="px-3 py-1 rounded-full bg-[#1c1917] text-white font-medium">
            30.00s DEMO REEL
          </span>
        </div>
      </div>

      {/* ================= SCENE 1: ORIGINAL EDITORIAL HERO (0 - 80 frames) ================= */}
      {isScene1 && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="text-xs font-mono tracking-widest text-[#b4432c] uppercase bg-[#fbece8] px-4 py-1.5 rounded-full border border-[#b4432c]/20">
            CHALLENGE: DANCING WITH THE SARS
          </div>
          <h1 className="font-serif text-7xl font-medium tracking-tight max-w-4xl leading-tight">
            Watch the <span className="italic text-[#b4432c]">ground</span> move.
          </h1>
          <p className="text-xl text-stone-600 max-w-2xl font-sans">
            Waltz turns L-band Synthetic Aperture Radar from NASA-ISRO NISAR into explorable stories of Earth's shifting surface.
          </p>

          {/* Button precisely at (957, 669) as requested */}
          <div className="pt-2">
            <button
              id="explore-pack-btn"
              style={{
                position: 'absolute',
                left: '957px',
                top: '669px',
                transform: `translate(-50%, -50%) ${isClicking ? 'scale(0.95)' : 'scale(1)'}`,
              }}
              className="px-8 py-3.5 rounded-full text-xs font-mono tracking-wider uppercase bg-[#1c1917] text-white shadow-xl transition-transform"
            >
              Explore a pack →
            </button>
          </div>
        </div>
      )}

      {/* ================= SCENE 2: ORIGINAL EARTHQUAKE SCREEN (80 - 280 frames) ================= */}
      {/* 1:1 replica of Image 2 (media_1794747942045_126c3f92.png) */}
      {isScene2 && (
        <div className="relative z-10 flex-1 flex flex-col justify-center space-y-4 py-1">
          {/* Top Title & Stat Row */}
          <div className="flex justify-between items-start border-b border-[#e4dfd5] pb-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">
                WALTZ · NISAR SURFACE CHANGE
              </span>
              <h1 className="font-serif text-3xl font-medium">
                Ground shift after the June 2026 Venezuela earthquakes
              </h1>
              <p className="text-xs text-stone-600">
                Radar phase turned into centimeters of motion between two passes. Draw a line on the map to see how the ground moved along it.
              </p>
            </div>
            <div className="text-right font-mono shrink-0">
              <span className="text-4xl font-serif">1</span>
              <span className="block text-[9px] text-stone-400 uppercase">PASS PAIR USED</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3 bg-white border border-[#e4dfd5] p-2.5 rounded-xl text-xs font-mono shadow-sm">
            <span className="px-2.5 py-1 rounded bg-[#fbece8] text-[#b4432c] font-bold">
              PACK: Earthquake
            </span>
            <span className="px-2.5 py-1 rounded bg-stone-100 border text-stone-800 font-medium">
              LAYER: Displacement (cm)
            </span>
            <span className="px-2.5 py-1 rounded border text-stone-600">
              PASS PAIR: [2026-06-12] to [2026-06-24]
            </span>
            <span className="px-2.5 py-1 rounded border text-stone-600">
              MATURITY: Provisional
            </span>
            <span className="text-stone-500">COHERENCE MINIMUM: 0.3</span>
          </div>

          {/* 2-Column Main Section */}
          <div className="grid grid-cols-12 gap-6 flex-1 items-stretch">
            {/* Left 7 Cols: Displacement Map with OpenStreetMap */}
            <div className="col-span-7 bg-white border border-[#e4dfd5] rounded-2xl p-5 shadow-lg relative flex flex-col justify-between overflow-hidden">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg font-medium">Displacement map</h3>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded border text-[10px] font-mono bg-stone-50">
                      Reset zoom
                    </span>
                  </div>
                </div>
                <p className="text-xs text-stone-500">
                  Motion along the satellite's line of sight. Gray areas are masked as too noisy to trust.
                </p>
              </div>

              {/* Colorbar */}
              <div className="flex items-center space-x-3 text-[10px] font-mono text-stone-500 py-1">
                <span>AWAY</span>
                <div className="h-2 flex-1 rounded bg-gradient-to-r from-[#155e75] via-[#f5f0e6] to-[#c2410c] border" />
                <span>TOWARD · CM</span>
              </div>

              {/* Map Canvas with Real Coordinates */}
              <div className="relative flex-1 bg-[#ede6da] rounded-xl overflow-hidden my-2 border border-stone-200">
                {/* Simulated OpenStreetMap Roads & Topo */}
                <svg viewBox="0 0 1000 600" className="w-full h-full">
                  <rect width="1000" height="600" fill="#ede6da" />
                  <path d="M 50 200 Q 300 150 600 300 T 950 400" fill="none" stroke="#d5cbb8" strokeWidth="3" />
                  <path d="M 200 50 Q 400 300 500 550" fill="none" stroke="#d5cbb8" strokeWidth="2" />

                  {/* Concentric InSAR Fringes centered over Boconó fault */}
                  {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300].map((r, i) => (
                    <circle
                      key={i}
                      cx="560"
                      cy="480"
                      r={r}
                      fill="none"
                      stroke={i % 2 === 0 ? '#b4432c' : '#155e75'}
                      strokeWidth="2.5"
                      opacity="0.75"
                    />
                  ))}
                </svg>

                {/* Real OpenStreetMap Attribution */}
                <div className="absolute bottom-2 left-3 text-[9px] font-mono bg-white/90 px-2 py-0.5 rounded border">
                  Basemap attribution shown here · OpenStreetMap
                </div>
              </div>
            </div>

            {/* Right 5 Cols: SELECTION Line A to B Card */}
            <div className="col-span-5 bg-white border border-[#e4dfd5] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase">SELECTION</span>
                <h3 className="font-serif text-2xl font-medium mt-0.5">Line A to B</h3>
                <div className="text-[11px] font-mono text-stone-500 uppercase mt-0.5">
                  PROVISIONAL · P05023 · 52 KM
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#e4dfd5] mt-3 text-xs font-mono">
                  <div>
                    <div className="font-bold text-base text-[#b4432c]">+18.2</div>
                    <div className="text-[9px] text-stone-400 uppercase leading-tight">MOST TOWARD, CM</div>
                  </div>
                  <div>
                    <div className="font-bold text-base text-[#155e75]">-14.6</div>
                    <div className="text-[9px] text-stone-400 uppercase leading-tight">MOST AWAY, CM</div>
                  </div>
                  <div>
                    <div className="font-bold text-base">4.2%</div>
                    <div className="text-[9px] text-stone-400 uppercase leading-tight">MASKED, % LINE</div>
                  </div>
                </div>
              </div>

              {/* Chart 1: Displacement along the line */}
              <div className="space-y-1 my-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-serif font-medium">Displacement along the line</span>
                  <div className="flex gap-1 text-[9px] font-mono">
                    <span className="border px-1.5 py-0.5 rounded bg-stone-50">CSV</span>
                    <span className="border px-1.5 py-0.5 rounded bg-stone-50">PNG</span>
                  </div>
                </div>
                <div className="h-28 bg-stone-50 border border-stone-200 rounded-lg p-2.5 flex flex-col justify-between">
                  <svg viewBox="0 0 300 65" className="w-full h-full overflow-visible">
                    <line x1="0" y1="35" x2="300" y2="35" stroke="#a8a29e" strokeDasharray="3 3" />
                    <path
                      d="M 0 40 Q 90 55 130 65 T 150 10 Q 210 20 300 32"
                      fill="none"
                      stroke="#b4432c"
                      strokeWidth="2.5"
                    />
                  </svg>
                  <div className="flex justify-between text-[8px] font-mono text-stone-400 border-t pt-0.5">
                    <span>A</span>
                    <span>KM ALONG LINE</span>
                    <span>B</span>
                  </div>
                </div>
              </div>

              {/* Chart 2: Signal quality along the line */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-serif font-medium">Signal quality along the line</span>
                  <div className="flex gap-1 text-[9px] font-mono">
                    <span className="border px-1.5 py-0.5 rounded bg-stone-50">CSV</span>
                    <span className="border px-1.5 py-0.5 rounded bg-stone-50">PNG</span>
                  </div>
                </div>
                <div className="h-20 bg-stone-50 border border-stone-200 rounded-lg p-2 flex flex-col justify-between">
                  <svg viewBox="0 0 300 45" className="w-full h-full overflow-visible">
                    <line x1="0" y1="28" x2="300" y2="28" stroke="#a8a29e" strokeDasharray="3 3" />
                    <path
                      d="M 0 15 Q 120 18 150 35 T 300 12"
                      fill="none"
                      stroke="#155e75"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <p className="text-[9px] font-mono text-stone-500 leading-tight">
                  Dashed line: the coherence minimum. Below it, pixels are masked. Curve shapes are illustrative until a pack is built.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SCENE 3: ORIGINAL FLOODPLAIN SCREEN (280 - 480 frames) ================= */}
      {/* 1:1 replica of Image 3 (media_1794747943257_35d006ec.png) */}
      {isScene3 && (
        <div className="relative z-10 flex-1 flex flex-col justify-center space-y-4 py-1">
          {/* Top Title & Stat Row */}
          <div className="flex justify-between items-start border-b border-[#e4dfd5] pb-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">
                WALTZ · NISAR SURFACE CHANGE
              </span>
              <h1 className="font-serif text-3xl font-medium">A floodplain through the wet season</h1>
              <p className="text-xs text-stone-600">
                Candidate flooded areas from L-band radar, compared with a dry-season reference. Pick a pass, a polarization or a version of the data, then click the map.
              </p>
            </div>
            <div className="text-right font-mono shrink-0">
              <span className="text-4xl font-serif">8</span>
              <span className="block text-[9px] text-stone-400 uppercase">PASSES USED</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3 bg-white border border-[#e4dfd5] p-2.5 rounded-xl text-xs font-mono shadow-sm">
            <span className="px-2.5 py-1 rounded bg-[#e6f4f7] text-[#155e75] font-bold">
              PACK: Floodplain
            </span>
            <span className="px-2.5 py-1 rounded border text-stone-800">LAYER: Classified change</span>
            <span className="px-2.5 py-1 rounded border text-stone-800">POLARIZATION: HV</span>
            <span className="px-2.5 py-1 rounded border text-stone-800">MATURITY: All versions</span>
            <span className="text-stone-500 font-bold">PASS · [2026-08-17 Peak]</span>
          </div>

          {/* 2-Column Main Section */}
          <div className="grid grid-cols-12 gap-6 flex-1 items-stretch">
            {/* Left 7 Cols: Change map */}
            <div className="col-span-7 bg-white border border-[#e4dfd5] rounded-2xl p-5 shadow-lg relative flex flex-col justify-between overflow-hidden">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg font-medium">Change map</h3>
                  <span className="px-2 py-0.5 rounded border text-[10px] font-mono bg-stone-50">
                    Reset zoom
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Click an area to select it. Layers are candidate detections from thresholds, not ground truth.
                </p>
              </div>

              {/* Legend matching Image 3 */}
              <div className="flex items-center space-x-4 text-xs font-mono text-stone-700 py-1">
                <span className="flex items-center gap-1.5 font-bold text-[#155e75]">● Open water gain</span>
                <span className="flex items-center gap-1.5 font-bold text-[#c2410c]">● Flooded vegetation gain</span>
                <span className="flex items-center gap-1.5 text-stone-500">○ No change</span>
              </div>

              {/* Map Canvas with Pantanal OpenStreetMap layout */}
              <div className="relative flex-1 bg-[#ede6da] rounded-xl overflow-hidden my-2 border border-stone-200 flex items-center justify-center">
                <svg viewBox="0 0 1000 600" className="w-full h-full">
                  <rect width="1000" height="600" fill="#ede6da" />
                  <path d="M 0 350 Q 300 200 650 380 T 1000 300" fill="none" stroke="#d5cbb8" strokeWidth="4" />
                  <ellipse cx="480" cy="310" rx="360" ry="170" fill="#c2410c" opacity="0.8" />
                  <ellipse cx="480" cy="310" rx="260" ry="110" fill="#155e75" />
                  <ellipse cx="780" cy="400" rx="100" ry="50" fill="#155e75" />
                </svg>
                <div className="absolute bottom-2 left-3 text-[9px] font-mono bg-white/90 px-2 py-0.5 rounded border">
                  Basemap attribution shown here · OpenStreetMap
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Whole Area Card */}
            <div className="col-span-5 bg-white border border-[#e4dfd5] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase">SELECTION</span>
                <h3 className="font-serif text-2xl font-medium mt-0.5">Whole area</h3>
                <div className="text-[11px] font-mono text-stone-500 uppercase mt-0.5">
                  PASS 4 OF 8 · PROVISIONAL · P05023
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#e4dfd5] mt-3 text-xs font-mono">
                  <div>
                    <div className="font-bold text-base text-[#155e75]">420</div>
                    <div className="text-[9px] text-stone-400 uppercase leading-tight">OPEN WATER GAIN, KM²</div>
                  </div>
                  <div>
                    <div className="font-bold text-base text-[#c2410c]">310</div>
                    <div className="text-[9px] text-stone-400 uppercase leading-tight">FLOODED VEGETATION, KM²</div>
                  </div>
                  <div>
                    <div className="font-bold text-base">8</div>
                    <div className="text-[9px] text-stone-400 uppercase leading-tight">PASSES</div>
                  </div>
                </div>
              </div>

              {/* Stacked Bar Chart with Hatched Column matching Image 3 */}
              <div className="space-y-1 my-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-serif font-medium">Candidate flooded area over time</span>
                  <div className="flex gap-1 text-[9px] font-mono">
                    <span className="border px-1.5 py-0.5 rounded bg-stone-50">CSV</span>
                    <span className="border px-1.5 py-0.5 rounded bg-stone-50">PNG</span>
                  </div>
                </div>
                <div className="h-32 bg-stone-50 border border-stone-200 rounded-lg p-2.5 flex flex-col justify-between">
                  <div className="flex items-end justify-between gap-2 px-2 flex-1">
                    <div className="w-7 h-12 bg-[#155e75] rounded-t" />
                    <div className="w-7 h-18 bg-[#155e75] rounded-t" />
                    <div className="w-7 h-24 bg-[#155e75] rounded-t" />
                    <div className="w-7 h-28 bg-[#155e75] rounded-t" />
                    {/* The Hatched Gap Column */}
                    <div className="w-7 h-30 border border-dashed border-stone-400 bg-[repeating-linear-gradient(45deg,#d5cbb8,#d5cbb8_3px,#ffffff_3px,#ffffff_7px)] rounded-t" />
                    <div className="w-7 h-30 bg-[#155e75] rounded-t" />
                    <div className="w-7 h-24 bg-[#155e75] rounded-t" />
                    <div className="w-7 h-16 bg-[#155e75] rounded-t" />
                  </div>
                </div>
                <p className="text-[9px] font-mono text-stone-500 leading-tight">
                  Hatched column: no radar data (instrument gap). Bar shapes are illustrative until a pack is built.
                </p>
              </div>

              {/* Chart 2: HV backscatter selected pass vs reference */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-serif font-medium">HV backscatter, selected pass vs reference</span>
                  <div className="flex gap-1 text-[9px] font-mono">
                    <span className="border px-1.5 py-0.5 rounded bg-stone-50">CSV</span>
                    <span className="border px-1.5 py-0.5 rounded bg-stone-50">PNG</span>
                  </div>
                </div>
                <div className="h-20 bg-stone-50 border border-stone-200 rounded-lg p-2 flex items-center justify-center">
                  <svg viewBox="0 0 300 45" className="w-full h-full overflow-visible">
                    <path d="M 30 40 Q 150 5 270 40" fill="none" stroke="#1c1917" strokeWidth="2" />
                    <path d="M 30 40 Q 110 8 270 40" fill="none" stroke="#b4432c" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SCENE 4: ORIGINAL CROP CYCLE SCREEN (480 - 720 frames) ================= */}
      {/* 1:1 replica of Image 1 (media_1794747937578_e9a6f3c2.png) */}
      {isScene4 && (
        <div className="relative z-10 flex-1 flex flex-col justify-center space-y-4 py-1">
          {/* Top Title & Stat Row */}
          <div className="flex justify-between items-start border-b border-[#e4dfd5] pb-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">
                WALTZ · NISAR SURFACE CHANGE
              </span>
              <h1 className="font-serif text-3xl font-medium">A crop cycle, seen by radar</h1>
              <p className="text-xs text-stone-600">
                Radar signal through the growing season. Click up to two spots on the map and compare how they changed, pass by pass.
              </p>
            </div>
            <div className="text-right font-mono shrink-0">
              <span className="text-4xl font-serif">2</span>
              <span className="block text-[9px] text-stone-400 uppercase">POINTS SELECTED</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-3 bg-white border border-[#e4dfd5] p-2.5 rounded-xl text-xs font-mono shadow-sm">
            <span className="px-2.5 py-1 rounded bg-stone-100 font-bold">PACK: Crop cycle</span>
            <span className="px-2.5 py-1 rounded border text-stone-800">SIGNAL: HV backscatter (dB)</span>
            <span className="px-2.5 py-1 rounded border text-stone-800">MATURITY: All versions</span>
            <span className="text-stone-500 font-bold">PASS · [2026-07-23]</span>
            <span className="px-2.5 py-1 rounded border text-stone-600">Clear points</span>
          </div>

          {/* 2-Column Main Section */}
          <div className="grid grid-cols-12 gap-6 flex-1 items-stretch">
            {/* Left 7 Cols: Signal map */}
            <div className="col-span-7 bg-white border border-[#e4dfd5] rounded-2xl p-5 shadow-lg relative flex flex-col justify-between overflow-hidden">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg font-medium">Signal map</h3>
                  <span className="px-2 py-0.5 rounded border text-[10px] font-mono bg-stone-50">
                    Reset zoom
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Brighter means a stronger radar echo. Fields at different growth stages show different brightness.
                </p>
              </div>

              {/* Colorbar: WEAK [black to white] STRONG · DB */}
              <div className="flex items-center space-x-3 text-[10px] font-mono text-stone-500 py-1">
                <span>WEAK</span>
                <div className="h-2 flex-1 rounded bg-gradient-to-r from-stone-900 via-stone-500 to-stone-100 border" />
                <span>STRONG · DB</span>
              </div>

              {/* Map Canvas with Point 1 & Point 2 Crosshairs */}
              <div className="relative flex-1 bg-[#ded8ce] rounded-xl overflow-hidden my-2 border border-stone-200">
                <svg viewBox="0 0 1000 600" className="w-full h-full">
                  <rect width="1000" height="600" fill="#ded8ce" />
                  {/* Agricultural parcels grid */}
                  {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((x, i) => (
                    <line key={i} x1={x} y1="0" x2={x} y2="600" stroke="#c8c1b4" strokeWidth="1.5" />
                  ))}
                  {[100, 200, 300, 400, 500].map((y, i) => (
                    <line key={i} x1="0" y1={y} x2="1000" y2={y} stroke="#c8c1b4" strokeWidth="1.5" />
                  ))}

                  {/* Point 1 Crosshair */}
                  <line x1="0" y1="310" x2="1000" y2="310" stroke="#b4432c" strokeOpacity="0.6" />
                  <line x1="420" y1="0" x2="420" y2="600" stroke="#b4432c" strokeOpacity="0.6" />
                  <circle cx="420" cy="310" r="14" fill="white" stroke="#b4432c" strokeWidth="3" />
                  <circle cx="420" cy="310" r="4" fill="#b4432c" />

                  {/* Point 2 Crosshair */}
                  <line x1="0" y1="440" x2="1000" y2="440" stroke="#155e75" strokeOpacity="0.6" />
                  <line x1="720" y1="0" x2="720" y2="600" stroke="#155e75" strokeOpacity="0.6" />
                  <circle cx="720" cy="440" r="14" fill="white" stroke="#155e75" strokeWidth="3" />
                  <circle cx="720" cy="440" r="4" fill="#155e75" />
                </svg>
                <div className="absolute bottom-2 left-3 text-[9px] font-mono bg-white/90 px-2 py-0.5 rounded border">
                  Basemap attribution shown here · OpenStreetMap
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Point 1 vs Point 2 Card */}
            <div className="col-span-5 bg-white border border-[#e4dfd5] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase">SELECTION</span>
                <h3 className="font-serif text-2xl font-medium mt-0.5">Point 1 vs Point 2</h3>
                <div className="text-[11px] font-mono text-stone-500 uppercase mt-0.5">
                  PASS 5 OF 9 · MIXED VERSIONS
                </div>

                <div className="flex gap-4 py-2 text-xs font-mono border-y border-[#e4dfd5] mt-3">
                  <span className="text-[#b4432c] font-bold">― POINT 1 · DB NOW</span>
                  <span className="text-[#155e75] font-bold">― POINT 2 · DB NOW</span>
                  <span className="text-stone-400">― PEAK PASS</span>
                </div>
              </div>

              {/* Chart 1: HV backscatter over time */}
              <div className="space-y-1 my-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-serif font-medium">HV backscatter over time</span>
                  <div className="flex gap-1 text-[9px] font-mono">
                    <span className="border px-1.5 py-0.5 rounded bg-stone-50">CSV</span>
                    <span className="border px-1.5 py-0.5 rounded bg-stone-50">PNG</span>
                  </div>
                </div>
                <div className="h-32 bg-stone-50 border border-stone-200 rounded-lg p-2.5 flex flex-col justify-between">
                  <svg viewBox="0 0 300 70" className="w-full h-full overflow-visible">
                    <line x1="0" y1="65" x2="300" y2="65" stroke="#a8a29e" />
                    <line x1="150" y1="5" x2="150" y2="65" stroke="#78716c" strokeWidth="1" />
                    {/* Point 1 Rice curve */}
                    <path d="M 0 60 Q 150 10 300 55" fill="none" stroke="#b4432c" strokeWidth="3" />
                    {/* Point 2 Forest curve */}
                    <path d="M 0 45 Q 150 40 300 42" fill="none" stroke="#155e75" strokeWidth="2" />
                  </svg>
                  <div className="flex justify-between text-[8px] font-mono text-stone-400 pt-0.5 border-t">
                    <span>P1</span>
                    <span className="font-bold text-stone-700">P5 · SELECTED</span>
                    <span>P9</span>
                  </div>
                </div>
              </div>

              {/* Chart 2: Difference between points (dB) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-serif font-medium">Difference between points (dB)</span>
                  <div className="flex gap-1 text-[9px] font-mono">
                    <span className="border px-1.5 py-0.5 rounded bg-stone-50">CSV</span>
                    <span className="border px-1.5 py-0.5 rounded bg-stone-50">PNG</span>
                  </div>
                </div>
                <div className="h-20 bg-stone-50 border border-stone-200 rounded-lg p-2 flex items-end justify-between gap-1.5 px-3">
                  <div className="w-5 h-2 bg-stone-900 rounded-t" />
                  <div className="w-5 h-4 bg-stone-900 rounded-t" />
                  <div className="w-5 h-8 bg-stone-900 rounded-t" />
                  <div className="w-5 h-12 bg-stone-900 rounded-t" />
                  <div className="w-5 h-16 bg-[#b4432c] rounded-t" />
                  <div className="w-5 h-13 bg-stone-900 rounded-t" />
                  <div className="w-5 h-9 bg-stone-900 rounded-t" />
                  <div className="w-5 h-4 bg-stone-900 rounded-t" />
                  <div className="w-5 h-2 bg-stone-900 rounded-t" />
                </div>
                <p className="text-[9px] font-mono text-stone-500 leading-tight">
                  If a series mixes processing versions, the app warns here. Line shapes are illustrative until a pack is built.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SCENE 5: OUTRO / IMPACT (720 - 900 frames) ================= */}
      {isScene5 && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="text-xs font-mono tracking-widest text-emerald-800 uppercase bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-300">
            100% REPRODUCIBLE · ZERO LIVE SERVER COSTS
          </div>
          <h2 className="font-serif text-6xl font-medium tracking-tight max-w-4xl leading-tight">
            Earth science made visible, accessible, and actionable.
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl font-sans">
            Ready for researchers, local disaster managers, students, and educators worldwide.
          </p>
          <div className="pt-4">
            <button
              className={`px-8 py-3.5 rounded-full text-xs font-mono tracking-wider uppercase bg-[#1c1917] text-white shadow-xl transition-transform ${
                isClicking ? 'scale-95' : 'hover:scale-105'
              }`}
            >
              Launch Waltz on GitHub →
            </button>
          </div>
        </div>
      )}

      {/* SVG Canvas for Line A to B connecting (310, 744) to (834, 504) exactly */}
      {isScene2 && lineDrawn && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-40">
          <line
            x1="310"
            y1="744"
            x2="834"
            y2="504"
            stroke="#1c1917"
            strokeWidth="3.5"
            strokeDasharray="6 4"
          />
          {/* Point A Marker at (310, 744) */}
          <circle cx="310" cy="744" r="14" fill="white" stroke="#1c1917" strokeWidth="3" />
          <text x="306" y="749" className="font-mono text-xs font-bold fill-[#1c1917]">A</text>

          {/* Point B Marker at (834, 504) */}
          <circle cx="834" cy="504" r="14" fill="white" stroke="#1c1917" strokeWidth="3" />
          <text x="830" y="509" className="font-mono text-xs font-bold fill-[#1c1917]">B</text>
        </svg>
      )}

      {/* Animated Cursor Cam & Click Wave */}
      {showCursor && (
        <div
          style={{
            transform: `translate3d(${x}px, ${y}px, 0px)`,
          }}
          className="absolute z-50 pointer-events-none transition-transform duration-75 ease-out"
        >
          <div className={isClicking ? 'scale-90 transition-transform' : 'transition-transform'}>
            {isPointer ? (
              /* Hand pointer */
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#1c1917" stroke="white" strokeWidth="1.5">
                <path d="M9 11V4a2 2 0 1 1 4 0v7M13 11V2a2 2 0 1 1 4 0v9M17 11V5a2 2 0 1 1 4 0v8a7 7 0 0 1-7 7H9a7 7 0 0 1-7-7v-3a2 2 0 1 1 4 0v2" />
              </svg>
            ) : (
              /* Arrow pointer */
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#1c1917" stroke="white" strokeWidth="1.5">
                <path d="M3 3l7 18 3-7 7-3L3 3z" />
              </svg>
            )}
          </div>

          {/* Click Shockwave Ripple */}
          {isClicking && (
            <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full border-2 border-[#b4432c] animate-ping" />
          )}
        </div>
      )}

      {/* Subtitles & 30.0s Counter */}
      <div className="relative z-10 bg-[#1c1917] text-white p-3.5 rounded-xl flex items-center justify-between text-xs font-mono shadow-md">
        <div className="flex items-center space-x-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-stone-300">
            {isScene1 && '0:00 - Waltz turns NASA-ISRO NISAR radar into human-understandable stories.'}
            {isScene2 && '0:06 - Interactive Line A-B transect measuring co-seismic slip along Boconó Fault.'}
            {isScene3 && '0:14 - Tracking wet-season wetland flooding and isolating the instrument gap.'}
            {isScene4 && '0:22 - Click-to-chart crop cycle volume backscatter from precomputed data cubes.'}
            {isScene5 && '0:28 - Open source, accessible, and ready for global disaster resilience.'}
          </span>
        </div>
        <div className="text-stone-400">
          {(frame / fps).toFixed(1)}s / 30.0s
        </div>
      </div>
    </div>
  );
};
