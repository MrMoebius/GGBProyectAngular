import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ClienteService } from '../../../core/services/cliente.service';
import { ToastService } from '../../../core/services/toast.service';
import { Cliente } from '../../../core/models/cliente.interface';
import { EntityFormModalComponent } from '../../../shared/components/entity-form-modal/entity-form-modal.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-clientes-list',
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
          <h1 class="page-title">Clientes</h1>
          <span class="record-count">{{ filteredClientes().length }} registros</span>
        </div>
        <button class="btn btn-primary" (click)="openCreate()">
          <i class="fa-solid fa-plus"></i>
          Nuevo Cliente
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
              <th>Fecha Alta</th>
              <th>Notas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (cli of filteredClientes(); track cli.id) {
              <tr>
                <td>{{ cli.id }}</td>
                <td class="cell-bold">{{ cli.nombre }}</td>
                <td>{{ cli.email }}</td>
                <td>{{ cli.telefono || '---' }}</td>
                <td>{{ cli.fechaAlta }}</td>
                <td class="cell-notes" [title]="cli.notas || ''">
                  {{ cli.notas ? (cli.notas.length > 30 ? cli.notas.substring(0, 30) + '...' : cli.notas) : '---' }}
                </td>
                <td class="actions-cell">
                  <button class="btn btn-ghost btn-sm" (click)="openEdit(cli)">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="btn btn-danger btn-sm" (click)="openDelete(cli.id)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty-state">
                  <i class="fa-solid fa-people-group empty-icon"></i>
                  <p>No se encontraron clientes</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Form Modal -->
      <app-entity-form-modal
        [isOpen]="showFormModal()"
        [title]="isEditing() ? 'Editar Cliente' : 'Nuevo Cliente'"
        [isEditing]="isEditing()"
        [formValid]="form.valid"
        (onClose)="closeFormModal()"
        (onSubmit)="saveCliente()"
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

          <div class="form-group">
            <label class="form-label">{{ isEditing() ? 'Nueva Contrasena' : 'Contrasena' }}</label>
            <input type="password" class="form-input" formControlName="password"
              [placeholder]="isEditing() ? 'Dejar vacio para mantener la actual' : 'Minimo 6 caracteres (opcional)'" />
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="form-error">La contrasena debe tener al menos 6 caracteres</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Notas</label>
            <textarea class="form-input" formControlName="notas" placeholder="Notas adicionales sobre el cliente..." rows="3"></textarea>
          </div>
        </form>
      </app-entity-form-modal>

      <!-- Confirm Delete Modal -->
      <app-confirm-modal
        [isOpen]="showDeleteModal()"
        title="Eliminar Cliente"
        message="Esta accion no se puede deshacer. Se eliminara permanentemente este cliente."
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

    .cell-notes {
      max-width: 200px;
      color: var(--text-muted);
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

    @media (max-width: 768px) {
      .page-wrapper {
        padding: var(--spacing-md);
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
      }
    }
  `]
})
export class ClientesListComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  // Signals
  clientes = signal<Cliente[]>([]);
  searchTerm = signal('');
  showFormModal = signal(false);
  showDeleteModal = signal(false);
  isEditing = signal(false);
  currentId = signal<number | null>(null);
  deleteId = signal<number | null>(null);

  // Computed
  filteredClientes = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.clientes();
    return this.clientes().filter(c =>
      c.nombre.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  });

  // Form
  form = this.fb.group({
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    password: ['', Validators.minLength(6)],
    notas: ['']
  });

  isLoading = signal(true);

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error al cargar clientes');
        this.isLoading.set(false);
      }
    });
  }

  openCreate(): void {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.form.reset();
    this.showFormModal.set(true);
  }

  openEdit(cli: Cliente): void {
    this.isEditing.set(true);
    this.currentId.set(cli.id);
    this.form.patchValue({
      nombre: cli.nombre,
      email: cli.email,
      telefono: cli.telefono || '',
      notas: cli.notas || ''
    });
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.form.reset();
  }

  saveCliente(): void {
    if (this.form.invalid) return;

    const payload = this.form.getRawValue() as any;
    if (!payload.password) {
      delete payload.password;
    }

    const handleError = (err: any) => {
      const msg = err?.error?.message || err?.error?.error || 'Error al guardar cliente';
      this.toastService.error(msg);
    };

    if (this.isEditing() && this.currentId()) {
      this.clienteService.update(this.currentId()!, payload).subscribe({
        next: () => {
          this.toastService.success('Cliente actualizado correctamente');
          this.closeFormModal();
          this.loadClientes();
        },
        error: handleError
      });
    } else {
      this.clienteService.create(payload).subscribe({
        next: () => {
          this.toastService.success('Cliente creado correctamente');
          this.closeFormModal();
          this.loadClientes();
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

    this.clienteService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Cliente eliminado correctamente');
        this.showDeleteModal.set(false);
        this.deleteId.set(null);
        this.loadClientes();
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error?.error || 'Error al eliminar cliente';
        this.toastService.error(msg);
      }
    });
  }
}
