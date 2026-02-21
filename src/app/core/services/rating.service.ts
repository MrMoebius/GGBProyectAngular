import { Injectable, inject, signal } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { GameRating } from '../models/game-rating.interface';

const SEED_RATINGS: GameRating[] = [];

@Injectable({ providedIn: 'root' })
export class RatingService {
  private storage = inject(LocalStorageService);
  private _ratings = signal<GameRating[]>(this.loadRatings());

  private loadRatings(): GameRating[] {
    const stored = this.storage.load<GameRating[] | null>('ratings', null);
    if (stored === null) {
      this.storage.save('ratings', SEED_RATINGS);
      return SEED_RATINGS;
    }
    return stored;
  }

  getReviews(gameId: number): GameRating[] {
    return this._ratings().filter(r => r.gameId === gameId);
  }

  getAverageRating(gameId: number): { average: number; total: number } {
    const reviews = this.getReviews(gameId);
    if (reviews.length === 0) return { average: 0, total: 0 };
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return { average: Math.round((sum / reviews.length) * 10) / 10, total: reviews.length };
  }

  getUserRating(gameId: number, userId: string): GameRating | undefined {
    return this._ratings().find(r => r.gameId === gameId && r.userId === userId);
  }

  rate(gameId: number, userId: string, userName: string, rating: number, review?: string): void {
    this._ratings.update(list => {
      const existing = list.findIndex(r => r.gameId === gameId && r.userId === userId);
      const newRating: GameRating = {
        id: existing >= 0 ? list[existing].id : Math.max(0, ...list.map(r => r.id)) + 1,
        gameId, userId, userName, rating, review, createdAt: new Date().toISOString()
      };
      const updated = existing >= 0
        ? list.map((r, i) => i === existing ? newRating : r)
        : [...list, newRating];
      this.storage.save('ratings', updated);
      return updated;
    });
  }
}
