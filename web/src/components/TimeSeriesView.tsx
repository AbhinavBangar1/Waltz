import React, { useState } from 'react';
import { PackManifest } from '../types';
import { OSMMap, MapPoint } from './OSMMap';

interface TimeSeriesViewProps {
  pack: PackManifest;
  onOpenMethods: () => void;
  onSelectPack?: (packId: string) => void;
}

export const TimeSeriesView: React.FC<TimeSeriesViewProps> = ({
  pack,
  onOpenMethods,
  onSelectPack,
}) => {
  const [signal, setSignal] = useState<'HV' | 'HH_HV'>('HV');
  const [maturity, setMaturity] = useState<string>('All versions');
  const [passIndex, setPassIndex] = useState<number>(4); // P5 is peak pass (index 4)

  const passes = [
    { id: 'P1', date: '2026-06-05' },
    { id: 'P2', date: '2026-06-17' },
    { id: 'P3', date: '2026-06-29' },
    { id: 'P4', date: '2026-07-11' },
    { id: 'P5', date: '2026-07-23' },
    { id: 'P6', date: '2026-08-16' },
    { id: 'P7', date: '2026-08-28' },
    { id: 'P8', date: '2026-09-09' },
    { id: 'P9', date: '2026-10-25' },
  ];

  // Up to two points on the map
  const [cropPoints, setCropPoints] = useState<MapPoint[]>([
    { lat: 22.815, lng: 88.542, label: 'Point 1', color: '#b4432c' },
    { lat: 22.650, lng: 88.820, label: 'Point 2', color: '#155e75' },
  ]);

  // Backscatter series values
  const point1Values = [-24.1, -22.3, -18.5, -15.2, -12.3, -13.0, -14.8, -18.2, -21.8];
  const point2Values = [-19.5, -19.0, -18.2, -17.5, -16.8, -17.0, -17.4, -18.0, -19.2];

  // Difference between Point 1 and Point 2 in dB
  const diffValues = point1Values.map((v, i) => Math.abs(parseFloat((v - point2Values[i]).toFixed(1))));

  const handleMapClick = (lat: number, lng: number) => {
    if (cropPoints.length < 2) {
      setCropPoints([
        ...cropPoints,
        {
          lat,
          lng,
          label: `Point ${cropPoints.length + 1}`,
          color: cropPoints.length === 0 ? '#b4432c' : '#155e75',
        },
      ]);
    } else {
      // Replace Point 2
      setCropPoints([
        cropPoints[0],
        { lat, lng, label: 'Point 2', color: '#155e75' },
      ]);
    }
  };

  const clearPoints = () => {
    setCropPoints([]);
  };

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
      {/* Top Header Section (Exact Match to Image 1) */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-paper-border dark:border-paper-darkBorder pb-5">
        <div className="space-y-1.5 max-w-3xl">
          <div className="text-[11px] font-mono tracking-widest text-stone-500 uppercase">
            WALTZ · NISAR SURFACE CHANGE
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-waltz-ink dark:text-stone-100 font-medium tracking-tight">
            A crop cycle, seen by radar
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
            Radar signal through the growing season. Click up to two spots on the map and compare how they changed, pass by pass.
          </p>
        </div>

        {/* Top Right Big Stat Counter (Image 1) */}
        <div className="flex flex-col items-end shrink-0">
          <div className="font-serif text-5xl sm:text-6xl text-waltz-ink dark:text-stone-100 font-normal leading-none">
            {cropPoints.length}
          </div>
          <div className="border-t border-stone-300 dark:border-stone-700 w-full mt-1 pt-1 text-[10px] font-mono tracking-widest text-stone-500 uppercase text-right">
            POINTS SELECTED
          </div>
        </div>
      </div>

      {/* Filter Control Bar (Exact Match to Image 1) */}
      <div className="flex flex-wrap items-center gap-3 bg-paper-50 dark:bg-paper-darkCard border border-paper-border dark:border-paper-darkBorder p-3 rounded-xl text-xs font-mono">
        {/* PACK Dropdown */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] text-stone-500 uppercase">PACK</span>
          <select
            value="crop-cycle-radar"
            onChange={(e) => onSelectPack && onSelectPack(e.target.value)}
            className="bg-white dark:bg-stone-800 border border-paper-border dark:border-paper-darkBorder rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none"
          >
            <option value="venezuela-quake-2026">Earthquake</option>
            <option value="floodplain-wet-season">Floodplain</option>
            <option value="crop-cycle-radar">Crop cycle</option>
          </select>
        </div>

        {/* SIGNAL Dropdown */}
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] text-stone-500 uppercase">SIGNAL</span>
          <select
            value={signal}
            onChange={(e) => setSignal(e.target.value as any)}
            className="bg-white dark:bg-stone-800 border border-paper-border dark:border-paper-darkBorder rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none"
          >
            <option value="HV">HV backscatter (dB)</option>
            <option value="HH_HV">HH / HV ratio</option>
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
            <span>PASS · [{passes[passIndex].date}]</span>
            <span className="font-bold text-stone-800 dark:text-stone-200">Pass {passIndex + 1} of 9</span>
          </div>
          <input
            type="range"
            min="0"
            max="8"
            step="1"
            value={passIndex}
            onChange={(e) => setPassIndex(parseInt(e.target.value))}
            className="accent-waltz-rust cursor-pointer h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg"
          />
        </div>

        {/* Clear points Button */}
        <div className="flex flex-col justify-end pt-3">
          <button
            onClick={clearPoints}
            className="px-4 py-1.5 rounded border border-paper-border dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-paper-200 text-stone-700 dark:text-stone-300 text-xs font-mono"
          >
            Clear points
          </button>
        </div>

        {/* Reset Button */}
        <div className="flex flex-col justify-end pt-3">
          <button
            onClick={() => {
              setCropPoints([
                { lat: 22.815, lng: 88.542, label: 'Point 1', color: '#b4432c' },
                { lat: 22.650, lng: 88.820, label: 'Point 2', color: '#155e75' },
              ]);
              setPassIndex(4);
            }}
            className="px-4 py-1.5 rounded border border-paper-border dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-paper-200 text-stone-700 dark:text-stone-300 text-xs font-mono"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main 2-Column Content Layout (Image 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Signal map with OpenStreetMap (Col 7) */}
        <div className="lg:col-span-7 border border-paper-border dark:border-paper-darkBorder bg-paper-50 dark:bg-paper-darkCard rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-medium text-waltz-ink dark:text-stone-100">
              Signal map
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Brighter means a stronger radar echo. Fields at different growth stages show different brightness.
            </p>
          </div>

          {/* Colorbar: WEAK [black to white gradient] STRONG · DB */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center space-x-3 text-[10px] font-mono text-stone-500">
              <span className="uppercase">WEAK</span>
              <div className="h-2.5 flex-1 rounded-sm bg-gradient-to-r from-stone-900 via-stone-500 to-stone-100 border border-stone-300 dark:border-stone-700" />
              <span className="uppercase">STRONG · DB</span>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-stone-400 px-12">
              <span>-30 dB</span>
              <span>-15 dB</span>
              <span>0 dB</span>
            </div>
          </div>

          {/* Real OpenStreetMap Container over Agricultural Region */}
          <div className="w-full h-[540px] rounded-xl overflow-hidden border border-paper-border dark:border-stone-800 relative">
            <OSMMap
              bounds={[88.1, 22.4, 89.2, 23.3]}
              overlayUrl={`/packs/crop-cycle-radar/backscatter_P${passIndex + 1}.png`}
              overlayOpacity={0.8}
              mode="crop"
              cropPoints={cropPoints}
              onMapClick={handleMapClick}
            />
          </div>
        </div>

        {/* Right Column: SELECTION Card (Col 5, Image 1) */}
        <div className="lg:col-span-5 border border-paper-border dark:border-paper-darkBorder bg-paper-50 dark:bg-paper-darkCard rounded-2xl p-5 space-y-6 shadow-sm">
          {/* Header */}
          <div className="border-b border-paper-border dark:border-paper-darkBorder pb-4">
            <div className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">
              SELECTION
            </div>
            <h3 className="font-serif text-2xl font-medium text-waltz-ink dark:text-stone-100 mt-0.5">
              Point 1 vs Point 2
            </h3>
            <div className="text-[11px] font-mono text-stone-500 mt-1 uppercase">
              PASS {passIndex + 1} OF 9 · MIXED VERSIONS
            </div>

            {/* Legend: Point 1 / Point 2 / Peak Pass */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-stone-700 dark:text-stone-300 pt-3 border-t border-paper-border/60 dark:border-paper-darkBorder/60 mt-3">
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-0.5 bg-[#b4432c]" />
                <span className="text-[10px] text-stone-500 uppercase">POINT 1 · {point1Values[passIndex]} DB NOW</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-0.5 bg-[#155e75]" />
                <span className="text-[10px] text-stone-500 uppercase">POINT 2 · {point2Values[passIndex]} DB NOW</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-0.5 bg-stone-400" />
                <span className="text-[10px] text-stone-400 uppercase">PEAK PASS</span>
              </div>
            </div>
          </div>

          {/* Chart 1: HV backscatter over time */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-base font-medium text-waltz-ink dark:text-stone-100">
                HV backscatter over time
              </h4>
              <div className="flex space-x-1.5">
                <button
                  onClick={() =>
                    exportCSV(
                      'backscatter_time_series',
                      ['pass', 'date', 'point1_db', 'point2_db'],
                      passes.map((p, i) => [p.id, p.date, point1Values[i], point2Values[i]])
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

            {/* Line Chart with vertical cursor line at selected pass */}
            <div className="w-full h-36 bg-white dark:bg-stone-900 border border-paper-border dark:border-stone-800 rounded-lg p-3 relative flex flex-col justify-between">
              <svg viewBox="0 0 500 100" className="w-full h-full overflow-visible">
                {/* Horizontal reference baseline */}
                <line x1="0" y1="90" x2="500" y2="90" stroke="#78716c" strokeWidth="1" />

                {/* Vertical cursor line at passIndex */}
                <line
                  x1={(passIndex / 8) * 500}
                  y1="10"
                  x2={(passIndex / 8) * 500}
                  y2="90"
                  stroke="#78716c"
                  strokeWidth="1.2"
                />

                {/* Point 1 (rust) line curve */}
                <polyline
                  fill="none"
                  stroke="#b4432c"
                  strokeWidth="2.5"
                  points={point1Values
                    .map((val, i) => {
                      const x = (i / 8) * 500;
                      // map -25 to -10 to [90, 15]
                      const y = 90 - ((val - -25) / (-10 - -25)) * 75;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />

                {/* Point 2 (teal) line curve */}
                <polyline
                  fill="none"
                  stroke="#155e75"
                  strokeWidth="2"
                  points={point2Values
                    .map((val, i) => {
                      const x = (i / 8) * 500;
                      const y = 90 - ((val - -25) / (-10 - -25)) * 75;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              </svg>

              <div className="flex justify-between text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-200 dark:border-stone-800">
                <span>P1</span>
                <span className="font-bold text-stone-700 dark:text-stone-300">
                  {passes[passIndex].id} · SELECTED
                </span>
                <span>P9</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Difference between points (dB) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-base font-medium text-waltz-ink dark:text-stone-100">
                Difference between points (dB)
              </h4>
              <div className="flex space-x-1.5">
                <button
                  onClick={() =>
                    exportCSV(
                      'point_difference_db',
                      ['pass', 'delta_db'],
                      passes.map((p, i) => [p.id, diffValues[i]])
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

            {/* Bar Chart of difference across P1-P9 with P5 highlighted */}
            <div className="w-full h-32 bg-white dark:bg-stone-900 border border-paper-border dark:border-stone-800 rounded-lg p-3 flex flex-col justify-between">
              <div className="flex-1 flex items-end justify-between gap-1.5 px-2">
                {passes.map((p, idx) => {
                  const val = diffValues[idx];
                  const barHeight = Math.max(6, (val / 6.0) * 80);
                  const isSelected = passIndex === idx;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setPassIndex(idx)}
                      className="flex-1 flex flex-col items-center cursor-pointer group h-full justify-end"
                    >
                      <div
                        style={{ height: `${barHeight}px` }}
                        className={`w-full max-w-[32px] rounded-t-sm transition-all ${
                          isSelected
                            ? 'bg-waltz-rust'
                            : 'bg-stone-900 dark:bg-stone-200 hover:bg-stone-700'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] font-mono text-stone-500 leading-normal">
              If a series mixes processing versions, the app warns here. Line shapes are illustrative until a pack is built.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
