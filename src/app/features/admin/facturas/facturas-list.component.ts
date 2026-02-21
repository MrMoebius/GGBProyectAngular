import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { FacturaService } from '../../../core/services/factura.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ComandaService } from '../../../core/services/comanda.service';
import { LineasComandaService } from '../../../core/services/lineas-comanda.service';
import { ProductoService } from '../../../core/services/producto.service';
import { ToastService } from '../../../core/services/toast.service';
import { Factura } from '../../../core/models/factura.interface';
import { Cliente } from '../../../core/models/cliente.interface';
import { Comanda } from '../../../core/models/comanda.interface';
import { LineasComanda } from '../../../core/models/lineas-comanda.interface';
import { Producto } from '../../../core/models/producto.interface';
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
          <div class="view-toggle">
            <button class="toggle-btn" [class.active]="viewMode() === 'list'" (click)="viewMode.set('list')">
              <i class="fa-solid fa-table-list"></i> Lista
            </button>
            <button class="toggle-btn" [class.active]="viewMode() === 'grid'" (click)="viewMode.set('grid')">
              <i class="fa-solid fa-grid-2"></i> Cuadricula
            </button>
          </div>
        </div>
        <input type="text" class="form-input search-input" placeholder="Buscar por numero..."
          [value]="searchTerm()" (input)="searchTerm.set($any($event.target).value)" />
      </div>

      <div class="filters-row">
        <div class="estado-filters">
          @for (f of estadoFilters; track f.value) {
            <button class="filter-pill" [class.active]="estadoFilter() === f.value" (click)="estadoFilter.set(f.value)">{{ f.label }}</button>
          }
        </div>
        <label class="group-toggle">
          <input type="checkbox" [checked]="groupByDay()" (change)="groupByDay.set(!groupByDay())" />
          Agrupar por dias
        </label>
      </div>

      <!-- VISTA LISTA -->
      @if (viewMode() === 'list') {
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
              @if (groupByDay()) {
                @for (group of groupedFacturas(); track group.date) {
                  <tr class="day-row">
                    <td colspan="11">
                      <span class="day-label">{{ formatDayHeader(group.date) }}</span>
                      <span class="day-count">{{ group.items.length }} {{ group.items.length === 1 ? 'factura' : 'facturas' }}</span>
                      <span class="day-total">{{ formatCurrency(getDayTotal(group.items)) }} EUR</span>
                    </td>
                  </tr>
                  @for (f of group.items; track f.id) {
                    <ng-container *ngTemplateOutlet="facturaRow; context: { $implicit: f }" />
                  }
                }
              } @else {
                @for (f of filteredFacturas(); track f.id) {
                  <ng-container *ngTemplateOutlet="facturaRow; context: { $implicit: f }" />
                } @empty {
                  <tr><td colspan="11" class="empty-state"><i class="fa-solid fa-file-invoice empty-icon"></i><p>No se encontraron facturas</p></td></tr>
                }
              }
            </tbody>
          </table>
        </div>

        <ng-template #facturaRow let-f>
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
        </ng-template>
      }

      <!-- VISTA CUADRICULA -->
      @if (viewMode() === 'grid') {
        @if (groupByDay()) {
          @for (group of groupedFacturas(); track group.date) {
            <div class="day-header">
              <span class="day-label">{{ formatDayHeader(group.date) }}</span>
              <span class="day-count">{{ group.items.length }} {{ group.items.length === 1 ? 'factura' : 'facturas' }}</span>
              <span class="day-total">{{ formatCurrency(getDayTotal(group.items)) }} EUR</span>
            </div>
            <div class="facturas-grid">
              @for (f of group.items; track f.id) {
                <div class="factura-card">
                  <div class="card-top">
                    <span class="card-numero">{{ f.numeroFactura }}</span>
                    <app-status-badge [status]="f.estado" />
                  </div>
                  <div class="card-body">
                    <div class="card-row"><span class="card-label">Cliente</span><span>{{ getClienteNombre(f.idCliente) }}</span></div>
                    <div class="card-row"><span class="card-label">Sesion</span><span>{{ f.idSesion }}</span></div>
                    <div class="card-row"><span class="card-label">Fecha</span><span>{{ formatDate(f.fechaEmision) }}</span></div>
                    <div class="card-row"><span class="card-label">Base 10%</span><span>{{ formatCurrency(f.baseImponible10) }}</span></div>
                    <div class="card-row"><span class="card-label">IVA 10%</span><span>{{ formatCurrency(f.cuotaIva10) }}</span></div>
                    <div class="card-row"><span class="card-label">Base 21%</span><span>{{ formatCurrency(f.baseImponible21) }}</span></div>
                    <div class="card-row"><span class="card-label">IVA 21%</span><span>{{ formatCurrency(f.cuotaIva21) }}</span></div>
                  </div>
                  <div class="card-bottom">
                    <span class="card-total">{{ formatCurrency(f.total) }} EUR</span>
                    <div class="card-actions">
                      <button class="btn btn-ghost btn-sm" (click)="printTicket(f)" title="Imprimir ticket"><i class="fa-solid fa-print"></i></button>
                      <button class="btn btn-ghost btn-sm" [class.btn-disabled]="!f.idCliente" [disabled]="!f.idCliente || emailSending()" (click)="enviarEmail(f)" title="Enviar por email"><i class="fa-solid fa-envelope"></i></button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        } @else {
          <div class="facturas-grid">
            @for (f of filteredFacturas(); track f.id) {
              <div class="factura-card">
                <div class="card-top">
                  <span class="card-numero">{{ f.numeroFactura }}</span>
                  <app-status-badge [status]="f.estado" />
                </div>
                <div class="card-body">
                  <div class="card-row"><span class="card-label">Cliente</span><span>{{ getClienteNombre(f.idCliente) }}</span></div>
                  <div class="card-row"><span class="card-label">Sesion</span><span>{{ f.idSesion }}</span></div>
                  <div class="card-row"><span class="card-label">Fecha</span><span>{{ formatDate(f.fechaEmision) }}</span></div>
                  <div class="card-row"><span class="card-label">Base 10%</span><span>{{ formatCurrency(f.baseImponible10) }}</span></div>
                  <div class="card-row"><span class="card-label">IVA 10%</span><span>{{ formatCurrency(f.cuotaIva10) }}</span></div>
                  <div class="card-row"><span class="card-label">Base 21%</span><span>{{ formatCurrency(f.baseImponible21) }}</span></div>
                  <div class="card-row"><span class="card-label">IVA 21%</span><span>{{ formatCurrency(f.cuotaIva21) }}</span></div>
                </div>
                <div class="card-bottom">
                  <span class="card-total">{{ formatCurrency(f.total) }} EUR</span>
                  <div class="card-actions">
                    <button class="btn btn-ghost btn-sm" (click)="printTicket(f)" title="Imprimir ticket"><i class="fa-solid fa-print"></i></button>
                    <button class="btn btn-ghost btn-sm" [class.btn-disabled]="!f.idCliente" [disabled]="!f.idCliente || emailSending()" (click)="enviarEmail(f)" title="Enviar por email"><i class="fa-solid fa-envelope"></i></button>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="empty-state-grid"><i class="fa-solid fa-file-invoice empty-icon"></i><p>No se encontraron facturas</p></div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page-wrapper { padding: var(--spacing-xl); }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-lg); flex-wrap: wrap; gap: var(--spacing-md); }
    .header-left { display: flex; align-items: center; gap: var(--spacing-md); }
    .page-title { font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin: 0; }
    .record-count { font-size: 0.875rem; color: var(--text-muted); }
    .search-input { width: 260px; }

    .view-toggle { display: flex; border: 1px solid var(--card-border); border-radius: var(--radius-md); overflow: hidden; }
    .toggle-btn { padding: 0.375rem 0.75rem; font-size: 0.8rem; font-weight: 600; border: none; background: var(--card-bg); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 0.375rem; transition: all 0.15s; }
    .toggle-btn:not(:last-child) { border-right: 1px solid var(--card-border); }
    .toggle-btn:hover { background: var(--table-row-hover); }
    .toggle-btn.active { background: var(--primary-coral); color: white; }

    .filters-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-lg); flex-wrap: wrap; gap: var(--spacing-md); }
    .estado-filters { display: flex; gap: 0.5rem; }
    .filter-pill { padding: 0.375rem 1rem; border-radius: 9999px; border: 1px solid var(--input-border); background-color: var(--card-bg); color: var(--text-muted); font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .filter-pill:hover { border-color: var(--primary-coral); color: var(--primary-coral); }
    .filter-pill.active { background-color: var(--primary-coral); border-color: var(--primary-coral); color: var(--text-white); }

    .group-toggle { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--text-muted); cursor: pointer; user-select: none; }
    .group-toggle input[type="checkbox"] { width: 1rem; height: 1rem; accent-color: var(--primary-coral); cursor: pointer; }

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

    .day-row td { background: var(--table-header-bg); padding: 0.5rem 0.625rem !important; border-bottom: 2px solid var(--primary-coral); }
    .day-header { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0; margin-top: var(--spacing-md); border-bottom: 2px solid var(--primary-coral); }
    .day-label { font-size: 0.9rem; font-weight: 700; color: var(--text-main); }
    .day-count { font-size: 0.75rem; color: var(--text-muted); }
    .day-total { font-size: 0.8rem; font-weight: 600; color: var(--primary-coral); margin-left: auto; }

    .facturas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-bottom: var(--spacing-md); }
    .factura-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius-lg, 0.75rem); padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; transition: box-shadow 0.2s; }
    .factura-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .card-top { display: flex; align-items: center; justify-content: space-between; }
    .card-numero { font-size: 0.9rem; font-weight: 700; color: var(--text-main); }
    .card-body { display: flex; flex-direction: column; gap: 0.25rem; }
    .card-row { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-main); }
    .card-label { color: var(--text-muted); }
    .card-bottom { display: flex; align-items: center; justify-content: space-between; padding-top: 0.5rem; border-top: 1px solid var(--card-border); }
    .card-total { font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
    .card-actions { display: flex; gap: 0.375rem; }

    .empty-state { text-align: center; padding: 3rem 1rem !important; color: var(--text-muted); }
    .empty-state-grid { text-align: center; padding: 3rem 1rem; color: var(--text-muted); grid-column: 1 / -1; }
    .empty-icon { font-size: 2rem; margin-bottom: 0.5rem; display: block; opacity: 0.4; }

    @media (max-width: 768px) {
      .page-wrapper { padding: var(--spacing-md); }
      .page-header { flex-direction: column; align-items: flex-start; }
      .header-left { flex-wrap: wrap; }
      .search-input { width: 100%; }
      .filters-row { flex-direction: column; align-items: flex-start; }
      .facturas-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class FacturasListComponent implements OnInit {
  private facturaService = inject(FacturaService);
  private clienteService = inject(ClienteService);
  private comandaService = inject(ComandaService);
  private lineasService = inject(LineasComandaService);
  private productoService = inject(ProductoService);
  private toastService = inject(ToastService);

  facturas = signal<Factura[]>([]);
  clientes = signal<Cliente[]>([]);
  comandas = signal<Comanda[]>([]);
  lineas = signal<LineasComanda[]>([]);
  productos = signal<Producto[]>([]);
  searchTerm = signal('');
  estadoFilter = signal('');
  isLoading = signal(true);
  emailSending = signal(false);
  viewMode = signal<'list' | 'grid'>('list');
  groupByDay = signal(false);

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

  groupedFacturas = computed(() => {
    const list = this.filteredFacturas();
    const map = new Map<string, Factura[]>();
    for (const f of list) {
      const day = f.fechaEmision?.substring(0, 10) || 'sin-fecha';
      const group = map.get(day) || [];
      group.push(f);
      map.set(day, group);
    }
    return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
  });

  ngOnInit(): void {
    forkJoin({
      facturas: this.facturaService.getAll(),
      clientes: this.clienteService.getAll(),
      comandas: this.comandaService.getAll(),
      lineas: this.lineasService.getAll(),
      productos: this.productoService.getAll()
    }).subscribe({
      next: ({ facturas, clientes, comandas, lineas, productos }) => {
        this.facturas.set(facturas);
        this.clientes.set(clientes);
        this.comandas.set(comandas);
        this.lineas.set(lineas);
        this.productos.set(productos);
        this.isLoading.set(false);
      },
      error: () => { this.toastService.error('Error al cargar facturas'); this.isLoading.set(false); }
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

  getDayTotal(items: Factura[]): number {
    return items.reduce((sum, f) => sum + (f.total || 0), 0);
  }

  formatDayHeader(dateStr: string): string {
    if (!dateStr || dateStr === 'sin-fecha') return 'Sin fecha';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  private getTicketLines(f: Factura): { nombre: string; cantidad: number; precio: number; subtotal: number }[] {
    const sesionComandas = this.comandas().filter(c => c.idSesion === f.idSesion);
    const comandaIds = new Set(sesionComandas.map(c => c.id));
    const sesionLineas = this.lineas().filter(l => comandaIds.has(l.idComanda));

    const grouped = new Map<number, { nombre: string; cantidad: number; precio: number }>();
    for (const l of sesionLineas) {
      const prod = this.productos().find(p => p.id === l.idProducto);
      const nombre = prod?.nombre ?? `Producto #${l.idProducto}`;
      const precio = l.precioUnitarioHistorico ?? prod?.precio ?? 0;
      const existing = grouped.get(l.idProducto);
      if (existing) {
        existing.cantidad += l.cantidad;
      } else {
        grouped.set(l.idProducto, { nombre, cantidad: l.cantidad, precio });
      }
    }

    return Array.from(grouped.values()).map(g => ({
      ...g,
      subtotal: g.cantidad * g.precio
    }));
  }

  printTicket(f: Factura): void {
    const cliente = this.getClienteNombre(f.idCliente);
    const items = this.getTicketLines(f);

    let itemsHtml = '';
    if (items.length > 0) {
      itemsHtml += '<div class="line"></div>';
      itemsHtml += '<table><tr class="thead"><td>Ud</td><td>Producto</td><td class="r">Imp.</td></tr>';
      for (const item of items) {
        itemsHtml += `<tr><td>${item.cantidad}</td><td>${item.nombre}</td><td class="r">${this.formatCurrency(item.subtotal)}</td></tr>`;
      }
      itemsHtml += '</table>';
    }

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
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  table td { padding: 3px 2px; vertical-align: top; }
  .thead td { font-weight: bold; border-bottom: 1px solid #000; font-size: 10px; }
  .r { text-align: right; }
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
  ${itemsHtml}
  <div class="line"></div>
  ${f.baseImponible10 > 0 ? `<div class="row"><span>Base IVA 10%</span><span>${this.formatCurrency(f.baseImponible10)} EUR</span></div>
  <div class="row"><span>Cuota IVA 10%</span><span>${this.formatCurrency(f.cuotaIva10)} EUR</span></div>` : ''}
  ${f.baseImponible21 > 0 ? `<div class="row"><span>Base IVA 21%</span><span>${this.formatCurrency(f.baseImponible21)} EUR</span></div>
  <div class="row"><span>Cuota IVA 21%</span><span>${this.formatCurrency(f.cuotaIva21)} EUR</span></div>` : ''}
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
