import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MesaService } from '../../../core/services/mesa.service';
import { ToastService } from '../../../core/services/toast.service';
import { Mesa } from '../../../core/models/mesa.interface';
import { EntityFormModalComponent } from '../../../shared/components/entity-form-modal/entity-form-modal.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-mesas-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EntityFormModalComponent,
    StatusBadgeComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="page-wrapper">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">Mesas</h1>
        <div class="page-actions">
          <input
            type="text"
            class="form-input search-input"
            placeholder="Buscar mesa..."
            [value]="searchTerm()"
            (input)="searchTerm.set($any($event.target).value)"
          />
          <button class="btn btn-primary" (click)="openCreate()">
            <i class="fa-solid fa-plus"></i> Nueva Mesa
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="card table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Numero</th>
              <th>Capacidad</th>
              <th>Zona</th>
              <th>Ubicacion</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (mesa of filteredMesas(); track mesa.id) {
              <tr>
                <td>{{ mesa.id }}</td>
                <td>{{ mesa.nombreMesa }}</td>
                <td>{{ mesa.numeroMesa }}</td>
                <td>{{ mesa.capacidad }}</td>
                <td>{{ mesa.zona }}</td>
                <td>{{ mesa.ubicacion }}</td>
                <td>
                  <app-status-badge [status]="mesa.estado" />
                </td>
                <td class="actions-cell">
                  <button class="btn btn-ghost btn-sm" (click)="openEdit(mesa)">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="btn btn-danger btn-sm" (click)="confirmDelete(mesa.id)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="empty-state">
                  <i class="fa-solid fa-chair empty-icon"></i>
                  <p>No se encontraron mesas</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Form Modal -->
      <app-entity-form-modal
        [isOpen]="showFormModal()"
        [title]="isEditing() ? 'Editar Mesa' : 'Nueva Mesa'"
        [isEditing]="isEditing()"
        [formValid]="mesaForm.valid"
        (onClose)="showFormModal.set(false)"
        (onSubmit)="onSubmit()"
      >
        <form [formGroup]="mesaForm">
          <div class="form-group">
            <label class="form-label">Nombre</label>
            <input type="text" class="form-input" formControlName="nombreMesa" placeholder="Nombre de la mesa" />
            @if (mesaForm.get('nombreMesa')?.invalid && mesaForm.get('nombreMesa')?.touched) {
              <span class="form-error">El nombre es obligatorio</span>
            }
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Numero</label>
              <input type="number" class="form-input" formControlName="numeroMesa" placeholder="0" />
              @if (mesaForm.get('numeroMesa')?.invalid && mesaForm.get('numeroMesa')?.touched) {
                <span class="form-error">El numero es obligatorio</span>
              }
            </div>
            <div class="form-group">
              <label class="form-label">Capacidad</label>
              <input type="number" class="form-input" formControlName="capacidad" placeholder="1" min="1" />
              @if (mesaForm.get('capacidad')?.invalid && mesaForm.get('capacidad')?.touched) {
                <span class="form-error">Minimo 1</span>
              }
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Zona</label>
            <input type="text" class="form-input" formControlName="zona" placeholder="Zona de la mesa" />
            @if (mesaForm.get('zona')?.invalid && mesaForm.get('zona')?.touched) {
              <span class="form-error">La zona es obligatoria</span>
            }
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Ubicacion</label>
              <select class="form-input" formControlName="ubicacion">
                <option value="ENTRADA">Entrada</option>
                <option value="PASILLO">Pasillo</option>
                <option value="SALON">Salon</option>
                <option value="ALMACEN">Almacen</option>
                <option value="MOSTRADOR">Mostrador</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Estado</label>
              <select class="form-input" formControlName="estado">
                <option value="LIBRE">Libre</option>
                <option value="OCUPADA">Ocupada</option>
                <option value="RESERVADA">Reservada</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
              </select>
            </div>
          </div>
        </form>
      </app-entity-form-modal>

      <!-- Delete Confirm Modal -->
      <app-confirm-modal
        [isOpen]="showDeleteModal()"
        title="Eliminar mesa"
        message="Esta accion no se puede deshacer. Se eliminara la mesa permanentemente."
        (onConfirm)="executeDelete()"
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
      flex-wrap: wrap;
      gap: var(--spacing-md);
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .page-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .search-input {
      width: 260px;
    }

    .table-container {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table thead tr {
      background-color: var(--table-header-bg);
    }

    .data-table th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      border-bottom: 2px solid var(--table-border);
      white-space: nowrap;
    }

    .data-table td {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: var(--text-main);
      border-bottom: 1px solid var(--table-border);
    }

    .data-table tbody tr:hover {
      background-color: var(--table-row-hover);
    }

    .actions-cell {
      display: flex;
      gap: 0.375rem;
      white-space: nowrap;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem !important;
      color: var(--text-muted);
    }

    .empty-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      display: block;
      opacity: 0.4;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-md);
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .page-actions {
        width: 100%;
        flex-direction: column;
      }

      .search-input {
        width: 100%;
      }

      .page-wrapper {
        padding: var(--spacing-md);
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MesasListComponent implements OnInit {
  private mesaService = inject(MesaService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  mesas = signal<Mesa[]>([]);
  searchTerm = signal('');
  showFormModal = signal(false);
  showDeleteModal = signal(false);
  isEditing = signal(false);
  currentId = signal<number | null>(null);
  deleteId = signal<number | null>(null);

  filteredMesas = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.mesas();
    return this.mesas().filter(m =>
      m.nombreMesa.toLowerCase().includes(term) ||
      m.zona.toLowerCase().includes(term) ||
      m.ubicacion.toLowerCase().includes(term)
    );
  });

  mesaForm = this.fb.group({
    nombreMesa: ['', Validators.required],
    numeroMesa: [0, Validators.required],
    capacidad: [1, [Validators.required, Validators.min(1)]],
    zona: ['', Validators.required],
    ubicacion: ['SALON'],
    estado: ['LIBRE']
  });

  ngOnInit(): void {
    this.loadMesas();
  }

  loadMesas(): void {
    this.mesaService.getAll().subscribe({
      next: (data) => this.mesas.set(data),
      error: () => this.toastService.error('Error al cargar las mesas')
    });
  }

  openCreate(): void {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.mesaForm.reset({
      nombreMesa: '',
      numeroMesa: 0,
      capacidad: 1,
      zona: '',
      ubicacion: 'SALON',
      estado: 'LIBRE'
    });
    this.showFormModal.set(true);
  }

  openEdit(mesa: Mesa): void {
    this.isEditing.set(true);
    this.currentId.set(mesa.id);
    this.mesaForm.patchValue({
      nombreMesa: mesa.nombreMesa,
      numeroMesa: mesa.numeroMesa,
      capacidad: mesa.capacidad,
      zona: mesa.zona,
      ubicacion: mesa.ubicacion,
      estado: mesa.estado
    });
    this.showFormModal.set(true);
  }

  confirmDelete(id: number): void {
    this.deleteId.set(id);
    this.showDeleteModal.set(true);
  }

  executeDelete(): void {
    const id = this.deleteId();
    if (id === null) return;
    this.mesaService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Mesa eliminada correctamente');
        this.loadMesas();
        this.showDeleteModal.set(false);
      },
      error: () => {
        this.toastService.error('Error al eliminar la mesa');
        this.showDeleteModal.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.mesaForm.invalid) {
      this.mesaForm.markAllAsTouched();
      return;
    }

    const formValue = this.mesaForm.getRawValue() as any;

    if (this.isEditing() && this.currentId() !== null) {
      this.mesaService.update(this.currentId()!, formValue).subscribe({
        next: () => {
          this.toastService.success('Mesa actualizada correctamente');
          this.loadMesas();
          this.showFormModal.set(false);
        },
        error: () => this.toastService.error('Error al actualizar la mesa')
      });
    } else {
      this.mesaService.create(formValue).subscribe({
        next: () => {
          this.toastService.success('Mesa creada correctamente');
          this.loadMesas();
          this.showFormModal.set(false);
        },
        error: () => this.toastService.error('Error al crear la mesa')
      });
    }
  }
}
