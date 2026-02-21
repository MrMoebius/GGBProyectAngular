import { Component, inject, signal, computed, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { JuegoService } from '../../../core/services/juego.service';
import { ToastService } from '../../../core/services/toast.service';
import { BggAdminService, BggSearchResult } from '../../../core/services/bgg-admin.service';
import { forkJoin } from 'rxjs';
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
            <input type="text" class="form-input" formControlName="nombre" placeholder="Nombre del juego" (blur)="checkNombreDuplicado()" />
            @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
              <span class="form-error">El nombre es obligatorio</span>
            }
            @if (nombreDuplicado() && !isEditing()) {
              <div class="form-warning-row">
                <span class="form-warning"><i class="fa-solid fa-triangle-exclamation"></i> Ya existe un juego con este nombre.</span>
                <span class="copies-inline">
                  Copias a añadir:
                  <input type="number" class="copies-input" min="1" max="20" [value]="copiasExtra()" (input)="copiasExtra.set(Math.max(1, +$any($event.target).value || 1))" />
                </span>
              </div>
            }
          </div>

          @if (!isEditing()) {
            <div class="bgg-section">
              @if (!bggSearchMode()) {
                <button type="button" class="bgg-trigger" (click)="toggleBggSearch()">
                  <i class="fa-solid fa-magnifying-glass"></i> Buscar en BGG
                </button>
              } @else {
                <div class="bgg-search-panel">
                  <div class="bgg-search-header">
                    <span class="bgg-search-title">BoardGameGeek</span>
                    <button type="button" class="btn btn-ghost btn-sm" (click)="toggleBggSearch()">
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                  <div class="bgg-search-input-row">
                    <input
                      type="text"
                      class="form-input"
                      placeholder="Nombre del juego en BGG..."
                      [value]="bggSearchTerm()"
                      (input)="bggSearchTerm.set($any($event.target).value)"
                      (keydown.enter)="searchBgg(); $event.preventDefault()"
                    />
                    <button type="button" class="btn btn-primary btn-sm" (click)="searchBgg()" [disabled]="bggLoading()">
                      @if (bggLoading()) {
                        <i class="fa-solid fa-spinner fa-spin"></i>
                      } @else {
                        Buscar
                      }
                    </button>
                  </div>
                  @if (bggLoading()) {
                    <div class="bgg-loading">
                      <i class="fa-solid fa-spinner fa-spin"></i> Buscando en BoardGameGeek...
                    </div>
                  }
                  @if (bggResults().length > 0 && !bggLoading()) {
                    <div class="bgg-results-list">
                      @for (result of bggResults(); track result.bggId) {
                        <button type="button" class="bgg-result-item" (click)="selectBggResult(result)" [disabled]="bggDetailLoading()">
                          <span class="bgg-result-name">{{ result.name }}</span>
                          @if (result.yearPublished) {
                            <span class="bgg-result-year">({{ result.yearPublished }})</span>
                          }
                        </button>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }

          <div class="form-row">
            <div class="form-group form-col">
              <label class="form-label">Min. Jugadores *</label>
              <input type="number" class="form-input" formControlName="minJugadores" min="1" (keydown)="blockNegative($event)" />
              @if (form.get('minJugadores')?.invalid && form.get('minJugadores')?.touched) {
                <span class="form-error">{{ form.get('minJugadores')?.hasError('required') ? 'Obligatorio' : 'Debe ser al menos 1' }}</span>
              }
            </div>
            <div class="form-group form-col">
              <label class="form-label">Max. Jugadores *</label>
              <input type="number" class="form-input" formControlName="maxJugadores" min="1" (keydown)="blockNegative($event)" />
              @if (form.get('maxJugadores')?.invalid && form.get('maxJugadores')?.touched) {
                <span class="form-error">{{ form.get('maxJugadores')?.hasError('required') ? 'Obligatorio' : 'Debe ser al menos 1' }}</span>
              }
            </div>
            <div class="form-group form-col">
              <label class="form-label">Duración (minutos) *</label>
              <input type="number" class="form-input" formControlName="duracionMediaMin" min="1" (keydown)="blockNegative($event)" />
              @if (form.get('duracionMediaMin')?.invalid && form.get('duracionMediaMin')?.touched) {
                <span class="form-error">{{ form.get('duracionMediaMin')?.hasError('required') ? 'Obligatorio' : 'Debe ser al menos 1' }}</span>
              }
            </div>
          </div>

          <div class="form-row">
            <div class="form-group form-col">
              <label class="form-label">Complejidad *</label>
              <select class="form-input" formControlName="complejidad">
                <option value="" disabled>-- Seleccionar --</option>
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
              </select>
              @if (form.get('complejidad')?.invalid && form.get('complejidad')?.touched) {
                <span class="form-error">Obligatorio</span>
              }
            </div>
            <div class="form-group form-col">
              <label class="form-label">Idioma *</label>
              <select class="form-input" formControlName="idioma">
                <option value="" disabled>-- Seleccionar --</option>
                <option value="ESPANOL">Espanol</option>
                <option value="INGLES">Ingles</option>
                <option value="FRANCES">Frances</option>
                <option value="ALEMAN">Aleman</option>
                <option value="INDEPENDIENTE">Independiente</option>
              </select>
              @if (form.get('idioma')?.invalid && form.get('idioma')?.touched) {
                <span class="form-error">Obligatorio</span>
              }
            </div>
            <div class="form-group form-col">
              <label class="form-label">Ubicacion *</label>
              <select class="form-input" formControlName="ubicacion">
                <option value="" disabled>-- Seleccionar --</option>
                <option value="ENTRADA">Entrada</option>
                <option value="PASILLO">Pasillo</option>
                <option value="SALON">Salon</option>
                <option value="ALMACEN">Almacen</option>
                <option value="MOSTRADOR">Mostrador</option>
              </select>
              @if (form.get('ubicacion')?.invalid && form.get('ubicacion')?.touched) {
                <span class="form-error">Obligatorio</span>
              }
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Genero *</label>
            <div class="multiselect" [class.open]="generoDropdownOpen()">
              <button type="button" class="multiselect-trigger form-input" (click)="toggleGeneroDropdown()">
                @if (selectedGeneros().length === 0) {
                  <span class="multiselect-placeholder">-- Seleccionar generos --</span>
                } @else {
                  <span class="multiselect-tags">
                    @for (g of selectedGeneros(); track g) {
                      <span class="multiselect-tag">{{ g }}</span>
                    }
                  </span>
                }
                <i class="fa-solid fa-chevron-down multiselect-arrow"></i>
              </button>
              @if (generoDropdownOpen()) {
                <div class="multiselect-dropdown">
                  @for (g of allGeneros; track g) {
                    <label class="multiselect-option">
                      <input type="checkbox" [checked]="selectedGeneros().includes(g)" (change)="toggleGenero(g)" />
                      {{ g }}
                    </label>
                  }
                </div>
              }
            </div>
            @if (form.get('genero')?.invalid && form.get('genero')?.touched) {
              <span class="form-error">Selecciona al menos un genero</span>
            }
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

          <div class="form-group">
            <label class="form-label">Imagen</label>
            <input
              #fileInput
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style="display:none"
              (change)="onFileSelected($event)"
            />
            <div class="imagen-section">
              @if (isEditing() && currentId() !== null) {
                @if (!failedImages().has($any(currentId()))) {
                  <img
                    class="imagen-preview"
                    [src]="getImageSrc($any(currentId()))"
                    (error)="onImgError($any(currentId()))"
                  />
                } @else {
                  <div class="imagen-placeholder">
                    <i class="fa-solid fa-image"></i>
                    <span>Sin imagen</span>
                  </div>
                }
              } @else {
                @if (pendingImagePreview()) {
                  <img class="imagen-preview" [src]="pendingImagePreview()" />
                } @else {
                  <div class="imagen-placeholder">
                    <i class="fa-solid fa-image"></i>
                    <span>Sin imagen</span>
                  </div>
                }
              }
              <div class="imagen-actions">
                @if (isEditing() && currentId() !== null) {
                  <button type="button" class="btn btn-ghost btn-sm" (click)="triggerUpload($any(currentId()))">
                    <i class="fa-solid fa-camera"></i> Subir imagen
                  </button>
                  @if (!failedImages().has($any(currentId()))) {
                    <button type="button" class="btn btn-ghost btn-sm btn-delete-img" (click)="deleteImagen($any(currentId()))">
                      <i class="fa-solid fa-trash"></i> Eliminar imagen
                    </button>
                  }
                } @else {
                  <button type="button" class="btn btn-ghost btn-sm" (click)="selectPendingImage()">
                    <i class="fa-solid fa-camera"></i> {{ pendingImageFile() ? 'Cambiar imagen' : 'Seleccionar imagen' }}
                  </button>
                  @if (pendingImageFile()) {
                    <button type="button" class="btn btn-ghost btn-sm btn-delete-img" (click)="clearPendingImage()">
                      <i class="fa-solid fa-trash"></i> Quitar imagen
                    </button>
                  }
                }
              </div>
            </div>
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

    .form-warning-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.375rem;
    }

    .form-warning {
      font-size: 0.8rem;
      color: #f59e0b;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .copies-inline {
      font-size: 0.8rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .copies-input {
      width: 3.5rem;
      padding: 0.2rem 0.375rem;
      font-size: 0.8rem;
      text-align: center;
      border: 1px solid var(--card-border, #d1d5db);
      border-radius: var(--radius-sm, 0.25rem);
      background: var(--card-bg, #fff);
      color: var(--text-main);
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

    /* Multi-select dropdown */
    .multiselect {
      position: relative;
    }

    .multiselect-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      min-height: 2.5rem;
      text-align: left;
    }

    .multiselect-placeholder {
      color: var(--text-muted);
    }

    .multiselect-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      flex: 1;
    }

    .multiselect-tag {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 600;
      background: rgba(255, 107, 107, 0.12);
      color: var(--primary-coral, #ff6b6b);
    }

    :host-context([data-theme="dark"]) .multiselect-tag {
      background: rgba(0, 255, 209, 0.12);
      color: var(--neon-cyan, #00FFD1);
    }

    .multiselect-arrow {
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-left: 0.5rem;
      transition: transform 0.2s;
    }

    .multiselect.open .multiselect-arrow {
      transform: rotate(180deg);
    }

    .multiselect-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 10;
      background: var(--card-bg, #fff);
      border: 1px solid var(--card-border, #e5e7eb);
      border-radius: var(--radius-md, 0.5rem);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      max-height: 200px;
      overflow-y: auto;
      margin-top: 0.25rem;
    }

    .multiselect-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      font-size: 0.85rem;
      color: var(--text-main);
      cursor: pointer;
      transition: background-color 0.15s;
    }

    .multiselect-option:hover {
      background-color: var(--table-row-hover, #f9fafb);
    }

    .multiselect-option input[type="checkbox"] {
      accent-color: var(--primary-coral);
      cursor: pointer;
    }

    /* Image section in modal */
    .imagen-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .imagen-preview {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: var(--radius-sm, 0.25rem);
      border: 1px solid var(--card-border, #e5e7eb);
    }

    .imagen-placeholder {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-sm, 0.25rem);
      border: 1px dashed var(--card-border, #d1d5db);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      font-size: 0.75rem;
      gap: 0.25rem;
    }

    .imagen-placeholder i {
      font-size: 1.25rem;
    }

    .imagen-actions {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .btn-delete-img {
      color: var(--text-main);
    }

    /* BGG Search Panel */
    .bgg-section { margin-bottom: 0.25rem; }

    .bgg-trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--primary-coral);
      background: none;
      border: 1px dashed var(--primary-coral);
      border-radius: var(--radius-md, 0.5rem);
      cursor: pointer;
      transition: background-color 0.2s, color 0.2s;
    }

    .bgg-trigger:hover {
      background-color: rgba(255, 107, 107, 0.08);
    }

    :host-context([data-theme="dark"]) .bgg-trigger {
      color: var(--neon-cyan, #00FFD1);
      border-color: var(--neon-cyan, #00FFD1);
    }

    :host-context([data-theme="dark"]) .bgg-trigger:hover {
      background-color: rgba(0, 255, 209, 0.08);
    }

    .bgg-search-panel {
      background: var(--table-row-hover, #f9fafb);
      border: 1px solid var(--card-border, #e5e7eb);
      border-radius: var(--radius-md, 0.5rem);
      padding: 0.75rem;
    }

    .bgg-search-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .bgg-search-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .bgg-search-input-row {
      display: flex;
      gap: 0.5rem;
    }

    .bgg-search-input-row .form-input { flex: 1; }

    .bgg-loading {
      padding: 0.75rem;
      text-align: center;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .bgg-results-list {
      max-height: 200px;
      overflow-y: auto;
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .bgg-result-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: none;
      border: none;
      border-radius: var(--radius-sm, 0.25rem);
      cursor: pointer;
      text-align: left;
      width: 100%;
      font-size: 0.85rem;
      color: var(--text-main);
      transition: background-color 0.15s;
    }

    .bgg-result-item:hover:not(:disabled) {
      background-color: var(--card-border, #e5e7eb);
    }

    .bgg-result-item:disabled {
      opacity: 0.5;
      cursor: wait;
    }

    .bgg-result-name { font-weight: 500; }

    .bgg-result-year {
      color: var(--text-muted);
      font-size: 0.75rem;
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
  private bggAdmin = inject(BggAdminService);
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

  imageVersion = signal(0);
  failedImages = signal(new Set<number>());

  bggSearchMode = signal(false);
  bggSearchTerm = signal('');
  bggResults = signal<BggSearchResult[]>([]);
  bggLoading = signal(false);
  bggDetailLoading = signal(false);
  bggSelectedId = signal<number | null>(null);

  nombreDuplicado = signal(false);
  copiasExtra = signal(1);
  originalId = signal<number | null>(null);

  pendingImageFile = signal<File | null>(null);
  pendingImagePreview = signal<string | null>(null);
  generoDropdownOpen = signal(false);
  selectedGeneros = signal<string[]>([]);
  readonly allGeneros = [
    'ESTRATEGIA', 'FAMILIAR', 'PARTY', 'COOPERATIVO', 'ROL', 'CARTAS',
    'DADOS', 'ACCION', 'AVENTURA', 'MISTERIO', 'INFANTIL', 'PUZZLE',
    'TERROR', 'SOLITARIO', 'MAZOS', 'MINIATURAS', 'ROLESOCULTOS', 'CARRERAS'
  ];

  readonly pageSize = 25;
  protected readonly Math = Math;

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
    minJugadores: [null as number | null, [Validators.required, Validators.min(1)]],
    maxJugadores: [null as number | null, [Validators.required, Validators.min(1)]],
    duracionMediaMin: [null as number | null, [Validators.required, Validators.min(1)]],
    complejidad: ['', Validators.required],
    genero: ['', Validators.required],
    idioma: ['', Validators.required],
    ubicacion: ['', Validators.required],
    recomendadoDosJugadores: [false],
    activo: [true],
    descripcion: [''],
    observaciones: ['']
  });

  isLoading = signal(true);

  ngOnInit(): void {
    this.loadJuegos();
  }

  toggleGeneroDropdown(): void {
    this.generoDropdownOpen.update(v => !v);
  }

  toggleGenero(genero: string): void {
    const current = this.selectedGeneros();
    const updated = current.includes(genero)
      ? current.filter(g => g !== genero)
      : [...current, genero];
    this.selectedGeneros.set(updated);
    const value = updated.join(', ');
    this.form.patchValue({ genero: value });
    this.form.get('genero')?.markAsTouched();
  }

  private syncGenerosFromString(value: string): void {
    const generos = value ? value.split(',').map(g => g.trim()).filter(g => g) : [];
    this.selectedGeneros.set(generos);
  }

  blockNegative(event: KeyboardEvent): void {
    if (event.key === '-' || event.key === 'e') {
      event.preventDefault();
    }
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

  selectPendingImage(): void {
    this.uploadTargetId.set(null);
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  clearPendingImage(): void {
    this.pendingImageFile.set(null);
    this.pendingImagePreview.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const id = this.uploadTargetId();
    if (id === null) {
      this.pendingImageFile.set(file);
      const reader = new FileReader();
      reader.onload = () => this.pendingImagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
      return;
    }

    this.juegoService.uploadImagen(id, file).subscribe({
      next: () => {
        this.toastService.success('Imagen subida correctamente');
        this.failedImages.update(set => { const s = new Set(set); s.delete(id); return s; });
        this.imageVersion.update(v => v + 1);
      },
      error: () => this.toastService.error('Error al subir la imagen')
    });
  }

  deleteImagen(id: number): void {
    this.juegoService.deleteImagen(id).subscribe({
      next: () => {
        this.toastService.success('Imagen eliminada correctamente');
        this.failedImages.update(set => { const s = new Set(set); s.add(id); return s; });
        this.imageVersion.update(v => v + 1);
      },
      error: () => this.toastService.error('Error al eliminar la imagen')
    });
  }

  // === CRUD ===

  openCreate(): void {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.bggSearchMode.set(false);
    this.bggResults.set([]);
    this.bggSelectedId.set(null);
    this.bggSearchTerm.set('');
    this.nombreDuplicado.set(false);
    this.copiasExtra.set(1);
    this.originalId.set(null);
    this.pendingImageFile.set(null);
    this.pendingImagePreview.set(null);
    this.selectedGeneros.set([]);
    this.generoDropdownOpen.set(false);
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
    this.syncGenerosFromString(juego.genero || '');
    this.generoDropdownOpen.set(false);
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
      error: () => {
        this.toastService.error('Error al eliminar el juego');
        this.showDeleteModal.set(false);
      }
    });
  }

  toggleBggSearch(): void {
    this.bggSearchMode.update(v => !v);
    if (!this.bggSearchMode()) {
      this.bggResults.set([]);
      this.bggSearchTerm.set('');
    }
  }

  searchBgg(): void {
    const term = this.bggSearchTerm().trim();
    if (term.length < 2) return;
    this.bggLoading.set(true);
    this.bggResults.set([]);
    this.bggAdmin.search(term).subscribe({
      next: (results) => {
        this.bggResults.set(results);
        this.bggLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error al buscar en BGG');
        this.bggLoading.set(false);
      }
    });
  }

  selectBggResult(result: BggSearchResult): void {
    this.bggDetailLoading.set(true);
    this.bggAdmin.getDetails(result.bggId).subscribe({
      next: (details) => {
        this.form.patchValue({
          nombre: details.nombre,
          minJugadores: details.minJugadores,
          maxJugadores: details.maxJugadores,
          duracionMediaMin: details.duracionMediaMin,
          complejidad: details.complejidad || '',
          genero: details.genero || '',
          descripcion: details.descripcion || '',
        });
        this.syncGenerosFromString(details.genero || '');
        this.bggSelectedId.set(details.bggId);
        this.bggSearchMode.set(false);
        this.bggResults.set([]);
        this.bggDetailLoading.set(false);
        this.toastService.success('Datos importados de BGG');
      },
      error: () => {
        this.toastService.error('Error al obtener detalles de BGG');
        this.bggDetailLoading.set(false);
      }
    });
  }

  checkNombreDuplicado(): void {
    const nombre = this.form.get('nombre')?.value?.trim();
    if (!nombre || this.isEditing()) {
      this.nombreDuplicado.set(false);
      return;
    }
    const matches = this.juegos()
      .filter(j => j.nombre.toLowerCase() === nombre.toLowerCase())
      .sort((a, b) => a.id - b.id);
    const original = matches[0];
    if (original) {
      this.nombreDuplicado.set(true);
      this.copiasExtra.set(1);
      this.originalId.set(original.id);
      this.form.patchValue({
        nombre: original.nombre,
        minJugadores: original.minJugadores,
        maxJugadores: original.maxJugadores,
        duracionMediaMin: original.duracionMediaMin ?? null,
        complejidad: original.complejidad || '',
        genero: original.genero || '',
        idioma: original.idioma || '',
        ubicacion: original.ubicacion || '',
        recomendadoDosJugadores: original.recomendadoDosJugadores ?? false,
        activo: original.activo !== false,
        descripcion: original.descripcion || '',
        observaciones: original.observaciones || ''
      });
      this.syncGenerosFromString(original.genero || '');
    } else {
      this.nombreDuplicado.set(false);
      this.originalId.set(null);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue() as any;

    if (this.isEditing() && this.currentId() !== null) {
      this.juegoService.updateJuego(this.currentId()!, payload).subscribe({
        next: () => {
          this.toastService.success('Juego actualizado correctamente');
          this.loadJuegos();
          this.showFormModal.set(false);
        },
        error: () => this.toastService.error('Error al actualizar el juego')
      });
    } else {
      this.executeCreate();
    }
  }

  executeCreate(): void {
    const payload = this.form.getRawValue() as any;
    const total = this.nombreDuplicado() ? this.copiasExtra() : 1;
    const bggId = this.bggSelectedId();
    const sourceId = this.originalId();
    const calls = Array.from({ length: total }, () => this.juegoService.saveJuego(payload));
    forkJoin(calls).subscribe({
      next: (results) => {
        if (total === 1) {
          this.toastService.success('Juego creado correctamente');
        } else {
          this.toastService.success(total + ' copias de "' + payload.nombre + '" añadidas');
        }
        if (bggId && results[0]?.id) {
          this.bggAdmin.importImage(bggId, results[0].id).subscribe({
            next: () => {
              this.imageVersion.update(v => v + 1);
              this.failedImages.update(set => { const s = new Set(set); s.delete(results[0].id); return s; });
            },
            error: () => {}
          });
        } else if (sourceId) {
          const imageCalls = results
            .filter(r => r?.id)
            .map(r => this.juegoService.copyImagen(r.id, sourceId));
          if (imageCalls.length > 0) {
            forkJoin(imageCalls).subscribe({
              next: () => this.imageVersion.update(v => v + 1),
              error: () => {}
            });
          }
        } else if (this.pendingImageFile() && results[0]?.id) {
          this.juegoService.uploadImagen(results[0].id, this.pendingImageFile()!).subscribe({
            next: () => {
              this.imageVersion.update(v => v + 1);
              this.failedImages.update(set => { const s = new Set(set); s.delete(results[0].id); return s; });
            },
            error: () => {}
          });
        }
        this.pendingImageFile.set(null);
        this.pendingImagePreview.set(null);
        this.bggSelectedId.set(null);
        this.copiasExtra.set(1);
        this.originalId.set(null);
        this.loadJuegos();
        this.showFormModal.set(false);
      },
      error: () => this.toastService.error('Error al crear el juego')
    });
  }
}
