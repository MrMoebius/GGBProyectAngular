import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ComandaService } from '../../../core/services/comanda.service';
import { ToastService } from '../../../core/services/toast.service';
import { Comanda } from '../../../core/models/comanda.interface';
import { EntityFormModalComponent } from '../../../shared/components/entity-form-modal/entity-form-modal.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-comandas-list',
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
          <h1 class="page-title">Comandas</h1>
          <span class="record-count">{{ filteredComandas().length }} registros</span>
        </div>
        <button class="btn btn-primary" (click)="openCreate()">
          <i class="fa-solid fa-plus"></i>
          Nueva Comanda
        </button>
      </div>

      <!-- Search -->
      <div class="search-bar">
        <div class="search-input-wrapper">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            class="form-input search-input"
            placeholder="Buscar por ID sesion o estado..."
            [value]="searchTerm()"
            (input)="searchTerm.set($any($event.target).value)"
          />
        </div>
      </div>

      <!-- Grid -->
      <div class="comandas-grid">
        @for (cmd of filteredComandas(); track cmd.id) {
          <div class="comanda-card">
            <div class="comanda-header">
              <span class="comanda-id">#{{ cmd.id }}</span>
              <app-status-badge [status]="cmd.estado" />
            </div>
            <div class="comanda-body">
              <div class="comanda-field"><span class="field-label">Sesion</span><span class="field-value">{{ cmd.idSesion }}</span></div>
              <div class="comanda-field"><span class="field-label">Total</span><span class="field-value total">{{ formatCurrency(cmd.total) }}</span></div>
              <div class="comanda-field"><span class="field-label">Fecha</span><span class="field-value">{{ formatDateTime(cmd.fechaHora) }}</span></div>
            </div>
            <div class="comanda-actions">
              @if (cmd.estado === 'PENDIENTE') {
                <button class="btn btn-sm btn-success" (click)="doConfirmar(cmd.id)">Confirmar</button>
                <button class="btn btn-sm btn-outline-danger" (click)="doCancelar(cmd.id)">Cancelar</button>
              }
              @if (cmd.estado === 'CONFIRMADA') {
                <button class="btn btn-sm btn-warning" (click)="doPreparar(cmd.id)">Preparar</button>
                <button class="btn btn-sm btn-outline-danger" (click)="doCancelar(cmd.id)">Cancelar</button>
              }
              @if (cmd.estado === 'PREPARACION') {
                <button class="btn btn-sm btn-success" (click)="doServir(cmd.id)">Servir</button>
              }
              <div class="actions-right">
                <button class="btn btn-ghost btn-sm" (click)="verSesion(cmd.idSesion)" title="Ver sesion"><i class="fa-solid fa-eye"></i></button>
                <button class="btn btn-ghost btn-sm" (click)="openEdit(cmd)"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn btn-danger btn-sm" (click)="openDelete(cmd.id)"><i class="fa-solid fa-trash"></i></button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state-full">
            <i class="fa-solid fa-receipt empty-icon"></i>
            <p>No se encontraron comandas</p>
          </div>
        }
      </div>

      <!-- Form Modal -->
      <app-entity-form-modal
        [isOpen]="showFormModal()"
        [title]="isEditing() ? 'Editar Comanda' : 'Nueva Comanda'"
        [isEditing]="isEditing()"
        [formValid]="form.valid"
        (onClose)="closeFormModal()"
        (onSubmit)="saveComanda()"
      >
        <form [formGroup]="form">
          <div class="form-group">
            <label class="form-label">ID Sesion *</label>
            <input type="number" class="form-input" formControlName="idSesion" placeholder="ID de la sesion" />
            @if (form.get('idSesion')?.invalid && form.get('idSesion')?.touched) {
              <span class="form-error">El ID de sesion es obligatorio</span>
            }
          </div>

          <div class="form-row">
            <div class="form-group form-col">
              <label class="form-label">Estado *</label>
              <select class="form-input" formControlName="estado">
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="CONFIRMADA">CONFIRMADA</option>
                <option value="PREPARACION">PREPARACION</option>
                <option value="SERVIDA">SERVIDA</option>
                <option value="PAGADA">PAGADA</option>
                <option value="CANCELADA">CANCELADA</option>
              </select>
            </div>

            <div class="form-group form-col">
              <label class="form-label">Total (EUR)</label>
              <input type="number" class="form-input" formControlName="total" placeholder="0.00" step="0.01" readonly style="opacity: 0.6; cursor: not-allowed;" />
              <span class="form-hint">Se calcula automaticamente desde las lineas</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Fecha y Hora</label>
            <input type="datetime-local" class="form-input" formControlName="fechaHora" />
          </div>
        </form>
      </app-entity-form-modal>

      <!-- Confirm Delete Modal -->
      <app-confirm-modal
        [isOpen]="showDeleteModal()"
        title="Eliminar Comanda"
        message="Esta accion no se puede deshacer. Se eliminara permanentemente esta comanda."
        (onConfirm)="confirmDelete()"
        (onCancel)="showDeleteModal.set(false)"
      />
    </div>
  `,
  styles: [`
    .page-wrapper {
      padding: var(--spacing-xl);
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-lg);
    }

    .header-left {
      display: flex;
      align-items: baseline;
      gap: var(--spacing-md);
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0;
    }

    .record-count {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .search-bar {
      margin-bottom: var(--spacing-lg);
    }

    .search-input-wrapper {
      position: relative;
      max-width: 400px;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 0.875rem;
    }

    .search-input {
      padding-left: 2.25rem;
    }

    .comandas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .comanda-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      transition: box-shadow 0.2s;
    }

    .comanda-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .comanda-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .comanda-id {
      font-weight: 700;
      font-size: 1rem;
      color: var(--text-main);
    }

    .comanda-body {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .comanda-field {
      display: flex;
      justify-content: space-between;
    }

    .field-label {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .field-value {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-main);
    }

    .field-value.total {
      font-weight: 700;
      color: var(--primary-coral);
    }

    .comanda-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      border-top: 1px solid var(--card-border);
      padding-top: 0.75rem;
    }

    .actions-right {
      margin-left: auto;
      display: flex;
      gap: 0.25rem;
    }

    .empty-state-full {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: var(--text-muted);
    }

    .empty-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
      opacity: 0.5;
    }

    .empty-state-full p {
      font-size: 0.9375rem;
    }

    .form-row {
      display: flex;
      gap: var(--spacing-md);
    }

    .form-col {
      flex: 1;
    }

    @media (max-width: 768px) {
      .page-wrapper {
        padding: var(--spacing-md);
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class ComandasListComponent implements OnInit {
  private comandaService = inject(ComandaService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Signals
  comandas = signal<Comanda[]>([]);
  searchTerm = signal('');
  showFormModal = signal(false);
  showDeleteModal = signal(false);
  isEditing = signal(false);
  currentId = signal<number | null>(null);
  deleteId = signal<number | null>(null);

  // Computed
  filteredComandas = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.comandas();
    return this.comandas().filter(c =>
      c.idSesion.toString().includes(term) ||
      c.estado.toLowerCase().includes(term)
    );
  });

  // Form
  form = this.fb.group({
    idSesion: [null as number | null, Validators.required],
    estado: ['PENDIENTE' as string, Validators.required],
    fechaHora: [''],
    total: [{value: 0 as number, disabled: true}]
  });

  isLoading = signal(true);

  ngOnInit(): void {
    this.loadComandas();
  }

  loadComandas(): void {
    this.comandaService.getAll().subscribe({
      next: (data) => {
        this.comandas.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error al cargar comandas');
        this.isLoading.set(false);
      }
    });
  }

  openCreate(): void {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.form.reset({ estado: 'PENDIENTE', total: 0 });
    this.showFormModal.set(true);
  }

  openEdit(cmd: Comanda): void {
    this.isEditing.set(true);
    this.currentId.set(cmd.id);

    // Convert ISO date string to datetime-local format
    let fechaLocal = '';
    if (cmd.fechaHora) {
      const dt = new Date(cmd.fechaHora);
      if (!isNaN(dt.getTime())) {
        const pad = (n: number) => n.toString().padStart(2, '0');
        fechaLocal = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
      }
    }

    this.form.patchValue({
      idSesion: cmd.idSesion,
      estado: cmd.estado,
      fechaHora: fechaLocal,
      total: cmd.total
    });
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.form.reset();
  }

  saveComanda(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const payload: any = {
      idSesion: raw.idSesion,
      estado: raw.estado
    };

    // Convert datetime-local to ISO if present
    if (raw.fechaHora) {
      payload.fechaHora = new Date(raw.fechaHora).toISOString();
    }

    const handleError = (err: any) => {
      const msg = err?.error?.message || err?.error?.error || 'Error al guardar comanda';
      this.toastService.error(msg);
    };

    if (this.isEditing() && this.currentId()) {
      this.comandaService.update(this.currentId()!, payload).subscribe({
        next: () => {
          this.toastService.success('Comanda actualizada correctamente');
          this.closeFormModal();
          this.loadComandas();
        },
        error: handleError
      });
    } else {
      this.comandaService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Comanda creada correctamente');
          this.closeFormModal();
          this.loadComandas();
        },
        error: handleError
      });
    }
  }

  openDelete(id: number): void {
    this.deleteId.set(id);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const id = this.deleteId();
    if (!id) return;

    this.comandaService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Comanda eliminada correctamente');
        this.showDeleteModal.set(false);
        this.deleteId.set(null);
        this.loadComandas();
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error?.error || 'Error al eliminar comanda';
        this.toastService.error(msg);
      }
    });
  }

  formatDateTime(iso: string): string {
    if (!iso) return '---';
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return iso;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  }

  formatCurrency(value: number): string {
    if (value == null) return '0,00 EUR';
    return value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' EUR';
  }

  doConfirmar(id: number): void {
    this.comandaService.confirmar(id).subscribe({
      next: () => { this.toastService.success('Comanda confirmada'); this.loadComandas(); },
      error: (err) => this.toastService.error(err?.error?.message || 'Error')
    });
  }

  doPreparar(id: number): void {
    this.comandaService.preparar(id).subscribe({
      next: () => { this.toastService.success('Comanda en preparacion'); this.loadComandas(); },
      error: (err) => this.toastService.error(err?.error?.message || 'Error')
    });
  }

  doServir(id: number): void {
    this.comandaService.servir(id).subscribe({
      next: () => { this.toastService.success('Comanda servida'); this.loadComandas(); },
      error: (err) => this.toastService.error(err?.error?.message || 'Error')
    });
  }

  doCancelar(id: number): void {
    this.comandaService.cancelar(id).subscribe({
      next: () => { this.toastService.success('Comanda cancelada'); this.loadComandas(); },
      error: (err) => this.toastService.error(err?.error?.message || 'Error')
    });
  }

  verSesion(idSesion: number): void {
    const base = this.router.url.startsWith('/staff') ? '/staff' : '/admin';
    this.router.navigate([`${base}/sesiones-mesa`, idSesion]);
  }
}
