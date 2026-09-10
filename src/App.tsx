import React, { useState, useEffect, useCallback } from 'react';
import { CHARACTERS } from './data/characters';
import { Character, ControlScheme, GameStatus } from './types';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { InstructionsModal } from './components/InstructionsModal';
import { RankingBoard } from './components/RankingBoard';
import { sound } from './utils/audio';
import { Play, Sparkles, Wand2, Shield, Gem, Volume2, VolumeX, HelpCircle, Trophy, X, Crown } from 'lucide-react';

const HIGH_SCORE_KEY = 'curse_dodge_highscore';
const GEMS_KEY = 'curse_dodge_gems';

export default function App() {
  const [characterIndex, setCharacterIndex] = useState<number>(0);
  const character: Character = CHARACTERS[characterIndex];

  const [gameStatus, setGameStatus] = useState<GameStatus>('menu');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [gems, setGems] = useState<number>(120); // initial start gems matching screenshot
  const [lives, setLives] = useState<number>(character.maxLives);
  const [level, setLevel] = useState<number>(1);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);

  const [controlMode, setControlMode] = useState<ControlScheme>('follow');
  const [isMobileTouchLeft, setIsMobileTouchLeft] = useState<boolean>(false);
  const [isMobileTouchRight, setIsMobileTouchRight] = useState<boolean>(false);

  const [showCharacterSelect, setShowCharacterSelect] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showMenuRanking, setShowMenuRanking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Load saved High Score and Gems
  useEffect(() => {
    try {
      const savedHigh = localStorage.getItem(HIGH_SCORE_KEY);
      if (savedHigh) {
        setHighScore(parseInt(savedHigh, 10) || 0);
      } else {
        setHighScore(31100); // Default matching user's photo high score!
      }

      const savedGems = localStorage.getItem(GEMS_KEY);
      if (savedGems) {
        setGems(parseInt(savedGems, 10) || 120);
      }
    } catch {
      // localStorage fallback
    }
  }, []);

  // Sync lives when character changes
  useEffect(() => {
    if (gameStatus === 'menu') {
      setLives(character.maxLives);
    }
  }, [character, gameStatus]);

  const startGame = useCallback(() => {
    setScore(0);
    setLives(character.maxLives);
    setLevel(1);
    setIsNewHigh(false);
    setGameStatus('playing');
  }, [character.maxLives]);

  const handleGameOver = useCallback(() => {
    setGameStatus('gameover');
    if (score > highScore) {
      setHighScore(score);
      setIsNewHigh(true);
      try {
        localStorage.setItem(HIGH_SCORE_KEY, score.toString());
      } catch {
        // ignore
      }
    }
    try {
      localStorage.setItem(GEMS_KEY, gems.toString());
    } catch {
      // ignore
    }
  }, [score, highScore, gems]);

  const handleTogglePause = () => {
    if (gameStatus === 'playing') {
      setGameStatus('paused');
    } else if (gameStatus === 'paused') {
      setGameStatus('playing');
    }
  };

  const handlePrevCharacter = () => {
    const nextIdx = (characterIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
    setCharacterIndex(nextIdx);
    if (gameStatus !== 'playing') {
      setLives(CHARACTERS[nextIdx].maxLives);
    }
  };

  const handleNextCharacter = () => {
    const nextIdx = (characterIndex + 1) % CHARACTERS.length;
    setCharacterIndex(nextIdx);
    if (gameStatus !== 'playing') {
      setLives(CHARACTERS[nextIdx].maxLives);
    }
  };

  const handleToggleControlMode = () => {
    setControlMode((prev) => (prev === 'follow' ? 'keys_buttons' : 'follow'));
  };

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center p-1 sm:p-3 md:p-4 overflow-hidden select-none">
      {/* Container matching standard 16:9 gaming frame */}
      <div className="w-full max-w-5xl flex flex-col items-center">
        {/* Game Stage Box */}
        <div className="relative w-full aspect-[16/9] max-h-[88vh] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-slate-800 sm:border-2 sm:border-slate-800/90 bg-[#0b0d14]">
          {/* Main 60fps Canvas Simulator */}
          <GameCanvas
            character={character}
            isPlaying={gameStatus === 'playing'}
            isPaused={gameStatus === 'paused'}
            score={score}
            gems={gems}
            lives={lives}
            level={level}
            onScoreChange={setScore}
            onGemsChange={setGems}
            onLivesChange={setLives}
            onLevelChange={setLevel}
            onGameOver={handleGameOver}
            controlMode={controlMode}
            isMobileTouchLeft={isMobileTouchLeft}
            isMobileTouchRight={isMobileTouchRight}
          />

          {/* HUD Overlay (Only rendered during active gameplay or pause, never in start menu) */}
          {gameStatus !== 'menu' && (
            <GameHUD
              score={score}
              highScore={highScore}
              gems={gems}
              lives={lives}
              level={level}
              character={character}
              isPlaying={gameStatus === 'playing'}
              onPrevCharacter={handlePrevCharacter}
              onNextCharacter={handleNextCharacter}
              isPaused={gameStatus === 'paused'}
              onTogglePause={handleTogglePause}
              onOpenHelp={() => setShowInstructions(true)}
              controlMode={controlMode}
              onToggleControlMode={handleToggleControlMode}
              isMobileTouchLeft={isMobileTouchLeft}
              isMobileTouchRight={isMobileTouchRight}
              setIsMobileTouchLeft={setIsMobileTouchLeft}
              setIsMobileTouchRight={setIsMobileTouchRight}
            />
          )}

          {/* Menu / Start Screen Overlay (Refined, magical gothic atmosphere) */}
          {gameStatus === 'menu' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#080b12]/90 via-[#0a0f1d]/85 to-[#06080e]/95 backdrop-blur-md text-center select-none overflow-hidden">
              {/* Magical Ambient Glows */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-56 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-80 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Top corner utilities in menu */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 z-10">
                <button
                  id="menu-sound-toggle-btn"
                  onClick={handleToggleSound}
                  aria-label={isMuted ? '音声を再生' : '音声をミュート'}
                  title={isMuted ? '音声を再生' : '音声をミュート'}
                  className="p-2 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500 transition-all cursor-pointer shadow-lg"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  id="menu-help-btn"
                  onClick={() => setShowInstructions(true)}
                  aria-label="あそびかた"
                  title="あそびかた"
                  className="p-2 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500 transition-all cursor-pointer shadow-lg"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Elegant Gothic Subtitle Banner */}
              <div className="flex items-center justify-center gap-2.5 mb-1.5 opacity-85">
                <span className="h-px w-6 sm:w-10 bg-gradient-to-r from-transparent to-amber-400/60" />
                <span className="text-[10px] sm:text-xs font-cinzel font-bold text-amber-300 tracking-[0.25em] uppercase drop-shadow">
                  Dark Lord's Curse
                </span>
                <span className="h-px w-6 sm:w-10 bg-gradient-to-l from-transparent to-amber-400/60" />
              </div>

              {/* Main Title: ヴォルデモートの呪いをかわせ */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-cinzel tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-200 to-amber-400 drop-shadow-[0_2px_20px_rgba(245,158,11,0.4)] mb-3">
                ヴォルデモートの呪いをかわせ
              </h1>

              {/* Description Paragraph (Broken line before 黄金の～) */}
              <p className="text-xs sm:text-sm text-slate-300/90 max-w-md mb-5 leading-relaxed tracking-wide font-normal">
                大広間に降り注ぐ緑の即死呪文「アバダ・ケダブラ」を回避し、<br />
                黄金のガリオン金貨を集めよう！
              </p>

              {/* Menu Actions: Start, Character, Rankings (Equal height buttons, stylish design) */}
              <div className="flex flex-row items-center justify-center gap-2 sm:gap-2.5 w-full max-w-md mb-4">
                <button
                  id="start-game-btn"
                  onClick={startGame}
                  className="h-11 sm:h-12 flex-1 px-3 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 hover:from-emerald-400 hover:to-green-300 active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm tracking-wider shadow-lg shadow-emerald-950/70 ring-1 ring-emerald-300/40 hover:ring-emerald-300/70 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" />
                  <span>ゲームスタート</span>
                </button>

                <button
                  id="select-wizard-menu-btn"
                  onClick={() => setShowCharacterSelect(true)}
                  className="h-11 sm:h-12 px-3 sm:px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-200 hover:text-white font-bold text-xs sm:text-sm border border-amber-500/30 hover:border-amber-400/60 shadow-md shadow-black/40 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{character.name}</span>
                </button>

                <button
                  id="menu-open-ranking-btn"
                  onClick={() => setShowMenuRanking(true)}
                  className="h-11 sm:h-12 px-3 sm:px-4 rounded-xl bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 font-bold text-xs sm:text-sm border border-amber-500/35 hover:border-amber-400/60 shadow-md shadow-black/40 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>ランキング</span>
                </button>
              </div>

              {/* Badges: High score & Galleons */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center mb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs border border-amber-500/30 text-amber-300 text-[11px] sm:text-xs font-bold shadow-xs">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>ハイスコア: {highScore.toLocaleString()}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs border border-yellow-500/30 text-yellow-300 text-[11px] sm:text-xs font-bold shadow-xs">
                  <span>🪙</span>
                  <span>ガリオン: {gems.toLocaleString()}</span>
                </div>
              </div>

              {/* Quick control hint */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-xs text-slate-400/80">
                <span className="flex items-center gap-1 bg-slate-900/70 px-2.5 py-0.5 rounded-full border border-slate-800/80">
                  📱 画面タップ・追従で移動
                </span>
                <span className="flex items-center gap-1 bg-slate-900/70 px-2.5 py-0.5 rounded-full border border-slate-800/80">
                  ⌨️ A / D または ◀ ▶ キー
                </span>
              </div>
            </div>
          )}

          {/* Pause Menu Overlay */}
          {gameStatus === 'paused' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-sm text-center select-none">
              <h2 className="text-3xl sm:text-4xl font-black text-white font-cinzel tracking-wider mb-2">
                一時停止中
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                一息ついて、準備ができたら再開しよう。
              </p>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                  id="resume-btn"
                  onClick={handleTogglePause}
                  className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm tracking-wide transition-all cursor-pointer"
                >
                  ゲームを再開
                </button>
                <button
                  id="restart-from-pause-btn"
                  onClick={startGame}
                  className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
                >
                  最初からやり直す
                </button>
              </div>
            </div>
          )}

          {/* Game Over Screen Overlay */}
          {gameStatus === 'gameover' && (
            <GameOverModal
              score={score}
              highScore={highScore}
              isNewHigh={isNewHigh}
              gems={gems}
              level={level}
              character={character}
              onRestart={startGame}
              onOpenCharacterSelect={() => setShowCharacterSelect(true)}
            />
          )}

          {/* Menu Ranking Modal */}
          {showMenuRanking && (
            <div
              onClick={() => setShowMenuRanking(false)}
              className="absolute inset-0 z-30 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-[95%] max-w-md bg-gradient-to-b from-[#131722] to-[#0c0f17] border border-amber-500/40 rounded-2xl p-4 shadow-2xl relative"
              >
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-cinzel font-black">
                    <Trophy className="w-4 h-4" />
                    <span className="text-base tracking-wider text-white">ホグワーツ栄光の殿堂</span>
                  </div>
                  <button
                    id="close-menu-ranking-btn"
                    onClick={() => setShowMenuRanking(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <RankingBoard />
              </div>
            </div>
          )}

          {/* Character Selector Modal */}
          {showCharacterSelect && (
            <CharacterSelectModal
              selectedCharacter={character}
              onSelectCharacter={(c) => {
                const idx = CHARACTERS.findIndex((item) => item.id === c.id);
                if (idx !== -1) setCharacterIndex(idx);
                setShowCharacterSelect(false);
              }}
              onClose={() => setShowCharacterSelect(false)}
            />
          )}

          {/* How to Play Modal */}
          {showInstructions && (
            <InstructionsModal onClose={() => setShowInstructions(false)} />
          )}
        </div>
      </div>
    </main>
  );
}
