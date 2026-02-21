import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { GameHistoryService } from '../../../core/services/game-history.service';
import { ReservasMesaService } from '../../../core/services/reservas-mesa.service';
import { EventService } from '../../../core/services/event.service';
import { RecommendationService } from '../../../core/services/recommendation.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { SesionMesaService } from '../../../core/services/sesion-mesa.service';
import { JuegoService } from '../../../core/services/juego.service';
import { SesionMesa } from '../../../core/models/sesion-mesa.interface';
import { RouterModule } from '@angular/router';
import { GameSession } from '../../../core/models/game-session.interface';
import { ReservasMesa } from '../../../core/models/reservas-mesa.interface';
import { EventSubscription, GGBEvent } from '../../../core/models/evento.interface';
import { JuegoExtended } from '../../../core/models/juego-extended.interface';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';
import { GameCardPublicComponent } from '../../../shared/components/game-card-public/game-card-public.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BeerLoaderComponent, GameCardPublicComponent],
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

      <!-- Sesion Activa Banner -->
      @if (sesionActiva()) {
        <a class="active-session-banner" routerLink="/customer/mi-sesion">
          <div class="session-banner-left">
            <i class="fa-solid fa-utensils session-banner-icon"></i>
            <div>
              <h3 class="session-banner-title">Sesion Activa - Mesa {{ sesionActiva()!.idMesa }}</h3>
              <p class="session-banner-sub">{{ sesionActiva()!.numComensales }} comensales</p>
            </div>
          </div>
          <span class="session-banner-action">
            <i class="fa-solid fa-receipt"></i> Gestionar Pedidos
          </span>
        </a>
      }

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
            @if (futureReservations().length === 0) {
              <p class="empty-text">No tienes reservas activas.</p>
            } @else {
              <ul class="reservation-list">
                @for (res of futureReservations(); track res.id) {
                  <li class="reservation-item">
                    <div class="res-icon">
                      <i class="fa-solid fa-calendar"></i>
                    </div>
                    <div class="res-info">
                      <span class="res-date">{{ formatDate(res.fechaHoraInicio) }} a las {{ formatTime(res.fechaHoraInicio) }}</span>
                      <span class="res-detail">Mesa {{ res.idMesa }} &middot; {{ res.numPersonas }} personas</span>
                      @if (res.notas) {
                        <span class="res-notes">{{ res.notas }}</span>
                      }
                    </div>
                    <button class="btn-cancel-res" (click)="cancelReserva(res.id, $event)" title="Cancelar reserva">
                      <i class="fa-solid fa-xmark"></i>
                    </button>
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
              Tus proximos eventos
            </h2>
            <a class="card-action" routerLink="/public/eventos">Ver eventos</a>
          </div>
          <div class="card-body">
            @if (enrichedSubscriptions().length === 0) {
              <p class="empty-text">No estas inscrito en ningun evento.</p>
            } @else {
              <ul class="event-list">
                @for (sub of enrichedSubscriptions(); track sub.id) {
                  <img class="event-img-probe" [src]="eventService.getImageUrl(sub.eventId)" (load)="onEventImageLoad(sub.eventId)" (error)="$event" />
                  <a class="event-item" [class.event-item-with-bg]="eventHasImage(sub.eventId)" [routerLink]="'/public/eventos/' + sub.eventId"
                     [style.background-image]="eventHasImage(sub.eventId) ? 'url(' + eventService.getImageUrl(sub.eventId) + ')' : ''">
                    @if (eventHasImage(sub.eventId)) { <div class="event-item-overlay"></div> }
                    <div class="event-item-content">
                      <div class="event-icon" [class.event-icon-finished]="sub.finished">
                        <i class="fa-solid" [class.fa-star]="!sub.finished" [class.fa-flag-checkered]="sub.finished"></i>
                      </div>
                      <div class="event-info">
                        <span class="event-title">{{ sub.title }}</span>
                        <span class="event-date">{{ sub.date }} a las {{ sub.time }}</span>
                        <div class="event-meta">
                          <span class="event-status" [class.event-status-finished]="sub.finished" [class.event-status-waitlist]="sub.status === 'WAITLIST'">
                            @if (sub.finished) {
                              Finalizado
                            } @else {
                              @switch (sub.status) {
                                @case ('CONFIRMED') { Confirmado }
                                @case ('WAITLIST') { Lista de espera }
                              }
                            }
                          </span>
                          <span class="event-capacity">
                            <i class="fa-solid fa-users"></i> {{ sub.currentAttendees }}/{{ sub.capacity }}
                          </span>
                        </div>
                      </div>
                      <i class="fa-solid fa-chevron-right event-arrow"></i>
                    </div>
                  </a>
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

      <section class="dashboard-section">
        <div class="section-header">
          <h2 class="section-heading">
            <i class="fa-solid fa-heart"></i>
            Tus Favoritos
          </h2>
          <a class="card-action" routerLink="/public/juegos">Explorar catalogo</a>
        </div>
        @if (favoriteGames().length === 0) {
          <div class="empty-banner">
            <i class="fa-regular fa-heart"></i>
            <p>No tienes favoritos aun. <a routerLink="/public/juegos">Explora el catalogo!</a></p>
          </div>
        } @else {
          <div class="favorites-grid">
            @for (game of favoriteGames(); track game.id) {
              <app-game-card-public [game]="game" />
            }
          </div>
        }
      </section>

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

    /* ===== Favorites section ===== */
    .dashboard-section {
      margin-bottom: 2rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }

    .empty-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem;
      background-color: var(--card-bg, #1E293B);
      border: 1px solid var(--card-border, rgba(255,255,255,0.08));
      border-radius: var(--radius-lg, 16px);
      color: var(--text-muted, #94a3b8);
      font-size: 0.875rem;
    }

    .empty-banner i {
      font-size: 1.5rem;
      opacity: 0.4;
    }

    .empty-banner a {
      color: var(--neon-cyan, #00FFD1);
      text-decoration: none;
      font-weight: 600;
    }

    .empty-banner a:hover {
      text-decoration: underline;
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

    /* ===== Section heading ===== */
    .section-heading {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0;
    }

    .section-heading i {
      color: var(--primary-coral);
    }

    :host-context([data-theme="dark"]) .section-heading i {
      color: var(--neon-cyan, #00FFD1);
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

    .btn-cancel-res {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.08);
      color: #EF4444;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      transition: all 0.2s;
      align-self: center;
    }

    .btn-cancel-res:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: #EF4444;
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

    .event-img-probe {
      display: none;
    }

    .event-item {
      display: block;
      text-decoration: none;
      padding: 0.5rem;
      border-radius: var(--radius-md, 8px);
      transition: background-color 0.2s, transform 0.2s;
      position: relative;
      overflow: hidden;
    }

    .event-item-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      position: relative;
      z-index: 1;
    }

    .event-item:hover {
      background-color: rgba(255, 255, 255, 0.04);
    }

    .event-item-with-bg {
      background-size: cover;
      background-position: center;
      padding: 0.75rem;
      min-height: 72px;
    }

    .event-item-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.7) 100%);
      z-index: 0;
      border-radius: var(--radius-md, 8px);
    }

    .event-item-with-bg .event-title {
      color: #FFFFFF;
    }

    .event-item-with-bg .event-date {
      color: #CBD5E1;
    }

    .event-item-with-bg .event-arrow {
      color: rgba(255, 255, 255, 0.5);
    }

    .event-item-with-bg:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
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

    .event-icon-finished {
      background-color: rgba(148, 163, 184, 0.1);
      color: var(--text-muted, #94a3b8);
    }

    .event-info {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      flex: 1;
      min-width: 0;
    }

    .event-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .event-date {
      font-size: 0.75rem;
      color: var(--text-muted, #94a3b8);
    }

    .event-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .event-status {
      font-size: 0.7rem;
      color: var(--neon-cyan, #00FFD1);
      font-weight: 600;
    }

    .event-status-finished {
      color: var(--text-muted, #94a3b8);
    }

    .event-status-waitlist {
      color: #FACC15;
    }

    .event-capacity {
      font-size: 0.7rem;
      color: var(--text-muted, #94a3b8);
    }

    .event-capacity i {
      font-size: 0.6rem;
      margin-right: 0.15rem;
    }

    .event-arrow {
      font-size: 0.65rem;
      color: var(--text-muted, #94a3b8);
      flex-shrink: 0;
      transition: color 0.2s;
    }

    .event-item:hover .event-arrow {
      color: var(--neon-cyan, #00FFD1);
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

    .recommendations-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 1rem;
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

      .favorites-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
      .content-grid { grid-template-columns: 1fr; gap: 1rem; }
      .recommendations-grid { grid-template-columns: 1fr; }
      .favorites-grid { grid-template-columns: repeat(2, 1fr); }
      .welcome-title { font-size: 1.5rem; }
      .welcome-sub { font-size: 0.825rem; }
      .welcome-avatar { width: 80px; height: 80px; }
      .welcome-avatar-initial { font-size: 2rem; }
      .stat-card { padding: 0.875rem; }
      .stat-value { font-size: 1.15rem; }
      .stat-icon { width: 40px; height: 40px; font-size: 1.1rem; }
      .card-header { padding: 0.75rem 1rem; }
      .card-body { padding: 0.75rem 1rem; }
      .section-heading { font-size: 1rem; }
      .pick-name { font-size: 1.05rem; }
      .pick-desc { font-size: 0.8rem; }
      .pick-meta { flex-wrap: wrap; gap: 0.5rem; }
      .rec-card { padding: 1rem; }
      .rec-name { font-size: 0.95rem; }
      .active-session-banner { flex-direction: column; gap: 0.75rem; align-items: flex-start; padding: 0.875rem 1rem; }
      .session-banner-action { width: 100%; justify-content: center; }
    }

    @media (max-width: 480px) {
      .stats-grid { grid-template-columns: 1fr; gap: 0.5rem; }
      .recommendations-grid { grid-template-columns: 1fr; }
      .favorites-grid { grid-template-columns: 1fr; }
      .welcome-section { margin-bottom: 1.25rem; }
      .welcome-title { font-size: 1.2rem; }
      .welcome-sub { font-size: 0.8rem; }
      .welcome-avatar { width: 64px; height: 64px; margin-bottom: 0.75rem; }
      .welcome-avatar-initial { font-size: 1.6rem; }
      .stat-card { padding: 0.75rem; gap: 0.75rem; }
      .stat-value { font-size: 1.1rem; }
      .stat-label { font-size: 0.7rem; }
      .stat-icon { width: 36px; height: 36px; font-size: 1rem; }
      .content-grid { gap: 0.75rem; margin-bottom: 1.25rem; }
      .card-header { padding: 0.625rem 0.875rem; }
      .card-title { font-size: 0.875rem; }
      .card-body { padding: 0.625rem 0.875rem; }
      .card-action { font-size: 0.75rem; }
      .section-heading { font-size: 0.95rem; }
      .game-name { font-size: 0.8125rem; }
      .game-meta { font-size: 0.7rem; }
      .game-duration { font-size: 0.75rem; }
      .res-date { font-size: 0.8rem; }
      .res-detail { font-size: 0.7rem; }
      .event-title { font-size: 0.8rem; }
      .event-date { font-size: 0.7rem; }
      .pick-card { padding: 0.875rem; }
      .pick-badge { font-size: 0.65rem; padding: 0.2rem 0.6rem; }
      .pick-name { font-size: 1rem; }
      .pick-desc { font-size: 0.775rem; line-height: 1.4; }
      .pick-meta span { font-size: 0.75rem; }
      .btn-pick { font-size: 0.8rem; padding: 0.5rem 1rem; width: 100%; justify-content: center; }
      .rec-card { padding: 0.875rem; }
      .rec-name { font-size: 0.925rem; }
      .rec-meta span { font-size: 0.7rem; }
      .empty-banner { padding: 1rem; font-size: 0.8125rem; }
      .session-banner-title { font-size: 0.875rem; }
      .session-banner-sub { font-size: 0.75rem; }
      .session-banner-icon { font-size: 1.25rem; }
      .session-banner-action { font-size: 0.75rem; padding: 0.4rem 0.875rem; }
    }

    /* Active Session Banner */
    .active-session-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      background: linear-gradient(135deg, rgba(0, 255, 209, 0.08), rgba(0, 255, 209, 0.02));
      border: 1px solid rgba(0, 255, 209, 0.25);
      border-radius: var(--radius-lg, 16px);
      margin-bottom: 1rem;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
    }
    .active-session-banner:hover {
      border-color: rgba(0, 255, 209, 0.5);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(0, 255, 209, 0.1);
    }
    .session-banner-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .session-banner-icon {
      font-size: 1.5rem;
      color: var(--neon-cyan, #00FFD1);
    }
    .session-banner-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0;
    }
    .session-banner-sub {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin: 0.125rem 0 0;
    }
    .session-banner-action {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md, 8px);
      background-color: var(--neon-cyan, #00FFD1);
      color: #0F172A;
      font-size: 0.8125rem;
      font-weight: 700;
      white-space: nowrap;
    }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private clienteService = inject(ClienteService);
  private gameHistory = inject(GameHistoryService);
  private reservasService = inject(ReservasMesaService);
  protected eventService = inject(EventService);
  private loadedEventImages = signal<Set<number>>(new Set());
  private recommendationService = inject(RecommendationService);
  private favoritesService = inject(FavoritesService);
  private sesionMesaService = inject(SesionMesaService);
  private juegoService = inject(JuegoService);

  isLoading = signal(true);
  userName = signal('Usuario');
  sesionActiva = signal<SesionMesa | null>(null);
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
  allEvents = signal<GGBEvent[]>([]);
  dailyPick = signal<JuegoExtended | null>(null);
  recommendations = signal<JuegoExtended[]>([]);
  allGames = signal<JuegoExtended[]>([]);

  enrichedSubscriptions = computed(() => {
    const subs = this.subscribedEvents();
    const events = this.allEvents();
    const now = new Date();
    return subs.map(sub => {
      const event = events.find(e => e.id === sub.eventId);
      let finished = false;
      if (event) {
        const endStr = event.date + 'T' + (event.endTime ?? event.time) + ':00';
        finished = new Date(endStr) < now;
      }
      return {
        ...sub,
        title: event?.title ?? `Evento #${sub.eventId}`,
        date: event?.date ?? '',
        time: event?.time ?? '',
        capacity: event?.capacity ?? 0,
        currentAttendees: event?.currentAttendees ?? 0,
        finished
      };
    });
  });

  favoriteGames = computed(() => {
    const favIds = this.favoritesService.favorites();
    return this.allGames().filter(g => favIds.includes(g.id));
  });

  futureReservations = computed(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    return this.activeReservations().filter(r => {
      if (r.fechaReserva > today) return true;
      if (r.fechaReserva === today) {
        return r.horaInicio >= now.toTimeString().slice(0, 5);
      }
      return false;
    });
  });

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
    this.reservasService.getByCliente().subscribe(reservas => {
      this.activeReservations.set(reservas.filter(r => r.estado === 'CONFIRMADA' || r.estado === 'PENDIENTE'));
    });

    this.eventService.getAll().subscribe(events => {
      this.allEvents.set(events);
    });

    // Subscribed events
    const userEmail = user?.email ?? 'anonymous';
    this.eventService.getSubscriptionsByUser(userEmail).subscribe(subs => {
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

    // Active session
    this.sesionMesaService.getMiSesion().subscribe({
      next: (sesion) => this.sesionActiva.set(sesion),
      error: () => {}
    });

    this.juegoService.getAll().subscribe(games => {
      this.allGames.set(games);
    });
  }

  cancelReserva(id: number, event: Event): void {
    event.stopPropagation();
    this.reservasService.cancel(id).subscribe(() => {
      this.activeReservations.update(list => list.filter(r => r.id !== id));
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

  onEventImageLoad(eventId: number): void {
    this.loadedEventImages.update(set => {
      const copy = new Set(set);
      copy.add(eventId);
      return copy;
    });
  }

  eventHasImage(eventId: number): boolean {
    return this.loadedEventImages().has(eventId);
  }

  formatDate(isoStr: string): string {
    return ReservasMesaService.extractDate(isoStr);
  }

  formatTime(isoStr: string): string {
    return ReservasMesaService.extractTime(isoStr);
  }
}
