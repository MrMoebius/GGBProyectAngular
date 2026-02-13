import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { ToastService } from '../../../core/services/toast.service';
import { Empleado } from '../../../core/models/empleado.interface';
import { EntityFormModalComponent } from '../../../shared/components/entity-form-modal/entity-form-modal.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-empleados-list',
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
          <h1 class="page-title">Empleados</h1>
          <span class="record-count">{{ filteredEmpleados().length }} registros</span>
        </div>
        <button class="btn btn-primary" (click)="openCreate()">
          <i class="fa-solid fa-plus"></i>
          Nuevo Empleado
        </button>
      </div>

      <!-- Search -->
      <div class="search-bar">
        <div class="search-input-wrapper">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            class="form-input search-input"
            placeholder="Buscar por nombre o email..."
            [value]="searchTerm()"
            (input)="searchTerm.set($any($event.target).value)"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="card table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha Ingreso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (emp of filteredEmpleados(); track emp.id) {
              <tr>
                <td>{{ emp.id }}</td>
                <td class="cell-bold">{{ emp.nombre }}</td>
                <td>{{ emp.email }}</td>
                <td>{{ emp.telefono || '---' }}</td>
                <td>{{ emp.idRol === 1 ? 'ADMIN' : 'EMPLEADO' }}</td>
                <td>
                  <app-status-badge [status]="emp.estado" />
                </td>
                <td>{{ emp.fechaIngreso }}</td>
                <td class="actions-cell">
                  <button class="btn btn-ghost btn-sm" (click)="openEdit(emp)">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="btn btn-danger btn-sm" (click)="openDelete(emp.id)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="empty-state">
                  <i class="fa-solid fa-users-gear empty-icon"></i>
                  <p>No se encontraron empleados</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Form Modal -->
      <app-entity-form-modal
        [isOpen]="showFormModal()"
        [title]="isEditing() ? 'Editar Empleado' : 'Nuevo Empleado'"
        [isEditing]="isEditing()"
        [formValid]="form.valid"
        (onClose)="closeFormModal()"
        (onSubmit)="saveEmpleado()"
      >
        <form [formGroup]="form">
          <div class="form-group">
            <label class="form-label">Nombre *</label>
            <input type="text" class="form-input" formControlName="nombre" placeholder="Nombre completo" />
            @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
              <span class="form-error">El nombre es obligatorio</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Email *</label>
            <input type="email" class="form-input" formControlName="email" placeholder="email@ejemplo.com" />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <span class="form-error">Introduce un email valido</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Telefono</label>
            <input type="text" class="form-input" formControlName="telefono" placeholder="Telefono de contacto" />
          </div>

          <div class="form-row">
            <div class="form-group form-col">
              <label class="form-label">Rol *</label>
              <select class="form-input" formControlName="idRol">
                <option [ngValue]="1">ADMIN</option>
                <option [ngValue]="2">EMPLEADO</option>
              </select>
              @if (form.get('idRol')?.invalid && form.get('idRol')?.touched) {
                <span class="form-error">El rol es obligatorio</span>
              }
            </div>

            <div class="form-group form-col">
              <label class="form-label">Estado *</label>
              <select class="form-input" formControlName="estado">
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
                <option value="VACACIONES">VACACIONES</option>
                <option value="BAJA">BAJA</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Fecha de Ingreso</label>
            <input type="date" class="form-input" formControlName="fechaIngreso" />
            <span class="form-hint">Si se deja vacio, se usara la fecha de hoy</span>
          </div>

          <div class="form-group">
            <label class="form-label">{{ isEditing() ? 'Nueva Contrasena' : 'Contrasena *' }}</label>
            <input type="password" class="form-input" formControlName="password"
              [placeholder]="isEditing() ? 'Dejar vacio para mantener la actual' : 'Minimo 6 caracteres'" />
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="form-error">La contrasena debe tener al menos 6 caracteres</span>
            }
          </div>
        </form>
      </app-entity-form-modal>

      <!-- Confirm Delete Modal -->
      <app-confirm-modal
        [isOpen]="showDeleteModal()"
        title="Eliminar Empleado"
        message="Esta accion no se puede deshacer. Se eliminara permanentemente este empleado."
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

    .table-container {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table thead {
      background-color: var(--table-header-bg);
    }

    .data-table th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--table-border);
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

    .cell-bold {
      font-weight: 600;
    }

    .actions-cell {
      display: flex;
      gap: 0.5rem;
      white-space: nowrap;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-muted);
    }

    .empty-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
      opacity: 0.5;
    }

    .empty-state p {
      font-size: 0.9375rem;
    }

    .form-row {
      display: flex;
      gap: var(--spacing-md);
    }

    .form-col {
      flex: 1;
    }

    .form-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
      display: block;
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
export class EmpleadosListComponent implements OnInit {
  private empleadoService = inject(EmpleadoService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  // Signals
  empleados = signal<Empleado[]>([]);
  searchTerm = signal('');
  showFormModal = signal(false);
  showDeleteModal = signal(false);
  isEditing = signal(false);
  currentId = signal<number | null>(null);
  deleteId = signal<number | null>(null);

  // Computed
  filteredEmpleados = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.empleados();
    return this.empleados().filter(e =>
      e.nombre.toLowerCase().includes(term) ||
      e.email.toLowerCase().includes(term)
    );
  });

  // Form
  form = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    idRol: [2 as number, Validators.required],
    estado: ['ACTIVO' as string, Validators.required],
    fechaIngreso: ['']
  });

  isLoading = signal(true);

  ngOnInit(): void {
    this.loadEmpleados();
  }

  loadEmpleados(): void {
    this.empleadoService.getAll().subscribe({
      next: (data) => {
        this.empleados.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error al cargar empleados');
        this.isLoading.set(false);
      }
    });
  }

  openCreate(): void {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.form.reset({ idRol: 2, estado: 'ACTIVO', fechaIngreso: '' });
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('password')?.updateValueAndValidity();
    this.showFormModal.set(true);
  }

  openEdit(emp: Empleado): void {
    this.isEditing.set(true);
    this.currentId.set(emp.id);
    this.form.patchValue({
      nombre: emp.nombre,
      email: emp.email,
      telefono: emp.telefono || '',
      idRol: emp.idRol,
      estado: emp.estado,
      fechaIngreso: emp.fechaIngreso
    });
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.form.reset();
  }

  saveEmpleado(): void {
    if (this.form.invalid) return;

    const payload = this.form.getRawValue() as any;
    if (this.isEditing() && !payload.password) {
      delete payload.password;
    }

    if (this.isEditing() && this.currentId()) {
      this.empleadoService.update(this.currentId()!, payload).subscribe({
        next: () => {
          this.toastService.success('Empleado actualizado correctamente');
          this.closeFormModal();
          this.loadEmpleados();
        },
        error: () => this.toastService.error('Error al actualizar empleado')
      });
    } else {
      this.empleadoService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Empleado creado correctamente');
          this.closeFormModal();
          this.loadEmpleados();
        },
        error: () => this.toastService.error('Error al crear empleado')
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

    this.empleadoService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Empleado eliminado correctamente');
        this.showDeleteModal.set(false);
        this.deleteId.set(null);
        this.loadEmpleados();
      },
      error: () => this.toastService.error('Error al eliminar empleado')
    });
  }
}
