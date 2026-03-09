import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Juego } from '../../../core/models/juego.interface';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-card card">
      <div class="card-body">
        <h3 class="card-title">{{ juego.nombre }}</h3>
        <div class="tags">
          <span class="tag">{{ juego.genero }}</span>
          <span class="tag">{{ juego.complejidad }}</span>
        </div>
        <div class="meta">
          <i class="fas fa-users"></i>
          <span>{{ juego.minJugadores }} - {{ juego.maxJugadores }} Jugadores</span>
        </div>
        <div class="location">
          Ubicación: {{ juego.ubicacion }}
        </div>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary full-width">
          Ver Detalles
        </button>
      </div>
    </div>
  `,
  styles: [`
    .game-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 1px solid var(--card-border, #E5E7EB);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .game-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .card-body {
      padding: var(--spacing-md);
      flex: 1;
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--secondary-dark);
      margin-bottom: var(--spacing-sm);
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-md);
    }

    .tag {
      background-color: var(--secondary-bg);
      color: var(--text-muted);
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .location {
      margin-top: var(--spacing-sm);
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .card-footer {
      background-color: var(--table-header-bg, #F0F1F3);
      padding: var(--spacing-md);
      border-top: 1px solid var(--card-border, #E5E7EB);
    }

    .full-width {
      width: 100%;
    }
  `]
})
export class GameCardComponent {
  @Input({ required: true }) juego!: Juego;
}
