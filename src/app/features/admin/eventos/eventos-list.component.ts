import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';
import { GGBEvent } from '../../../core/models/evento.interface';
import { EntityFormModalComponent } from '../../../shared/components/entity-form-modal/entity-form-modal.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-eventos-list',
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
        <h1 class="page-title">Eventos</h1>
        <div class="page-actions">
          <input
            type="text"
            class="form-input search-input"
            placeholder="Buscar evento..."
            [value]="searchTerm()"
            (input)="searchTerm.set($any($event.target).value)"
          />
          <button class="btn btn-primary" (click)="openCreate()">
            <i class="fa-solid fa-plus"></i> Nuevo Evento
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="card table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Titulo</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Capacidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (evento of filteredEventos(); track evento.id) {
              <tr>
                <td>{{ evento.id }}</td>
                <td class="title-cell">{{ evento.title }}</td>
                <td>
                  <span class="type-badge" [style.background-color]="getTypeColor(evento.type)">
                    {{ getTypeLabel(evento.type) }}
                  </span>
                </td>
                <td>{{ evento.date }}</td>
                <td>{{ evento.time }}{{ evento.endTime ? ' - ' + evento.endTime : '' }}</td>
                <td>
                  <span class="capacity-cell">
                    {{ evento.currentAttendees }}/{{ evento.capacity }}
                  </span>
                </td>
                <td>
                  <app-status-badge [status]="evento.status" />
                </td>
                <td class="actions-cell">
                  <button class="btn btn-ghost btn-sm" (click)="openEdit(evento)">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="btn btn-danger btn-sm" (click)="confirmDelete(evento.id)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="empty-state">
                  <i class="fa-solid fa-calendar-days empty-icon"></i>
                  <p>No se encontraron eventos</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Form Modal -->
      <app-entity-form-modal
        [isOpen]="showFormModal()"
        [title]="isEditing() ? 'Editar Evento' : 'Nuevo Evento'"
        [isEditing]="isEditing()"
        [formValid]="eventoForm.valid"
        (onClose)="showFormModal.set(false)"
        (onSubmit)="onSubmit()"
      >
        <form [formGroup]="eventoForm">
          <div class="form-group">
            <label class="form-label">Titulo</label>
            <input type="text" class="form-input" formControlName="title" placeholder="Titulo del evento" />
            @if (eventoForm.get('title')?.invalid && eventoForm.get('title')?.touched) {
              <span class="form-error">El titulo es obligatorio</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Descripcion</label>
            <textarea class="form-input" formControlName="description" placeholder="Descripcion del evento" rows="4"></textarea>
            @if (eventoForm.get('description')?.invalid && eventoForm.get('description')?.touched) {
              <span class="form-error">La descripcion es obligatoria</span>
            }
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Fecha</label>
              <input type="date" class="form-input" formControlName="date" />
              @if (eventoForm.get('date')?.invalid && eventoForm.get('date')?.touched) {
                <span class="form-error">La fecha es obligatoria</span>
              }
            </div>
            <div class="form-group">
              <label class="form-label">Hora inicio</label>
              <input type="time" class="form-input" formControlName="time" />
              @if (eventoForm.get('time')?.invalid && eventoForm.get('time')?.touched) {
                <span class="form-error">La hora es obligatoria</span>
              }
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Hora fin</label>
              <input type="time" class="form-input" formControlName="endTime" />
            </div>
            <div class="form-group">
              <label class="form-label">Ubicacion</label>
              <input type="text" class="form-input" formControlName="location" placeholder="Sala Principal" />
              @if (eventoForm.get('location')?.invalid && eventoForm.get('location')?.touched) {
                <span class="form-error">La ubicacion es obligatoria</span>
              }
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Capacidad</label>
              <input type="number" class="form-input" formControlName="capacity" placeholder="0" min="1" />
              @if (eventoForm.get('capacity')?.invalid && eventoForm.get('capacity')?.touched) {
                <span class="form-error">Minimo 1</span>
              }
            </div>
            <div class="form-group">
              <label class="form-label">Tipo</label>
              <select class="form-input" formControlName="type">
                <option value="TORNEO">Torneo</option>
                <option value="NOCHE_TEMATICA">Noche Tematica</option>
                <option value="TALLER">Taller</option>
                <option value="EVENTO_ESPECIAL">Evento Especial</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Estado</label>
              <select class="form-input" formControlName="status">
                <option value="PROXIMO">Proximo</option>
                <option value="EN_CURSO">En Curso</option>
                <option value="FINALIZADO">Finalizado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Etiquetas (separadas por coma)</label>
              <input type="text" class="form-input" formControlName="tags" placeholder="estrategia, competitivo, premios" />
            </div>
          </div>

          <!-- Image upload -->
          <div class="form-group">
            <label class="form-label">Imagen / Banner</label>
            @if (imagePreview()) {
              <div class="image-preview-wrapper">
                <img [src]="imagePreview()" alt="Vista previa" class="image-preview" />
                <button type="button" class="btn btn-danger btn-sm image-remove-btn" (click)="removeImage()">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            } @else {
              <label class="upload-dropzone">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <span>Haz click para subir una imagen</span>
                <span class="upload-hint">JPEG, PNG o WebP (max 5MB)</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" (change)="onImageSelected($event)" hidden />
              </label>
            }
          </div>
        </form>
      </app-entity-form-modal>

      <!-- Delete Confirm Modal -->
      <app-confirm-modal
        [isOpen]="showDeleteModal()"
        title="Eliminar evento"
        message="Esta accion no se puede deshacer. Se eliminara el evento y todas sus inscripciones permanentemente."
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

    .title-cell {
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .type-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 700;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      white-space: nowrap;
    }

    .capacity-cell {
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

    /* === Image Upload === */
    .upload-dropzone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      padding: 1.5rem;
      border: 2px dashed var(--input-border, #D1D5DB);
      border-radius: var(--radius-md, 0.5rem);
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .upload-dropzone:hover {
      border-color: var(--primary-coral);
      background: rgba(255, 127, 80, 0.04);
    }

    .upload-dropzone i {
      font-size: 1.5rem;
      color: var(--primary-coral);
    }

    .upload-hint {
      font-size: 0.75rem;
      opacity: 0.7;
    }

    .image-preview-wrapper {
      position: relative;
      display: inline-block;
    }

    .image-preview {
      max-width: 100%;
      max-height: 180px;
      border-radius: var(--radius-md, 0.5rem);
      object-fit: cover;
    }

    .image-remove-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
    }
  `]
})
export class EventosListComponent implements OnInit {
  private eventService = inject(EventService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  eventos = signal<GGBEvent[]>([]);
  searchTerm = signal('');
  showFormModal = signal(false);
  showDeleteModal = signal(false);
  isEditing = signal(false);
  currentId = signal<number | null>(null);
  deleteId = signal<number | null>(null);
  imageFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  filteredEventos = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.eventos();
    return this.eventos().filter(e =>
      e.title.toLowerCase().includes(term) ||
      e.type.toLowerCase().includes(term) ||
      this.getTypeLabel(e.type).toLowerCase().includes(term)
    );
  });

  eventoForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required],
    endTime: [''],
    location: ['', Validators.required],
    capacity: [1, [Validators.required, Validators.min(1)]],
    type: ['TORNEO' as GGBEvent['type']],
    status: ['PROXIMO' as GGBEvent['status']],
    tags: ['']
  });

  private typeMap: Record<string, { label: string; color: string }> = {
    TORNEO: { label: 'Torneo', color: '#D97706' },
    NOCHE_TEMATICA: { label: 'Noche Tematica', color: '#7C3AED' },
    TALLER: { label: 'Taller', color: '#059669' },
    EVENTO_ESPECIAL: { label: 'Evento Especial', color: '#2563EB' }
  };

  ngOnInit(): void {
    this.loadEventos();
  }

  loadEventos(): void {
    this.eventService.getAll().subscribe({
      next: (data) => this.eventos.set(data),
      error: () => this.toastService.error('Error al cargar los eventos')
    });
  }

  getTypeLabel(type: string): string {
    return this.typeMap[type]?.label ?? type;
  }

  getTypeColor(type: string): string {
    return this.typeMap[type]?.color ?? '#6B7280';
  }

  openCreate(): void {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.imageFile.set(null);
    this.imagePreview.set(null);
    this.eventoForm.reset({
      title: '',
      description: '',
      date: '',
      time: '',
      endTime: '',
      location: '',
      capacity: 1,
      type: 'TORNEO',
      status: 'PROXIMO',
      tags: ''
    });
    this.showFormModal.set(true);
  }

  openEdit(evento: GGBEvent): void {
    this.isEditing.set(true);
    this.currentId.set(evento.id);
    this.imageFile.set(null);
    this.imagePreview.set(this.eventService.getImageUrl(evento.id));
    this.eventoForm.patchValue({
      title: evento.title,
      description: evento.description,
      date: evento.date,
      time: evento.time,
      endTime: evento.endTime ?? '',
      location: evento.location,
      capacity: evento.capacity,
      type: evento.type,
      status: evento.status,
      tags: evento.tags.join(', ')
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
    this.eventService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Evento eliminado correctamente');
        this.loadEventos();
        this.showDeleteModal.set(false);
      },
      error: () => {
        this.toastService.error('Error al eliminar el evento');
        this.showDeleteModal.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.eventoForm.invalid) {
      this.eventoForm.markAllAsTouched();
      return;
    }

    const raw = this.eventoForm.getRawValue();
    const tagsString = (raw.tags ?? '').trim();
    const tags = tagsString ? tagsString.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0) : [];

    const payload: Partial<GGBEvent> = {
      title: raw.title ?? '',
      description: raw.description ?? '',
      date: raw.date ?? '',
      time: raw.time ?? '',
      endTime: raw.endTime || undefined,
      location: raw.location ?? '',
      capacity: raw.capacity ?? 1,
      type: (raw.type as GGBEvent['type']) ?? 'TORNEO',
      status: (raw.status as GGBEvent['status']) ?? 'PROXIMO',
      tags
    };

    if (this.isEditing() && this.currentId() !== null) {
      this.eventService.update(this.currentId()!, payload).subscribe({
        next: (evento) => {
          this.uploadImageIfNeeded(evento.id);
          this.toastService.success('Evento actualizado correctamente');
          this.loadEventos();
          this.showFormModal.set(false);
        },
        error: () => this.toastService.error('Error al actualizar el evento')
      });
    } else {
      this.eventService.create(payload).subscribe({
        next: (evento) => {
          this.uploadImageIfNeeded(evento.id);
          this.toastService.success('Evento creado correctamente');
          this.loadEventos();
          this.showFormModal.set(false);
        },
        error: () => this.toastService.error('Error al crear el evento')
      });
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.imageFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imageFile.set(null);
    this.imagePreview.set(null);
  }

  private uploadImageIfNeeded(eventId: number): void {
    const file = this.imageFile();
    if (!file) return;
    this.eventService.uploadImage(eventId, file).subscribe({
      error: () => this.toastService.error('Error al subir la imagen')
    });
  }
}
