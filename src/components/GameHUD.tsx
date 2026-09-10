import React from 'react';
import { Character, ControlScheme } from '../types';
import { Volume2, VolumeX, Pause, Play, HelpCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface GameHUDProps {
  score: number;
  highScore: number;
  gems: number;
  lives: number;
  level: number;
  character: Character;
  isPlaying: boolean;
  onPrevCharacter: () => void;
  onNextCharacter: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenHelp: () => void;
  controlMode: ControlScheme;
  onToggleControlMode: () => void;
  isMobileTouchLeft: boolean;
  isMobileTouchRight: boolean;
  setIsMobileTouchLeft: (v: boolean) => void;
  setIsMobileTouchRight: (v: boolean) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  gems,
  lives,
  level,
  character,
  isPlaying,
  onPrevCharacter,
  onNextCharacter,
  isPaused,
  onTogglePause,
  onOpenHelp,
  controlMode,
  onToggleControlMode,
  isMobileTouchLeft,
  isMobileTouchRight,
  setIsMobileTouchLeft,
  setIsMobileTouchRight,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.isMuted);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const formattedScore = score.toLocaleString();
  const formattedHighScore = Math.max(score, highScore).toLocaleString();

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2.5 sm:p-4 md:p-6 select-none">
      {/* --- TOP HEADER ROW (All gameplay stats cleanly unified here) --- */}
      <div className="flex items-start justify-between w-full gap-2 z-20">
        {/* Top-Left: Score, High Score & Galleons stacked cleanly */}
        <div className="flex flex-col drop-shadow-md">
          <span className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#facc15] font-outfit leading-none drop-shadow-[0_2px_12px_rgba(250,204,21,0.4)]">
            {formattedScore}
          </span>
          <span className="text-[10px] sm:text-xs md:text-sm font-bold tracking-wider text-slate-300 uppercase opacity-90 mt-1 sm:mt-1.5 whitespace-nowrap">
            ハイスコア: {formattedHighScore}
          </span>
          <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full text-amber-300 text-[10px] sm:text-xs font-black shadow-xs whitespace-nowrap w-fit mt-1">
            <span>🪙</span>
            <span>{gems.toLocaleString()}</span>
            <span className="text-[9px] sm:text-[10px] text-amber-400/80">ガリオン</span>
          </div>
        </div>

        {/* Top-Right: Quick utility icons + Hearts & Level + Character name underneath */}
        <div className="flex flex-col items-end gap-1.5 sm:gap-2">
          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto">
            <button
              id="control-mode-toggle-btn"
              onClick={onToggleControlMode}
              title="操作モード切り替え（追従 / ボタン）"
              className="px-2 py-1 text-[11px] sm:text-xs font-semibold rounded-full bg-slate-900/85 border border-slate-700 text-slate-300 hover:text-white hover:border-amber-400 transition-all backdrop-blur-sm cursor-pointer shadow"
            >
              {controlMode === 'follow' ? '📱 追従' : '⌨️ ボタン'}
            </button>

            <button
              id="audio-mute-toggle-btn"
              onClick={handleToggleSound}
              aria-label={isMuted ? '音声を再生' : '音声をミュート'}
              title={isMuted ? '音声を再生' : '音声をミュート'}
              className="p-1 sm:p-1.5 rounded-full bg-slate-900/85 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all backdrop-blur-sm cursor-pointer shadow"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            <button
              id="pause-resume-btn"
              onClick={onTogglePause}
              aria-label={isPaused ? 'ゲームを再開' : 'ゲームを一時停止'}
              title={isPaused ? 'ゲームを再開' : 'ゲームを一時停止'}
              className="p-1 sm:p-1.5 rounded-full bg-slate-900/85 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all backdrop-blur-sm cursor-pointer shadow"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            <button
              id="open-instructions-btn"
              onClick={onOpenHelp}
              aria-label="あそびかた"
              title="あそびかた"
              className="p-1 sm:p-1.5 rounded-full bg-slate-900/85 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all backdrop-blur-sm cursor-pointer shadow"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Hearts & Level side-by-side in top-right */}
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              {Array.from({ length: character.maxLives }).map((_, idx) => (
                <span
                  key={idx}
                  className={`text-lg sm:text-2xl transition-transform duration-200 ${
                    idx < lives
                      ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] scale-100'
                      : 'text-slate-600 opacity-40 scale-90'
                  }`}
                >
                  ♥
                </span>
              ))}
            </div>
            <span className="text-xs sm:text-base font-black tracking-wider text-white uppercase drop-shadow-md bg-slate-900/70 border border-slate-700/80 px-1.5 py-0.5 rounded-md">
              Lv.{level}
            </span>
          </div>

          {/* Character name directly under hearts */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/80 shadow text-slate-100 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">
              {character.name}
            </span>
            <span className="text-[9px] sm:text-[10px] text-amber-400 font-semibold whitespace-nowrap hidden sm:inline">
              ({character.badge})
            </span>
          </div>
        </div>
      </div>

      {/* --- ON-SCREEN MOBILE / TABLET TOUCH BUTTONS (Floating at mid-lower sides, NOT on the floor) --- */}
      {isPlaying && (
        <div className="absolute inset-x-0 bottom-8 sm:bottom-12 flex justify-between items-center px-3 sm:px-6 pointer-events-none z-10">
          <button
            id="mobile-touch-left-btn"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMobileTouchLeft(true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setIsMobileTouchLeft(false);
            }}
            onPointerLeave={() => setIsMobileTouchLeft(false)}
            onPointerCancel={() => setIsMobileTouchLeft(false)}
            aria-label="左へダッシュ"
            className={`pointer-events-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white text-2xl font-black backdrop-blur-md border transition-all cursor-pointer select-none touch-none shadow-xl ${
              isMobileTouchLeft
                ? 'bg-amber-500/50 border-amber-400 scale-95 shadow-[0_0_20px_#facc15]'
                : 'bg-black/35 border-slate-700/70 hover:bg-black/50 active:bg-amber-500/30'
            }`}
          >
            ◀
          </button>

          <button
            id="mobile-touch-right-btn"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMobileTouchRight(true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setIsMobileTouchRight(false);
            }}
            onPointerLeave={() => setIsMobileTouchRight(false)}
            onPointerCancel={() => setIsMobileTouchRight(false)}
            aria-label="右へダッシュ"
            className={`pointer-events-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white text-2xl font-black backdrop-blur-md border transition-all cursor-pointer select-none touch-none shadow-xl ${
              isMobileTouchRight
                ? 'bg-amber-500/50 border-amber-400 scale-95 shadow-[0_0_20px_#facc15]'
                : 'bg-black/35 border-slate-700/70 hover:bg-black/50 active:bg-amber-500/30'
            }`}
          >
            ▶
          </button>
        </div>
      )}

      {/* Note: The bottom floor area is now intentionally kept 100% EMPTY of any UI overlays!
          This ensures the player wizard character is always completely visible, unobstructed,
          and freely trackable when moving anywhere along the floor! */}
    </div>
  );
};
