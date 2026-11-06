import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { GameView } from './components/GameView';
import { ResultView } from './components/ResultView';
import { GardenView } from './components/GardenView';
import { ReviewView } from './components/ReviewView';
import { Screen, GameResult, VerbItem, GardenPlantRecord } from './types';
import { VERB_LIST } from './data/verbs';
import { storage } from './services/storage';
import { sheetLogger } from './services/sheetLogger';
import { GoogleSheetModal } from './components/GoogleSheetModal';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [garden, setGarden] = useState<Record<string, GardenPlantRecord>>({});
  const [wrongVerbs, setWrongVerbs] = useState<string[]>([]);
  const [gameQuestions, setGameQuestions] = useState<VerbItem[]>([]);
  const [lastGameResult, setLastGameResult] = useState<GameResult | null>(null);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);

  // Sync state from storage
  const reloadUserData = useCallback(() => {
    setGarden(storage.getGarden());
    setWrongVerbs(storage.getWrongVerbs());
  }, []);

  useEffect(() => {
    reloadUserData();
  }, [reloadUserData]);

  // Start new 10-question session
  const handleStartGame = () => {
    // Pick 10 verbs: prefer unmastered ones first so children collect all plants!
    const masteredIds = new Set(Object.keys(storage.getGarden()));
    const unmastered = VERB_LIST.filter((v) => !masteredIds.has(v.id));
    const mastered = VERB_LIST.filter((v) => masteredIds.has(v.id));

    const shuffledUnmastered = [...unmastered].sort(() => Math.random() - 0.5);
    const shuffledMastered = [...mastered].sort(() => Math.random() - 0.5);

    const selected = [...shuffledUnmastered, ...shuffledMastered].slice(0, 10);
    // Shuffle the 10 selected
    selected.sort(() => Math.random() - 0.5);

    setGameQuestions(selected);
    setScreen('game');
  };

  // Game complete handler
  const handleFinishGame = (result: {
    score: number;
    totalQuestions: number;
    correctCount: number;
    completedVerbIds: string[];
    wrongVerbIds: string[];
    tapMetrics?: import('./types').TapMetrics;
  }) => {
    const updatedStats = storage.recordGame(result.score, result.correctCount);
    reloadUserData();
    setLastGameResult(result);
    setScreen('result');

    // Automatically record log to Google Sheet with sentence tap frequency & average
    sheetLogger.logGamePlay({
      playCount: updatedStats.stats.gamesPlayed,
      wrongCount: result.wrongVerbIds.length,
      tapAverage: result.tapMetrics?.averageTaps ?? 0,
      tapFrequency: result.tapMetrics?.frequencySummary ?? '',
      totalTaps: result.tapMetrics?.totalTaps ?? 0,
      sentenceDetails: result.tapMetrics?.sentenceStats
        ? result.tapMetrics.sentenceStats
            .map((s) => `[Q${s.questionNumber}] ${s.verb} (${s.taps}회) - ${s.sentence}`)
            .join(' | ')
        : '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-slate-50 to-emerald-100/40 text-slate-800 flex flex-col font-sans">
      {/* Universal Top Header */}
      <Header
        currentScreen={screen}
        onNavigate={(target) => setScreen(target)}
        gardenCount={Object.keys(garden).length}
        score={lastGameResult?.score}
        onOpenSheetModal={() => setIsSheetModalOpen(true)}
      />

      {/* Main Container - Mobile First & Responsive Frame */}
      <main className="flex-1 flex flex-col w-full max-w-md mx-auto">
        {screen === 'home' && (
          <HomeView
            garden={garden}
            wrongCount={wrongVerbs.length}
            onStartGame={handleStartGame}
            onGoGarden={() => setScreen('garden')}
            onGoReview={() => setScreen('review')}
            onOpenSheetModal={() => setIsSheetModalOpen(true)}
          />
        )}

        {screen === 'game' && gameQuestions.length > 0 && (
          <GameView
            questions={gameQuestions}
            onFinishGame={handleFinishGame}
            onExit={() => setScreen('home')}
          />
        )}

        {screen === 'result' && lastGameResult && (
          <ResultView
            result={lastGameResult}
            onRestart={handleStartGame}
            onGoGarden={() => setScreen('garden')}
            onGoReview={() => setScreen('review')}
            onOpenSheetModal={() => setIsSheetModalOpen(true)}
          />
        )}

        {screen === 'garden' && (
          <GardenView
            garden={garden}
            onBack={() => setScreen('home')}
            onGoReview={() => setScreen('review')}
            wrongCount={wrongVerbs.length}
          />
        )}

        {screen === 'review' && (
          <ReviewView
            wrongVerbIds={wrongVerbs}
            onBack={() => setScreen('home')}
            onRefreshWrongVerbs={reloadUserData}
          />
        )}
      </main>

      {/* Google Sheets Sync & Apps Script Modal */}
      <GoogleSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
      />
    </div>
  );
}
