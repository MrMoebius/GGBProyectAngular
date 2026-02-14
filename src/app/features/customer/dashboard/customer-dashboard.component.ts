import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { GameHistoryService } from '../../../core/services/game-history.service';
import { MockReservasService } from '../../../core/services/mock-reservas.service';
import { EventService } from '../../../core/services/event.service';
import { RecommendationService } from '../../../core/services/recommendation.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { RouterModule } from '@angular/router';
import { GameSession } from '../../../core/models/game-session.interface';
import { ReservasMesa } from '../../../core/models/reservas-mesa.interface';
import { EventSubscription, GGBEvent } from '../../../core/models/evento.interface';
import { JuegoExtended } from '../../../core/models/juego-extended.interface';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BeerLoaderComponent],
  template: `
    <app-beer-loader [isLoading]="isLoading()" />
    <div class="dashboard">
      <!-- Welcome -->
      <div class="welcome-section">
        <div class="welcome-avatar" (click)="fileInput.click()" title="Cambiar foto de perfil">
          @if (hasProfilePhoto()) {
            <img class="welcome-avatar-img" [src]="profilePhotoUrl()" (error)="onImageError()" alt="Foto de perfil">
          } @else {
            <span class="welcome-avatar-initial">{{ userInitial() }}</span>
          }
          <div class="welcome-avatar-overlay">
            <i class="fa-solid fa-camera"></i>
          </div>
        </div>
        <input #fileInput type="file" accept="image/jpeg,image/png,image/webp" hidden (change)="onFileSelected($event)">
        <h1 class="welcome-title">Bienvenido, {{ userName() }}!</h1>
        <p class="welcome-sub">Aqui tienes un resumen de tu actividad en Giber Games Bar</p>
      </div>

      <!-- Stats cards -->
      <div class="stats-grid">
        <a class="stat-card clickable" routerLink="/customer/historial">
          <div class="stat-icon icon-games">
            <i class="fa-solid fa-dice"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().totalGames }}</span>
            <span class="stat-label">Partidas jugadas</span>
          </div>
        </a>
        <a class="stat-card clickable" routerLink="/customer/historial">
          <div class="stat-icon icon-hours">
            <i class="fa-solid fa-clock"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().totalHours }}h</span>
            <span class="stat-label">Horas totales</span>
          </div>
        </a>
        <a class="stat-card clickable" routerLink="/public/juegos">
          <div class="stat-icon icon-genre">
            <i class="fa-solid fa-trophy"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().favoriteGenre }}</span>
            <span class="stat-label">Genero favorito</span>
          </div>
        </a>
        <a class="stat-card clickable" routerLink="/customer/historial">
          <div class="stat-icon icon-unique">
            <i class="fa-solid fa-gamepad"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().uniqueGames }}</span>
            <span class="stat-label">Juegos distintos</span>
          </div>
        </a>
      </div>

      <!-- Content grid -->
      <div class="content-grid">
        <!-- Recent games -->
        <section class="dashboard-card">
          <div class="card-header">
            <h2 class="card-title">
              <i class="fa-solid fa-clock-rotate-left"></i>
              Ultimos juegos
            </h2>
            <a class="card-action" routerLink="/customer/historial">Ver todo</a>
          </div>
          <div class="card-body">
            @if (recentGames().length === 0) {
              <p class="empty-text">Aun no has jugado ninguna partida.</p>
            } @else {
              <ul class="game-list">
                @for (session of recentGames(); track session.id) {
                  <li class="game-item">
                    <div class="game-item-left">
                      <span class="game-name">{{ session.gameName }}</span>
                      <span class="game-meta">{{ session.date }} &middot; {{ session.players }} jugadores</span>
                    </div>
                    <span class="game-duration">{{ formatDuration(session.duration) }}</span>
                  </li>
                }
              </ul>
            }
          </div>
        </section>

        <!-- Active reservations -->
        <section class="dashboard-card">
          <div class="card-header">
            <h2 class="card-title">
              <i class="fa-solid fa-calendar-check"></i>
              Reservas activas
            </h2>
            <a class="card-action" routerLink="/customer/reservas">Ver todo</a>
          </div>
          <div class="card-body">
            @if (activeReservations().length === 0) {
              <p class="empty-text">No tienes reservas activas.</p>
            } @else {
              <ul class="reservation-list">
                @for (res of activeReservations(); track res.id) {
                  <li class="reservation-item">
                    <div class="res-icon">
                      <i class="fa-solid fa-calendar"></i>
                    </div>
                    <div class="res-info">
                      <span class="res-date">{{ res.fechaReserva }} a las {{ res.horaInicio }}</span>
                      <span class="res-detail">Mesa {{ res.idMesa }} &middot; {{ res.numPersonas }} personas</span>
                      @if (res.notas) {
                        <span class="res-notes">{{ res.notas }}</span>
                      }
                    </div>
                    <span class="status-badge badge-confirmed">Confirmada</span>
                  </li>
                }
              </ul>
            }
          </div>
        </section>

        <!-- Subscribed events -->
        <section class="dashboard-card">
          <div class="card-header">
            <h2 class="card-title">
              <i class="fa-solid fa-ticket"></i>
              Proximos eventos inscritos
            </h2>
            <a class="card-action" routerLink="/public/eventos">Ver eventos</a>
          </div>
          <div class="card-body">
            @if (subscribedEvents().length === 0) {
              <p class="empty-text">No estas inscrito en ningun evento.</p>
            } @else {
              <ul class="event-list">
                @for (sub of subscribedEvents(); track sub.id) {
                  <li class="event-item">
                    <div class="event-icon">
                      <i class="fa-solid fa-star"></i>
                    </div>
                    <div class="event-info">
                      <span class="event-title">Evento #{{ sub.eventId }}</span>
                      <span class="event-status">
                        @switch (sub.status) {
                          @case ('CONFIRMED') { Confirmado }
                          @case ('WAITLIST') { Lista de espera }
                        }
                      </span>
                    </div>
                  </li>
                }
              </ul>
            }
          </div>
        </section>

        <!-- Daily pick -->
        <section class="dashboard-card daily-pick">
          <div class="card-header">
            <h2 class="card-title">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
              Recomendacion del dia
            </h2>
          </div>
          <div class="card-body">
            @if (dailyPick()) {
              <div class="pick-card">
                <div class="pick-badge">
                  <i class="fa-solid fa-fire"></i> Hoy te recomendamos
                </div>
                <h3 class="pick-name">{{ dailyPick()!.nombre }}</h3>
                <p class="pick-desc">{{ dailyPick()!.descripcion | slice:0:120 }}...</p>
                <div class="pick-meta">
                  <span><i class="fa-solid fa-users"></i> {{ dailyPick()!.minJugadores }}-{{ dailyPick()!.maxJugadores }}</span>
                  <span><i class="fa-solid fa-clock"></i> {{ dailyPick()!.duracionMediaMin }} min</span>
                  <span><i class="fa-solid fa-layer-group"></i> {{ dailyPick()!.genero }}</span>
                </div>
                <a class="btn-pick" [routerLink]="'/public/juegos/' + dailyPick()!.id">
                  Ver detalles <i class="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            } @else {
              <p class="empty-text">Cargando recomendacion...</p>
            }
          </div>
        </section>
      </div>

      <!-- Personalized recommendations -->
      <section class="recommendations-section">
        <h2 class="section-heading">
          <i class="fa-solid fa-lightbulb"></i>
          Recomendaciones para ti
        </h2>
        <div class="recommendations-grid">
          @for (game of recommendations(); track game.id) {
            <a class="rec-card" [routerLink]="'/public/juegos/' + game.id">
              <div class="rec-genre">{{ game.genero }}</div>
              <h3 class="rec-name">{{ game.nombre }}</h3>
              <div class="rec-meta">
                <span><i class="fa-solid fa-users"></i> {{ game.minJugadores }}-{{ game.maxJugadores }}</span>
                <span><i class="fa-solid fa-clock"></i> {{ game.duracionMediaMin }} min</span>
              </div>
              @if (game.rating) {
                <div class="rec-rating">
                  <i class="fa-solid fa-star"></i> {{ game.rating.toFixed(1) }}
                </div>
              }
            </a>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    /* ===== Dashboard container ===== */
    .dashboard {
      max-width: 1100px;
      margin: 0 auto;
    }

    /* ===== Welcome ===== */
    .welcome-section {
      margin-bottom: 2rem;
      text-align: center;
    }

    .welcome-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--neon-cyan, #00FFD1), var(--neon-pink, #FF6B9D));
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      position: relative;
      cursor: pointer;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 255, 209, 0.2), 0 4px 20px rgba(255, 107, 157, 0.2);
    }

    .welcome-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .welcome-avatar-initial {
      font-size: 2.5rem;
      font-weight: 800;
      color: #0F172A;
      text-transform: uppercase;
    }

    .welcome-avatar-overlay {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .welcome-avatar-overlay i {
      color: #fff;
      font-size: 1.5rem;
    }

    .welcome-avatar:hover .welcome-avatar-overlay {
      opacity: 1;
    }

    .welcome-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-main);
      margin: 0 0 0.35rem;
    }

    .welcome-sub {
      font-size: 0.9rem;
      color: var(--text-muted, #94a3b8);
      margin: 0;
    }

    /* ===== Stats grid ===== */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background-color: var(--card-bg, #1E293B);
      border: 1px solid var(--card-border, rgba(255,255,255,0.08));
      border-radius: var(--radius-lg, 16px);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }

    .clickable {
      text-decoration: none;
      cursor: pointer;
      color: inherit;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md, 8px);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .icon-games { background-color: rgba(16, 185, 129, 0.12); color: #10B981; }
    .icon-hours { background-color: rgba(255, 127, 80, 0.12); color: var(--primary-coral); }
    .icon-genre { background-color: rgba(255, 107, 157, 0.12); color: #FF6B9D; }
    .icon-unique { background-color: rgba(139, 92, 246, 0.12); color: #A78BFA; }

    :host-context([data-theme="dark"]) .icon-games { background-color: rgba(0, 255, 209, 0.12); color: var(--neon-cyan, #00FFD1); }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted, #94a3b8);
      margin-top: 0.15rem;
    }

    /* ===== Content grid ===== */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    /* ===== Dashboard card ===== */
    .dashboard-card {
      background-color: var(--card-bg, #1E293B);
      border: 1px solid var(--card-border, rgba(255,255,255,0.08));
      border-radius: var(--radius-lg, 16px);
      overflow: hidden;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--card-border, rgba(255,255,255,0.08));
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0;
    }

    .card-title i {
      font-size: 0.9rem;
      color: var(--primary-coral);
    }

    :host-context([data-theme="dark"]) .card-title i {
      color: var(--neon-cyan, #00FFD1);
    }

    .card-action {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--primary-coral, #FF6B6B);
      text-decoration: none;
      transition: color 0.2s;
    }

    .card-action:hover {
      color: var(--primary-hover, #FF5252);
    }

    .card-body {
      padding: 1rem 1.25rem;
    }

    .empty-text {
      color: var(--text-muted, #94a3b8);
      font-size: 0.85rem;
      text-align: center;
      padding: 1rem 0;
      margin: 0;
    }

    /* ===== Game list ===== */
    .game-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .game-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 0;
      border-bottom: 1px solid var(--card-border);
    }

    .game-item:last-child { border-bottom: none; }

    .game-item-left {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .game-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .game-meta {
      font-size: 0.75rem;
      color: var(--text-muted, #94a3b8);
    }

    .game-duration {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--primary-coral);
      white-space: nowrap;
    }

    :host-context([data-theme="dark"]) .game-duration {
      color: var(--neon-cyan, #00FFD1);
    }

    /* ===== Reservation list ===== */
    .reservation-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .reservation-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .res-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm, 6px);
      background-color: rgba(255, 127, 80, 0.1);
      color: var(--primary-coral);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    :host-context([data-theme="dark"]) .res-icon {
      background-color: rgba(0, 255, 209, 0.1);
      color: var(--neon-cyan, #00FFD1);
    }

    .res-info {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      flex: 1;
      min-width: 0;
    }

    .res-date {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .res-detail {
      font-size: 0.75rem;
      color: var(--text-muted, #94a3b8);
    }

    .res-notes {
      font-size: 0.7rem;
      color: var(--text-muted, #94a3b8);
      font-style: italic;
    }

    .status-badge {
      flex-shrink: 0;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .badge-confirmed {
      background-color: var(--success-bg, rgba(34,197,94,0.12));
      color: var(--success, #22C55E);
      border: 1px solid var(--success, #22C55E);
    }

    /* ===== Event list ===== */
    .event-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .event-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .event-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm, 6px);
      background-color: rgba(255, 107, 157, 0.1);
      color: var(--neon-pink, #FF6B9D);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    .event-info {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .event-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .event-status {
      font-size: 0.75rem;
      color: var(--text-muted, #94a3b8);
    }

    /* ===== Daily pick ===== */
    .daily-pick .card-body {
      padding: 0;
    }

    .pick-card {
      padding: 1.25rem;
      background: linear-gradient(135deg, rgba(0, 255, 209, 0.05), rgba(255, 107, 157, 0.05));
    }

    .pick-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      background-color: rgba(255, 107, 107, 0.15);
      color: var(--primary-coral, #FF6B6B);
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-bottom: 0.75rem;
    }

    .pick-name {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--text-main);
      margin: 0 0 0.5rem;
    }

    .pick-desc {
      font-size: 0.825rem;
      color: var(--text-muted, #94a3b8);
      line-height: 1.5;
      margin: 0 0 0.75rem;
    }

    .pick-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .pick-meta span {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.8rem;
      color: var(--text-muted, #94a3b8);
    }

    .pick-meta i {
      font-size: 0.7rem;
      color: var(--primary-coral);
    }

    :host-context([data-theme="dark"]) .pick-meta i {
      color: var(--neon-cyan, #00FFD1);
    }

    .btn-pick {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 1.25rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #fff;
      background-color: var(--primary-coral, #FF6B6B);
      border: none;
      border-radius: var(--radius-md, 8px);
      text-decoration: none;
      transition: background-color 0.2s, transform 0.15s;
    }

    .btn-pick:hover {
      background-color: var(--primary-hover, #FF5252);
      transform: translateY(-1px);
    }

    .btn-pick i { font-size: 0.75rem; }

    /* ===== Recommendations section ===== */
    .recommendations-section {
      margin-bottom: 2rem;
    }

    .section-heading {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 1rem;
    }

    .section-heading i {
      color: var(--primary-coral);
    }

    :host-context([data-theme="dark"]) .section-heading i {
      color: var(--neon-cyan, #00FFD1);
    }

    .recommendations-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .rec-card {
      display: flex;
      flex-direction: column;
      padding: 1.25rem;
      background-color: var(--card-bg, #1E293B);
      border: 1px solid var(--card-border, rgba(255,255,255,0.08));
      border-radius: var(--radius-lg, 16px);
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }

    .rec-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      border-color: var(--primary-coral);
    }

    :host-context([data-theme="dark"]) .rec-card:hover {
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
      border-color: rgba(0, 255, 209, 0.15);
    }

    .rec-genre {
      display: inline-flex;
      align-self: flex-start;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      background-color: rgba(255, 127, 80, 0.1);
      color: var(--primary-coral);
      margin-bottom: 0.75rem;
    }

    :host-context([data-theme="dark"]) .rec-genre {
      background-color: rgba(0, 255, 209, 0.1);
      color: var(--neon-cyan, #00FFD1);
    }

    .rec-name {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 0.5rem;
    }

    .rec-meta {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .rec-meta span {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--text-muted, #94a3b8);
    }

    .rec-meta i { font-size: 0.65rem; }

    .rec-rating {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: #FBBF24;
      margin-top: auto;
    }

    .rec-rating i { font-size: 0.7rem; }

    /* ===== Responsive ===== */
    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .recommendations-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .recommendations-grid {
        grid-template-columns: 1fr;
      }

      .welcome-title {
        font-size: 1.35rem;
      }

      .pick-meta {
        flex-wrap: wrap;
        gap: 0.5rem;
      }
    }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private clienteService = inject(ClienteService);
  private gameHistory = inject(GameHistoryService);
  private reservasService = inject(MockReservasService);
  private eventService = inject(EventService);
  private recommendationService = inject(RecommendationService);
  private favoritesService = inject(FavoritesService);

  isLoading = signal(true);
  userName = signal('Usuario');
  private imageVersion = signal(Date.now());
  hasProfilePhoto = signal(false);

  userInitial = computed(() => {
    const user = this.authService.currentUser();
    if (user && 'nombre' in user && (user as any).nombre) {
      return (user as any).nombre.charAt(0).toUpperCase();
    }
    if (user && 'email' in user && user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  });

  profilePhotoUrl = computed(() => {
    const user = this.authService.currentUser();
    const id = (user as any)?.id;
    if (!id) return '';
    return this.clienteService.getFotoPerfilUrl(id) + '?v=' + this.imageVersion();
  });

  stats = signal<{ totalGames: number; totalHours: number; favoriteGenre: string; uniqueGames: number }>({
    totalGames: 0, totalHours: 0, favoriteGenre: '-', uniqueGames: 0
  });
  recentGames = signal<GameSession[]>([]);
  activeReservations = signal<ReservasMesa[]>([]);
  subscribedEvents = signal<EventSubscription[]>([]);
  dailyPick = signal<JuegoExtended | null>(null);
  recommendations = signal<JuegoExtended[]>([]);

  ngOnInit(): void {
    // User name & profile photo
    const user = this.authService.currentUser();
    if (user && 'nombre' in user && (user as any).nombre) {
      this.userName.set((user as any).nombre);
    } else if (user?.email) {
      this.userName.set(user.email.split('@')[0]);
    }
    if ((user as any)?.id) {
      this.hasProfilePhoto.set(true);
    }

    // Stats
    this.stats.set(this.gameHistory.getStats());

    // Recent games
    this.recentGames.set(this.gameHistory.getRecent(5));

    // Active reservations
    this.reservasService.getByCliente(1).subscribe(reservas => {
      this.activeReservations.set(reservas.filter(r => r.estado === 'CONFIRMADA'));
    });

    // Subscribed events
    this.eventService.getSubscriptionsByUser('current_user').subscribe(subs => {
      this.subscribedEvents.set(subs);
    });

    // Daily pick
    this.recommendationService.getDailyPick().subscribe(game => {
      this.dailyPick.set(game);
    });

    // Personalized recommendations
    const gameIds = this.gameHistory.getAll().map(s => s.gameId);
    this.recommendationService.getPersonalized(gameIds, 3).subscribe(games => {
      this.recommendations.set(games);
      this.isLoading.set(false);
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.clienteService.uploadFotoPerfil(file).subscribe({
      next: () => {
        this.imageVersion.set(Date.now());
        this.hasProfilePhoto.set(true);
      },
      error: (err) => console.error('Error al subir foto de perfil:', err)
    });
  }

  onImageError(): void {
    this.hasProfilePhoto.set(false);
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
}
