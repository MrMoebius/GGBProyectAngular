import { Injectable, inject, signal, computed } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { GameSession } from '../models/game-session.interface';

@Injectable({ providedIn: 'root' })
export class GameHistoryService {
  private storage = inject(LocalStorageService);
  private _history = signal<GameSession[]>(this.loadHistory());

  history = computed(() => this._history());

  private loadHistory(): GameSession[] {
    return this.storage.load<GameSession[]>('game_history', []);
  }

  getAll(): GameSession[] {
    return this._history().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getRecent(limit: number): GameSession[] {
    return this.getAll().slice(0, limit);
  }

  addSession(session: Omit<GameSession, 'id'>): void {
    this._history.update(list => {
      const newSession: GameSession = {
        ...session,
        id: Math.max(0, ...list.map(s => s.id)) + 1,
      };
      const updated = [newSession, ...list];
      this.storage.save('game_history', updated);
      return updated;
    });
  }

  getStats(): { totalGames: number; totalHours: number; favoriteGenre: string; uniqueGames: number } {
    const list = this._history();
    const totalMinutes = list.reduce((acc, s) => acc + s.duration, 0);
    const uniqueIds = new Set(list.map(s => s.gameId));
    return {
      totalGames: list.length,
      totalHours: Math.round(totalMinutes / 60),
      favoriteGenre: '-',
      uniqueGames: uniqueIds.size
    };
  }
}
