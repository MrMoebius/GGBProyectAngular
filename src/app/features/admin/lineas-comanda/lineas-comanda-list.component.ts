import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LineasComandaService } from '../../../core/services/lineas-comanda.service';
import { ToastService } from '../../../core/services/toast.service';
import { LineasComanda } from '../../../core/models/lineas-comanda.interface';
import { EntityFormModalComponent } from '../../../shared/components/entity-form-modal/entity-form-modal.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-lineas-comanda-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EntityFormModalComponent, ConfirmModalComponent, BeerLoaderComponent],
  template: `
    <app-beer-loader [isLoading]="isLoading()" />
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-left"><h1 class="page-title">Lineas de Comanda</h1><span class="record-count">{{ filteredLineas().length }} registros</span></div>
        <button class="btn btn-primary" (click)="openCreate()"><i class="fa-solid fa-plus"></i> Nueva Linea</button>
      </div>
      <div class="search-bar"><div class="search-input-wrapper"><i class="fa-solid fa-magnifying-glass search-icon"></i><input type="text" class="form-input search-input" placeholder="Buscar por comanda o producto..." [value]="searchTerm()" (input)="searchTerm.set($any($event.target).value)" /></div></div>
      <div class="card table-container">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Comanda</th><th>Producto</th><th>Cantidad</th><th>Precio Unit.</th><th>Subtotal</th><th>Notas</th><th>Acciones</th></tr></thead>
          <tbody>
            @for (l of filteredLineas(); track l.id) {
              <tr>
                <td>{{ l.id }}</td><td>{{ l.idComanda }}</td><td>{{ l.idProducto }}</td><td>{{ l.cantidad }}</td>
                <td class="num-cell">{{ formatCurrency(l.precioUnitarioHistorico) }}</td>
                <td class="num-cell total-cell">{{ formatCurrency(l.precioUnitarioHistorico * l.cantidad) }}</td>
                <td class="notes-cell">{{ l.notas || '-' }}</td>
                <td class="actions-cell">
                  <button class="btn btn-ghost btn-sm" (click)="openEdit(l)"><i class="fa-solid fa-pen-to-square"></i></button>
                  <button class="btn btn-danger btn-sm" (click)="confirmDelete(l.id)"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            } @empty { <tr><td colspan="8" class="empty-state"><i class="fa-solid fa-list-ol empty-icon"></i><p>No se encontraron lineas</p></td></tr> }
          </tbody>
        </table>
      </div>
      <app-entity-form-modal [isOpen]="showFormModal()" [title]="isEditing() ? 'Editar Linea' : 'Nueva Linea'" [isEditing]="isEditing()" [formValid]="form.valid" (onClose)="showFormModal.set(false)" (onSubmit)="onSubmit()">
        <form [formGroup]="form">
          <div class="form-row"><div class="form-group form-col"><label class="form-label">ID Comanda *</label><input type="number" class="form-input" formControlName="idComanda" /></div>
          <div class="form-group form-col"><label class="form-label">ID Producto *</label><input type="number" class="form-input" formControlName="idProducto" /></div></div>
          <div class="form-row"><div class="form-group form-col"><label class="form-label">Cantidad *</label><input type="number" class="form-input" formControlName="cantidad" min="1" /></div>
          <div class="form-group form-col"><label class="form-label">Precio Unit. *</label><input type="number" class="form-input" formControlName="precioUnitarioHistorico" min="0" step="0.01" /></div></div>
          <div class="form-group"><label class="form-label">Notas</label><input type="text" class="form-input" formControlName="notas" placeholder="Notas opcionales" /></div>
        </form>
      </app-entity-form-modal>
      <app-confirm-modal [isOpen]="showDeleteModal()" title="Eliminar linea" message="Esta accion no se puede deshacer." (onConfirm)="executeDelete()" (onCancel)="showDeleteModal.set(false)" />
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
    .num-cell { font-variant-numeric: tabular-nums; font-weight: 500; }
    .total-cell { font-weight: 700; }
    .notes-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-muted); }
    .actions-cell { display: flex; gap: 0.5rem; white-space: nowrap; }
    .empty-state { text-align: center; padding: 3rem 1rem; color: var(--text-muted); }
    .empty-icon { font-size: 2rem; margin-bottom: 0.5rem; display: block; opacity: 0.4; }
    .form-row { display: flex; gap: var(--spacing-md); }
    .form-col { flex: 1; }
    @media (max-width: 768px) { .page-wrapper { padding: var(--spacing-md); } .page-header { flex-direction: column; align-items: flex-start; gap: var(--spacing-md); } .form-row { flex-direction: column; gap: 0; } }
  `]
})
export class LineasComandaListComponent implements OnInit {
  private lineasService = inject(LineasComandaService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  lineas = signal<LineasComanda[]>([]);
  searchTerm = signal('');
  showFormModal = signal(false);
  showDeleteModal = signal(false);
  isEditing = signal(false);
  currentId = signal<number | null>(null);
  deleteId = signal<number | null>(null);
  isLoading = signal(true);

  filteredLineas = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.lineas();
    return this.lineas().filter(l => String(l.idComanda).includes(term) || String(l.idProducto).includes(term));
  });

  form = this.fb.group({
    idComanda: [0, Validators.required],
    idProducto: [0, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precioUnitarioHistorico: [0, [Validators.required, Validators.min(0)]],
    notas: ['']
  });

  ngOnInit(): void { this.load(); }
  load(): void { this.lineasService.getAll().subscribe({ next: (d) => { this.lineas.set(d); this.isLoading.set(false); }, error: () => { this.toastService.error('Error al cargar lineas'); this.isLoading.set(false); } }); }
  openCreate(): void { this.isEditing.set(false); this.currentId.set(null); this.form.reset({ idComanda: 0, idProducto: 0, cantidad: 1, precioUnitarioHistorico: 0, notas: '' }); this.showFormModal.set(true); }
  openEdit(l: LineasComanda): void { this.isEditing.set(true); this.currentId.set(l.id); this.form.patchValue(l as any); this.showFormModal.set(true); }
  confirmDelete(id: number): void { this.deleteId.set(id); this.showDeleteModal.set(true); }
  executeDelete(): void { const id = this.deleteId(); if (!id) return; this.lineasService.delete(id).subscribe({ next: () => { this.toastService.success('Linea eliminada'); this.load(); this.showDeleteModal.set(false); }, error: () => { this.toastService.error('Error'); this.showDeleteModal.set(false); } }); }
  onSubmit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue() as any;
    if (this.isEditing() && this.currentId()) { this.lineasService.update(this.currentId()!, val).subscribe({ next: () => { this.toastService.success('Linea actualizada'); this.load(); this.showFormModal.set(false); }, error: () => this.toastService.error('Error') }); }
    else { this.lineasService.create(val).subscribe({ next: () => { this.toastService.success('Linea creada'); this.load(); this.showFormModal.set(false); }, error: (e) => this.toastService.error(e?.error?.message || 'Error') }); }
  }
  formatCurrency(v: number): string { return v == null ? '0,00 €' : v.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
}
