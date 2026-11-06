import React, { useState } from 'react';
import { Volume2, VolumeX, Home, Sprout, Sparkles, FileSpreadsheet } from 'lucide-react';
import { sound } from '../services/sound';
import { Screen } from '../types';

interface HeaderProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  gardenCount: number;
  score?: number;
  onOpenSheetModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  gardenCount,
  score,
  onOpenSheetModal,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const handleToggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs px-4 py-3 flex items-center justify-between">
      {/* Left: Brand or Home button */}
      <div className="flex items-center gap-2">
        {currentScreen !== 'home' ? (
          <button
            onClick={() => {
              sound.play('click');
              onNavigate('home');
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:scale-95 px-2.5 py-1.5 rounded-lg transition-all"
            title="홈으로 가기"
          >
            <Home className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">홈</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 tracking-tight leading-none">
                Growing Your Verbs
              </h1>
              <span className="text-[10px] text-emerald-600 font-medium">
                초등 3~4학년 영어 불규칙 동사 정원
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Center: Score indicator during game */}
      {currentScreen === 'game' && typeof score === 'number' && (
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span className="text-xs font-bold text-amber-900">{score}점</span>
        </div>
      )}

      {/* Right: Google Sheets Quick Link & Garden & Sound toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {onOpenSheetModal && (
          <button
            onClick={() => {
              sound.play('click');
              onOpenSheetModal();
            }}
            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 active:scale-95 px-2 py-1.5 rounded-lg border border-emerald-200/60 transition-all"
            title="구글 스프레드시트 기록 연동 확인"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">시트 연동</span>
          </button>
        )}

        {currentScreen !== 'garden' && (
          <button
            onClick={() => {
              sound.play('click');
              onNavigate('garden');
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:scale-95 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 transition-all"
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>정원</span>
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {gardenCount}
            </span>
          </button>
        )}

        <button
          onClick={handleToggleMute}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
          title={isMuted ? '소리 켜기' : '소리 끄기'}
          aria-label={isMuted ? '소리 켜기' : '소리 끄기'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-slate-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-600" />
          )}
        </button>
      </div>
    </header>
  );
};
