import { Component, inject, signal, computed, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MesaService } from '../../../core/services/mesa.service';
import { ToastService } from '../../../core/services/toast.service';
import { Mesa, MesaLayout } from '../../../core/models/mesa.interface';

@Component({
  selector: 'app-floor-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Toolbar -->
    <div class="fp-toolbar">
      <div class="toolbar-left">
        <button
          class="btn btn-primary btn-sm"
          [disabled]="!hasChanges()"
          (click)="saveLayout()"
        >
          <i class="fa-solid fa-floppy-disk"></i> Guardar disposicion
        </button>
        <button
          class="btn btn-ghost btn-sm"
          [disabled]="!hasChanges()"
          (click)="discardChanges()"
        >
          <i class="fa-solid fa-rotate-left"></i> Descartar
        </button>
      </div>
      <div class="toolbar-right">
        <button
          class="btn btn-ghost btn-sm"
          [class.active]="showGrid()"
          (click)="showGrid.set(!showGrid())"
          title="Mostrar cuadricula"
        >
          <i class="fa-solid fa-border-all"></i>
        </button>
      </div>
    </div>

    <!-- Main layout -->
    <div class="fp-main">
      <!-- Sidebar -->
      <aside class="fp-sidebar">
        <!-- Selected table properties -->
        @if (selectedMesa()) {
          <div class="sidebar-section">
            <h3 class="sidebar-title">
              <i class="fa-solid fa-sliders"></i> Propiedades
            </h3>
            <div class="prop-group">
              <label class="prop-label">Mesa</label>
              <span class="prop-value">{{ selectedMesa()!.nombreMesa }}</span>
            </div>
            <div class="prop-group">
              <label class="prop-label">Numero</label>
              <span class="prop-value">#{{ selectedMesa()!.numeroMesa }}</span>
            </div>
            <div class="prop-group">
              <label class="prop-label">Capacidad</label>
              <span class="prop-value">
                <i class="fa-solid fa-users"></i> {{ selectedMesa()!.capacidad }}
              </span>
            </div>
            <div class="prop-group">
              <label class="prop-label">Forma</label>
              <div class="shape-selector">
                <button
                  class="shape-btn"
                  [class.active]="getLocalForma(selectedMesa()!.id) === 'REDONDA'"
                  (click)="setForma(selectedMesa()!.id, 'REDONDA')"
                  title="Redonda"
                >
                  <span class="shape-preview round"></span>
                </button>
                <button
                  class="shape-btn"
                  [class.active]="getLocalForma(selectedMesa()!.id) === 'CUADRADA'"
                  (click)="setForma(selectedMesa()!.id, 'CUADRADA')"
                  title="Cuadrada"
                >
                  <span class="shape-preview square"></span>
                </button>
                <button
                  class="shape-btn"
                  [class.active]="getLocalForma(selectedMesa()!.id) === 'RECTANGULAR'"
                  (click)="setForma(selectedMesa()!.id, 'RECTANGULAR')"
                  title="Rectangular"
                >
                  <span class="shape-preview rect"></span>
                </button>
              </div>
            </div>
            <div class="prop-group">
              <label class="prop-label">Estado</label>
              <span class="prop-value">
                <span class="status-dot" [ngClass]="'dot-' + selectedMesa()!.estado.toLowerCase()"></span>
                {{ estadoLabels[selectedMesa()!.estado] || selectedMesa()!.estado }}
              </span>
            </div>
            <div class="prop-group">
              <label class="prop-label">Zona</label>
              <span class="prop-value">{{ selectedMesa()!.zona || 'Sin zona' }}</span>
            </div>
            <button
              class="btn btn-ghost btn-sm btn-full"
              (click)="removeFromPlan(selectedMesa()!.id)"
            >
              <i class="fa-solid fa-arrow-left"></i> Quitar del plano
            </button>
          </div>
        }

        <!-- Unplaced tables -->
        <div class="sidebar-section">
          <h3 class="sidebar-title">
            <i class="fa-solid fa-inbox"></i> Sin colocar
            <span class="count-badge">{{ unplacedMesas().length }}</span>
          </h3>
          @if (unplacedMesas().length > 0) {
            <div class="unplaced-list">
              @for (mesa of unplacedMesas(); track mesa.id) {
                <div
                  class="unplaced-card"
                  [ngClass]="'estado-' + mesa.estado.toLowerCase()"
                  (pointerdown)="onUnplacedPointerDown($event, mesa)"
                >
                  <div class="unplaced-info">
                    <span class="unplaced-number">#{{ mesa.numeroMesa }}</span>
                    <span class="unplaced-name">{{ mesa.nombreMesa }}</span>
                  </div>
                  <span class="unplaced-cap">
                    <i class="fa-solid fa-users"></i> {{ mesa.capacidad }}
                  </span>
                </div>
              }
            </div>
          } @else {
            <p class="empty-hint">Todas las mesas estan colocadas</p>
          }
        </div>
      </aside>

      <!-- Floor plan area -->
      <div
        class="fp-canvas-wrapper"
        #canvasWrapper
        (pointerup)="onCanvasPointerUp($event)"
        (pointermove)="onCanvasPointerMove($event)"
      >
        <div
          class="fp-canvas"
          #canvas
          [class.show-grid]="showGrid()"
          (click)="onCanvasClick($event)"
        >
          @for (mesa of placedMesas(); track mesa.id) {
            <div
              class="fp-table"
              [ngClass]="[
                'shape-' + getLocalForma(mesa.id).toLowerCase(),
                'estado-' + mesa.estado.toLowerCase(),
                selectedMesa()?.id === mesa.id ? 'selected' : '',
                draggingId() === mesa.id ? 'dragging' : ''
              ]"
              [style.left.%]="getLocalPos(mesa.id).x"
              [style.top.%]="getLocalPos(mesa.id).y"
              [style.transform]="'rotate(' + (getLocalRotation(mesa.id)) + 'deg)'"
              (pointerdown)="onTablePointerDown($event, mesa)"
              (click)="onTableClick($event, mesa)"
            >
              <span class="table-number">{{ mesa.numeroMesa }}</span>
              <span class="table-cap">
                <i class="fa-solid fa-user"></i>{{ mesa.capacidad }}
              </span>
            </div>
          }

          <!-- Ghost element for dragging from sidebar -->
          @if (dragGhost()) {
            <div
              class="fp-table ghost"
              [ngClass]="'shape-' + (dragGhost()!.forma || 'cuadrada').toLowerCase()"
              [style.left.%]="dragGhost()!.x"
              [style.top.%]="dragGhost()!.y"
            >
              <span class="table-number">{{ dragGhost()!.numero }}</span>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="fp-legend">
      <div class="legend-item">
        <span class="legend-dot dot-libre"></span> Libre
      </div>
      <div class="legend-item">
        <span class="legend-dot dot-ocupada"></span> Ocupada
      </div>
      <div class="legend-item">
        <span class="legend-dot dot-reservada"></span> Reservada
      </div>
      <div class="legend-item">
        <span class="legend-dot dot-mantenimiento"></span> Mantenimiento
      </div>
      @if (hasChanges()) {
        <span class="unsaved-badge">
          <i class="fa-solid fa-circle-exclamation"></i> Cambios sin guardar
        </span>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* === Toolbar === */
    .fp-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 0;
      margin-bottom: 0.75rem;
      border-bottom: 1px solid var(--card-border);
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .toolbar-left, .toolbar-right { display: flex; gap: 0.5rem; align-items: center; }
    .btn.active {
      background-color: var(--primary-coral);
      color: var(--text-white);
      border-color: var(--primary-coral);
    }

    /* === Main layout === */
    .fp-main {
      display: flex;
      gap: 1rem;
      min-height: 500px;
    }

    /* === Sidebar === */
    .fp-sidebar {
      width: 240px;
      min-width: 240px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .sidebar-section {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
      padding: 1rem;
    }
    .sidebar-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .sidebar-title i { color: var(--primary-coral); font-size: 0.8rem; }
    .count-badge {
      background: var(--primary-coral);
      color: white;
      font-size: 0.675rem;
      padding: 0.1rem 0.4rem;
      border-radius: 9999px;
      margin-left: auto;
    }

    /* Properties */
    .prop-group {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      margin-bottom: 0.625rem;
    }
    .prop-label {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-muted);
    }
    .prop-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }
    .prop-value i { font-size: 0.75rem; color: var(--text-muted); }

    /* Shape selector */
    .shape-selector { display: flex; gap: 0.5rem; }
    .shape-btn {
      width: 40px;
      height: 36px;
      border: 2px solid var(--card-border);
      border-radius: var(--radius-sm);
      background: var(--card-bg);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .shape-btn:hover { border-color: var(--primary-coral); }
    .shape-btn.active {
      border-color: var(--primary-coral);
      background: rgba(255, 127, 80, 0.1);
    }
    .shape-preview {
      background: var(--text-muted);
      display: block;
    }
    .shape-preview.round { width: 20px; height: 20px; border-radius: 50%; }
    .shape-preview.square { width: 20px; height: 20px; border-radius: 3px; }
    .shape-preview.rect { width: 28px; height: 18px; border-radius: 3px; }

    .status-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .dot-libre { background: var(--status-free); }
    .dot-ocupada { background: var(--status-occupied); }
    .dot-reservada { background: var(--status-reserved); }
    .dot-mantenimiento { background: var(--input-border); }

    .btn-full { width: 100%; justify-content: center; margin-top: 0.5rem; }

    /* Unplaced list */
    .unplaced-list { display: flex; flex-direction: column; gap: 0.375rem; }
    .unplaced-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.625rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--card-border);
      background: var(--card-bg);
      cursor: grab;
      transition: all 0.15s;
      user-select: none;
      touch-action: none;
    }
    .unplaced-card:hover {
      border-color: var(--primary-coral);
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .unplaced-card.estado-libre { border-left: 3px solid var(--status-free); }
    .unplaced-card.estado-ocupada { border-left: 3px solid var(--status-occupied); }
    .unplaced-card.estado-reservada { border-left: 3px solid var(--status-reserved); }
    .unplaced-card.estado-mantenimiento { border-left: 3px solid var(--input-border); }
    .unplaced-info { display: flex; align-items: center; gap: 0.375rem; }
    .unplaced-number {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
    }
    .unplaced-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100px;
    }
    .unplaced-cap {
      font-size: 0.7rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .unplaced-cap i { font-size: 0.6rem; }
    .empty-hint {
      font-size: 0.8rem;
      color: var(--text-muted);
      text-align: center;
      padding: 1rem 0;
    }

    /* === Canvas === */
    .fp-canvas-wrapper {
      flex: 1;
      background: var(--card-bg);
      border: 2px solid var(--card-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      position: relative;
    }
    .fp-canvas {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 10;
      background: var(--content-bg);
      overflow: hidden;
    }
    .fp-canvas.show-grid {
      background-image:
        linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
      background-size: 5% 5%;
    }
    [data-theme="dark"] .fp-canvas.show-grid {
      background-image:
        linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
      background-size: 5% 5%;
    }

    /* === Table on canvas === */
    .fp-table {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: grab;
      user-select: none;
      touch-action: none;
      transition: box-shadow 0.2s, border-color 0.2s;
      border: 2px solid var(--card-border);
      background: var(--card-bg);
      z-index: 1;
    }
    .fp-table:hover { z-index: 5; }
    .fp-table.dragging {
      cursor: grabbing;
      z-index: 10;
      opacity: 0.85;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    }
    .fp-table.selected {
      z-index: 8;
      box-shadow: 0 0 0 3px var(--primary-coral), 0 4px 12px rgba(255,127,80,0.3);
    }
    .fp-table.ghost {
      opacity: 0.5;
      pointer-events: none;
      border-style: dashed;
      z-index: 20;
    }

    /* Shapes */
    .fp-table.shape-redonda {
      width: 70px; height: 70px;
      border-radius: 50%;
      margin-left: -35px; margin-top: -35px;
    }
    .fp-table.shape-cuadrada {
      width: 70px; height: 70px;
      border-radius: 8px;
      margin-left: -35px; margin-top: -35px;
    }
    .fp-table.shape-rectangular {
      width: 110px; height: 70px;
      border-radius: 8px;
      margin-left: -55px; margin-top: -35px;
    }

    /* Estado colors */
    .fp-table.estado-libre {
      border-color: var(--status-free);
      background: linear-gradient(135deg, var(--card-bg), rgba(16,185,129,0.1));
    }
    .fp-table.estado-ocupada {
      border-color: var(--status-occupied);
      background: linear-gradient(135deg, var(--card-bg), rgba(239,68,68,0.1));
    }
    .fp-table.estado-reservada {
      border-color: var(--status-reserved);
      background: linear-gradient(135deg, var(--card-bg), rgba(245,158,11,0.1));
    }
    .fp-table.estado-mantenimiento {
      border-color: var(--input-border);
      background: linear-gradient(135deg, var(--card-bg), rgba(107,114,128,0.1));
      opacity: 0.6;
    }

    .table-number {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1;
    }
    .table-cap {
      font-size: 0.65rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.15rem;
      margin-top: 0.15rem;
    }
    .table-cap i { font-size: 0.55rem; }

    /* === Legend === */
    .fp-legend {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 0.75rem 0;
      margin-top: 0.75rem;
      border-top: 1px solid var(--card-border);
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .legend-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
    }
    .unsaved-badge {
      margin-left: auto;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--warning-text);
      background: var(--warning-bg);
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    /* === Responsive === */
    @media (max-width: 768px) {
      .fp-main { flex-direction: column; }
      .fp-sidebar { width: 100%; min-width: auto; flex-direction: row; overflow-x: auto; }
      .sidebar-section { min-width: 220px; }
    }
  `]
})
export class FloorPlanComponent implements OnInit {
  private mesaService = inject(MesaService);
  private toastService = inject(ToastService);

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvasWrapper') canvasWrapperRef!: ElementRef<HTMLDivElement>;

  // Data
  allMesas = signal<Mesa[]>([]);
  showGrid = signal(true);
  selectedMesaId = signal<number | null>(null);

  // Local layout state (editable, separate from server data)
  localLayouts = signal<Map<number, { x: number | null; y: number | null; forma: string; rotacion: number }>>(new Map());
  hasChanges = signal(false);

  // Drag state
  draggingId = signal<number | null>(null);
  private dragOffset = { x: 0, y: 0 };
  private isDraggingFromSidebar = false;
  private sidebarDragMesa: Mesa | null = null;

  dragGhost = signal<{ x: number; y: number; numero: number; forma: string } | null>(null);

  // Computed
  selectedMesa = computed(() => {
    const id = this.selectedMesaId();
    return id !== null ? this.allMesas().find(m => m.id === id) ?? null : null;
  });

  placedMesas = computed(() => {
    const layouts = this.localLayouts();
    return this.allMesas().filter(m => {
      const local = layouts.get(m.id);
      if (local) return local.x !== null && local.y !== null;
      return m.posX != null && m.posY != null;
    });
  });

  unplacedMesas = computed(() => {
    const layouts = this.localLayouts();
    return this.allMesas().filter(m => {
      const local = layouts.get(m.id);
      if (local) return local.x === null || local.y === null;
      return m.posX == null || m.posY == null;
    }).sort((a, b) => a.numeroMesa - b.numeroMesa);
  });

  readonly estadoLabels: Record<string, string> = {
    LIBRE: 'Libre',
    OCUPADA: 'Ocupada',
    RESERVADA: 'Reservada',
    MANTENIMIENTO: 'Mantenimiento',
  };

  ngOnInit(): void {
    this.loadMesas();
  }

  private loadMesas(): void {
    this.mesaService.getAll().subscribe({
      next: (mesas) => {
        this.allMesas.set(mesas);
        this.syncLocalLayouts(mesas);
      },
      error: () => this.toastService.error('Error al cargar mesas'),
    });
  }

  private syncLocalLayouts(mesas: Mesa[]): void {
    const map = new Map<number, { x: number | null; y: number | null; forma: string; rotacion: number }>();
    for (const m of mesas) {
      map.set(m.id, {
        x: m.posX ?? null,
        y: m.posY ?? null,
        forma: m.forma || 'CUADRADA',
        rotacion: m.rotacion ?? 0,
      });
    }
    this.localLayouts.set(map);
    this.hasChanges.set(false);
  }

  getLocalPos(id: number): { x: number; y: number } {
    const local = this.localLayouts().get(id);
    if (local && local.x !== null && local.y !== null) return { x: local.x, y: local.y };
    const mesa = this.allMesas().find(m => m.id === id);
    return { x: mesa?.posX ?? 50, y: mesa?.posY ?? 50 };
  }

  getLocalForma(id: number): string {
    return this.localLayouts().get(id)?.forma || 'CUADRADA';
  }

  getLocalRotation(id: number): number {
    return this.localLayouts().get(id)?.rotacion || 0;
  }

  setForma(id: number, forma: string): void {
    const map = new Map(this.localLayouts());
    const current = map.get(id);
    if (current) {
      map.set(id, { ...current, forma });
      this.localLayouts.set(map);
      this.hasChanges.set(true);
    }
  }

  removeFromPlan(id: number): void {
    const map = new Map(this.localLayouts());
    const current = map.get(id);
    if (current) {
      map.set(id, { ...current, x: null, y: null });
      this.localLayouts.set(map);
      this.hasChanges.set(true);
      this.selectedMesaId.set(null);
    }
  }

  // === Drag: Table on canvas ===

  onTablePointerDown(event: PointerEvent, mesa: Mesa): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFromSidebar = false;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const pos = this.getLocalPos(mesa.id);

    // Calculate offset between pointer and table center (in %)
    const pointerX = ((event.clientX - rect.left) / rect.width) * 100;
    const pointerY = ((event.clientY - rect.top) / rect.height) * 100;
    this.dragOffset.x = pointerX - pos.x;
    this.dragOffset.y = pointerY - pos.y;

    this.draggingId.set(mesa.id);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  onTableClick(event: MouseEvent, mesa: Mesa): void {
    event.stopPropagation();
    this.selectedMesaId.set(mesa.id);
  }

  // === Drag: From sidebar ===

  onUnplacedPointerDown(event: PointerEvent, mesa: Mesa): void {
    event.preventDefault();
    this.isDraggingFromSidebar = true;
    this.sidebarDragMesa = mesa;
    this.dragOffset.x = 0;
    this.dragOffset.y = 0;

    // Show ghost on canvas
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this.dragGhost.set({
      x: this.clamp(x, 0, 100),
      y: this.clamp(y, 0, 100),
      numero: mesa.numeroMesa,
      forma: this.getLocalForma(mesa.id),
    });
  }

  // === Canvas pointer events ===

  onCanvasPointerMove(event: PointerEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    if (this.isDraggingFromSidebar && this.sidebarDragMesa) {
      this.dragGhost.update(g => g ? { ...g, x: this.clamp(x, 2, 98), y: this.clamp(y, 2, 98) } : g);
      return;
    }

    const id = this.draggingId();
    if (id === null) return;

    const newX = this.clamp(x - this.dragOffset.x, 2, 98);
    const newY = this.clamp(y - this.dragOffset.y, 2, 98);

    // Snap to grid (5% increments when grid is on)
    const snapX = this.showGrid() ? Math.round(newX / 5) * 5 : newX;
    const snapY = this.showGrid() ? Math.round(newY / 5) * 5 : newY;

    const map = new Map(this.localLayouts());
    const current = map.get(id);
    if (current) {
      map.set(id, { ...current, x: snapX, y: snapY });
      this.localLayouts.set(map);
      this.hasChanges.set(true);
    }
  }

  onCanvasPointerUp(event: PointerEvent): void {
    if (this.isDraggingFromSidebar && this.sidebarDragMesa) {
      const ghost = this.dragGhost();
      if (ghost) {
        const canvas = this.canvasRef.nativeElement;
        const rect = canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        // Only place if pointer is inside canvas
        if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
          const snapX = this.showGrid() ? Math.round(this.clamp(x, 2, 98) / 5) * 5 : this.clamp(x, 2, 98);
          const snapY = this.showGrid() ? Math.round(this.clamp(y, 2, 98) / 5) * 5 : this.clamp(y, 2, 98);

          const map = new Map(this.localLayouts());
          const current = map.get(this.sidebarDragMesa.id);
          if (current) {
            map.set(this.sidebarDragMesa.id, { ...current, x: snapX, y: snapY });
            this.localLayouts.set(map);
            this.hasChanges.set(true);
          }
          this.selectedMesaId.set(this.sidebarDragMesa.id);
        }
      }
      this.dragGhost.set(null);
      this.sidebarDragMesa = null;
      this.isDraggingFromSidebar = false;
      return;
    }

    this.draggingId.set(null);
  }

  onCanvasClick(event: MouseEvent): void {
    // Deselect when clicking empty canvas area
    this.selectedMesaId.set(null);
  }

  // === Save / Discard ===

  saveLayout(): void {
    const layouts: MesaLayout[] = [];
    this.localLayouts().forEach((layout, id) => {
      layouts.push({
        id,
        posX: layout.x,
        posY: layout.y,
        forma: layout.forma,
        rotacion: layout.rotacion,
      });
    });

    this.mesaService.saveLayout(layouts).subscribe({
      next: () => {
        this.toastService.success('Disposicion guardada');
        this.loadMesas();
      },
      error: () => this.toastService.error('Error al guardar disposicion'),
    });
  }

  discardChanges(): void {
    this.syncLocalLayouts(this.allMesas());
    this.selectedMesaId.set(null);
    this.toastService.success('Cambios descartados');
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
