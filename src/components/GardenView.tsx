import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Volume2, X, Sparkles, BookOpen, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { PlantVisual } from './PlantVisual';
import { VerbItem, GardenPlantRecord } from '../types';
import { VERB_LIST } from '../data/verbs';
import { sound } from '../services/sound';
import { tts } from '../services/tts';

interface GardenViewProps {
  garden: Record<string, GardenPlantRecord>;
  onBack: () => void;
  onGoReview: () => void;
  wrongCount: number;
}

export const GardenView: React.FC<GardenViewProps> = ({
  garden,
  onBack,
  onGoReview,
  wrongCount,
}) => {
  const [selectedVerb, setSelectedVerb] = useState<VerbItem | null>(null);

  const completedCount = Object.keys(garden).length;
  const totalPlants = VERB_LIST.length;

  const handleSelectPlant = (verb: VerbItem) => {
    sound.play('click');
    setSelectedVerb(verb);
  };

  const handleSpeak = (text: string) => {
    sound.play('click');
    tts.speak(text);
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-4 pb-8">
      {/* Garden Header & Progress Banner */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-sm mb-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.play('click');
                onBack();
              }}
              className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-black tracking-tight">나만의 동사 정원</h2>
          </div>

          <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-xs">
            완성도 {Math.round((completedCount / totalPlants) * 100)}%
          </span>
        </div>

        <p className="text-xs text-emerald-100 font-medium">
          불규칙 동사를 학습해 초등 과학 교과서 속 식물들을 모두 꽃피워보세요!
        </p>

        {/* Progress Bar & Stats */}
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sprout className="w-5 h-5 text-emerald-300" />
            <span className="text-sm font-black">
              피어난 식물 {completedCount} / {totalPlants}
            </span>
          </div>

          {wrongCount > 0 && (
            <button
              onClick={() => {
                sound.play('click');
                onGoReview();
              }}
              className="text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>복습하기 ({wrongCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Plants */}
      <div className="bg-white rounded-3xl p-4 border border-emerald-100 shadow-xs flex-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-slate-700">식물 도감 (총 {totalPlants}종)</span>
          <span className="text-[11px] text-slate-400">식물을 터치하면 자세히 봐요</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {VERB_LIST.map((verb) => {
            const isMastered = !!garden[verb.id];
            const record = garden[verb.id];

            return (
              <motion.button
                key={verb.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSelectPlant(verb)}
                className={`relative rounded-2xl p-2.5 flex flex-col items-center text-center border transition-all ${
                  isMastered
                    ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-100/50 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-70 hover:opacity-90'
                }`}
              >
                {/* Mastered times badge */}
                {isMastered && record && record.timesMastered > 1 && (
                  <span className="absolute top-1.5 right-1.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-2xs">
                    ★ {record.timesMastered}
                  </span>
                )}

                <div className="w-16 h-18 flex items-center justify-center">
                  {isMastered ? (
                    <PlantVisual verb={verb} stage="flower" size="sm" showStageBadge={false} />
                  ) : (
                    <div className="relative flex flex-col items-center justify-center">
                      <PlantVisual verb={verb} stage="seed" size="sm" showStageBadge={false} />
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 rounded-xl">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* English Verb: Hero prominence & large font */}
                <span className="text-base sm:text-lg font-black text-slate-900 mt-1 tracking-tight line-clamp-1">
                  {verb.base}
                </span>

                {/* Korean meaning & subordinate plant name */}
                <span className="text-[11px] text-emerald-700 font-bold line-clamp-1">
                  {verb.meaning}
                </span>
                <span className="text-[10px] text-slate-400 font-medium line-clamp-1">
                  {verb.plantName}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Detail Modal / Card Popup */}
      <AnimatePresence>
        {selectedVerb && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full border border-emerald-100 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  sound.play('click');
                  setSelectedVerb(null);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Plant Visual & Hero English Verb Heading */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 flex items-center justify-center">
                  <PlantVisual
                    verb={selectedVerb}
                    stage={garden[selectedVerb.id] ? 'flower' : 'seed'}
                    size="md"
                    showStageBadge={false}
                  />
                </div>

                {/* Main Hero: English Verb */}
                <div className="flex items-center gap-2 mt-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {selectedVerb.base}
                  </h3>
                  <button
                    onClick={() => handleSpeak(selectedVerb.base)}
                    className="p-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    title="발음 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Meaning & Subordinate Plant Info */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                    뜻: {selectedVerb.meaning}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    식물: {selectedVerb.plantName}
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
                    {selectedVerb.science.grade}
                  </span>
                </div>
              </div>

              {/* 3-Form Verb Conjugation & Pronunciation - Large English Typography */}
              <div className="mt-4 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  동사 3단 변화 & 발음 듣기
                </span>

                {/* Base */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                      현재형 (Base)
                    </span>
                    <span className="text-xl font-black text-slate-900 tracking-wide">
                      {selectedVerb.base}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSpeak(selectedVerb.base)}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all shadow-2xs"
                    title="현재형 발음 듣기"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Past */}
                <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
                  <div>
                    <span className="text-[10px] text-emerald-700 font-semibold block mb-0.5">
                      과거형 (Past)
                    </span>
                    <span className="text-xl font-black text-emerald-800 tracking-wide">
                      {selectedVerb.past}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSpeak(selectedVerb.past)}
                    className="p-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100/60 active:scale-95 transition-all shadow-2xs"
                    title="과거형 발음 듣기"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Past Participle */}
                <div className="flex items-center justify-between p-3 bg-purple-50/60 rounded-2xl border border-purple-200/80">
                  <div>
                    <span className="text-[10px] text-purple-700 font-semibold block mb-0.5">
                      과거분사 (Past Participle)
                    </span>
                    <span className="text-xl font-black text-purple-800 tracking-wide">
                      {selectedVerb.pastParticiple}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSpeak(selectedVerb.pastParticiple)}
                    className="p-2.5 rounded-xl bg-white border border-purple-300 text-purple-700 hover:bg-purple-100/60 active:scale-95 transition-all shadow-2xs"
                    title="과거분사 발음 듣기"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Elementary Science Textbook Knowledge Card */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                  <span>🔬 교과서 연계 과학 상식:</span>
                  <span className="text-emerald-700 font-medium">{selectedVerb.plantName}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {selectedVerb.science.fact}
                </p>
              </div>

              {/* Status footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {garden[selectedVerb.id] ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      정원에 활짝 피어있음
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold">
                      아직 퀴즈에서 피우지 않은 식물
                    </span>
                  )}
                </span>
                <button
                  onClick={() => {
                    handleSpeak(
                      `${selectedVerb.base}, ${selectedVerb.past}, ${selectedVerb.pastParticiple}`
                    );
                  }}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  3단 연속 듣기 🔊
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
