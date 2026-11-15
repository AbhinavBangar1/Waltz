import React, { useState, useEffect } from 'react';
import { PackManifest } from './types';
import { Header } from './components/Header';
import { LandingView } from './components/LandingView';
import { DeformationView } from './components/DeformationView';
import { InundationView } from './components/InundationView';
import { TimeSeriesView } from './components/TimeSeriesView';
import { MethodsModal } from './components/MethodsModal';
import { LivePipelineModal } from './components/LivePipelineModal';

export const App: React.FC = () => {
  const [packs, setPacks] = useState<PackManifest[]>([]);
  const [activePackId, setActivePackId] = useState<string | null>(null);
  const [isMethodsOpen, setIsMethodsOpen] = useState<boolean>(false);
  const [isLivePipelineOpen, setIsLivePipelineOpen] = useState<boolean>(false);
  const [landingMode, setLandingMode] = useState<'editorial' | 'map'>('editorial');
  const [loading, setLoading] = useState<boolean>(true);

  // Load all 3 pack manifests from public/packs/
  useEffect(() => {
    const packIds = ['venezuela-quake-2026', 'floodplain-wet-season', 'crop-cycle-radar'];
    Promise.all(
      packIds.map((id) =>
        fetch(`/packs/${id}/manifest.json`)
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      )
    )
      .then((results) => {
        const validPacks = results.filter((p): p is PackManifest => p !== null);
        setPacks(validPacks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Sync state with URL hash (FR-9)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const params = new URLSearchParams(hash);
      const packParam = params.get('pack');
      if (packParam) {
        setActivePackId(packParam);
      } else {
        setActivePackId(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectPack = (packId: string) => {
    setActivePackId(packId);
    window.location.hash = `pack=${packId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setActivePackId(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentPack = packs.find((p) => p.id === activePackId) || null;

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
      <Header
        currentPack={currentPack}
        onNavigateHome={handleNavigateHome}
        onOpenMethods={() => setIsMethodsOpen(true)}
        onOpenLivePipeline={() => setIsLivePipelineOpen(true)}
        onSelectPack={handleSelectPack}
        viewMode={landingMode}
        onToggleViewMode={() => setLandingMode((prev) => (prev === 'editorial' ? 'map' : 'editorial'))}
      />

      <main className="flex-grow">
        {loading ? (
          <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-2 border-waltz-rust border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-stone-500 uppercase tracking-widest">
              LOADING NISAR PACKS...
            </p>
          </div>
        ) : !activePackId ? (
          <LandingView
            packs={packs}
            onSelectPack={handleSelectPack}
            onOpenMethods={() => setIsMethodsOpen(true)}
            initialMode={landingMode}
          />
        ) : activePackId === 'venezuela-quake-2026' && currentPack ? (
          <DeformationView
            pack={currentPack}
            onOpenMethods={() => setIsMethodsOpen(true)}
            onSelectPack={handleSelectPack}
          />
        ) : activePackId === 'floodplain-wet-season' && currentPack ? (
          <InundationView
            pack={currentPack}
            onOpenMethods={() => setIsMethodsOpen(true)}
            onSelectPack={handleSelectPack}
          />
        ) : activePackId === 'crop-cycle-radar' && currentPack ? (
          <TimeSeriesView
            pack={currentPack}
            onOpenMethods={() => setIsMethodsOpen(true)}
            onSelectPack={handleSelectPack}
          />
        ) : (
          <div className="p-12 text-center space-y-4">
            <h3 className="font-serif text-2xl">Pack Not Found</h3>
            <button
              onClick={handleNavigateHome}
              className="px-6 py-2 rounded-full bg-waltz-ink text-white font-mono text-xs"
            >
              Return Home
            </button>
          </div>
        )}
      </main>

      {/* Methods & Provenance Modal (Screen 5) */}
      <MethodsModal
        isOpen={isMethodsOpen}
        onClose={() => setIsMethodsOpen(false)}
        pack={currentPack}
      />

      {/* Live NISAR Pipeline Modal */}
      <LivePipelineModal
        isOpen={isLivePipelineOpen}
        onClose={() => setIsLivePipelineOpen(false)}
        onSelectPack={handleSelectPack}
      />
    </div>
  );
};
