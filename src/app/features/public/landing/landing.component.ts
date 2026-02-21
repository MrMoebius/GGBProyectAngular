import { Component, computed, inject, OnInit, OnDestroy, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JuegoService } from '../../../core/services/juego.service';
import { RecommendationService } from '../../../core/services/recommendation.service';
import { MesaService } from '../../../core/services/mesa.service';
import { EventService } from '../../../core/services/event.service';
import { ProductoService } from '../../../core/services/producto.service';
import { JuegoExtended } from '../../../core/models/juego-extended.interface';
import { Mesa } from '../../../core/models/mesa.interface';
import { GGBEvent } from '../../../core/models/evento.interface';
import { Producto } from '../../../core/models/producto.interface';
import { GameCardPublicComponent } from '../../../shared/components/game-card-public/game-card-public.component';
import { AuthService } from '../../../core/services/auth.service';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, GameCardPublicComponent, BeerLoaderComponent],
  template: `
    <app-beer-loader [isLoading]="isLoading()" />
    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg">
        @for (slide of heroSlides; track slide; let i = $index) {
          <img
            class="hero-slide"
            [src]="slide"
            [class.active]="i === currentSlide()"
            alt=""
          />
        }
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <h1 class="hero-title animate-fade-in-up">
          Tu espacio para <span class="hero-highlight">jugar</span>,
          <span class="hero-highlight">comer</span> y
          <span class="hero-highlight">disfrutar</span>
        </h1>
        <p class="hero-subtitle animate-fade-in-up">
          Mas de 200 juegos de mesa, comida artesanal y el mejor ambiente gaming de Alcorcon
        </p>
        <div class="hero-actions animate-fade-in-up">
          <a routerLink="/public/juegos" class="btn btn-primary btn-lg">
            <i class="fa-solid fa-dice"></i> Explorar Juegos
          </a>
          <a routerLink="/public/reservas" class="btn btn-outline btn-lg">
            <i class="fa-solid fa-calendar-check"></i> Reservar Mesa
          </a>
        </div>
        @if (mesaStats().total > 0) {
          <div class="hero-stats">
            <div class="hero-stat">
              <span class="hero-stat-number">{{ mesaStats().libres }}</span>
              <span class="hero-stat-label">Mesas libres</span>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <span class="hero-stat-number">{{ featuredGames().length > 0 ? '330+' : '...' }}</span>
              <span class="hero-stat-label">Juegos</span>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <span class="hero-stat-number">{{ upcomingEvents().length }}</span>
              <span class="hero-stat-label">Eventos proximos</span>
            </div>
          </div>
        }
      </div>
      <div class="hero-dots">
        @for (slide of heroSlides; track slide; let i = $index) {
          <button
            class="hero-dot"
            [class.active]="i === currentSlide()"
            (click)="goToSlide(i)"
            [attr.aria-label]="'Imagen ' + (i + 1)"
          ></button>
        }
      </div>
      <div class="hero-scroll-indicator">
        <i class="fa-solid fa-chevron-down"></i>
      </div>
    </section>

    <!-- JUEGOS DESTACADOS -->
    <section class="section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Juegos Destacados</h2>
          <p class="section-subtitle">Los favoritos de nuestros jugadores</p>
        </div>
        <div class="section-header-actions">
          <button class="btn btn-ghost" (click)="startRoulette()" [disabled]="rouletteActive()">
            <i class="fa-solid fa-shuffle"></i> Modo Ruleta
          </button>
          <a routerLink="/public/juegos" class="btn btn-ghost">
            Ver todos <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </div>
      <div class="games-showcase" #gamesScroll>
        @for (game of featuredGames(); track game.id; let i = $index) {
          <div
            class="games-showcase-item"
            [class.center]="getGameState(i) === 'center'"
            [class.peek-left]="getGameState(i) === 'peek-left'"
            [class.peek-right]="getGameState(i) === 'peek-right'"
            [class.far-left]="getGameState(i) === 'far-left'"
            [class.far-right]="getGameState(i) === 'far-right'"
            [class.roulette-highlight]="rouletteActive() && rouletteIndex() === i"
            (click)="onGameCardClick(i)"
          >
            <app-game-card-public [game]="game" />
          </div>
        }
      </div>
    </section>

    <!-- JUEGO DEL DIA -->
    @if (dailyPick()) {
      <section class="daily-section">
        <div class="section daily-inner">
          <div class="daily-content">
            <span class="daily-badge">
              <i class="fa-solid fa-star"></i> Juego del dia
            </span>
            <h2 class="daily-title">{{ dailyPick()!.nombre }}</h2>
            <p class="daily-desc" [class.clamped]="!dailyDescExpanded()">{{ dailyPick()!.descripcion }}</p>
            <button class="daily-read-more" (click)="dailyDescExpanded.set(!dailyDescExpanded())">
              {{ dailyDescExpanded() ? 'Ver menos' : 'Ver más' }}
            </button>
            <div class="daily-meta">
              <span><i class="fa-solid fa-users"></i> {{ dailyPick()!.minJugadores }}-{{ dailyPick()!.maxJugadores }} jugadores</span>
              <span><i class="fa-solid fa-clock"></i> {{ dailyPick()!.duracionMediaMin }} min</span>
              <span><i class="fa-solid fa-signal"></i> {{ dailyPick()!.complejidad }}</span>
            </div>
            <div class="daily-actions">
              <a [routerLink]="['/public/juegos', dailyPick()!.id]" class="btn btn-primary">
                Ver detalles
              </a>
              <a routerLink="/public/encuentra-tu-juego" class="btn btn-outline">
                <i class="fa-solid fa-wand-magic-sparkles"></i> No sabes que jugar?
              </a>
            </div>
          </div>
          <div class="daily-visual">
            @if (dailyPick()!.imagenUrl) {
              <img class="daily-img" [src]="dailyPick()!.imagenUrl" [alt]="dailyPick()!.nombre" />
            } @else {
              <div class="daily-card-large">
                <i class="fa-solid fa-dice-d20"></i>
                <span class="daily-genre">{{ dailyPick()!.genero }}</span>
              </div>
            }
          </div>
        </div>
      </section>
    }

    <!-- TARIFAS LUDOTECA -->
    @if (ludotecaTarifas().length > 0) {
      <section class="ludoteca-section">
        <div class="section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Ludoteca</h2>
              <p class="section-subtitle">Elige tu modo de juego y disfruta de nuestra coleccion</p>
            </div>
          </div>
          <div class="ludoteca-grid">
            @for (tarifa of ludotecaTarifas(); track tarifa.id) {
              <div class="ludoteca-card">
                <div class="ludoteca-card-img">
                  <img [src]="getLudotecaImage(tarifa.nombre)" [alt]="tarifa.nombre" />
                  <div class="ludoteca-card-img-overlay"></div>
                </div>
                <div class="ludoteca-card-body">
                  <span class="ludoteca-plan-name">{{ getLudotecaPlanName(tarifa.nombre) }}</span>
                  <div class="ludoteca-price-badge">
                    <span class="ludoteca-price">{{ tarifa.precio | number:'1.2-2' }}€</span>
                  </div>
                  @if (tarifa.descripcion) {
                    <p class="ludoteca-desc">{{ tarifa.descripcion }}</p>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </section>
    }

    <!-- NUESTRA CARTA -->
    <section class="section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Nuestra Carta</h2>
          <p class="section-subtitle">Comida y bebida para acompanar tus partidas</p>
        </div>
        <a routerLink="/public/carta" class="btn btn-ghost">
          Ver carta completa <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
      <div class="food-carousel">
        <button class="food-arrow food-arrow-left" (click)="prevFoodSlide()">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <div class="food-viewport">
          <div class="food-track" [style.transform]="foodTrackTransform()">
            @for (slide of foodSlides; track slide; let i = $index) {
              <div class="food-slide-item">
                <img [src]="slide" alt="Nuestra carta" />
              </div>
            }
          </div>
        </div>
        <button class="food-arrow food-arrow-right" (click)="nextFoodSlide()">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
      <div class="food-dots">
        @for (slide of foodSlides; track slide; let i = $index) {
          <button
            class="food-dot"
            [class.active]="i === currentFoodSlide()"
            (click)="goToFoodSlide(i)"
            [attr.aria-label]="'Imagen ' + (i + 1)"
          ></button>
        }
      </div>
    </section>

    <!-- PROXIMOS EVENTOS -->
    @if (upcomingEvents().length > 0) {
      <section class="events-section">
        <div class="section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Proximos Eventos</h2>
              <p class="section-subtitle">Torneos, talleres y noches tematicas</p>
            </div>
            <a routerLink="/public/eventos" class="btn btn-ghost">
              Ver todos <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
          <div class="grid-3">
            @for (event of upcomingEvents(); track event.id) {
              <img class="event-img-probe" [src]="eventService.getImageUrl(event.id)" (load)="onEventImageLoad(event.id)" (error)="$event" />
              <a [routerLink]="['/public/eventos', event.id]"
                 class="event-card card"
                 [class.event-card-with-bg]="eventHasImage(event.id)"
                 [style.background-image]="eventHasImage(event.id) ? 'url(' + eventService.getImageUrl(event.id) + ')' : ''">
                @if (eventHasImage(event.id)) { <div class="event-card-overlay"></div> }
                <div class="event-card-content">
                  <div class="event-card-header">
                    <span class="event-type-badge" [class]="'type-' + event.type.toLowerCase()">
                      @switch (event.type) {
                        @case ('TORNEO') { <i class="fa-solid fa-trophy"></i> Torneo }
                        @case ('NOCHE_TEMATICA') { <i class="fa-solid fa-moon"></i> Noche Tematica }
                        @case ('TALLER') { <i class="fa-solid fa-palette"></i> Taller }
                        @case ('EVENTO_ESPECIAL') { <i class="fa-solid fa-star"></i> Especial }
                      }
                    </span>
                    <span class="event-date">
                      <i class="fa-solid fa-calendar"></i> {{ formatDate(event.date) }}
                    </span>
                  </div>
                  <h3 class="event-card-title">{{ event.title }}</h3>
                  <p class="event-card-desc">{{ event.description | slice:0:100 }}...</p>
                  <div class="event-card-footer">
                    <div class="event-capacity">
                      <div class="capacity-bar">
                        <div class="capacity-fill" [style.width.%]="(event.currentAttendees / event.capacity) * 100"></div>
                      </div>
                      <span class="capacity-text">{{ event.currentAttendees }}/{{ event.capacity }} plazas</span>
                    </div>
                    <span class="event-time"><i class="fa-solid fa-clock"></i> {{ event.time }}</span>
                  </div>
                </div>
              </a>
            }
          </div>
        </div>
      </section>
    }

    <!-- ESTADO DE LA SALA (oculto para clientes logueados) -->
    @if (!isCliente()) {
      <section class="section">
        <div class="section-header">
          <div>
            <h2 class="section-title">Estado de la Sala</h2>
            <p class="section-subtitle">Disponibilidad en tiempo real</p>
          </div>
          <a routerLink="/public/reservas" class="btn btn-ghost">
            Reservar <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
        <div class="sala-grid">
          @for (mesa of mesas(); track mesa.id) {
            <div class="mesa-box" [class]="'mesa-' + mesa.estado.toLowerCase().replace('_', '-')">
              <i class="fa-solid fa-chair"></i>
              <span class="mesa-name">{{ mesa.nombreMesa }}</span>
              <span class="mesa-cap"><i class="fa-solid fa-users"></i> {{ mesa.capacidad }}</span>
            </div>
          }
        </div>
        <div class="sala-legend">
          <span class="legend-item"><span class="legend-dot libre"></span> Libre</span>
          <span class="legend-item"><span class="legend-dot ocupada"></span> Ocupada</span>
          <span class="legend-item"><span class="legend-dot reservada"></span> Reservada</span>
          <span class="legend-item"><span class="legend-dot fuera"></span> Fuera de servicio</span>
        </div>
      </section>
    }

    <!-- SOBRE NOSOTROS CTA -->
    <section class="cta-section">
      <div class="section cta-inner">
        <h2 class="cta-title">Ven a conocernos</h2>
        <p class="cta-text">
          Giber Games Bar es mas que un bar. Es un punto de encuentro para amantes de los juegos de mesa,
          cerveza, refrescos, comida rica y una amplia ludoteca con mas de 200 juegos.
        </p>
        <div class="cta-info">
          <div class="cta-info-item">
            <i class="fa-solid fa-location-dot"></i>
            <span>Av. Alcalde Jose Aranda 57, 28925 Alcorcon, Madrid</span>
          </div>
          <div class="cta-info-item">
            <i class="fa-solid fa-clock"></i>
            <span>Mar-Jue 17:00-23:00 | Vie 17:00-00:00 | Sab 12:00-00:00 | Dom 12:00-22:00</span>
          </div>
        </div>
        <div class="cta-actions">
          <a routerLink="/public/nosotros" class="btn btn-primary btn-lg">Sobre nosotros</a>
          <a routerLink="/public/contacto" class="btn btn-outline btn-lg">Contactar</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* HERO */
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      overflow: hidden;
      margin-top: calc(-1 * var(--public-nav-height));
      padding-top: var(--public-nav-height);
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      z-index: 0;
      background: #0F172A;
    }

    .hero-slide {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      transition: opacity 1.2s ease-in-out;
    }

    .hero-slide.active {
      opacity: 1;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(15, 23, 42, 0.55) 0%,
        rgba(15, 23, 42, 0.65) 50%,
        rgba(15, 23, 42, 0.8) 100%
      );
      z-index: 1;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 800px;
      padding: 2rem;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.15;
      margin-bottom: 1.5rem;
    }

    .hero-highlight {
      background: linear-gradient(135deg, var(--neon-cyan), var(--neon-pink));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: #94A3B8;
      margin-bottom: 2.5rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 3rem;
    }

    .hero-actions .btn-outline {
      color: #FFFFFF;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .hero-actions .btn-outline:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.6);
      color: #FFFFFF;
    }

    .hero-stats {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      padding: 1.25rem 2rem;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-lg);
    }

    .hero-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .hero-stat-number {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--neon-cyan);
    }

    .hero-stat-label {
      font-size: 0.8125rem;
      color: #94A3B8;
    }

    .hero-stat-divider {
      width: 1px;
      height: 2.5rem;
      background: rgba(255, 255, 255, 0.15);
    }

    .hero-dots {
      position: absolute;
      bottom: 4.5rem;
      z-index: 3;
      display: flex;
      gap: 0.5rem;
    }

    .hero-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.5);
      background: transparent;
      cursor: pointer;
      padding: 0;
      transition: background-color 0.3s, border-color 0.3s, transform 0.2s;
    }

    .hero-dot:hover {
      border-color: rgba(255, 255, 255, 0.8);
      transform: scale(1.2);
    }

    .hero-dot.active {
      background: var(--neon-cyan);
      border-color: var(--neon-cyan);
      box-shadow: 0 0 8px var(--neon-cyan);
    }

    .hero-scroll-indicator {
      position: absolute;
      bottom: 2rem;
      z-index: 3;
      color: rgba(255, 255, 255, 0.4);
      font-size: 1.25rem;
      animation: bounce 2s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(8px); }
    }

    /* SECTION HEADER */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .section-header-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    /* GAMES COVERFLOW */
    .games-showcase {
      position: relative;
      display: flex;
      justify-content: center;
      overflow: clip;
    }

    .games-showcase-item {
      position: absolute;
      min-width: 320px;
      max-width: 320px;
      top: 0;
      left: 50%;
      margin-left: -160px;
      opacity: 0;
      transform: scale(0.8);
      transition: opacity 0.5s ease, transform 0.5s ease, filter 0.5s ease;
      pointer-events: none;
      filter: blur(4px);
    }

    .games-showcase-item.center {
      position: relative;
      left: auto;
      margin-left: 0;
      transform: scale(1);
      opacity: 1;
      z-index: 2;
      pointer-events: auto;
      filter: none;
    }

    .games-showcase-item.peek-left,
    .games-showcase-item.peek-right {
      opacity: 0.4;
      filter: blur(2px);
      z-index: 1;
      cursor: pointer;
      pointer-events: auto;
    }

    .games-showcase-item.peek-left {
      transform: translateX(-85%) scale(0.82);
    }

    .games-showcase-item.peek-right {
      transform: translateX(85%) scale(0.82);
    }

    .games-showcase-item.far-left,
    .games-showcase-item.far-right {
      opacity: 0;
      pointer-events: none;
    }

    @media (min-width: 1025px) {
      .games-showcase-item.far-left,
      .games-showcase-item.far-right {
        opacity: 0.2;
        filter: blur(4px);
        z-index: 0;
        cursor: pointer;
        pointer-events: auto;
      }
      .games-showcase-item.far-left {
        transform: translateX(-170%) scale(0.68);
      }
      .games-showcase-item.far-right {
        transform: translateX(170%) scale(0.68);
      }
    }

    .roulette-highlight {
      box-shadow: 0 0 20px rgba(0, 255, 209, 0.5), 0 0 40px rgba(0, 255, 209, 0.25);
      outline: 2px solid var(--neon-cyan);
      outline-offset: 2px;
      border-radius: var(--radius-lg);
    }

    @keyframes rouletteGlow {
      0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 209, 0.5), 0 0 40px rgba(0, 255, 209, 0.25); }
      50% { box-shadow: 0 0 30px rgba(0, 255, 209, 0.7), 0 0 60px rgba(0, 255, 209, 0.4); }
    }

    .roulette-winner {
      animation: rouletteGlow 1s ease-in-out infinite;
    }

    /* DAILY PICK */
    .daily-section {
      background: var(--secondary-bg);
    }

    :host-context([data-theme="dark"]) .daily-section {
      background: linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end));
    }

    .daily-inner {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 3rem;
      align-items: center;
    }

    .daily-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 1rem;
      background: rgba(217, 119, 6, 0.12);
      color: #D97706;
      border: 1px solid rgba(217, 119, 6, 0.25);
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    :host-context([data-theme="dark"]) .daily-badge {
      background: rgba(255, 209, 102, 0.15);
      color: #FFD166;
      border-color: rgba(255, 209, 102, 0.3);
    }

    .daily-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.75rem;
    }

    :host-context([data-theme="dark"]) .daily-title {
      color: #FFFFFF;
    }

    .daily-desc {
      color: var(--text-muted);
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 0.5rem;
      text-align: justify;
    }

    @media (max-width: 480px) {
      .daily-desc.clamped {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .daily-read-more {
      display: none;
      background: none;
      border: none;
      color: var(--primary-coral, #FF6B6B);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      margin-bottom: 1rem;
      transition: opacity 0.2s;
    }

    .daily-read-more:hover { opacity: 0.7; }

    :host-context([data-theme="dark"]) .daily-read-more {
      color: var(--neon-cyan, #00FFD1);
    }

    @media (max-width: 480px) {
      .daily-read-more { display: inline-block; }
    }

    .daily-meta {
      display: flex;
      gap: 1.5rem;
      color: var(--text-muted);
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .daily-meta i {
      margin-right: 0.375rem;
      color: var(--primary-coral);
    }

    :host-context([data-theme="dark"]) .daily-meta i {
      color: var(--neon-cyan);
    }

    .daily-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    :host-context([data-theme="dark"]) .daily-actions .btn-outline {
      color: #FFFFFF;
      border-color: rgba(255, 255, 255, 0.3);
    }

    :host-context([data-theme="dark"]) .daily-actions .btn-outline:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.6);
    }

    .daily-visual {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .daily-card-large {
      width: 250px;
      height: 300px;
      background: linear-gradient(135deg, rgba(255, 107, 157, 0.08), rgba(255, 107, 107, 0.08));
      border: 1px solid var(--card-border);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    :host-context([data-theme="dark"]) .daily-card-large {
      background: linear-gradient(135deg, rgba(0, 255, 209, 0.1), rgba(255, 107, 157, 0.1));
      border-color: rgba(255, 255, 255, 0.1);
    }

    .daily-card-large:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    }

    .daily-card-large i {
      font-size: 4rem;
      color: var(--primary-coral);
      opacity: 0.6;
    }

    :host-context([data-theme="dark"]) .daily-card-large i {
      color: var(--neon-cyan);
    }

    .daily-genre {
      font-size: 0.875rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .daily-img {
      width: 250px;
      height: 300px;
      object-fit: cover;
      border-radius: var(--radius-lg);
      border: 1px solid var(--card-border);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    :host-context([data-theme="dark"]) .daily-img {
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    }

    .daily-img:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
    }

    /* FOOD CAROUSEL */
    .food-carousel {
      position: relative;
      width: 100%;
      border-radius: var(--radius-lg);
    }

    .food-viewport {
      overflow: hidden;
      border-radius: var(--radius-lg);
    }

    .food-track {
      display: flex;
      transition: transform 0.5s ease-in-out;
    }

    .food-slide-item {
      flex: 0 0 100%;
      padding: 0 0.5rem;
      box-sizing: border-box;
    }

    .food-slide-item img {
      width: 100%;
      height: 300px;
      object-fit: cover;
      border-radius: var(--radius-lg);
    }

    .food-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, transform 0.2s;
    }

    .food-arrow:hover {
      background: rgba(0, 0, 0, 0.8);
      transform: translateY(-50%) scale(1.1);
    }

    .food-arrow-left {
      left: -0.5rem;
    }

    .food-arrow-right {
      right: -0.5rem;
    }

    .food-dots {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .food-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--text-muted);
      background: transparent;
      cursor: pointer;
      padding: 0;
      transition: background-color 0.3s, border-color 0.3s, transform 0.2s;
    }

    .food-dot:hover {
      border-color: var(--primary-coral);
      transform: scale(1.2);
    }

    .food-dot.active {
      background: var(--primary-coral);
      border-color: var(--primary-coral);
    }

    /* EVENT CARDS */
    .events-section {
      background-color: var(--secondary-bg);
    }

    [data-theme="dark"] .events-section {
      background-color: rgba(255, 255, 255, 0.02);
    }

    .event-card {
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .event-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .event-img-probe {
      display: none;
    }

    .event-card-with-bg {
      position: relative;
      background-size: cover;
      background-position: center;
      overflow: hidden;
    }

    .event-card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.85) 100%);
      z-index: 0;
    }

    .event-card-content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .event-card-with-bg .event-card-title {
      color: #FFFFFF;
    }

    .event-card-with-bg .event-card-desc {
      color: #CBD5E1;
    }

    .event-card-with-bg .event-date {
      color: #CBD5E1;
    }

    .event-card-with-bg .capacity-text {
      color: #CBD5E1;
    }

    .event-card-with-bg .event-time {
      color: #CBD5E1;
    }

    .event-card-with-bg .capacity-bar {
      background: rgba(255, 255, 255, 0.2);
    }

    .event-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .event-type-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .type-torneo { background: rgba(245, 158, 11, 0.15); color: #F59E0B; }
    .type-noche_tematica { background: rgba(168, 85, 247, 0.15); color: #A855F7; }
    .type-taller { background: rgba(16, 185, 129, 0.15); color: #10B981; }
    .type-evento_especial { background: rgba(59, 130, 246, 0.15); color: #3B82F6; }

    .event-date {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .event-card-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }

    .event-card-desc {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.5;
      flex: 1;
      margin-bottom: 1rem;
    }

    .event-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .event-capacity {
      flex: 1;
    }

    .capacity-bar {
      height: 4px;
      background: var(--input-border);
      border-radius: 2px;
      margin-bottom: 0.25rem;
      overflow: hidden;
    }

    .capacity-fill {
      height: 100%;
      background: var(--primary-coral);
      border-radius: 2px;
      transition: width 0.3s;
    }

    .capacity-text {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .event-time {
      font-size: 0.8125rem;
      color: var(--text-muted);
      white-space: nowrap;
    }

    /* SALA / TABLES */
    .sala-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .mesa-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.375rem;
      padding: 1rem 0.5rem;
      border-radius: var(--radius-md);
      border: 2px solid;
      text-align: center;
      transition: transform 0.2s;
    }

    .mesa-box:hover {
      transform: scale(1.05);
    }

    .mesa-box i {
      font-size: 1.25rem;
    }

    .mesa-name {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .mesa-cap {
      font-size: 0.6875rem;
      color: var(--text-muted);
    }

    .mesa-libre {
      border-color: var(--status-free);
      background: rgba(16, 185, 129, 0.08);
      color: var(--status-free);
    }

    .mesa-ocupada {
      border-color: var(--status-occupied);
      background: rgba(239, 68, 68, 0.08);
      color: var(--status-occupied);
    }

    .mesa-reservada {
      border-color: var(--status-reserved);
      background: rgba(245, 158, 11, 0.08);
      color: var(--status-reserved);
    }

    .mesa-fuera-de-servicio {
      border-color: var(--input-border);
      background: rgba(107, 114, 128, 0.08);
      color: var(--text-muted);
    }

    .sala-legend {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .legend-dot.libre { background: var(--status-free); }
    .legend-dot.ocupada { background: var(--status-occupied); }
    .legend-dot.reservada { background: var(--status-reserved); }
    .legend-dot.fuera { background: var(--input-border); }

    /* CTA SECTION */
    .cta-section {
      background: var(--secondary-bg);
    }

    :host-context([data-theme="dark"]) .cta-section {
      background: linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end));
    }

    .cta-inner {
      text-align: center;
    }

    .cta-title {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 1rem;
    }

    :host-context([data-theme="dark"]) .cta-title {
      color: #FFFFFF;
    }

    .cta-text {
      color: var(--text-muted);
      font-size: 1.125rem;
      max-width: 600px;
      margin: 0 auto 2rem;
      line-height: 1.7;
    }

    .cta-info {
      display: flex;
      justify-content: center;
      gap: 2.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .cta-info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      font-size: 0.9375rem;
    }

    :host-context([data-theme="dark"]) .cta-info-item {
      color: #CBD5E1;
    }

    .cta-info-item i {
      color: var(--primary-coral);
    }

    :host-context([data-theme="dark"]) .cta-info-item i {
      color: var(--neon-cyan);
    }

    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    :host-context([data-theme="dark"]) .cta-actions .btn-outline {
      color: #FFFFFF;
      border-color: rgba(255, 255, 255, 0.3);
    }

    :host-context([data-theme="dark"]) .cta-actions .btn-outline:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.6);
      color: #FFFFFF;
    }

    /* LUDOTECA PRICING */
    .ludoteca-section {
      background: var(--secondary-bg);
    }

    :host-context([data-theme="dark"]) .ludoteca-section {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
    }

    .ludoteca-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .ludoteca-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .ludoteca-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    :host-context([data-theme="dark"]) .ludoteca-card {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.08);
    }

    :host-context([data-theme="dark"]) .ludoteca-card:hover {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
      border-color: rgba(0, 255, 209, 0.2);
    }

    .ludoteca-card-img {
      position: relative;
      width: 100%;
      height: 200px;
      overflow: hidden;
    }

    .ludoteca-card-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .ludoteca-card:hover .ludoteca-card-img img {
      transform: scale(1.05);
    }

    .ludoteca-card-img-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.4) 100%);
    }

    .ludoteca-card-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.75rem;
    }

    .ludoteca-plan-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    :host-context([data-theme="dark"]) .ludoteca-plan-name {
      color: #FFFFFF;
    }

    .ludoteca-price-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1.25rem;
      background: linear-gradient(135deg, var(--primary-coral), #FF8E8E);
      border-radius: 9999px;
      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
    }

    :host-context([data-theme="dark"]) .ludoteca-price-badge {
      background: linear-gradient(135deg, var(--neon-cyan), #00CCB1);
      box-shadow: 0 4px 15px rgba(0, 255, 209, 0.25);
    }

    .ludoteca-price {
      font-size: 1.375rem;
      font-weight: 800;
      color: #FFFFFF;
    }

    .ludoteca-desc {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.5;
      max-width: 280px;
    }

    /* RESPONSIVE - TABLET */
    @media (max-width: 1024px) {
      .hero-title {
        font-size: 2.75rem;
      }

      .hero-subtitle {
        font-size: 1.1rem;
      }

      .hero-content {
        padding: 1.5rem;
      }

      .daily-inner {
        grid-template-columns: 1fr 240px;
        gap: 2rem;
      }

      .daily-card-large {
        width: 200px;
        height: 250px;
      }

      .daily-img {
        width: 200px;
        height: 250px;
      }

      .games-showcase-item { min-width: 290px; max-width: 290px; margin-left: -145px; }

      .cta-title {
        font-size: 1.85rem;
      }

      .cta-text {
        font-size: 1rem;
      }

      .section-header-actions {
        flex-wrap: wrap;
      }

      .ludoteca-grid {
        gap: 1.25rem;
      }

      .ludoteca-card-img {
        height: 170px;
      }
    }

    /* RESPONSIVE - MOBILE */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
      }

      .hero-subtitle {
        font-size: 0.95rem;
        margin-bottom: 2rem;
      }

      .hero-content {
        padding: 1.25rem;
      }

      .hero-actions {
        margin-bottom: 2rem;
      }

      .hero-actions .btn-lg {
        padding: 0.6rem 1.25rem;
        font-size: 0.875rem;
      }

      .hero-stats {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
      }

      .hero-stat-number {
        font-size: 1.5rem;
      }

      .hero-stat-divider {
        width: 3rem;
        height: 1px;
      }

      .hero-dots {
        bottom: 3.5rem;
      }

      .hero-scroll-indicator {
        bottom: 1.25rem;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .section-header-actions {
        width: 100%;
        justify-content: flex-start;
      }

      .daily-inner {
        grid-template-columns: 1fr;
      }

      .daily-visual {
        order: -1;
        display: flex;
        justify-content: center;
      }

      .daily-img {
        width: 100%;
        max-width: 280px;
        height: auto;
        max-height: 200px;
        object-fit: contain;
      }

      .daily-card-large {
        width: 160px;
        height: 180px;
      }

      .daily-title {
        font-size: 1.5rem;
      }

      .daily-meta {
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .food-slide-item img {
        height: 220px;
      }

      .food-arrow {
        width: 34px;
        height: 34px;
        font-size: 0.85rem;
      }

      .games-showcase-item { min-width: 260px; max-width: 260px; margin-left: -130px; }

      .event-card {
        padding: 1.25rem;
      }

      .event-card-title {
        font-size: 1rem;
      }

      .ludoteca-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
        max-width: 400px;
        margin: 0 auto;
      }

      .ludoteca-card-img {
        height: 180px;
      }

      .sala-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 0.5rem;
      }

      .sala-legend {
        gap: 0.75rem;
        font-size: 0.75rem;
      }

      .cta-title {
        font-size: 1.5rem;
      }

      .cta-text {
        font-size: 0.95rem;
      }

      .cta-info {
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .cta-info-item {
        font-size: 0.85rem;
        text-align: center;
      }

      .cta-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .cta-actions .btn {
        text-align: center;
      }
    }

    /* RESPONSIVE - SMALL PHONE */
    @media (max-width: 480px) {
      .hero {
        min-height: 85vh;
      }

      .hero-title {
        font-size: 1.6rem;
      }

      .hero-subtitle {
        font-size: 0.875rem;
        margin-bottom: 1.5rem;
      }

      .hero-actions {
        flex-direction: column;
        align-items: stretch;
        margin-bottom: 1.5rem;
      }

      .hero-actions .btn-lg {
        justify-content: center;
      }

      .hero-stats {
        padding: 0.75rem;
        gap: 0.75rem;
      }

      .hero-stat-number {
        font-size: 1.25rem;
      }

      .hero-stat-label {
        font-size: 0.7rem;
      }

      .food-slide-item img {
        height: 180px;
      }

      .food-arrow {
        width: 30px;
        height: 30px;
        font-size: 0.75rem;
      }

      .food-arrow-left {
        left: 0.25rem;
      }

      .food-arrow-right {
        right: 0.25rem;
      }

      .games-showcase-item { min-width: 230px; max-width: 230px; margin-left: -115px; }
      .games-showcase-item.peek-left { transform: translateX(-68%) scale(0.82); }
      .games-showcase-item.peek-right { transform: translateX(68%) scale(0.82); }

      .daily-meta {
        font-size: 0.8rem;
        gap: 0.5rem;
      }

      .mesa-box {
        padding: 0.65rem 0.35rem;
      }

      .mesa-box i {
        font-size: 1rem;
      }

      .mesa-name {
        font-size: 0.65rem;
      }

      .mesa-cap {
        font-size: 0.6rem;
      }

      .legend-item {
        font-size: 0.7rem;
      }
    }
  `]
})
export class LandingComponent implements OnInit, OnDestroy {
  private mockJuegos = inject(JuegoService);
  private recommendation = inject(RecommendationService);
  private mesaService = inject(MesaService);
  protected eventService = inject(EventService);
  private authService = inject(AuthService);
  private productoService = inject(ProductoService);

  isCliente = computed(() => this.authService.currentRole() === 'CLIENTE' || !this.authService.isAuthenticated());

  @ViewChild('gamesScroll') gamesScrollRef!: ElementRef<HTMLElement>;

  isLoading = signal(true);
  rouletteActive = signal(false);
  rouletteIndex = signal(-1);
  private rouletteTimers: ReturnType<typeof setTimeout>[] = [];
  featuredGames = signal<JuegoExtended[]>([]);

  ludotecaTarifas = signal<Producto[]>([]);
  dailyDescExpanded = signal(false);

  // Games coverflow
  currentGameSlide = signal(0);
  private gamesInterval: ReturnType<typeof setInterval> | null = null;

  /** Determines the visual state of each game card */
  getGameState(i: number): 'center' | 'peek-left' | 'peek-right' | 'far-left' | 'far-right' | 'hidden' {
    const total = this.featuredGames().length;
    if (total === 0) return 'hidden';
    const current = this.currentGameSlide();
    if (i === current) return 'center';
    if (total >= 3) {
      if (i === (current - 1 + total) % total) return 'peek-left';
      if (i === (current + 1) % total) return 'peek-right';
    }
    if (total >= 5) {
      if (i === (current - 2 + total) % total) return 'far-left';
      if (i === (current + 2) % total) return 'far-right';
    }
    return 'hidden';
  }
  dailyPick = signal<JuegoExtended | null>(null);
  mesas = signal<Mesa[]>([]);
  upcomingEvents = signal<GGBEvent[]>([]);
  mesaStats = signal<{ total: number; libres: number }>({ total: 0, libres: 0 });
  private loadedEventImages = signal<Set<number>>(new Set());

  // Carousel
  readonly heroSlides = [
    'assets/GGBarPhotoSlide/GiberGamesBarSlide01.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide02.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide03.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide04.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide05.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide06.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide07.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide08.webp',
    // 'assets/GGBarPhotoSlide/GiberGamesBarSlide09.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide10.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide11.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide12.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide13.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide14.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide16.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide17.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide18.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide19.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide20.webp',
  ];
  currentSlide = signal(0);
  private slideInterval: ReturnType<typeof setInterval> | null = null;

  // Food carousel
  readonly foodSlides = [
    'assets/GGBarFood/GGBarFood01.webp',
    'assets/GGBarFood/GGBarFood02.webp',
    'assets/GGBarFood/GGBarFood003.webp',
    'assets/GGBarFood/GGBarFood04.webp',
    'assets/GGBarFood/GGBarFood05.webp',
    'assets/GGBarFood/GGBarFood06.webp',
  ];
  currentFoodSlide = signal(0);
  foodTrackTransform = computed(() => {
    return `translateX(-${this.currentFoodSlide() * 100}%)`;
  });
  private maxFoodSlide = this.foodSlides.length - 1;
  private foodInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.startCarousel();
    this.startFoodCarousel();
    this.mockJuegos.getFeatured().subscribe(games => {
      this.featuredGames.set(games);
      this.isLoading.set(false);
      this.startGamesCarousel();
    });
    this.recommendation.getDailyPick().subscribe(game => this.dailyPick.set(game));

    this.mesaService.getAll().subscribe({
      next: (mesas) => {
        this.mesas.set(mesas);
        this.mesaStats.set({
          total: mesas.length,
          libres: mesas.filter(m => m.estado === 'LIBRE').length
        });
      },
      error: () => {}
    });

    this.eventService.getUpcoming(3).subscribe(events => this.upcomingEvents.set(events));

    this.productoService.getAll().subscribe(productos => {
      this.ludotecaTarifas.set(
        productos.filter(p => p.activo && p.nombre.toLowerCase().includes('ludoteca'))
      );
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
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

  private readonly ludotecaImageMap: Record<string, string> = {
    'aprendiz': 'assets/products/ModoAprendiz.jpg',
    'experto': 'assets/products/ModoExperto.jpg',
    'master': 'assets/products/ModoMaster.jpg',
  };

  getLudotecaImage(nombre: string): string {
    const lower = nombre.toLowerCase();
    for (const [key, img] of Object.entries(this.ludotecaImageMap)) {
      if (lower.includes(key)) return img;
    }
    return 'assets/products/ModoAprendiz.jpg';
  }

  getLudotecaPlanName(nombre: string): string {
    const lower = nombre.toLowerCase();
    if (lower.includes('master')) return 'Master';
    if (lower.includes('experto')) return 'Experto';
    if (lower.includes('aprendiz')) return 'Aprendiz';
    return nombre;
  }

  // Carousel methods
  goToSlide(index: number): void {
    this.currentSlide.set(index);
    this.restartCarousel();
  }

  private startCarousel(): void {
    this.slideInterval = setInterval(() => {
      this.currentSlide.update(i => (i + 1) % this.heroSlides.length);
    }, 5000);
  }

  private restartCarousel(): void {
    if (this.slideInterval) clearInterval(this.slideInterval);
    this.startCarousel();
  }

  // Food carousel methods
  goToFoodSlide(index: number): void {
    const clamped = Math.min(index, this.maxFoodSlide);
    this.currentFoodSlide.set(clamped);
    this.restartFoodCarousel();
  }

  nextFoodSlide(): void {
    this.currentFoodSlide.update(i => i < this.maxFoodSlide ? i + 1 : 0);
    this.restartFoodCarousel();
  }

  prevFoodSlide(): void {
    this.currentFoodSlide.update(i => i > 0 ? i - 1 : this.maxFoodSlide);
    this.restartFoodCarousel();
  }

  private startFoodCarousel(): void {
    this.foodInterval = setInterval(() => {
      this.currentFoodSlide.update(i => i < this.maxFoodSlide ? i + 1 : 0);
    }, 4000);
  }

  private restartFoodCarousel(): void {
    if (this.foodInterval) clearInterval(this.foodInterval);
    this.startFoodCarousel();
  }

  // Games carousel methods
  private startGamesCarousel(): void {
    this.stopGamesCarousel();
    this.gamesInterval = setInterval(() => {
      if (this.rouletteActive()) return;
      this.advanceGameSlide();
    }, 3000);
  }

  private stopGamesCarousel(): void {
    if (this.gamesInterval) {
      clearInterval(this.gamesInterval);
      this.gamesInterval = null;
    }
  }

  private advanceGameSlide(): void {
    const total = this.featuredGames().length;
    if (total === 0) return;
    this.currentGameSlide.update(i => (i + 1) % total);
  }

  onGameCardClick(i: number): void {
    if (this.rouletteActive()) return;
    const state = this.getGameState(i);
    if (state === 'peek-left' || state === 'peek-right' || state === 'far-left' || state === 'far-right') {
      this.currentGameSlide.set(i);
      this.stopGamesCarousel();
      this.startGamesCarousel();
    }
  }

  startRoulette(): void {
    if (this.rouletteActive()) return;
    const total = this.featuredGames().length;
    if (total === 0) return;

    this.stopGamesCarousel();
    this.rouletteActive.set(true);
    this.rouletteTimers.forEach(t => clearTimeout(t));
    this.rouletteTimers = [];

    const target = Math.floor(Math.random() * total);
    const totalSteps = 30 + total + (target >= 0 ? target : 0);
    let currentDelay = 50;
    let accumulated = 0;

    for (let step = 0; step < totalSteps; step++) {
      const idx = step % total;
      const timer = setTimeout(() => {
        this.currentGameSlide.set(idx);
        this.rouletteIndex.set(idx);
        if (step === totalSteps - 1) {
          setTimeout(() => {
            const el = this.gamesScrollRef?.nativeElement?.children[idx] as HTMLElement;
            if (el) el.classList.add('roulette-winner');
            setTimeout(() => {
              if (el) el.classList.remove('roulette-winner');
              this.rouletteActive.set(false);
              this.rouletteIndex.set(-1);
              this.startGamesCarousel();
            }, 3000);
          }, 100);
        }
      }, accumulated);
      this.rouletteTimers.push(timer);
      const progress = step / totalSteps;
      currentDelay = 50 + (progress * progress) * 250;
      accumulated += currentDelay;
    }
  }

  ngOnDestroy(): void {
    if (this.slideInterval) clearInterval(this.slideInterval);
    if (this.foodInterval) clearInterval(this.foodInterval);
    this.stopGamesCarousel();
    this.rouletteTimers.forEach(t => clearTimeout(t));
  }
}
