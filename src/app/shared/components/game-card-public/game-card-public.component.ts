import { Component, inject, input, computed, signal } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JuegoExtended } from '../../../core/models/juego-extended.interface';
import { FavoritesService } from '../../../core/services/favorites.service';

interface GenreConfig {
  gradient: string;
  icon: string;
}

const GENRE_MAP: Record<string, GenreConfig> = {
  ESTRATEGIA:   { gradient: 'linear-gradient(135deg, #1a365d, #2d3748)', icon: 'fa-solid fa-chess' },
  FAMILIAR:     { gradient: 'linear-gradient(135deg, #2d6a4f, #40916c)', icon: 'fa-solid fa-people-group' },
  PARTY:        { gradient: 'linear-gradient(135deg, #7c2d12, #c2410c)', icon: 'fa-solid fa-champagne-glasses' },
  COOPERATIVO:  { gradient: 'linear-gradient(135deg, #312e81, #4338ca)', icon: 'fa-solid fa-handshake' },
  ROL:          { gradient: 'linear-gradient(135deg, #581c87, #7c3aed)', icon: 'fa-solid fa-hat-wizard' },
  CARTAS:       { gradient: 'linear-gradient(135deg, #7f1d1d, #dc2626)', icon: 'fa-solid fa-clone' },
  DADOS:        { gradient: 'linear-gradient(135deg, #78350f, #d97706)', icon: 'fa-solid fa-dice' },
  ACCION:       { gradient: 'linear-gradient(135deg, #991b1b, #ef4444)', icon: 'fa-solid fa-bolt' },
  AVENTURA:     { gradient: 'linear-gradient(135deg, #065f46, #10b981)', icon: 'fa-solid fa-compass' },
  MISTERIO:     { gradient: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', icon: 'fa-solid fa-magnifying-glass' },
  INFANTIL:     { gradient: 'linear-gradient(135deg, #d97706, #fbbf24)', icon: 'fa-solid fa-child' },
  PUZZLE:       { gradient: 'linear-gradient(135deg, #5b21b6, #8b5cf6)', icon: 'fa-solid fa-puzzle-piece' },
  TERROR:       { gradient: 'linear-gradient(135deg, #1f2937, #4b5563)', icon: 'fa-solid fa-skull' },
  SOLITARIO:    { gradient: 'linear-gradient(135deg, #064e3b, #047857)', icon: 'fa-solid fa-user' },
  MAZOS:        { gradient: 'linear-gradient(135deg, #7f1d1d, #b91c1c)', icon: 'fa-solid fa-layer-group' },
  MINIATURAS:   { gradient: 'linear-gradient(135deg, #4a1942, #c026d3)', icon: 'fa-solid fa-chess-knight' },
  ROLESOCULTOS: { gradient: 'linear-gradient(135deg, #3730a3, #6366f1)', icon: 'fa-solid fa-masks-theater' },
  CARRERAS:     { gradient: 'linear-gradient(135deg, #b45309, #f59e0b)', icon: 'fa-solid fa-flag-checkered' },
};

const DEFAULT_GENRE: GenreConfig = {
  gradient: 'linear-gradient(135deg, #374151, #6b7280)',
  icon: 'fa-solid fa-puzzle-piece',
};

@Component({
  selector: 'app-game-card-public',
  standalone: true,
  imports: [NgClass, NgStyle, RouterLink],
  template: `
    <!-- Card wrapper -->
    <div class="game-card">
      <!-- Image / gradient placeholder -->
      <div
        class="card-image"
        [ngStyle]="{ 'background': genreConfig().gradient }"
      >
        @if (game().imagenUrl) {
          <img
            [src]="game().imagenUrl"
            [alt]="game().nombre"
            class="card-img"
            (error)="imgError.set(true)"
            [style.display]="imgError() ? 'none' : 'block'"
          />
        }
        @if (!game().imagenUrl || imgError()) {
          <i class="genre-icon" [ngClass]="genreConfig().icon"></i>
        }

        <!-- Favorite heart overlay -->
        @if (showFavorite()) {
          <button
            class="favorite-btn"
            [ngClass]="{ 'is-favorite': isFav() }"
            (click)="toggleFavorite($event)"
            [attr.aria-label]="isFav() ? 'Quitar de favoritos' : 'Agregar a favoritos'"
          >
            <i [ngClass]="isFav() ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
          </button>
        }
      </div>

      <!-- Content area -->
      <div class="card-content">
        <!-- Title -->
        <h3 class="card-title">{{ game().nombre }}</h3>

        <!-- Genre pills -->
        <div class="genre-pills">
          @for (genre of genres(); track genre) {
            <span class="genre-pill" [ngStyle]="getGenrePillStyle(genre)">
              {{ genre }}
            </span>
          }
        </div>

        <!-- Complexity dots -->
        <div class="complexity-row">
          <span class="complexity-label">Complejidad</span>
          <span class="complexity-dots">
            @for (dot of [1, 2, 3]; track dot) {
              <span
                class="dot"
                [ngClass]="{ 'dot-filled': dot <= complexityLevel() }"
              ></span>
            }
          </span>
        </div>

        <!-- Info row -->
        <div class="info-row">
          <span class="info-item">
            <i class="fa-solid fa-users"></i>
            {{ game().minJugadores }}-{{ game().maxJugadores }}
          </span>
          <span class="info-separator"></span>
          <span class="info-item">
            <i class="fa-solid fa-clock"></i>
            {{ game().duracionMediaMin ?? '?' }} min
          </span>
          <span class="info-separator"></span>
          <span class="info-item">
            <i class="fa-solid fa-globe"></i>
            {{ game().idioma ?? 'ES' }}
          </span>
        </div>

        <!-- Rating -->
        <div class="rating-row">
          <span class="stars">
            @for (star of [1, 2, 3, 4, 5]; track star) {
              <i
                class="fa-star"
                [ngClass]="star <= roundedRating() ? 'fa-solid' : 'fa-regular empty'"
              ></i>
            }
          </span>
          <span class="rating-number">{{ displayRating() }}</span>
          <span class="rating-count">({{ game().totalRatings ?? 0 }})</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <a
          class="details-btn"
          [routerLink]="'/public/juegos/' + game().id"
        >
          Ver detalles
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Host ===== */
    :host {
      display: block;
    }

    /* ===== Card shell ===== */
    .game-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      transition:
        transform 0.3s ease,
        box-shadow 0.3s ease,
        border-color 0.3s ease,
        background-color 0.3s ease;
    }

    .game-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
    }

    :host-context([data-theme="dark"]) .game-card:hover {
      box-shadow:
        0 12px 24px rgba(0, 0, 0, 0.3),
        0 0 15px rgba(0, 255, 209, 0.08),
        0 0 30px rgba(0, 255, 209, 0.04);
      border-color: rgba(0, 255, 209, 0.15);
    }

    /* ===== Image / Gradient placeholder ===== */
    .card-image {
      position: relative;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .card-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .genre-icon {
      font-size: 3rem;
      color: rgba(255, 255, 255, 0.3);
      user-select: none;
      pointer-events: none;
    }

    /* ===== Favorite button ===== */
    .favorite-btn {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      z-index: 2;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      color: rgba(255, 255, 255, 0.8);
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, background-color 0.2s, color 0.2s;
    }

    .favorite-btn:hover {
      transform: scale(1.15);
      background-color: rgba(0, 0, 0, 0.6);
    }

    .favorite-btn.is-favorite {
      color: #EF4444;
    }

    .favorite-btn.is-favorite:hover {
      color: #DC2626;
    }

    /* ===== Content area ===== */
    .card-content {
      flex: 1;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    /* Title */
    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1.3;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Genre pills */
    .genre-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
    }

    .genre-pill {
      display: inline-flex;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.625rem;
      font-weight: 600;
      letter-spacing: 0.025em;
      text-transform: uppercase;
    }

    /* Complexity */
    .complexity-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .complexity-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .complexity-dots {
      display: flex;
      gap: 0.3rem;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--input-border);
      transition: background-color 0.2s;
    }

    .dot-filled {
      background-color: var(--primary-coral);
    }

    :host-context([data-theme="dark"]) .dot-filled {
      box-shadow: 0 0 6px var(--primary-coral);
    }

    /* Info row */
    .info-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .info-item {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .info-item i {
      font-size: 0.75rem;
      color: var(--text-muted);
      opacity: 0.7;
    }

    .info-separator {
      width: 1px;
      height: 14px;
      background-color: var(--card-border);
    }

    /* Rating */
    .rating-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-top: auto;
    }

    .stars {
      display: inline-flex;
      gap: 0.125rem;
      color: #F59E0B;
      font-size: 0.8125rem;
    }

    .stars .fa-star.empty {
      color: var(--input-border);
    }

    :host-context([data-theme="dark"]) .stars {
      color: #FBBF24;
    }

    .rating-number {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-main);
      margin-left: 0.125rem;
    }

    .rating-count {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    /* ===== Footer ===== */
    .card-footer {
      padding: 0.75rem 1.25rem;
      border-top: 1px solid var(--card-border);
      transition: border-color 0.3s;
    }

    .details-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--primary-coral);
      background-color: transparent;
      border: 2px solid var(--primary-coral);
      text-decoration: none;
      cursor: pointer;
      transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
    }

    .details-btn:hover {
      background-color: var(--primary-coral);
      color: var(--text-white);
    }

    :host-context([data-theme="dark"]) .details-btn:hover {
      box-shadow: 0 0 12px rgba(255, 107, 157, 0.3);
    }

    .details-btn i {
      font-size: 0.75rem;
      transition: transform 0.2s;
    }

    .details-btn:hover i {
      transform: translateX(3px);
    }
  `]
})
export class GameCardPublicComponent {
  // ---------- DI ----------
  private readonly favoritesService = inject(FavoritesService);

  // ---------- Inputs ----------
  game = input.required<JuegoExtended>();
  showFavorite = input<boolean>(true);

  // ---------- State ----------
  imgError = signal(false);

  // ---------- Computed ----------
  /** Separa genero multi-valor en array */
  genres = computed<string[]>(() => {
    const raw = this.game().genero ?? '';
    return raw.split(',').map(g => g.trim()).filter(g => g.length > 0);
  });

  /** Usa el primer genero para gradient/icon */
  genreConfig = computed<GenreConfig>(() => {
    const first = this.genres()[0]?.toUpperCase() ?? '';
    return GENRE_MAP[first] ?? DEFAULT_GENRE;
  });

  isFav = computed(() => this.favoritesService.isFavorite(this.game().id));

  complexityLevel = computed<number>(() => {
    const c = this.game().complejidad?.toUpperCase() ?? '';
    if (c === 'BAJA' || c === 'VERDE') return 1;
    if (c === 'MEDIA' || c === 'AMARILLO') return 2;
    if (c === 'ALTA' || c === 'ROJO') return 3;
    return 0;
  });

  roundedRating = computed(() => Math.round(this.game().rating ?? 0));

  displayRating = computed(() => {
    const r = this.game().rating;
    return r != null ? r.toFixed(1) : '0.0';
  });

  // ---------- Methods ----------
  getGenrePillStyle(genre: string): Record<string, string> {
    const cfg = GENRE_MAP[genre.toUpperCase()] ?? DEFAULT_GENRE;
    const match = cfg.gradient.match(/#[0-9a-fA-F]{6}/g);
    const bgColor = match && match.length >= 2 ? match[1] : '#6b7280';
    return {
      'background-color': bgColor + '22',
      'color': bgColor,
      'border': `1px solid ${bgColor}44`,
    };
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggle(this.game().id);
  }
}
