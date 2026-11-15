import React, { useState } from 'react';
import { X, RefreshCw, Layers, Calendar, Search } from 'lucide-react';

interface SystemStatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemStatesModal: React.FC<SystemStatesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<number>(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-paper-100 dark:bg-stone-900 border border-paper-border dark:border-paper-darkBorder rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between border-b border-paper-border dark:border-paper-darkBorder pb-4">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-stone-500 uppercase">
              WALTZ · SYSTEM STATES & RESILIENCE
            </div>
            <h2 className="font-serif text-3xl text-waltz-ink dark:text-stone-100 font-medium mt-1">
              When something is loading, missing or broken
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

        {/* Tab selection */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {[
            { id: 1, label: '1 · Loading a pack' },
            { id: 2, label: '2 · Layer failed to load' },
            { id: 3, label: '3 · No data for this date' },
            { id: 4, label: '4 · Nothing matches search' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full border transition-all ${
                activeTab === tab.id
                  ? 'bg-waltz-ink text-white dark:bg-stone-100 dark:text-stone-900 font-bold'
                  : 'border-paper-border dark:border-paper-darkBorder hover:bg-paper-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Preview Container with subtle grid lines */}
        <div className="border border-paper-border dark:border-paper-darkBorder bg-paper-200/50 dark:bg-[#181817] rounded-xl p-8 min-h-[280px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4dfd5_1px,transparent_1px),linear-gradient(to_bottom,#e4dfd5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#2b2b27_1px,transparent_1px),linear-gradient(to_bottom,#2b2b27_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-50 pointer-events-none" />

          {/* STATE 1: LOADING A PACK */}
          {activeTab === 1 && (
            <div className="bg-white dark:bg-stone-900 border border-paper-border dark:border-paper-darkBorder rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl z-10 animate-in fade-in">
              <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-stone-500 uppercase">
                <span>LOADING PACK A</span>
                <span>LAYER 2 OF 4</span>
              </div>
              <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                <div className="bg-waltz-rust h-full w-1/2 animate-pulse" />
              </div>
              <p className="text-xs font-mono text-stone-600 dark:text-stone-400 leading-relaxed pt-1">
                Layers load first, charts after. You can pan the map while you wait.
              </p>
            </div>
          )}

          {/* STATE 2: LAYER FAILED TO LOAD */}
          {activeTab === 2 && (
            <div className="bg-white dark:bg-stone-900 border border-paper-border dark:border-paper-darkBorder rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl z-10 animate-in fade-in">
              <h4 className="font-serif text-xl font-medium text-waltz-ink dark:text-stone-100">
                We couldn’t load this layer.
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Check your connection and try again. The other layers still work.
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => alert('Retrying fetch...')}
                  className="px-5 py-2 rounded-full bg-waltz-ink text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-mono font-medium"
                >
                  Try again
                </button>
                <button
                  onClick={() => alert('Switched to base layer')}
                  className="px-5 py-2 rounded-full border border-paper-border text-xs font-mono hover:bg-paper-200"
                >
                  Switch layer
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: NO DATA FOR THIS DATE */}
          {activeTab === 3 && (
            <div className="bg-white dark:bg-stone-900 border border-paper-border dark:border-paper-darkBorder rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl z-10 animate-in fade-in">
              <h4 className="font-serif text-xl font-medium text-waltz-ink dark:text-stone-100">
                No radar data for this date
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                NISAR had a permanent instrument data gap from 27 July to 10 August 2026.
                Waltz never fills the gap with guesses.
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => alert('Viewing previous pass (2026-07-24)')}
                  className="px-4 py-2 rounded-full border border-paper-border text-xs font-mono hover:bg-paper-200"
                >
                  Previous pass
                </button>
                <button
                  onClick={() => alert('Viewing next pass (2026-08-17)')}
                  className="px-4 py-2 rounded-full border border-paper-border text-xs font-mono hover:bg-paper-200"
                >
                  Next pass
                </button>
              </div>
            </div>
          )}

          {/* STATE 4: NOTHING MATCHES YOUR SEARCH */}
          {activeTab === 4 && (
            <div className="bg-white dark:bg-stone-900 border border-paper-border dark:border-paper-darkBorder rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl z-10 animate-in fade-in text-center">
              <div className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">
                0 PACKS
              </div>
              <h4 className="font-serif text-xl font-medium text-waltz-ink dark:text-stone-100">
                No packs match your search.
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Try a different place, or clear the filters.
              </p>
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => alert('Filters cleared')}
                  className="px-5 py-2 rounded-full bg-waltz-ink text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-mono font-medium"
                >
                  Clear filters
                </button>
                <button
                  onClick={() => alert('Opened contribution guide in docs/pack-authoring.md')}
                  className="px-5 py-2 rounded-full border border-paper-border text-xs font-mono hover:bg-paper-200"
                >
                  Add your own place
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
