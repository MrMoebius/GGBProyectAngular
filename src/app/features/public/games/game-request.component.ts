import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { ToastService } from '../../../core/services/toast.service';

interface GameSuggestion {
  id: number;
  name: string;
  reason: string;
  votes: number;
  votedBy: string[];
  createdAt: string;
}

const SEED_SUGGESTIONS: GameSuggestion[] = [
  { id: 1, name: 'Everdell', reason: 'Es un juego precioso de colocacion de trabajadores con tematica de bosque. Seria genial tenerlo aqui!', votes: 12, votedBy: ['user1','user2','user3'], createdAt: '2026-01-20T10:00:00' },
  { id: 2, name: 'Nemesis', reason: 'Juego cooperativo/traidor ambientado en el espacio. Experiencia cinematografica increible.', votes: 8, votedBy: ['user1','user4'], createdAt: '2026-01-25T14:00:00' },
  { id: 3, name: 'Cascadia', reason: 'Ganador del Spiel des Jahres 2022. Sencillo, bonito y rejugable.', votes: 15, votedBy: ['user2','user3','user5'], createdAt: '2026-01-18T09:00:00' },
  { id: 4, name: 'Undaunted: Normandy', reason: 'Un juego de guerra ligero para dos jugadores. Perfecto para las tardes tranquilas.', votes: 5, votedBy: ['user4'], createdAt: '2026-02-01T16:00:00' },
  { id: 5, name: 'Brass: Birmingham', reason: 'Uno de los mejores eurogames. Estrategia pura para los que buscan algo intenso.', votes: 10, votedBy: ['user1','user5'], createdAt: '2026-01-28T11:00:00' },
];

@Component({
  selector: 'app-game-request',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="section">
      <div class="page-header">
        <div>
          <h1 class="section-title">Sugiere un Juego</h1>
          <p class="section-subtitle">Que juego te gustaria encontrar en Giber Games Bar? Sugierelo y vota por los de otros!</p>
        </div>
        <a routerLink="/public/juegos" class="btn btn-ghost">
          <i class="fa-solid fa-arrow-left"></i> Volver al catalogo
        </a>
      </div>

      <!-- Formulario -->
      <div class="card suggest-form">
        <h3 class="form-title"><i class="fa-solid fa-lightbulb"></i> Nueva sugerencia</h3>
        <div class="form-group">
          <label class="form-label">Nombre del juego</label>
          <input
            type="text"
            class="form-input"
            placeholder="Ej: Everdell, Root, Cascadia..."
            [(ngModel)]="newName"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Por que deberiamos tenerlo?</label>
          <textarea
            class="form-input"
            rows="3"
            placeholder="Cuentanos por que este juego seria genial para Giber Games Bar..."
            [(ngModel)]="newReason"
          ></textarea>
        </div>
        <button
          class="btn btn-primary"
          [disabled]="!newName.trim() || !newReason.trim()"
          (click)="submitSuggestion()"
        >
          <i class="fa-solid fa-paper-plane"></i> Enviar sugerencia
        </button>
      </div>

      <!-- Lista -->
      <div class="suggestions-list">
        <h3 class="list-title">
          Sugerencias de la comunidad
          <span class="count-badge">{{ sortedSuggestions().length }}</span>
        </h3>
        @for (suggestion of sortedSuggestions(); track suggestion.id) {
          <div class="suggestion-card card">
            <button
              class="vote-btn"
              [class.voted]="hasVoted(suggestion)"
              (click)="toggleVote(suggestion)"
            >
              <i class="fa-solid fa-chevron-up"></i>
              <span class="vote-count">{{ suggestion.votes }}</span>
            </button>
            <div class="suggestion-info">
              <h4 class="suggestion-name">{{ suggestion.name }}</h4>
              <p class="suggestion-reason">{{ suggestion.reason }}</p>
              <span class="suggestion-date">{{ formatDate(suggestion.createdAt) }}</span>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <i class="fa-solid fa-lightbulb"></i>
            <p>Se el primero en sugerir un juego!</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .suggest-form {
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .form-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-title i { color: #F59E0B; }

    .list-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .count-badge {
      background: var(--primary-coral);
      color: white;
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
    }

    .suggestions-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .suggestion-card {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      align-items: flex-start;
    }

    .vote-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 0.75rem;
      border: 2px solid var(--input-border);
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
      min-width: 56px;
    }

    .vote-btn:hover { border-color: var(--primary-coral); color: var(--primary-coral); }

    .vote-btn.voted {
      border-color: var(--primary-coral);
      background: rgba(255, 127, 80, 0.1);
      color: var(--primary-coral);
    }

    .vote-count { font-size: 1.125rem; font-weight: 700; }

    .suggestion-info { flex: 1; }

    .suggestion-name {
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 0.25rem;
    }

    .suggestion-reason {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 0.5rem;
    }

    .suggestion-date { font-size: 0.75rem; color: var(--text-muted); opacity: 0.7; }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-muted);
    }

    .empty-state i { font-size: 2.5rem; opacity: 0.3; margin-bottom: 0.75rem; display: block; }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; }
    }
  `]
})
export class GameRequestComponent {
  private storage = inject(LocalStorageService);
  private toast = inject(ToastService);

  suggestions = signal<GameSuggestion[]>(this.loadSuggestions());
  newName = '';
  newReason = '';
  private userId = 'current_user';

  sortedSuggestions = computed(() =>
    [...this.suggestions()].sort((a, b) => b.votes - a.votes)
  );

  private loadSuggestions(): GameSuggestion[] {
    const stored = this.storage.load<GameSuggestion[] | null>('game_suggestions', null);
    if (stored === null) {
      this.storage.save('game_suggestions', SEED_SUGGESTIONS);
      return SEED_SUGGESTIONS;
    }
    return stored;
  }

  submitSuggestion(): void {
    if (!this.newName.trim() || !this.newReason.trim()) return;
    const newSuggestion: GameSuggestion = {
      id: Math.max(0, ...this.suggestions().map(s => s.id)) + 1,
      name: this.newName.trim(),
      reason: this.newReason.trim(),
      votes: 1,
      votedBy: [this.userId],
      createdAt: new Date().toISOString()
    };
    this.suggestions.update(list => {
      const updated = [newSuggestion, ...list];
      this.storage.save('game_suggestions', updated);
      return updated;
    });
    this.newName = '';
    this.newReason = '';
    this.toast.success('Sugerencia enviada. Gracias!');
  }

  hasVoted(suggestion: GameSuggestion): boolean {
    return suggestion.votedBy.includes(this.userId);
  }

  toggleVote(suggestion: GameSuggestion): void {
    this.suggestions.update(list => {
      const updated = list.map(s => {
        if (s.id !== suggestion.id) return s;
        const voted = s.votedBy.includes(this.userId);
        return {
          ...s,
          votes: voted ? s.votes - 1 : s.votes + 1,
          votedBy: voted ? s.votedBy.filter(u => u !== this.userId) : [...s.votedBy, this.userId]
        };
      });
      this.storage.save('game_suggestions', updated);
      return updated;
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
