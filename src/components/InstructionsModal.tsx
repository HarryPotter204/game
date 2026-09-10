import React from 'react';
import { X, MousePointer, Keyboard, Smartphone, Shield, Coins, Zap } from 'lucide-react';

interface InstructionsModalProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-[95%] max-w-3xl bg-[#0f121d] border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl relative max-h-[92%] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-white font-cinzel tracking-wider flex items-center gap-2">
            <span>✨</span> あそびかた・操作ガイド
          </h2>
          <button
            id="close-instructions-modal-btn"
            onClick={onClose}
            aria-label="閉じる"
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Section */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            直感的な操作方法
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                <MousePointer className="w-4 h-4" /> マウス操作
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                画面上でマウスを動かすと、カーソルの横位置に向かって魔法使いがダッシュします。
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs mb-1">
                <Keyboard className="w-4 h-4" /> キーボード操作
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                <span className="text-white font-mono bg-slate-800 px-1 rounded">A</span> / <span className="text-white font-mono bg-slate-800 px-1 rounded">D</span> または <span className="text-white font-mono bg-slate-800 px-1 rounded">◀</span> <span className="text-white font-mono bg-slate-800 px-1 rounded">▶</span> 矢印キーで左右に移動。
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1">
                <Smartphone className="w-4 h-4" /> スマホ・タップ操作
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                画面の左側タップで左移動、右側タップで右移動！画面を指でなぞっても直感追従します。
              </p>
            </div>
          </div>
        </div>

        {/* Game Rules */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            サバイバル・ルール
          </h3>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2.5 p-2.5 bg-slate-900/40 rounded-lg border border-red-900/40">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shadow-[0_0_10px_#10b981] shrink-0" />
              <div>
                <strong className="text-emerald-400">死の呪文（アバダ・ケダブラ）：</strong>
                <p className="text-slate-300 mt-0.5">
                  上空から降る危険な緑の光弾。当たるとライフを1失います。全力でかわしましょう！
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-slate-900/40 rounded-lg border border-amber-900/40">
              <Coins className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-amber-400">ガリオン金貨・魔法の秘宝：</strong>
                <p className="text-slate-300 mt-0.5">
                  舞い降りる金色のガリオン金貨（+10）、深紅のルビー（+50）、羽ばたく金のスニッチ（+100）を集めて高得点を目指そう！
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-slate-900/40 rounded-lg border border-sky-900/40">
              <Shield className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-sky-400">プロテゴ（護法シールド）：</strong>
                <p className="text-slate-300 mt-0.5">
                  青い光球を取ると一定時間シールドが展開！迫り来る呪文を1回安全に完全ガードします。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 bg-slate-900/40 rounded-lg border border-yellow-900/40">
              <Zap className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-yellow-400">かすり抜けボーナス（Near Miss）：</strong>
                <p className="text-slate-300 mt-0.5">
                  呪文のすぐ横をギリギリですり抜けると特別ボーナススコアが入ります！
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          id="got-it-btn"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-black font-black text-sm tracking-wide cursor-pointer transition-all shadow-lg"
        >
          ゲームを始める！
        </button>
      </div>
    </div>
  );
};
