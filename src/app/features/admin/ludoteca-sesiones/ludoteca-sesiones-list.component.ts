import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LudotecaSesionesService } from '../../../core/services/ludoteca-sesiones.service';
import { ToastService } from '../../../core/services/toast.service';
import { LudotecaSesiones } from '../../../core/models/ludoteca-sesiones.interface';
import { EntityFormModalComponent } from '../../../shared/components/entity-form-modal/entity-form-modal.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-ludoteca-sesiones-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EntityFormModalComponent, ConfirmModalComponent, BeerLoaderComponent],
  template: `
    <app-beer-loader [isLoading]="isLoading()" />
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-left"><h1 class="page-title">Ludoteca Sesiones</h1><span class="record-count">{{ filteredItems().length }} registros</span></div>
        <button class="btn btn-primary" (click)="openCreate()"><i class="fa-solid fa-plus"></i> Nueva</button>
      </div>
      <div class="search-bar"><div class="search-input-wrapper"><i class="fa-solid fa-magnifying-glass search-icon"></i><input type="text" class="form-input search-input" placeholder="Buscar por sesion..." [value]="searchTerm()" (input)="searchTerm.set($any($event.target).value)" /></div></div>
      <div class="card table-container">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Sesion</th><th>Adultos</th><th>Ninos 6-13</th><th>Ninos 0-5</th><th>Importe Total</th><th>Fecha</th><th>Acciones</th></tr></thead>
          <tbody>
            @for (l of filteredItems(); track l.id) {
              <tr>
                <td>{{ l.id }}</td><td>{{ l.idSesion }}</td><td>{{ l.numAdultos }}</td><td>{{ l.numNinos613 }}</td><td>{{ l.numNinos05 }}</td>
                <td class="num-cell">{{ formatCurrency(l.importeTotal) }}</td>
                <td>{{ formatDate(l.fechaCalculo) }}</td>
                <td class="actions-cell">
                  <button class="btn btn-ghost btn-sm" (click)="openEdit(l)"><i class="fa-solid fa-pen-to-square"></i></button>
                  <button class="btn btn-danger btn-sm" (click)="confirmDelete(l.id)"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            } @empty { <tr><td colspan="8" class="empty-state"><i class="fa-solid fa-children empty-icon"></i><p>No se encontraron registros</p></td></tr> }
          </tbody>
        </table>
      </div>
      <app-entity-form-modal [isOpen]="showFormModal()" [title]="isEditing() ? 'Editar' : 'Nueva'" [isEditing]="isEditing()" [formValid]="form.valid" (onClose)="showFormModal.set(false)" (onSubmit)="onSubmit()">
        <form [formGroup]="form">
          <div class="form-group"><label class="form-label">ID Sesion *</label><input type="number" class="form-input" formControlName="idSesion" /></div>
          <div class="form-row">
            <div class="form-group form-col"><label class="form-label">Adultos</label><input type="number" class="form-input" formControlName="numAdultos" min="0" /></div>
            <div class="form-group form-col"><label class="form-label">Ninos 6-13</label><input type="number" class="form-input" formControlName="numNinos613" min="0" /></div>
            <div class="form-group form-col"><label class="form-label">Ninos 0-5</label><input type="number" class="form-input" formControlName="numNinos05" min="0" /></div>
          </div>
        </form>
      </app-entity-form-modal>
      <app-confirm-modal [isOpen]="showDeleteModal()" title="Eliminar registro" message="Esta accion no se puede deshacer." (onConfirm)="executeDelete()" (onCancel)="showDeleteModal.set(false)" />
    </div>
  `,
  styles: [`
    .page-wrapper { padding: var(--spacing-xl); }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-lg); }
    .header-left { display: flex; align-items: baseline; gap: var(--spacing-md); }
    .page-title { font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin: 0; }
    .record-count { font-size: 0.875rem; color: var(--text-muted); }
    .search-bar { margin-bottom: var(--spacing-lg); }
    .search-input-wrapper { position: relative; max-width: 400px; }
    .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.875rem; }
    .search-input { padding-left: 2.25rem; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table thead { background-color: var(--table-header-bg); }
    .data-table th { padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--table-border); white-space: nowrap; }
    .data-table td { padding: 0.75rem 1rem; font-size: 0.875rem; color: var(--text-main); border-bottom: 1px solid var(--table-border); }
    .data-table tbody tr:hover { background-color: var(--table-row-hover); }
    .num-cell { font-weight: 600; font-variant-numeric: tabular-nums; }
    .actions-cell { display: flex; gap: 0.5rem; white-space: nowrap; }
    .empty-state { text-align: center; padding: 3rem 1rem; color: var(--text-muted); }
    .empty-icon { font-size: 2rem; margin-bottom: 0.5rem; display: block; opacity: 0.4; }
    .form-row { display: flex; gap: var(--spacing-md); }
    .form-col { flex: 1; }
    @media (max-width: 768px) { .page-wrapper { padding: var(--spacing-md); } .page-header { flex-direction: column; align-items: flex-start; gap: var(--spacing-md); } .form-row { flex-direction: column; gap: 0; } }
  `]
})
export class LudotecaSesionesListComponent implements OnInit {
  private ludotecaService = inject(LudotecaSesionesService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  items = signal<LudotecaSesiones[]>([]);
  searchTerm = signal('');
  showFormModal = signal(false);
  showDeleteModal = signal(false);
  isEditing = signal(false);
  currentId = signal<number | null>(null);
  deleteId = signal<number | null>(null);
  isLoading = signal(true);

  filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.items();
    return this.items().filter(l => String(l.idSesion).includes(term));
  });

  form = this.fb.group({
    idSesion: [0, Validators.required],
    numAdultos: [0, Validators.min(0)],
    numNinos613: [0, Validators.min(0)],
    numNinos05: [0, Validators.min(0)]
  });

  ngOnInit(): void { this.load(); }
  load(): void { this.ludotecaService.getAll().subscribe({ next: (d) => { this.items.set(d); this.isLoading.set(false); }, error: () => { this.toastService.error('Error al cargar'); this.isLoading.set(false); } }); }
  openCreate(): void { this.isEditing.set(false); this.currentId.set(null); this.form.reset({ idSesion: 0, numAdultos: 0, numNinos613: 0, numNinos05: 0 }); this.showFormModal.set(true); }
  openEdit(l: LudotecaSesiones): void { this.isEditing.set(true); this.currentId.set(l.id); this.form.patchValue({ idSesion: l.idSesion, numAdultos: l.numAdultos, numNinos613: l.numNinos613, numNinos05: l.numNinos05 }); this.showFormModal.set(true); }
  confirmDelete(id: number): void { this.deleteId.set(id); this.showDeleteModal.set(true); }
  executeDelete(): void { const id = this.deleteId(); if (!id) return; this.ludotecaService.delete(id).subscribe({ next: () => { this.toastService.success('Eliminado'); this.load(); this.showDeleteModal.set(false); }, error: () => { this.toastService.error('Error'); this.showDeleteModal.set(false); } }); }
  onSubmit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue() as any;
    if (this.isEditing() && this.currentId()) { this.ludotecaService.update(this.currentId()!, val).subscribe({ next: () => { this.toastService.success('Actualizado'); this.load(); this.showFormModal.set(false); }, error: () => this.toastService.error('Error') }); }
    else { this.ludotecaService.create(val).subscribe({ next: () => { this.toastService.success('Creado'); this.load(); this.showFormModal.set(false); }, error: (e) => this.toastService.error(e?.error?.message || 'Error') }); }
  }
  formatCurrency(v: number): string { return v == null ? '0,00 €' : v.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
  formatDate(d: string): string { if (!d) return '-'; return new Date(d).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
}
