import React, { useEffect, useState } from 'react';
import { RotateCcw, Trophy, Coins, ShieldAlert, Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Character } from '../types';
import { RankingBoard } from './RankingBoard';
import { submitRanking } from '../services/rankingService';

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewHigh: boolean;
  gems: number;
  level: number;
  character: Character;
  onRestart: () => void;
  onOpenCharacterSelect: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHigh,
  gems,
  level,
  character,
  onRestart,
  onOpenCharacterSelect,
}) => {
  const [viewMode, setViewMode] = useState<'summary' | 'ranking'>('summary');
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('curse_dodge_player_name') || 'ホグワーツ生';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger restart if user is typing in name input
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.code === 'Space' || e.code === 'KeyR') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  const handleSubmitScore = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting || isSubmitted) return;

    const trimmed = playerName.trim() || '名無しの魔法使い';
    localStorage.setItem('curse_dodge_player_name', trimmed);

    setIsSubmitting(true);
    const result = await submitRanking(trimmed, character.id, character.name, score, gems, level);
    setIsSubmitting(false);

    if (result) {
      setIsSubmitted(true);
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <div
      onClick={(e) => {
        // If background is clicked/tapped, restart
        if (e.target === e.currentTarget && viewMode === 'summary') {
          onRestart();
        }
      }}
      className="absolute inset-0 z-20 flex items-center justify-center p-2 sm:p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 select-none"
    >
      <div className="w-[95%] max-w-md bg-gradient-to-b from-[#131722] to-[#0c0f17] border-2 border-red-900/60 rounded-2xl p-3 shadow-2xl shadow-red-950/50 text-center relative flex flex-col justify-between overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Title & View Switch */}
        <div className="shrink-0 mb-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
              <h2 className="text-sm sm:text-base font-black tracking-wider text-red-500 font-cinzel drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]">
                アバダ・ケダブラ！！
              </h2>
            </div>

            {/* Switch to Ranking / Summary */}
            <button
              id="gameover-toggle-ranking-btn"
              onClick={() => setViewMode(viewMode === 'summary' ? 'ranking' : 'summary')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-bold transition-all cursor-pointer"
            >
              {viewMode === 'summary' ? (
                <>
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>ランキングを見る</span>
                </>
              ) : (
                <>
                  <ArrowLeft className="w-3 h-3" />
                  <span>結果に戻る</span>
                </>
              )}
            </button>
          </div>
          {viewMode === 'summary' && (
            <p className="text-[10px] text-slate-400 mt-0.5 text-left">
              闇の帝王の呪いを受けてしまった...
            </p>
          )}
        </div>

        {viewMode === 'summary' ? (
          <>
            {/* 2-Column Compact Scores Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 sm:p-2.5 mb-1.5 shrink-0">
              <div className="grid grid-cols-2 gap-2 items-center">
                {/* Left: Final Score & Badge */}
                <div className="flex flex-col items-center justify-center border-r border-slate-800/80 pr-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    最終スコア
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-[#facc15] font-outfit leading-tight my-0.5">
                    {score.toLocaleString()}
                  </span>
                  {isNewHigh ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-full text-[10px] font-bold text-amber-300 shadow-xs">
                      <Trophy className="w-2.5 h-2.5 text-amber-400" />
                      <span>🎉 新記録達成！</span>
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-500">ナイスファイト！</span>
                  )}
                </div>

                {/* Right: Highest Score & Galleons */}
                <div className="flex flex-col justify-center space-y-1 pl-1 text-[11px] sm:text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1 text-[10px] sm:text-[11px]">
                      <Trophy className="w-3 h-3 text-slate-400" /> 最高記録
                    </span>
                    <span className="font-bold text-slate-200">
                      {Math.max(score, highScore).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-800/60 pt-0.5">
                    <span className="text-slate-400 flex items-center gap-1 text-[10px] sm:text-[11px]">
                      <Coins className="w-3 h-3 text-amber-400" /> 獲得ガリオン
                    </span>
                    <span className="font-bold text-amber-400">
                      🪙 {gems.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Submission Form to Firebase Leaderboard */}
            <form
              onSubmit={handleSubmitScore}
              className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-2 mb-2 flex items-center gap-2 shrink-0"
            >
              <div className="flex-1 text-left">
                <label className="block text-[9px] text-amber-400/90 font-bold mb-0.5">
                  魔法省ランキングに登録
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={18}
                  disabled={isSubmitted || isSubmitting}
                  placeholder="魔法使いの名前"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                id="submit-ranking-btn"
                disabled={isSubmitted || isSubmitting}
                className={`self-end py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isSubmitted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                    : 'bg-amber-500 hover:bg-amber-400 text-black font-black shadow-md shadow-amber-950/40 active:scale-95'
                }`}
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>登録済み</span>
                  </>
                ) : isSubmitting ? (
                  <span>送信中...</span>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>登録</span>
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Inline Firebase Ranking Board */
          <div className="mb-2 shrink-0 max-h-56 overflow-y-auto">
            <RankingBoard
              compact={true}
              highlightPlayerName={isSubmitted ? playerName : undefined}
              refreshTrigger={refreshKey}
            />
          </div>
        )}

        {/* Action Buttons: fully visible and never pushed out */}
        <div className="flex gap-2 shrink-0">
          <button
            id="gameover-retry-btn"
            onClick={onRestart}
            className="flex-1 h-9 sm:h-10 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 active:scale-[0.98] text-black font-black tracking-wide text-xs sm:text-sm shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>もう一度挑戦</span>
          </button>

          <button
            id="gameover-change-wizard-btn"
            onClick={onOpenCharacterSelect}
            className="h-9 sm:h-10 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            魔法使いを変更 ({character.name})
          </button>
        </div>
      </div>
    </div>
  );
};
