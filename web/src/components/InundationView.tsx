import React, { useState } from 'react';
import { PackManifest } from '../types';
import { OSMMap } from './OSMMap';

interface InundationViewProps {
  pack: PackManifest;
  onOpenMethods: () => void;
  onSelectPack?: (packId: string) => void;
}

export const InundationView: React.FC<InundationViewProps> = ({
  pack,
  onOpenMethods,
  onSelectPack,
}) => {
  const [selectedLayer, setSelectedLayer] = useState<string>('Classified change');
  const [polarization, setPolarization] = useState<string>('HV');
  const [maturity, setMaturity] = useState<string>('All versions');
  const [passIndex, setPassIndex] = useState<number>(3); // Pass 4 default

  const passes = [
    { id: 'P1', date: '2026-06-18', water: 120, floodedVeg: 85 },
    { id: 'P2', date: '2026-06-30', water: 210, floodedVeg: 140 },
    { id: 'P3', date: '2026-07-12', water: 340, floodedVeg: 220 },
    { id: 'P4', date: '2026-07-24', water: 420, floodedVeg: 310 },
    // GAP: 2026-07-27 to 2026-08-10
    { id: 'P5', date: '2026-08-17', water: 580, floodedVeg: 410 },
    { id: 'P6', date: '2026-08-29', water: 490, floodedVeg: 340 },
    { id: 'P7', date: '2026-09-10', water: 310, floodedVeg: 230 },
    { id: 'P8', date: '2026-09-22', water: 180, floodedVeg: 120 },
  ];

  const currentPass = passes[passIndex];

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

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Top Header Section (Exact Match to Image 3) */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-paper-border dark:border-paper-darkBorder pb-5">
        <div className="space-y-1.5 max-w-3xl">
          <div className="text-[11px] font-mono tracking-widest text-stone-500 uppercase">
            WALTZ · NISAR SURFACE CHANGE
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-waltz-ink dark:text-stone-100 font-medium tracking-tight">
            A floodplain through the wet season
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
            Candidate flooded areas from L-band radar, compared with a dry-season reference. Pick a pass, a polarization or a version of the data, then click the map.
          </p>
        </div>

        {/* Top Right Big Stat Counter (Image 3) */}
        <div className="flex flex-col items-end shrink-0">
          <div className="font-serif text-5xl sm:text-6xl text-waltz-ink dark:text-stone-100 font-normal leading-none">
            8
          </div>
          <div className="border-t border-stone-300 dark:border-stone-700 w-full mt-1 pt-1 text-[10px] font-mono tracking-widest text-stone-500 uppercase text-right">
            PASSES USED
          </div>
        </div>
      </div>

      {/* Filter Control Bar (Exact Match to Image 3) */}
      <div className="flex flex-wrap items-center gap-3 bg-paper-50 dark:bg-paper-darkCard border border-paper-border dark:border-paper-darkBorder p-3 rounded-xl text-xs font-mono">
        {/* PACK Dropdown */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] text-stone-500 uppercase">PACK</span>
          <select
            value="floodplain-wet-season"
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
            onChange={(e) => setSelectedLayer(e.target.value)}
            className="bg-white dark:bg-stone-800 border border-paper-border dark:border-paper-darkBorder rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none"
          >
            <option value="Classified change">Classified change</option>
            <option value="Delta dB">Delta dB</option>
          </select>
        </div>

        {/* POLARIZATION */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] text-stone-500 uppercase">POLARIZATION</span>
          <select
            value={polarization}
            onChange={(e) => setPolarization(e.target.value)}
            className="bg-white dark:bg-stone-800 border border-paper-border dark:border-paper-darkBorder rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none"
          >
            <option value="HV">HV (volume, vegetation)</option>
            <option value="HH">HH (double-bounce)</option>
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
            <option value="All versions">All versions</option>
            <option value="Provisional">Provisional</option>
            <option value="Validated">Validated</option>
          </select>
        </div>

        {/* PASS Slider */}
        <div className="flex flex-col space-y-1 flex-1 min-w-[200px] max-w-sm">
          <div className="flex justify-between text-[10px] text-stone-500 uppercase">
            <span>PASS · [{currentPass.date}]</span>
            <span className="font-bold text-stone-800 dark:text-stone-200">Pass {passIndex + 1} of 8</span>
          </div>
          <input
            type="range"
            min="0"
            max="7"
            step="1"
            value={passIndex}
            onChange={(e) => setPassIndex(parseInt(e.target.value))}
            className="accent-waltz-rust cursor-pointer h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg"
          />
        </div>

        {/* Reset Button */}
        <div className="flex flex-col justify-end pt-3">
          <button
            onClick={() => {
              setPassIndex(3);
              setPolarization('HV');
              setSelectedLayer('Classified change');
            }}
            className="px-4 py-1.5 rounded border border-paper-border dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-paper-200 text-stone-700 dark:text-stone-300 text-xs font-mono"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main 2-Column Content Layout (Image 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Change map with OpenStreetMap (Col 7) */}
        <div className="lg:col-span-7 border border-paper-border dark:border-paper-darkBorder bg-paper-50 dark:bg-paper-darkCard rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-medium text-waltz-ink dark:text-stone-100">
              Change map
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Click an area to select it. Layers are candidate detections from thresholds, not ground truth.
            </p>
          </div>

          {/* Legend: Open water gain (teal) / Flooded veg (rust) / No change */}
          <div className="flex items-center space-x-4 text-xs font-mono text-stone-700 dark:text-stone-300 pt-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#155e75]" />
              <span>Open water gain</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#c2410c]" />
              <span>Flooded vegetation gain</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full border border-stone-500 bg-transparent" />
              <span>No change</span>
            </div>
          </div>

          {/* Real OpenStreetMap Container over Pantanal */}
          <div className="w-full h-[540px] rounded-xl overflow-hidden border border-paper-border dark:border-stone-800 relative">
            <OSMMap
              bounds={[-56.5, -17.5, -55.0, -16.0]}
              overlayUrl={`/packs/floodplain-wet-season/inundation_P${passIndex + 1}.png`}
              overlayOpacity={0.88}
              mode="floodplain"
            />
          </div>
        </div>

        {/* Right Column: SELECTION Card (Col 5, Image 3) */}
        <div className="lg:col-span-5 border border-paper-border dark:border-paper-darkBorder bg-paper-50 dark:bg-paper-darkCard rounded-2xl p-5 space-y-6 shadow-sm">
          {/* Header */}
          <div className="border-b border-paper-border dark:border-paper-darkBorder pb-4">
            <div className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">
              SELECTION
            </div>
            <h3 className="font-serif text-2xl font-medium text-waltz-ink dark:text-stone-100 mt-0.5">
              Whole area
            </h3>
            <div className="text-[11px] font-mono text-stone-500 mt-1 uppercase">
              PASS {passIndex + 1} OF 8 · PROVISIONAL · P05023
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-paper-border/60 dark:border-paper-darkBorder/60 mt-3 text-xs font-mono">
              <div className="space-y-1">
                <div className="text-stone-900 dark:text-stone-100 font-bold text-sm">{currentPass.water}</div>
                <div className="text-[9px] text-stone-400 uppercase leading-tight">OPEN WATER GAIN, KM²</div>
              </div>
              <div className="space-y-1">
                <div className="text-stone-900 dark:text-stone-100 font-bold text-sm">{currentPass.floodedVeg}</div>
                <div className="text-[9px] text-stone-400 uppercase leading-tight">FLOODED VEGETATION, KM²</div>
              </div>
              <div className="space-y-1">
                <div className="text-stone-900 dark:text-stone-100 font-bold text-sm">8</div>
                <div className="text-[9px] text-stone-400 uppercase leading-tight">PASSES</div>
              </div>
            </div>
          </div>

          {/* Chart 1: Candidate flooded area over time (Stacked with Hatched Gap) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-base font-medium text-waltz-ink dark:text-stone-100">
                Candidate flooded area over time
              </h4>
              <div className="flex space-x-1.5">
                <button
                  onClick={() =>
                    exportCSV(
                      'candidate_flooded_area',
                      ['pass', 'date', 'open_water_km2', 'flooded_veg_km2'],
                      passes.map((p) => [p.id, p.date, p.water, p.floodedVeg])
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

            {/* Stacked Bar Chart with Hatched Column for Instrument Gap */}
            <div className="w-full h-44 bg-white dark:bg-stone-900 border border-paper-border dark:border-stone-800 rounded-lg p-3 flex flex-col justify-between">
              <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 px-1">
                {/* Passes P1 to P4 */}
                {passes.slice(0, 4).map((p, idx) => {
                  const waterHeight = (p.water / 600) * 80;
                  const vegHeight = (p.floodedVeg / 600) * 80;
                  const isSelected = passIndex === idx;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setPassIndex(idx)}
                      className="flex-1 flex flex-col items-center cursor-pointer group h-full justify-end"
                    >
                      <div className="w-full max-w-[28px] flex flex-col justify-end">
                        <div style={{ height: `${vegHeight}px` }} className="bg-[#c2410c] rounded-t-sm" />
                        <div style={{ height: `${waterHeight}px` }} className="bg-[#155e75]" />
                      </div>
                      <span className={`text-[10px] font-mono mt-1 ${isSelected ? 'font-bold text-waltz-rust' : 'text-stone-400'}`}>
                        {p.id}
                      </span>
                    </div>
                  );
                })}

                {/* HATCHED COLUMN: INSTRUMENT GAP (2026-07-27 to 2026-08-10) */}
                <div className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div
                    style={{ height: '90px' }}
                    className="w-full max-w-[28px] border border-dashed border-stone-400 rounded-t-sm bg-[repeating-linear-gradient(45deg,#d5cbb8,#d5cbb8_3px,#ffffff_3px,#ffffff_7px)] dark:bg-[repeating-linear-gradient(45deg,#3e3e3a,#3e3e3a_3px,#1e1e1c_3px,#1e1e1c_7px)]"
                    title="NISAR Instrument Gap (2026-07-27 to 2026-08-10)"
                  />
                  <span className="text-[9px] font-mono mt-1 text-stone-400 uppercase">GAP</span>
                </div>

                {/* Passes P5 to P8 */}
                {passes.slice(4, 8).map((p, idx) => {
                  const actualIdx = idx + 4;
                  const waterHeight = (p.water / 600) * 80;
                  const vegHeight = (p.floodedVeg / 600) * 80;
                  const isSelected = passIndex === actualIdx;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setPassIndex(actualIdx)}
                      className="flex-1 flex flex-col items-center cursor-pointer group h-full justify-end"
                    >
                      <div className="w-full max-w-[28px] flex flex-col justify-end">
                        <div style={{ height: `${vegHeight}px` }} className="bg-[#c2410c] rounded-t-sm" />
                        <div style={{ height: `${waterHeight}px` }} className="bg-[#155e75]" />
                      </div>
                      <span className={`text-[10px] font-mono mt-1 ${isSelected ? 'font-bold text-waltz-rust' : 'text-stone-400'}`}>
                        {p.id}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] font-mono text-stone-500 leading-normal">
              Hatched column: no radar data (instrument gap). Bar shapes are illustrative until a pack is built.
            </p>
          </div>

          {/* Chart 2: HV backscatter, selected pass vs reference (Density curves) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-base font-medium text-waltz-ink dark:text-stone-100">
                HV backscatter, selected pass vs reference
              </h4>
              <div className="flex space-x-1.5">
                <button
                  onClick={() => alert('Exporting curve CSV...')}
                  className="px-2 py-0.5 rounded border border-stone-300 dark:border-stone-700 text-[10px] font-mono hover:bg-stone-200"
                >
                  CSV
                </button>
                <button
                  onClick={() => alert('Exporting curve PNG...')}
                  className="px-2 py-0.5 rounded border border-stone-300 dark:border-stone-700 text-[10px] font-mono hover:bg-stone-200"
                >
                  PNG
                </button>
              </div>
            </div>

            {/* Density Curves SVG */}
            <div className="w-full h-32 bg-white dark:bg-stone-900 border border-paper-border dark:border-stone-800 rounded-lg p-3 relative flex items-center justify-center">
              <svg viewBox="0 0 500 100" className="w-full h-full overflow-visible">
                {/* Baseline reference curve in black */}
                <path
                  d="M 50 90 Q 250 10 450 90"
                  fill="none"
                  stroke="#1c1917"
                  strokeWidth="2"
                />
                {/* Selected pass curve in rust/terracotta */}
                <path
                  d="M 50 90 Q 180 15 450 90"
                  fill="none"
                  stroke="#b4432c"
                  strokeWidth="2.5"
                />
              </svg>
              <div className="absolute bottom-2 left-4 flex space-x-4 text-[10px] font-mono">
                <span className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200">
                  <span className="w-3 h-0.5 bg-[#b4432c]" /> Selected pass
                </span>
                <span className="flex items-center gap-1.5 text-stone-500">
                  <span className="w-3 h-0.5 bg-[#1c1917] dark:bg-white" /> Reference (dry)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
