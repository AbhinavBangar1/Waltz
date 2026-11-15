import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { PackManifest } from '../types';
import { Moon, Sun, Share2, Check, Zap } from 'lucide-react';

interface HeaderProps {
  currentPack: PackManifest | null;
  onNavigateHome: () => void;
  onOpenMethods: () => void;
  onOpenLivePipeline?: () => void;
  onSelectPack?: (packId: string) => void;
  viewMode?: 'editorial' | 'map';
  onToggleViewMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPack,
  onNavigateHome,
  onOpenMethods,
  onOpenLivePipeline,
  onSelectPack,
  viewMode,
  onToggleViewMode,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMixedVersions = currentPack?.id === 'crop-cycle-radar';

  return (
    <header className="border-b border-paper-border dark:border-paper-darkBorder bg-paper-100 dark:bg-paper-dark px-4 sm:px-6 py-3 flex items-center justify-between transition-colors sticky top-0 z-40">
      {/* Left side: Logo & Breadcrumb */}
      <div className="flex items-center space-x-3 sm:space-x-5">
        <button
          onClick={onNavigateHome}
          className="font-serif text-2xl tracking-tight italic hover:opacity-80 transition-opacity flex items-center gap-1.5"
        >
          <span>Waltz</span>
        </button>

        {currentPack ? (
          <div className="flex items-center text-xs sm:text-sm font-mono tracking-wider space-x-2 text-stone-500 dark:text-stone-400">
            <span>/</span>
            <button
              onClick={onNavigateHome}
              className="hover:text-waltz-ink dark:hover:text-stone-100 uppercase transition-colors"
            >
              ← ALL PACKS
            </button>
            <span>/</span>
            <span className="uppercase text-waltz-ink dark:text-stone-100 font-medium">
              {currentPack.type} · {currentPack.title.slice(0, 24)}...
            </span>
          </div>
        ) : (
          <nav className="hidden md:flex items-center space-x-6 text-xs font-mono tracking-widest text-stone-600 dark:text-stone-400 uppercase">
            <button
              onClick={() => onToggleViewMode && onToggleViewMode()}
              className="hover:text-waltz-ink dark:hover:text-stone-100 font-semibold"
            >
              {viewMode === 'map' ? 'Editorial View' : 'Explore Packs'}
            </button>
            <a
              href="#how-radar-sees"
              className="hover:text-waltz-ink dark:hover:text-stone-100"
            >
              How Radar Sees
            </a>
            <button
              onClick={onOpenMethods}
              className="hover:text-waltz-ink dark:hover:text-stone-100"
            >
              Methods
            </button>
            <a
              href="https://github.com/AbhinavBangar1/Waltz"
              target="_blank"
              rel="noreferrer"
              className="hover:text-waltz-ink dark:hover:text-stone-100"
            >
              GitHub
            </a>
          </nav>
        )}
      </div>

      {/* Right side: Provenance badge & actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {onOpenLivePipeline && (
          <button
            onClick={onOpenLivePipeline}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded-full bg-waltz-rust text-white hover:bg-stone-800 transition-colors shadow-sm"
            title="Process any custom coordinates on Earth"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Live Pipeline</span>
          </button>
        )}

        {/* Quick Sample Pack switcher for Judges */}
        {onSelectPack && (
          <div className="hidden lg:flex items-center space-x-1 text-[11px] font-mono border-r border-paper-border dark:border-paper-darkBorder pr-3 text-stone-500">
            <span className="text-[10px] uppercase text-stone-400">Samples:</span>
            <button
              onClick={() => onSelectPack('venezuela-quake-2026')}
              className={`px-2 py-0.5 rounded transition-colors ${
                currentPack?.id === 'venezuela-quake-2026'
                  ? 'bg-stone-200 dark:bg-stone-700 font-bold text-stone-900 dark:text-stone-100'
                  : 'hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Quake (A)
            </button>
            <button
              onClick={() => onSelectPack('floodplain-wet-season')}
              className={`px-2 py-0.5 rounded transition-colors ${
                currentPack?.id === 'floodplain-wet-season'
                  ? 'bg-stone-200 dark:bg-stone-700 font-bold text-stone-900 dark:text-stone-100'
                  : 'hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Flood (B)
            </button>
            <button
              onClick={() => onSelectPack('crop-cycle-radar')}
              className={`px-2 py-0.5 rounded transition-colors ${
                currentPack?.id === 'crop-cycle-radar'
                  ? 'bg-stone-200 dark:bg-stone-700 font-bold text-stone-900 dark:text-stone-100'
                  : 'hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              Crops (C)
            </button>
          </div>
        )}

        {currentPack && (
          <button
            onClick={onOpenMethods}
            className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors ${
              isMixedVersions
                ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
                : 'border-paper-border dark:border-paper-darkBorder text-stone-600 dark:text-stone-300 hover:bg-paper-200 dark:hover:bg-paper-darkCard'
            }`}
          >
            {isMixedVersions ? 'MIXED VERSIONS · SEE METHODS' : 'PROVISIONAL · CRID P05023'}
          </button>
        )}

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-1.5 rounded-full border border-paper-border dark:border-paper-darkBorder hover:bg-paper-200 dark:hover:bg-paper-darkCard transition-colors flex items-center gap-1 text-xs font-mono px-2.5"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          )}
        </button>

        {currentPack && (
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-full border border-paper-border dark:border-paper-darkBorder hover:bg-paper-200 dark:hover:bg-paper-darkCard transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share view</span>
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
