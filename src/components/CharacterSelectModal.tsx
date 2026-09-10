import React from 'react';
import { CHARACTERS } from '../data/characters';
import { Character } from '../types';
import { Sparkles, Heart, Zap, X } from 'lucide-react';

interface CharacterSelectModalProps {
  selectedCharacter: Character;
  onSelectCharacter: (char: Character) => void;
  onClose: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  selectedCharacter,
  onSelectCharacter,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-[95%] max-w-4xl max-h-[92%] bg-[#0f121d] border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl relative flex flex-col justify-between overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-3 sm:mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-2xl font-black text-white font-cinzel tracking-wider">
              魔法使いを選択
            </h2>
          </div>
          <button
            id="close-wizard-select-btn"
            onClick={onClose}
            aria-label="閉じる"
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Character Cards horizontally aligned and spaced */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4 overflow-y-auto sm:overflow-visible">
          {CHARACTERS.map((char) => {
            const isSelected = selectedCharacter.id === char.id;
            return (
              <button
                key={char.id}
                id={`select-wizard-${char.id}`}
                onClick={() => onSelectCharacter(char)}
                className={`p-3.5 sm:p-4 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50 scale-[1.01]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-black rounded-full shadow">
                    選択中
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-3 mb-2.5">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-base sm:text-lg border-2 shrink-0 shadow-md"
                      style={{
                        backgroundColor: char.robeColor,
                        borderColor: char.accentColor,
                        color: '#ffffff',
                      }}
                    >
                      {char.id === 'harry' ? 'H' : char.id === 'hermione' ? 'M' : 'R'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-sm sm:text-base text-white truncate whitespace-nowrap">
                        {char.name}
                      </h3>
                      <span className="text-xs font-semibold text-amber-400 block truncate">
                        {char.badge}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-2.5 text-[11px] sm:text-xs text-slate-300 mb-2 whitespace-nowrap overflow-hidden">
                    <div className="flex items-center gap-1 font-bold shrink-0">
                      <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
                      <span>ライフ {char.maxLives}</span>
                    </div>
                    <span className="text-slate-600 font-normal shrink-0">|</span>
                    <div className="flex items-center gap-1 font-bold shrink-0">
                      <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                      <span>速度: {char.speed}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] sm:text-xs text-slate-300 pt-2 border-t border-slate-800/80 leading-relaxed">
                  {char.perkDescription}
                </p>
              </button>
            );
          })}
        </div>

        {/* Confirmation Button */}
        <button
          id="confirm-wizard-btn"
          onClick={onClose}
          className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-black font-black text-sm sm:text-base tracking-wide cursor-pointer transition-all shadow-lg shrink-0"
        >
          この魔法使いで遊ぶ ({selectedCharacter.name})
        </button>
      </div>
    </div>
  );
};
