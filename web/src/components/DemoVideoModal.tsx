import React, { useState, useRef } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { VideoComposition } from '../video/VideoComposition';
import { X, Film, CheckCircle2, MousePointer, Crosshair, HelpCircle } from 'lucide-react';

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoVideoModal: React.FC<DemoVideoModalProps> = ({ isOpen, onClose }) => {
  const [showCursor, setShowCursor] = useState<boolean>(true);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);
  const playerRef = useRef<PlayerRef | null>(null);

  if (!isOpen) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = 1920 / rect.width;
    const scaleY = 1080 / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    setHoverCoords({ x, y });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-paper-100 dark:bg-stone-900 border border-paper-border dark:border-paper-darkBorder rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-4">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-paper-border dark:border-paper-darkBorder pb-3">
          <div className="flex items-center space-x-3">
            <Film className="w-5 h-5 text-waltz-rust" />
            <div>
              <div className="text-[10px] font-mono tracking-widest text-stone-500 uppercase">
                REMOTION · 30-SECOND COMPETITION DEMO
              </div>
              <h2 className="font-serif text-2xl font-medium text-waltz-ink dark:text-stone-100">
                Waltz: 30-Second Video Pitch Reel
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Toggle Synthetic Cursor */}
            <button
              onClick={() => setShowCursor(!showCursor)}
              className={`px-3 py-1 rounded-full border text-xs font-mono transition-colors flex items-center gap-1.5 ${
                showCursor
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent font-medium'
                  : 'border-paper-border dark:border-paper-darkBorder text-stone-500 hover:bg-paper-200'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>Cursor: {showCursor ? 'Visible' : 'Hidden'}</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1 rounded-full border border-paper-border dark:border-paper-darkBorder hover:bg-paper-200 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>
        </div>

        {/* Remotion Player Container with coordinate tracking */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverCoords(null)}
          className="aspect-video w-full rounded-xl overflow-hidden border border-stone-300 dark:border-stone-800 shadow-xl bg-black relative group"
        >
          <Player
            ref={playerRef}
            component={VideoComposition}
            inputProps={{ showCursor }}
            durationInFrames={900}
            compositionWidth={1920}
            compositionHeight={1080}
            fps={30}
            style={{
              width: '100%',
              height: '100%',
            }}
            controls
            autoPlay
            loop
          />

          {/* Real-time Hover Pixel Coordinate Helper (for easy user editing!) */}
          {hoverCoords && (
            <div className="absolute top-3 left-3 bg-black/80 text-emerald-400 font-mono text-[11px] px-2.5 py-1 rounded border border-emerald-500/40 pointer-events-none z-30 flex items-center gap-1.5">
              <Crosshair className="w-3 h-3 text-emerald-400" />
              <span>X: {hoverCoords.x}px | Y: {hoverCoords.y}px</span>
            </div>
          )}
        </div>

        {/* Editing instructions helper box */}
        <div className="bg-paper-50 dark:bg-stone-800/50 border border-paper-border dark:border-paper-darkBorder rounded-xl p-3.5 text-xs font-mono space-y-1.5 text-stone-700 dark:text-stone-300">
          <div className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-waltz-rust" />
            <span>How to customize the cursor yourself:</span>
          </div>
          <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
            Open <code className="bg-stone-200 dark:bg-stone-700 px-1 py-0.5 rounded text-stone-900 dark:text-stone-100">web/src/video/VideoComposition.tsx</code>. At lines 18–60 you will find the <code className="text-waltz-rust">CURSOR_KEYFRAMES</code> array. Simply adjust the <code className="text-waltz-rust">x</code>, <code className="text-waltz-rust">y</code> coordinates (using the live coordinate reader above) or frame numbers (30 frames = 1 second). You can also toggle <strong>Cursor: Hidden</strong> and record your own real mouse using Loom, OBS, or QuickTime!
          </p>
        </div>

        {/* Submission guidelines badge checklist */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-stone-600 dark:text-stone-400 border-t border-paper-border dark:border-paper-darkBorder pt-3">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Exactly 30.00 Seconds (900 Frames)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> English Subtitles Included
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> No Emojis · Clean Editorial Styling
            </span>
          </div>
          <span className="text-[11px] text-stone-500">
            Render with Remotion or screen-record directly.
          </span>
        </div>
      </div>
    </div>
  );
};

