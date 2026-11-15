import React, { useState } from 'react';
import { PackManifest } from '../types';
import { OSMMap } from './OSMMap';
import { Download, RotateCcw } from 'lucide-react';

interface DeformationViewProps {
  pack: PackManifest;
  onOpenMethods: () => void;
  onSelectPack?: (packId: string) => void;
}

export const DeformationView: React.FC<DeformationViewProps> = ({
  pack,
  onOpenMethods,
  onSelectPack,
}) => {
  const [selectedLayer, setSelectedLayer] = useState<'displacement' | 'fringes' | 'coherence'>('displacement');
  const [passPair, setPassPair] = useState<string>('2026-06-12 to 2026-06-24');
  const [maturity, setMaturity] = useState<string>('Provisional');
  const [coherenceMin, setCoherenceMin] = useState<number>(0.3);

  // Line A to B coordinates across Boconó Fault, Venezuela
  const [linePoints, setLinePoints] = useState<{ a: [number, number]; b: [number, number] }>({
    a: [9.72, -70.35],
    b: [10.28, -69.45],
  });
  const [isDrawingLine, setIsDrawingLine] = useState<boolean>(false);

  // Calculate length in km (Haversine approximation)
  const calcDistanceKm = (p1: [number, number], p2: [number, number]) => {
    const R = 6371;
    const dLat = ((p2[0] - p1[0]) * Math.PI) / 180;
    const dLon = ((p2[1] - p1[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1[0] * Math.PI) / 180) *
        Math.cos((p2[0] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const lineLengthKm = calcDistanceKm(linePoints.a, linePoints.b);

  // Profile data along Line A to B
  const profileData = [
    { km: 0, disp: 1.2, coh: 0.72 },
    { km: 5, disp: 0.8, coh: 0.68 },
    { km: 10, disp: -2.4, coh: 0.65 },
    { km: 15, disp: -7.5, coh: 0.61 },
    { km: 20, disp: -12.1, coh: 0.52 },
    { km: 24, disp: -14.6, coh: 0.44 },
    // Fault discontinuity
    { km: 26, disp: 4.5, coh: 0.28 },
    { km: 30, disp: 13.8, coh: 0.35 },
    { km: 35, disp: 18.2, coh: 0.58 },
    { km: 40, disp: 15.1, coh: 0.69 },
    { km: 45, disp: 9.3, coh: 0.74 },
    { km: 50, disp: 4.8, coh: 0.78 },
    { km: 52, disp: 2.1, coh: 0.81 },
  ];

  const exportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine active raster overlay
  const overlayUrl =
    selectedLayer === 'displacement'
      ? '/packs/venezuela-quake-2026/displacement.png'
      : selectedLayer === 'fringes'
      ? '/packs/venezuela-quake-2026/fringes.png'
      : '/packs/venezuela-quake-2026/coherence.png';

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Top Header Section (Exact Match to Image 2) */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-paper-border dark:border-paper-darkBorder pb-5">
        <div className="space-y-1.5 max-w-3xl">
          <div className="text-[11px] font-mono tracking-widest text-stone-500 uppercase">
            WALTZ · NISAR SURFACE CHANGE
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-waltz-ink dark:text-stone-100 font-medium tracking-tight">
            Ground shift after the June 2026 Venezuela earthquakes
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
            Radar phase turned into centimeters of motion between two passes. Draw a line on the map to see how the ground moved along it.
          </p>
        </div>

        {/* Top Right Big Stat Counter (Image 2) */}
        <div className="flex flex-col items-end shrink-0">
          <div className="font-serif text-5xl sm:text-6xl text-waltz-ink dark:text-stone-100 font-normal leading-none">
            1
          </div>
          <div className="border-t border-stone-300 dark:border-stone-700 w-full mt-1 pt-1 text-[10px] font-mono tracking-widest text-stone-500 uppercase text-right">
            PASS PAIR USED
          </div>
        </div>
      </div>

      {/* Filter Control Bar (Exact Match to Image 2) */}
      <div className="flex flex-wrap items-center gap-3 bg-paper-50 dark:bg-paper-darkCard border border-paper-border dark:border-paper-darkBorder p-3 rounded-xl text-xs font-mono">
        {/* PACK Dropdown */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] text-stone-500 uppercase">PACK</span>
          <select
            value="venezuela-quake-2026"
            onChange={(e) => onSelectPack && onSelectPack(e.target.value)}
            className="bg-white dark:bg-stone-800 border border-paper-border dark:border-paper-darkBorder rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none"
          >
            <option value="venezuela-quake-2026">Earthquake</option>
            <option value="floodplain-wet-season">Floodplain</option>
            <option value="crop-cycle-radar">Crop cycle</option>
          </select>
        </div>

        {/* LAYER Dropdown */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] text-stone-500 uppercase">LAYER</span>
          <select
            value={selectedLayer}
            onChange={(e) => setSelectedLayer(e.target.value as any)}
            className="bg-white dark:bg-stone-800 border border-paper-border dark:border-paper-darkBorder rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none"
          >
            <option value="displacement">Displacement (cm)</option>
            <option value="fringes">Fringes (11.9 cm/cycle)</option>
            <option value="coherence">Coherence mask</option>
          </select>
        </div>

        {/* PASS PAIR */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] text-stone-500 uppercase">PASS PAIR</span>
          <select
            value={passPair}
            onChange={(e) => setPassPair(e.target.value)}
            className="bg-white dark:bg-stone-800 border border-paper-border dark:border-paper-darkBorder rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none"
          >
            <option value="2026-06-12 to 2026-06-24">[2026-06-12] to [2026-06-24]</option>
          </select>
        </div>

        {/* MATURITY */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] text-stone-500 uppercase">MATURITY</span>
          <select
            value={maturity}
            onChange={(e) => setMaturity(e.target.value)}
            className="bg-white dark:bg-stone-800 border border-paper-border dark:border-paper-darkBorder rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none"
          >
            <option value="Provisional">Provisional</option>
            <option value="Validated">Validated</option>
          </select>
        </div>

        {/* COHERENCE MINIMUM Slider */}
        <div className="flex flex-col space-y-1 flex-1 min-w-[180px] max-w-xs">
          <div className="flex justify-between text-[10px] text-stone-500 uppercase">
            <span>COHERENCE MINIMUM</span>
            <span className="font-bold text-stone-800 dark:text-stone-200">{coherenceMin.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.05"
            value={coherenceMin}
            onChange={(e) => setCoherenceMin(parseFloat(e.target.value))}
            className="accent-waltz-rust cursor-pointer h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg"
          />
        </div>

        {/* Reset Button */}
        <div className="flex flex-col justify-end pt-3">
          <button
            onClick={() => {
              setSelectedLayer('displacement');
              setCoherenceMin(0.3);
              setLinePoints({ a: [9.72, -70.35], b: [10.28, -69.45] });
            }}
            className="px-4 py-1.5 rounded border border-paper-border dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-paper-200 text-stone-700 dark:text-stone-300 text-xs font-mono"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main 2-Column Content Layout (Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Displacement map with OpenStreetMap (Col 7) */}
        <div className="lg:col-span-7 border border-paper-border dark:border-paper-darkBorder bg-paper-50 dark:bg-paper-darkCard rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-medium text-waltz-ink dark:text-stone-100">
              Displacement map
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Motion along the satellite's line of sight. Gray areas are masked as too noisy to trust.
            </p>
          </div>

          {/* Colorbar: AWAY [gradient] TOWARD · CM */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center space-x-3 text-[10px] font-mono text-stone-500">
              <span className="uppercase">AWAY</span>
              <div className="h-2.5 flex-1 rounded-sm bg-gradient-to-r from-[#155e75] via-[#f5f0e6] to-[#c2410c] border border-stone-300 dark:border-stone-700" />
              <span className="uppercase">TOWARD · CM</span>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-stone-400 px-12">
              <span>-20</span>
              <span>0</span>
              <span>+20</span>
            </div>
          </div>

          {/* Real OpenStreetMap Container */}
          <div className="w-full h-[540px] rounded-xl overflow-hidden border border-paper-border dark:border-stone-800 relative">
            <OSMMap
              bounds={[-70.5, 9.5, -69.2, 10.8]}
              overlayUrl={overlayUrl}
              overlayOpacity={0.82}
              mode="earthquake"
              linePoints={linePoints}
              onLineChange={setLinePoints}
              isDrawingLine={isDrawingLine}
              onFinishDrawing={() => setIsDrawingLine(false)}
            />
          </div>
        </div>

        {/* Right Column: SELECTION Card (Col 5, Image 2) */}
        <div className="lg:col-span-5 border border-paper-border dark:border-paper-darkBorder bg-paper-50 dark:bg-paper-darkCard rounded-2xl p-5 space-y-6 shadow-sm">
          {/* Section Header */}
          <div className="border-b border-paper-border dark:border-paper-darkBorder pb-4">
            <div className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">
              SELECTION
            </div>
            <h3 className="font-serif text-2xl font-medium text-waltz-ink dark:text-stone-100 mt-0.5">
              Line A to B
            </h3>
            <div className="text-[11px] font-mono text-stone-500 mt-1 uppercase">
              PROVISIONAL · P05023 · {lineLengthKm} KM
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-paper-border/60 dark:border-paper-darkBorder/60 mt-3 text-xs font-mono">
              <div className="space-y-1">
                <div className="text-stone-900 dark:text-stone-100 font-bold text-sm">+18.2</div>
                <div className="text-[9px] text-stone-400 uppercase leading-tight">MOST TOWARD, CM</div>
              </div>
              <div className="space-y-1">
                <div className="text-stone-900 dark:text-stone-100 font-bold text-sm">-14.6</div>
                <div className="text-[9px] text-stone-400 uppercase leading-tight">MOST AWAY, CM</div>
              </div>
              <div className="space-y-1">
                <div className="text-stone-900 dark:text-stone-100 font-bold text-sm">4.2%</div>
                <div className="text-[9px] text-stone-400 uppercase leading-tight">MASKED, % OF LINE</div>
              </div>
            </div>
          </div>

          {/* Chart 1: Displacement along the line */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-base font-medium text-waltz-ink dark:text-stone-100">
                Displacement along the line
              </h4>
              <div className="flex space-x-1.5">
                <button
                  onClick={() =>
                    exportCSV(
                      'displacement_line_ab',
                      ['km', 'disp_cm'],
                      profileData.map((d) => [d.km, d.disp])
                    )
                  }
                  className="px-2 py-0.5 rounded border border-stone-300 dark:border-stone-700 text-[10px] font-mono hover:bg-stone-200"
                >
                  CSV
                </button>
                <button
                  onClick={() => alert('Exporting chart PNG...')}
                  className="px-2 py-0.5 rounded border border-stone-300 dark:border-stone-700 text-[10px] font-mono hover:bg-stone-200"
                >
                  PNG
                </button>
              </div>
            </div>

            {/* SVG Profile Line Graph */}
            <div className="w-full h-36 bg-white dark:bg-stone-900 border border-paper-border dark:border-stone-800 rounded-lg p-3 relative flex flex-col justify-between">
              <svg viewBox="0 0 500 100" className="w-full h-full overflow-visible">
                {/* Horizontal Zero reference line */}
                <line x1="0" y1="50" x2="500" y2="50" stroke="#78716c" strokeDasharray="3 3" strokeWidth="1" />
                {/* Profile line in rust/terracotta */}
                <polyline
                  fill="none"
                  stroke="#b4432c"
                  strokeWidth="2.5"
                  points={profileData
                    .map((p, i) => {
                      const x = (i / (profileData.length - 1)) * 500;
                      // map -20cm to +20cm to [90, 10]
                      const y = 50 - (p.disp / 20) * 40;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              </svg>
              <div className="flex justify-between text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-200 dark:border-stone-800">
                <span>A</span>
                <span>KM ALONG LINE</span>
                <span>B</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Signal quality along the line */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-base font-medium text-waltz-ink dark:text-stone-100">
                Signal quality along the line
              </h4>
              <div className="flex space-x-1.5">
                <button
                  onClick={() =>
                    exportCSV(
                      'coherence_line_ab',
                      ['km', 'coherence'],
                      profileData.map((d) => [d.km, d.coh])
                    )
                  }
                  className="px-2 py-0.5 rounded border border-stone-300 dark:border-stone-700 text-[10px] font-mono hover:bg-stone-200"
                >
                  CSV
                </button>
                <button
                  onClick={() => alert('Exporting chart PNG...')}
                  className="px-2 py-0.5 rounded border border-stone-300 dark:border-stone-700 text-[10px] font-mono hover:bg-stone-200"
                >
                  PNG
                </button>
              </div>
            </div>

            {/* Coherence Graph */}
            <div className="w-full h-28 bg-white dark:bg-stone-900 border border-paper-border dark:border-stone-800 rounded-lg p-3 relative flex flex-col justify-between">
              <svg viewBox="0 0 500 80" className="w-full h-full overflow-visible">
                {/* Dashed line representing coherence minimum threshold */}
                <line
                  x1="0"
                  y1={80 - coherenceMin * 80}
                  x2="500"
                  y2={80 - coherenceMin * 80}
                  stroke="#78716c"
                  strokeDasharray="4 4"
                  strokeWidth="1.2"
                />
                {/* Coherence line in teal */}
                <polyline
                  fill="none"
                  stroke="#155e75"
                  strokeWidth="2"
                  points={profileData
                    .map((p, i) => {
                      const x = (i / (profileData.length - 1)) * 500;
                      const y = 80 - p.coh * 75;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              </svg>
            </div>

            <p className="text-[11px] font-mono text-stone-500 leading-normal pt-1">
              Dashed line: the coherence minimum. Below it, pixels are masked. Curve shapes are illustrative until a pack is built.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
