import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { JuegoExtended } from '../models/juego-extended.interface';
import { MockJuegosService } from './mock-juegos.service';

export interface QuizAnswers {
  playerCount?: number;
  timeAvailable?: 'SHORT' | 'MEDIUM' | 'LONG' | 'UNLIMITED';
  experience?: 'NOVATO' | 'INTERMEDIO' | 'EXPERTO';
  mood?: 'COMPETIR' | 'COOPERAR' | 'REIR' | 'PENSAR';
  genres?: string[];
}

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private mockJuegos = inject(MockJuegosService);

  getDailyPick(): Observable<JuegoExtended> {
    return this.mockJuegos.getAll().pipe(
      map(games => {
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        const index = seed % games.length;
        return games[index];
      })
    );
  }

  getDailyRecommendations(count: number): Observable<JuegoExtended[]> {
    return this.mockJuegos.getAll().pipe(
      map(games => {
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        const shuffled = [...games].sort((a, b) => {
          const hashA = ((seed * (a.id + 1) * 2654435761) >>> 0) % 1000;
          const hashB = ((seed * (b.id + 1) * 2654435761) >>> 0) % 1000;
          return hashA - hashB;
        });
        return shuffled.slice(0, count);
      })
    );
  }

  getPersonalized(gameIds: number[], count: number = 5): Observable<JuegoExtended[]> {
    return this.mockJuegos.getAll().pipe(
      map(games => {
        const playedGames = games.filter(g => gameIds.includes(g.id));
        const playedGenres = playedGames.map(g => g.genero);
        const genreCount: Record<string, number> = {};
        playedGenres.forEach(g => genreCount[g] = (genreCount[g] || 0) + 1);

        const notPlayed = games.filter(g => !gameIds.includes(g.id));
        const scored = notPlayed.map(game => {
          let score = (game.rating || 4) * 10;
          if (genreCount[game.genero]) score += genreCount[game.genero] * 20;
          return { game, score };
        });
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, count).map(s => s.game);
      })
    );
  }

  getQuizResults(answers: QuizAnswers): Observable<JuegoExtended[]> {
    return this.mockJuegos.getAll().pipe(
      map(games => {
        const scored = games.map(game => {
          let score = 0;

          if (answers.playerCount) {
            if (game.minJugadores <= answers.playerCount && game.maxJugadores >= answers.playerCount) {
              score += 30;
            } else if (Math.abs(game.minJugadores - answers.playerCount) <= 1 || Math.abs(game.maxJugadores - answers.playerCount) <= 1) {
              score += 10;
            }
          }

          if (answers.timeAvailable && game.duracionMediaMin) {
            const dur = game.duracionMediaMin;
            switch (answers.timeAvailable) {
              case 'SHORT': score += dur <= 30 ? 25 : dur <= 45 ? 10 : 0; break;
              case 'MEDIUM': score += dur >= 30 && dur <= 60 ? 25 : dur <= 90 ? 10 : 0; break;
              case 'LONG': score += dur >= 60 && dur <= 120 ? 25 : dur >= 45 ? 10 : 0; break;
              case 'UNLIMITED': score += 25; break;
            }
          }

          if (answers.experience) {
            const comp = game.complejidad;
            switch (answers.experience) {
              case 'NOVATO': score += comp === 'BAJA' ? 25 : comp === 'MEDIA' ? 10 : 0; break;
              case 'INTERMEDIO': score += comp === 'MEDIA' ? 25 : 10; break;
              case 'EXPERTO': score += comp === 'ALTA' ? 25 : comp === 'MEDIA' ? 15 : 5; break;
            }
          }

          if (answers.mood) {
            switch (answers.mood) {
              case 'COMPETIR':
                score += ['ESTRATEGIA', 'ABSTRACTO'].includes(game.genero) ? 20 : 0;
                break;
              case 'COOPERAR':
                score += game.genero === 'COOPERATIVO' ? 25 : 0;
                break;
              case 'REIR':
                score += ['PARTY', 'CARTAS', 'DADOS'].includes(game.genero) ? 20 : 0;
                break;
              case 'PENSAR':
                score += ['ESTRATEGIA', 'DEDUCCION', 'ABSTRACTO'].includes(game.genero) ? 20 : 0;
                break;
            }
          }

          if (answers.genres && answers.genres.length > 0) {
            if (answers.genres.includes(game.genero)) score += 15;
          }

          score += (game.rating || 4) * 3;

          return { game, score };
        });

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, 5).map(s => s.game);
      })
    );
  }
}
