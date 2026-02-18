import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { from, concatMap, forkJoin } from 'rxjs';
import { SesionMesaService } from '../../../core/services/sesion-mesa.service';
import { ComandaService } from '../../../core/services/comanda.service';
import { LineasComandaService } from '../../../core/services/lineas-comanda.service';
import { ProductoService } from '../../../core/services/producto.service';
import { ToastService } from '../../../core/services/toast.service';
import { SesionMesa } from '../../../core/models/sesion-mesa.interface';
import { Comanda } from '../../../core/models/comanda.interface';
import { LineasComanda } from '../../../core/models/lineas-comanda.interface';
import { Producto } from '../../../core/models/producto.interface';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-customer-session',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, BeerLoaderComponent],
  template: `
    <app-beer-loader [isLoading]="isLoading()" />

    @if (!isLoading() && !sesion()) {
      <div class="no-session">
        <i class="fa-solid fa-couch"></i>
        <h2>No tienes sesion activa</h2>
        <p>Cuando el staff te asigne una mesa, podras gestionar tus pedidos desde aqui.</p>
        <button class="btn btn-primary" (click)="router.navigate(['/customer/dashboard'])">
          <i class="fa-solid fa-arrow-left"></i> Volver al panel
        </button>
      </div>
    }

    @if (!isLoading() && sesion()) {
    <div class="session-wrapper">
      <!-- HEADER -->
      <div class="session-header">
        <div class="header-left">
          <button class="btn btn-ghost btn-sm" (click)="router.navigate(['/customer/dashboard'])">
            <i class="fa-solid fa-arrow-left"></i> Volver al panel
          </button>
          <h1 class="session-title">Mesa {{ sesion()!.idMesa }}</h1>
          <app-status-badge [status]="sesion()!.estado" />
        </div>
        <div class="header-right">
          <span class="header-detail"><i class="fa-solid fa-users"></i> {{ sesion()!.numComensales ?? '-' }} comensales</span>
          <span class="header-detail"><i class="fa-solid fa-clock"></i> {{ formatDateTime(sesion()!.fechaHoraApertura) }}</span>
        </div>
      </div>

      <div class="session-body">
        <!-- COLUMNA IZQUIERDA: MIS PEDIDOS -->
        <div class="col-pedidos">
          <div class="section-header">
            <h2 class="section-title"><i class="fa-solid fa-receipt"></i> Mis Pedidos</h2>
          </div>

          <div class="comandas-list">
            @for (cmd of sortedComandas(); track cmd.id) {
              <div class="comanda-card" [class.comanda-pendiente]="cmd.estado === 'PENDIENTE'">
                <div class="comanda-header">
                  <span class="comanda-id">Pedido #{{ cmd.id }}</span>
                  <app-status-badge [status]="cmd.estado" />
                </div>

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
                      @if (cmd.estado === 'PENDIENTE') {
                        <button class="btn-icon-sm" (click)="eliminarLinea(linea.id, cmd.id)" title="Eliminar">
                          <i class="fa-solid fa-xmark"></i>
                        </button>
                      }
                    </div>
                  } @empty {
                    <p class="lineas-empty">Sin productos</p>
                  }
                </div>

                <div class="comanda-footer">
                  <span class="comanda-total">{{ formatCurrency(cmd.total) }}</span>
                  @if (cmd.estado === 'PENDIENTE') {
                    <button class="btn btn-sm btn-outline-danger" (click)="cancelarComanda(cmd.id)">
                      <i class="fa-solid fa-xmark"></i> Cancelar
                    </button>
                  }
                  @if (cmd.estado === 'CONFIRMADA') {
                    <span class="estado-hint"><i class="fa-solid fa-check"></i> Aceptado</span>
                  }
                  @if (cmd.estado === 'PREPARACION') {
                    <span class="estado-hint preparing"><i class="fa-solid fa-fire-burner"></i> Preparando...</span>
                  }
                  @if (cmd.estado === 'SERVIDA') {
                    <span class="estado-hint served"><i class="fa-solid fa-utensils"></i> Servido</span>
                  }
                </div>
              </div>
            } @empty {
              <div class="empty-section">
                <i class="fa-solid fa-receipt"></i>
                <p>Aun no tienes pedidos</p>
                <p class="empty-hint">Selecciona productos para crear tu primer pedido</p>
              </div>
            }
          </div>
        </div>

        <!-- COLUMNA DERECHA: PRODUCTOS -->
        <div class="col-productos">
          <div class="section-header">
            <h2 class="section-title"><i class="fa-solid fa-utensils"></i> Carta</h2>
          </div>

          <div class="productos-search">
            <input type="text" class="form-input" placeholder="Buscar producto..."
              [value]="productoSearch()" (input)="productoSearch.set($any($event.target).value)" />
          </div>

          <div class="category-filters">
            @for (cat of categorias; track cat.value) {
              <button class="filter-pill" [class.active]="categoriaFilter() === cat.value"
                (click)="categoriaFilter.set(cat.value)">{{ cat.label }}</button>
            }
          </div>

          <div class="productos-grid">
            @for (p of filteredProductos(); track p.id) {
              <div class="producto-card" (click)="addProducto(p)">
                <span class="producto-name">{{ p.nombre }}</span>
                <span class="producto-price">{{ formatCurrency(p.precio) }}</span>
                <span class="producto-cat">{{ p.categoria }}</span>
                <button class="btn-add"><i class="fa-solid fa-plus"></i></button>
              </div>
            } @empty {
              <p class="empty-productos">No se encontraron productos</p>
            }
          </div>

          <!-- Carrito nuevo pedido -->
          @if (cartItems().length > 0) {
            <div class="cart-bar">
              <div class="cart-summary">
                <span class="cart-count">{{ cartTotalItems() }} productos</span>
                <span class="cart-total">{{ formatCurrency(cartTotal()) }}</span>
              </div>
              <div class="cart-actions">
                <button class="btn btn-ghost btn-sm" (click)="clearCart()">
                  <i class="fa-solid fa-trash"></i> Vaciar
                </button>
                <button class="btn btn-primary btn-sm" [disabled]="sending()" (click)="enviarPedido()">
                  <i class="fa-solid fa-paper-plane"></i> Enviar Pedido
                </button>
              </div>
            </div>

            <div class="cart-items">
              @for (item of cartItems(); track item.id) {
                <div class="cart-item">
                  <span class="cart-item-qty">{{ item.cantidad }}x</span>
                  <span class="cart-item-name">
                    {{ item.nombre }}
                    @if (item.notasChef) {
                      <small class="linea-notes">{{ item.notasChef }}</small>
                    }
                  </span>
                  <span class="cart-item-price">{{ formatCurrency(item.precio * item.cantidad) }}</span>
                  <button class="btn-icon-sm" (click)="removeFromCart(item.id)">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Customizer Modal -->
    @if (customizingProduct()) {
      <div class="customizer-overlay" (click)="closeCustomizer()">
        <div class="customizer-modal" (click)="$event.stopPropagation()">
          <div class="customizer-header">
            <div>
              <h2 class="customizer-title">{{ customizingProduct()!.nombre }}</h2>
              <span class="customizer-base-price">{{ formatCurrency(customizingProduct()!.precio) }}</span>
            </div>
            <button class="customizer-close" (click)="closeCustomizer()"><i class="fa-solid fa-xmark"></i></button>
          </div>

          @if (isVariantProduct(customizingProduct()!)) {
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
                <i class="fa-solid fa-plus"></i> Anadir
              </button>
            </div>
          } @else {
            <div class="customizer-body">
              <div class="customizer-section">
                <h3 class="cust-section-label"><i class="fa-solid fa-list-check"></i> Ingredientes</h3>
                <p class="cust-section-hint">Desmarca los que no quieras</p>
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
                <i class="fa-solid fa-plus"></i> Anadir
              </button>
            </div>
          }
        </div>
      </div>
    }
    }
  `,
  styles: [`
    /* NO SESSION */
    .no-session { text-align: center; padding: 4rem 2rem; color: var(--text-muted); }
    .no-session i { font-size: 3rem; opacity: 0.3; display: block; }
    .no-session h2 { color: var(--text-main); margin: 0 0 0.5rem 0; }
    .no-session p { margin: 0 0 1.5rem 0; }

    /* WRAPPER */
    .session-wrapper { padding: var(--spacing-lg); display: flex; flex-direction: column; gap: var(--spacing-lg); }

    /* HEADER */
    .session-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; background-color: var(--card-bg); border: 1px solid var(--table-border); border-radius: var(--radius-md, 8px); flex-wrap: wrap; gap: 0.75rem; }
    .header-left { display: flex; align-items: center; gap: var(--spacing-md); }
    .header-right { display: flex; align-items: center; gap: var(--spacing-md); }
    .session-title { font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin: 0; }
    .header-detail { font-size: 0.8125rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem; }

    /* BODY */
    .session-body { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); min-height: 400px; }
    .col-pedidos, .col-productos { display: flex; flex-direction: column; gap: var(--spacing-sm); }
    .section-header { display: flex; align-items: center; justify-content: space-between; }
    .section-title { font-size: 1rem; font-weight: 700; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 0.5rem; }
    .section-title i { color: var(--primary-coral); font-size: 0.875rem; }

    /* COMANDAS */
    .comandas-list { display: flex; flex-direction: column; gap: 0.75rem; overflow-y: auto; max-height: 600px; padding-right: 0.25rem; }
    .comanda-card { background-color: var(--card-bg); border: 1px solid var(--table-border); border-radius: var(--radius-md, 8px); padding: 0.75rem 1rem; transition: border-color 0.2s; }
    .comanda-pendiente { border-left: 3px solid var(--warning); }
    .comanda-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
    .comanda-id { font-weight: 600; font-size: 0.875rem; color: var(--text-main); }
    .comanda-lineas { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.5rem; }
    .linea-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--text-main); padding: 0.2rem 0; }
    .linea-qty { font-weight: 600; min-width: 2rem; color: var(--text-muted); }
    .linea-name { flex: 1; }
    .linea-price { font-weight: 500; font-variant-numeric: tabular-nums; }
    .linea-notes { display: block; font-size: 0.6875rem; color: var(--text-muted); font-style: italic; line-height: 1.3; margin-top: 1px; }
    .btn-icon-sm { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.15rem; font-size: 0.75rem; border-radius: 4px; }
    .btn-icon-sm:hover { color: var(--danger); background-color: var(--danger-bg, rgba(239,68,68,0.1)); }
    .lineas-empty { font-size: 0.8125rem; color: var(--text-muted); margin: 0.25rem 0; font-style: italic; }
    .comanda-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--table-border); padding-top: 0.5rem; }
    .comanda-total { font-weight: 700; font-size: 0.875rem; color: var(--text-main); font-variant-numeric: tabular-nums; }
    .estado-hint { font-size: 0.75rem; font-weight: 600; color: var(--success); display: flex; align-items: center; gap: 0.25rem; }
    .estado-hint.preparing { color: var(--warning); }
    .estado-hint.served { color: var(--info); }
    .btn-outline-danger { background: transparent; color: var(--danger); border: 1px solid var(--danger); }
    .btn-outline-danger:hover { background-color: var(--danger); color: #fff; }

    .empty-section { text-align: center; padding: 2rem 1rem; color: var(--text-muted); }
    .empty-section i { font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.4; display: block; }
    .empty-hint { font-size: 0.8125rem; margin-top: 0.25rem; }

    /* PRODUCTOS */
    .productos-search { margin-bottom: 0.5rem; }
    .category-filters { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-bottom: 0.75rem; }
    .filter-pill { padding: 0.25rem 0.75rem; border-radius: 9999px; border: 1px solid var(--input-border); background-color: var(--card-bg); color: var(--text-muted); font-size: 0.75rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .filter-pill:hover { border-color: var(--primary-coral); color: var(--primary-coral); }
    .filter-pill.active { background-color: var(--primary-coral); border-color: var(--primary-coral); color: var(--text-white); }
    .productos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.5rem; overflow-y: auto; max-height: 360px; padding-right: 0.25rem; }
    .producto-card { background-color: var(--card-bg); border: 1px solid var(--table-border); border-radius: var(--radius-md, 8px); padding: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; cursor: pointer; transition: border-color 0.2s, transform 0.15s; position: relative; }
    .producto-card:hover { border-color: var(--primary-coral); transform: translateY(-1px); }
    .producto-name { font-weight: 600; font-size: 0.8125rem; color: var(--text-main); line-height: 1.3; }
    .producto-price { font-weight: 700; font-size: 0.875rem; color: var(--primary-coral); }
    .producto-cat { font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; }
    .btn-add { position: absolute; top: 0.5rem; right: 0.5rem; width: 24px; height: 24px; border-radius: 50%; border: none; background-color: var(--primary-coral); color: #fff; font-size: 0.7rem; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; }
    .producto-card:hover .btn-add { opacity: 1; }
    .empty-productos { color: var(--text-muted); font-size: 0.875rem; grid-column: 1 / -1; text-align: center; padding: 2rem 0; }

    /* CART BAR */
    .cart-bar { display: flex; align-items: center; justify-content: space-between; background-color: var(--card-bg); border: 2px solid var(--primary-coral); border-radius: var(--radius-md, 8px); padding: 0.75rem 1rem; margin-top: 0.75rem; }
    .cart-summary { display: flex; align-items: center; gap: 1rem; }
    .cart-count { font-size: 0.8125rem; color: var(--text-muted); font-weight: 500; }
    .cart-total { font-size: 1rem; font-weight: 700; color: var(--primary-coral); }
    .cart-actions { display: flex; gap: 0.5rem; }
    .cart-items { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.5rem 0; }
    .cart-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--text-main); padding: 0.375rem 0.5rem; background: var(--secondary-bg); border-radius: 6px; }
    .cart-item-qty { font-weight: 600; min-width: 2rem; color: var(--text-muted); }
    .cart-item-name { flex: 1; }
    .cart-item-price { font-weight: 500; font-variant-numeric: tabular-nums; }

    /* CUSTOMIZER MODAL */
    .customizer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1rem; animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .customizer-modal { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius-lg, 1rem); width: 100%; max-width: 460px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; animation: scaleIn 0.2s ease-out; }
    @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
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
      .session-body { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .session-wrapper { padding: var(--spacing-md); }
      .session-header { flex-direction: column; align-items: flex-start; }
      .productos-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
    }
  `]
})
export class CustomerSessionComponent implements OnInit {
  router = inject(Router);
  private sesionService = inject(SesionMesaService);
  private comandaService = inject(ComandaService);
  private lineasService = inject(LineasComandaService);
  private productoService = inject(ProductoService);
  private toastService = inject(ToastService);

  sesion = signal<SesionMesa | null>(null);
  comandas = signal<Comanda[]>([]);
  allLineas = signal<LineasComanda[]>([]);
  productos = signal<Producto[]>([]);
  isLoading = signal(true);
  sending = signal(false);
  productoSearch = signal('');
  categoriaFilter = signal('');

  // Cart for new order
  private cartIdCounter = 0;
  cartItems = signal<CartItem[]>([]);

  categorias = [
    { label: 'Todas', value: '' },
    { label: 'Comida', value: 'COMIDA' },
    { label: 'Bebida', value: 'BEBIDA' },
    { label: 'Alcohol', value: 'ALCOHOL' },
    { label: 'Postre', value: 'POSTRE' }
  ];

  filteredProductos = computed(() => {
    const term = this.productoSearch().toLowerCase();
    const cat = this.categoriaFilter();
    let list = this.productos().filter(p => p.activo && !p.nombre.toLowerCase().startsWith('extra '));
    if (cat) list = list.filter(p => p.categoria === cat);
    if (term) list = list.filter(p => p.nombre.toLowerCase().includes(term));
    return list;
  });

  sortedComandas = computed(() =>
    [...this.comandas()].sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime())
  );

  cartTotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  );

  cartTotalItems = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.cantidad, 0)
  );

  // Customizer
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

  ngOnInit(): void {
    this.sesionService.getMiSesion().subscribe({
      next: (sesion) => {
        if (sesion) {
          this.sesion.set(sesion);
          this.loadComandas();
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
    this.productoService.getAll().subscribe({
      next: (data) => this.productos.set(data),
      error: () => {}
    });
  }

  private loadComandas(): void {
    this.comandaService.getMisComandas().subscribe({
      next: (comandas) => {
        this.comandas.set(comandas);
        this.loadAllLineas(comandas);
      },
      error: () => this.toastService.error('Error al cargar pedidos')
    });
  }

  private loadAllLineas(comandas: Comanda[]): void {
    if (comandas.length === 0) { this.allLineas.set([]); return; }
    const requests = comandas.map(c => this.lineasService.getByComanda(c.id));
    forkJoin(requests).subscribe({
      next: (results) => this.allLineas.set(results.flat()),
      error: () => {}
    });
  }

  getLineasForComanda(comandaId: number): LineasComanda[] {
    return this.allLineas().filter(l => l.idComanda === comandaId);
  }

  getProductoNombre(idProducto: number): string {
    return this.productos().find(p => p.id === idProducto)?.nombre ?? `Producto ${idProducto}`;
  }

  // PRODUCT DETECTION
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

  // ADD PRODUCT
  addProducto(producto: Producto): void {
    if (this.isVariantProduct(producto)) {
      this.openVariantSelector(producto);
      return;
    }
    if (this.isCustomizable(producto)) {
      this.openCustomizer(producto);
      return;
    }
    this.addToCart(producto.id, producto.nombre, producto.precio, 1);
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

    this.addToCart(product.id, product.nombre, product.precio, 1, notes);
    for (const extra of selectedExtras) {
      this.addToCart(extra.id, extra.nombre, extra.precio, 1);
    }
  }

  confirmVariant(): void {
    const product = this.customizingProduct();
    const variant = this.selectedVariant();
    if (!product || !variant) return;
    this.closeCustomizer();
    this.addToCart(product.id, product.nombre, product.precio, 1, variant);
  }

  private addToCart(productoId: number, nombre: string, precio: number, cantidad: number, notasChef?: string): void {
    this.cartItems.update(items => [...items, {
      id: ++this.cartIdCounter,
      productoId, nombre, precio, cantidad, notasChef
    }]);
  }

  removeFromCart(cartId: number): void {
    this.cartItems.update(items => items.filter(i => i.id !== cartId));
  }

  clearCart(): void {
    this.cartItems.set([]);
  }

  // SEND ORDER
  enviarPedido(): void {
    const sesion = this.sesion();
    if (!sesion || this.cartItems().length === 0) return;
    this.sending.set(true);

    this.comandaService.createByCliente({ idSesion: sesion.id }).subscribe({
      next: (comanda) => {
        const items = this.cartItems();
        from(items).pipe(
          concatMap(item => this.lineasService.createByCliente({
            idComanda: comanda.id,
            idProducto: item.productoId,
            cantidad: item.cantidad,
            precioUnitarioHistorico: item.precio,
            notasChef: item.notasChef
          } as any))
        ).subscribe({
          complete: () => {
            this.sending.set(false);
            this.cartItems.set([]);
            this.toastService.success('Pedido enviado correctamente');
            this.loadComandas();
          },
          error: () => {
            this.sending.set(false);
            this.toastService.error('Error al crear lineas del pedido');
            this.loadComandas();
          }
        });
      },
      error: (err) => {
        this.sending.set(false);
        this.toastService.error(err?.error?.message || 'Error al crear pedido');
      }
    });
  }

  // MODIFY EXISTING COMANDA
  cancelarComanda(id: number): void {
    this.comandaService.cancelarByCliente(id).subscribe({
      next: () => { this.toastService.success('Pedido cancelado'); this.loadComandas(); },
      error: (err) => this.toastService.error(err?.error?.message || 'Error al cancelar')
    });
  }

  eliminarLinea(lineaId: number, comandaId: number): void {
    this.lineasService.deleteByCliente(lineaId).subscribe({
      next: () => { this.toastService.success('Producto eliminado'); this.loadComandas(); },
      error: (err) => this.toastService.error(err?.error?.message || 'Error al eliminar')
    });
  }

  formatDateTime(iso: string): string {
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

interface CartItem {
  id: number;
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  notasChef?: string;
}
