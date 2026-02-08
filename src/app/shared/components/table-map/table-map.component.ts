import { Component, inject, OnInit, OnDestroy, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MesaService } from '../../../core/services/mesa.service';
import { Mesa } from '../../../core/models/mesa.interface';

interface ZoneGroup {
  zona: string;
  mesas: Mesa[];
}

@Component({
  selector: 'app-table-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Loading state -->
    @if (loading()) {
      <div class="map-loading">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <p>Cargando mesas...</p>
      </div>
    }

    <!-- Table zones -->
    @if (!loading()) {
      @if (zoneGroups().length > 0) {
        @for (group of zoneGroups(); track group.zona) {
          <section class="zone-section">
            <h3 class="zone-title">
              <i class="fa-solid fa-location-dot"></i>
              {{ group.zona }}
            </h3>
            <div class="tables-grid">
              @for (mesa of group.mesas; track mesa.id) {
                <div
                  class="table-card"
                  [ngClass]="'estado-' + mesa.estado.toLowerCase()"
                  [class.clickable]="clickable && mesa.estado === 'LIBRE'"
                  (click)="onTableClick(mesa)">
                  <div class="table-card-top">
                    <div class="table-icon-wrapper" [ngClass]="'estado-icon-' + mesa.estado.toLowerCase()">
                      <i class="fa-solid fa-chair"></i>
                    </div>
                    <span class="table-status-badge" [ngClass]="'badge-' + mesa.estado.toLowerCase()">
                      {{ getEstadoLabel(mesa.estado) }}
                    </span>
                  </div>
                  <div class="table-card-body">
                    <h4 class="table-name">{{ mesa.nombreMesa }}</h4>
                    <div class="table-capacity">
                      <i class="fa-solid fa-users"></i>
                      <span>{{ mesa.capacidad }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>
        }
      } @else {
        <div class="map-empty">
          <i class="fa-solid fa-chair"></i>
          <p>No hay mesas disponibles</p>
        </div>
      }

      <!-- Legend -->
      <div class="map-legend">
        <div class="legend-item">
          <span class="legend-dot dot-libre"></span>
          <span class="legend-label">Libre</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot dot-ocupada"></span>
          <span class="legend-label">Ocupada</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot dot-reservada"></span>
          <span class="legend-label">Reservada</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot dot-fuera"></span>
          <span class="legend-label">Fuera de servicio</span>
        </div>
      </div>
    }
  `,
  styles: [`
    /* === Host === */
    :host {
      display: block;
    }

    /* === Loading === */
    .map-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      gap: 0.75rem;
      color: var(--text-muted);
    }

    .map-loading i {
      font-size: 1.5rem;
    }

    .map-loading p {
      font-size: 0.9rem;
    }

    /* === Empty === */
    .map-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      gap: 0.75rem;
      color: var(--text-muted);
    }

    .map-empty i {
      font-size: 2.5rem;
      opacity: 0.3;
    }

    .map-empty p {
      font-size: 1rem;
    }

    /* === Zone Section === */
    .zone-section {
      margin-bottom: 2rem;
    }

    .zone-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid var(--card-border);
    }

    .zone-title i {
      color: var(--primary-coral);
      font-size: 0.95rem;
    }

    /* === Tables Grid === */
    .tables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
    }

    /* === Table Card === */
    .table-card {
      background-color: var(--card-bg);
      border: 2px solid var(--card-border);
      border-radius: var(--radius-md, 0.5rem);
      padding: 1rem;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* Estado border colors */
    .table-card.estado-libre {
      border-color: var(--status-free);
      background: linear-gradient(135deg, var(--card-bg) 0%, rgba(16, 185, 129, 0.05) 100%);
    }

    .table-card.estado-ocupada {
      border-color: var(--status-occupied);
      background: linear-gradient(135deg, var(--card-bg) 0%, rgba(239, 68, 68, 0.05) 100%);
    }

    .table-card.estado-reservada {
      border-color: var(--status-reserved);
      background: linear-gradient(135deg, var(--card-bg) 0%, rgba(245, 158, 11, 0.05) 100%);
    }

    .table-card.estado-fuera_de_servicio {
      border-color: var(--input-border);
      background: linear-gradient(135deg, var(--card-bg) 0%, rgba(107, 114, 128, 0.05) 100%);
      opacity: 0.7;
    }

    /* Clickable libre tables */
    .table-card.clickable {
      cursor: pointer;
    }

    .table-card.clickable:hover {
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.35), 0 0 24px rgba(16, 185, 129, 0.15);
      transform: translateY(-2px);
    }

    [data-theme="dark"] .table-card.clickable:hover {
      box-shadow: 0 0 12px rgba(0, 255, 209, 0.35), 0 0 24px rgba(0, 255, 209, 0.15);
    }

    /* === Card Top === */
    .table-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .table-icon-wrapper {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm, 0.25rem);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }

    .estado-icon-libre {
      background: rgba(16, 185, 129, 0.12);
      color: var(--status-free);
    }

    .estado-icon-ocupada {
      background: rgba(239, 68, 68, 0.12);
      color: var(--status-occupied);
    }

    .estado-icon-reservada {
      background: rgba(245, 158, 11, 0.12);
      color: var(--status-reserved);
    }

    .estado-icon-fuera_de_servicio {
      background: rgba(107, 114, 128, 0.12);
      color: var(--input-border);
    }

    /* === Status Badge === */
    .table-status-badge {
      font-size: 0.675rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
    }

    .badge-libre {
      background: rgba(16, 185, 129, 0.12);
      color: var(--status-free);
    }

    .badge-ocupada {
      background: rgba(239, 68, 68, 0.12);
      color: var(--status-occupied);
    }

    .badge-reservada {
      background: rgba(245, 158, 11, 0.12);
      color: var(--status-reserved);
    }

    .badge-fuera_de_servicio {
      background: rgba(107, 114, 128, 0.12);
      color: var(--input-border);
    }

    /* === Card Body === */
    .table-card-body {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .table-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1.2;
    }

    .table-capacity {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .table-capacity i {
      font-size: 0.75rem;
    }

    /* === Legend === */
    .map-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
      padding: 1rem 0;
      margin-top: 1rem;
      border-top: 1px solid var(--card-border);
      justify-content: center;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }

    .dot-libre {
      background-color: var(--status-free);
    }

    .dot-ocupada {
      background-color: var(--status-occupied);
    }

    .dot-reservada {
      background-color: var(--status-reserved);
    }

    .dot-fuera {
      background-color: var(--input-border);
    }

    .legend-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    /* === Responsive === */
    @media (max-width: 640px) {
      .tables-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }

      .table-card {
        padding: 0.75rem;
      }

      .table-name {
        font-size: 0.85rem;
      }

      .table-status-badge {
        font-size: 0.6rem;
        padding: 0.15rem 0.375rem;
      }

      .map-legend {
        gap: 0.75rem;
      }
    }
  `]
})
export class TableMapComponent implements OnInit, OnDestroy {
  @Input() clickable: boolean = false;
  @Input() filterEstado: string = '';
  @Output() mesaSelected = new EventEmitter<Mesa>();

  private mesaService = inject(MesaService);
  private refreshIntervalId: ReturnType<typeof setInterval> | null = null;

  readonly allMesas = signal<Mesa[]>([]);
  readonly loading = signal(true);

  readonly filteredMesas = computed(() => {
    const mesas = this.allMesas();
    if (this.filterEstado) {
      return mesas.filter(m => m.estado === this.filterEstado);
    }
    return mesas;
  });

  readonly zoneGroups = computed<ZoneGroup[]>(() => {
    const mesas = this.filteredMesas();
    const zonaMap = new Map<string, Mesa[]>();

    for (const mesa of mesas) {
      const zona = mesa.zona || 'Sin zona';
      if (!zonaMap.has(zona)) {
        zonaMap.set(zona, []);
      }
      zonaMap.get(zona)!.push(mesa);
    }

    const groups: ZoneGroup[] = [];
    zonaMap.forEach((mesasInZone, zona) => {
      groups.push({
        zona,
        mesas: mesasInZone.sort((a, b) => a.numeroMesa - b.numeroMesa),
      });
    });

    return groups.sort((a, b) => a.zona.localeCompare(b.zona));
  });

  private readonly estadoLabels: Record<string, string> = {
    'LIBRE': 'Libre',
    'OCUPADA': 'Ocupada',
    'RESERVADA': 'Reservada',
    'FUERA_DE_SERVICIO': 'Fuera de servicio',
  };

  ngOnInit(): void {
    this.loadMesas();
    this.refreshIntervalId = setInterval(() => this.loadMesas(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshIntervalId !== null) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  getEstadoLabel(estado: string): string {
    return this.estadoLabels[estado] || estado;
  }

  onTableClick(mesa: Mesa): void {
    if (this.clickable && mesa.estado === 'LIBRE') {
      this.mesaSelected.emit(mesa);
    }
  }

  private loadMesas(): void {
    this.mesaService.getAll().subscribe({
      next: (mesas) => {
        this.allMesas.set(mesas);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading tables:', err);
        this.loading.set(false);
      },
    });
  }
}
