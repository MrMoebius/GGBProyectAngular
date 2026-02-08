import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { JuegosCopiaService } from '../../../core/services/juegos-copia.service';
import { ToastService } from '../../../core/services/toast.service';
import { JuegosCopia } from '../../../core/models/juegos-copia.interface';
import { EntityFormModalComponent } from '../../../shared/components/entity-form-modal/entity-form-modal.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-juegos-copia-list',
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
        <h1 class="page-title">Copias de Juegos</h1>
        <div class="page-actions">
          <input
            type="text"
            class="form-input search-input"
            placeholder="Buscar por codigo o ID juego..."
            [value]="searchTerm()"
            (input)="onSearch($any($event.target).value)"
          />
          <button class="btn btn-primary" (click)="openCreate()">
            <i class="fa-solid fa-plus"></i> Nueva Copia
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="card table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Juego</th>
              <th>Codigo Interno</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (copia of paginatedCopias(); track copia.id) {
              <tr>
                <td>{{ copia.id }}</td>
                <td>{{ copia.idJuego }}</td>
                <td>{{ copia.codigoInterno }}</td>
                <td>
                  <app-status-badge [status]="copia.estado" />
                </td>
                <td class="actions-cell">
                  <button class="btn btn-ghost btn-sm" (click)="openEdit(copia)">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="btn btn-danger btn-sm" (click)="confirmDelete(copia.id)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty-state">
                  <i class="fa-solid fa-dice empty-icon"></i>
                  <p>No se encontraron copias de juegos</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="pagination-bar">
          <button
            class="btn btn-ghost btn-sm"
            [disabled]="currentPage() === 1"
            (click)="currentPage.set(currentPage() - 1)"
          >
            <i class="fa-solid fa-chevron-left"></i> Anterior
          </button>
          <span class="pagination-info">
            Pagina {{ currentPage() }} de {{ totalPages() }}
          </span>
          <button
            class="btn btn-ghost btn-sm"
            [disabled]="currentPage() === totalPages()"
            (click)="currentPage.set(currentPage() + 1)"
          >
            Siguiente <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      }

      <!-- Form Modal -->
      <app-entity-form-modal
        [isOpen]="showFormModal()"
        [title]="isEditing() ? 'Editar Copia' : 'Nueva Copia'"
        [isEditing]="isEditing()"
        [formValid]="copiaForm.valid"
        (onClose)="showFormModal.set(false)"
        (onSubmit)="onSubmit()"
      >
        <form [formGroup]="copiaForm">
          <div class="form-group">
            <label class="form-label">ID Juego</label>
            <input type="number" class="form-input" formControlName="idJuego" placeholder="ID del juego" />
            @if (copiaForm.get('idJuego')?.invalid && copiaForm.get('idJuego')?.touched) {
              <span class="form-error">El ID del juego es obligatorio</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Codigo Interno</label>
            <input type="text" class="form-input" formControlName="codigoInterno" placeholder="Codigo interno" />
            @if (copiaForm.get('codigoInterno')?.invalid && copiaForm.get('codigoInterno')?.touched) {
              <span class="form-error">El codigo interno es obligatorio</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Estado</label>
            <select class="form-input" formControlName="estado">
              <option value="DISPONIBLE">Disponible</option>
              <option value="EN_USO">En uso</option>
              <option value="DANADA">Danada</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
              <option value="BAJA">Baja</option>
            </select>
          </div>
        </form>
      </app-entity-form-modal>

      <!-- Delete Confirm Modal -->
      <app-confirm-modal
        [isOpen]="showDeleteModal()"
        title="Eliminar copia"
        message="Esta accion no se puede deshacer. Se eliminara la copia permanentemente."
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

    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
      margin-top: var(--spacing-lg);
      padding: var(--spacing-sm) 0;
    }

    .pagination-info {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-muted);
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
export class JuegosCopiaListComponent implements OnInit {
  private copiaService = inject(JuegosCopiaService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  copias = signal<JuegosCopia[]>([]);
  searchTerm = signal('');
  currentPage = signal(1);
  showFormModal = signal(false);
  showDeleteModal = signal(false);
  isEditing = signal(false);
  currentId = signal<number | null>(null);
  deleteId = signal<number | null>(null);

  readonly pageSize = 20;

  filteredCopias = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.copias();
    return this.copias().filter(c =>
      c.codigoInterno.toLowerCase().includes(term) ||
      String(c.idJuego).includes(term)
    );
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredCopias().length / this.pageSize));
  });

  paginatedCopias = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredCopias().slice(start, start + this.pageSize);
  });

  copiaForm = this.fb.group({
    idJuego: [0, Validators.required],
    codigoInterno: ['', Validators.required],
    estado: ['DISPONIBLE']
  });

  ngOnInit(): void {
    this.loadCopias();
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  loadCopias(): void {
    this.copiaService.getAll().subscribe({
      next: (data) => this.copias.set(data),
      error: () => this.toastService.error('Error al cargar las copias de juegos')
    });
  }

  openCreate(): void {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.copiaForm.reset({
      idJuego: 0,
      codigoInterno: '',
      estado: 'DISPONIBLE'
    });
    this.showFormModal.set(true);
  }

  openEdit(copia: JuegosCopia): void {
    this.isEditing.set(true);
    this.currentId.set(copia.id);
    this.copiaForm.patchValue({
      idJuego: copia.idJuego,
      codigoInterno: copia.codigoInterno,
      estado: copia.estado
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
    this.copiaService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Copia eliminada correctamente');
        this.loadCopias();
        this.showDeleteModal.set(false);
      },
      error: () => {
        this.toastService.error('Error al eliminar la copia');
        this.showDeleteModal.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.copiaForm.invalid) {
      this.copiaForm.markAllAsTouched();
      return;
    }

    const formValue = this.copiaForm.getRawValue() as any;

    if (this.isEditing() && this.currentId() !== null) {
      this.copiaService.update(this.currentId()!, formValue).subscribe({
        next: () => {
          this.toastService.success('Copia actualizada correctamente');
          this.loadCopias();
          this.showFormModal.set(false);
        },
        error: () => this.toastService.error('Error al actualizar la copia')
      });
    } else {
      this.copiaService.create(formValue).subscribe({
        next: () => {
          this.toastService.success('Copia creada correctamente');
          this.loadCopias();
          this.showFormModal.set(false);
        },
        error: () => this.toastService.error('Error al crear la copia')
      });
    }
  }
}
