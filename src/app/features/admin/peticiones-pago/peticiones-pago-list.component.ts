import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PeticionesPagoService } from '../../../core/services/peticiones-pago.service';
import { ToastService } from '../../../core/services/toast.service';
import { PeticionesPago } from '../../../core/models/peticiones-pago.interface';
import { EntityFormModalComponent } from '../../../shared/components/entity-form-modal/entity-form-modal.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-peticiones-pago-list',
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
        <h1 class="page-title">Peticiones de Pago</h1>
        <div class="page-actions">
          <input
            type="text"
            class="form-input search-input"
            placeholder="Buscar por sesion o metodo..."
            [value]="searchTerm()"
            (input)="searchTerm.set($any($event.target).value)"
          />
          <button class="btn btn-primary" (click)="openCreate()">
            <i class="fa-solid fa-plus"></i> Nueva Peticion
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="card table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Sesion</th>
              <th>Metodo Preferido</th>
              <th>Atendida</th>
              <th>Fecha Peticion</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (peticion of filteredPeticiones(); track peticion.id) {
              <tr>
                <td>{{ peticion.id }}</td>
                <td>{{ peticion.idSesion }}</td>
                <td>
                  <app-status-badge [status]="peticion.metodoPreferido" />
                </td>
                <td>
                  <span
                    class="atendida-badge"
                    [class.atendida-si]="peticion.atendida"
                    [class.atendida-no]="!peticion.atendida"
                  >
                    {{ peticion.atendida ? 'Si' : 'No' }}
                  </span>
                </td>
                <td>{{ formatDate(peticion.fechaPeticion) }}</td>
                <td class="actions-cell">
                  <button class="btn btn-ghost btn-sm" (click)="openEdit(peticion)">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="btn btn-danger btn-sm" (click)="confirmDelete(peticion.id)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="empty-state">
                  <i class="fa-solid fa-credit-card empty-icon"></i>
                  <p>No se encontraron peticiones de pago</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Form Modal -->
      <app-entity-form-modal
        [isOpen]="showFormModal()"
        [title]="isEditing() ? 'Editar Peticion' : 'Nueva Peticion'"
        [isEditing]="isEditing()"
        [formValid]="peticionForm.valid"
        (onClose)="showFormModal.set(false)"
        (onSubmit)="onSubmit()"
      >
        <form [formGroup]="peticionForm">
          <div class="form-group">
            <label class="form-label">ID Sesion</label>
            <input type="number" class="form-input" formControlName="idSesion" placeholder="ID de la sesion" />
            @if (peticionForm.get('idSesion')?.invalid && peticionForm.get('idSesion')?.touched) {
              <span class="form-error">El ID de sesion es obligatorio</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Metodo Preferido</label>
            <select class="form-input" formControlName="metodoPreferido">
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="BIZUM">Bizum</option>
            </select>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="atendida" />
              <span class="checkbox-text">Atendida</span>
            </label>
          </div>
        </form>
      </app-entity-form-modal>

      <!-- Delete Confirm Modal -->
      <app-confirm-modal
        [isOpen]="showDeleteModal()"
        title="Eliminar peticion"
        message="Esta accion no se puede deshacer. Se eliminara la peticion permanentemente."
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

    .atendida-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.025em;
      border: 1px solid transparent;
    }

    .atendida-si {
      background-color: var(--success-bg);
      color: var(--success-text);
      border-color: var(--success);
    }

    .atendida-no {
      background-color: var(--danger-bg);
      color: var(--danger-text);
      border-color: var(--danger);
    }

    .checkbox-group {
      display: flex;
      align-items: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 1.125rem;
      height: 1.125rem;
      accent-color: var(--primary-coral);
      cursor: pointer;
    }

    .checkbox-text {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-main);
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
    }
  `]
})
export class PeticionesPagoListComponent implements OnInit {
  private peticionService = inject(PeticionesPagoService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  peticiones = signal<PeticionesPago[]>([]);
  searchTerm = signal('');
  showFormModal = signal(false);
  showDeleteModal = signal(false);
  isEditing = signal(false);
  currentId = signal<number | null>(null);
  deleteId = signal<number | null>(null);

  filteredPeticiones = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.peticiones();
    return this.peticiones().filter(p =>
      String(p.idSesion).includes(term) ||
      p.metodoPreferido.toLowerCase().includes(term)
    );
  });

  peticionForm = this.fb.group({
    idSesion: [0, Validators.required],
    metodoPreferido: ['EFECTIVO'],
    atendida: [false]
  });

  isLoading = signal(true);

  ngOnInit(): void {
    this.loadPeticiones();
  }

  loadPeticiones(): void {
    this.peticionService.getAll().subscribe({
      next: (data) => {
        this.peticiones.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error al cargar las peticiones de pago');
        this.isLoading.set(false);
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  openCreate(): void {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.peticionForm.reset({
      idSesion: 0,
      metodoPreferido: 'EFECTIVO',
      atendida: false
    });
    this.showFormModal.set(true);
  }

  openEdit(peticion: PeticionesPago): void {
    this.isEditing.set(true);
    this.currentId.set(peticion.id);
    this.peticionForm.patchValue({
      idSesion: peticion.idSesion,
      metodoPreferido: peticion.metodoPreferido,
      atendida: peticion.atendida
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
    this.peticionService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Peticion eliminada correctamente');
        this.loadPeticiones();
        this.showDeleteModal.set(false);
      },
      error: () => {
        this.toastService.error('Error al eliminar la peticion');
        this.showDeleteModal.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.peticionForm.invalid) {
      this.peticionForm.markAllAsTouched();
      return;
    }

    const formValue = this.peticionForm.getRawValue() as any;

    if (this.isEditing() && this.currentId() !== null) {
      this.peticionService.update(this.currentId()!, formValue).subscribe({
        next: () => {
          this.toastService.success('Peticion actualizada correctamente');
          this.loadPeticiones();
          this.showFormModal.set(false);
        },
        error: () => this.toastService.error('Error al actualizar la peticion')
      });
    } else {
      this.peticionService.create(formValue).subscribe({
        next: () => {
          this.toastService.success('Peticion creada correctamente');
          this.loadPeticiones();
          this.showFormModal.set(false);
        },
        error: () => this.toastService.error('Error al crear la peticion')
      });
    }
  }
}
