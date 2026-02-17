import { Component, signal, computed, inject, OnDestroy } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { RecommendationService, QuizAnswers } from '../../../core/services/recommendation.service';
import { JuegoExtended } from '../../../core/models/juego-extended.interface';
import { GameCardPublicComponent } from '../../../shared/components/game-card-public/game-card-public.component';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-game-quiz',
  standalone: true,
  imports: [NgClass, RouterLink, GameCardPublicComponent, BeerLoaderComponent],
  template: `
    <div class="quiz-container">

      <!-- ========== QUIZ WIZARD ========== -->
      @if (!showResults()) {

        <!-- Header -->
        <div class="quiz-header">
          <i class="fa-solid fa-wand-magic-sparkles header-icon"></i>
          <h1 class="quiz-title">Encuentra tu Juego</h1>
          <p class="quiz-subtitle">Responde unas preguntas y te recomendaremos los mejores juegos para ti</p>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar">
          @for (step of steps; track step.index) {
            <div class="progress-step" [ngClass]="{ 'completed': step.index < currentStep(), 'active': step.index === currentStep() }">
              <div class="step-circle">
                @if (step.index < currentStep()) {
                  <i class="fa-solid fa-check"></i>
                } @else {
                  {{ step.index + 1 }}
                }
              </div>
              <span class="step-label">{{ step.label }}</span>
            </div>
            @if (step.index < steps.length - 1) {
              <div class="progress-line" [ngClass]="{ 'filled': step.index < currentStep() }"></div>
            }
          }
        </div>

        <!-- Steps Container -->
        <div class="steps-wrapper">

          <!-- ===== STEP 0: Player Count ===== -->
          @if (currentStep() === 0) {
            <div class="step-content slide-in">
              <h2 class="step-question">
                <i class="fa-solid fa-users"></i>
                Cuantos jugadores sois?
              </h2>
              <p class="step-hint">Selecciona el numero de jugadores</p>
              <div class="player-grid">
                @for (count of playerOptions; track count) {
                  <button
                    class="player-btn"
                    [ngClass]="{ 'selected': playerCount() === count }"
                    (click)="selectPlayerCount(count)"
                  >
                    <span class="player-number">{{ count === 9 ? '8+' : count }}</span>
                    <span class="player-label">{{ count === 1 ? 'jugador' : 'jugadores' }}</span>
                  </button>
                }
              </div>
            </div>
          }

          <!-- ===== STEP 1: Time Available ===== -->
          @if (currentStep() === 1) {
            <div class="step-content slide-in">
              <h2 class="step-question">
                <i class="fa-solid fa-clock"></i>
                Cuanto tiempo teneis?
              </h2>
              <p class="step-hint">Elige la duracion de partida ideal</p>
              <div class="options-grid cols-4">
                @for (opt of timeOptions; track opt.value) {
                  <button
                    class="option-card"
                    [ngClass]="{ 'selected': timeAvailable() === opt.value }"
                    (click)="selectTime(opt.value)"
                  >
                    <i [ngClass]="'fa-solid ' + opt.icon" class="option-icon"></i>
                    <span class="option-title">{{ opt.title }}</span>
                    <span class="option-desc">{{ opt.desc }}</span>
                  </button>
                }
              </div>
            </div>
          }

          <!-- ===== STEP 2: Experience Level ===== -->
          @if (currentStep() === 2) {
            <div class="step-content slide-in">
              <h2 class="step-question">
                <i class="fa-solid fa-graduation-cap"></i>
                Cual es vuestro nivel?
              </h2>
              <p class="step-hint">Selecciona vuestra experiencia con juegos de mesa</p>
              <div class="options-grid cols-3">
                @for (opt of experienceOptions; track opt.value) {
                  <button
                    class="option-card"
                    [ngClass]="{ 'selected': experience() === opt.value }"
                    (click)="selectExperience(opt.value)"
                  >
                    <i [ngClass]="'fa-solid ' + opt.icon" class="option-icon"></i>
                    <span class="option-title">{{ opt.title }}</span>
                    <span class="option-desc">{{ opt.desc }}</span>
                  </button>
                }
              </div>
            </div>
          }

          <!-- ===== STEP 3: Mood ===== -->
          @if (currentStep() === 3) {
            <div class="step-content slide-in">
              <h2 class="step-question">
                <i class="fa-solid fa-heart"></i>
                Que buscais?
              </h2>
              <p class="step-hint">Que tipo de experiencia quereis vivir?</p>
              <div class="options-grid cols-4">
                @for (opt of moodOptions; track opt.value) {
                  <button
                    class="option-card"
                    [ngClass]="{ 'selected': mood() === opt.value }"
                    (click)="selectMood(opt.value)"
                  >
                    <i [ngClass]="'fa-solid ' + opt.icon" class="option-icon"></i>
                    <span class="option-title">{{ opt.title }}</span>
                    <span class="option-desc">{{ opt.desc }}</span>
                  </button>
                }
              </div>
            </div>
          }

          <!-- ===== STEP 4: Genres (optional, multi-select) ===== -->
          @if (currentStep() === 4) {
            <div class="step-content slide-in">
              <h2 class="step-question">
                <i class="fa-solid fa-tags"></i>
                Algun genero preferido?
              </h2>
              <p class="step-hint">Selecciona uno o varios generos, o salta este paso</p>
              <div class="genres-grid">
                @for (genre of genreOptions; track genre) {
                  <button
                    class="genre-pill"
                    [ngClass]="{ 'selected': genres().includes(genre) }"
                    (click)="toggleGenre(genre)"
                  >
                    {{ genre }}
                  </button>
                }
              </div>
            </div>
          }

        </div>

        <!-- Navigation Buttons -->
        <div class="nav-buttons">
          @if (currentStep() > 0) {
            <button class="nav-btn btn-back" (click)="goBack()">
              <i class="fa-solid fa-arrow-left"></i>
              Atras
            </button>
          } @else {
            <div></div>
          }

          @if (currentStep() < 4) {
            <div class="step-buttons">
              <button class="nav-btn btn-skip" (click)="skipStep()">
                Saltar
              </button>
              <button
                class="nav-btn btn-next"
                [ngClass]="{ 'disabled': !canAdvance() }"
                [disabled]="!canAdvance()"
                (click)="goNext()"
              >
                Siguiente
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          } @else {
            <div class="step-buttons">
              <button class="nav-btn btn-skip" (click)="skipStep()">
                Saltar
              </button>
              <button class="nav-btn btn-next" (click)="getResults()">
                Ver resultados
                <i class="fa-solid fa-sparkles"></i>
              </button>
            </div>
          }
        </div>

      }

      <!-- ========== RESULTS SECTION ========== -->
      @if (showResults()) {
        <div class="results-section slide-in">

          <!-- Results Header -->
          <div class="results-header">
            <i class="fa-solid fa-trophy results-icon"></i>
            <h1 class="results-title">Tus juegos recomendados</h1>
            <p class="results-subtitle">Basandonos en tus respuestas, estos son los juegos que mejor encajan contigo</p>
          </div>

          <!-- Loading -->
          @if (loading()) {
            <app-beer-loader [isLoading]="loading()" />
          }

          <!-- Results Grid -->
          @if (!loading() && results().length > 0) {
            <div class="results-grid">
              @for (game of results(); track game.id) {
                <app-game-card-public [game]="game" [showFavorite]="false" />
              }
            </div>
          }

          <!-- No Results -->
          @if (!loading() && results().length === 0) {
            <div class="no-results">
              <i class="fa-solid fa-face-sad-tear"></i>
              <p>No encontramos juegos que coincidan con tus preferencias.</p>
              <p>Prueba a cambiar algunos filtros!</p>
            </div>
          }

          <!-- Results Actions -->
          <div class="results-actions">
            <button class="nav-btn btn-back" (click)="resetQuiz()">
              <i class="fa-solid fa-rotate-left"></i>
              Volver a empezar
            </button>
            <a class="nav-btn btn-next" routerLink="/public/juegos">
              Ver catalogo completo
              <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>

        </div>
      }

    </div>
  `,
  styles: [`
    /* ===== Host ===== */
    :host {
      display: block;
    }

    /* ===== Container ===== */
    .quiz-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem;
    }

    /* ===== Header ===== */
    .quiz-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .header-icon {
      font-size: 2.5rem;
      color: var(--primary-coral);
      margin-bottom: 0.75rem;
      display: block;
    }

    .quiz-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-main);
      margin: 0 0 0.5rem;
    }

    .quiz-subtitle {
      font-size: 1rem;
      color: var(--text-muted);
      margin: 0;
      max-width: 500px;
      margin-inline: auto;
      line-height: 1.5;
    }

    /* ===== Progress Bar ===== */
    .progress-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: 2.5rem;
      padding: 0 1rem;
    }

    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      position: relative;
      z-index: 1;
    }

    .step-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 700;
      border: 2px solid var(--card-border);
      background-color: var(--card-bg);
      color: var(--text-muted);
      transition: all 0.3s ease;
    }

    .progress-step.active .step-circle {
      border-color: var(--primary-coral);
      background-color: var(--primary-coral);
      color: #fff;
      box-shadow: 0 0 0 4px rgba(255, 107, 157, 0.2);
    }

    .progress-step.completed .step-circle {
      border-color: var(--primary-coral);
      background-color: var(--primary-coral);
      color: #fff;
    }

    .step-label {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      white-space: nowrap;
    }

    .progress-step.active .step-label {
      color: var(--primary-coral);
    }

    .progress-step.completed .step-label {
      color: var(--primary-coral);
    }

    .progress-line {
      flex: 1;
      height: 2px;
      background-color: var(--card-border);
      min-width: 30px;
      max-width: 80px;
      margin: 0 0.25rem;
      margin-bottom: 1.2rem;
      transition: background-color 0.3s ease;
    }

    .progress-line.filled {
      background-color: var(--primary-coral);
    }

    /* ===== Slide In Animation ===== */
    .slide-in {
      animation: slideIn 0.4s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(40px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    /* ===== Step Content ===== */
    .steps-wrapper {
      min-height: 340px;
    }

    .step-content {
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-lg);
      padding: 2rem 2rem 2.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: background-color 0.3s, border-color 0.3s;
    }

    :host-context([data-theme="dark"]) .step-content {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    }

    .step-question {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .step-question i {
      color: var(--primary-coral);
      font-size: 1.25rem;
    }

    .step-hint {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin: 0 0 1.75rem;
      padding-left: 2.25rem;
    }

    /* ===== Player Count Grid ===== */
    .player-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
      gap: 0.75rem;
    }

    .player-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      padding: 1.25rem 0.5rem;
      border: 2px solid var(--card-border);
      border-radius: var(--radius-md);
      background-color: var(--bg-main);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .player-btn:hover {
      border-color: var(--primary-coral);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .player-btn.selected {
      border-color: var(--primary-coral);
      background-color: var(--primary-coral);
    }

    .player-number {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1;
    }

    .player-btn.selected .player-number {
      color: #fff;
    }

    .player-label {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .player-btn.selected .player-label {
      color: rgba(255, 255, 255, 0.85);
    }

    /* ===== Option Cards Grid ===== */
    .options-grid {
      display: grid;
      gap: 1rem;
    }

    .options-grid.cols-4 {
      grid-template-columns: repeat(4, 1fr);
    }

    .options-grid.cols-3 {
      grid-template-columns: repeat(3, 1fr);
    }

    .option-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.5rem;
      padding: 1.5rem 1rem;
      border: 2px solid var(--card-border);
      border-radius: var(--radius-lg);
      background-color: var(--bg-main);
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .option-card:hover {
      border-color: var(--primary-coral);
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    }

    :host-context([data-theme="dark"]) .option-card:hover {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    }

    .option-card.selected {
      border-color: var(--primary-coral);
      background-color: var(--primary-coral);
    }

    .option-icon {
      font-size: 2rem;
      color: var(--primary-coral);
      transition: color 0.2s;
    }

    .option-card.selected .option-icon {
      color: #fff;
    }

    .option-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
      transition: color 0.2s;
    }

    .option-card.selected .option-title {
      color: #fff;
    }

    .option-desc {
      font-size: 0.75rem;
      color: var(--text-muted);
      line-height: 1.4;
      transition: color 0.2s;
    }

    .option-card.selected .option-desc {
      color: rgba(255, 255, 255, 0.85);
    }

    /* ===== Genre Pills ===== */
    .genres-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
    }

    .genre-pill {
      padding: 0.6rem 1.25rem;
      border: 2px solid var(--card-border);
      border-radius: 9999px;
      background-color: var(--bg-main);
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-main);
      cursor: pointer;
      letter-spacing: 0.03em;
      transition: all 0.2s ease;
    }

    .genre-pill:hover {
      border-color: var(--primary-coral);
      color: var(--primary-coral);
    }

    .genre-pill.selected {
      border-color: var(--primary-coral);
      background-color: var(--primary-coral);
      color: #fff;
    }

    /* ===== Navigation ===== */
    .nav-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2rem;
      gap: 1rem;
    }

    .step-buttons {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: 2px solid transparent;
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .btn-back {
      background-color: var(--bg-main);
      border-color: var(--card-border);
      color: var(--text-muted);
    }

    .btn-back:hover {
      border-color: var(--text-muted);
      color: var(--text-main);
    }

    .btn-next {
      background-color: var(--primary-coral);
      color: #fff;
      border-color: var(--primary-coral);
    }

    .btn-next:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
    }

    .btn-next.disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .btn-skip {
      background-color: transparent;
      border-color: var(--card-border);
      color: var(--text-muted);
    }

    .btn-skip:hover {
      border-color: var(--text-muted);
      color: var(--text-main);
    }

    /* ===== Results Section ===== */
    .results-section {
      padding-top: 1rem;
    }

    .results-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .results-icon {
      font-size: 3rem;
      color: #F59E0B;
      margin-bottom: 0.75rem;
      display: block;
    }

    .results-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-main);
      margin: 0 0 0.5rem;
    }

    .results-subtitle {
      font-size: 1rem;
      color: var(--text-muted);
      margin: 0;
      max-width: 500px;
      margin-inline: auto;
      line-height: 1.5;
    }

    /* Loading */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      padding: 3rem 0;
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--card-border);
      border-top-color: var(--primary-coral);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Results Grid */
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    /* No Results */
    .no-results {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-muted);
    }

    .no-results i {
      font-size: 3rem;
      opacity: 0.3;
      margin-bottom: 1rem;
      display: block;
    }

    .no-results p {
      margin: 0.25rem 0;
      font-size: 1rem;
    }

    /* Results Actions */
    .results-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 2.5rem;
      flex-wrap: wrap;
    }

    /* ===== Responsive ===== */
    @media (max-width: 768px) {
      .quiz-container {
        padding: 1.5rem 1rem 3rem;
      }

      .quiz-title {
        font-size: 1.5rem;
      }

      .progress-bar {
        padding: 0;
      }

      .step-label {
        font-size: 0.575rem;
      }

      .step-circle {
        width: 34px;
        height: 34px;
        font-size: 0.8rem;
      }

      .progress-line {
        min-width: 16px;
      }

      .step-content {
        padding: 1.5rem 1.25rem 2rem;
      }

      .step-question {
        font-size: 1.2rem;
      }

      .step-hint {
        padding-left: 0;
      }

      .options-grid.cols-4 {
        grid-template-columns: repeat(2, 1fr);
      }

      .options-grid.cols-3 {
        grid-template-columns: repeat(1, 1fr);
      }

      .player-grid {
        grid-template-columns: repeat(4, 1fr);
      }

      .option-card {
        padding: 1.25rem 0.75rem;
      }

      .results-grid {
        grid-template-columns: 1fr;
      }

      .nav-buttons {
        flex-wrap: wrap;
      }

      .step-buttons {
        flex-wrap: wrap;
      }
    }

    @media (max-width: 480px) {
      .player-grid {
        grid-template-columns: repeat(3, 1fr);
      }

      .options-grid.cols-4 {
        grid-template-columns: 1fr 1fr;
      }

      .genres-grid {
        gap: 0.5rem;
      }

      .genre-pill {
        padding: 0.5rem 1rem;
        font-size: 0.75rem;
      }

      .results-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class GameQuizComponent implements OnDestroy {
  // ---------- DI ----------
  private readonly recommendationService = inject(RecommendationService);

  // ---------- Signals ----------
  currentStep = signal(0);
  playerCount = signal<number | null>(null);
  timeAvailable = signal<'SHORT' | 'MEDIUM' | 'LONG' | 'UNLIMITED' | null>(null);
  experience = signal<'NOVATO' | 'INTERMEDIO' | 'EXPERTO' | null>(null);
  mood = signal<'COMPETIR' | 'COOPERAR' | 'REIR' | 'PENSAR' | null>(null);
  genres = signal<string[]>([]);
  showResults = signal(false);
  loading = signal(false);
  results = signal<JuegoExtended[]>([]);

  // ---------- Subscription ----------
  private resultsSub?: Subscription;

  // ---------- Static Data ----------
  readonly steps = [
    { index: 0, label: 'Jugadores' },
    { index: 1, label: 'Tiempo' },
    { index: 2, label: 'Nivel' },
    { index: 3, label: 'Objetivo' },
    { index: 4, label: 'Genero' },
  ];

  readonly playerOptions = [2, 3, 4, 5, 6, 7, 9]; // 9 represents "8+"

  readonly timeOptions = [
    { value: 'SHORT' as const, icon: 'fa-bolt', title: 'Rapido', desc: 'Menos de 30 minutos' },
    { value: 'MEDIUM' as const, icon: 'fa-clock', title: 'Normal', desc: '30 a 60 minutos' },
    { value: 'LONG' as const, icon: 'fa-hourglass-half', title: 'Largo', desc: '1 a 2 horas' },
    { value: 'UNLIMITED' as const, icon: 'fa-infinity', title: 'Sin limite', desc: 'Toda la tarde' },
  ];

  readonly experienceOptions = [
    { value: 'NOVATO' as const, icon: 'fa-seedling', title: 'Novato', desc: 'Primera vez o pocas partidas' },
    { value: 'INTERMEDIO' as const, icon: 'fa-chess-pawn', title: 'Intermedio', desc: 'Jugamos de vez en cuando' },
    { value: 'EXPERTO' as const, icon: 'fa-chess-king', title: 'Experto', desc: 'Nos gustan los juegos complejos' },
  ];

  readonly moodOptions = [
    { value: 'COMPETIR' as const, icon: 'fa-trophy', title: 'Competir', desc: 'Ganar al rival' },
    { value: 'COOPERAR' as const, icon: 'fa-handshake', title: 'Cooperar', desc: 'Jugar en equipo' },
    { value: 'REIR' as const, icon: 'fa-face-laugh-beam', title: 'Reirnos', desc: 'Diversion y risas' },
    { value: 'PENSAR' as const, icon: 'fa-brain', title: 'Pensar', desc: 'Estrategia y logica' },
  ];

  readonly genreOptions = [
    'ESTRATEGIA', 'FAMILIAR', 'PARTY', 'COOPERATIVO',
    'ROL', 'DEDUCCION', 'CARTAS', 'DADOS', 'ABSTRACTO',
  ];

  // ---------- Computed ----------
  canAdvance = computed(() => {
    switch (this.currentStep()) {
      case 0: return this.playerCount() !== null;
      case 1: return this.timeAvailable() !== null;
      case 2: return this.experience() !== null;
      case 3: return this.mood() !== null;
      case 4: return true; // genres are optional
      default: return false;
    }
  });

  // ---------- Selection Methods ----------
  selectPlayerCount(count: number): void {
    this.playerCount.set(count);
  }

  selectTime(value: 'SHORT' | 'MEDIUM' | 'LONG' | 'UNLIMITED'): void {
    this.timeAvailable.set(value);
  }

  selectExperience(value: 'NOVATO' | 'INTERMEDIO' | 'EXPERTO'): void {
    this.experience.set(value);
  }

  selectMood(value: 'COMPETIR' | 'COOPERAR' | 'REIR' | 'PENSAR'): void {
    this.mood.set(value);
  }

  toggleGenre(genre: string): void {
    const current = this.genres();
    if (current.includes(genre)) {
      this.genres.set(current.filter(g => g !== genre));
    } else {
      this.genres.set([...current, genre]);
    }
  }

  // ---------- Navigation ----------
  goBack(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(v => v - 1);
    }
  }

  goNext(): void {
    if (this.canAdvance() && this.currentStep() < 4) {
      this.currentStep.update(v => v + 1);
    }
  }

  skipStep(): void {
    if (this.currentStep() < 4) {
      this.currentStep.update(v => v + 1);
    } else {
      this.getResults();
    }
  }

  getResults(): void {
    this.showResults.set(true);
    this.loading.set(true);

    const answers: QuizAnswers = {
      playerCount: this.playerCount() === 9 ? 8 : (this.playerCount() ?? undefined),
      timeAvailable: this.timeAvailable() ?? undefined,
      experience: this.experience() ?? undefined,
      mood: this.mood() ?? undefined,
      genres: this.genres().length > 0 ? this.genres() : undefined,
    };

    this.resultsSub?.unsubscribe();
    this.resultsSub = this.recommendationService.getQuizResults(answers).subscribe({
      next: (games) => {
        this.results.set(games);
        this.loading.set(false);
      },
      error: () => {
        this.results.set([]);
        this.loading.set(false);
      },
    });
  }

  resetQuiz(): void {
    this.currentStep.set(0);
    this.playerCount.set(null);
    this.timeAvailable.set(null);
    this.experience.set(null);
    this.mood.set(null);
    this.genres.set([]);
    this.showResults.set(false);
    this.loading.set(false);
    this.results.set([]);
  }

  ngOnDestroy(): void {
    this.resultsSub?.unsubscribe();
  }
}
