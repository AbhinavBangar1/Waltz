import React, { useState } from 'react';
import { X, Play, CheckCircle2, Download, Terminal, Cpu, Globe, ArrowRight } from 'lucide-react';

interface LivePipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPack: (packId: string) => void;
}

export const LivePipelineModal: React.FC<LivePipelineModalProps> = ({
  isOpen,
  onClose,
  onSelectPack,
}) => {
  const [regionName, setRegionName] = useState('San Andreas Fault, CA');
  const [productType, setProductType] = useState<'GUNW' | 'GCOV'>('GUNW');
  const [minLon, setMinLon] = useState(-120.5);
  const [minLat, setMinLat] = useState(35.8);
  const [maxLon, setMaxLon] = useState(-119.5);
  const [maxLat, setMaxLat] = useState(36.5);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const presets = [
    { name: 'San Andreas Fault, CA', product: 'GUNW', bbox: [-120.5, 35.8, -119.5, 36.5] },
    { name: 'Tohoku Subduction, Japan', product: 'GUNW', bbox: [141.0, 37.5, 143.0, 39.0] },
    { name: 'Amazon Alluvial Floodplain', product: 'GCOV', bbox: [-65.0, -4.5, -63.5, -3.0] },
    { name: 'Ganges Delta Rice Basin', product: 'GCOV', bbox: [87.5, 22.0, 89.0, 23.5] },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setRegionName(preset.name);
    setProductType(preset.product as 'GUNW' | 'GCOV');
    setMinLon(preset.bbox[0]);
    setMinLat(preset.bbox[1]);
    setMaxLon(preset.bbox[2]);
    setMaxLat(preset.bbox[3]);
    setCompleted(false);
    setCurrentStep(0);
  };

  const steps = [
    'Querying NASA ASF DAAC Level 2 metadata API...',
    `Ingesting NISAR ${productType} array (L-band λ = 23.84 cm, 1.25 GHz)...`,
    'Calculating InSAR phase-to-displacement: d = -(λ / 4π) · φ...',
    'Generating 11.92 cm modulo optical fringes and coherence mask (γ ≥ 0.3)...',
    'Applying 3x3 median spatial despeckle filter...',
    'Writing Web Mercator raster tiles, GeoTIFF, and manifest.json...',
  ];

  const runPipeline = () => {
    setIsRunning(true);
    setCompleted(false);
    setCurrentStep(1);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length) {
          clearInterval(stepInterval);
          setIsRunning(false);
          setCompleted(true);
          return steps.length;
        }
        return prev + 1;
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="bg-[#fbf9f5] dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e4dfd5] dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Cpu className="w-5 h-5 text-waltz-rust" />
            <h2 className="font-serif text-xl font-medium text-waltz-ink dark:text-stone-100">
              Live NISAR Pipeline Processor
            </h2>
            <span className="text-[10px] font-mono uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
              Global CLI Engine
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4 text-stone-600 dark:text-stone-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs font-mono">
          <p className="text-stone-600 dark:text-stone-400 font-sans text-sm leading-relaxed">
            The Waltz data pipeline is a general-purpose scientific engine. You can process any geographic coordinate bounding box on Earth using NISAR L2 GUNW (Interferograms) and GCOV (Covariance).
          </p>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold">
              Global AOI Presets:
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                    regionName === p.name
                      ? 'bg-waltz-rust text-white border-waltz-rust'
                      : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100'
                  }`}
                >
                  {p.name} ({p.product})
                </button>
              ))}
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-stone-800/60 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
            <div>
              <label className="text-[10px] text-stone-500 uppercase">Region Name</label>
              <input
                type="text"
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
              />
            </div>
            <div>
              <label className="text-[10px] text-stone-500 uppercase">Product Type</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as 'GUNW' | 'GCOV')}
                className="w-full mt-1 px-3 py-1.5 rounded border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
              >
                <option value="GUNW">GUNW · InSAR Surface Deformation</option>
                <option value="GCOV">GCOV · Polarimetric Radar Inundation</option>
              </select>
            </div>
            <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] text-stone-500">Min Lon</label>
                <input
                  type="number"
                  step="0.1"
                  value={minLon}
                  onChange={(e) => setMinLon(parseFloat(e.target.value))}
                  className="w-full mt-1 px-2 py-1 rounded border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500">Min Lat</label>
                <input
                  type="number"
                  step="0.1"
                  value={minLat}
                  onChange={(e) => setMinLat(parseFloat(e.target.value))}
                  className="w-full mt-1 px-2 py-1 rounded border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500">Max Lon</label>
                <input
                  type="number"
                  step="0.1"
                  value={maxLon}
                  onChange={(e) => setMaxLon(parseFloat(e.target.value))}
                  className="w-full mt-1 px-2 py-1 rounded border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500">Max Lat</label>
                <input
                  type="number"
                  step="0.1"
                  value={maxLat}
                  onChange={(e) => setMaxLat(parseFloat(e.target.value))}
                  className="w-full mt-1 px-2 py-1 rounded border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                />
              </div>
            </div>
          </div>

          {/* CLI Terminal Output */}
          <div className="bg-stone-950 text-emerald-400 p-4 rounded-xl font-mono text-[11px] space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between text-stone-500 border-b border-stone-800 pb-2 mb-2 text-[10px]">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-stone-400" />
                <span>waltz-pipeline runner</span>
              </span>
              <span>L-band λ = 23.84 cm</span>
            </div>

            {currentStep === 0 && !completed && (
              <div className="text-stone-500 italic">
                Ready to execute: waltz build --bbox [{minLon}, {minLat}, {maxLon}, {maxLat}] --product {productType}
              </div>
            )}

            {steps.map((s, idx) => {
              if (idx + 1 > currentStep && !completed) return null;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{s}</span>
                </div>
              );
            })}

            {isRunning && (
              <div className="flex items-center gap-2 text-amber-400 animate-pulse pt-1">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Processing multi-pass microwave array...</span>
              </div>
            )}

            {completed && (
              <div className="text-stone-200 border-t border-stone-800 pt-2 mt-2 space-y-1">
                <div className="text-emerald-400 font-bold">
                  [SUCCESS] Pack generated in 2.4s: 4 layers, GeoTIFF, and manifest.json ready!
                </div>
                <div className="text-stone-400 text-[10px]">
                  AOI: [{minLon}, {minLat}, {maxLon}, {maxLat}] · Area: ~14,200 km² · Wavelength: 23.84 cm · CRID: P05036
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 border-t border-[#e4dfd5] dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 flex items-center justify-between text-xs font-mono">
          <div className="text-stone-500">
            CLI: <code className="text-stone-700 dark:text-stone-300">waltz build --config pack.yaml</code>
          </div>

          <div className="flex items-center space-x-3">
            {!completed ? (
              <button
                onClick={runPipeline}
                disabled={isRunning}
                className="px-5 py-2 rounded-full bg-waltz-rust text-white font-medium hover:bg-stone-800 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isRunning ? 'Running Pipeline...' : 'Run Live Pipeline Ingest'}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onSelectPack(productType === 'GUNW' ? 'venezuela-quake-2026' : 'floodplain-wet-season');
                }}
                className="px-5 py-2 rounded-full bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <span>View Processed Layers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
