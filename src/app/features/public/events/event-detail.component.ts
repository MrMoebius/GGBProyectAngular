import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { GGBEvent, EventSubscription } from '../../../core/models/evento.interface';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (event()) {
      <div class="detail-page">

        <!-- Back button -->
        <a routerLink="/public/eventos" class="back-link">
          <i class="fa-solid fa-arrow-left"></i> Volver a eventos
        </a>

        <!-- Hero banner -->
        <div class="hero-banner" [style.background]="'url(' + eventService.getImageUrl(event()!.id) + ') center/cover no-repeat, ' + getHeroGradient(event()!.type)">
          <div class="hero-overlay">
            <span class="type-badge" [style.background-color]="getTypeColor(event()!.type)">
              <i [class]="getTypeIcon(event()!.type)"></i>
              {{ getTypeLabel(event()!.type) }}
            </span>
            <h1 class="hero-title">{{ event()!.title }}</h1>
            @if (event()!.status === 'EN_CURSO') {
              <span class="live-indicator">
                <i class="fa-solid fa-circle fa-beat-fade"></i> En curso ahora
              </span>
            }
            @if (event()!.status === 'CANCELADO') {
              <span class="cancelled-indicator">Evento cancelado</span>
            }
            @if (event()!.status === 'FINALIZADO') {
              <span class="finished-indicator">Evento finalizado</span>
            }
          </div>
        </div>

        <!-- Content area -->
        <div class="content-grid">

          <!-- Main column -->
          <div class="main-col">

            <!-- Info grid -->
            <div class="info-grid">
              <div class="info-item">
                <div class="info-icon"><i class="fa-regular fa-calendar"></i></div>
                <div class="info-text">
                  <span class="info-label">Fecha</span>
                  <span class="info-value">{{ formatDate(event()!.date) }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon"><i class="fa-regular fa-clock"></i></div>
                <div class="info-text">
                  <span class="info-label">Horario</span>
                  <span class="info-value">{{ event()!.time }}{{ event()!.endTime ? ' - ' + event()!.endTime : '' }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon"><i class="fa-solid fa-location-dot"></i></div>
                <div class="info-text">
                  <span class="info-label">Ubicacion</span>
                  <span class="info-value">{{ event()!.location }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon"><i class="fa-solid fa-users"></i></div>
                <div class="info-text">
                  <span class="info-label">Capacidad</span>
                  <span class="info-value">{{ event()!.currentAttendees }} de {{ event()!.capacity }} plazas</span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <section class="description-section">
              <h2 class="section-heading">Descripcion del evento</h2>
              <p class="description-text">{{ event()!.description }}</p>
            </section>

            <!-- Tags -->
            @if (event()!.tags.length > 0) {
              <section class="tags-section">
                <h2 class="section-heading">Etiquetas</h2>
                <div class="tags-list">
                  @for (tag of event()!.tags; track tag) {
                    <span class="tag-pill">{{ tag }}</span>
                  }
                </div>
              </section>
            }

            <!-- Other events -->
            @if (otherEvents().length > 0) {
              <section class="other-events-section">
                <h2 class="section-heading">Otros eventos</h2>
                <div class="other-events-grid">
                  @for (other of otherEvents(); track other.id) {
                    <a [routerLink]="['/public/eventos', other.id]" class="other-event-card card">
                      <span class="other-type-badge" [style.background-color]="getTypeColor(other.type)">
                        {{ getTypeLabel(other.type) }}
                      </span>
                      <h4 class="other-title">{{ other.title }}</h4>
                      <span class="other-date">
                        <i class="fa-regular fa-calendar"></i>
                        {{ formatDateShort(other.date) }} - {{ other.time }}
                      </span>
                    </a>
                  }
                </div>
              </section>
            }
          </div>

          <!-- Sidebar -->
          <aside class="sidebar">

            <!-- Capacity card -->
            <div class="capacity-card card">
              <h3 class="cap-title">Plazas</h3>
              <div class="cap-visual">
                <div class="cap-ring-wrapper">
                  <svg class="cap-ring" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="var(--card-border)" stroke-width="8"/>
                    <circle cx="60" cy="60" r="54" fill="none"
                      [attr.stroke]="getCapacityColor()"
                      stroke-width="8"
                      stroke-linecap="round"
                      [attr.stroke-dasharray]="339.292"
                      [attr.stroke-dashoffset]="339.292 - (339.292 * getCapacityPercent() / 100)"
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div class="cap-ring-text">
                    <span class="cap-ring-number">{{ getCapacityPercent() }}%</span>
                    <span class="cap-ring-label">ocupado</span>
                  </div>
                </div>
              </div>
              <div class="cap-stats">
                <div class="cap-stat">
                  <span class="cap-stat-num">{{ event()!.currentAttendees }}</span>
                  <span class="cap-stat-label">Inscritos</span>
                </div>
                <div class="cap-stat-divider"></div>
                <div class="cap-stat">
                  <span class="cap-stat-num">{{ event()!.capacity - event()!.currentAttendees > 0 ? event()!.capacity - event()!.currentAttendees : 0 }}</span>
                  <span class="cap-stat-label">Disponibles</span>
                </div>
                @if (event()!.waitlistCount > 0) {
                  <div class="cap-stat-divider"></div>
                  <div class="cap-stat">
                    <span class="cap-stat-num cap-waitlist">{{ event()!.waitlistCount }}</span>
                    <span class="cap-stat-label">En espera</span>
                  </div>
                }
              </div>

              @if (getCapacityPercent() >= 100) {
                <div class="cap-full-alert">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  Evento completo
                </div>
              } @else if (getCapacityPercent() > 80) {
                <div class="cap-warning-alert">
                  <i class="fa-solid fa-triangle-exclamation"></i>
                  Ultimas plazas disponibles!
                </div>
              }
            </div>

            <!-- Subscription card -->
            <div class="sub-card card">
              <h3 class="sub-title">Inscripcion</h3>

              @if (event()!.status === 'FINALIZADO' || event()!.status === 'CANCELADO') {
                <div class="sub-disabled">
                  <i class="fa-solid fa-ban"></i>
                  <p>Este evento ya ha {{ event()!.status === 'CANCELADO' ? 'sido cancelado' : 'finalizado' }}.</p>
                </div>
              } @else if (!isAuthenticated()) {
                <div class="sub-login">
                  <i class="fa-solid fa-lock"></i>
                  <p>Inicia sesion para inscribirte</p>
                  <a routerLink="/auth/login" class="btn btn-primary btn-sm sub-login-btn">
                    <i class="fa-solid fa-right-to-bracket"></i> Iniciar sesion
                  </a>
                </div>
              } @else if (subscription()) {
                <div class="sub-status">
                  @if (subscription()!.status === 'CONFIRMED') {
                    <div class="sub-badge confirmed">
                      <i class="fa-solid fa-circle-check"></i> Inscripcion confirmada
                    </div>
                  } @else if (subscription()!.status === 'WAITLIST') {
                    <div class="sub-badge waitlist">
                      <i class="fa-solid fa-hourglass-half"></i> En lista de espera
                    </div>
                  }
                  <button class="btn btn-danger btn-sm sub-cancel-btn" (click)="cancelSubscription()">
                    <i class="fa-solid fa-xmark"></i> Cancelar inscripcion
                  </button>
                </div>
              } @else if (getCapacityPercent() >= 100) {
                <button class="btn btn-outline sub-action-btn" (click)="subscribeToEvent()">
                  <i class="fa-solid fa-list-ol"></i> Unirse a lista de espera
                </button>
              } @else {
                <button class="btn btn-primary sub-action-btn" (click)="subscribeToEvent()">
                  <i class="fa-solid fa-pen-to-square"></i> Inscribirse
                </button>
              }
            </div>

            <!-- Share button -->
            <button class="btn btn-ghost share-btn" (click)="shareEvent()">
              <i class="fa-solid fa-share-nodes"></i> Compartir evento
            </button>

          </aside>
        </div>

      </div>
    } @else if (loading()) {
      <div class="loading-state">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <p>Cargando evento...</p>
      </div>
    } @else {
      <div class="not-found">
        <i class="fa-solid fa-calendar-xmark"></i>
        <h2>Evento no encontrado</h2>
        <p>El evento que buscas no existe o ha sido eliminado.</p>
        <a routerLink="/public/eventos" class="btn btn-primary">
          <i class="fa-solid fa-arrow-left"></i> Volver a eventos
        </a>
      </div>
    }
  `,
  styles: [`
    /* ── Layout ── */
    .detail-page {
      max-width: var(--max-content-width);
      margin: 0 auto;
      padding: 2rem;
    }

    /* ── Back link ── */
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-decoration: none;
      margin-bottom: 1.5rem;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: var(--primary-coral);
    }

    /* ── Hero banner ── */
    .hero-banner {
      border-radius: var(--radius-lg);
      overflow: hidden;
      margin-bottom: 2rem;
    }

    .hero-overlay {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 3rem 2.5rem;
      background: linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%);
    }

    .type-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 700;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      width: fit-content;
    }

    .hero-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: #fff;
      line-height: 1.2;
      max-width: 600px;
    }

    .live-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #00FFD1;
      width: fit-content;
    }

    .live-indicator .fa-circle { font-size: 0.5rem; }

    .cancelled-indicator,
    .finished-indicator {
      display: inline-flex;
      align-items: center;
      padding: 0.375rem 1rem;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 700;
      width: fit-content;
    }

    .cancelled-indicator {
      background-color: rgba(239, 68, 68, 0.2);
      color: #FCA5A5;
      border: 1px solid rgba(239, 68, 68, 0.4);
    }

    .finished-indicator {
      background-color: rgba(107, 114, 128, 0.2);
      color: #D1D5DB;
      border: 1px solid rgba(107, 114, 128, 0.4);
    }

    /* ── Content grid ── */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 2rem;
      align-items: start;
    }

    /* ── Info grid ── */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .info-item {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
    }

    .info-icon {
      flex-shrink: 0;
      width: 2.5rem;
      height: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      background-color: var(--secondary-bg);
      color: var(--primary-coral);
      font-size: 1rem;
    }

    .info-text {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .info-label {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .info-value {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-main);
    }

    /* ── Sections ── */
    .section-heading {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 1rem;
    }

    .description-section {
      margin-bottom: 2rem;
    }

    .description-text {
      font-size: 0.9375rem;
      line-height: 1.75;
      color: var(--text-muted);
      white-space: pre-line;
    }

    .tags-section {
      margin-bottom: 2rem;
    }

    .tags-list {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .tag-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      background-color: var(--secondary-bg);
      color: var(--text-muted);
      border: 1px solid var(--card-border);
    }

    /* ── Other events ── */
    .other-events-section {
      margin-bottom: 2rem;
    }

    .other-events-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .other-event-card {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .other-event-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .other-type-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.625rem;
      font-weight: 700;
      color: #fff;
      text-transform: uppercase;
      width: fit-content;
    }

    .other-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1.3;
    }

    .other-date {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .other-date i {
      font-size: 0.6875rem;
      color: var(--primary-coral);
    }

    /* ── Sidebar ── */
    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      position: sticky;
      top: calc(var(--public-nav-height) + 1rem);
    }

    /* ── Capacity card ── */
    .capacity-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .cap-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .cap-visual {
      display: flex;
      justify-content: center;
    }

    .cap-ring-wrapper {
      position: relative;
      width: 120px;
      height: 120px;
    }

    .cap-ring {
      width: 100%;
      height: 100%;
    }

    .cap-ring circle {
      transition: stroke-dashoffset 0.6s ease;
    }

    .cap-ring-text {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .cap-ring-number {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-main);
    }

    .cap-ring-label {
      font-size: 0.6875rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .cap-stats {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
    }

    .cap-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.125rem;
    }

    .cap-stat-num {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .cap-stat-num.cap-waitlist {
      color: var(--warning);
    }

    .cap-stat-label {
      font-size: 0.6875rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .cap-stat-divider {
      width: 1px;
      height: 2rem;
      background-color: var(--card-border);
    }

    .cap-full-alert {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.625rem;
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--danger-text);
      background-color: var(--danger-bg);
      border: 1px solid var(--danger);
    }

    .cap-warning-alert {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.625rem;
      border-radius: var(--radius-md);
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--warning-text);
      background-color: var(--warning-bg);
      border: 1px solid var(--warning);
    }

    /* ── Subscription card ── */
    .sub-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .sub-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .sub-disabled {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.5rem;
      padding: 1rem;
      color: var(--text-muted);
    }

    .sub-disabled i {
      font-size: 1.5rem;
      opacity: 0.4;
    }

    .sub-disabled p {
      font-size: 0.875rem;
    }

    .sub-login {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.75rem;
      padding: 1rem;
    }

    .sub-login i {
      font-size: 1.5rem;
      color: var(--text-muted);
      opacity: 0.5;
    }

    .sub-login p {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .sub-login-btn {
      width: 100%;
    }

    .sub-status {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .sub-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
    }

    .sub-badge.confirmed {
      color: var(--success-text);
      background-color: var(--success-bg);
      border: 1px solid var(--success);
    }

    .sub-badge.waitlist {
      color: var(--warning-text);
      background-color: var(--warning-bg);
      border: 1px solid var(--warning);
    }

    .sub-cancel-btn {
      width: 100%;
    }

    .sub-action-btn {
      width: 100%;
    }

    /* ── Share button ── */
    .share-btn {
      width: 100%;
    }

    /* ── Loading / Not found ── */
    .loading-state,
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      text-align: center;
      gap: 0.75rem;
      color: var(--text-muted);
      padding: 2rem;
    }

    .loading-state i,
    .not-found i {
      font-size: 3rem;
      opacity: 0.3;
    }

    .not-found h2 {
      font-size: 1.5rem;
      color: var(--text-main);
    }

    .not-found p {
      font-size: 0.875rem;
      max-width: 360px;
      margin-bottom: 1rem;
    }

    /* ── Responsive ── */
    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: static;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .share-btn {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 768px) {
      .detail-page {
        padding: 1rem;
      }

      .hero-overlay {
        padding: 2rem 1.5rem;
      }

      .hero-title {
        font-size: 1.75rem;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .other-events-grid {
        grid-template-columns: 1fr;
      }

      .sidebar {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  readonly eventService = inject(EventService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  event = signal<GGBEvent | null>(null);
  subscription = signal<EventSubscription | null>(null);
  allEvents = signal<GGBEvent[]>([]);
  loading = signal(true);

  isAuthenticated = computed(() => this.authService.isAuthenticated());

  otherEvents = computed(() => {
    const current = this.event();
    if (!current) return [];
    return this.allEvents()
      .filter(e => e.id !== current.id && (e.status === 'PROXIMO' || e.status === 'EN_CURSO'))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  });

  private typeConfig: Record<string, { label: string; icon: string; color: string; gradient: string }> = {
    TORNEO: {
      label: 'Torneo',
      icon: 'fa-solid fa-trophy',
      color: '#D97706',
      gradient: 'linear-gradient(135deg, #92400E 0%, #D97706 50%, #F59E0B 100%)'
    },
    NOCHE_TEMATICA: {
      label: 'Noche tematica',
      icon: 'fa-solid fa-moon',
      color: '#7C3AED',
      gradient: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #A78BFA 100%)'
    },
    TALLER: {
      label: 'Taller',
      icon: 'fa-solid fa-screwdriver-wrench',
      color: '#059669',
      gradient: 'linear-gradient(135deg, #064E3B 0%, #059669 50%, #34D399 100%)'
    },
    EVENTO_ESPECIAL: {
      label: 'Evento especial',
      icon: 'fa-solid fa-star',
      color: '#2563EB',
      gradient: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #60A5FA 100%)'
    }
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.eventService.getById(id).subscribe({
      next: (ev) => {
        this.event.set(ev ?? null);
        this.loading.set(false);

        if (ev && this.authService.isAuthenticated()) {
          const userId = this.getUserId();
          this.eventService.getSubscription(ev.id, userId).subscribe({
            next: (sub) => this.subscription.set(sub ?? null)
          });
        }
      }
    });

    this.eventService.getAll().subscribe({
      next: (all) => this.allEvents.set(all)
    });
  }

  subscribeToEvent(): void {
    const ev = this.event();
    if (!ev) return;
    const userId = this.getUserId();

    this.eventService.subscribe(ev.id, userId).subscribe({
      next: (sub) => {
        this.subscription.set(sub);
        this.refreshEvent(ev.id);
        if (sub.status === 'CONFIRMED') {
          this.toastService.success('Inscripcion confirmada correctamente');
        } else {
          this.toastService.show('Te has unido a la lista de espera', 'info');
        }
      },
      error: () => this.toastService.error('Error al inscribirse')
    });
  }

  cancelSubscription(): void {
    const ev = this.event();
    if (!ev) return;
    const userId = this.getUserId();

    this.eventService.unsubscribe(ev.id, userId).subscribe({
      next: () => {
        this.subscription.set(null);
        this.refreshEvent(ev.id);
        this.toastService.success('Inscripcion cancelada');
      },
      error: () => this.toastService.error('Error al cancelar inscripcion')
    });
  }

  shareEvent(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.toastService.success('Enlace copiado al portapapeles');
    }).catch(() => {
      this.toastService.error('No se pudo copiar el enlace');
    });
  }

  getTypeColor(type: string): string {
    return this.typeConfig[type]?.color ?? '#6B7280';
  }

  getTypeIcon(type: string): string {
    return this.typeConfig[type]?.icon ?? 'fa-solid fa-calendar';
  }

  getTypeLabel(type: string): string {
    return this.typeConfig[type]?.label ?? type;
  }

  getHeroGradient(type: string): string {
    return this.typeConfig[type]?.gradient ?? 'linear-gradient(135deg, #374151, #6B7280)';
  }

  getCapacityPercent(): number {
    const ev = this.event();
    if (!ev || ev.capacity === 0) return 0;
    return Math.min(100, Math.round((ev.currentAttendees / ev.capacity) * 100));
  }

  getCapacityColor(): string {
    const pct = this.getCapacityPercent();
    if (pct >= 100) return 'var(--danger)';
    if (pct > 80) return 'var(--warning)';
    return 'var(--success)';
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatDateShort(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  }

  private getUserId(): string {
    const user = this.authService.currentUser();
    return (user as any)?.email ?? 'anonymous';
  }

  private refreshEvent(id: number): void {
    this.eventService.getById(id).subscribe({
      next: (ev) => {
        if (ev) this.event.set(ev);
      }
    });
  }
}
