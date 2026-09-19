import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, ArrowLeft, RotateCcw, PartyPopper, Heart, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { PlantVisual } from './PlantVisual';
import { VerbItem, PlantStage, QuizStep } from '../types';
import { VERB_LIST } from '../data/verbs';
import { sound } from '../services/sound';
import { tts } from '../services/tts';
import { storage } from '../services/storage';

interface ReviewViewProps {
  wrongVerbIds: string[];
  onBack: () => void;
  onRefreshWrongVerbs: () => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  wrongVerbIds,
  onBack,
  onRefreshWrongVerbs,
}) => {
  const [reviewList, setReviewList] = useState<VerbItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<PlantStage>('seed');
  const [subStep, setSubStep] = useState<QuizStep>('past');

  // 2-chance tracking per sub-step
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);

  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [optionsUnlocked, setOptionsUnlocked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecking, setIsAnswerChecking] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  const [feedback, setFeedback] = useState<{
    status: 'correct' | 'wrong' | 'retry';
    message: string;
    correctAnswer?: string;
  } | null>(null);

  useEffect(() => {
    const list = VERB_LIST.filter((v) => wrongVerbIds.includes(v.id));
    setReviewList(list);
    setCurrentIndex(0);
    setIsAllCompleted(list.length === 0);
  }, [wrongVerbIds]);

  const currentVerb = reviewList[currentIndex];

  const generateShuffledOptions = useCallback((correct: string, distractors: string[]) => {
    const list = [correct, ...distractors.slice(0, 2)];
    return list.sort(() => Math.random() - 0.5);
  }, []);

  const setupStep = useCallback((step: QuizStep, verb: VerbItem) => {
    setSelectedOption(null);
    setFeedback(null);
    setIsAnswerChecking(false);
    setOptionsUnlocked(false);
    setIsPlayingAudio(true);
    setWrongAttempts(0);
    setEliminatedOptions([]);

    const targetWord = step === 'past' ? verb.past : verb.pastParticiple;
    const distractors = step === 'past' ? verb.distractorsPast : verb.distractorsParticiple;
    setCurrentOptions(generateShuffledOptions(targetWord, distractors));

    tts.speak(targetWord, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => {
        setIsPlayingAudio(false);
        setOptionsUnlocked(true);
      },
    });
  }, [generateShuffledOptions]);

  useEffect(() => {
    if (!currentVerb) return;
    setStage('seed');
    setSubStep('past');
    setupStep('past', currentVerb);
  }, [currentIndex, currentVerb, setupStep]);

  const handleReplayAudio = () => {
    if (!currentVerb || isAnswerChecking) return;
    sound.play('click');
    const targetWord = subStep === 'past' ? currentVerb.past : currentVerb.pastParticiple;
    setIsPlayingAudio(true);
    tts.speak(targetWord, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => {
        setIsPlayingAudio(false);
        setOptionsUnlocked(true);
      },
    });
  };

  const handleSelectOption = (option: string) => {
    if (!optionsUnlocked || isAnswerChecking || !currentVerb || eliminatedOptions.includes(option)) return;

    setSelectedOption(option);
    setIsAnswerChecking(true);

    const correctAnswer = subStep === 'past' ? currentVerb.past : currentVerb.pastParticiple;
    const isCorrect = option === correctAnswer;

    if (isCorrect) {
      sound.play('correct');

      if (subStep === 'past') {
        setTimeout(() => {
          sound.play('sprout');
          setStage('sprout');
          setFeedback({
            status: 'correct',
            message: wrongAttempts === 0
              ? '정답! 떡잎 새싹이 힘차게 올라왔어요 🌱'
              : '다시 도전해서 정답을 맞혔어요! 떡잎 새싹이 쑥! 🌱',
            correctAnswer,
          });
        }, 200);

        setTimeout(() => {
          setSubStep('participle');
          setupStep('participle', currentVerb);
        }, 1500);
      } else {
        // Mastered this review verb!
        setTimeout(() => {
          sound.play('bloom');
          setStage('flower');
          setFeedback({
            status: 'correct',
            message: `완벽 복습 성공! ${currentVerb.plantName} 꽃이 활짝 피어 정원에 들어갔어요 🌸`,
            correctAnswer,
          });
        }, 200);

        // Remove from wrong list and save to garden
        storage.removeWrongVerb(currentVerb.id);
        storage.saveMasteredPlant(currentVerb.id);
        onRefreshWrongVerbs();

        setTimeout(() => {
          if (currentIndex + 1 < reviewList.length) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            sound.play('celebrate');
            setIsAllCompleted(true);
          }
        }, 1900);
      }
    } else {
      sound.play('wrong');

      if (wrongAttempts === 0) {
        // 1st mistake -> retry chance
        setWrongAttempts(1);
        setEliminatedOptions((prev) => [...prev, option]);

        setFeedback({
          status: 'retry',
          message: '아쉬워요! 한 번 더 기회가 있어요 (남은 기회 1회) 💪 발음을 다시 듣고 골라보세요!',
          correctAnswer,
        });

        setTimeout(() => {
          setSelectedOption(null);
          setIsAnswerChecking(false);
          setIsPlayingAudio(true);
          setOptionsUnlocked(false);

          const targetWord = subStep === 'past' ? currentVerb.past : currentVerb.pastParticiple;
          tts.speak(targetWord, {
            onStart: () => setIsPlayingAudio(true),
            onEnd: () => {
              setIsPlayingAudio(false);
              setOptionsUnlocked(true);
            },
          });
        }, 1300);
      } else {
        // 2nd mistake -> move on to next review word
        setWrongAttempts(2);
        setFeedback({
          status: 'wrong',
          message: `두 번 모두 틀렸어요! 정답은 [${correctAnswer}] 이에요. 다음에 다시 도전해봐요!`,
          correctAnswer,
        });

        setTimeout(() => {
          if (currentIndex + 1 < reviewList.length) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            sound.play('celebrate');
            setIsAllCompleted(true);
          }
        }, 2400);
      }
    }
  };

  if (isAllCompleted || reviewList.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center max-w-md mx-auto w-full p-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm w-full flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-xs">
            <PartyPopper className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-slate-800">
            틀린 동사를 모두 마스터했어요!
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            복습 목록의 식물들이 모두 정원에 건강하게 피어났어요. 정원에서 식물들을 관찰해보세요!
          </p>

          <button
            onClick={() => {
              sound.play('click');
              onBack();
            }}
            className="mt-6 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xs active:scale-98 transition-all"
          >
            홈으로 돌아가기
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full p-4 pb-6">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-2.5 border border-rose-100 shadow-xs mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.play('click');
              onBack();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
            복습 {currentIndex + 1} / {reviewList.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 2-Chances Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              wrongAttempts === 0
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-amber-50 text-amber-800 border border-amber-300 animate-pulse'
            }`}
            title="복습마다 2번의 기회가 주어져요!"
          >
            <Heart
              className={`w-3.5 h-3.5 fill-current ${
                wrongAttempts === 0 ? 'text-rose-500' : 'text-amber-500'
              }`}
            />
            <span className="text-[11px]">
              {wrongAttempts === 0 ? '기회 2번' : '남은 기회 1번!'}
            </span>
          </div>

          <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
            {currentVerb.plantName}
          </span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs flex flex-col items-center relative">
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-slate-400 font-medium">복습 동사 원형</span>
          <div className="flex items-center gap-2 mt-0.5">
            <h2 className="text-2xl font-black text-slate-800">{currentVerb.base}</h2>
            <button
              onClick={() => {
                sound.play('click');
                tts.speak(currentVerb.base);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-rose-600"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md mt-1">
            뜻: {currentVerb.meaning}
          </span>
        </div>

        <div className="my-2">
          <PlantVisual verb={currentVerb} stage={stage} size="md" showStageBadge={true} />
        </div>

        <p className="text-[11px] text-slate-500 text-center bg-slate-50 border border-slate-100 rounded-xl p-2 w-full mt-1">
          💡 {currentVerb.science.fact}
        </p>
      </div>

      {/* Audio Pronunciation Guidance */}
      <div className="my-3 flex items-center justify-between bg-rose-50/90 border border-rose-200/80 rounded-2xl px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isPlayingAudio
                ? 'bg-rose-600 text-white animate-bounce'
                : 'bg-rose-100 text-rose-700'
            }`}
          >
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-rose-950">
              {subStep === 'past' ? '과거형 발음 듣기' : '과거분사형 발음 듣기'}
            </p>
            <p className="text-[11px] text-rose-700">
              {isPlayingAudio
                ? '발음을 듣는 중... 선택지가 곧 열려요!'
                : '들은 발음의 올바른 단어를 골라주세요!'}
            </p>
          </div>
        </div>

        <button
          onClick={handleReplayAudio}
          disabled={isPlayingAudio || isAnswerChecking}
          className="flex items-center gap-1 text-xs font-bold text-rose-800 bg-white border border-rose-300 hover:bg-rose-100/50 active:scale-95 disabled:opacity-50 px-2.5 py-1.5 rounded-xl shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
          <span>다시 듣기</span>
        </button>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <div className="text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {subStep === 'past' ? '✦ 과거형(Past) 선택 ✦' : '✦ 과거분사(Past Participle) 선택 ✦'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {currentOptions.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isEliminated = eliminatedOptions.includes(option);
            const correctAnswer =
              subStep === 'past' ? currentVerb.past : currentVerb.pastParticiple;
            const isCorrect = option === correctAnswer;

            let buttonStyle = 'bg-white border-slate-200 text-slate-800 hover:border-rose-400';
            if (isEliminated) {
              buttonStyle = 'bg-slate-100/90 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed line-through';
            } else if (isAnswerChecking) {
              if (isSelected) {
                buttonStyle = isCorrect
                  ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-md'
                  : 'bg-rose-500 border-rose-500 text-white font-bold shadow-md';
              } else if (isCorrect && wrongAttempts >= 2) {
                buttonStyle = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold';
              } else {
                buttonStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
              }
            } else if (!optionsUnlocked) {
              buttonStyle = 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed';
            }

            return (
              <button
                key={`${option}-${idx}`}
                onClick={() => handleSelectOption(option)}
                disabled={!optionsUnlocked || isAnswerChecking || isEliminated}
                className={`w-full py-3 px-4 rounded-2xl border-2 text-base font-semibold transition-all flex items-center justify-between shadow-xs ${buttonStyle}`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                      isEliminated
                        ? 'bg-slate-200 text-slate-400'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span>{option}</span>
                </div>

                {isEliminated && (
                  <span className="text-xs font-bold text-rose-500 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md no-underline">
                    오답 제외
                  </span>
                )}

                {isAnswerChecking && isSelected && (
                  <div>
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <XCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`mt-2 p-2.5 rounded-2xl border text-center text-xs font-bold flex items-center justify-center gap-1.5 ${
              feedback.status === 'correct'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : feedback.status === 'retry'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            {feedback.status === 'retry' && (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
