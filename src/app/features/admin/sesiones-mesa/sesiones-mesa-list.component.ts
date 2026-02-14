import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SesionMesaService } from '../../../core/services/sesion-mesa.service';
import { MesaService } from '../../../core/services/mesa.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ToastService } from '../../../core/services/toast.service';
import { MockReservasService } from '../../../core/services/mock-reservas.service';
import { SesionMesa } from '../../../core/models/sesion-mesa.interface';
import { Mesa } from '../../../core/models/mesa.interface';
import { Cliente } from '../../../core/models/cliente.interface';
import { ReservasMesa } from '../../../core/models/reservas-mesa.interface';
import { EntityFormModalComponent } from '../../../shared/components/entity-form-modal/entity-form-modal.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-sesiones-mesa-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EntityFormModalComponent,
    StatusBadgeComponent,
    ConfirmModalComponent,
    BeerLoaderComponent
  ],
  template: `
    <app-beer-loader [isLoading]="isLoading()" />
    <div class="page-wrapper">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Sesiones de Mesa</h1>
          <span class="record-count">{{ filteredSesiones().length }} registros</span>
        </div>
        <button class="btn btn-primary" (click)="openAbrir()">
          <i class="fa-solid fa-door-open"></i>
          Abrir Sesion
        </button>
      </div>

      <!-- Filtros -->
      <div class="filter-bar">
        <div class="search-input-wrapper">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            class="form-input search-input"
            placeholder="Buscar por mesa o cliente..."
            [value]="searchTerm()"
            (input)="searchTerm.set($any($event.target).value)"
          />
        </div>
        <div class="estado-filters">
          @for (f of estadoFilters; track f.value) {
            <button
              class="filter-pill"
              [class.active]="estadoFilter() === f.value"
              (click)="estadoFilter.set(f.value)"
            >
              {{ f.label }}
            </button>
          }
        </div>
      </div>

      <!-- Table -->
      <div class="card table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mesa</th>
              <th>Cliente</th>
              <th>Comensales</th>
              <th>Ludoteca</th>
              <th>Estado</th>
              <th>Apertura</th>
              <th>Cierre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (s of filteredSesiones(); track s.id) {
              <tr class="clickable-row" (click)="navigateToDetail(s.id)">
                <td>{{ s.id }}</td>
                <td>{{ getMesaNombre(s.idMesa) }}</td>
                <td>{{ getClienteNombre(s.idCliente) }}</td>
                <td>{{ s.numComensales ?? '-' }}</td>
                <td>
                  <span class="bool-badge" [class.bool-si]="s.usaLudoteca" [class.bool-no]="!s.usaLudoteca">
                    {{ s.usaLudoteca ? 'Si' : 'No' }}
                  </span>
                </td>
                <td><app-status-badge [status]="s.estado" /></td>
                <td>{{ formatDateTime(s.fechaHoraApertura) }}</td>
                <td>{{ s.fechaHoraCierre ? formatDateTime(s.fechaHoraCierre) : '-' }}</td>
                <td class="actions-cell" (click)="$event.stopPropagation()">
                  <button class="btn btn-ghost btn-sm" (click)="navigateToDetail(s.id)" title="Ver detalle">
                    <i class="fa-solid fa-eye"></i>
                  </button>
                  @if (s.estado === 'ACTIVA') {
                    <button class="btn btn-danger btn-sm" (click)="openCerrar(s.id)" title="Cerrar sesion">
                      <i class="fa-solid fa-door-closed"></i>
                    </button>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="9" class="empty-state">
                  <i class="fa-solid fa-door-open empty-icon"></i>
                  <p>No se encontraron sesiones</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Modal Abrir Sesion -->
      <app-entity-form-modal
        [isOpen]="showAbrirModal()"
        title="Abrir Sesion"
        [isEditing]="false"
        [formValid]="abrirForm.valid"
        (onClose)="showAbrirModal.set(false)"
        (onSubmit)="submitAbrir()"
      >
        <form [formGroup]="abrirForm">
          <div class="form-group">
            <label class="form-label">Reserva (opcional)</label>
            <select class="form-input" formControlName="idReserva" (change)="onReservaChange($event)">
              <option [ngValue]="null">Sin reserva</option>
              @for (r of reservasPendientes(); track r.id) {
                <option [ngValue]="r.id">{{ r.fechaReserva }} {{ r.horaInicio }} - Mesa #{{ r.idMesa }} ({{ r.numPersonas }} pax)</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Mesa *</label>
            <select class="form-input" formControlName="idMesa">
              <option [ngValue]="null" disabled>Seleccionar mesa...</option>
              @for (m of mesasLibres(); track m.id) {
                <option [ngValue]="m.id">#{{ m.numeroMesa }} - {{ m.nombreMesa }} ({{ m.capacidad }} pax)</option>
              }
            </select>
            @if (abrirForm.get('idMesa')?.invalid && abrirForm.get('idMesa')?.touched) {
              <span class="form-error">La mesa es obligatoria</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Cliente (opcional)</label>
            <select class="form-input" formControlName="idCliente">
              <option [ngValue]="null">Sin cliente registrado</option>
              @for (c of clientes(); track c.id) {
                <option [ngValue]="c.id">{{ c.nombre }} ({{ c.email }})</option>
              }
            </select>
          </div>

          <div class="form-row">
            <div class="form-group form-col">
              <label class="form-label">Comensales *</label>
              <input type="number" class="form-input" formControlName="numComensales" min="1" placeholder="Numero de personas" />
              @if (abrirForm.get('numComensales')?.invalid && abrirForm.get('numComensales')?.touched) {
                <span class="form-error">Minimo 1 comensal</span>
              }
            </div>
            <div class="form-group form-col">
              <label class="form-label">&nbsp;</label>
              <label class="check-label">
                <input type="checkbox" formControlName="usaLudoteca" />
                <span>Usa ludoteca</span>
              </label>
            </div>
          </div>
        </form>
      </app-entity-form-modal>

      <!-- Confirm Cerrar -->
      <app-confirm-modal
        [isOpen]="showCerrarModal()"
        title="Cerrar Sesion"
        message="Se verificaran pagos y comandas. Si todo esta correcto, se generara la factura automaticamente."
        (onConfirm)="submitCerrar()"
        (onCancel)="showCerrarModal.set(false)"
      />
    </div>
  `,
  styles: [`
    .page-wrapper { padding: var(--spacing-xl); }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-lg); }
    .header-left { display: flex; align-items: baseline; gap: var(--spacing-md); }
    .page-title { font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin: 0; }
    .record-count { font-size: 0.875rem; color: var(--text-muted); }

    .filter-bar { display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-lg); flex-wrap: wrap; }
    .search-input-wrapper { position: relative; }
    .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.875rem; }
    .search-input { padding-left: 2.25rem; width: 260px; }
    .estado-filters { display: flex; gap: 0.5rem; }
    .filter-pill { padding: 0.375rem 1rem; border-radius: 9999px; border: 1px solid var(--input-border); background-color: var(--card-bg); color: var(--text-muted); font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .filter-pill:hover { border-color: var(--primary-coral); color: var(--primary-coral); }
    .filter-pill.active { background-color: var(--primary-coral); border-color: var(--primary-coral); color: var(--text-white); }

    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table thead { background-color: var(--table-header-bg); }
    .data-table th { padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--table-border); white-space: nowrap; }
    .data-table td { padding: 0.75rem 1rem; font-size: 0.875rem; color: var(--text-main); border-bottom: 1px solid var(--table-border); }
    .data-table tbody tr:hover { background-color: var(--table-row-hover); }
    .clickable-row { cursor: pointer; }
    .actions-cell { display: flex; gap: 0.5rem; white-space: nowrap; }
    .empty-state { text-align: center; padding: 3rem 1rem; color: var(--text-muted); }
    .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; opacity: 0.5; }

    .bool-badge { display: inline-flex; align-items: center; padding: 0.125rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; border: 1px solid transparent; }
    .bool-si { background-color: var(--success-bg); color: var(--success-text); border-color: var(--success); }
    .bool-no { background-color: var(--secondary-bg); color: var(--text-muted); border-color: var(--input-border); }

    .form-row { display: flex; gap: var(--spacing-md); }
    .form-col { flex: 1; }
    .check-label { display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.875rem; color: var(--text-main); font-weight: 500; height: 42px; }
    .check-label input[type="checkbox"] { width: 1rem; height: 1rem; cursor: pointer; accent-color: var(--primary-coral); }

    @media (max-width: 768px) {
      .page-wrapper { padding: var(--spacing-md); }
      .page-header { flex-direction: column; align-items: flex-start; gap: var(--spacing-md); }
      .filter-bar { flex-direction: column; align-items: flex-start; }
      .search-input { width: 100%; }
      .form-row { flex-direction: column; gap: 0; }
    }
  `]
})
export class SesionesMesaListComponent implements OnInit {
  private sesionService = inject(SesionMesaService);
  private mesaService = inject(MesaService);
  private clienteService = inject(ClienteService);
  private reservasService = inject(MockReservasService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  sesiones = signal<SesionMesa[]>([]);
  mesas = signal<Mesa[]>([]);
  clientes = signal<Cliente[]>([]);
  reservasPendientes = signal<ReservasMesa[]>([]);
  searchTerm = signal('');
  estadoFilter = signal('');
  showAbrirModal = signal(false);
  showCerrarModal = signal(false);
  cerrarId = signal<number | null>(null);
  isLoading = signal(true);

  estadoFilters = [
    { label: 'Todas', value: '' },
    { label: 'Activas', value: 'ACTIVA' },
    { label: 'Cerradas', value: 'CERRADA' },
    { label: 'Canceladas', value: 'CANCELADA' }
  ];

  mesasLibres = computed(() => this.mesas().filter(m => m.estado === 'LIBRE' || m.estado === 'RESERVADA'));

  filteredSesiones = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const estado = this.estadoFilter();
    let list = this.sesiones();

    if (estado) {
      list = list.filter(s => s.estado === estado);
    }

    if (term) {
      list = list.filter(s => {
        const mesaNombre = this.getMesaNombre(s.idMesa).toLowerCase();
        const clienteNombre = this.getClienteNombre(s.idCliente).toLowerCase();
        return mesaNombre.includes(term) || clienteNombre.includes(term) || s.id.toString().includes(term);
      });
    }

    return list;
  });

  abrirForm = this.fb.group({
    idReserva: [null as number | null],
    idMesa: [null as number | null, Validators.required],
    idCliente: [null as number | null],
    numComensales: [1, [Validators.required, Validators.min(1)]],
    usaLudoteca: [false]
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.sesionService.getAll().subscribe({
      next: (data) => { this.sesiones.set(data); this.isLoading.set(false); },
      error: () => { this.toastService.error('Error al cargar sesiones'); this.isLoading.set(false); }
    });
    this.mesaService.getAll().subscribe({
      next: (data) => this.mesas.set(data),
      error: () => {}
    });
    this.clienteService.getAll().subscribe({
      next: (data) => this.clientes.set(data),
      error: () => {}
    });
    this.reservasService.getAll().subscribe({
      next: (data) => this.reservasPendientes.set(data.filter(r => r.estado === 'CONFIRMADA')),
      error: () => {}
    });
  }

  getMesaNombre(idMesa: number): string {
    const mesa = this.mesas().find(m => m.id === idMesa);
    return mesa ? `#${mesa.numeroMesa} ${mesa.nombreMesa}` : `Mesa ${idMesa}`;
  }

  getClienteNombre(idCliente?: number): string {
    if (!idCliente) return '-';
    const cliente = this.clientes().find(c => c.id === idCliente);
    return cliente ? cliente.nombre : `Cliente ${idCliente}`;
  }

  navigateToDetail(id: number): void {
    const currentUrl = this.router.url;
    const base = currentUrl.startsWith('/staff') ? '/staff' : '/admin';
    this.router.navigate([`${base}/sesiones-mesa`, id]);
  }

  openAbrir(): void {
    this.abrirForm.reset({ idReserva: null, idMesa: null, idCliente: null, numComensales: 1, usaLudoteca: false });
    this.showAbrirModal.set(true);
  }

  onReservaChange(event: Event): void {
    const reservaId = (event.target as HTMLSelectElement).value;
    if (!reservaId || reservaId === 'null') {
      return;
    }
    const reserva = this.reservasPendientes().find(r => r.id === +reservaId);
    if (reserva) {
      this.abrirForm.patchValue({
        idMesa: reserva.idMesa ?? null,
        idCliente: reserva.idCliente,
        numComensales: reserva.numPersonas
      });
    }
  }

  submitAbrir(): void {
    if (this.abrirForm.invalid) return;
    const raw = this.abrirForm.getRawValue();
    this.sesionService.abrir(raw as any).subscribe({
      next: (sesion) => {
        this.toastService.success('Sesion abierta correctamente');
        this.showAbrirModal.set(false);
        this.navigateToDetail(sesion.id);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error || 'Error al abrir sesion';
        this.toastService.error(msg);
      }
    });
  }

  openCerrar(id: number): void {
    this.cerrarId.set(id);
    this.showCerrarModal.set(true);
  }

  submitCerrar(): void {
    const id = this.cerrarId();
    if (!id) return;
    this.sesionService.cerrar(id).subscribe({
      next: () => {
        this.toastService.success('Sesion cerrada y factura generada');
        this.showCerrarModal.set(false);
        this.loadData();
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error || 'Error al cerrar sesion';
        this.toastService.error(msg);
        this.showCerrarModal.set(false);
      }
    });
  }

  formatDateTime(iso: string): string {
    if (!iso) return '-';
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return iso;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  }
}
