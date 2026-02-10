import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductoService } from '../../../core/services/producto.service';
import { ToastService } from '../../../core/services/toast.service';
import { Producto } from '../../../core/models/producto.interface';
import { EntityFormModalComponent } from '../../../shared/components/entity-form-modal/entity-form-modal.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-productos-list',
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
        <h1 class="page-title">Productos</h1>
        <div class="page-actions">
          <input
            type="text"
            class="form-input search-input"
            placeholder="Buscar producto..."
            [value]="searchTerm()"
            (input)="searchTerm.set($any($event.target).value)"
          />
          <button class="btn btn-primary" (click)="openCreate()">
            <i class="fa-solid fa-plus"></i> Nuevo Producto
          </button>
        </div>
      </div>

      <!-- Category Filter -->
      <div class="category-filters">
        @for (cat of categories; track cat.value) {
          <button
            class="filter-pill"
            [class.active]="categoryFilter() === cat.value"
            (click)="categoryFilter.set(cat.value)"
          >
            {{ cat.label }}
          </button>
        }
      </div>

      <!-- Table -->
      <div class="card table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripcion</th>
              <th>Categoria</th>
              <th>Precio</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (producto of paginatedProductos(); track producto.id) {
              <tr>
                <td>{{ producto.id }}</td>
                <td class="name-cell">{{ producto.nombre }}</td>
                <td class="desc-cell">{{ truncate(producto.descripcion, 40) }}</td>
                <td>
                  <app-status-badge [status]="producto.categoria" />
                </td>
                <td class="price-cell">{{ formatPrice(producto.precio) }}</td>
                <td>
                  <app-status-badge [status]="producto.activo ? 'ACTIVO' : 'INACTIVO'" />
                </td>
                <td class="actions-cell">
                  <button class="btn btn-ghost btn-sm" (click)="openEdit(producto)">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="btn btn-danger btn-sm" (click)="confirmDelete(producto.id)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="empty-state">
                  <i class="fa-solid fa-utensils empty-icon"></i>
                  <p>No se encontraron productos</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="pagination">
          <button
            class="btn btn-ghost btn-sm"
            [disabled]="currentPage() === 1"
            (click)="currentPage.set(currentPage() - 1)"
          >
            <i class="fa-solid fa-chevron-left"></i> Anterior
          </button>

          <div class="page-numbers">
            @for (page of pageNumbers(); track page) {
              <button
                class="btn btn-sm"
                [class.btn-primary]="page === currentPage()"
                [class.btn-ghost]="page !== currentPage()"
                (click)="currentPage.set(page)"
              >
                {{ page }}
              </button>
            }
          </div>

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
        [title]="isEditing() ? 'Editar Producto' : 'Nuevo Producto'"
        [isEditing]="isEditing()"
        [formValid]="productoForm.valid"
        (onClose)="showFormModal.set(false)"
        (onSubmit)="onSubmit()"
      >
        <form [formGroup]="productoForm">
          <div class="form-group">
            <label class="form-label">Nombre</label>
            <input type="text" class="form-input" formControlName="nombre" placeholder="Nombre del producto" />
            @if (productoForm.get('nombre')?.invalid && productoForm.get('nombre')?.touched) {
              <span class="form-error">El nombre es obligatorio</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Descripcion</label>
            <textarea class="form-input" formControlName="descripcion" rows="3" placeholder="Descripcion del producto (opcional)"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Precio (EUR)</label>
              <input type="number" class="form-input" formControlName="precio" placeholder="0.00" min="0" step="0.01" />
              @if (productoForm.get('precio')?.invalid && productoForm.get('precio')?.touched) {
                <span class="form-error">El precio es obligatorio y debe ser mayor o igual a 0</span>
              }
            </div>
            <div class="form-group">
              <label class="form-label">Categoria</label>
              <select class="form-input" formControlName="categoria">
                <option value="COMIDA">Comida</option>
                <option value="BEBIDA">Bebida</option>
                <option value="ALCOHOL">Alcohol</option>
                <option value="POSTRE">Postre</option>
                <option value="SERVICIO">Servicio</option>
              </select>
            </div>
          </div>

          <div class="form-group form-check">
            <label class="check-label">
              <input type="checkbox" formControlName="activo" />
              <span>Activo</span>
            </label>
          </div>
        </form>
      </app-entity-form-modal>

      <!-- Delete Confirm Modal -->
      <app-confirm-modal
        [isOpen]="showDeleteModal()"
        title="Eliminar producto"
        message="Esta accion no se puede deshacer. Se eliminara el producto permanentemente."
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

    /* Category Filter Pills */
    .category-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: var(--spacing-lg);
    }

    .filter-pill {
      padding: 0.375rem 1rem;
      border-radius: 9999px;
      border: 1px solid var(--input-border);
      background-color: var(--card-bg);
      color: var(--text-muted);
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-pill:hover {
      border-color: var(--primary-coral);
      color: var(--primary-coral);
    }

    .filter-pill.active {
      background-color: var(--primary-coral);
      border-color: var(--primary-coral);
      color: var(--text-white);
    }

    /* Table */
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

    .name-cell {
      font-weight: 500;
    }

    .desc-cell {
      color: var(--text-muted);
      max-width: 280px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .price-cell {
      font-weight: 600;
      font-variant-numeric: tabular-nums;
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

    /* Pagination */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: var(--spacing-lg);
      flex-wrap: wrap;
    }

    .page-numbers {
      display: flex;
      gap: 0.25rem;
    }

    /* Form */
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-md);
    }

    .form-check {
      margin-top: 0.5rem;
    }

    .check-label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.875rem;
      color: var(--text-main);
      font-weight: 500;
    }

    .check-label input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      cursor: pointer;
      accent-color: var(--primary-coral);
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
export class ProductosListComponent implements OnInit {
  private productoService = inject(ProductoService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  productos = signal<Producto[]>([]);
  searchTerm = signal('');
  categoryFilter = signal('');
  showFormModal = signal(false);
  showDeleteModal = signal(false);
  isEditing = signal(false);
  currentId = signal<number | null>(null);
  deleteId = signal<number | null>(null);
  currentPage = signal(1);
  pageSize = 15;

  categories = [
    { label: 'Todas', value: '' },
    { label: 'Comida', value: 'COMIDA' },
    { label: 'Bebida', value: 'BEBIDA' },
    { label: 'Alcohol', value: 'ALCOHOL' },
    { label: 'Postre', value: 'POSTRE' },
    { label: 'Servicio', value: 'SERVICIO' }
  ];

  filteredProductos = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const cat = this.categoryFilter();
    let list = this.productos();

    if (cat) {
      list = list.filter(p => p.categoria === cat);
    }

    if (term) {
      list = list.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(term)) ||
        p.categoria.toLowerCase().includes(term)
      );
    }

    return list;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredProductos().length / this.pageSize)));

  paginatedProductos = computed(() => {
    // Reset to page 1 if current page exceeds total
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize;
    return this.filteredProductos().slice(start, start + this.pageSize);
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    // Show up to 7 page numbers centered around current
    let startPage = Math.max(1, current - 3);
    let endPage = Math.min(total, startPage + 6);
    startPage = Math.max(1, endPage - 6);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  });

  productoForm = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    precio: [0.01, [Validators.required, Validators.min(0.01)]],
    categoria: ['COMIDA' as string],
    activo: [true]
  });

  ngOnInit(): void {
    this.loadProductos();
  }

  loadProductos(): void {
    this.productoService.getAll().subscribe({
      next: (data) => this.productos.set(data),
      error: () => this.toastService.error('Error al cargar los productos')
    });
  }

  openCreate(): void {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.productoForm.reset({
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: 'COMIDA',
      activo: true
    });
    this.showFormModal.set(true);
  }

  openEdit(producto: Producto): void {
    this.isEditing.set(true);
    this.currentId.set(producto.id);
    this.productoForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      categoria: producto.categoria,
      activo: producto.activo
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
    this.productoService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Producto eliminado correctamente');
        this.loadProductos();
        this.showDeleteModal.set(false);
      },
      error: () => {
        this.toastService.error('Error al eliminar el producto');
        this.showDeleteModal.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    const formValue = this.productoForm.getRawValue() as any;

    if (this.isEditing() && this.currentId() !== null) {
      this.productoService.update(this.currentId()!, formValue).subscribe({
        next: () => {
          this.toastService.success('Producto actualizado correctamente');
          this.loadProductos();
          this.showFormModal.set(false);
        },
        error: () => this.toastService.error('Error al actualizar el producto')
      });
    } else {
      this.productoService.create(formValue).subscribe({
        next: () => {
          this.toastService.success('Producto creado correctamente');
          this.loadProductos();
          this.showFormModal.set(false);
        },
        error: () => this.toastService.error('Error al crear el producto')
      });
    }
  }

  truncate(text: string | null, max: number): string {
    if (!text) return '-';
    return text.length > max ? text.substring(0, max) + '...' : text;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
  }
}
