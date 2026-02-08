import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockJuegosService } from '../../../core/services/mock-juegos.service';
import { RecommendationService } from '../../../core/services/recommendation.service';
import { ProductoService } from '../../../core/services/producto.service';
import { MesaService } from '../../../core/services/mesa.service';
import { EventService } from '../../../core/services/event.service';
import { JuegoExtended } from '../../../core/models/juego-extended.interface';
import { Producto } from '../../../core/models/producto.interface';
import { Mesa } from '../../../core/models/mesa.interface';
import { GGBEvent } from '../../../core/models/evento.interface';
import { GameCardPublicComponent } from '../../../shared/components/game-card-public/game-card-public.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, GameCardPublicComponent],
  template: `
    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <h1 class="hero-title animate-fade-in-up">
          Tu espacio para <span class="hero-highlight">jugar</span>,
          <span class="hero-highlight">comer</span> y
          <span class="hero-highlight">disfrutar</span>
        </h1>
        <p class="hero-subtitle animate-fade-in-up">
          Mas de 100 juegos de mesa, comida artesanal y el mejor ambiente gaming de la ciudad
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
              <span class="hero-stat-number">{{ featuredGames().length > 0 ? '100+' : '...' }}</span>
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
        <a routerLink="/public/juegos" class="btn btn-ghost">
          Ver todos <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
      <div class="games-scroll">
        @for (game of featuredGames(); track game.id) {
          <app-game-card-public [game]="game" />
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
            <p class="daily-desc">{{ dailyPick()!.descripcion }}</p>
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
            <div class="daily-card-large">
              <i class="fa-solid fa-dice-d20"></i>
              <span class="daily-genre">{{ dailyPick()!.genero }}</span>
            </div>
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
      <div class="menu-grid">
        @for (prod of featuredProducts(); track prod.id) {
          <div class="menu-card card">
            <div class="menu-card-icon" [class]="'cat-' + prod.categoria.toLowerCase()">
              @switch (prod.categoria) {
                @case ('COMIDA') { <i class="fa-solid fa-burger"></i> }
                @case ('BEBIDA') { <i class="fa-solid fa-mug-hot"></i> }
                @case ('ALCOHOL') { <i class="fa-solid fa-wine-glass"></i> }
                @case ('POSTRE') { <i class="fa-solid fa-ice-cream"></i> }
                @default { <i class="fa-solid fa-utensils"></i> }
              }
            </div>
            <div class="menu-card-info">
              <h4 class="menu-card-name">{{ prod.nombre }}</h4>
              @if (prod.descripcion) {
                <p class="menu-card-desc">{{ prod.descripcion }}</p>
              }
            </div>
            <span class="menu-card-price">{{ prod.precio | number:'1.2-2' }} EUR</span>
          </div>
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
              <a [routerLink]="['/public/eventos', event.id]" class="event-card card">
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
              </a>
            }
          </div>
        </div>
      </section>
    }

    <!-- ESTADO DE LA SALA -->
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

    <!-- SOBRE NOSOTROS CTA -->
    <section class="cta-section">
      <div class="section cta-inner">
        <h2 class="cta-title">Ven a conocernos</h2>
        <p class="cta-text">
          Giber Bar es mas que un bar. Es un punto de encuentro para amantes de los juegos de mesa,
          la buena comida y la diversión. Abierto todos los dias con eventos semanales.
        </p>
        <div class="cta-info">
          <div class="cta-info-item">
            <i class="fa-solid fa-location-dot"></i>
            <span>Calle Ejemplo 42, Madrid</span>
          </div>
          <div class="cta-info-item">
            <i class="fa-solid fa-clock"></i>
            <span>Lun-Jue 16:00-00:00 | Vie-Sab 16:00-02:00 | Dom 12:00-22:00</span>
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
      background: linear-gradient(135deg, var(--hero-gradient-start) 0%, var(--hero-gradient-end) 50%, #1a1a2e 100%);
      z-index: 0;
    }

    .hero-bg::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 20% 50%, rgba(0, 255, 209, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 50%, rgba(255, 107, 157, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 50% 80%, rgba(168, 85, 247, 0.06) 0%, transparent 50%);
    }

    .hero-content {
      position: relative;
      z-index: 1;
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

    .hero-scroll-indicator {
      position: absolute;
      bottom: 2rem;
      z-index: 1;
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
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    /* GAMES SCROLL */
    .games-scroll {
      display: flex;
      gap: 1.25rem;
      overflow-x: auto;
      padding-bottom: 1rem;
      scroll-snap-type: x mandatory;
    }

    .games-scroll > * {
      min-width: 280px;
      max-width: 280px;
      scroll-snap-align: start;
    }

    .games-scroll::-webkit-scrollbar {
      height: 6px;
    }

    .games-scroll::-webkit-scrollbar-track {
      background: transparent;
    }

    .games-scroll::-webkit-scrollbar-thumb {
      background: var(--input-border);
      border-radius: 3px;
    }

    /* DAILY PICK */
    .daily-section {
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
      background: rgba(255, 209, 102, 0.15);
      color: #FFD166;
      border: 1px solid rgba(255, 209, 102, 0.3);
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .daily-title {
      font-size: 2rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 0.75rem;
    }

    .daily-desc {
      color: #94A3B8;
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 1.25rem;
    }

    .daily-meta {
      display: flex;
      gap: 1.5rem;
      color: #94A3B8;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .daily-meta i {
      margin-right: 0.375rem;
      color: var(--neon-cyan);
    }

    .daily-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .daily-visual {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .daily-card-large {
      width: 250px;
      height: 300px;
      background: linear-gradient(135deg, rgba(0, 255, 209, 0.1), rgba(255, 107, 157, 0.1));
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .daily-card-large i {
      font-size: 4rem;
      color: var(--neon-cyan);
      opacity: 0.6;
    }

    .daily-genre {
      font-size: 0.875rem;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    /* MENU CARDS */
    .menu-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .menu-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      transition: transform 0.2s;
    }

    .menu-card:hover {
      transform: translateX(4px);
    }

    .menu-card-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .cat-comida { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
    .cat-bebida { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
    .cat-alcohol { background: rgba(168, 85, 247, 0.1); color: #A855F7; }
    .cat-postre { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
    .cat-servicio { background: rgba(16, 185, 129, 0.1); color: #10B981; }

    .menu-card-info {
      flex: 1;
      min-width: 0;
    }

    .menu-card-name {
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 0.125rem;
    }

    .menu-card-desc {
      font-size: 0.8125rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .menu-card-price {
      font-weight: 700;
      color: var(--primary-coral);
      font-size: 1rem;
      white-space: nowrap;
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
      background: linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end));
    }

    .cta-inner {
      text-align: center;
    }

    .cta-title {
      font-size: 2.25rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 1rem;
    }

    .cta-text {
      color: #94A3B8;
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
      color: #CBD5E1;
      font-size: 0.9375rem;
    }

    .cta-info-item i {
      color: var(--neon-cyan);
    }

    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .cta-actions .btn-outline {
      color: #FFFFFF;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .cta-actions .btn-outline:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.6);
      color: #FFFFFF;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.25rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .hero-stats {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
      }

      .hero-stat-divider {
        width: 3rem;
        height: 1px;
      }

      .daily-inner {
        grid-template-columns: 1fr;
      }

      .daily-visual {
        display: none;
      }

      .menu-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .cta-info {
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .cta-title {
        font-size: 1.75rem;
      }
    }
  `]
})
export class LandingComponent implements OnInit {
  private mockJuegos = inject(MockJuegosService);
  private recommendation = inject(RecommendationService);
  private productoService = inject(ProductoService);
  private mesaService = inject(MesaService);
  private eventService = inject(EventService);

  featuredGames = signal<JuegoExtended[]>([]);
  dailyPick = signal<JuegoExtended | null>(null);
  featuredProducts = signal<Producto[]>([]);
  mesas = signal<Mesa[]>([]);
  upcomingEvents = signal<GGBEvent[]>([]);
  mesaStats = signal<{ total: number; libres: number }>({ total: 0, libres: 0 });

  ngOnInit(): void {
    this.mockJuegos.getFeatured().subscribe(games => this.featuredGames.set(games));
    this.recommendation.getDailyPick().subscribe(game => this.dailyPick.set(game));

    this.productoService.getAll().subscribe({
      next: (products) => {
        const active = products.filter(p => p.activo);
        const featured = active.slice(0, 4);
        this.featuredProducts.set(featured);
      },
      error: () => {}
    });

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
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}
