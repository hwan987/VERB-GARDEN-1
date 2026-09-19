import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Sprout, RotateCcw, BookOpen, Volume2, CheckCircle, Sparkles } from 'lucide-react';
import { PlantVisual } from './PlantVisual';
import { GameResult, VerbItem } from '../types';
import { VERB_LIST } from '../data/verbs';
import { sound } from '../services/sound';
import { tts } from '../services/tts';

interface ResultViewProps {
  result: GameResult;
  onRestart: () => void;
  onGoGarden: () => void;
  onGoReview: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onRestart,
  onGoGarden,
  onGoReview,
}) => {
  const { score, totalQuestions, correctCount, completedVerbIds, wrongVerbIds } = result;

  const completedVerbs = VERB_LIST.filter((v) => completedVerbIds.includes(v.id));
  const wrongVerbs = VERB_LIST.filter((v) => wrongVerbIds.includes(v.id));

  const isExcellent = correctCount >= 8;

  return (
    <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full p-4 pb-8">
      <div className="space-y-4">
        {/* Top Trophy & Score Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm text-center relative overflow-hidden"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 mb-3 shadow-xs">
            <Trophy className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            학습 완료!
          </span>

          <h2 className="text-2xl font-black text-slate-800 mt-2">
            {isExcellent ? '대단해요! 멋진 정원사네요 🌸' : '수고했어요! 조금만 더 힘내봐요 🌱'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            초등 과학 교과서 식물과 함께 동사 3단 변화를 익혔어요.
          </p>

          {/* Scores in exact user format: 80/100, 8/10 */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-3">
              <span className="text-[11px] text-emerald-800 font-semibold">총점</span>
              <div className="text-2xl font-black text-emerald-900 mt-0.5">
                {score} <span className="text-sm font-normal text-emerald-700">/ 100</span>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3">
              <span className="text-[11px] text-amber-800 font-semibold">정답 개수</span>
              <div className="text-2xl font-black text-amber-900 mt-0.5">
                {correctCount} <span className="text-sm font-normal text-amber-700">/ {totalQuestions}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 이번 학습에서 완성한 식물 */}
        <div className="bg-white rounded-3xl p-4 border border-emerald-100 shadow-xs">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800">
                이번 학습에서 피운 식물 ({completedVerbs.length}개)
              </h3>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">정원에 저장됨</span>
          </div>

          {completedVerbs.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {completedVerbs.map((verb) => (
                <div
                  key={verb.id}
                  className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-2 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 flex items-center justify-center">
                    <PlantVisual verb={verb} stage="flower" size="sm" showStageBadge={false} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 mt-1">{verb.plantName}</span>
                  <span className="text-[10px] text-emerald-700 font-medium">{verb.base}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-slate-400 text-xs">
              이번 게임에서는 아직 꽃을 피우지 못했어요. 다시 도전해볼까요?
            </div>
          )}
        </div>

        {/* 틀린 동사 목록 */}
        {wrongVerbs.length > 0 && (
          <div className="bg-white rounded-3xl p-4 border border-rose-100 shadow-xs">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-800">
                  틀린 동사 복습 목록 ({wrongVerbs.length}개)
                </h3>
              </div>
              <span className="text-[11px] text-rose-600 font-semibold">발음 다시 듣기</span>
            </div>

            <div className="space-y-2 mt-2">
              {wrongVerbs.map((verb) => (
                <div
                  key={verb.id}
                  className="bg-rose-50/50 border border-rose-100 rounded-xl p-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800">{verb.base}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-semibold text-rose-700">{verb.past}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-semibold text-rose-900">{verb.pastParticiple}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      {verb.meaning} ({verb.plantName})
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      sound.play('click');
                      tts.speak(`${verb.base}, ${verb.past}, ${verb.pastParticiple}`);
                    }}
                    className="p-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-100/50 rounded-lg active:scale-95 transition-all"
                    title="3단 변화 발음 듣기"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-2">
        {wrongVerbs.length > 0 && (
          <button
            onClick={() => {
              sound.play('click');
              onGoReview();
            }}
            className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>틀린 동사 복습하기 ({wrongVerbs.length})</span>
          </button>
        )}

        <button
          onClick={() => {
            sound.play('click');
            onGoGarden();
          }}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Sprout className="w-4 h-4" />
          <span>나의 정원 가기</span>
        </button>

        <button
          onClick={() => {
            sound.play('click');
            onRestart();
          }}
          className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl border border-slate-200 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          <span>다시 학습하기</span>
        </button>
      </div>
    </div>
  );
};
