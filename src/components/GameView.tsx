import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, CheckCircle2, XCircle, RotateCcw, Heart, AlertCircle } from 'lucide-react';
import { PlantVisual } from './PlantVisual';
import { VerbItem, PlantStage, QuizStep } from '../types';
import { sound } from '../services/sound';
import { tts } from '../services/tts';
import { storage } from '../services/storage';

interface GameViewProps {
  questions: VerbItem[];
  onFinishGame: (result: {
    score: number;
    totalQuestions: number;
    correctCount: number;
    completedVerbIds: string[];
    wrongVerbIds: string[];
  }) => void;
  onExit: () => void;
}

export const GameView: React.FC<GameViewProps> = ({
  questions,
  onFinishGame,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<PlantStage>('seed');
  const [subStep, setSubStep] = useState<QuizStep>('past'); // 'past' -> 'participle'

  const [score, setScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [completedVerbIds, setCompletedVerbIds] = useState<string[]>([]);
  const [wrongVerbIds, setWrongVerbIds] = useState<string[]>([]);

  // 2-chance retry tracking per sub-step
  const [wrongAttempts, setWrongAttempts] = useState(0); // 0 = first attempt, 1 = 1 mistake made (retry available), 2 = failed twice
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);

  // Sound & Speech State
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [optionsUnlocked, setOptionsUnlocked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecking, setIsAnswerChecking] = useState(false);
  const [feedback, setFeedback] = useState<{
    status: 'correct' | 'wrong' | 'retry';
    message: string;
    correctAnswer: string;
  } | null>(null);

  const currentVerb = questions[currentIndex] || questions[0];

  // Options generator for 3-choice quiz
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);

  const generateShuffledOptions = useCallback((correct: string, distractors: string[]) => {
    const list = [correct, ...distractors.slice(0, 2)];
    return list.sort(() => Math.random() - 0.5);
  }, []);

  // Set up question step
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

    // Automatically speak target word once
    tts.speak(targetWord, {
      onStart: () => {
        setIsPlayingAudio(true);
      },
      onEnd: () => {
        setIsPlayingAudio(false);
        setOptionsUnlocked(true);
      },
    });
  }, [generateShuffledOptions]);

  // When question index changes
  useEffect(() => {
    if (!currentVerb) return;
    setStage('seed');
    setSubStep('past');
    setupStep('past', currentVerb);
  }, [currentIndex, currentVerb, setupStep]);

  // Manual replay button
  const handleReplayAudio = () => {
    if (isAnswerChecking) return;
    const targetWord = subStep === 'past' ? currentVerb.past : currentVerb.pastParticiple;
    sound.play('click');
    setIsPlayingAudio(true);
    tts.speak(targetWord, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => {
        setIsPlayingAudio(false);
        setOptionsUnlocked(true);
      },
    });
  };

  // Option select handler
  const handleSelectOption = (option: string) => {
    if (!optionsUnlocked || isAnswerChecking || eliminatedOptions.includes(option)) return;

    setSelectedOption(option);
    setIsAnswerChecking(true);

    const correctAnswer = subStep === 'past' ? currentVerb.past : currentVerb.pastParticiple;
    const isCorrect = option === correctAnswer;

    if (isCorrect) {
      sound.play('correct');
      // Award 10 points on 1st try, 7 points on 2nd try retry
      const earnedScore = wrongAttempts === 0 ? 10 : 7;
      setScore((prev) => prev + earnedScore);

      if (subStep === 'past') {
        // Grow to sprout!
        setTimeout(() => {
          sound.play('sprout');
          setStage('sprout');
          setFeedback({
            status: 'correct',
            message: wrongAttempts === 0
              ? '정답이에요! 새싹이 쑥 자라났어요 🌱'
              : '다시 도전해서 정답을 맞혔어요! 새싹이 쑥 자라났어요 🌱',
            correctAnswer,
          });
        }, 300);

        // Advance to step 2: past participle
        setTimeout(() => {
          setSubStep('participle');
          setupStep('participle', currentVerb);
        }, 1600);
      } else {
        // Complete plant! Bloom to flower!
        setTimeout(() => {
          sound.play('bloom');
          setStage('flower');
          setFeedback({
            status: 'correct',
            message: wrongAttempts === 0
              ? `완벽해요! ${currentVerb.plantName} 꽃이 활짝 피었어요! 🌸`
              : `훌륭해요! 다시 맞혀서 ${currentVerb.plantName} 꽃을 피웠어요! 🌸`,
            correctAnswer,
          });
        }, 300);

        // Save to garden
        storage.saveMasteredPlant(currentVerb.id);
        setCompletedVerbIds((prev) => [...prev, currentVerb.id]);
        setCorrectAnswersCount((prev) => prev + 1);

        // Advance to next question or finish
        setTimeout(() => {
          if (currentIndex + 1 < questions.length) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            // End of 10 questions
            sound.play('celebrate');
            onFinishGame({
              score: score + earnedScore,
              totalQuestions: questions.length,
              correctCount: correctAnswersCount + 1,
              completedVerbIds: [...completedVerbIds, currentVerb.id],
              wrongVerbIds,
            });
          }
        }, 1900);
      }
    } else {
      // Wrong answer
      sound.play('wrong');

      if (wrongAttempts === 0) {
        // 1st mistake -> Allow retry! (Do not move to next word yet)
        setWrongAttempts(1);
        setEliminatedOptions((prev) => [...prev, option]);

        setFeedback({
          status: 'retry',
          message: '아쉬워요! 한 번 더 기회가 있어요 (남은 기회 1회) 💪 발음을 다시 듣고 골라보세요!',
          correctAnswer,
        });

        // After a moment, unlock options again and replay pronunciation
        setTimeout(() => {
          setSelectedOption(null);
          setIsAnswerChecking(false);
          setIsPlayingAudio(true);
          setOptionsUnlocked(false);

          // Re-speak pronunciation so student can listen carefully
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
        // 2nd mistake -> Two strikes, now move to next word!
        setWrongAttempts(2);
        const updatedWrongs = Array.from(new Set([...wrongVerbIds, currentVerb.id]));
        setWrongVerbIds(updatedWrongs);
        storage.addWrongVerbs([currentVerb.id]);

        setFeedback({
          status: 'wrong',
          message: `두 번 모두 틀렸어요! 정답은 [${correctAnswer}] 이에요. 오답 노트에 저장하고 다음 단어로 넘어가요.`,
          correctAnswer,
        });

        // Advance to next question or finish
        setTimeout(() => {
          if (currentIndex + 1 < questions.length) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            onFinishGame({
              score,
              totalQuestions: questions.length,
              correctCount: correctAnswersCount,
              completedVerbIds,
              wrongVerbIds: updatedWrongs,
            });
          }
        }, 2400);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full p-4 pb-6">
      {/* Top Header Information: Question Index & Stage & Chances */}
      <div className="flex items-center justify-between bg-white rounded-2xl px-3.5 py-2.5 border border-emerald-100 shadow-xs mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
            문제 {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            {subStep === 'past' ? '① 과거형' : '② 과거분사'}
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
            title="단어마다 2번의 기회가 주어져요!"
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

          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{currentVerb.plantName}</span>
          </div>
        </div>
      </div>

      {/* Center Plant & Target Verb Card */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs flex flex-col items-center relative overflow-hidden">
        {/* Textbook Badge */}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            {currentVerb.science.badge}
          </span>
        </div>

        {/* Target Base Verb Display */}
        <div className="mt-4 flex flex-col items-center text-center">
          <span className="text-xs text-slate-400 font-medium tracking-wide">
            현재 동사 (원형)
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {currentVerb.base}
            </h2>
            <button
              onClick={() => {
                sound.play('click');
                tts.speak(currentVerb.base);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="원형 발음 듣기"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50/80 px-2.5 py-0.5 rounded-md mt-1">
            뜻: {currentVerb.meaning}
          </span>
        </div>

        {/* Visual Plant Growth */}
        <div className="my-2">
          <PlantVisual verb={currentVerb} stage={stage} size="md" showStageBadge={true} />
        </div>

        {/* Textbook Science Tip */}
        <p className="text-[11px] text-slate-500 text-center line-clamp-2 px-2 bg-slate-50 border border-slate-100 rounded-xl p-2 w-full mt-1">
          💡 <span className="font-semibold text-slate-700">과학 교과서 팁:</span> {currentVerb.science.fact}
        </p>
      </div>

      {/* Audio Pronunciation Guidance Banner */}
      <div className="my-3 flex items-center justify-between bg-emerald-50/90 border border-emerald-200/80 rounded-2xl px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isPlayingAudio
                ? 'bg-emerald-600 text-white animate-bounce'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-emerald-950">
                {subStep === 'past' ? '과거형 발음' : '과거분사 발음'}
              </p>
              {isPlayingAudio && (
                <span className="flex space-x-0.5 items-center">
                  <span className="w-1 h-2 bg-emerald-600 rounded-full animate-pulse"></span>
                  <span className="w-1 h-3 bg-emerald-600 rounded-full animate-pulse delay-75"></span>
                  <span className="w-1 h-2 bg-emerald-600 rounded-full animate-pulse delay-150"></span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-700">
              {isPlayingAudio
                ? '발음을 듣고 있어요... 곧 선택지가 열려요!'
                : '들은 발음에 해당하는 단어를 골라주세요!'}
            </p>
          </div>
        </div>

        {/* Replay Button */}
        <button
          onClick={handleReplayAudio}
          disabled={isPlayingAudio || isAnswerChecking}
          className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-100/50 active:scale-95 disabled:opacity-50 px-2.5 py-1.5 rounded-xl shadow-2xs transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
          <span>다시 듣기</span>
        </button>
      </div>

      {/* Options List (3 Choices) */}
      <div className="space-y-2.5">
        <div className="text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {subStep === 'past'
              ? '✦ 알맞은 과거형(Past) 철자를 고르세요 ✦'
              : '✦ 알맞은 과거분사(Past Participle) 철자를 고르세요 ✦'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {currentOptions.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isEliminated = eliminatedOptions.includes(option);
            const correctAnswer =
              subStep === 'past' ? currentVerb.past : currentVerb.pastParticiple;
            const isCorrect = option === correctAnswer;

            let buttonStyle = 'bg-white border-slate-200 text-slate-800 hover:border-emerald-400';
            if (isEliminated) {
              buttonStyle = 'bg-slate-100/90 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed line-through';
            } else if (isAnswerChecking) {
              if (isSelected) {
                buttonStyle = isCorrect
                  ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-md ring-2 ring-emerald-300'
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
              <motion.button
                key={`${option}-${idx}`}
                whileTap={optionsUnlocked && !isAnswerChecking && !isEliminated ? { scale: 0.98 } : {}}
                onClick={() => handleSelectOption(option)}
                disabled={!optionsUnlocked || isAnswerChecking || isEliminated}
                className={`w-full py-3.5 px-5 rounded-2xl border-2 text-base font-semibold transition-all duration-200 flex items-center justify-between shadow-xs ${buttonStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center ${
                      isEliminated
                        ? 'bg-slate-200 border-slate-300 text-slate-400'
                        : 'bg-slate-100/70 border-slate-300/60 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-lg tracking-wide">{option}</span>
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
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Answer Feedback Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`mt-3 p-3.5 rounded-2xl border text-center text-xs font-bold flex items-center justify-center gap-2 ${
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
