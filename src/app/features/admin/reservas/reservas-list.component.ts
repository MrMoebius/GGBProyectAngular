import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MockReservasService } from '../../../core/services/mock-reservas.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReservasMesa } from '../../../core/models/reservas-mesa.interface';
import { ReservasMesaService } from '../../../core/services/reservas-mesa.service';
import { Cliente } from '../../../core/models/cliente.interface';
import { EntityFormModalComponent } from '../../../shared/components/entity-form-modal/entity-form-modal.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-reservas-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EntityFormModalComponent, ConfirmModalComponent, BeerLoaderComponent],
  template: `
    <app-beer-loader [isLoading]="isLoading()" />
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Reservas</h1>
          <span class="record-count">{{ filteredReservas().length }} registros</span>
        </div>
        <button class="btn btn-primary" (click)="openCreate()">
          <i class="fa-solid fa-plus"></i> Nueva Reserva
        </button>
      </div>

      <div class="filter-bar">
        <div class="search-input-wrapper">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input type="text" class="form-input search-input" placeholder="Buscar por cliente..."
            [value]="searchTerm()" (input)="searchTerm.set($any($event.target).value)" />
        </div>
        <input type="date" class="form-input date-input" [value]="dateFilter()" (input)="dateFilter.set($any($event.target).value)" />
        <div class="estado-filters">
          @for (f of estadoFilters; track f.value) {
            <button class="filter-pill" [class.active]="estadoFilter() === f.value" (click)="estadoFilter.set(f.value)">
              {{ f.label }}
            </button>
          }
        </div>
      </div>

      <div class="reservas-grid">
        @for (r of filteredReservas(); track r.id) {
          <div class="reserva-card">
            <div class="card-top">
              <div class="card-datetime">
                <span class="card-fecha">{{ formatDate(getDate(r)) }}</span>
                <span class="card-hora">{{ getTime(r) }}</span>
              </div>
              <span class="estado-badge" [attr.data-estado]="r.estado">{{ getEstadoLabel(r.estado || '') }}</span>
            </div>

            <div class="card-body">
              <div class="card-field">
                <i class="fa-solid fa-user"></i>
                <span>{{ getReservaCliente(r) }}</span>
              </div>
              @if (r.telefonoManual) {
                <div class="card-field">
                  <i class="fa-solid fa-phone"></i>
                  <span>{{ r.telefonoManual }}</span>
                </div>
              }
              <div class="card-field">
                <i class="fa-solid fa-users"></i>
                <span>{{ r.numPersonas }} personas</span>
              </div>
              @if (r.notas) {
                <div class="card-field notas">
                  <i class="fa-solid fa-note-sticky"></i>
                  <span>{{ r.notas }}</span>
                </div>
              }
              @if (r.fechaSolicitud) {
                <div class="card-field solicitud">
                  <i class="fa-solid fa-clock-rotate-left"></i>
                  <span>Solicitada el {{ formatSolicitud(r.fechaSolicitud) }}</span>
                </div>
              }
            </div>

            <div class="card-actions">
              @if (r.estado === 'PENDIENTE') {
                <button class="btn btn-sm btn-success" (click)="changeEstado(r.id, 'CONFIRMADA')">
                  <i class="fa-solid fa-check"></i> Confirmar
                </button>
                <button class="btn btn-sm btn-ghost" (click)="openEdit(r)">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-sm btn-ghost btn-cancel-action" (click)="openCancelConfirm(r.id)">
                  <i class="fa-solid fa-ban"></i>
                </button>
              } @else if (r.estado === 'CONFIRMADA') {
                <button class="btn btn-sm btn-primary" (click)="changeEstado(r.id, 'COMPLETADA')">
                  <i class="fa-solid fa-circle-check"></i> Completar
                </button>
                <button class="btn btn-sm btn-ghost" (click)="changeEstado(r.id, 'NO_SHOW')">
                  <i class="fa-solid fa-user-slash"></i> No-show
                </button>
                <button class="btn btn-sm btn-ghost" (click)="openEdit(r)">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-sm btn-ghost btn-cancel-action" (click)="openCancelConfirm(r.id)">
                  <i class="fa-solid fa-ban"></i>
                </button>
              }
            </div>
          </div>
        } @empty {
          <div class="empty-state-full">
            <i class="fa-solid fa-calendar-check empty-icon"></i>
            <p>No se encontraron reservas</p>
          </div>
        }
      </div>

      <!-- Form Modal -->
      <app-entity-form-modal
        [isOpen]="showFormModal()"
        [title]="editingReserva() ? 'Editar Reserva' : 'Nueva Reserva'"
        [isEditing]="!!editingReserva()"
        [formValid]="reservaForm.valid"
        (onClose)="showFormModal.set(false)"
        (onSubmit)="submitForm()"
      >
        <form [formGroup]="reservaForm">
          <div class="form-group">
            <label class="form-label">Tipo de cliente</label>
            <select class="form-input" formControlName="tipoCliente">
              <option value="registrado">Cliente registrado</option>
              <option value="manual">Sin registro</option>
            </select>
          </div>

          @if (reservaForm.get('tipoCliente')?.value === 'registrado') {
            <div class="form-group">
              <label class="form-label">Cliente *</label>
              <select class="form-input" formControlName="idCliente">
                <option [ngValue]="null" disabled>Seleccionar cliente...</option>
                @for (c of clientes(); track c.id) {
                  <option [ngValue]="c.id">{{ c.nombre }} ({{ c.email }})</option>
                }
              </select>
            </div>
          } @else {
            <div class="form-group">
              <label class="form-label">Nombre *</label>
              <input type="text" class="form-input" formControlName="nombreManual" placeholder="Nombre del cliente" />
            </div>
            <div class="form-group">
              <label class="form-label">Telefono</label>
              <input type="tel" class="form-input" formControlName="telefonoManual" placeholder="Telefono de contacto" />
            </div>
          }

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Fecha *</label>
              <input type="date" class="form-input" formControlName="fechaReserva" />
            </div>
            <div class="form-group">
              <label class="form-label">Hora inicio *</label>
              <select class="form-input" formControlName="horaInicio">
                <option value="" disabled>Seleccionar...</option>
                @for (slot of availableSlots(); track slot) {
                  <option [value]="slot">{{ slot }}</option>
                }
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Personas *</label>
            <input type="number" class="form-input" formControlName="numPersonas" min="1" />
          </div>

          <div class="form-group">
            <label class="form-label">Notas</label>
            <textarea class="form-input" formControlName="notas" rows="2" placeholder="Notas adicionales..."></textarea>
          </div>
        </form>
      </app-entity-form-modal>

      <!-- Cancel confirm -->
      <app-confirm-modal
        [isOpen]="showCancelModal()"
        title="Cancelar Reserva"
        message="Se cancelara esta reserva. Esta accion no se puede deshacer."
        (onConfirm)="submitCancel()"
        (onCancel)="showCancelModal.set(false)"
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
    .search-input { padding-left: 2.25rem; width: 220px; }
    .date-input { width: 160px; }
    .estado-filters { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .filter-pill { padding: 0.375rem 1rem; border-radius: 9999px; border: 1px solid var(--input-border); background-color: var(--card-bg); color: var(--text-muted); font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .filter-pill:hover { border-color: var(--primary-coral); color: var(--primary-coral); }
    .filter-pill.active { background-color: var(--primary-coral); border-color: var(--primary-coral); color: var(--text-white); }

    .reservas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }

    .reserva-card { background-color: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius-md, 8px); padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; transition: border-color 0.2s; }
    .reserva-card:hover { border-color: var(--primary-coral); }

    .card-top { display: flex; align-items: flex-start; justify-content: space-between; }
    .card-datetime { display: flex; flex-direction: column; gap: 0.125rem; }
    .card-fecha { font-weight: 700; font-size: 0.9375rem; color: var(--text-main); }
    .card-hora { font-size: 0.8125rem; color: var(--primary-coral); font-weight: 600; }

    .estado-badge { font-size: 0.6875rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; }
    .estado-badge[data-estado="CONFIRMADA"] { background: rgba(34,197,94,0.15); color: #22C55E; }
    .estado-badge[data-estado="PENDIENTE"] { background: rgba(250,204,21,0.15); color: #FACC15; }
    .estado-badge[data-estado="CANCELADA"] { background: rgba(239,68,68,0.15); color: #EF4444; }
    .estado-badge[data-estado="COMPLETADA"] { background: rgba(59,130,246,0.15); color: #3B82F6; }
    .estado-badge[data-estado="NO_SHOW"] { background: rgba(107,114,128,0.15); color: #9CA3AF; }

    .card-body { display: flex; flex-direction: column; gap: 0.375rem; }
    .card-field { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--text-muted); }
    .card-field i { width: 14px; text-align: center; font-size: 0.75rem; }
    .notas { font-style: italic; opacity: 0.85; }
    .solicitud { font-size: 0.75rem; opacity: 0.7; }

    .card-actions { display: flex; gap: 0.5rem; border-top: 1px solid var(--card-border); padding-top: 0.75rem; flex-wrap: wrap; }
    .btn-success { background-color: var(--success, #22C55E); color: #fff; border: none; }
    .btn-success:hover { opacity: 0.9; }
    .btn-cancel-action { color: var(--danger); }
    .btn-cancel-action:hover { background-color: rgba(239,68,68,0.1); }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md); }

    .empty-state-full { grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted); }
    .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; opacity: 0.5; display: block; }

    :host-context([data-theme="dark"]) input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) brightness(0.8); cursor: pointer; }
    :host-context([data-theme="dark"]) .date-input::-webkit-calendar-picker-indicator { filter: invert(1) brightness(0.8); cursor: pointer; }

    @media (max-width: 768px) {
      .page-wrapper { padding: var(--spacing-md); }
      .page-header { flex-direction: column; align-items: flex-start; gap: var(--spacing-md); }
      .filter-bar { flex-direction: column; align-items: flex-start; }
      .search-input, .date-input { width: 100%; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class ReservasListComponent implements OnInit {
  private reservasService = inject(MockReservasService);
  private clienteService = inject(ClienteService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  reservas = signal<ReservasMesa[]>([]);
  clientes = signal<Cliente[]>([]);
  searchTerm = signal('');
  estadoFilter = signal('');
  dateFilter = signal('');
  showFormModal = signal(false);
  editingReserva = signal<ReservasMesa | null>(null);
  showCancelModal = signal(false);
  cancelId = signal<number | null>(null);
  isLoading = signal(true);

  estadoFilters = [
    { label: 'Todas', value: '' },
    { label: 'Pendientes', value: 'PENDIENTE' },
    { label: 'Confirmadas', value: 'CONFIRMADA' },
    { label: 'Completadas', value: 'COMPLETADA' },
    { label: 'Canceladas', value: 'CANCELADA' },
    { label: 'No-show', value: 'NO_SHOW' },
  ];

  private readonly schedule: Record<number, { open: number; lastSlot: number } | null> = {
    0: { open: 12, lastSlot: 21 },
    1: null,
    2: { open: 17, lastSlot: 22 },
    3: { open: 17, lastSlot: 22 },
    4: { open: 17, lastSlot: 22 },
    5: { open: 17, lastSlot: 23 },
    6: { open: 12, lastSlot: 23 },
  };

  reservaForm = this.fb.group({
    tipoCliente: ['registrado'],
    idCliente: [null as number | null],
    nombreManual: [''],
    telefonoManual: [''],
    fechaReserva: ['', Validators.required],
    horaInicio: ['', Validators.required],
    numPersonas: [2, [Validators.required, Validators.min(1)]],
    notas: ['']
  });

  availableSlots = signal<string[]>([]);

  private recalcSlots(fecha: string): void {
    if (!fecha) { this.availableSlots.set([]); return; }
    const day = new Date(fecha + 'T12:00:00').getDay();
    const hours = this.schedule[day];
    if (!hours) { this.availableSlots.set([]); return; }
    const slots: string[] = [];
    for (let h = hours.open; h <= hours.lastSlot; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      if (h < hours.lastSlot) {
        slots.push(`${h.toString().padStart(2, '0')}:30`);
      }
    }
    this.availableSlots.set(slots);
  }

  filteredReservas = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const estado = this.estadoFilter();
    const date = this.dateFilter();
    let list = this.reservas();

    if (estado) list = list.filter(r => r.estado === estado);
    if (date) list = list.filter(r => this.getDate(r) === date);
    if (term) {
      list = list.filter(r => {
        const clientName = this.getReservaCliente(r).toLowerCase();
        return clientName.includes(term);
      });
    }

    return list.sort((a, b) => {
      return (b.fechaHoraInicio || '').localeCompare(a.fechaHoraInicio || '');
    });
  });

  ngOnInit(): void {
    this.loadData();
    this.reservaForm.get('fechaReserva')?.valueChanges.subscribe((fecha) => {
      this.reservaForm.get('horaInicio')?.setValue('');
      this.recalcSlots(fecha || '');
    });
  }

  loadData(): void {
    this.reservasService.getAll().subscribe({
      next: (data) => { this.reservas.set(data); this.isLoading.set(false); },
      error: () => { this.toastService.error('Error al cargar reservas'); this.isLoading.set(false); }
    });
    this.clienteService.getAll().subscribe({
      next: (data) => this.clientes.set(data),
      error: () => {}
    });
  }

  getReservaCliente(r: ReservasMesa): string {
    if (r.idCliente) {
      const c = this.clientes().find(cl => cl.id === r.idCliente);
      if (c) return c.nombre;
    }
    if (r.nombreManual) return r.nombreManual;
    return 'Sin identificar';
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      CONFIRMADA: 'Confirmada',
      PENDIENTE: 'Pendiente',
      CANCELADA: 'Cancelada',
      COMPLETADA: 'Completada',
      NO_SHOW: 'No-show'
    };
    return labels[estado] ?? estado;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  formatSolicitud(isoStr: string): string {
    const d = new Date(isoStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) + ' a las ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  openCreate(): void {
    this.editingReserva.set(null);
    this.reservaForm.reset({ tipoCliente: 'registrado', idCliente: null, nombreManual: '', telefonoManual: '', fechaReserva: '', horaInicio: '', numPersonas: 2, notas: '' });
    this.availableSlots.set([]);
    this.showFormModal.set(true);
  }

  openEdit(r: ReservasMesa): void {
    this.editingReserva.set(r);
    const tipo = r.nombreManual ? 'manual' : 'registrado';
    const fecha = this.getDate(r);
    this.recalcSlots(fecha);
    this.reservaForm.patchValue({
      tipoCliente: tipo,
      idCliente: r.idCliente || null,
      nombreManual: r.nombreManual || '',
      telefonoManual: r.telefonoManual || '',
      fechaReserva: fecha,
      horaInicio: this.getTime(r),
      numPersonas: r.numPersonas,
      notas: r.notas || ''
    });
    this.showFormModal.set(true);
  }

  submitForm(): void {
    if (this.reservaForm.invalid) return;
    const raw = this.reservaForm.getRawValue();
    const isManual = raw.tipoCliente === 'manual';

    const payload: Partial<ReservasMesa> = {
      idCliente: isManual ? 0 : (raw.idCliente ?? 0),
      nombreManual: isManual ? raw.nombreManual || undefined : undefined,
      telefonoManual: isManual ? raw.telefonoManual || undefined : undefined,
      fechaHoraInicio: ReservasMesaService.toInstant(raw.fechaReserva!, raw.horaInicio!),
      numPersonas: raw.numPersonas!,
      notas: raw.notas || undefined
    };

    const editing = this.editingReserva();
    if (editing) {
      this.reservasService.update(editing.id, payload).subscribe({
        next: () => {
          this.toastService.success('Reserva actualizada');
          this.showFormModal.set(false);
          this.loadData();
        },
        error: () => this.toastService.error('Error al actualizar reserva')
      });
    } else {
      this.reservasService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Reserva creada');
          this.showFormModal.set(false);
          this.loadData();
        },
        error: (err) => this.toastService.error(err?.message || 'Error al crear reserva')
      });
    }
  }

  changeEstado(id: number, estado: string): void {
    this.reservasService.changeEstado(id, estado).subscribe({
      next: () => {
        this.toastService.success(`Reserva marcada como ${this.getEstadoLabel(estado).toLowerCase()}`);
        this.loadData();
      },
      error: () => this.toastService.error('Error al cambiar estado')
    });
  }

  openCancelConfirm(id: number): void {
    this.cancelId.set(id);
    this.showCancelModal.set(true);
  }

  submitCancel(): void {
    const id = this.cancelId();
    if (!id) return;
    this.reservasService.changeEstado(id, 'CANCELADA').subscribe({
      next: () => {
        this.toastService.success('Reserva cancelada');
        this.showCancelModal.set(false);
        this.loadData();
      },
      error: () => this.toastService.error('Error al cancelar reserva')
    });
  }

  getDate(r: ReservasMesa): string {
    return ReservasMesaService.extractDate(r.fechaHoraInicio);
  }

  getTime(r: ReservasMesa): string {
    return ReservasMesaService.extractTime(r.fechaHoraInicio);
  }
}
