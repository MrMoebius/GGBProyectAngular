import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SesionMesaService } from '../../../core/services/sesion-mesa.service';
import { MesaService } from '../../../core/services/mesa.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ComandaService } from '../../../core/services/comanda.service';
import { LineasComandaService } from '../../../core/services/lineas-comanda.service';
import { PagosMesaService } from '../../../core/services/pagos-mesa.service';
import { LudotecaSesionesService } from '../../../core/services/ludoteca-sesiones.service';
import { ProductoService } from '../../../core/services/producto.service';
import { ToastService } from '../../../core/services/toast.service';
import { SesionMesa } from '../../../core/models/sesion-mesa.interface';
import { Mesa } from '../../../core/models/mesa.interface';
import { Cliente } from '../../../core/models/cliente.interface';
import { Comanda } from '../../../core/models/comanda.interface';
import { LineasComanda } from '../../../core/models/lineas-comanda.interface';
import { PagosMesa } from '../../../core/models/pagos-mesa.interface';
import { LudotecaSesiones } from '../../../core/models/ludoteca-sesiones.interface';
import { Producto } from '../../../core/models/producto.interface';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-sesion-mesa-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgeComponent, ConfirmModalComponent, BeerLoaderComponent],
  template: `
    <app-beer-loader [isLoading]="isLoading()" />
    @if (!isLoading() && sesion()) {
    <div class="tpv-wrapper">
      <!-- CABECERA -->
      <div class="tpv-header">
        <div class="header-info">
          <button class="btn btn-ghost btn-sm" (click)="goBack()">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <h1 class="session-title">
            Mesa {{ mesa()?.nombreMesa || sesion()!.idMesa }}
            <span class="session-zone">{{ mesa()?.zona }}</span>
          </h1>
          <app-status-badge [status]="sesion()!.estado" />
          @if (cliente()) {
            <span class="header-detail"><i class="fa-solid fa-user"></i> {{ cliente()!.nombre }}</span>
          }
          <span class="header-detail"><i class="fa-solid fa-users"></i> {{ sesion()!.numComensales ?? '-' }} pax</span>
          <span class="header-detail"><i class="fa-solid fa-clock"></i> {{ formatDateTime(sesion()!.fechaHoraApertura) }}</span>
        </div>
        @if (sesion()!.estado === 'ACTIVA') {
          <button class="btn btn-danger" (click)="showCerrarModal.set(true)">
            <i class="fa-solid fa-door-closed"></i> Cerrar Sesion
          </button>
        }
      </div>

      <!-- CUERPO PRINCIPAL -->
      <div class="tpv-body">
        <!-- COLUMNA IZQUIERDA: COMANDAS -->
        <div class="tpv-col-left">
          <div class="section-header">
            <h2 class="section-title">Comandas</h2>
            @if (sesion()!.estado === 'ACTIVA') {
              <button class="btn btn-primary btn-sm" (click)="crearComanda()">
                <i class="fa-solid fa-plus"></i> Nueva Comanda
              </button>
            }
          </div>

          <div class="comandas-list">
            @for (cmd of comandas(); track cmd.id) {
              <div class="comanda-card" [class.comanda-selected]="selectedComandaId() === cmd.id" (click)="selectedComandaId.set(cmd.id)">
                <div class="comanda-header">
                  <span class="comanda-id">Comanda #{{ cmd.id }}</span>
                  <app-status-badge [status]="cmd.estado" />
                </div>

                <!-- Lineas -->
                <div class="comanda-lineas">
                  @for (linea of getLineasForComanda(cmd.id); track linea.id) {
                    <div class="linea-item">
                      <span class="linea-qty">{{ linea.cantidad }}x</span>
                      <span class="linea-name">{{ getProductoNombre(linea.idProducto) }}</span>
                      <span class="linea-price">{{ formatCurrency(linea.precioUnitarioHistorico * linea.cantidad) }}</span>
                      @if (sesion()!.estado === 'ACTIVA' && (cmd.estado === 'PENDIENTE')) {
                        <button class="btn-icon-sm" (click)="eliminarLinea(linea.id, cmd.id); $event.stopPropagation()">
                          <i class="fa-solid fa-xmark"></i>
                        </button>
                      }
                    </div>
                  } @empty {
                    <p class="lineas-empty">Sin productos</p>
                  }
                </div>

                <div class="comanda-footer">
                  <span class="comanda-total">Total: {{ formatCurrency(cmd.total) }}</span>
                  <div class="comanda-actions" (click)="$event.stopPropagation()">
                    @if (cmd.estado === 'PENDIENTE') {
                      <button class="btn btn-sm btn-success" (click)="confirmarComanda(cmd.id)">Confirmar</button>
                      <button class="btn btn-sm btn-outline-danger" (click)="cancelarComanda(cmd.id)">Cancelar</button>
                    }
                    @if (cmd.estado === 'CONFIRMADA') {
                      <button class="btn btn-sm btn-warning" (click)="prepararComanda(cmd.id)">Preparar</button>
                      <button class="btn btn-sm btn-outline-danger" (click)="cancelarComanda(cmd.id)">Cancelar</button>
                    }
                    @if (cmd.estado === 'PREPARACION') {
                      <button class="btn btn-sm btn-success" (click)="servirComanda(cmd.id)">Servir</button>
                    }
                  </div>
                </div>
              </div>
            } @empty {
              <div class="empty-section">
                <i class="fa-solid fa-receipt"></i>
                <p>No hay comandas</p>
              </div>
            }
          </div>
        </div>

        <!-- COLUMNA DERECHA: PRODUCTOS -->
        @if (sesion()!.estado === 'ACTIVA') {
        <div class="tpv-col-right">
          <div class="section-header">
            <h2 class="section-title">Productos</h2>
          </div>

          <div class="productos-search">
            <input
              type="text"
              class="form-input"
              placeholder="Buscar producto..."
              [value]="productoSearch()"
              (input)="productoSearch.set($any($event.target).value)"
            />
          </div>

          <div class="category-filters">
            @for (cat of categorias; track cat.value) {
              <button
                class="filter-pill"
                [class.active]="categoriaFilter() === cat.value"
                (click)="categoriaFilter.set(cat.value)"
              >
                {{ cat.label }}
              </button>
            }
          </div>

          <div class="productos-grid">
            @for (p of filteredProductos(); track p.id) {
              <div class="producto-card" (click)="addProductoToComanda(p)">
                <span class="producto-name">{{ p.nombre }}</span>
                <span class="producto-price">{{ formatCurrency(p.precio) }}</span>
                <span class="producto-cat">{{ p.categoria }}</span>
                <button class="btn-add">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
            } @empty {
              <p class="empty-productos">No se encontraron productos</p>
            }
          </div>
        </div>
        }
      </div>

      <!-- ZONA INFERIOR: PAGOS + RESUMEN + LUDOTECA -->
      <div class="tpv-footer">
        <!-- PAGOS -->
        <div class="footer-section">
          <h3 class="footer-title">Pagos</h3>
          <div class="pagos-list">
            @for (pago of pagos(); track pago.id) {
              <div class="pago-item">
                <span class="pago-amount">{{ formatCurrency(pago.importe) }}</span>
                <app-status-badge [status]="pago.metodoPago" />
                <app-status-badge [status]="pago.estado" />
              </div>
            } @empty {
              <p class="text-muted">Sin pagos registrados</p>
            }
          </div>

          @if (sesion()!.estado === 'ACTIVA') {
            <form class="pago-form" [formGroup]="pagoForm" (ngSubmit)="registrarPago()">
              <input type="number" class="form-input pago-input" formControlName="importe" placeholder="Importe" min="0" step="0.01" />
              <select class="form-input pago-select" formControlName="metodoPago">
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="BIZUM">Bizum</option>
              </select>
              <button type="submit" class="btn btn-primary btn-sm" [disabled]="pagoForm.invalid">
                <i class="fa-solid fa-money-bill"></i> Pagar
              </button>
            </form>
          }
        </div>

        <!-- LUDOTECA -->
        @if (sesion()!.usaLudoteca && ludoteca()) {
          <div class="footer-section">
            <h3 class="footer-title">Ludoteca</h3>
            <form class="ludoteca-form" [formGroup]="ludotecaForm" (ngSubmit)="actualizarLudoteca()">
              <div class="ludoteca-fields">
                <div class="ludo-field">
                  <label>Adultos</label>
                  <input type="number" class="form-input" formControlName="numAdultos" min="0" />
                </div>
                <div class="ludo-field">
                  <label>6-13</label>
                  <input type="number" class="form-input" formControlName="numNinos613" min="0" />
                </div>
                <div class="ludo-field">
                  <label>0-5</label>
                  <input type="number" class="form-input" formControlName="numNinos05" min="0" />
                </div>
              </div>
              <div class="ludo-footer">
                <span class="ludo-total">Importe: {{ formatCurrency(ludoteca()!.importeTotal) }}</span>
                @if (sesion()!.estado === 'ACTIVA') {
                  <button type="submit" class="btn btn-sm btn-primary">Actualizar</button>
                }
              </div>
            </form>
          </div>
        }

        <!-- RESUMEN -->
        <div class="footer-section resumen-section">
          <h3 class="footer-title">Resumen</h3>
          <div class="resumen-lines">
            <div class="resumen-line">
              <span>Comandas</span>
              <span>{{ formatCurrency(totalComandas()) }}</span>
            </div>
            @if (sesion()!.usaLudoteca && ludoteca()) {
              <div class="resumen-line">
                <span>Ludoteca</span>
                <span>{{ formatCurrency(ludoteca()!.importeTotal) }}</span>
              </div>
            }
            <div class="resumen-line resumen-total">
              <span>TOTAL</span>
              <span>{{ formatCurrency(totalGeneral()) }}</span>
            </div>
            <div class="resumen-line resumen-paid">
              <span>Pagado</span>
              <span>{{ formatCurrency(totalPagado()) }}</span>
            </div>
            <div class="resumen-line" [class.resumen-pending]="pendiente() > 0">
              <span>Pendiente</span>
              <span>{{ formatCurrency(pendiente()) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirm Cerrar -->
      <app-confirm-modal
        [isOpen]="showCerrarModal()"
        title="Cerrar Sesion"
        message="Se verificaran pagos y comandas. Si todo esta correcto, se generara la factura automaticamente."
        (onConfirm)="cerrarSesion()"
        (onCancel)="showCerrarModal.set(false)"
      />
    </div>
    }
  `,
  styles: [`
    .tpv-wrapper { padding: var(--spacing-lg); display: flex; flex-direction: column; gap: var(--spacing-lg); }

    /* HEADER */
    .tpv-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; background-color: var(--card-bg); border: 1px solid var(--table-border); border-radius: var(--radius-md, 8px); flex-wrap: wrap; gap: var(--spacing-sm); }
    .header-info { display: flex; align-items: center; gap: var(--spacing-md); flex-wrap: wrap; }
    .session-title { font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin: 0; }
    .session-zone { font-size: 0.875rem; font-weight: 400; color: var(--text-muted); }
    .header-detail { font-size: 0.8125rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem; }

    /* BODY */
    .tpv-body { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); min-height: 400px; }
    .tpv-col-left, .tpv-col-right { display: flex; flex-direction: column; gap: var(--spacing-sm); }
    .section-header { display: flex; align-items: center; justify-content: space-between; }
    .section-title { font-size: 1rem; font-weight: 700; color: var(--text-main); margin: 0; }

    /* COMANDAS */
    .comandas-list { display: flex; flex-direction: column; gap: 0.75rem; overflow-y: auto; max-height: 600px; padding-right: 0.25rem; }
    .comanda-card { background-color: var(--card-bg); border: 1px solid var(--table-border); border-radius: var(--radius-md, 8px); padding: 0.75rem 1rem; cursor: pointer; transition: border-color 0.2s; }
    .comanda-card:hover { border-color: var(--primary-coral); }
    .comanda-selected { border-color: var(--primary-coral); box-shadow: 0 0 0 1px var(--primary-coral); }
    .comanda-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
    .comanda-id { font-weight: 600; font-size: 0.875rem; color: var(--text-main); }
    .comanda-lineas { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.5rem; }
    .linea-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--text-main); padding: 0.2rem 0; }
    .linea-qty { font-weight: 600; min-width: 2rem; color: var(--text-muted); }
    .linea-name { flex: 1; }
    .linea-price { font-weight: 500; font-variant-numeric: tabular-nums; }
    .btn-icon-sm { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.15rem; font-size: 0.75rem; border-radius: 4px; }
    .btn-icon-sm:hover { color: var(--danger); background-color: var(--danger-bg); }
    .lineas-empty { font-size: 0.8125rem; color: var(--text-muted); margin: 0.25rem 0; font-style: italic; }
    .comanda-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--table-border); padding-top: 0.5rem; }
    .comanda-total { font-weight: 700; font-size: 0.875rem; color: var(--text-main); font-variant-numeric: tabular-nums; }
    .comanda-actions { display: flex; gap: 0.375rem; }

    /* PRODUCTOS */
    .productos-search { margin-bottom: 0.5rem; }
    .category-filters { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-bottom: 0.75rem; }
    .filter-pill { padding: 0.25rem 0.75rem; border-radius: 9999px; border: 1px solid var(--input-border); background-color: var(--card-bg); color: var(--text-muted); font-size: 0.75rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .filter-pill:hover { border-color: var(--primary-coral); color: var(--primary-coral); }
    .filter-pill.active { background-color: var(--primary-coral); border-color: var(--primary-coral); color: var(--text-white); }
    .productos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.5rem; overflow-y: auto; max-height: 480px; padding-right: 0.25rem; }
    .producto-card { background-color: var(--card-bg); border: 1px solid var(--table-border); border-radius: var(--radius-md, 8px); padding: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; cursor: pointer; transition: border-color 0.2s, transform 0.15s; position: relative; }
    .producto-card:hover { border-color: var(--primary-coral); transform: translateY(-1px); }
    .producto-name { font-weight: 600; font-size: 0.8125rem; color: var(--text-main); line-height: 1.3; }
    .producto-price { font-weight: 700; font-size: 0.875rem; color: var(--primary-coral); }
    .producto-cat { font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; }
    .btn-add { position: absolute; top: 0.5rem; right: 0.5rem; width: 24px; height: 24px; border-radius: 50%; border: none; background-color: var(--primary-coral); color: #fff; font-size: 0.7rem; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
    .producto-card:hover .btn-add { opacity: 1; }
    .empty-productos { color: var(--text-muted); font-size: 0.875rem; grid-column: 1 / -1; text-align: center; padding: 2rem 0; }

    /* FOOTER */
    .tpv-footer { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--spacing-lg); }
    .footer-section { background-color: var(--card-bg); border: 1px solid var(--table-border); border-radius: var(--radius-md, 8px); padding: 1rem 1.25rem; }
    .footer-title { font-size: 0.875rem; font-weight: 700; color: var(--text-main); margin: 0 0 0.75rem 0; text-transform: uppercase; letter-spacing: 0.03em; }

    /* PAGOS */
    .pagos-list { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 0.75rem; }
    .pago-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; }
    .pago-amount { font-weight: 600; font-variant-numeric: tabular-nums; min-width: 70px; }
    .pago-form { display: flex; align-items: center; gap: 0.5rem; }
    .pago-input { width: 90px; }
    .pago-select { width: 110px; }
    .text-muted { color: var(--text-muted); font-size: 0.8125rem; margin: 0; }

    /* LUDOTECA */
    .ludoteca-form { display: flex; flex-direction: column; gap: 0.5rem; }
    .ludoteca-fields { display: flex; gap: 0.75rem; }
    .ludo-field { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }
    .ludo-field label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
    .ludo-field input { width: 100%; }
    .ludo-footer { display: flex; align-items: center; justify-content: space-between; }
    .ludo-total { font-weight: 700; font-size: 0.875rem; color: var(--text-main); }

    /* RESUMEN */
    .resumen-section { background-color: var(--card-bg); }
    .resumen-lines { display: flex; flex-direction: column; gap: 0.375rem; }
    .resumen-line { display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--text-main); }
    .resumen-total { font-weight: 800; font-size: 1rem; border-top: 2px solid var(--table-border); padding-top: 0.5rem; margin-top: 0.25rem; }
    .resumen-paid { color: var(--success); font-weight: 600; }
    .resumen-pending { color: var(--danger); font-weight: 700; }

    .empty-section { text-align: center; padding: 2rem 1rem; color: var(--text-muted); }
    .empty-section i { font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.4; display: block; }

    .btn-success { background-color: var(--success); color: #fff; border: none; }
    .btn-success:hover { opacity: 0.9; }
    .btn-warning { background-color: var(--warning); color: #000; border: none; }
    .btn-warning:hover { opacity: 0.9; }
    .btn-outline-danger { background: transparent; color: var(--danger); border: 1px solid var(--danger); }
    .btn-outline-danger:hover { background-color: var(--danger); color: #fff; }

    @media (max-width: 1024px) {
      .tpv-body { grid-template-columns: 1fr; }
      .tpv-footer { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .tpv-wrapper { padding: var(--spacing-md); }
      .tpv-header { flex-direction: column; align-items: flex-start; }
      .productos-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
    }
  `]
})
export class SesionMesaDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sesionService = inject(SesionMesaService);
  private mesaService = inject(MesaService);
  private clienteService = inject(ClienteService);
  private comandaService = inject(ComandaService);
  private lineasService = inject(LineasComandaService);
  private pagosService = inject(PagosMesaService);
  private ludotecaService = inject(LudotecaSesionesService);
  private productoService = inject(ProductoService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  sesion = signal<SesionMesa | null>(null);
  mesa = signal<Mesa | null>(null);
  cliente = signal<Cliente | null>(null);
  comandas = signal<Comanda[]>([]);
  allLineas = signal<LineasComanda[]>([]);
  pagos = signal<PagosMesa[]>([]);
  ludoteca = signal<LudotecaSesiones | null>(null);
  productos = signal<Producto[]>([]);
  isLoading = signal(true);
  showCerrarModal = signal(false);
  selectedComandaId = signal<number | null>(null);
  productoSearch = signal('');
  categoriaFilter = signal('');

  categorias = [
    { label: 'Todas', value: '' },
    { label: 'Comida', value: 'COMIDA' },
    { label: 'Bebida', value: 'BEBIDA' },
    { label: 'Alcohol', value: 'ALCOHOL' },
    { label: 'Postre', value: 'POSTRE' },
    { label: 'Servicio', value: 'SERVICIO' }
  ];

  filteredProductos = computed(() => {
    const term = this.productoSearch().toLowerCase();
    const cat = this.categoriaFilter();
    let list = this.productos().filter(p => p.activo);
    if (cat) list = list.filter(p => p.categoria === cat);
    if (term) list = list.filter(p => p.nombre.toLowerCase().includes(term));
    return list;
  });

  totalComandas = computed(() => {
    return this.comandas()
      .filter(c => c.estado !== 'CANCELADA')
      .reduce((sum, c) => sum + (c.total || 0), 0);
  });

  totalPagado = computed(() => {
    return this.pagos()
      .filter(p => p.estado === 'PAGADO')
      .reduce((sum, p) => sum + (p.importe || 0), 0);
  });

  totalGeneral = computed(() => {
    let total = this.totalComandas();
    if (this.ludoteca()?.importeTotal) total += this.ludoteca()!.importeTotal;
    return total;
  });

  pendiente = computed(() => Math.max(0, this.totalGeneral() - this.totalPagado()));

  pagoForm = this.fb.group({
    importe: [0 as number, [Validators.required, Validators.min(0.01)]],
    metodoPago: ['EFECTIVO']
  });

  ludotecaForm = this.fb.group({
    numAdultos: [0],
    numNinos613: [0],
    numNinos05: [0]
  });

  private sesionId!: number;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.sesionId = Number(idParam);
      this.loadAll();
    }
  }

  loadAll(): void {
    this.sesionService.getById(this.sesionId).subscribe({
      next: (sesion) => {
        this.sesion.set(sesion);
        this.loadRelated(sesion);
        this.loadProductos();
      },
      error: () => {
        this.toastService.error('Error al cargar la sesion');
        this.isLoading.set(false);
      }
    });
  }

  private loadRelated(sesion: SesionMesa): void {
    this.mesaService.getById(sesion.idMesa).subscribe({
      next: (m) => this.mesa.set(m),
      error: () => {}
    });

    if (sesion.idCliente) {
      this.clienteService.getById(sesion.idCliente).subscribe({
        next: (c) => this.cliente.set(c),
        error: () => {}
      });
    }

    this.refreshData();
  }

  private loadProductos(): void {
    this.productoService.getAll().subscribe({
      next: (data) => this.productos.set(data),
      error: () => {}
    });
  }

  refreshData(): void {
    forkJoin({
      comandas: this.comandaService.getAll(),
      lineas: this.lineasService.getAll(),
      pagos: this.pagosService.getAll(),
      ludotecas: this.ludotecaService.getAll()
    }).subscribe({
      next: ({ comandas, lineas, pagos, ludotecas }) => {
        this.comandas.set(comandas.filter(c => c.idSesion === this.sesionId));
        const comandaIds = new Set(this.comandas().map(c => c.id));
        this.allLineas.set(lineas.filter(l => comandaIds.has(l.idComanda)));
        this.pagos.set(pagos.filter(p => p.idSesion === this.sesionId));
        const ludo = ludotecas.find(l => l.idSesion === this.sesionId);
        this.ludoteca.set(ludo || null);
        if (ludo) {
          this.ludotecaForm.patchValue({
            numAdultos: ludo.numAdultos,
            numNinos613: ludo.numNinos613,
            numNinos05: ludo.numNinos05
          });
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error al cargar datos de la sesion');
        this.isLoading.set(false);
      }
    });
  }

  getLineasForComanda(comandaId: number): LineasComanda[] {
    return this.allLineas().filter(l => l.idComanda === comandaId);
  }

  getProductoNombre(idProducto: number): string {
    return this.productos().find(p => p.id === idProducto)?.nombre ?? `Producto ${idProducto}`;
  }

  // COMANDAS
  crearComanda(): void {
    this.comandaService.create({ idSesion: this.sesionId, estado: 'PENDIENTE', total: 0 } as any).subscribe({
      next: (cmd) => {
        this.toastService.success('Comanda creada');
        this.selectedComandaId.set(cmd.id);
        this.refreshData();
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Error al crear comanda')
    });
  }

  confirmarComanda(id: number): void {
    this.comandaService.confirmar(id).subscribe({
      next: () => { this.toastService.success('Comanda confirmada'); this.refreshData(); },
      error: (err) => this.toastService.error(err?.error?.message || 'Error')
    });
  }

  prepararComanda(id: number): void {
    this.comandaService.preparar(id).subscribe({
      next: () => { this.toastService.success('Comanda en preparacion'); this.refreshData(); },
      error: (err) => this.toastService.error(err?.error?.message || 'Error')
    });
  }

  servirComanda(id: number): void {
    this.comandaService.servir(id).subscribe({
      next: () => { this.toastService.success('Comanda servida'); this.refreshData(); },
      error: (err) => this.toastService.error(err?.error?.message || 'Error')
    });
  }

  cancelarComanda(id: number): void {
    this.comandaService.cancelar(id).subscribe({
      next: () => { this.toastService.success('Comanda cancelada'); this.refreshData(); },
      error: (err) => this.toastService.error(err?.error?.message || 'Error')
    });
  }

  // LINEAS
  addProductoToComanda(producto: Producto): void {
    let targetComandaId = this.selectedComandaId();
    const pendientes = this.comandas().filter(c => c.estado === 'PENDIENTE');

    if (!targetComandaId || !pendientes.find(c => c.id === targetComandaId)) {
      if (pendientes.length > 0) {
        targetComandaId = pendientes[pendientes.length - 1].id;
        this.selectedComandaId.set(targetComandaId);
      } else {
        this.comandaService.create({ idSesion: this.sesionId, estado: 'PENDIENTE', total: 0 } as any).subscribe({
          next: (cmd) => {
            this.selectedComandaId.set(cmd.id);
            this.addLineaToComanda(cmd.id, producto);
          },
          error: (err) => this.toastService.error(err?.error?.message || 'Error al crear comanda')
        });
        return;
      }
    }

    this.addLineaToComanda(targetComandaId!, producto);
  }

  private addLineaToComanda(comandaId: number, producto: Producto): void {
    this.lineasService.create({
      idComanda: comandaId,
      idProducto: producto.id,
      cantidad: 1,
      precioUnitarioHistorico: producto.precio
    }).subscribe({
      next: () => { this.toastService.success(`${producto.nombre} añadido`); this.refreshData(); },
      error: (err) => this.toastService.error(err?.error?.message || 'Error al añadir producto')
    });
  }

  eliminarLinea(lineaId: number, comandaId: number): void {
    this.lineasService.delete(lineaId).subscribe({
      next: () => { this.refreshData(); },
      error: (err) => this.toastService.error(err?.error?.message || 'Error al eliminar linea')
    });
  }

  // PAGOS
  registrarPago(): void {
    if (this.pagoForm.invalid) return;
    const raw = this.pagoForm.getRawValue();
    this.pagosService.create({
      idSesion: this.sesionId,
      importe: raw.importe,
      metodoPago: raw.metodoPago
    } as any).subscribe({
      next: () => {
        this.toastService.success('Pago registrado');
        this.pagoForm.patchValue({ importe: 0 });
        this.refreshData();
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Error al registrar pago')
    });
  }

  // LUDOTECA
  actualizarLudoteca(): void {
    const ludo = this.ludoteca();
    if (!ludo) return;
    const raw = this.ludotecaForm.getRawValue();
    this.ludotecaService.update(ludo.id, {
      idSesion: this.sesionId,
      numAdultos: raw.numAdultos!,
      numNinos613: raw.numNinos613!,
      numNinos05: raw.numNinos05!
    } as any).subscribe({
      next: () => { this.toastService.success('Ludoteca actualizada'); this.refreshData(); },
      error: (err) => this.toastService.error(err?.error?.message || 'Error al actualizar ludoteca')
    });
  }

  // CERRAR
  cerrarSesion(): void {
    this.sesionService.cerrar(this.sesionId).subscribe({
      next: () => {
        this.toastService.success('Sesion cerrada y factura generada');
        this.showCerrarModal.set(false);
        this.goBack();
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error || 'Error al cerrar sesion';
        this.toastService.error(msg);
        this.showCerrarModal.set(false);
      }
    });
  }

  goBack(): void {
    const currentUrl = this.router.url;
    const base = currentUrl.startsWith('/staff') ? '/staff' : '/admin';
    this.router.navigate([`${base}/sesiones-mesa`]);
  }

  formatDateTime(iso: string): string {
    if (!iso) return '-';
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return iso;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  }

  formatCurrency(value: number): string {
    if (value == null) return '0,00 €';
    return value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }
}
