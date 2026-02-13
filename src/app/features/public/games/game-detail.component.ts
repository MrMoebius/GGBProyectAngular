import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { JuegoService } from '../../../core/services/juego.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { RatingService } from '../../../core/services/rating.service';
import { AuthService } from '../../../core/services/auth.service';
import { JuegoExtended } from '../../../core/models/juego-extended.interface';
import { GameRating } from '../../../core/models/game-rating.interface';
import { GameCardPublicComponent } from '../../../shared/components/game-card-public/game-card-public.component';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

interface GenreConfig {
  gradient: string;
  colors: [string, string];
  icon: string;
}

const GENRE_MAP: Record<string, GenreConfig> = {
  ESTRATEGIA:   { gradient: 'linear-gradient(135deg, #1a365d, #2d3748)', colors: ['#1a365d', '#2d3748'], icon: 'fa-solid fa-chess' },
  FAMILIAR:     { gradient: 'linear-gradient(135deg, #2d6a4f, #40916c)', colors: ['#2d6a4f', '#40916c'], icon: 'fa-solid fa-people-group' },
  PARTY:        { gradient: 'linear-gradient(135deg, #7c2d12, #c2410c)', colors: ['#7c2d12', '#c2410c'], icon: 'fa-solid fa-champagne-glasses' },
  COOPERATIVO:  { gradient: 'linear-gradient(135deg, #312e81, #4338ca)', colors: ['#312e81', '#4338ca'], icon: 'fa-solid fa-handshake' },
  ROL:          { gradient: 'linear-gradient(135deg, #581c87, #7c3aed)', colors: ['#581c87', '#7c3aed'], icon: 'fa-solid fa-hat-wizard' },
  CARTAS:       { gradient: 'linear-gradient(135deg, #7f1d1d, #dc2626)', colors: ['#7f1d1d', '#dc2626'], icon: 'fa-solid fa-clone' },
  DADOS:        { gradient: 'linear-gradient(135deg, #78350f, #d97706)', colors: ['#78350f', '#d97706'], icon: 'fa-solid fa-dice' },
  ACCION:       { gradient: 'linear-gradient(135deg, #991b1b, #ef4444)', colors: ['#991b1b', '#ef4444'], icon: 'fa-solid fa-bolt' },
  AVENTURA:     { gradient: 'linear-gradient(135deg, #065f46, #10b981)', colors: ['#065f46', '#10b981'], icon: 'fa-solid fa-compass' },
  MISTERIO:     { gradient: 'linear-gradient(135deg, #1e3a5f, #3b82f6)', colors: ['#1e3a5f', '#3b82f6'], icon: 'fa-solid fa-magnifying-glass' },
  INFANTIL:     { gradient: 'linear-gradient(135deg, #d97706, #fbbf24)', colors: ['#d97706', '#fbbf24'], icon: 'fa-solid fa-child' },
  PUZZLE:       { gradient: 'linear-gradient(135deg, #5b21b6, #8b5cf6)', colors: ['#5b21b6', '#8b5cf6'], icon: 'fa-solid fa-puzzle-piece' },
  TERROR:       { gradient: 'linear-gradient(135deg, #1f2937, #4b5563)', colors: ['#1f2937', '#4b5563'], icon: 'fa-solid fa-skull' },
  SOLITARIO:    { gradient: 'linear-gradient(135deg, #064e3b, #047857)', colors: ['#064e3b', '#047857'], icon: 'fa-solid fa-user' },
  MAZOS:        { gradient: 'linear-gradient(135deg, #7f1d1d, #b91c1c)', colors: ['#7f1d1d', '#b91c1c'], icon: 'fa-solid fa-layer-group' },
  MINIATURAS:   { gradient: 'linear-gradient(135deg, #4a1942, #c026d3)', colors: ['#4a1942', '#c026d3'], icon: 'fa-solid fa-chess-knight' },
  ROLESOCULTOS: { gradient: 'linear-gradient(135deg, #3730a3, #6366f1)', colors: ['#3730a3', '#6366f1'], icon: 'fa-solid fa-masks-theater' },
  CARRERAS:     { gradient: 'linear-gradient(135deg, #b45309, #f59e0b)', colors: ['#b45309', '#f59e0b'], icon: 'fa-solid fa-flag-checkered' },
};

const DEFAULT_GENRE: GenreConfig = {
  gradient: 'linear-gradient(135deg, #374151, #6b7280)',
  colors: ['#374151', '#6b7280'],
  icon: 'fa-solid fa-puzzle-piece',
};

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, GameCardPublicComponent, BeerLoaderComponent],
  template: `
    @if (game()) {
      <div class="game-detail-page">

        <!-- ============== HERO AREA ============== -->
        <section class="hero" [ngStyle]="{ 'background': genreConfig().gradient }">
          <div class="hero-overlay"></div>
          @if (game()!.imagenUrl) {
            <img
              [src]="game()!.imagenUrl"
              [alt]="game()!.nombre"
              class="hero-game-img"
            />
          } @else {
            <div class="hero-icon">
              <i [ngClass]="genreConfig().icon"></i>
            </div>
          }
          <div class="hero-content">
            <div class="hero-top-row">
              @for (genre of genres(); track genre) {
                <span class="genre-pill" [ngStyle]="genrePillStyle()">
                  {{ genre }}
                </span>
              }
              <button
                class="hero-favorite-btn"
                [class.is-favorite]="isFav()"
                (click)="toggleFavorite()"
                [attr.aria-label]="isFav() ? 'Quitar de favoritos' : 'Agregar a favoritos'"
              >
                <i [ngClass]="isFav() ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
              </button>
            </div>
            <h1 class="hero-title">{{ game()!.nombre }}</h1>
          </div>
        </section>

        <!-- ============== STATS BAR ============== -->
        <section class="stats-bar">
          <div class="stat-item">
            <i class="fa-solid fa-users stat-icon"></i>
            <span class="stat-value">{{ game()!.minJugadores }}-{{ game()!.maxJugadores }} jugadores</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <i class="fa-solid fa-clock stat-icon"></i>
            <span class="stat-value">{{ game()!.duracionMediaMin ?? '?' }} min</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <i class="fa-solid fa-signal stat-icon"></i>
            <span class="stat-value">
              @for (dot of [1, 2, 3]; track dot) {
                <span
                  class="complexity-dot"
                  [class.dot-filled]="dot <= complexityLevel()"
                ></span>
              }
              <span class="complexity-label">{{ game()!.complejidad }}</span>
            </span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <i class="fa-solid fa-globe stat-icon"></i>
            <span class="stat-value">{{ game()!.idioma ?? 'ES' }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <i class="fa-solid fa-child stat-icon"></i>
            <span class="stat-value">Edad: {{ game()!.edadMinima ?? '?' }}+</span>
          </div>
          @if (game()!.recomendadoDosJugadores) {
            <div class="stat-divider"></div>
            <div class="stat-item stat-highlight">
              <i class="fa-solid fa-check-circle stat-icon"></i>
              <span class="stat-value">Apto para 2</span>
            </div>
          }
        </section>

        <!-- ============== DESCRIPTION ============== -->
        <section class="description-section">
          <h2 class="section-title">
            <i class="fa-solid fa-book-open"></i>
            Descripcion
          </h2>
          <p class="description-text">{{ game()!.descripcion }}</p>

          @if (game()!.tags && game()!.tags!.length > 0) {
            <div class="tags-row">
              @for (tag of game()!.tags; track tag) {
                <span class="tag-chip">{{ tag }}</span>
              }
            </div>
          }
        </section>

        <!-- ============== ACTION BUTTONS ============== -->
        <section class="action-buttons">
          <a class="btn btn-primary btn-lg" routerLink="/public/reservas">
            <i class="fa-solid fa-calendar-check"></i>
            Reservar para jugar
          </a>
          <button
            class="btn btn-outline-favorite btn-lg"
            [class.is-favorite]="isFav()"
            (click)="toggleFavorite()"
          >
            <i [ngClass]="isFav() ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
            {{ isFav() ? 'Quitar de favoritos' : 'Anadir a favoritos' }}
          </button>
        </section>

        <!-- ============== RATINGS SECTION ============== -->
        <section class="ratings-section">
          <h2 class="section-title">
            <i class="fa-solid fa-star"></i>
            Valoraciones
          </h2>

          <!-- Average rating display -->
          <div class="rating-summary">
            <div class="rating-big-number">
              {{ ratingInfo().average > 0 ? ratingInfo().average.toFixed(1) : '--' }}
            </div>
            <div class="rating-summary-details">
              <div class="rating-stars-large">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <i
                    class="fa-star"
                    [ngClass]="star <= Math.round(ratingInfo().average) ? 'fa-solid' : 'fa-regular'"
                  ></i>
                }
              </div>
              <span class="rating-total-text">{{ ratingInfo().total }} valoraciones</span>
            </div>
          </div>

          <!-- Review form -->
          <div class="review-form-container">
            <h3 class="review-form-title">Escribir resena</h3>
            <div class="star-selector">
              <span class="star-selector-label">Tu puntuacion:</span>
              <div class="star-selector-stars">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <button
                    class="star-btn"
                    [class.star-active]="star <= newRating()"
                    [class.star-hover]="star <= hoverRating() && hoverRating() > 0"
                    (click)="setRating(star)"
                    (mouseenter)="hoverRating.set(star)"
                    (mouseleave)="hoverRating.set(0)"
                    [attr.aria-label]="star + ' estrellas'"
                  >
                    <i
                      class="fa-star"
                      [ngClass]="(hoverRating() > 0 ? star <= hoverRating() : star <= newRating()) ? 'fa-solid' : 'fa-regular'"
                    ></i>
                  </button>
                }
              </div>
            </div>
            <textarea
              class="review-textarea"
              [(ngModel)]="newReviewText"
              placeholder="Escribe tu resena aqui... (opcional)"
              rows="4"
            ></textarea>
            <button
              class="btn btn-primary btn-submit-review"
              [disabled]="newRating() === 0"
              (click)="submitReview()"
            >
              <i class="fa-solid fa-paper-plane"></i>
              Enviar resena
            </button>
            @if (reviewSubmitted()) {
              <div class="review-success-msg">
                <i class="fa-solid fa-check-circle"></i>
                Tu resena ha sido enviada correctamente.
              </div>
            }
          </div>
        </section>

        <!-- ============== REVIEWS LIST ============== -->
        @if (reviews().length > 0) {
          <section class="reviews-list-section">
            <h2 class="section-title">
              <i class="fa-solid fa-comments"></i>
              Resenas ({{ reviews().length }})
            </h2>
            <div class="reviews-list">
              @for (review of reviews(); track review.id) {
                <div class="review-card">
                  <div class="review-header">
                    <div class="review-user">
                      <div class="review-avatar">
                        {{ review.userName.charAt(0).toUpperCase() }}
                      </div>
                      <div class="review-user-info">
                        <span class="review-user-name">{{ review.userName }}</span>
                        <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                      </div>
                    </div>
                    <div class="review-stars">
                      @for (star of [1, 2, 3, 4, 5]; track star) {
                        <i
                          class="fa-star review-star-icon"
                          [ngClass]="star <= review.rating ? 'fa-solid' : 'fa-regular'"
                        ></i>
                      }
                    </div>
                  </div>
                  @if (review.review) {
                    <p class="review-text">{{ review.review }}</p>
                  }
                </div>
              }
            </div>
          </section>
        }

        <!-- ============== RELATED GAMES ============== -->
        @if (relatedGames().length > 0) {
          <section class="related-section">
            <h2 class="section-title">
              <i class="fa-solid fa-puzzle-piece"></i>
              Juegos similares
            </h2>
            <div class="related-grid">
              @for (related of relatedGames(); track related.id) {
                <app-game-card-public [game]="related" />
              }
            </div>
          </section>
        }

      </div>
    } @else {
      <app-beer-loader [isLoading]="!game()" />
    }
  `,
  styles: [`
    /* ===== CSS Variables / Host ===== */
    :host {
      display: block;
    }

    .game-detail-page {
      max-width: 960px;
      margin: 0 auto;
      padding: 0 1rem 3rem;
    }

    /* ===== HERO AREA ===== */
    .hero {
      position: relative;
      border-radius: var(--radius-lg, 12px);
      overflow: hidden;
      padding: 3rem 2.5rem 2.5rem;
      margin-bottom: 0;
      display: flex;
      flex-direction: column;
      min-height: 280px;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%);
      pointer-events: none;
    }

    .hero-game-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.35;
    }

    .hero-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 8rem;
      color: rgba(255, 255, 255, 0.08);
      pointer-events: none;
      user-select: none;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: auto;
    }

    .hero-top-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .hero-top-row .hero-favorite-btn {
      margin-left: auto;
    }

    .genre-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .pill-icon {
      font-size: 0.7rem;
    }

    .hero-favorite-btn {
      width: 44px;
      height: 44px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      color: rgba(255, 255, 255, 0.85);
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, background-color 0.2s, color 0.2s, border-color 0.2s;
      flex-shrink: 0;
    }

    .hero-favorite-btn:hover {
      transform: scale(1.1);
      background: rgba(0, 0, 0, 0.5);
      border-color: rgba(255, 255, 255, 0.6);
    }

    .hero-favorite-btn.is-favorite {
      color: #EF4444;
      border-color: #EF4444;
    }

    .hero-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      line-height: 1.15;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .hero-editorial {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.8);
      font-size: 1rem;
      font-weight: 500;
      margin: 0;
    }

    .hero-editorial i {
      font-size: 0.85rem;
      opacity: 0.7;
    }

    /* ===== STATS BAR ===== */
    .stats-bar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: var(--card-bg, #ffffff);
      border: 1px solid var(--card-border, #e5e7eb);
      border-radius: var(--radius-lg, 12px);
      margin-top: -1rem;
      margin-left: 1rem;
      margin-right: 1rem;
      position: relative;
      z-index: 2;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-muted, #6b7280);
    }

    .stat-icon {
      font-size: 1rem;
      color: var(--primary-coral, #ff6b9d);
      flex-shrink: 0;
    }

    .stat-value {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-weight: 600;
      color: var(--text-main, #1f2937);
    }

    .stat-highlight .stat-icon {
      color: #10b981;
    }

    .stat-highlight .stat-value {
      color: #10b981;
    }

    .stat-divider {
      width: 1px;
      height: 24px;
      background: var(--card-border, #e5e7eb);
      flex-shrink: 0;
    }

    .complexity-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--input-border, #d1d5db);
      transition: background-color 0.2s;
    }

    .complexity-dot.dot-filled {
      background: var(--primary-coral, #ff6b9d);
    }

    :host-context([data-theme="dark"]) .complexity-dot.dot-filled {
      box-shadow: 0 0 6px var(--primary-coral, #ff6b9d);
    }

    .complexity-label {
      font-size: 0.75rem;
      color: var(--text-muted, #6b7280);
      margin-left: 0.2rem;
    }

    /* ===== SECTION SHARED ===== */
    .section-title {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-main, #1f2937);
      margin: 0 0 1.25rem;
    }

    .section-title i {
      color: var(--primary-coral, #ff6b9d);
      font-size: 1.1rem;
    }

    /* ===== DESCRIPTION ===== */
    .description-section {
      margin-top: 2rem;
      padding: 2rem;
      background: var(--card-bg, #ffffff);
      border: 1px solid var(--card-border, #e5e7eb);
      border-radius: var(--radius-lg, 12px);
    }

    .description-text {
      font-size: 1.05rem;
      line-height: 1.75;
      color: var(--text-main, #1f2937);
      margin: 0;
    }

    .tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1.25rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--card-border, #e5e7eb);
    }

    .tag-chip {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      background: var(--bg-secondary, #f3f4f6);
      color: var(--text-muted, #6b7280);
      border: 1px solid var(--card-border, #e5e7eb);
      text-transform: lowercase;
    }

    :host-context([data-theme="dark"]) .tag-chip {
      background: rgba(255, 255, 255, 0.06);
    }

    /* ===== ACTION BUTTONS ===== */
    .action-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-md, 8px);
      font-size: 0.95rem;
      font-weight: 600;
      border: 2px solid transparent;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-lg {
      padding: 0.9rem 2rem;
      font-size: 1.05rem;
    }

    .btn-primary {
      background: var(--primary-coral, #ff6b9d);
      color: #ffffff;
      border-color: var(--primary-coral, #ff6b9d);
    }

    .btn-primary:hover {
      background: var(--primary-coral-dark, #e5558a);
      border-color: var(--primary-coral-dark, #e5558a);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 107, 157, 0.35);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .btn-outline-favorite {
      background: transparent;
      color: var(--text-main, #1f2937);
      border-color: var(--card-border, #e5e7eb);
    }

    .btn-outline-favorite:hover {
      border-color: #EF4444;
      color: #EF4444;
      background: rgba(239, 68, 68, 0.06);
    }

    .btn-outline-favorite.is-favorite {
      border-color: #EF4444;
      color: #EF4444;
      background: rgba(239, 68, 68, 0.06);
    }

    .btn-outline-favorite.is-favorite:hover {
      background: rgba(239, 68, 68, 0.12);
    }

    /* ===== RATINGS SECTION ===== */
    .ratings-section {
      margin-top: 2.5rem;
      padding: 2rem;
      background: var(--card-bg, #ffffff);
      border: 1px solid var(--card-border, #e5e7eb);
      border-radius: var(--radius-lg, 12px);
    }

    .rating-summary {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--card-border, #e5e7eb);
    }

    .rating-big-number {
      font-size: 3.5rem;
      font-weight: 800;
      color: var(--text-main, #1f2937);
      line-height: 1;
      min-width: 80px;
      text-align: center;
    }

    .rating-summary-details {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .rating-stars-large {
      display: flex;
      gap: 0.25rem;
      font-size: 1.5rem;
      color: #F59E0B;
    }

    .rating-stars-large .fa-star.fa-regular {
      color: var(--input-border, #d1d5db);
    }

    :host-context([data-theme="dark"]) .rating-stars-large {
      color: #FBBF24;
    }

    .rating-total-text {
      font-size: 0.9rem;
      color: var(--text-muted, #6b7280);
      font-weight: 500;
    }

    /* ===== REVIEW FORM ===== */
    .review-form-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .review-form-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-main, #1f2937);
      margin: 0;
    }

    .star-selector {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .star-selector-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-muted, #6b7280);
    }

    .star-selector-stars {
      display: flex;
      gap: 0.25rem;
    }

    .star-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.6rem;
      color: var(--input-border, #d1d5db);
      padding: 0.15rem;
      transition: transform 0.15s, color 0.15s;
      line-height: 1;
    }

    .star-btn:hover {
      transform: scale(1.2);
    }

    .star-btn.star-active,
    .star-btn.star-hover {
      color: #F59E0B;
    }

    :host-context([data-theme="dark"]) .star-btn.star-active,
    :host-context([data-theme="dark"]) .star-btn.star-hover {
      color: #FBBF24;
    }

    .review-textarea {
      width: 100%;
      padding: 0.85rem 1rem;
      border: 1px solid var(--input-border, #d1d5db);
      border-radius: var(--radius-md, 8px);
      background: var(--input-bg, #ffffff);
      color: var(--text-main, #1f2937);
      font-family: inherit;
      font-size: 0.95rem;
      line-height: 1.6;
      resize: vertical;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }

    .review-textarea:focus {
      outline: none;
      border-color: var(--primary-coral, #ff6b9d);
      box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.15);
    }

    .review-textarea::placeholder {
      color: var(--text-muted, #9ca3af);
    }

    .btn-submit-review {
      align-self: flex-start;
    }

    .review-success-msg {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: var(--radius-md, 8px);
      color: #059669;
      font-size: 0.875rem;
      font-weight: 600;
    }

    :host-context([data-theme="dark"]) .review-success-msg {
      background: rgba(16, 185, 129, 0.08);
      color: #34d399;
    }

    /* ===== REVIEWS LIST ===== */
    .reviews-list-section {
      margin-top: 2.5rem;
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .review-card {
      padding: 1.25rem 1.5rem;
      background: var(--card-bg, #ffffff);
      border: 1px solid var(--card-border, #e5e7eb);
      border-radius: var(--radius-lg, 12px);
      transition: box-shadow 0.2s;
    }

    .review-card:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .review-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .review-user {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .review-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary-coral, #ff6b9d);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .review-user-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .review-user-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-main, #1f2937);
    }

    .review-date {
      font-size: 0.75rem;
      color: var(--text-muted, #9ca3af);
    }

    .review-stars {
      display: flex;
      gap: 0.15rem;
      font-size: 0.875rem;
      color: #F59E0B;
    }

    .review-star-icon.fa-regular {
      color: var(--input-border, #d1d5db);
    }

    :host-context([data-theme="dark"]) .review-stars {
      color: #FBBF24;
    }

    .review-text {
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--text-main, #1f2937);
      margin: 0;
    }

    /* ===== RELATED GAMES ===== */
    .related-section {
      margin-top: 3rem;
    }

    .related-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    /* ===== LOADING ===== */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      gap: 1rem;
      color: var(--text-muted, #6b7280);
    }

    .loading-container i {
      font-size: 2.5rem;
      color: var(--primary-coral, #ff6b9d);
    }

    .loading-container p {
      font-size: 1.1rem;
      font-weight: 500;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      .hero {
        padding: 2rem 1.5rem 2rem;
        min-height: 220px;
      }

      .hero-title {
        font-size: 1.75rem;
      }

      .hero-icon {
        font-size: 5rem;
      }

      .stats-bar {
        margin-left: 0;
        margin-right: 0;
        margin-top: 1rem;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
      }

      .stat-divider {
        display: none;
      }

      .stat-item {
        flex: 0 0 auto;
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn-lg {
        width: 100%;
        justify-content: center;
      }

      .rating-summary {
        flex-direction: column;
        text-align: center;
      }

      .rating-summary-details {
        align-items: center;
      }

      .review-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .related-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .star-selector {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    @media (max-width: 480px) {
      .game-detail-page {
        padding: 0 0.5rem 2rem;
      }

      .hero {
        border-radius: var(--radius-md, 8px);
        padding: 1.5rem 1.25rem 1.5rem;
        min-height: 180px;
      }

      .hero-title {
        font-size: 1.5rem;
      }

      .description-section,
      .ratings-section {
        padding: 1.25rem;
      }

      .related-grid {
        grid-template-columns: 1fr;
      }

      .rating-big-number {
        font-size: 2.5rem;
      }
    }
  `]
})
export class GameDetailComponent implements OnInit {
  // ---------- DI ----------
  private readonly route = inject(ActivatedRoute);
  private readonly juegosService = inject(JuegoService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly ratingService = inject(RatingService);
  private readonly authService = inject(AuthService);

  // ---------- State ----------
  game = signal<JuegoExtended | null>(null);
  relatedGames = signal<JuegoExtended[]>([]);
  reviews = signal<GameRating[]>([]);
  newRating = signal<number>(0);
  hoverRating = signal<number>(0);
  newReviewText = '';
  reviewSubmitted = signal<boolean>(false);

  // Expose Math to template
  Math = Math;

  // ---------- Computed ----------
  genres = computed<string[]>(() => {
    const raw = this.game()?.genero ?? '';
    return raw.split(',').map(g => g.trim()).filter(g => g.length > 0);
  });

  genreConfig = computed<GenreConfig>(() => {
    const first = this.genres()[0]?.toUpperCase() ?? '';
    return GENRE_MAP[first] ?? DEFAULT_GENRE;
  });

  isFav = computed(() => {
    const g = this.game();
    return g ? this.favoritesService.isFavorite(g.id) : false;
  });

  complexityLevel = computed<number>(() => {
    const c = this.game()?.complejidad?.toUpperCase() ?? '';
    if (c === 'BAJA' || c === 'VERDE') return 1;
    if (c === 'MEDIA' || c === 'AMARILLO') return 2;
    if (c === 'ALTA' || c === 'ROJO') return 3;
    return 0;
  });

  ratingInfo = computed(() => {
    const g = this.game();
    if (!g) return { average: 0, total: 0 };
    return this.ratingService.getAverageRating(g.id);
  });

  genrePillStyle = computed(() => {
    const cfg = this.genreConfig();
    const bgColor = cfg.colors[1];
    return {
      'background-color': bgColor + '33',
      'color': '#ffffff',
      'border': `1px solid ${bgColor}66`,
    };
  });

  // ---------- Lifecycle ----------
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.juegosService.getById(id).subscribe(game => {
        if (game) {
          this.game.set(game);
          this.loadReviews(game.id);
          this.loadRelatedGames(game.genero, game.id);
        }
      });
    }

    // Also subscribe to route param changes for navigation between game details
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id && id !== this.game()?.id) {
        this.juegosService.getById(id).subscribe(game => {
          if (game) {
            this.game.set(game);
            this.resetReviewForm();
            this.loadReviews(game.id);
            this.loadRelatedGames(game.genero, game.id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
      }
    });
  }

  // ---------- Data loading ----------
  private loadReviews(gameId: number): void {
    this.reviews.set(this.ratingService.getReviews(gameId));
  }

  private loadRelatedGames(genero: string, currentId: number): void {
    const firstGenre = (genero || '').split(',')[0]?.trim();
    if (!firstGenre) return;
    this.juegosService.getByGenero(firstGenre).subscribe(games => {
      const filtered = games.filter(g => g.id !== currentId).slice(0, 4);
      this.relatedGames.set(filtered);
    });
  }

  // ---------- Actions ----------
  toggleFavorite(): void {
    const g = this.game();
    if (g) {
      this.favoritesService.toggle(g.id);
    }
  }

  setRating(stars: number): void {
    this.newRating.set(stars);
  }

  submitReview(): void {
    const g = this.game();
    if (!g || this.newRating() === 0) return;

    // Use auth service for user info if available, otherwise use guest
    const user = this.authService.currentUser();
    const userId = user ? (user as any).email ?? 'guest' : 'guest';
    const userName = user ? (user as any).nombre ?? 'Usuario' : 'Visitante';

    this.ratingService.rate(
      g.id,
      userId,
      userName,
      this.newRating(),
      this.newReviewText.trim() || undefined
    );

    // Refresh reviews
    this.loadReviews(g.id);

    // Show success message and reset form
    this.reviewSubmitted.set(true);
    this.resetReviewForm();

    setTimeout(() => {
      this.reviewSubmitted.set(false);
    }, 4000);
  }

  private resetReviewForm(): void {
    this.newRating.set(0);
    this.hoverRating.set(0);
    this.newReviewText = '';
  }

  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }
}
