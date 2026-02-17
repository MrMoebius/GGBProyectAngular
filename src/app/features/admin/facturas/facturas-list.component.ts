import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacturaService } from '../../../core/services/factura.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ToastService } from '../../../core/services/toast.service';
import { Factura } from '../../../core/models/factura.interface';
import { Cliente } from '../../../core/models/cliente.interface';
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
        <div class="header-left">
          <h1 class="page-title">Facturas</h1>
          <span class="record-count">{{ filteredFacturas().length }} registros</span>
        </div>
        <input type="text" class="form-input search-input" placeholder="Buscar por numero..."
          [value]="searchTerm()" (input)="searchTerm.set($any($event.target).value)" />
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
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Base 10%</th>
              <th>IVA 10%</th>
              <th>Base 21%</th>
              <th>IVA 21%</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (f of filteredFacturas(); track f.id) {
              <tr>
                <td class="name-cell">{{ f.numeroFactura }}</td>
                <td>{{ f.idSesion }}</td>
                <td>{{ getClienteNombre(f.idCliente) }}</td>
                <td>{{ formatDate(f.fechaEmision) }}</td>
                <td class="num-cell">{{ formatCurrency(f.baseImponible10) }}</td>
                <td class="num-cell">{{ formatCurrency(f.cuotaIva10) }}</td>
                <td class="num-cell">{{ formatCurrency(f.baseImponible21) }}</td>
                <td class="num-cell">{{ formatCurrency(f.cuotaIva21) }}</td>
                <td class="num-cell total-cell">{{ formatCurrency(f.total) }}</td>
                <td><app-status-badge [status]="f.estado" /></td>
                <td class="actions-cell">
                  <button class="btn btn-ghost btn-sm" (click)="printTicket(f)" title="Imprimir ticket">
                    <i class="fa-solid fa-print"></i>
                  </button>
                  <button class="btn btn-ghost btn-sm"
                    [class.btn-disabled]="!f.idCliente"
                    [disabled]="!f.idCliente || emailSending()"
                    (click)="enviarEmail(f)" title="Enviar por email">
                    <i class="fa-solid fa-envelope"></i>
                  </button>
                </td>
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
    .header-left { display: flex; align-items: baseline; gap: var(--spacing-md); }
    .page-title { font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin: 0; }
    .record-count { font-size: 0.875rem; color: var(--text-muted); }
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
    .actions-cell { display: flex; gap: 0.375rem; white-space: nowrap; }
    .btn-disabled { opacity: 0.3; cursor: not-allowed; }
    .empty-state { text-align: center; padding: 3rem 1rem !important; color: var(--text-muted); }
    .empty-icon { font-size: 2rem; margin-bottom: 0.5rem; display: block; opacity: 0.4; }
    @media (max-width: 768px) { .page-wrapper { padding: var(--spacing-md); } .page-header { flex-direction: column; align-items: flex-start; } .search-input { width: 100%; } }
  `]
})
export class FacturasListComponent implements OnInit {
  private facturaService = inject(FacturaService);
  private clienteService = inject(ClienteService);
  private toastService = inject(ToastService);

  facturas = signal<Factura[]>([]);
  clientes = signal<Cliente[]>([]);
  searchTerm = signal('');
  estadoFilter = signal('');
  isLoading = signal(true);
  emailSending = signal(false);

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
    return list.sort((a, b) => new Date(b.fechaEmision).getTime() - new Date(a.fechaEmision).getTime());
  });

  ngOnInit(): void {
    this.facturaService.getAll().subscribe({
      next: (data) => { this.facturas.set(data); this.isLoading.set(false); },
      error: () => { this.toastService.error('Error al cargar facturas'); this.isLoading.set(false); }
    });
    this.clienteService.getAll().subscribe({
      next: (data) => this.clientes.set(data),
      error: () => {}
    });
  }

  getClienteNombre(idCliente?: number): string {
    if (!idCliente) return '-';
    const c = this.clientes().find(cl => cl.id === idCliente);
    return c ? c.nombre : '-';
  }

  private getClienteEmail(idCliente?: number): string {
    if (!idCliente) return '';
    const c = this.clientes().find(cl => cl.id === idCliente);
    return c?.email || '';
  }

  printTicket(f: Factura): void {
    const cliente = this.getClienteNombre(f.idCliente);
    const html = `<!DOCTYPE html>
<html><head><title>Ticket ${f.numeroFactura}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; width: 280px; margin: 0 auto; padding: 16px 10px; font-size: 12px; color: #000; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .line { border-top: 1px dashed #000; margin: 10px 0; }
  .row { display: flex; justify-content: space-between; padding: 2px 0; }
  .total-row { font-size: 15px; font-weight: bold; padding: 4px 0; }
  h2 { font-size: 18px; margin-bottom: 2px; }
  @media print { body { margin: 0; } }
</style></head><body>
  <div class="center">
    <h2>GG Bar</h2>
    <p>Factura Simplificada</p>
    <p class="bold">${f.numeroFactura}</p>
    <p>${this.formatDate(f.fechaEmision)}</p>
  </div>
  <div class="line"></div>
  ${cliente !== '-' ? '<p>Cliente: ' + cliente + '</p>' : ''}
  <p>Sesion: ${f.idSesion}</p>
  <div class="line"></div>
  <div class="row"><span>Base IVA 10%</span><span>${this.formatCurrency(f.baseImponible10)} EUR</span></div>
  <div class="row"><span>Cuota IVA 10%</span><span>${this.formatCurrency(f.cuotaIva10)} EUR</span></div>
  <div class="row"><span>Base IVA 21%</span><span>${this.formatCurrency(f.baseImponible21)} EUR</span></div>
  <div class="row"><span>Cuota IVA 21%</span><span>${this.formatCurrency(f.cuotaIva21)} EUR</span></div>
  ${f.importeLudoteca > 0 ? '<div class="row"><span>Ludoteca</span><span>' + this.formatCurrency(f.importeLudoteca) + ' EUR</span></div>' : ''}
  <div class="line"></div>
  <div class="row total-row"><span>TOTAL</span><span>${this.formatCurrency(f.total)} EUR</span></div>
  <div class="row"><span>PAGADO</span><span>${this.formatCurrency(f.totalPagado)} EUR</span></div>
  <div class="line"></div>
  <div class="center">
    <p style="margin-top: 8px;">Gracias por su visita</p>
    <p style="font-size: 10px; color: #666;">IVA incluido</p>
  </div>
</body></html>`;

    const win = window.open('', '_blank', 'width=320,height=600');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 300);
    }
  }

  enviarEmail(f: Factura): void {
    if (!f.idCliente || this.emailSending()) return;
    const email = this.getClienteEmail(f.idCliente);
    if (!email) {
      this.toastService.error('El cliente no tiene email registrado');
      return;
    }
    this.emailSending.set(true);
    this.facturaService.enviarEmail(f.id).subscribe({
      next: () => {
        this.emailSending.set(false);
        this.toastService.success(`Factura enviada a ${email}`);
      },
      error: (err) => {
        this.emailSending.set(false);
        this.toastService.error(err?.error?.message || 'Error al enviar email');
      }
    });
  }

  formatDate(iso: string): string {
    if (!iso) return '-';
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return iso;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  }

  formatCurrency(value: number): string {
    if (value == null) return '0,00';
    return value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
