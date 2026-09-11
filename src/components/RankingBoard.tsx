import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Coins, RotateCw, Crown } from 'lucide-react';
import { fetchRankings } from '../services/rankingService';
import { RankingEntry, RankingTab } from '../types';

interface RankingBoardProps {
  initialTab?: RankingTab;
  compact?: boolean;
  highlightPlayerName?: string;
  refreshTrigger?: number;
}

export const RankingBoard: React.FC<RankingBoardProps> = ({
  initialTab = 'score',
  compact = false,
  highlightPlayerName,
  refreshTrigger = 0,
}) => {
  const [tab, setTab] = useState<RankingTab>(initialTab);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async (currentTab: RankingTab) => {
    setLoading(true);
    try {
      const data = await fetchRankings(currentTab, compact ? 5 : 100);
      setRankings(data);
    } catch (e) {
      console.error('Failed to load rankings:', e);
    } finally {
      setLoading(false);
    }
  }, [compact]);

  useEffect(() => {
    loadData(tab);
  }, [tab, loadData, refreshTrigger]);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-black text-xs border border-amber-500/50">
            🥇
          </span>
        );
      case 1:
        return (
          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-300/20 text-slate-300 font-black text-xs border border-slate-300/40">
            🥈
          </span>
        );
      case 2:
        return (
          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-amber-700/20 text-amber-600 font-black text-xs border border-amber-700/40">
            🥉
          </span>
        );
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 font-bold text-[10px]">
            {index + 1}
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 sm:p-3 backdrop-blur-md">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-black tracking-wide text-white uppercase">
            栄光の殿堂
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
          <button
            id={`ranking-tab-score-${compact ? 'c' : 'f'}`}
            onClick={() => setTab('score')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              tab === 'score'
                ? 'bg-amber-500 text-black shadow-xs font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-2.5 h-2.5" />
            <span>スコア</span>
          </button>
          <button
            id={`ranking-tab-galleons-${compact ? 'c' : 'f'}`}
            onClick={() => setTab('galleons')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              tab === 'galleons'
                ? 'bg-amber-400 text-black shadow-xs font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-2.5 h-2.5" />
            <span>ガリオン</span>
          </button>
          <button
            id={`ranking-refresh-btn-${compact ? 'c' : 'f'}`}
            onClick={() => loadData(tab)}
            title="更新"
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCw className={`w-2.5 h-2.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Rankings List */}
      <div className="flex flex-col gap-1 min-h-[110px] justify-start overflow-y-auto max-h-[160px] pr-0.5">
        {loading ? (
          <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-xs">
            <RotateCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>魔法記録を照会中...</span>
          </div>
        ) : rankings.length === 0 ? (
          <div className="py-5 text-center text-slate-500 text-xs">
            まだ記録がありません。一番乗りに挑戦しよう！
          </div>
        ) : (
          rankings.map((entry, idx) => {
            const isHighlighted = highlightPlayerName && entry.playerName === highlightPlayerName;
            return (
              <div
                key={entry.id || idx}
                className={`flex items-center justify-between py-1 px-2 rounded-lg text-xs transition-colors ${
                  isHighlighted
                    ? 'bg-amber-500/20 border border-amber-500/50'
                    : idx === 0
                    ? 'bg-amber-500/10 border border-amber-500/20'
                    : 'bg-slate-900/40 border border-slate-800/40 hover:bg-slate-900/60'
                }`}
              >
                {/* Rank & Wizard Info */}
                <div className="flex items-center gap-1.5 min-w-0">
                  {getRankBadge(idx)}
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-100 truncate text-[11px] max-w-[90px] sm:max-w-[130px]">
                      {entry.playerName}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {entry.characterName} (Lv.{entry.level})
                    </span>
                  </div>
                </div>

                {/* Value (Score or Galleons) */}
                <div className="text-right shrink-0">
                  {tab === 'score' ? (
                    <span className="font-black text-[#facc15] font-outfit text-xs sm:text-sm">
                      {entry.score.toLocaleString()}
                    </span>
                  ) : (
                    <span className="font-black text-amber-400 font-outfit text-xs sm:text-sm flex items-center justify-end gap-0.5">
                      <span>🪙</span>
                      <span>{entry.galleons.toLocaleString()}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
