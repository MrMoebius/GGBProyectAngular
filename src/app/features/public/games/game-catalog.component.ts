import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JuegoService } from '../../../core/services/juego.service';
import { JuegoExtended } from '../../../core/models/juego-extended.interface';
import { GameCardPublicComponent } from '../../../shared/components/game-card-public/game-card-public.component';
import { FavoritesService } from '../../../core/services/favorites.service';

@Component({
  selector: 'app-game-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, GameCardPublicComponent],
  template: `
    <!-- ============ PAGE WRAPPER ============ -->
    <div class="catalog-page">

      <!-- ============ HEADER ============ -->
      <header class="catalog-header">
        <div class="header-left">
          <h1 class="catalog-title">Nuestros Juegos</h1>
          <span class="game-count">{{ filteredGames().length }} juegos encontrados</span>
        </div>
        <a routerLink="/public/encuentra-tu-juego" class="quiz-link">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          No sabes que jugar?
        </a>
      </header>

      <!-- ============ SEARCH BAR ============ -->
      <div class="search-bar-wrapper">
        <div class="search-bar">
          <i class="fa-solid fa-search search-icon"></i>
          <input
            type="text"
            class="search-input"
            placeholder="Buscar por nombre, genero, etiqueta..."
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event); currentPage.set(1)"
          />
          @if (searchTerm()) {
            <button class="search-clear" (click)="searchTerm.set(''); currentPage.set(1)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          }
        </div>
      </div>

      <!-- ============ GENRE FILTER PILLS ============ -->
      <div class="filter-bar">
        <div class="pills-row">
          @for (genre of genres; track genre) {
            <button
              class="pill"
              [class.active]="selectedGenres().includes(genre)"
              (click)="toggleGenre(genre)"
            >
              {{ genre }}
            </button>
          }
        </div>
        @if (hasActiveFilters()) {
          <button class="clear-filters-btn" (click)="clearAllFilters()">
            <i class="fa-solid fa-filter-circle-xmark"></i>
            Limpiar filtros
          </button>
        }
      </div>

      <!-- ============ ADVANCED FILTERS TOGGLE ============ -->
      <button class="advanced-toggle" (click)="showAdvanced.set(!showAdvanced())">
        <i class="fa-solid fa-sliders"></i>
        Filtros avanzados
        <i class="fa-solid" [class.fa-chevron-down]="!showAdvanced()" [class.fa-chevron-up]="showAdvanced()"></i>
      </button>

      <!-- ============ ADVANCED FILTERS PANEL ============ -->
      @if (showAdvanced()) {
        <div class="advanced-filters">

          <!-- Complexity -->
          <div class="filter-group">
            <label class="filter-label">Complejidad</label>
            <div class="filter-pills">
              @for (c of complexities; track c.value) {
                <button
                  class="pill"
                  [class.active]="selectedComplexity() === c.value"
                  (click)="toggleComplexity(c.value)"
                >
                  {{ c.label }}
                </button>
              }
            </div>
          </div>

          <!-- Player count -->
          <div class="filter-group">
            <label class="filter-label">Numero de jugadores</label>
            <div class="player-inputs">
              <div class="number-input-group">
                <label class="mini-label">Min</label>
                <input
                  type="number"
                  class="number-input"
                  min="1"
                  max="20"
                  [ngModel]="playerMin()"
                  (ngModelChange)="playerMin.set($event); currentPage.set(1)"
                  placeholder="1"
                />
              </div>
              <span class="input-separator">-</span>
              <div class="number-input-group">
                <label class="mini-label">Max</label>
                <input
                  type="number"
                  class="number-input"
                  min="1"
                  max="20"
                  [ngModel]="playerMax()"
                  (ngModelChange)="playerMax.set($event); currentPage.set(1)"
                  placeholder="20"
                />
              </div>
            </div>
          </div>

          <!-- Duration -->
          <div class="filter-group">
            <label class="filter-label">Duracion</label>
            <div class="filter-pills">
              @for (d of durations; track d.value) {
                <button
                  class="pill"
                  [class.active]="selectedDuration() === d.value"
                  (click)="toggleDuration(d.value)"
                >
                  {{ d.label }}
                </button>
              }
            </div>
          </div>

          <!-- Two-player friendly toggle -->
          <div class="filter-group">
            <label class="toggle-row">
              <input
                type="checkbox"
                class="toggle-checkbox"
                [ngModel]="twoPlayerFriendly()"
                (ngModelChange)="twoPlayerFriendly.set($event); currentPage.set(1)"
              />
              <span class="toggle-switch"></span>
              <span class="toggle-label">Apto para 2 jugadores</span>
            </label>
          </div>

          <!-- Language -->
          <div class="filter-group">
            <label class="filter-label">Idioma</label>
            <div class="filter-pills">
              @for (lang of languages; track lang.value) {
                <button
                  class="pill"
                  [class.active]="selectedLanguage() === lang.value"
                  (click)="toggleLanguage(lang.value)"
                >
                  {{ lang.label }}
                </button>
              }
            </div>
          </div>

        </div>
      }

      <!-- ============ SORT + VIEW CONTROLS ============ -->
      <div class="controls-row">
        <div class="sort-wrapper">
          <label class="sort-label" for="sortSelect">Ordenar por:</label>
          <select
            id="sortSelect"
            class="sort-select"
            [ngModel]="sortBy()"
            (ngModelChange)="sortBy.set($event); currentPage.set(1)"
          >
            <option value="nombre-asc">Nombre A-Z</option>
            <option value="nombre-desc">Nombre Z-A</option>
            <option value="rating-desc">Mayor rating</option>
            <option value="complejidad-asc">Menor complejidad</option>
            <option value="jugadores-desc">Mas jugadores</option>
          </select>
        </div>

        <div class="view-toggle">
          <button
            class="view-btn"
            [class.active]="viewMode() === 'grid'"
            (click)="viewMode.set('grid')"
            title="Vista cuadricula"
          >
            <i class="fa-solid fa-grid-2"></i>
          </button>
          <button
            class="view-btn"
            [class.active]="viewMode() === 'list'"
            (click)="viewMode.set('list')"
            title="Vista lista"
          >
            <i class="fa-solid fa-list"></i>
          </button>
        </div>
      </div>

      <!-- ============ RESULTS: GRID VIEW ============ -->
      @if (paginatedGames().length > 0) {
        @if (viewMode() === 'grid') {
          <div class="games-grid">
            @for (game of paginatedGames(); track game.id) {
              <app-game-card-public [game]="game" [showFavorite]="true" />
            }
          </div>
        }

        <!-- ============ RESULTS: LIST VIEW ============ -->
        @if (viewMode() === 'list') {
          <div class="games-list">
            @for (game of paginatedGames(); track game.id) {
              <div class="list-card">
                <div class="list-card-left">
                  <div class="list-card-gradient" [style.background]="getGenreGradient(game.genero)">
                    <i [class]="getGenreIcon(game.genero)" class="list-genre-icon"></i>
                  </div>
                </div>
                <div class="list-card-content">
                  <div class="list-card-header">
                    <h3 class="list-card-title">
                      <a [routerLink]="'/public/juegos/' + game.id">{{ game.nombre }}</a>
                    </h3>
                    <button
                      class="list-fav-btn"
                      [class.is-favorite]="favoritesService.isFavorite(game.id)"
                      (click)="favoritesService.toggle(game.id)"
                      [attr.aria-label]="favoritesService.isFavorite(game.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'"
                    >
                      <i [class]="favoritesService.isFavorite(game.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
                    </button>
                  </div>
                  <div class="list-card-meta">
                    <span class="list-meta-pill">{{ game.genero }}</span>
                    <span class="list-meta-item">
                      <i class="fa-solid fa-users"></i>
                      {{ game.minJugadores }}-{{ game.maxJugadores }} jugadores
                    </span>
                    <span class="list-meta-item">
                      <i class="fa-solid fa-clock"></i>
                      {{ game.duracionMediaMin ?? '?' }} min
                    </span>
                    <span class="list-meta-item">
                      <i class="fa-solid fa-signal"></i>
                      {{ game.complejidad }}
                    </span>
                    <span class="list-meta-item list-rating">
                      <i class="fa-solid fa-star"></i>
                      {{ (game.rating ?? 0).toFixed(1) }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- ============ PAGINATION ============ -->
        @if (totalPages() > 1) {
          <nav class="pagination">
            <button
              class="page-btn"
              [disabled]="currentPage() === 1"
              (click)="currentPage.set(currentPage() - 1)"
            >
              <i class="fa-solid fa-chevron-left"></i>
            </button>

            @for (page of visiblePages(); track page) {
              @if (page === -1) {
                <span class="page-ellipsis">...</span>
              } @else {
                <button
                  class="page-btn"
                  [class.active]="currentPage() === page"
                  (click)="currentPage.set(page)"
                >
                  {{ page }}
                </button>
              }
            }

            <button
              class="page-btn"
              [disabled]="currentPage() === totalPages()"
              (click)="currentPage.set(currentPage() + 1)"
            >
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </nav>
        }

      } @else {
        <!-- ============ EMPTY STATE ============ -->
        <div class="empty-state">
          <i class="fa-solid fa-ghost empty-icon"></i>
          <h2 class="empty-title">No se encontraron juegos</h2>
          <p class="empty-text">Prueba el buscador!</p>
          <a routerLink="/public/encuentra-tu-juego" class="empty-link">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            Ir al quiz para encontrar tu juego ideal
          </a>
        </div>
      }

    </div>
  `,
  styles: [`
    /* ===== HOST ===== */
    :host {
      display: block;
    }

    /* ===== PAGE WRAPPER ===== */
    .catalog-page {
      max-width: var(--max-content-width, 1280px);
      margin: 0 auto;
      padding: 2rem 2rem 4rem;
    }

    /* ===== HEADER ===== */
    .catalog-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .header-left {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .catalog-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.2;
      margin: 0;
    }

    .game-count {
      font-size: 0.9375rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .quiz-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border-radius: var(--radius-md);
      background-color: var(--primary-coral);
      color: var(--text-white);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 600;
      transition: background-color 0.2s, box-shadow 0.2s;
      white-space: nowrap;
    }

    .quiz-link:hover {
      background-color: var(--primary-hover);
    }

    :host-context([data-theme="dark"]) .quiz-link:hover {
      box-shadow: 0 0 16px rgba(255, 107, 157, 0.35);
    }

    /* ===== SEARCH BAR ===== */
    .search-bar-wrapper {
      margin-bottom: 1.5rem;
    }

    .search-bar {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      font-size: 1rem;
      color: var(--text-muted);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 2.75rem 0.75rem 2.75rem;
      border: 1px solid var(--input-border);
      border-radius: var(--radius-lg);
      background-color: var(--input-bg);
      color: var(--text-main);
      font-size: 0.9375rem;
      font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s, background-color 0.3s;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--input-focus);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    :host-context([data-theme="dark"]) .search-input:focus {
      box-shadow: 0 0 0 3px rgba(0, 255, 209, 0.15);
    }

    .search-input::placeholder {
      color: var(--text-muted);
    }

    .search-clear {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1rem;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .search-clear:hover {
      color: var(--text-main);
    }

    /* ===== FILTER BAR (Genre pills) ===== */
    .filter-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .pills-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      flex: 1;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      padding: 0.375rem 0.875rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.025em;
      background-color: var(--secondary-bg);
      color: var(--text-muted);
      border: 1px solid var(--card-border);
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      user-select: none;
    }

    .pill:hover:not(.active) {
      border-color: var(--text-muted);
      color: var(--text-main);
    }

    .pill.active {
      background-color: var(--primary-coral);
      color: var(--text-white);
      border-color: var(--primary-coral);
    }

    :host-context([data-theme="dark"]) .pill.active {
      box-shadow: 0 0 10px rgba(255, 107, 157, 0.3);
    }

    .clear-filters-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.375rem 0.875rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      background-color: transparent;
      color: var(--danger);
      border: 1px solid var(--danger);
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .clear-filters-btn:hover {
      background-color: var(--danger);
      color: var(--text-white);
    }

    /* ===== ADVANCED TOGGLE BUTTON ===== */
    .advanced-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: none;
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
      color: var(--text-muted);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 1rem;
      font-family: inherit;
    }

    .advanced-toggle:hover {
      border-color: var(--text-muted);
      color: var(--text-main);
    }

    /* ===== ADVANCED FILTERS PANEL ===== */
    .advanced-filters {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.5rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-lg);
      animation: slideDown 0.25s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-main);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .filter-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
    }

    /* Player count inputs */
    .player-inputs {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .number-input-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .mini-label {
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .number-input {
      width: 70px;
      padding: 0.4rem 0.5rem;
      border: 1px solid var(--input-border);
      border-radius: var(--radius-md);
      background-color: var(--input-bg);
      color: var(--text-main);
      font-size: 0.875rem;
      font-family: inherit;
      text-align: center;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .number-input:focus {
      outline: none;
      border-color: var(--input-focus);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    :host-context([data-theme="dark"]) .number-input:focus {
      box-shadow: 0 0 0 3px rgba(0, 255, 209, 0.15);
    }

    .input-separator {
      font-size: 1rem;
      color: var(--text-muted);
      padding-bottom: 0.4rem;
    }

    /* Two-player toggle */
    .toggle-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      user-select: none;
    }

    .toggle-checkbox {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-switch {
      position: relative;
      width: 42px;
      height: 24px;
      background-color: var(--input-border);
      border-radius: 12px;
      transition: background-color 0.2s;
      flex-shrink: 0;
    }

    .toggle-switch::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 18px;
      height: 18px;
      background-color: white;
      border-radius: 50%;
      transition: transform 0.2s;
    }

    .toggle-checkbox:checked + .toggle-switch {
      background-color: var(--primary-coral);
    }

    .toggle-checkbox:checked + .toggle-switch::after {
      transform: translateX(18px);
    }

    :host-context([data-theme="dark"]) .toggle-checkbox:checked + .toggle-switch {
      box-shadow: 0 0 8px rgba(255, 107, 157, 0.4);
    }

    .toggle-label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-main);
    }

    /* ===== SORT + VIEW CONTROLS ===== */
    .controls-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .sort-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .sort-label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .sort-select {
      padding: 0.4rem 2rem 0.4rem 0.75rem;
      border: 1px solid var(--input-border);
      border-radius: var(--radius-md);
      background-color: var(--input-bg);
      color: var(--text-main);
      font-size: 0.8125rem;
      font-family: inherit;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.625rem center;
      transition: border-color 0.2s;
    }

    .sort-select:focus {
      outline: none;
      border-color: var(--input-focus);
    }

    .view-toggle {
      display: flex;
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .view-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 34px;
      border: none;
      background-color: var(--card-bg);
      color: var(--text-muted);
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-btn:first-child {
      border-right: 1px solid var(--card-border);
    }

    .view-btn:hover:not(.active) {
      color: var(--text-main);
      background-color: var(--secondary-bg);
    }

    .view-btn.active {
      background-color: var(--primary-coral);
      color: var(--text-white);
    }

    /* ===== GRID VIEW ===== */
    .games-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 1100px) {
      .games-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 820px) {
      .games-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 540px) {
      .games-grid {
        grid-template-columns: 1fr;
      }
    }

    /* ===== LIST VIEW ===== */
    .games-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }

    .list-card {
      display: flex;
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }

    .list-card:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    :host-context([data-theme="dark"]) .list-card:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 12px rgba(0, 255, 209, 0.06);
      border-color: rgba(0, 255, 209, 0.12);
    }

    .list-card-left {
      flex-shrink: 0;
    }

    .list-card-gradient {
      width: 80px;
      height: 100%;
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .list-genre-icon {
      font-size: 1.75rem;
      color: rgba(255, 255, 255, 0.3);
    }

    .list-card-content {
      flex: 1;
      padding: 0.875rem 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.5rem;
      min-width: 0;
    }

    .list-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .list-card-title {
      font-size: 1.0625rem;
      font-weight: 700;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .list-card-title a {
      color: var(--text-main);
      text-decoration: none;
      transition: color 0.2s;
    }

    .list-card-title a:hover {
      color: var(--primary-coral);
    }

    .list-fav-btn {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 50%;
      background: none;
      color: var(--text-muted);
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, color 0.2s;
    }

    .list-fav-btn:hover {
      transform: scale(1.15);
    }

    .list-fav-btn.is-favorite {
      color: #EF4444;
    }

    .list-fav-btn.is-favorite:hover {
      color: #DC2626;
    }

    .list-card-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .list-meta-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.15rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.025em;
      background-color: var(--primary-coral);
      color: var(--text-white);
      text-transform: uppercase;
    }

    .list-meta-item {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .list-meta-item i {
      font-size: 0.75rem;
      opacity: 0.7;
    }

    .list-rating {
      color: #F59E0B;
      font-weight: 600;
    }

    .list-rating i {
      opacity: 1 !important;
    }

    :host-context([data-theme="dark"]) .list-rating {
      color: #FBBF24;
    }

    /* ===== PAGINATION ===== */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      margin-bottom: 2rem;
    }

    .page-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      height: 36px;
      padding: 0 0.5rem;
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
      background-color: var(--card-bg);
      color: var(--text-main);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    .page-btn:hover:not(:disabled):not(.active) {
      border-color: var(--text-muted);
      background-color: var(--secondary-bg);
    }

    .page-btn.active {
      background-color: var(--primary-coral);
      color: var(--text-white);
      border-color: var(--primary-coral);
    }

    :host-context([data-theme="dark"]) .page-btn.active {
      box-shadow: 0 0 10px rgba(255, 107, 157, 0.3);
    }

    .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .page-ellipsis {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      height: 36px;
      color: var(--text-muted);
      font-size: 0.875rem;
      user-select: none;
    }

    /* ===== EMPTY STATE ===== */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 4rem 2rem;
      gap: 1rem;
    }

    .empty-icon {
      font-size: 3.5rem;
      color: var(--text-muted);
      opacity: 0.3;
    }

    .empty-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0;
    }

    .empty-text {
      font-size: 1rem;
      color: var(--text-muted);
    }

    .empty-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border-radius: var(--radius-md);
      background-color: var(--primary-coral);
      color: var(--text-white);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 600;
      margin-top: 0.5rem;
      transition: background-color 0.2s, box-shadow 0.2s;
    }

    .empty-link:hover {
      background-color: var(--primary-hover);
    }

    :host-context([data-theme="dark"]) .empty-link:hover {
      box-shadow: 0 0 16px rgba(255, 107, 157, 0.35);
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      .catalog-page {
        padding: 1.5rem 1rem 3rem;
      }

      .catalog-header {
        flex-direction: column;
        align-items: stretch;
      }

      .catalog-title {
        font-size: 1.5rem;
      }

      .quiz-link {
        align-self: flex-start;
      }

      .advanced-filters {
        grid-template-columns: 1fr;
      }

      .controls-row {
        flex-direction: column;
        align-items: stretch;
      }

      .sort-wrapper {
        width: 100%;
      }

      .sort-select {
        flex: 1;
      }

      .view-toggle {
        align-self: flex-end;
      }

      .list-card-gradient {
        width: 60px;
      }

      .list-card-meta {
        gap: 0.5rem;
      }
    }

    @media (max-width: 480px) {
      .pills-row {
        gap: 0.375rem;
      }

      .pill {
        padding: 0.3rem 0.625rem;
        font-size: 0.6875rem;
      }

      .list-card {
        flex-direction: column;
      }

      .list-card-gradient {
        width: 100%;
        height: 48px;
        min-height: 48px;
      }

      .list-genre-icon {
        font-size: 1.25rem;
      }
    }
  `]
})
export class GameCatalogComponent implements OnInit {

  // ---------- DI ----------
  private readonly juegosService = inject(JuegoService);
  readonly favoritesService = inject(FavoritesService);

  // ---------- Static data ----------
  readonly genres: string[] = [
    'ESTRATEGIA', 'FAMILIAR', 'PARTY', 'COOPERATIVO', 'ROL',
    'CARTAS', 'DADOS', 'ACCION', 'AVENTURA', 'MISTERIO',
    'INFANTIL', 'PUZZLE', 'TERROR', 'SOLITARIO', 'MAZOS',
    'MINIATURAS', 'ROLESOCULTOS', 'CARRERAS'
  ];

  readonly complexities = [
    { label: 'BAJA', value: 'BAJA' },
    { label: 'MEDIA', value: 'MEDIA' },
    { label: 'ALTA', value: 'ALTA' },
  ];

  readonly durations = [
    { label: '< 30 min', value: 'lt30' },
    { label: '30-60 min', value: '30to60' },
    { label: '60-120 min', value: '60to120' },
    { label: '> 120 min', value: 'gt120' },
  ];

  readonly languages = [
    { label: 'ESPANOL', value: 'ESPANOL' },
    { label: 'INGLES', value: 'INGLES' },
    { label: 'INDEPENDIENTE', value: 'INDEPENDIENTE' },
  ];

  private readonly GENRE_GRADIENTS: Record<string, string> = {
    ESTRATEGIA:   'linear-gradient(135deg, #1a365d, #2d3748)',
    FAMILIAR:     'linear-gradient(135deg, #2d6a4f, #40916c)',
    PARTY:        'linear-gradient(135deg, #7c2d12, #c2410c)',
    COOPERATIVO:  'linear-gradient(135deg, #312e81, #4338ca)',
    ROL:          'linear-gradient(135deg, #581c87, #7c3aed)',
    CARTAS:       'linear-gradient(135deg, #7f1d1d, #dc2626)',
    DADOS:        'linear-gradient(135deg, #78350f, #d97706)',
    ACCION:       'linear-gradient(135deg, #991b1b, #ef4444)',
    AVENTURA:     'linear-gradient(135deg, #065f46, #10b981)',
    MISTERIO:     'linear-gradient(135deg, #1e3a5f, #3b82f6)',
    INFANTIL:     'linear-gradient(135deg, #d97706, #fbbf24)',
    PUZZLE:       'linear-gradient(135deg, #5b21b6, #8b5cf6)',
    TERROR:       'linear-gradient(135deg, #1f2937, #4b5563)',
    SOLITARIO:    'linear-gradient(135deg, #064e3b, #047857)',
    MAZOS:        'linear-gradient(135deg, #7f1d1d, #b91c1c)',
    MINIATURAS:   'linear-gradient(135deg, #4a1942, #c026d3)',
    ROLESOCULTOS: 'linear-gradient(135deg, #3730a3, #6366f1)',
    CARRERAS:     'linear-gradient(135deg, #b45309, #f59e0b)',
  };

  private readonly GENRE_ICONS: Record<string, string> = {
    ESTRATEGIA:   'fa-solid fa-chess',
    FAMILIAR:     'fa-solid fa-people-group',
    PARTY:        'fa-solid fa-champagne-glasses',
    COOPERATIVO:  'fa-solid fa-handshake',
    ROL:          'fa-solid fa-hat-wizard',
    CARTAS:       'fa-solid fa-clone',
    DADOS:        'fa-solid fa-dice',
    ACCION:       'fa-solid fa-bolt',
    AVENTURA:     'fa-solid fa-compass',
    MISTERIO:     'fa-solid fa-magnifying-glass',
    INFANTIL:     'fa-solid fa-child',
    PUZZLE:       'fa-solid fa-puzzle-piece',
    TERROR:       'fa-solid fa-skull',
    SOLITARIO:    'fa-solid fa-user',
    MAZOS:        'fa-solid fa-layer-group',
    MINIATURAS:   'fa-solid fa-chess-knight',
    ROLESOCULTOS: 'fa-solid fa-masks-theater',
    CARRERAS:     'fa-solid fa-flag-checkered',
  };

  // ---------- Signals (filter state) ----------
  searchTerm = signal<string>('');
  selectedGenres = signal<string[]>([]);
  selectedComplexity = signal<string>('');
  playerMin = signal<number | null>(null);
  playerMax = signal<number | null>(null);
  selectedDuration = signal<string>('');
  twoPlayerFriendly = signal<boolean>(false);
  selectedLanguage = signal<string>('');
  sortBy = signal<string>('nombre-asc');
  viewMode = signal<'grid' | 'list'>('grid');
  showAdvanced = signal<boolean>(false);
  currentPage = signal<number>(1);

  // ---------- All games ----------
  allGames = signal<JuegoExtended[]>([]);

  readonly ITEMS_PER_PAGE = 20;

  // ---------- Computed: has active filters ----------
  hasActiveFilters = computed(() => {
    return this.searchTerm() !== ''
      || this.selectedGenres().length > 0
      || this.selectedComplexity() !== ''
      || this.playerMin() != null
      || this.playerMax() != null
      || this.selectedDuration() !== ''
      || this.twoPlayerFriendly()
      || this.selectedLanguage() !== '';
  });

  // ---------- Computed: filtered games ----------
  filteredGames = computed(() => {
    let games = [...this.allGames()];

    // Search term filter
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      games = games.filter(g =>
        g.nombre.toLowerCase().includes(term)
        || g.genero.toLowerCase().includes(term)
        || (g.tags ?? []).some(tag => tag.toLowerCase().includes(term))
        || (g.editorial ?? '').toLowerCase().includes(term)
      );
    }

    // Genre filter (multi-select)
    const genres = this.selectedGenres();
    if (genres.length > 0) {
      games = games.filter(g => {
        const gameGenres = (g.genero || '').split(',').map(x => x.trim());
        return genres.some(sel => gameGenres.includes(sel));
      });
    }

    // Complexity filter (BAJA=VERDE, MEDIA=AMARILLO, ALTA=ROJO)
    const complexity = this.selectedComplexity();
    if (complexity) {
      const equivalents: Record<string, string[]> = {
        BAJA: ['BAJA', 'VERDE'],
        MEDIA: ['MEDIA', 'AMARILLO'],
        ALTA: ['ALTA', 'ROJO'],
      };
      const valid = equivalents[complexity] ?? [complexity];
      games = games.filter(g => valid.includes(g.complejidad));
    }

    // Player count min
    const pMin = this.playerMin();
    if (pMin != null && pMin > 0) {
      games = games.filter(g => g.maxJugadores >= pMin);
    }

    // Player count max
    const pMax = this.playerMax();
    if (pMax != null && pMax > 0) {
      games = games.filter(g => g.minJugadores <= pMax);
    }

    // Duration filter
    const duration = this.selectedDuration();
    if (duration) {
      games = games.filter(g => {
        const d = g.duracionMediaMin ?? 0;
        switch (duration) {
          case 'lt30': return d < 30;
          case '30to60': return d >= 30 && d <= 60;
          case '60to120': return d > 60 && d <= 120;
          case 'gt120': return d > 120;
          default: return true;
        }
      });
    }

    // Two-player friendly
    if (this.twoPlayerFriendly()) {
      games = games.filter(g => g.recomendadoDosJugadores === true);
    }

    // Language filter
    const lang = this.selectedLanguage();
    if (lang) {
      games = games.filter(g => g.idioma === lang);
    }

    // Sort
    const sort = this.sortBy();
    switch (sort) {
      case 'nombre-asc':
        games.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        break;
      case 'nombre-desc':
        games.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));
        break;
      case 'rating-desc':
        games.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'complejidad-asc': {
        const order: Record<string, number> = { 'BAJA': 1, 'VERDE': 1, 'MEDIA': 2, 'AMARILLO': 2, 'ALTA': 3, 'ROJO': 3 };
        games.sort((a, b) => (order[a.complejidad] ?? 99) - (order[b.complejidad] ?? 99));
        break;
      }
      case 'jugadores-desc':
        games.sort((a, b) => b.maxJugadores - a.maxJugadores);
        break;
    }

    return games;
  });

  // ---------- Computed: total pages ----------
  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredGames().length / this.ITEMS_PER_PAGE));
  });

  // ---------- Computed: paginated games ----------
  paginatedGames = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.ITEMS_PER_PAGE;
    return this.filteredGames().slice(start, start + this.ITEMS_PER_PAGE);
  });

  // ---------- Computed: visible pagination pages ----------
  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > 3) {
        pages.push(-1); // ellipsis
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push(-1); // ellipsis
      }

      pages.push(total);
    }

    return pages;
  });

  // ---------- Lifecycle ----------
  ngOnInit(): void {
    this.juegosService.getAll().subscribe(games => {
      this.allGames.set(games);
    });
  }

  // ---------- Actions ----------
  toggleGenre(genre: string): void {
    this.selectedGenres.update(genres => {
      const idx = genres.indexOf(genre);
      if (idx >= 0) {
        return genres.filter(g => g !== genre);
      } else {
        return [...genres, genre];
      }
    });
    this.currentPage.set(1);
  }

  toggleComplexity(value: string): void {
    this.selectedComplexity.update(current => current === value ? '' : value);
    this.currentPage.set(1);
  }

  toggleDuration(value: string): void {
    this.selectedDuration.update(current => current === value ? '' : value);
    this.currentPage.set(1);
  }

  toggleLanguage(value: string): void {
    this.selectedLanguage.update(current => current === value ? '' : value);
    this.currentPage.set(1);
  }

  clearAllFilters(): void {
    this.searchTerm.set('');
    this.selectedGenres.set([]);
    this.selectedComplexity.set('');
    this.playerMin.set(null);
    this.playerMax.set(null);
    this.selectedDuration.set('');
    this.twoPlayerFriendly.set(false);
    this.selectedLanguage.set('');
    this.currentPage.set(1);
  }

  getGenreGradient(genero: string): string {
    const first = (genero || '').split(',')[0]?.trim().toUpperCase();
    return this.GENRE_GRADIENTS[first] ?? 'linear-gradient(135deg, #374151, #6b7280)';
  }

  getGenreIcon(genero: string): string {
    const first = (genero || '').split(',')[0]?.trim().toUpperCase();
    return this.GENRE_ICONS[first] ?? 'fa-solid fa-puzzle-piece';
  }
}
