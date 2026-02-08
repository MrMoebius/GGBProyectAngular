import { Component, inject, computed } from '@angular/core';
import { GameHistoryService } from '../../../core/services/game-history.service';
import { GameSession } from '../../../core/models/game-session.interface';

@Component({
  selector: 'app-game-history-page',
  standalone: true,
  imports: [],
  template: `
    <div class="history-page">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">
          <i class="fa-solid fa-clock-rotate-left"></i>
          Historial de Juegos
        </h1>
        <p class="page-subtitle">Tu registro completo de partidas en Giber Bar</p>
      </div>

      <!-- Stats summary -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon icon-games"><i class="fa-solid fa-dice"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().totalGames }}</span>
            <span class="stat-label">Partidas</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon icon-hours"><i class="fa-solid fa-hourglass-half"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().totalHours }}h</span>
            <span class="stat-label">Tiempo total</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon icon-genre"><i class="fa-solid fa-trophy"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().favoriteGenre }}</span>
            <span class="stat-label">Genero favorito</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon icon-unique"><i class="fa-solid fa-puzzle-piece"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().uniqueGames }}</span>
            <span class="stat-label">Juegos distintos</span>
          </div>
        </div>
      </div>

      <!-- Sessions list -->
      @if (allSessions().length === 0) {
        <div class="empty-state">
          <div class="empty-icon"><i class="fa-solid fa-clock-rotate-left"></i></div>
          <h2 class="empty-title">Sin partidas registradas</h2>
          <p class="empty-text">Cuando juegues en Giber Bar, tus partidas apareceran aqui.</p>
        </div>
      } @else {
        <div class="sessions-table">
          <!-- Table header -->
          <div class="table-header">
            <span class="col-game">Juego</span>
            <span class="col-date">Fecha</span>
            <span class="col-duration">Duracion</span>
            <span class="col-players">Jugadores</span>
          </div>

          <!-- Table body grouped by month -->
          @for (group of groupedSessions(); track group.month) {
            <div class="month-group">
              <div class="month-header">
                <i class="fa-solid fa-calendar"></i>
                {{ group.month }}
              </div>
              @for (session of group.sessions; track session.id) {
                <div class="table-row">
                  <span class="col-game">
                    <span class="game-name">{{ session.gameName }}</span>
                  </span>
                  <span class="col-date">{{ formatDate(session.date) }}</span>
                  <span class="col-duration">{{ formatDuration(session.duration) }}</span>
                  <span class="col-players">
                    <i class="fa-solid fa-users"></i>
                    {{ session.players }}
                  </span>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .history-page {
      max-width: 1000px;
      margin: 0 auto;
    }

    /* ===== Header ===== */
    .page-header {
      margin-bottom: 2rem;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-white, #fff);
      margin: 0;
    }

    .page-title i {
      color: var(--neon-cyan, #00FFD1);
    }

    .page-subtitle {
      font-size: 0.85rem;
      color: var(--text-muted, #94a3b8);
      margin: 0.3rem 0 0;
    }

    /* ===== Stats ===== */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 1.25rem;
      background-color: var(--card-bg, #1E293B);
      border: 1px solid var(--card-border, rgba(255,255,255,0.08));
      border-radius: var(--radius-lg, 16px);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md, 8px);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .icon-games { background-color: rgba(0, 255, 209, 0.12); color: var(--neon-cyan, #00FFD1); }
    .icon-hours { background-color: rgba(255, 107, 107, 0.12); color: var(--primary-coral, #FF6B6B); }
    .icon-genre { background-color: rgba(255, 107, 157, 0.12); color: var(--neon-pink, #FF6B9D); }
    .icon-unique { background-color: rgba(139, 92, 246, 0.12); color: #A78BFA; }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-white, #fff);
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted, #94a3b8);
      margin-top: 0.15rem;
    }

    /* ===== Sessions table ===== */
    .sessions-table {
      background-color: var(--card-bg, #1E293B);
      border: 1px solid var(--card-border, rgba(255,255,255,0.08));
      border-radius: var(--radius-lg, 16px);
      overflow: hidden;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 1rem;
      padding: 0.85rem 1.25rem;
      background-color: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid var(--card-border, rgba(255,255,255,0.08));
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted, #94a3b8);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Month group */
    .month-group {
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }

    .month-group:last-child {
      border-bottom: none;
    }

    .month-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--neon-cyan, #00FFD1);
      background-color: rgba(0, 255, 209, 0.04);
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }

    .month-header i {
      font-size: 0.7rem;
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 1rem;
      padding: 0.75rem 1.25rem;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      transition: background-color 0.15s;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .table-row:hover {
      background-color: rgba(255, 255, 255, 0.03);
    }

    .game-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-white, #fff);
    }

    .col-date {
      font-size: 0.825rem;
      color: var(--text-muted, #94a3b8);
    }

    .col-duration {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--primary-coral, #FF6B6B);
    }

    .col-players {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.825rem;
      color: var(--text-muted, #94a3b8);
    }

    .col-players i {
      font-size: 0.7rem;
      color: var(--neon-cyan, #00FFD1);
    }

    /* ===== Empty state ===== */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 35vh;
      text-align: center;
      padding: 2rem;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: rgba(0, 255, 209, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .empty-icon i {
      font-size: 2rem;
      color: rgba(0, 255, 209, 0.3);
    }

    .empty-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-white, #fff);
      margin: 0 0 0.4rem;
    }

    .empty-text {
      font-size: 0.85rem;
      color: var(--text-muted, #94a3b8);
      margin: 0;
    }

    /* ===== Responsive ===== */
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .table-header {
        display: none;
      }

      .table-row {
        grid-template-columns: 1fr 1fr;
        gap: 0.25rem 1rem;
        padding: 0.85rem 1.25rem;
      }

      .col-game { grid-column: 1 / -1; }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GameHistoryPageComponent {
  private gameHistory = inject(GameHistoryService);

  stats = computed(() => this.gameHistory.getStats());
  allSessions = computed(() => this.gameHistory.getAll());

  groupedSessions = computed(() => {
    const sessions = this.allSessions();
    const groups: Map<string, GameSession[]> = new Map();

    for (const session of sessions) {
      const date = new Date(session.date);
      const monthKey = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
      const capitalized = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);

      if (!groups.has(capitalized)) {
        groups.set(capitalized, []);
      }
      groups.get(capitalized)!.push(session);
    }

    return Array.from(groups.entries()).map(([month, sessions]) => ({ month, sessions }));
  });

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
}
