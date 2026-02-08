import { Injectable, inject, signal, computed } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { GameSession } from '../models/game-session.interface';

const SEED_HISTORY: GameSession[] = [
  { id: 1, gameId: 1, gameName: 'Catan', date: '2026-02-05', duration: 90, players: 4 },
  { id: 2, gameId: 3, gameName: 'Dixit', date: '2026-02-05', duration: 35, players: 6 },
  { id: 3, gameId: 9, gameName: 'Pandemic', date: '2026-02-02', duration: 50, players: 3 },
  { id: 4, gameId: 10, gameName: 'Codigo Secreto', date: '2026-02-02', duration: 25, players: 8 },
  { id: 5, gameId: 4, gameName: 'Virus!', date: '2026-01-30', duration: 20, players: 4 },
  { id: 6, gameId: 15, gameName: 'Terraforming Mars', date: '2026-01-28', duration: 140, players: 3 },
  { id: 7, gameId: 6, gameName: 'Azul', date: '2026-01-25', duration: 40, players: 2 },
  { id: 8, gameId: 5, gameName: 'Dobble', date: '2026-01-25', duration: 15, players: 5 },
  { id: 9, gameId: 16, gameName: 'Wingspan', date: '2026-01-22', duration: 65, players: 3 },
  { id: 10, gameId: 12, gameName: 'King of Tokyo', date: '2026-01-20', duration: 30, players: 4 },
  { id: 11, gameId: 2, gameName: 'Carcassonne', date: '2026-01-18', duration: 35, players: 2 },
  { id: 12, gameId: 14, gameName: 'Splendor', date: '2026-01-15', duration: 30, players: 3 },
  { id: 13, gameId: 7, gameName: '7 Wonders', date: '2026-01-12', duration: 35, players: 5 },
  { id: 14, gameId: 11, gameName: 'Exploding Kittens', date: '2026-01-10', duration: 15, players: 4 },
  { id: 15, gameId: 13, gameName: 'Mysterium', date: '2026-01-08', duration: 45, players: 6 },
];

@Injectable({ providedIn: 'root' })
export class GameHistoryService {
  private storage = inject(LocalStorageService);
  private _history = signal<GameSession[]>(this.loadHistory());

  history = computed(() => this._history());

  private loadHistory(): GameSession[] {
    const stored = this.storage.load<GameSession[] | null>('game_history', null);
    if (stored === null) {
      this.storage.save('game_history', SEED_HISTORY);
      return SEED_HISTORY;
    }
    return stored;
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
      favoriteGenre: 'Estrategia',
      uniqueGames: uniqueIds.size
    };
  }
}
