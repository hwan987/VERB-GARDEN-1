export type Screen = 'home' | 'game' | 'result' | 'garden' | 'review';

export type PlantStage = 'seed' | 'sprout' | 'flower';

export type QuizStep = 'past' | 'participle';

export interface PlantScience {
  grade: string; // e.g., "초등 5학년 1학기 과학"
  topic: string; // e.g., "식물의 한살이와 싹틈"
  fact: string; // 교과서 핵심 과학 지식
  flowerColor: string;
  badge: string;
}

export interface VerbItem {
  id: string;
  base: string; // 원형 (예: grow)
  past: string; // 과거형 (예: grew)
  pastParticiple: string; // 과거분사 (예: grown)
  meaning: string; // 한국어 의미 (예: 자라다, 재배하다)
  pronunciationHint?: string;
  distractorsPast: string[]; // 과거형 오답 2개
  distractorsParticiple: string[]; // 과거분사 오답 2개
  plantName: string; // 식물 이름 (예: 강낭콩)
  plantEnglish: string; // 식물 영문명 (예: Kidney Bean)
  sentencePast?: string; // 초등 3~4학년 수준 과거형 예문
  sentenceParticiple?: string; // 초등 3~4학년 수준 과거분사 예문
  sentenceKorean?: string; // 예문 한국어 해석
  plantType:
    | 'bean'
    | 'balsam'
    | 'morning_glory'
    | 'sunflower'
    | 'dandelion'
    | 'lily'
    | 'lotus'
    | 'cactus'
    | 'maple'
    | 'tomato'
    | 'duckweed'
    | 'pine'
    | 'corn'
    | 'canola'
    | 'cattail'
    | 'rose_of_sharon'
    | 'violet'
    | 'ginkgo'
    | 'clover'
    | 'persimmon';
  science: PlantScience;
}

export interface GardenPlantRecord {
  verbId: string;
  masteredAt: string; // ISO string
  timesMastered: number;
}

export interface SentenceTapStat {
  questionNumber: number;
  verbId: string;
  verb: string;
  sentence: string;
  taps: number; // 문장별 탭 횟수
}

export interface TapMetrics {
  totalTaps: number;
  averageTaps: number; // 각 문장별 평균 탭 수
  frequencySummary: string; // 각 문장별 탭 빈도 요약 문자열
  sentenceStats: SentenceTapStat[];
}

export interface GameResult {
  score: number;
  totalQuestions: number;
  correctCount: number;
  completedVerbIds: string[];
  wrongVerbIds: string[];
  tapMetrics?: TapMetrics;
}

export interface GamePlayLog {
  id: string;
  timestamp: string; // e.g. "2026-10-30 11:25:30"
  play_account: number; // sequential play count (플레이 횟수)
  wrong_account: number; // wrong answers count (틀린 개수)
  tap_average?: number; // 문장별 평균 탭 수
  tap_frequency?: string; // 문장별 탭 빈도
  total_taps?: number; // 전체 탭 수
  score: number;
  correctCount: number;
  totalQuestions: number;
  syncedToGoogleSheet?: boolean;
}
