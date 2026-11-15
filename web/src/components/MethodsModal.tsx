import React from 'react';
import { X, AlertTriangle, Download, FileText, CheckCircle2 } from 'lucide-react';
import { PackManifest } from '../types';

interface MethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pack?: PackManifest | null;
}

export const MethodsModal: React.FC<MethodsModalProps> = ({ isOpen, onClose, pack }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-paper-100 dark:bg-stone-900 border border-paper-border dark:border-paper-darkBorder rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-paper-border dark:border-paper-darkBorder pb-4">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-stone-500 uppercase">
              METHODS AND PROVENANCE
            </div>
            <h2 className="font-serif text-3xl text-waltz-ink dark:text-stone-100 font-medium mt-1">
              Where every pixel comes from
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full border border-paper-border dark:border-paper-darkBorder hover:bg-paper-200 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Warning Banner (Screen 5) */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              WARNING
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
              This view mixes processing versions (P05023 and P05036). Differences between dates
              may partly reflect software changes, not the ground.
            </p>
          </div>
        </div>

        {/* GRANULES */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-stone-500 uppercase tracking-wider">
            GRANULES
          </div>
          <div className="border border-paper-border dark:border-paper-darkBorder rounded-xl divide-y divide-paper-border dark:divide-paper-darkBorder text-xs font-mono overflow-hidden">
            <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-paper-50 dark:bg-stone-800/40">
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                GCOV · NISAR_L2_PR_GCOV_002_010_D
              </span>
              <span className="text-[11px] text-stone-500">
                PROVISIONAL · P05023 · 2026-06-18
              </span>
            </div>
            <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                GCOV · NISAR_L2_PR_GCOV_002_010_D
              </span>
              <span className="text-[11px] text-stone-500">
                PROVISIONAL · P05023 · 2026-08-17
              </span>
            </div>
            <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-paper-50 dark:bg-stone-800/40">
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                GCOV · NISAR_L2_VA_GCOV_004_012_A
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                VALIDATED · P05036 · 2026-10-25
              </span>
            </div>
          </div>
        </div>

        {/* PROCESSING STEPS */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-stone-500 uppercase tracking-wider">
            PROCESSING STEPS
          </div>
          <ol className="space-y-2 text-xs text-stone-700 dark:text-stone-300 font-mono list-decimal pl-5">
            <li>Read backscatter power, mask invalid pixels, convert to dB.</li>
            <li>Light speckle filter, for display only.</li>
            <li>Build a reference from dry-period dates.</li>
            <li>Subtract the reference from each pass.</li>
            <li>Apply thresholds, reproject, render.</li>
          </ol>
        </div>

        {/* PARAMETERS (CONFIGURABLE DEFAULTS) */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-stone-500 uppercase tracking-wider">
            PARAMETERS (CONFIGURABLE DEFAULTS)
          </div>
          <div className="border border-paper-border dark:border-paper-darkBorder rounded-xl p-4 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-stone-500">Open water, HV</span>
              <span className="font-semibold">below -18 dB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Change threshold</span>
              <span className="font-semibold">below -3 dB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Speckle filter</span>
              <span className="font-semibold">3×3 median</span>
            </div>
          </div>
        </div>

        {/* DOWNLOADS */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-stone-500 uppercase tracking-wider">
            DOWNLOADS
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <a
              href="/packs/venezuela-quake-2026/displacement_gunw.tif"
              download
              className="px-4 py-2 rounded-full border border-paper-border dark:border-paper-darkBorder hover:bg-paper-200 dark:hover:bg-stone-800 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Classified GeoTIFF
            </a>
            <a
              href="/packs/floodplain-wet-season/flood_extent.tif"
              download
              className="px-4 py-2 rounded-full border border-paper-border dark:border-paper-darkBorder hover:bg-paper-200 dark:hover:bg-stone-800 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Delta dB GeoTIFF
            </a>
            <a
              href="/packs/venezuela-quake-2026/manifest.json"
              download
              className="px-4 py-2 rounded-full border border-paper-border dark:border-paper-darkBorder hover:bg-paper-200 dark:hover:bg-stone-800 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              manifest.json
            </a>
          </div>
        </div>

        {/* CITE THIS DATA */}
        <div className="space-y-2 pt-2 border-t border-paper-border dark:border-paper-darkBorder">
          <div className="text-xs font-mono text-stone-500 uppercase tracking-wider">
            CITE THIS DATA
          </div>
          <div className="bg-paper-50 dark:bg-stone-800/60 p-4 rounded-xl text-xs font-mono text-stone-600 dark:text-stone-300 leading-relaxed border border-paper-border dark:border-paper-darkBorder">
            NISAR Science Team (2026). NASA-ISRO Synthetic Aperture Radar (NISAR) Level 2
            Geocoded Polarimetric Covariance (GCOV) and Unwrapped Interferogram (GUNW) Products.
            Distributed by the Alaska Satellite Facility (ASF) DAAC.
          </div>
        </div>
      </div>
    </div>
  );
};
