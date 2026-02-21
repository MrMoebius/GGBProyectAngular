import { Component, inject, signal, computed, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { JuegoService } from '../../../core/services/juego.service';
import { ToastService } from '../../../core/services/toast.service';
import { Juego } from '../../../core/models/juego.interface';
import { EntityFormModalComponent } from '../../../shared/components/entity-form-modal/entity-form-modal.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-juegos-list',
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
          <h1 class="page-title">Juegos</h1>
          <span class="record-count">{{ filteredJuegos().length }} registros</span>
        </div>
        <div class="page-actions">
          <input
            type="text"
            class="form-input search-input"
            placeholder="Buscar por nombre o genero..."
            [value]="searchTerm()"
            (input)="onSearch($any($event.target).value)"
          />
          <button class="btn btn-primary" (click)="openCreate()">
            <i class="fa-solid fa-plus"></i> Nuevo Juego
          </button>
        </div>
      </div>

      <!-- Hidden file input -->
      <input
        #fileInput
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style="display:none"
        (change)="onFileSelected($event)"
      />

      <!-- Table -->
      <div class="card table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Img</th>
              <th>ID</th>
              <th>Nombre</th>
              <th>Jugadores</th>
              <th>Duracion</th>
              <th>Complejidad</th>
              <th>Idioma</th>
              <th>Ubicacion</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (juego of paginatedJuegos(); track juego.id) {
              <tr>
                <td class="cell-img">
                  @if (!failedImages().has(juego.id)) {
                    <img
                      class="thumb"
                      [src]="getImageSrc(juego.id)"
                      [alt]="juego.nombre"
                      (error)="onImgError(juego.id)"
                      loading="lazy"
                    />
                  } @else {
                    <div class="thumb-placeholder">
                      <i class="fa-solid fa-image"></i>
                    </div>
                  }
                </td>
                <td>{{ juego.id }}</td>
                <td class="cell-bold cell-name" [title]="juego.nombre">{{ juego.nombre }}</td>
                <td>{{ juego.minJugadores }}–{{ juego.maxJugadores }}</td>
                <td>{{ juego.duracionMediaMin ? juego.duracionMediaMin + ' min' : '---' }}</td>
                <td>
                  @if (juego.complejidad) {
                    <span class="complexity-badge" [ngClass]="'complexity-' + juego.complejidad.toLowerCase()">
                      {{ juego.complejidad }}
                    </span>
                  } @else {
                    ---
                  }
                </td>
                <td>{{ juego.idioma || '---' }}</td>
                <td>{{ juego.ubicacion || '---' }}</td>
                <td>
                  <app-status-badge [status]="juego.activo !== false ? 'ACTIVO' : 'INACTIVO'" />
                </td>
                <td class="actions-cell">
                  <button class="btn btn-ghost btn-sm" title="Subir imagen" (click)="triggerUpload(juego.id)">
                    <i class="fa-solid fa-camera"></i>
                  </button>
                  <button class="btn btn-ghost btn-sm" title="Editar" (click)="openEdit(juego)">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="btn btn-danger btn-sm" title="Eliminar" (click)="confirmDelete(juego.id)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="10" class="empty-state">
                  <i class="fa-solid fa-puzzle-piece empty-icon"></i>
                  <p>No se encontraron juegos</p>
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
        [title]="isEditing() ? 'Editar Juego' : 'Nuevo Juego'"
        [isEditing]="isEditing()"
        [formValid]="form.valid"
        (onClose)="showFormModal.set(false)"
        (onSubmit)="onSubmit()"
      >
        <form [formGroup]="form">
          <div class="form-group">
            <label class="form-label">Nombre *</label>
            <input type="text" class="form-input" formControlName="nombre" placeholder="Nombre del juego" />
            @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
              <span class="form-error">El nombre es obligatorio</span>
            }
          </div>

          <div class="form-row">
            <div class="form-group form-col">
              <label class="form-label">Min. Jugadores</label>
              <input type="number" class="form-input" formControlName="minJugadores" min="1" />
              @if (form.get('minJugadores')?.hasError('min') && form.get('minJugadores')?.touched) {
                <span class="form-error">Minimo 1</span>
              }
            </div>
            <div class="form-group form-col">
              <label class="form-label">Max. Jugadores</label>
              <input type="number" class="form-input" formControlName="maxJugadores" min="1" />
              @if (form.get('maxJugadores')?.hasError('min') && form.get('maxJugadores')?.touched) {
                <span class="form-error">Minimo 1</span>
              }
            </div>
            <div class="form-group form-col">
              <label class="form-label">Duracion (min)</label>
              <input type="number" class="form-input" formControlName="duracionMediaMin" min="1" />
              @if (form.get('duracionMediaMin')?.hasError('min') && form.get('duracionMediaMin')?.touched) {
                <span class="form-error">Minimo 1</span>
              }
            </div>
          </div>
          @if (form.hasError('minMayorQueMax')) {
            <div class="form-error" style="margin-bottom: 0.5rem;">El minimo de jugadores no puede ser mayor que el maximo</div>
          }

          <div class="form-row">
            <div class="form-group form-col">
              <label class="form-label">Complejidad</label>
              <select class="form-input" formControlName="complejidad">
                <option value="">-- Seleccionar --</option>
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
              </select>
            </div>
            <div class="form-group form-col">
              <label class="form-label">Idioma</label>
              <select class="form-input" formControlName="idioma">
                <option value="">-- Seleccionar --</option>
                <option value="ESPANOL">Espanol</option>
                <option value="INGLES">Ingles</option>
                <option value="FRANCES">Frances</option>
                <option value="ALEMAN">Aleman</option>
                <option value="INDEPENDIENTE">Independiente</option>
              </select>
            </div>
            <div class="form-group form-col">
              <label class="form-label">Ubicacion</label>
              <select class="form-input" formControlName="ubicacion">
                <option value="">-- Seleccionar --</option>
                <option value="ENTRADA">Entrada</option>
                <option value="PASILLO">Pasillo</option>
                <option value="SALON">Salon</option>
                <option value="ALMACEN">Almacen</option>
                <option value="MOSTRADOR">Mostrador</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Genero</label>
            <input type="text" class="form-input" formControlName="genero" placeholder="ESTRATEGIA, FAMILIAR, CARTAS..." />
            <span class="form-hint">Separar multiples generos por coma</span>
          </div>

          <div class="form-row">
            <div class="form-group form-col">
              <label class="form-checkbox-label">
                <input type="checkbox" formControlName="recomendadoDosJugadores" />
                Recomendado para 2 jugadores
              </label>
            </div>
            <div class="form-group form-col">
              <label class="form-checkbox-label">
                <input type="checkbox" formControlName="activo" />
                Activo
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Descripcion</label>
            <textarea class="form-input" formControlName="descripcion" rows="3" placeholder="Descripcion del juego..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Observaciones</label>
            <textarea class="form-input" formControlName="observaciones" rows="2" placeholder="Notas internas..."></textarea>
          </div>
        </form>
      </app-entity-form-modal>

      <!-- Delete Confirm Modal -->
      <app-confirm-modal
        [isOpen]="showDeleteModal()"
        title="Eliminar Juego"
        message="Esta accion no se puede deshacer. Se eliminara permanentemente este juego del catalogo."
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

    .page-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .search-input {
      width: 280px;
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

    .cell-bold {
      font-weight: 600;
    }

    .cell-name {
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .cell-img {
      width: 48px;
      padding: 0.375rem 0.5rem !important;
    }

    .thumb {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: var(--radius-sm, 0.25rem);
      background-color: var(--card-border);
      display: block;
    }

    .thumb-placeholder {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm, 0.25rem);
      background-color: var(--card-border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      font-size: 1rem;
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

    /* Complexity badges */
    .complexity-badge {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .complexity-baja, .complexity-verde {
      background: rgba(16, 185, 129, 0.12);
      color: var(--status-free, #10b981);
    }

    .complexity-media, .complexity-amarillo {
      background: rgba(245, 158, 11, 0.12);
      color: var(--status-reserved, #f59e0b);
    }

    .complexity-alta, .complexity-rojo {
      background: rgba(239, 68, 68, 0.12);
      color: var(--status-occupied, #ef4444);
    }

    /* Pagination */
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

    /* Form */
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

    .form-checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-main);
      cursor: pointer;
      padding: 0.5rem 0;
    }

    .form-checkbox-label input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      accent-color: var(--primary-coral);
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .page-wrapper {
        padding: var(--spacing-md);
      }

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

      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class JuegosListComponent implements OnInit {
  private juegoService = inject(JuegoService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  juegos = signal<Juego[]>([]);
  searchTerm = signal('');
  currentPage = signal(1);
  showFormModal = signal(false);
  showDeleteModal = signal(false);
  isEditing = signal(false);
  currentId = signal<number | null>(null);
  deleteId = signal<number | null>(null);
  uploadTargetId = signal<number | null>(null);

  // Cache-buster para forzar recarga de imagenes tras upload
  imageVersion = signal(0);
  failedImages = signal(new Set<number>());

  readonly pageSize = 25;

  filteredJuegos = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.juegos();
    return this.juegos().filter(j =>
      j.nombre.toLowerCase().includes(term) ||
      (j.genero || '').toLowerCase().includes(term)
    );
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredJuegos().length / this.pageSize));
  });

  paginatedJuegos = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredJuegos().slice(start, start + this.pageSize);
  });

  form = this.fb.group({
    nombre: ['', Validators.required],
    minJugadores: [null as number | null, [Validators.min(1)]],
    maxJugadores: [null as number | null, [Validators.min(1)]],
    duracionMediaMin: [null as number | null, [Validators.min(1)]],
    complejidad: [''],
    genero: [''],
    idioma: [''],
    ubicacion: [''],
    recomendadoDosJugadores: [false],
    activo: [true],
    descripcion: [''],
    observaciones: ['']
  }, { validators: this.jugadoresValidator });

  jugadoresValidator(group: AbstractControl): ValidationErrors | null {
    const min = group.get('minJugadores')?.value;
    const max = group.get('maxJugadores')?.value;
    if (min != null && max != null && min > max) {
      return { minMayorQueMax: true };
    }
    return null;
  }

  isLoading = signal(true);

  ngOnInit(): void {
    this.loadJuegos();
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  loadJuegos(): void {
    this.juegoService.getJuegos().subscribe({
      next: (data) => {
        this.juegos.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error al cargar juegos');
        this.isLoading.set(false);
      }
    });
  }

  // === Imagen ===

  getImageSrc(id: number): string {
    return `/api/juegos/${id}/imagen?v=${this.imageVersion()}`;
  }

  onImgError(id: number): void {
    this.failedImages.update(set => { const s = new Set(set); s.add(id); return s; });
  }

  triggerUpload(id: number): void {
    this.uploadTargetId.set(id);
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const id = this.uploadTargetId();
    if (!file || id === null) return;

    this.juegoService.uploadImagen(id, file).subscribe({
      next: () => {
        this.toastService.success('Imagen subida correctamente');
        this.failedImages.update(set => { const s = new Set(set); s.delete(id); return s; });
        this.imageVersion.update(v => v + 1);
      },
      error: () => this.toastService.error('Error al subir la imagen')
    });
  }

  // === CRUD ===

  openCreate(): void {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.form.reset({ activo: true, recomendadoDosJugadores: false });
    this.showFormModal.set(true);
  }

  openEdit(juego: Juego): void {
    this.isEditing.set(true);
    this.currentId.set(juego.id);
    this.form.patchValue({
      nombre: juego.nombre,
      minJugadores: juego.minJugadores,
      maxJugadores: juego.maxJugadores,
      duracionMediaMin: juego.duracionMediaMin ?? null,
      complejidad: juego.complejidad || '',
      genero: juego.genero || '',
      idioma: juego.idioma || '',
      ubicacion: juego.ubicacion || '',
      recomendadoDosJugadores: juego.recomendadoDosJugadores ?? false,
      activo: juego.activo !== false,
      descripcion: juego.descripcion || '',
      observaciones: juego.observaciones || ''
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
    this.juegoService.deleteJuego(id).subscribe({
      next: () => {
        this.toastService.success('Juego eliminado correctamente');
        this.loadJuegos();
        this.showDeleteModal.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error?.error || 'Error al eliminar el juego';
        this.toastService.error(msg);
        this.showDeleteModal.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue() as any;

    const handleError = (err: any) => {
      const msg = err?.error?.message || err?.error?.error || 'Error al guardar el juego';
      this.toastService.error(msg);
    };

    if (this.isEditing() && this.currentId() !== null) {
      this.juegoService.updateJuego(this.currentId()!, payload).subscribe({
        next: () => {
          this.toastService.success('Juego actualizado correctamente');
          this.loadJuegos();
          this.showFormModal.set(false);
        },
        error: handleError
      });
    } else {
      this.juegoService.saveJuego(payload).subscribe({
        next: () => {
          this.toastService.success('Juego creado correctamente');
          this.loadJuegos();
          this.showFormModal.set(false);
        },
        error: handleError
      });
    }
  }
}
