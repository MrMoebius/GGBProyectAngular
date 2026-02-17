import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { forkJoin, from, concatMap } from 'rxjs';
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
  imports: [CommonModule, ReactiveFormsModule, FormsModule, StatusBadgeComponent, ConfirmModalComponent, BeerLoaderComponent],
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

      <!-- LUDOTECA -->
      @if (sesion()!.estado === 'ACTIVA') {
        <div class="ludoteca-bar">
          @if (ludotecaYaAplicada()) {
            <span class="ludo-applied"><i class="fa-solid fa-puzzle-piece"></i> Ludoteca aplicada</span>
          } @else {
            <label class="check-label" (click)="$event.stopPropagation()">
              <input type="checkbox" [checked]="showLudoteca()" (change)="showLudoteca.set(!showLudoteca())" />
              <span><i class="fa-solid fa-puzzle-piece"></i> Uso ludoteca</span>
            </label>

            @if (showLudoteca()) {
              <div class="ludo-selector">
                <span class="ludo-info">Comensales: {{ sesion()!.numComensales }} — Asignados: {{ ludoTotalAsignados() }}</span>
                <div class="ludo-rows">
                  @for (lp of ludotecaProductos(); track lp.id) {
                    <div class="ludo-row">
                      <span class="ludo-name">{{ lp.nombre }}</span>
                      <span class="ludo-price">{{ formatCurrency(lp.precio) }}</span>
                      <div class="ludo-counter">
                        <button class="btn-counter" (click)="decrementLudo(lp.id)" [disabled]="getLudoCount(lp.id) <= 0">-</button>
                        <span class="ludo-count">{{ getLudoCount(lp.id) }}</span>
                        <button class="btn-counter" (click)="incrementLudo(lp.id)" [disabled]="ludoTotalAsignados() >= sesion()!.numComensales!">+</button>
                      </div>
                    </div>
                  }
                </div>
                <button class="btn btn-primary btn-sm"
                  [disabled]="ludoTotalAsignados() !== sesion()!.numComensales || ludotecaAplicando()"
                  (click)="aplicarLudoteca()">
                  <i class="fa-solid fa-check"></i> Aplicar ({{ ludoTotalAsignados() }}/{{ sesion()!.numComensales }})
                </button>
              </div>
            }
          }
        </div>
      }

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
                      <span class="linea-name">
                        {{ getProductoNombre(linea.idProducto) }}
                        @if (linea.notasChef) {
                          <small class="linea-notes">{{ linea.notasChef }}</small>
                        }
                      </span>
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
            <div class="pago-form">
              <span class="pago-pendiente">{{ formatCurrency(pendiente()) }}</span>
              <select class="form-input pago-select" [(ngModel)]="pagoMetodo">
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="BIZUM">Bizum</option>
              </select>
              <button class="btn btn-primary btn-sm" [disabled]="pendiente() <= 0" (click)="registrarPago()">
                <i class="fa-solid fa-money-bill"></i> Pagar
              </button>
            </div>
          }
        </div>

        <!-- RESUMEN -->
        <div class="footer-section resumen-section">
          <h3 class="footer-title">Resumen</h3>
          <div class="resumen-lines">
            <div class="resumen-line">
              <span>Comandas</span>
              <span>{{ formatCurrency(totalComandas()) }}</span>
            </div>
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

      <!-- Customizer Modal -->
      @if (customizingProduct()) {
        <div class="customizer-overlay" (click)="closeCustomizer()">
          <div class="customizer-modal" (click)="$event.stopPropagation()">
            <div class="customizer-header">
              <div>
                <h2 class="customizer-title">{{ customizingProduct()!.nombre }}</h2>
                <span class="customizer-base-price">{{ formatCurrency(customizingProduct()!.precio) }}</span>
              </div>
              <button class="customizer-close" (click)="closeCustomizer()">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            @if (isVariantProduct(customizingProduct()!)) {
              <!-- Modo variante (Copazo) -->
              <div class="customizer-body">
                <div class="customizer-section">
                  <h3 class="cust-section-label"><i class="fa-solid fa-wine-bottle"></i> Elige destilado</h3>
                  <ul class="variant-list">
                    @for (option of variantOptions(); track option) {
                      <li class="variant-item" [class.selected]="selectedVariant() === option" (click)="selectedVariant.set(option)">
                        <span class="radio-custom" [class.checked]="selectedVariant() === option"></span>
                        <span>{{ option }}</span>
                      </li>
                    }
                  </ul>
                </div>
              </div>
              <div class="customizer-footer">
                <span class="customizer-total">{{ formatCurrency(customizingProduct()!.precio) }}</span>
                <button class="btn btn-primary btn-sm" [disabled]="!selectedVariant()" (click)="confirmVariant()">
                  <i class="fa-solid fa-plus"></i> Anadir a comanda
                </button>
              </div>
            } @else {
              <!-- Modo hamburguesa -->
              <div class="customizer-body">
                <div class="customizer-section">
                  <h3 class="cust-section-label"><i class="fa-solid fa-list-check"></i> Ingredientes</h3>
                  <p class="cust-section-hint">Desmarca los que no quiera el cliente</p>
                  <ul class="ingredient-list">
                    @for (ing of currentIngredients(); track ing) {
                      <li class="ingredient-item" [class.removed]="!ingredientStates()[ing]">
                        <label class="cust-check-label">
                          <input type="checkbox" [checked]="ingredientStates()[ing]" (change)="toggleIngredient(ing)" />
                          <span class="cust-check-custom"></span>
                          <span class="cust-check-text">{{ ing }}</span>
                        </label>
                      </li>
                    }
                  </ul>
                </div>

                @if (extras().length > 0) {
                  <div class="customizer-section">
                    <h3 class="cust-section-label"><i class="fa-solid fa-circle-plus"></i> Extras</h3>
                    <ul class="extras-list">
                      @for (extra of extras(); track extra.id) {
                        <li class="extra-item" [class.selected]="extraStates()[extra.id]">
                          <label class="cust-check-label">
                            <input type="checkbox" [checked]="extraStates()[extra.id]" (change)="toggleExtra(extra.id)" />
                            <span class="cust-check-custom"></span>
                            <span class="cust-check-text">{{ extra.nombre.replace('Extra ', '') }}</span>
                          </label>
                          <span class="extra-price">+{{ formatCurrency(extra.precio) }}</span>
                        </li>
                      }
                    </ul>
                  </div>
                }
              </div>
              <div class="customizer-footer">
                <span class="customizer-total">Total: {{ formatCurrency(customizedPrice()) }}</span>
                <button class="btn btn-primary btn-sm" (click)="confirmCustomized()">
                  <i class="fa-solid fa-plus"></i> Anadir a comanda
                </button>
              </div>
            }
          </div>
        </div>
      }
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

    /* LUDOTECA BAR */
    .ludoteca-bar { background-color: var(--card-bg); border: 1px solid var(--table-border); border-radius: var(--radius-md, 8px); padding: 0.75rem 1.25rem; display: flex; align-items: flex-start; gap: 1.25rem; flex-wrap: wrap; }
    .check-label { display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.875rem; color: var(--text-main); font-weight: 600; white-space: nowrap; }
    .check-label input[type="checkbox"] { width: 1rem; height: 1rem; cursor: pointer; accent-color: var(--primary-coral); }
    .ludo-selector { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .ludo-info { font-size: 0.8125rem; color: var(--text-muted); font-weight: 500; }
    .ludo-rows { display: flex; gap: 1rem; flex-wrap: wrap; }
    .ludo-row { display: flex; align-items: center; gap: 0.5rem; background-color: var(--bg-main); border: 1px solid var(--table-border); border-radius: var(--radius-md, 8px); padding: 0.375rem 0.75rem; }
    .ludo-name { font-size: 0.75rem; font-weight: 500; color: var(--text-main); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ludo-price { font-size: 0.75rem; font-weight: 700; color: var(--primary-coral); }
    .ludo-counter { display: flex; align-items: center; gap: 0.25rem; }
    .btn-counter { width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--input-border); background-color: var(--card-bg); color: var(--text-main); font-size: 0.875rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
    .btn-counter:hover:not(:disabled) { border-color: var(--primary-coral); color: var(--primary-coral); }
    .btn-counter:disabled { opacity: 0.3; cursor: not-allowed; }
    .ludo-count { font-size: 0.875rem; font-weight: 700; min-width: 1.25rem; text-align: center; color: var(--text-main); }
    .ludo-applied { font-size: 0.875rem; font-weight: 600; color: var(--success); display: flex; align-items: center; gap: 0.5rem; }

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
    .tpv-footer { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); }
    .footer-section { background-color: var(--card-bg); border: 1px solid var(--table-border); border-radius: var(--radius-md, 8px); padding: 1rem 1.25rem; }
    .footer-title { font-size: 0.875rem; font-weight: 700; color: var(--text-main); margin: 0 0 0.75rem 0; text-transform: uppercase; letter-spacing: 0.03em; }

    /* PAGOS */
    .pagos-list { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 0.75rem; }
    .pago-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; }
    .pago-amount { font-weight: 600; font-variant-numeric: tabular-nums; min-width: 70px; }
    .pago-form { display: flex; align-items: center; gap: 0.5rem; }
    .pago-pendiente { font-weight: 700; font-size: 0.9375rem; color: var(--text-main); font-variant-numeric: tabular-nums; min-width: 80px; }
    .pago-select { width: 110px; }
    .text-muted { color: var(--text-muted); font-size: 0.8125rem; margin: 0; }

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

    /* LINEA NOTES */
    .linea-notes { display: block; font-size: 0.6875rem; color: var(--text-muted); font-style: italic; line-height: 1.3; margin-top: 1px; }

    /* CUSTOMIZER MODAL */
    .customizer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1rem; animation: custFadeIn 0.2s ease-out; }
    @keyframes custFadeIn { from { opacity: 0; } to { opacity: 1; } }
    .customizer-modal { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius-lg, 1rem); width: 100%; max-width: 460px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; animation: custScaleIn 0.2s ease-out; }
    @keyframes custScaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .customizer-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 1rem 1.25rem; border-bottom: 1px solid var(--card-border); }
    .customizer-title { font-size: 1.125rem; font-weight: 700; color: var(--text-main); margin: 0 0 0.125rem 0; }
    .customizer-base-price { font-size: 0.8125rem; color: var(--text-muted); }
    .customizer-close { background: none; border: none; color: var(--text-muted); font-size: 1.125rem; cursor: pointer; padding: 0.25rem; }
    .customizer-close:hover { color: var(--text-main); }
    .customizer-body { flex: 1; overflow-y: auto; padding: 1rem 1.25rem; }
    .customizer-section { margin-bottom: 1.25rem; }
    .customizer-section:last-child { margin-bottom: 0; }
    .cust-section-label { font-size: 0.875rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem; margin: 0 0 0.25rem 0; }
    .cust-section-label i { color: var(--primary-coral); font-size: 0.8125rem; }
    .cust-section-hint { font-size: 0.75rem; color: var(--text-muted); margin: 0 0 0.625rem 0; }
    .ingredient-list, .extras-list, .variant-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.375rem; }
    .ingredient-item, .extra-item { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.625rem; border-radius: var(--radius-md, 8px); background: var(--secondary-bg); transition: background 0.2s, opacity 0.2s; }
    .ingredient-item.removed { opacity: 0.45; }
    .ingredient-item.removed .cust-check-text { text-decoration: line-through; }
    .extra-item.selected { background: rgba(239, 68, 68, 0.08); }
    .extra-price { font-size: 0.8125rem; font-weight: 600; color: var(--primary-coral); white-space: nowrap; }
    .cust-check-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; flex: 1; }
    .cust-check-label input[type="checkbox"] { display: none; }
    .cust-check-custom { width: 18px; height: 18px; min-width: 18px; border: 2px solid var(--text-muted); border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .cust-check-label input:checked + .cust-check-custom { background: var(--primary-coral); border-color: var(--primary-coral); }
    .cust-check-label input:checked + .cust-check-custom::after { content: ''; width: 5px; height: 9px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); margin-top: -2px; }
    .cust-check-text { font-size: 0.8125rem; color: var(--text-main); text-transform: capitalize; }
    .variant-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.625rem; border-radius: var(--radius-md, 8px); background: var(--secondary-bg); cursor: pointer; transition: background 0.2s, box-shadow 0.2s; }
    .variant-item:hover { background: rgba(255,127,80,0.08); }
    .variant-item.selected { background: rgba(255,127,80,0.1); box-shadow: inset 0 0 0 2px var(--primary-coral); }
    .radio-custom { width: 18px; height: 18px; min-width: 18px; border: 2px solid var(--text-muted); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .radio-custom.checked { border-color: var(--primary-coral); }
    .radio-custom.checked::after { content: ''; width: 9px; height: 9px; border-radius: 50%; background: var(--primary-coral); }
    .customizer-footer { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.25rem; border-top: 1px solid var(--card-border); }
    .customizer-total { font-size: 1rem; font-weight: 700; color: var(--text-main); }

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
    let list = this.productos().filter(p => p.activo && !p.nombre.toLowerCase().startsWith('extra '));
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

  totalGeneral = computed(() => this.totalComandas());

  pendiente = computed(() => Math.max(0, this.totalGeneral() - this.totalPagado()));

  pagoMetodo = 'EFECTIVO';

  // Ludoteca
  showLudoteca = signal(false);
  ludoCounts = signal<Record<number, number>>({});
  ludotecaAplicando = signal(false);

  ludotecaProductos = computed(() =>
    this.productos().filter(p => p.nombre.toLowerCase().includes('ludoteca'))
  );

  ludoTotalAsignados = computed(() =>
    Object.values(this.ludoCounts()).reduce((sum, n) => sum + n, 0)
  );

  ludotecaYaAplicada = computed(() => {
    const ludoIds = new Set(this.ludotecaProductos().map(p => p.id));
    return this.allLineas().some(l => ludoIds.has(l.idProducto));
  });

  // Customizer (hamburguesas / copazos)
  customizingProduct = signal<Producto | null>(null);
  ingredientStates = signal<Record<string, boolean>>({});
  extraStates = signal<Record<number, boolean>>({});
  selectedVariant = signal<string>('');

  extras = computed(() =>
    this.productos().filter(p => p.activo && p.nombre.toLowerCase().startsWith('extra '))
  );

  currentIngredients = computed(() => {
    const product = this.customizingProduct();
    if (!product?.descripcion) return [];
    return product.descripcion.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  });

  variantOptions = computed(() => {
    const product = this.customizingProduct();
    if (!product?.descripcion) return [];
    return product.descripcion.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  });

  customizedPrice = computed(() => {
    const product = this.customizingProduct();
    if (!product) return 0;
    const extrasTotal = this.extras()
      .filter(e => this.extraStates()[e.id])
      .reduce((sum, e) => sum + e.precio, 0);
    return product.precio + extrasTotal;
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
  isCustomizable(product: Producto): boolean {
    return product.categoria === 'COMIDA'
      && !!product.descripcion
      && product.descripcion.includes(',')
      && product.precio >= 10;
  }

  isVariantProduct(product: Producto): boolean {
    return product.categoria === 'ALCOHOL'
      && !!product.descripcion
      && product.descripcion.includes(',');
  }

  addProductoToComanda(producto: Producto): void {
    if (this.isVariantProduct(producto)) {
      this.openVariantSelector(producto);
      return;
    }
    if (this.isCustomizable(producto)) {
      this.openCustomizer(producto);
      return;
    }
    this.addSimpleProducto(producto);
  }

  private openCustomizer(product: Producto): void {
    this.customizingProduct.set(product);
    const ingredients = product.descripcion!.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    const ingStates: Record<string, boolean> = {};
    ingredients.forEach(ing => ingStates[ing] = true);
    this.ingredientStates.set(ingStates);
    const extStates: Record<number, boolean> = {};
    this.extras().forEach(e => extStates[e.id] = false);
    this.extraStates.set(extStates);
  }

  private openVariantSelector(product: Producto): void {
    this.customizingProduct.set(product);
    this.selectedVariant.set('');
  }

  closeCustomizer(): void {
    this.customizingProduct.set(null);
  }

  toggleIngredient(ingredient: string): void {
    this.ingredientStates.update(s => ({ ...s, [ingredient]: !s[ingredient] }));
  }

  toggleExtra(extraId: number): void {
    this.extraStates.update(s => ({ ...s, [extraId]: !s[extraId] }));
  }

  confirmCustomized(): void {
    const product = this.customizingProduct();
    if (!product) return;
    const removed = Object.entries(this.ingredientStates())
      .filter(([_, included]) => !included)
      .map(([name]) => name);
    const selectedExtras = this.extras().filter(e => this.extraStates()[e.id]);
    const notes = removed.length > 0 ? 'Sin: ' + removed.join(', ') : '';
    this.closeCustomizer();
    this.addCustomProducto(product, notes, selectedExtras);
  }

  confirmVariant(): void {
    const product = this.customizingProduct();
    const variant = this.selectedVariant();
    if (!product || !variant) return;
    this.closeCustomizer();
    this.addCustomProducto(product, variant, []);
  }

  private addSimpleProducto(producto: Producto): void {
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

  private addCustomProducto(product: Producto, notasChef: string, extras: Producto[]): void {
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
            this.addCustomLineas(cmd.id, product, notasChef, extras);
          },
          error: (err) => this.toastService.error(err?.error?.message || 'Error al crear comanda')
        });
        return;
      }
    }

    this.addCustomLineas(targetComandaId!, product, notasChef, extras);
  }

  private addCustomLineas(comandaId: number, product: Producto, notasChef: string, extras: Producto[]): void {
    this.lineasService.create({
      idComanda: comandaId,
      idProducto: product.id,
      cantidad: 1,
      precioUnitarioHistorico: product.precio,
      notasChef: notasChef || undefined
    } as any).subscribe({
      next: () => {
        if (extras.length === 0) {
          this.toastService.success(`${product.nombre} añadido`);
          this.refreshData();
          return;
        }
        from(extras).pipe(
          concatMap(extra => this.lineasService.create({
            idComanda: comandaId,
            idProducto: extra.id,
            cantidad: 1,
            precioUnitarioHistorico: extra.precio
          }))
        ).subscribe({
          complete: () => {
            this.toastService.success(`${product.nombre} + extras añadido`);
            this.refreshData();
          },
          error: (err) => this.toastService.error(err?.error?.message || 'Error al añadir extras')
        });
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Error al añadir producto')
    });
  }

  private addLineaToComanda(comandaId: number, producto: Producto): void {
    this.lineasService.create({
      idComanda: comandaId,
      idProducto: producto.id,
      cantidad: 1,
      precioUnitarioHistorico: producto.precio
    }).subscribe({
      next: () => { this.toastService.success(`${producto.nombre} añadido`); this.refreshData(); },
      error: (err) => {
        const fields = err?.error?.fields;
        if (fields) {
          const msgs = Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join(', ');
          this.toastService.error(msgs);
        } else {
          this.toastService.error(err?.error?.message || 'Error al añadir producto');
        }
      }
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
    const importe = this.pendiente();
    if (importe <= 0) return;
    this.pagosService.create({
      idSesion: this.sesionId,
      importe,
      metodoPago: this.pagoMetodo,
      estado: 'PAGADO',
      fechaHora: new Date().toISOString()
    } as any).subscribe({
      next: () => {
        this.toastService.success('Pago registrado');
        const todasResueltas = this.comandas().every(c =>
          c.estado === 'SERVIDA' || c.estado === 'CANCELADA' || c.estado === 'PAGADA'
        );
        if (todasResueltas && this.comandas().length > 0) {
          this.sesionService.cerrar(this.sesionId).subscribe({
            next: () => {
              this.toastService.success('Sesion cerrada y factura generada');
              this.goBack();
            },
            error: (err) => {
              const msg = err?.error?.message || err?.error || 'No se pudo cerrar automaticamente';
              this.toastService.show('Pago OK. ' + msg, 'info');
              this.refreshData();
            }
          });
        } else {
          this.refreshData();
        }
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Error al registrar pago')
    });
  }

  // LUDOTECA
  getLudoCount(productId: number): number {
    return this.ludoCounts()[productId] || 0;
  }

  incrementLudo(productId: number): void {
    this.ludoCounts.update(c => ({ ...c, [productId]: (c[productId] || 0) + 1 }));
  }

  decrementLudo(productId: number): void {
    this.ludoCounts.update(c => ({ ...c, [productId]: Math.max(0, (c[productId] || 0) - 1) }));
  }

  aplicarLudoteca(): void {
    if (this.ludotecaAplicando() || this.ludotecaYaAplicada()) return;
    const counts = this.ludoCounts();
    const entries = Object.entries(counts).filter(([_, qty]) => qty > 0);
    if (entries.length === 0) return;
    this.ludotecaAplicando.set(true);

    const pendientes = this.comandas().filter(c => c.estado === 'PENDIENTE');
    if (pendientes.length > 0) {
      this.addLudotecaLineas(pendientes[pendientes.length - 1].id, entries);
    } else {
      this.comandaService.create({ idSesion: this.sesionId, estado: 'PENDIENTE', total: 0 } as any).subscribe({
        next: (cmd) => {
          this.selectedComandaId.set(cmd.id);
          this.addLudotecaLineas(cmd.id, entries);
        },
        error: (err) => this.toastService.error(err?.error?.message || 'Error al crear comanda')
      });
    }
  }

  private addLudotecaLineas(comandaId: number, entries: [string, number][]): void {
    from(entries).pipe(
      concatMap(([prodId, qty]) => {
        const producto = this.productos().find(p => p.id === +prodId);
        return this.lineasService.create({
          idComanda: comandaId,
          idProducto: +prodId,
          cantidad: qty,
          precioUnitarioHistorico: producto?.precio ?? 0
        });
      })
    ).subscribe({
      complete: () => {
        const current = this.sesion()!;
        this.sesionService.update(this.sesionId, { ...current, usaLudoteca: true }).subscribe({
          next: (updated) => {
            this.sesion.set(updated);
            this.ludotecaAplicando.set(false);
            this.toastService.success('Accesos de ludoteca añadidos');
            this.showLudoteca.set(false);
            this.ludoCounts.set({});
            this.refreshData();
          },
          error: () => {
            this.ludotecaAplicando.set(false);
            this.toastService.success('Accesos de ludoteca añadidos');
            this.showLudoteca.set(false);
            this.ludoCounts.set({});
            this.refreshData();
          }
        });
      },
      error: (err) => {
        this.ludotecaAplicando.set(false);
        this.toastService.error(err?.error?.message || 'Error al añadir ludoteca');
      }
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
