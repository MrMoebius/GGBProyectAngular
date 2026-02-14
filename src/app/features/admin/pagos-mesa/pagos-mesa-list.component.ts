import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PagosMesaService } from '../../../core/services/pagos-mesa.service';
import { ToastService } from '../../../core/services/toast.service';
import { PagosMesa } from '../../../core/models/pagos-mesa.interface';
import { EntityFormModalComponent } from '../../../shared/components/entity-form-modal/entity-form-modal.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-pagos-mesa-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EntityFormModalComponent, StatusBadgeComponent, ConfirmModalComponent, BeerLoaderComponent],
  template: `
    <app-beer-loader [isLoading]="isLoading()" />
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-left"><h1 class="page-title">Pagos de Mesa</h1><span class="record-count">{{ filteredPagos().length }} registros</span></div>
        <button class="btn btn-primary" (click)="openCreate()"><i class="fa-solid fa-plus"></i> Nuevo Pago</button>
      </div>
      <div class="search-bar"><div class="search-input-wrapper"><i class="fa-solid fa-magnifying-glass search-icon"></i><input type="text" class="form-input search-input" placeholder="Buscar por sesion o metodo..." [value]="searchTerm()" (input)="searchTerm.set($any($event.target).value)" /></div></div>
      <div class="card table-container">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Sesion</th><th>Importe</th><th>Metodo</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead>
          <tbody>
            @for (p of filteredPagos(); track p.id) {
              <tr>
                <td>{{ p.id }}</td><td>{{ p.idSesion }}</td>
                <td class="num-cell">{{ formatCurrency(p.importe) }}</td>
                <td><app-status-badge [status]="p.metodoPago" /></td>
                <td><app-status-badge [status]="p.estado" /></td>
                <td>{{ formatDate(p.fechaPago) }}</td>
                <td class="actions-cell">
                  <button class="btn btn-ghost btn-sm" (click)="openEdit(p)"><i class="fa-solid fa-pen-to-square"></i></button>
                  <button class="btn btn-danger btn-sm" (click)="confirmDelete(p.id)"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            } @empty { <tr><td colspan="7" class="empty-state"><i class="fa-solid fa-money-bill empty-icon"></i><p>No se encontraron pagos</p></td></tr> }
          </tbody>
        </table>
      </div>
      <app-entity-form-modal [isOpen]="showFormModal()" [title]="isEditing() ? 'Editar Pago' : 'Nuevo Pago'" [isEditing]="isEditing()" [formValid]="form.valid" (onClose)="showFormModal.set(false)" (onSubmit)="onSubmit()">
        <form [formGroup]="form">
          <div class="form-group"><label class="form-label">ID Sesion *</label><input type="number" class="form-input" formControlName="idSesion" /></div>
          <div class="form-row"><div class="form-group form-col"><label class="form-label">Importe *</label><input type="number" class="form-input" formControlName="importe" min="0" step="0.01" /></div>
          <div class="form-group form-col"><label class="form-label">Metodo *</label><select class="form-input" formControlName="metodoPago"><option value="EFECTIVO">Efectivo</option><option value="TARJETA">Tarjeta</option><option value="BIZUM">Bizum</option></select></div></div>
        </form>
      </app-entity-form-modal>
      <app-confirm-modal [isOpen]="showDeleteModal()" title="Eliminar pago" message="Esta accion no se puede deshacer." (onConfirm)="executeDelete()" (onCancel)="showDeleteModal.set(false)" />
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
export class PagosMesaListComponent implements OnInit {
  private pagosService = inject(PagosMesaService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  pagos = signal<PagosMesa[]>([]);
  searchTerm = signal('');
  showFormModal = signal(false);
  showDeleteModal = signal(false);
  isEditing = signal(false);
  currentId = signal<number | null>(null);
  deleteId = signal<number | null>(null);
  isLoading = signal(true);

  filteredPagos = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.pagos();
    return this.pagos().filter(p => String(p.idSesion).includes(term) || p.metodoPago.toLowerCase().includes(term));
  });

  form = this.fb.group({
    idSesion: [0, Validators.required],
    importe: [0, [Validators.required, Validators.min(0.01)]],
    metodoPago: ['EFECTIVO']
  });

  ngOnInit(): void { this.load(); }
  load(): void { this.pagosService.getAll().subscribe({ next: (d) => { this.pagos.set(d); this.isLoading.set(false); }, error: () => { this.toastService.error('Error al cargar pagos'); this.isLoading.set(false); } }); }
  openCreate(): void { this.isEditing.set(false); this.currentId.set(null); this.form.reset({ idSesion: 0, importe: 0, metodoPago: 'EFECTIVO' }); this.showFormModal.set(true); }
  openEdit(p: PagosMesa): void { this.isEditing.set(true); this.currentId.set(p.id); this.form.patchValue({ idSesion: p.idSesion, importe: p.importe, metodoPago: p.metodoPago }); this.showFormModal.set(true); }
  confirmDelete(id: number): void { this.deleteId.set(id); this.showDeleteModal.set(true); }
  executeDelete(): void { const id = this.deleteId(); if (!id) return; this.pagosService.delete(id).subscribe({ next: () => { this.toastService.success('Pago eliminado'); this.load(); this.showDeleteModal.set(false); }, error: () => { this.toastService.error('Error al eliminar'); this.showDeleteModal.set(false); } }); }
  onSubmit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue() as any;
    if (this.isEditing() && this.currentId()) { this.pagosService.update(this.currentId()!, val).subscribe({ next: () => { this.toastService.success('Pago actualizado'); this.load(); this.showFormModal.set(false); }, error: () => this.toastService.error('Error') }); }
    else { this.pagosService.create(val).subscribe({ next: () => { this.toastService.success('Pago creado'); this.load(); this.showFormModal.set(false); }, error: (e) => this.toastService.error(e?.error?.message || 'Error') }); }
  }
  formatCurrency(v: number): string { return v == null ? '0,00 €' : v.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
  formatDate(d: string): string { if (!d) return '-'; const dt = new Date(d); return dt.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
}
