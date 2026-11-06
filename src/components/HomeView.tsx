import React from 'react';
import { motion } from 'motion/react';
import { Play, Sprout, BookOpen, Sparkles, Award, ArrowRight, FileSpreadsheet } from 'lucide-react';
import { PlantVisual } from './PlantVisual';
import { VERB_LIST } from '../data/verbs';
import { GardenPlantRecord } from '../types';
import { sound } from '../services/sound';

interface HomeViewProps {
  garden: Record<string, GardenPlantRecord>;
  wrongCount: number;
  onStartGame: () => void;
  onGoGarden: () => void;
  onGoReview: () => void;
  onOpenSheetModal?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  garden,
  wrongCount,
  onStartGame,
  onGoGarden,
  onGoReview,
  onOpenSheetModal,
}) => {
  const completedCount = Object.keys(garden).length;
  const totalPlants = VERB_LIST.length;

  // Pick up to 3 recently mastered plants for garden preview, or default showcase
  const masteredIds = Object.keys(garden);
  const previewVerbs =
    masteredIds.length > 0
      ? VERB_LIST.filter((v) => masteredIds.includes(v.id)).slice(0, 3)
      : VERB_LIST.slice(0, 3); // showcase bean, balsam, sunflower

  return (
    <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full p-4 pb-8">
      {/* Top Hero Section: Logo, Title, Subtitle */}
      <div className="text-center pt-3">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-full mb-3 shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>초등 3~4학년 영어 불규칙 동사 & 과학 식물</span>
        </motion.div>

        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <span>Growing Your Verbs</span>
        </h1>
        <p className="text-xs text-slate-600 mt-1.5 max-w-xs mx-auto leading-relaxed">
          발음을 듣고 불규칙 동사 3단 변화를 맞히면 씨앗에서 예쁜 교과서 꽃이 활짝 피어나요!
        </p>
      </div>

      {/* Garden Preview Card */}
      <motion.div
        whileTap={{ scale: 0.99 }}
        onClick={() => {
          sound.play('click');
          onGoGarden();
        }}
        className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm cursor-pointer hover:border-emerald-300 transition-all my-2 relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">나의 정원 미리보기</h2>
              <p className="text-[11px] text-emerald-700 font-semibold">
                현재까지 완성한 식물: <span className="text-emerald-950 font-black">{completedCount}</span> / {totalPlants}그루
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* 3 Preview Plants Display */}
        <div className="grid grid-cols-3 gap-2 bg-gradient-to-b from-emerald-50/50 to-emerald-100/30 rounded-2xl p-3 border border-emerald-100/60 mt-2">
          {previewVerbs.map((verb) => {
            const isMastered = !!garden[verb.id];
            return (
              <div key={verb.id} className="flex flex-col items-center text-center">
                <div className="w-16 h-18 flex items-center justify-center">
                  <PlantVisual
                    verb={verb}
                    stage={isMastered ? 'flower' : 'seed'}
                    size="sm"
                    showStageBadge={false}
                  />
                </div>
                {/* English Verb - Prominent */}
                <span className="text-sm font-black text-slate-900 mt-1.5 tracking-tight line-clamp-1">
                  {verb.base}
                </span>
                {/* Meaning & Plant Name - Subordinate */}
                <span className="text-[10px] text-emerald-700 font-semibold line-clamp-1">
                  {verb.meaning}
                </span>
                <span className="text-[9px] text-slate-400 font-medium line-clamp-1">
                  {verb.plantName}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
          <span>강낭콩, 봉선화, 나팔꽃, 민들레 등 교과서 20종</span>
          <span className="font-bold text-emerald-700 hover:underline">정원 전체보기 →</span>
        </div>
      </motion.div>

      {/* Main [학습 시작] Large Button */}
      <div className="my-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            sound.play('click');
            onStartGame();
          }}
          className="w-full py-4.5 px-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white font-black text-lg shadow-lg hover:shadow-xl shadow-emerald-700/20 active:shadow-md transition-all flex items-center justify-center gap-3 border-2 border-emerald-500/30"
        >
          <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
            <Play className="w-5 h-5 fill-white" />
          </div>
          <span>학습 시작 (10문제)</span>
        </motion.button>
        <p className="text-[11px] text-center text-slate-600 mt-2">
          🌱 씨앗(원형) → 🌿 새싹(과거형) → 🌸 꽃(과거분사형)으로 성장해요!
        </p>
      </div>

      {/* Bottom Sub-Actions: [나의 정원] & [복습하기] */}
      <div className="grid grid-cols-2 gap-3 mt-1">
        {/* [나의 정원] Button */}
        <button
          onClick={() => {
            sound.play('click');
            onGoGarden();
          }}
          className="py-3.5 px-4 rounded-2xl bg-white border border-emerald-200 hover:bg-emerald-50/60 active:scale-97 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
        >
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span>나의 정원</span>
        </button>

        {/* [복습하기] Button */}
        <button
          onClick={() => {
            sound.play('click');
            onGoReview();
          }}
          className={`py-3.5 px-4 rounded-2xl border active:scale-97 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 ${
            wrongCount > 0
              ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100/70'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${wrongCount > 0 ? 'text-rose-600' : 'text-slate-500'}`} />
          <span>복습하기</span>
          {wrongCount > 0 && (
            <span className="bg-rose-500 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">
              {wrongCount}
            </span>
          )}
        </button>
      </div>

      {/* Google Sheets Link & Log View */}
      {onOpenSheetModal && (
        <button
          onClick={() => {
            sound.play('click');
            onOpenSheetModal();
          }}
          className="mt-3 w-full py-2.5 px-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 shadow-2xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>구글 스프레드시트 학습 기록 연동 (Apps Script)</span>
        </button>
      )}
    </div>
  );
};
