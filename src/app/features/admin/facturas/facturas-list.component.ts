import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacturaService } from '../../../core/services/factura.service';
import { ToastService } from '../../../core/services/toast.service';
import { Factura } from '../../../core/models/factura.interface';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-facturas-list',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, BeerLoaderComponent],
  template: `
    <app-beer-loader [isLoading]="isLoading()" />
    <div class="page-wrapper">
      <div class="page-header">
        <h1 class="page-title">Facturas</h1>
        <div class="page-actions">
          <input type="text" class="form-input search-input" placeholder="Buscar por numero..." [value]="searchTerm()" (input)="searchTerm.set($any($event.target).value)" />
        </div>
      </div>

      <div class="estado-filters">
        @for (f of estadoFilters; track f.value) {
          <button class="filter-pill" [class.active]="estadoFilter() === f.value" (click)="estadoFilter.set(f.value)">{{ f.label }}</button>
        }
      </div>

      <div class="card table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Numero</th>
              <th>Sesion</th>
              <th>Fecha</th>
              <th>Base 10%</th>
              <th>IVA 10%</th>
              <th>Base 21%</th>
              <th>IVA 21%</th>
              <th>Ludoteca</th>
              <th>Total</th>
              <th>Pagado</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            @for (f of filteredFacturas(); track f.id) {
              <tr>
                <td class="name-cell">{{ f.numeroFactura }}</td>
                <td>{{ f.idSesion }}</td>
                <td>{{ formatDate(f.fechaEmision) }}</td>
                <td class="num-cell">{{ formatCurrency(f.baseImponible10) }}</td>
                <td class="num-cell">{{ formatCurrency(f.cuotaIva10) }}</td>
                <td class="num-cell">{{ formatCurrency(f.baseImponible21) }}</td>
                <td class="num-cell">{{ formatCurrency(f.cuotaIva21) }}</td>
                <td class="num-cell">{{ formatCurrency(f.importeLudoteca) }}</td>
                <td class="num-cell total-cell">{{ formatCurrency(f.total) }}</td>
                <td class="num-cell">{{ formatCurrency(f.totalPagado) }}</td>
                <td><app-status-badge [status]="f.estado" /></td>
              </tr>
            } @empty {
              <tr><td colspan="11" class="empty-state"><i class="fa-solid fa-file-invoice empty-icon"></i><p>No se encontraron facturas</p></td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-wrapper { padding: var(--spacing-xl); }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-lg); flex-wrap: wrap; gap: var(--spacing-md); }
    .page-title { font-size: 1.75rem; font-weight: 700; color: var(--text-main); }
    .page-actions { display: flex; align-items: center; gap: var(--spacing-sm); }
    .search-input { width: 260px; }
    .estado-filters { display: flex; gap: 0.5rem; margin-bottom: var(--spacing-lg); }
    .filter-pill { padding: 0.375rem 1rem; border-radius: 9999px; border: 1px solid var(--input-border); background-color: var(--card-bg); color: var(--text-muted); font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .filter-pill:hover { border-color: var(--primary-coral); color: var(--primary-coral); }
    .filter-pill.active { background-color: var(--primary-coral); border-color: var(--primary-coral); color: var(--text-white); }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table thead tr { background-color: var(--table-header-bg); }
    .data-table th { padding: 0.75rem 0.625rem; text-align: left; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); border-bottom: 2px solid var(--table-border); white-space: nowrap; }
    .data-table td { padding: 0.75rem 0.625rem; font-size: 0.8125rem; color: var(--text-main); border-bottom: 1px solid var(--table-border); }
    .data-table tbody tr:hover { background-color: var(--table-row-hover); }
    .name-cell { font-weight: 600; }
    .num-cell { font-variant-numeric: tabular-nums; text-align: right; }
    .total-cell { font-weight: 700; }
    .empty-state { text-align: center; padding: 3rem 1rem !important; color: var(--text-muted); }
    .empty-icon { font-size: 2rem; margin-bottom: 0.5rem; display: block; opacity: 0.4; }
    @media (max-width: 768px) { .page-wrapper { padding: var(--spacing-md); } .page-header { flex-direction: column; align-items: flex-start; } .search-input { width: 100%; } }
  `]
})
export class FacturasListComponent implements OnInit {
  private facturaService = inject(FacturaService);
  private toastService = inject(ToastService);

  facturas = signal<Factura[]>([]);
  searchTerm = signal('');
  estadoFilter = signal('');
  isLoading = signal(true);

  estadoFilters = [
    { label: 'Todas', value: '' },
    { label: 'Emitidas', value: 'EMITIDA' },
    { label: 'Pagadas', value: 'PAGADA' },
    { label: 'Anuladas', value: 'ANULADA' }
  ];

  filteredFacturas = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const estado = this.estadoFilter();
    let list = this.facturas();
    if (estado) list = list.filter(f => f.estado === estado);
    if (term) list = list.filter(f => f.numeroFactura.toLowerCase().includes(term));
    return list;
  });

  ngOnInit(): void {
    this.facturaService.getAll().subscribe({
      next: (data) => { this.facturas.set(data); this.isLoading.set(false); },
      error: () => { this.toastService.error('Error al cargar facturas'); this.isLoading.set(false); }
    });
  }

  formatDate(iso: string): string {
    if (!iso) return '-';
    const dt = new Date(iso);
    return dt.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatCurrency(value: number): string {
    if (value == null) return '0,00';
    return value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
