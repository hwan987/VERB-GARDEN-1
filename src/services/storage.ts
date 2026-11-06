import { GardenPlantRecord } from '../types';

const GARDEN_STORAGE_KEY = 'gyv_user_garden';
const WRONG_STORAGE_KEY = 'gyv_wrong_verbs';
const STATS_STORAGE_KEY = 'gyv_user_stats';

export interface UserStats {
  gamesPlayed: number;
  totalCorrectAnswers: number;
  highScore: number;
}

export const storage = {
  getGarden(): Record<string, GardenPlantRecord> {
    try {
      const data = localStorage.getItem(GARDEN_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveMasteredPlant(verbId: string): GardenPlantRecord {
    const garden = this.getGarden();
    const existing = garden[verbId];
    const updated: GardenPlantRecord = {
      verbId,
      masteredAt: new Date().toISOString(),
      timesMastered: existing ? existing.timesMastered + 1 : 1,
    };
    garden[verbId] = updated;
    try {
      localStorage.setItem(GARDEN_STORAGE_KEY, JSON.stringify(garden));
    } catch {
      // ignore
    }
    return updated;
  },

  getWrongVerbs(): string[] {
    try {
      const data = localStorage.getItem(WRONG_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addWrongVerbs(verbIds: string[]) {
    const current = new Set(this.getWrongVerbs());
    verbIds.forEach((id) => current.add(id));
    try {
      localStorage.setItem(WRONG_STORAGE_KEY, JSON.stringify(Array.from(current)));
    } catch {
      // ignore
    }
  },

  removeWrongVerb(verbId: string) {
    const current = this.getWrongVerbs().filter((id) => id !== verbId);
    try {
      localStorage.setItem(WRONG_STORAGE_KEY, JSON.stringify(current));
    } catch {
      // ignore
    }
  },

  getStats(): UserStats {
    try {
      const data = localStorage.getItem(STATS_STORAGE_KEY);
      return data
        ? JSON.parse(data)
        : {
            gamesPlayed: 0,
            totalCorrectAnswers: 0,
            highScore: 0,
          };
    } catch {
      return { gamesPlayed: 0, totalCorrectAnswers: 0, highScore: 0 };
    }
  },

  getPlayLogs(): import('../types').GamePlayLog[] {
    try {
      const data = localStorage.getItem('gyv_play_logs');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  markLogSynced(logId: string) {
    const logs = this.getPlayLogs();
    const target = logs.find((l) => l.id === logId);
    if (target) {
      target.syncedToGoogleSheet = true;
      try {
        localStorage.setItem('gyv_play_logs', JSON.stringify(logs));
      } catch {
        // ignore
      }
    }
  },

  recordGame(
    score: number,
    correctCount: number,
    totalQuestions: number = 10,
    wrongCount: number = 0
  ): { stats: UserStats; log: import('../types').GamePlayLog } {
    const stats = this.getStats();
    stats.gamesPlayed += 1;
    stats.totalCorrectAnswers += correctCount;
    if (score > stats.highScore) {
      stats.highScore = score;
    }
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }

    // Format current timestamp YYYY-MM-DD HH:mm:ss
    const now = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newLog: import('../types').GamePlayLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp,
      play_account: stats.gamesPlayed, // number of times played
      wrong_account: wrongCount, // number of wrong answers in this game
      score,
      correctCount,
      totalQuestions,
      syncedToGoogleSheet: false,
    };

    const currentLogs = this.getPlayLogs();
    currentLogs.unshift(newLog); // latest first
    try {
      localStorage.setItem('gyv_play_logs', JSON.stringify(currentLogs.slice(0, 50)));
    } catch {
      // ignore
    }

    return { stats, log: newLog };
  },
};
