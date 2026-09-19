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

  recordGame(score: number, correctCount: number) {
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
    return stats;
  },
};
