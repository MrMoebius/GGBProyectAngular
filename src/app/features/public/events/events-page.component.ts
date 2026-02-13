import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { GGBEvent } from '../../../core/models/evento.interface';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

type TabFilter = 'todos' | 'proximos' | 'este_mes' | 'pasados';
type EventType = GGBEvent['type'];

@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [CommonModule, RouterModule, BeerLoaderComponent],
  template: `
    <app-beer-loader [isLoading]="isLoading()" />
    <div class="events-page">

      <!-- Header -->
      <header class="events-header">
        <h1 class="events-title">Eventos</h1>
        <p class="events-subtitle">
          Torneos, talleres, noches tematicas y mucho mas. Reserva tu plaza y no te pierdas nada.
        </p>
      </header>

      <!-- Tab filters -->
      <nav class="tab-bar">
        @for (tab of tabs; track tab.key) {
          <button
            class="tab-btn"
            [class.active]="activeTab() === tab.key"
            (click)="activeTab.set(tab.key)"
          >
            <i [class]="tab.icon"></i>
            {{ tab.label }}
          </button>
        }
      </nav>

      <!-- Type filter pills -->
      <div class="type-filters">
        <span class="filter-label">Filtrar por tipo:</span>
        <div class="type-pills">
          @for (t of eventTypes; track t.value) {
            <button
              class="type-pill"
              [class.active]="selectedTypes().includes(t.value)"
              [style.--pill-color]="t.color"
              (click)="toggleType(t.value)"
            >
              <i [class]="t.icon"></i>
              {{ t.label }}
            </button>
          }
        </div>
        @if (selectedTypes().length > 0) {
          <button class="clear-btn" (click)="selectedTypes.set([])">
            <i class="fa-solid fa-xmark"></i> Limpiar
          </button>
        }
      </div>

      <!-- Event cards grid -->
      <div class="events-grid">
        @for (event of filteredEvents(); track event.id) {
          <a [routerLink]="['/public/eventos', event.id]" class="event-card card">
            <!-- Card image -->
            <div class="card-image" [style.background-image]="'url(' + eventService.getImageUrl(event.id) + ')'">
              <div class="card-image-overlay"></div>
            </div>
            <!-- Type badge -->
            <div class="card-top">
              <span class="type-badge" [style.background-color]="getTypeColor(event.type)">
                <i [class]="getTypeIcon(event.type)"></i>
                {{ getTypeLabel(event.type) }}
              </span>
              @if (event.status === 'EN_CURSO') {
                <span class="live-badge">
                  <i class="fa-solid fa-circle fa-beat-fade"></i> En curso
                </span>
              }
              @if (event.status === 'CANCELADO') {
                <span class="cancelled-badge">Cancelado</span>
              }
            </div>

            <!-- Title -->
            <h3 class="card-title">{{ event.title }}</h3>

            <!-- Date + Time -->
            <div class="card-meta">
              <span class="meta-item">
                <i class="fa-regular fa-calendar"></i>
                {{ formatDate(event.date) }}
              </span>
              <span class="meta-item">
                <i class="fa-regular fa-clock"></i>
                {{ event.time }}{{ event.endTime ? ' - ' + event.endTime : '' }}
              </span>
            </div>

            <!-- Location -->
            <div class="card-location">
              <i class="fa-solid fa-location-dot"></i>
              {{ event.location }}
            </div>

            <!-- Description -->
            <p class="card-description">
              {{ event.description.length > 150 ? event.description.substring(0, 150) + '...' : event.description }}
            </p>

            <!-- Capacity bar -->
            <div class="capacity-section">
              <div class="capacity-header">
                <span class="capacity-label">Plazas</span>
                <span class="capacity-text">{{ event.currentAttendees }}/{{ event.capacity }} plazas</span>
              </div>
              <div class="capacity-bar">
                <div
                  class="capacity-fill"
                  [style.width.%]="getCapacityPercent(event)"
                  [class.warning]="getCapacityPercent(event) > 80 && getCapacityPercent(event) < 100"
                  [class.full]="getCapacityPercent(event) >= 100"
                ></div>
              </div>
              @if (getCapacityPercent(event) >= 100) {
                <span class="capacity-full">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  COMPLETO - Lista de espera ({{ event.waitlistCount }})
                </span>
              } @else if (getCapacityPercent(event) > 80) {
                <span class="capacity-warning">
                  <i class="fa-solid fa-triangle-exclamation"></i>
                  Ultimas plazas!
                </span>
              }
            </div>

            <!-- Tags -->
            @if (event.tags.length > 0) {
              <div class="card-tags">
                @for (tag of event.tags; track tag) {
                  <span class="tag-pill">{{ tag }}</span>
                }
              </div>
            }

            <!-- Action button -->
            <div class="card-action">
              @if (event.status === 'FINALIZADO' || event.status === 'CANCELADO') {
                <span class="btn btn-ghost btn-sm action-btn" disabled>
                  <i class="fa-solid fa-clock-rotate-left"></i>
                  Evento pasado
                </span>
              } @else if (getCapacityPercent(event) >= 100) {
                <span class="btn btn-outline btn-sm action-btn">
                  <i class="fa-solid fa-list-ol"></i>
                  Lista de espera
                </span>
              } @else {
                <span class="btn btn-primary btn-sm action-btn">
                  <i class="fa-solid fa-pen-to-square"></i>
                  Inscribirse
                </span>
              }
            </div>
          </a>
        } @empty {
          <div class="empty-state">
            <i class="fa-solid fa-calendar-xmark"></i>
            <h3>No se encontraron eventos</h3>
            <p>Prueba a cambiar los filtros o vuelve mas tarde para ver nuevos eventos.</p>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .events-page {
      max-width: var(--max-content-width);
      margin: 0 auto;
      padding: var(--section-padding);
    }

    /* ── Header ── */
    .events-header {
      margin-bottom: 2rem;
    }

    .events-title {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }

    .events-subtitle {
      font-size: 1.125rem;
      color: var(--text-muted);
      max-width: 600px;
    }

    /* ── Tab bar ── */
    .tab-bar {
      display: flex;
      gap: 0.25rem;
      border-bottom: 2px solid var(--card-border);
      margin-bottom: 1.5rem;
      overflow-x: auto;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      color: var(--text-muted);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: color 0.2s, border-color 0.2s;
    }

    .tab-btn:hover {
      color: var(--text-main);
    }

    .tab-btn.active {
      color: var(--primary-coral);
      border-bottom-color: var(--primary-coral);
    }

    /* ── Type filter pills ── */
    .type-filters {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .filter-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .type-pills {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .type-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.875rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      background-color: var(--secondary-bg);
      color: var(--text-muted);
      border: 1px solid var(--card-border);
      cursor: pointer;
      transition: all 0.2s;
    }

    .type-pill:hover:not(.active) {
      border-color: var(--pill-color, var(--text-muted));
      color: var(--pill-color, var(--text-main));
    }

    .type-pill.active {
      background-color: var(--pill-color, var(--primary-coral));
      color: #fff;
      border-color: var(--pill-color, var(--primary-coral));
    }

    .clear-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      background: none;
      border: 1px dashed var(--danger);
      color: var(--danger);
      cursor: pointer;
      transition: all 0.2s;
    }

    .clear-btn:hover {
      background-color: var(--danger-bg);
    }

    /* ── Events grid ── */
    .events-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    /* ── Event card ── */
    .event-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1.5rem;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .event-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
    }

    .card-image {
      height: 160px;
      background-size: cover;
      background-position: center;
      background-color: var(--secondary-bg);
      border-radius: var(--radius-md, 0.5rem) var(--radius-md, 0.5rem) 0 0;
      margin: -1.5rem -1.5rem 0 -1.5rem;
      position: relative;
      overflow: hidden;
    }

    .card-image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 40%, var(--card-bg, #fff) 100%);
    }

    .card-top {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
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
    }

    .live-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--success-text);
      background-color: var(--success-bg);
      border: 1px solid var(--success);
    }

    .live-badge .fa-circle {
      font-size: 0.5rem;
    }

    .cancelled-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--danger-text);
      background-color: var(--danger-bg);
      border: 1px solid var(--danger);
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1.3;
    }

    .card-meta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .meta-item i {
      color: var(--primary-coral);
      font-size: 0.75rem;
    }

    .card-location {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .card-location i {
      color: var(--primary-coral);
      font-size: 0.75rem;
    }

    .card-description {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.6;
    }

    /* ── Capacity bar ── */
    .capacity-section {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .capacity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .capacity-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .capacity-text {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .capacity-bar {
      width: 100%;
      height: 8px;
      background-color: var(--secondary-bg);
      border-radius: 9999px;
      overflow: hidden;
    }

    .capacity-fill {
      height: 100%;
      border-radius: 9999px;
      background-color: var(--success);
      transition: width 0.4s ease;
    }

    .capacity-fill.warning {
      background-color: var(--warning);
    }

    .capacity-fill.full {
      background-color: var(--danger);
    }

    .capacity-warning {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--danger);
    }

    .capacity-full {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--danger);
    }

    /* ── Tags ── */
    .card-tags {
      display: flex;
      gap: 0.375rem;
      flex-wrap: wrap;
    }

    .tag-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 500;
      background-color: var(--secondary-bg);
      color: var(--text-muted);
      border: 1px solid var(--card-border);
    }

    /* ── Action button ── */
    .card-action {
      margin-top: auto;
      padding-top: 0.5rem;
    }

    .action-btn {
      width: 100%;
    }

    /* ── Empty state ── */
    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-muted);
      gap: 0.75rem;
    }

    .empty-state i {
      font-size: 3rem;
      opacity: 0.3;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      color: var(--text-main);
    }

    .empty-state p {
      font-size: 0.875rem;
      max-width: 360px;
    }

    /* ── Responsive ── */
    @media (max-width: 1024px) {
      .events-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .events-page {
        padding: 2rem 1rem;
      }

      .events-title {
        font-size: 1.75rem;
      }

      .tab-bar {
        gap: 0;
      }

      .tab-btn {
        padding: 0.625rem 0.75rem;
        font-size: 0.8125rem;
      }

      .type-filters {
        flex-direction: column;
        align-items: flex-start;
      }

      .card-meta {
        flex-direction: column;
        gap: 0.25rem;
      }
    }
  `]
})
export class EventsPageComponent implements OnInit {
  readonly eventService = inject(EventService);

  events = signal<GGBEvent[]>([]);
  activeTab = signal<TabFilter>('todos');
  selectedTypes = signal<EventType[]>([]);

  tabs: { key: TabFilter; label: string; icon: string }[] = [
    { key: 'todos', label: 'Todos', icon: 'fa-solid fa-layer-group' },
    { key: 'proximos', label: 'Proximos', icon: 'fa-solid fa-arrow-right' },
    { key: 'este_mes', label: 'Este mes', icon: 'fa-regular fa-calendar' },
    { key: 'pasados', label: 'Pasados', icon: 'fa-solid fa-clock-rotate-left' }
  ];

  eventTypes: { value: EventType; label: string; icon: string; color: string }[] = [
    { value: 'TORNEO', label: 'Torneo', icon: 'fa-solid fa-trophy', color: '#D97706' },
    { value: 'NOCHE_TEMATICA', label: 'Noche tematica', icon: 'fa-solid fa-moon', color: '#7C3AED' },
    { value: 'TALLER', label: 'Taller', icon: 'fa-solid fa-screwdriver-wrench', color: '#059669' },
    { value: 'EVENTO_ESPECIAL', label: 'Evento especial', icon: 'fa-solid fa-star', color: '#2563EB' }
  ];

  filteredEvents = computed(() => {
    let list = this.events();

    // Tab filter
    const tab = this.activeTab();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (tab === 'proximos') {
      list = list.filter(e => e.status === 'PROXIMO' || e.status === 'EN_CURSO');
    } else if (tab === 'este_mes') {
      list = list.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    } else if (tab === 'pasados') {
      list = list.filter(e => e.status === 'FINALIZADO' || e.status === 'CANCELADO');
    }

    // Type filter
    const types = this.selectedTypes();
    if (types.length > 0) {
      list = list.filter(e => types.includes(e.type));
    }

    // Sort: upcoming first by date, then past
    return list.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
    });
  });

  isLoading = signal(true);

  ngOnInit(): void {
    this.eventService.getAll().subscribe({
      next: (data) => {
        this.events.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  toggleType(type: EventType): void {
    this.selectedTypes.update(current => {
      if (current.includes(type)) {
        return current.filter(t => t !== type);
      }
      return [...current, type];
    });
  }

  getTypeColor(type: EventType): string {
    const found = this.eventTypes.find(t => t.value === type);
    return found ? found.color : '#6B7280';
  }

  getTypeIcon(type: EventType): string {
    const found = this.eventTypes.find(t => t.value === type);
    return found ? found.icon : 'fa-solid fa-calendar';
  }

  getTypeLabel(type: EventType): string {
    const found = this.eventTypes.find(t => t.value === type);
    return found ? found.label : type;
  }

  getCapacityPercent(event: GGBEvent): number {
    if (event.capacity === 0) return 0;
    return Math.min(100, Math.round((event.currentAttendees / event.capacity) * 100));
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
