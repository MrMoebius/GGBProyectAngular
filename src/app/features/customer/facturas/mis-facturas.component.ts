import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FacturaService } from '../../../core/services/factura.service';
import { ComandaService } from '../../../core/services/comanda.service';
import { LineasComandaService } from '../../../core/services/lineas-comanda.service';
import { ProductoService } from '../../../core/services/producto.service';
import { ToastService } from '../../../core/services/toast.service';
import { Factura } from '../../../core/models/factura.interface';
import { Comanda } from '../../../core/models/comanda.interface';
import { LineasComanda } from '../../../core/models/lineas-comanda.interface';
import { Producto } from '../../../core/models/producto.interface';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';
import { forkJoin } from 'rxjs';

interface FacturaLineDetail {
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

@Component({
  selector: 'app-mis-facturas',
  standalone: true,
  imports: [BeerLoaderComponent],
  template: `
    <app-beer-loader [isLoading]="isLoading()" />
    <div class="facturas-page">
      <div class="page-header">
        <h1 class="page-title"><i class="fa-solid fa-file-invoice"></i> Mis Facturas</h1>
        <p class="page-subtitle">Consulta tus facturas de Giber Games Bar</p>
      </div>

      <div class="tabs">
        @for (f of estadoFilters; track f.value) {
          <button class="tab" [class.tab-active]="estadoFilter() === f.value" (click)="estadoFilter.set(f.value)">
            {{ f.label }}
            @if (countByEstado(f.value) > 0) {
              <span class="tab-count">{{ countByEstado(f.value) }}</span>
            }
          </button>
        }
      </div>

      @if (filteredFacturas().length === 0) {
        <div class="empty-state">
          <i class="fa-solid fa-file-invoice empty-icon"></i>
          <p class="empty-title">No tienes facturas</p>
          <p class="empty-subtitle">Tus facturas apareceran aqui cuando se generen</p>
        </div>
      } @else {
        <div class="facturas-grid">
          @for (f of filteredFacturas(); track f.id) {
            <div class="factura-card" [class.expanded]="expandedId() === f.id" (click)="toggleExpand(f.id)">
              <div class="factura-header">
                <div class="factura-info">
                  <span class="factura-numero">{{ f.numeroFactura }}</span>
                  <span class="factura-fecha">{{ formatDate(f.fechaEmision) }}</span>
                </div>
                <div class="factura-right">
                  <span class="factura-total">{{ formatCurrency(f.total) }}</span>
                  <span class="factura-estado" [attr.data-estado]="f.estado">{{ f.estado }}</span>
                  <i class="fa-solid fa-chevron-down expand-icon"></i>
                </div>
              </div>

              @if (expandedId() === f.id) {
                <div class="factura-detail">
                  <!-- Productos consumidos -->
                  @if (loadingDetails()) {
                    <div class="detail-loading">
                      <i class="fa-solid fa-spinner fa-spin"></i> Cargando detalles...
                    </div>
                  } @else if (facturaLines().length > 0) {
                    <div class="productos-section">
                      <h4 class="detail-title">Productos consumidos</h4>
                      <div class="productos-list">
                        @for (line of facturaLines(); track line.productoNombre + line.cantidad) {
                          <div class="producto-row">
                            <div class="producto-info">
                              <span class="producto-nombre">{{ line.productoNombre }}</span>
                              <span class="producto-qty">x{{ line.cantidad }}</span>
                            </div>
                            <div class="producto-precios">
                              <span class="producto-unit">{{ formatCurrency(line.precioUnitario) }}/ud</span>
                              <span class="producto-subtotal">{{ formatCurrency(line.subtotal) }}</span>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <!-- Desglose IVA -->
                  <div class="detail-grid">
                    <div class="detail-section">
                      <h4 class="detail-title">IVA 10%</h4>
                      <div class="detail-row"><span>Base imponible</span><span>{{ formatCurrency(f.baseImponible10) }}</span></div>
                      <div class="detail-row"><span>Cuota IVA</span><span>{{ formatCurrency(f.cuotaIva10) }}</span></div>
                    </div>
                    <div class="detail-section">
                      <h4 class="detail-title">IVA 21%</h4>
                      <div class="detail-row"><span>Base imponible</span><span>{{ formatCurrency(f.baseImponible21) }}</span></div>
                      <div class="detail-row"><span>Cuota IVA</span><span>{{ formatCurrency(f.cuotaIva21) }}</span></div>
                    </div>
                  </div>
                  @if (f.importeLudoteca > 0) {
                    <div class="detail-row ludoteca-row"><span>Ludoteca</span><span>{{ formatCurrency(f.importeLudoteca) }}</span></div>
                  }
                  <div class="detail-totals">
                    <div class="detail-row total-row"><span>Total</span><span>{{ formatCurrency(f.total) }}</span></div>
                    <div class="detail-row"><span>Pagado</span><span>{{ formatCurrency(f.totalPagado) }}</span></div>
                    @if (f.total - f.totalPagado > 0.01) {
                      <div class="detail-row pending-row"><span>Pendiente</span><span>{{ formatCurrency(f.total - f.totalPagado) }}</span></div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .facturas-page { max-width: 900px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 0.75rem; margin: 0; }
    .page-title i { color: var(--neon-cyan, #00FFD1); }
    .page-subtitle { font-size: 0.875rem; color: var(--text-muted); margin: 0.25rem 0 0; }

    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .tab { padding: 0.5rem 1rem; border-radius: 9999px; border: 1px solid var(--card-border, rgba(255,255,255,0.08)); background: var(--card-bg, #1E293B); color: var(--text-muted); font-size: 0.8125rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; }
    .tab:hover { border-color: var(--neon-cyan, #00FFD1); color: var(--neon-cyan, #00FFD1); }
    .tab-active { background: var(--neon-cyan, #00FFD1); border-color: var(--neon-cyan, #00FFD1); color: #0F172A; font-weight: 600; }
    .tab-count { min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9999px; background: rgba(255,255,255,0.2); font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .tab-active .tab-count { background: rgba(0,0,0,0.2); }

    .empty-state { text-align: center; padding: 4rem 1rem; }
    .empty-icon { font-size: 3rem; color: var(--text-muted); opacity: 0.3; margin-bottom: 1rem; display: block; }
    .empty-title { font-size: 1.125rem; font-weight: 600; color: var(--text-main); margin: 0 0 0.25rem; }
    .empty-subtitle { font-size: 0.875rem; color: var(--text-muted); margin: 0; }

    /* Grid layout */
    .facturas-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }

    .factura-card { background: var(--card-bg, #1E293B); border: 1px solid var(--card-border, rgba(255,255,255,0.08)); border-radius: var(--radius-lg, 16px); cursor: pointer; transition: border-color 0.2s; overflow: hidden; }
    .factura-card:hover { border-color: var(--neon-cyan, #00FFD1); }
    .factura-card.expanded { border-color: var(--neon-cyan, #00FFD1); grid-column: 1 / -1; }

    .factura-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; }
    .factura-info { display: flex; flex-direction: column; gap: 0.25rem; }
    .factura-numero { font-weight: 700; font-size: 0.9375rem; color: var(--text-main); }
    .factura-fecha { font-size: 0.75rem; color: var(--text-muted); }
    .factura-right { display: flex; align-items: center; gap: 0.75rem; }
    .factura-total { font-weight: 700; font-size: 1rem; color: var(--neon-cyan, #00FFD1); font-variant-numeric: tabular-nums; }
    .factura-estado { font-size: 0.6875rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; }
    .factura-estado[data-estado="EMITIDA"] { background: rgba(250,204,21,0.15); color: #FACC15; }
    .factura-estado[data-estado="PAGADA"] { background: rgba(34,197,94,0.15); color: #22C55E; }
    .factura-estado[data-estado="ANULADA"] { background: rgba(239,68,68,0.15); color: #EF4444; }
    .expand-icon { font-size: 0.75rem; color: var(--text-muted); transition: transform 0.2s; }
    .factura-card.expanded .expand-icon { transform: rotate(180deg); }

    .factura-detail { padding: 0 1.25rem 1.25rem; border-top: 1px solid var(--card-border, rgba(255,255,255,0.08)); }

    /* Productos section */
    .productos-section { margin: 1rem 0; padding: 0.75rem; background: rgba(255,255,255,0.02); border-radius: var(--radius-md, 8px); border: 1px solid var(--card-border, rgba(255,255,255,0.05)); }
    .productos-list { display: flex; flex-direction: column; gap: 0.4rem; }
    .producto-row { display: flex; justify-content: space-between; align-items: center; padding: 0.35rem 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .producto-row:last-child { border-bottom: none; }
    .producto-info { display: flex; align-items: center; gap: 0.5rem; }
    .producto-nombre { font-size: 0.8125rem; font-weight: 500; color: var(--text-main); }
    .producto-qty { font-size: 0.75rem; color: var(--text-muted); background: rgba(255,255,255,0.06); padding: 0.1rem 0.4rem; border-radius: 4px; }
    .producto-precios { display: flex; align-items: center; gap: 0.75rem; }
    .producto-unit { font-size: 0.7rem; color: var(--text-muted); }
    .producto-subtotal { font-size: 0.8125rem; font-weight: 600; color: var(--text-main); font-variant-numeric: tabular-nums; }

    .detail-loading { text-align: center; padding: 1rem 0; color: var(--text-muted); font-size: 0.8125rem; }

    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
    .detail-section { padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: var(--radius-md, 8px); }
    .detail-title { font-size: 0.75rem; font-weight: 600; color: var(--neon-cyan, #00FFD1); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.5rem; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 0.3rem 0; font-size: 0.8125rem; }
    .detail-row span:first-child { color: var(--text-muted); }
    .detail-row span:last-child { color: var(--text-main); font-weight: 500; font-variant-numeric: tabular-nums; }
    .ludoteca-row { padding: 0.5rem 0.75rem; background: rgba(255,255,255,0.03); border-radius: var(--radius-md, 8px); margin-bottom: 0.75rem; }
    .detail-totals { border-top: 1px solid var(--card-border, rgba(255,255,255,0.08)); padding-top: 0.75rem; }
    .total-row span:last-child { font-weight: 700; font-size: 1rem; color: var(--neon-cyan, #00FFD1); }
    .pending-row span:last-child { color: #FACC15; }

    @media (max-width: 768px) {
      .facturas-grid { grid-template-columns: 1fr; }
      .detail-grid { grid-template-columns: 1fr; }
      .factura-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
      .factura-right { width: 100%; justify-content: space-between; }
    }
  `]
})
export class MisFacturasComponent implements OnInit {
  private facturaService = inject(FacturaService);
  private comandaService = inject(ComandaService);
  private lineasService = inject(LineasComandaService);
  private productoService = inject(ProductoService);
  private toastService = inject(ToastService);

  facturas = signal<Factura[]>([]);
  productos = signal<Producto[]>([]);
  estadoFilter = signal('');
  expandedId = signal<number | null>(null);
  isLoading = signal(true);
  loadingDetails = signal(false);
  facturaLines = signal<FacturaLineDetail[]>([]);

  estadoFilters = [
    { label: 'Todas', value: '' },
    { label: 'Emitidas', value: 'EMITIDA' },
    { label: 'Pagadas', value: 'PAGADA' },
    { label: 'Anuladas', value: 'ANULADA' }
  ];

  filteredFacturas = computed(() => {
    const estado = this.estadoFilter();
    if (!estado) return this.facturas();
    return this.facturas().filter(f => f.estado === estado);
  });

  ngOnInit(): void {
    this.facturaService.getMisFacturas().subscribe({
      next: (data) => { this.facturas.set(data); this.isLoading.set(false); },
      error: () => { this.toastService.error('Error al cargar facturas'); this.isLoading.set(false); }
    });

    this.productoService.getAll().subscribe({
      next: (data) => this.productos.set(data),
      error: () => {}
    });
  }

  countByEstado(estado: string): number {
    if (!estado) return this.facturas().length;
    return this.facturas().filter(f => f.estado === estado).length;
  }

  toggleExpand(id: number): void {
    if (this.expandedId() === id) {
      this.expandedId.set(null);
      this.facturaLines.set([]);
      return;
    }
    this.expandedId.set(id);
    this.loadFacturaDetails(id);
  }

  private loadFacturaDetails(facturaId: number): void {
    const factura = this.facturas().find(f => f.id === facturaId);
    if (!factura) return;

    this.loadingDetails.set(true);
    this.facturaLines.set([]);

    this.comandaService.getBySesionCliente(factura.idSesion).subscribe({
      next: (comandas) => {
        if (comandas.length === 0) {
          this.loadingDetails.set(false);
          return;
        }

        const lineRequests = comandas.map(c => this.lineasService.getByComanda(c.id));
        forkJoin(lineRequests).subscribe({
          next: (allLines) => {
            const flatLines = allLines.flat();
            const prods = this.productos();
            const details: FacturaLineDetail[] = flatLines.map(line => {
              const prod = prods.find(p => p.id === line.idProducto);
              return {
                productoNombre: prod?.nombre ?? `Producto #${line.idProducto}`,
                cantidad: line.cantidad,
                precioUnitario: line.precioUnitarioHistorico,
                subtotal: line.cantidad * line.precioUnitarioHistorico
              };
            });
            this.facturaLines.set(details);
            this.loadingDetails.set(false);
          },
          error: () => {
            this.loadingDetails.set(false);
          }
        });
      },
      error: () => {
        this.loadingDetails.set(false);
      }
    });
  }

  formatDate(iso: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatCurrency(v: number): string {
    if (v == null) return '0,00 \u20AC';
    return v.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' \u20AC';
  }
}
