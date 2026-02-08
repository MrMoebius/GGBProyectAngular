import { Injectable, inject, signal } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { GameRating } from '../models/game-rating.interface';

const SEED_RATINGS: GameRating[] = [
  { id: 1, gameId: 1, userId: 'user1', userName: 'Carlos M.', rating: 5, review: 'El clasico de los clasicos. Siempre una partida diferente.', createdAt: '2026-01-15T20:00:00' },
  { id: 2, gameId: 1, userId: 'user2', userName: 'Laura P.', rating: 4, review: 'Muy divertido pero las partidas se alargan un poco.', createdAt: '2026-01-20T18:30:00' },
  { id: 3, gameId: 3, userId: 'user1', userName: 'Carlos M.', rating: 5, review: 'Perfecto para jugar con gente que no suele jugar a juegos de mesa.', createdAt: '2026-01-18T21:00:00' },
  { id: 4, gameId: 4, userId: 'user3', userName: 'Ana R.', rating: 4, review: 'Rapido, divertido y facil de explicar. Ideal para empezar la noche.', createdAt: '2026-01-22T19:00:00' },
  { id: 5, gameId: 9, userId: 'user2', userName: 'Laura P.', rating: 5, review: 'La experiencia cooperativa por excelencia. Siempre tenso hasta el final.', createdAt: '2026-01-25T17:30:00' },
  { id: 6, gameId: 15, userId: 'user4', userName: 'Miguel A.', rating: 5, review: 'Terraforming Mars es una obra maestra. Cada partida es unica.', createdAt: '2026-01-28T22:00:00' },
  { id: 7, gameId: 6, userId: 'user3', userName: 'Ana R.', rating: 4, review: 'Precioso y adictivo. Muy buena mecanica de seleccion.', createdAt: '2026-01-30T20:15:00' },
  { id: 8, gameId: 10, userId: 'user5', userName: 'Pablo J.', rating: 5, review: 'Codigo Secreto siempre triunfa en grupo. Imprescindible.', createdAt: '2026-02-01T21:00:00' },
  { id: 9, gameId: 2, userId: 'user4', userName: 'Miguel A.', rating: 4, review: 'Sencillo pero estrategico. Genial para dos jugadores.', createdAt: '2026-02-02T19:45:00' },
  { id: 10, gameId: 16, userId: 'user1', userName: 'Carlos M.', rating: 5, review: 'Wingspan es arte en forma de juego de mesa. Tematica preciosa.', createdAt: '2026-02-03T18:00:00' },
  { id: 11, gameId: 5, userId: 'user5', userName: 'Pablo J.', rating: 4, review: 'Dobble no falla nunca. Perfecto para calentar motores.', createdAt: '2026-02-04T17:30:00' },
  { id: 12, gameId: 12, userId: 'user2', userName: 'Laura P.', rating: 4, review: 'King of Tokyo divierte a todos. Dados y monstruos, que mas quieres.', createdAt: '2026-02-04T20:00:00' },
];

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
