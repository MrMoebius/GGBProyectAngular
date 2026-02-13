import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../core/services/producto.service';
import { CartService } from '../../../core/services/cart.service';
import { Producto } from '../../../core/models/producto.interface';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

type Categoria = 'TODOS' | 'COMIDA' | 'BEBIDA' | 'ALCOHOL' | 'POSTRE' | 'SERVICIO';

interface CategoryTab {
  key: Categoria;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-menu-page',
  standalone: true,
  imports: [CommonModule, FormsModule, BeerLoaderComponent],
  template: `
    <app-beer-loader [isLoading]="isLoading()" />
    <!-- Page Header -->
    <section class="menu-header">
      <h1 class="menu-title">Nuestra Carta</h1>
      <p class="menu-subtitle">Descubre nuestra seleccion de comida, bebida y mucho mas</p>
    </section>

    <!-- Category Tabs -->
    <section class="menu-tabs-wrapper">
      <div class="menu-tabs">
        @for (tab of categoryTabs; track tab.key) {
          <button
            class="tab-pill"
            [class.active]="selectedCategory() === tab.key"
            (click)="selectedCategory.set(tab.key)">
            @if (tab.icon) {
              <i class="fa-solid" [ngClass]="tab.icon"></i>
            }
            {{ tab.label }}
          </button>
        }
      </div>
    </section>

    <!-- Search Bar -->
    <section class="menu-search-wrapper">
      <div class="search-bar">
        <i class="fa-solid fa-magnifying-glass search-icon"></i>
        <input
          type="text"
          class="search-input"
          placeholder="Buscar producto..."
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)" />
        @if (searchTerm()) {
          <button class="search-clear" (click)="searchTerm.set('')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        }
      </div>
    </section>

    <!-- Product Grid -->
    <section class="menu-grid-wrapper">
      @if (filteredProducts().length > 0) {
        <div class="product-grid">
          @for (product of filteredProducts(); track product.id) {
            <div class="product-card">
              <div class="product-card-header">
                <div class="product-icon" [ngClass]="'cat-' + product.categoria.toLowerCase()">
                  <i class="fa-solid" [ngClass]="getCategoryIcon(product.categoria)"></i>
                </div>
                <div class="product-info">
                  <h3 class="product-name">{{ product.nombre }}</h3>
                  @if (product.descripcion) {
                    <p class="product-desc">{{ product.descripcion }}</p>
                  }
                </div>
              </div>
              <div class="product-card-footer">
                <span class="product-price">{{ product.precio.toFixed(2) }} EUR</span>
                <button class="btn-add" (click)="addToCart(product)">
                  <i class="fa-solid fa-plus"></i>
                  Anadir
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state">
          <i class="fa-solid fa-bowl-rice"></i>
          <p>No hay productos en esta categoria</p>
        </div>
      }
    </section>

    <!-- Customizer Modal -->
    @if (customizingProduct()) {
      <div class="customizer-overlay" (click)="closeCustomizer()">
        <div class="customizer-modal" (click)="$event.stopPropagation()">
          <div class="customizer-header">
            <div>
              <h2 class="customizer-title">{{ customizingProduct()!.nombre }}</h2>
              <span class="customizer-base-price">{{ customizingProduct()!.precio.toFixed(2) }} EUR</span>
            </div>
            <button class="customizer-close" (click)="closeCustomizer()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          @if (isVariantProduct(customizingProduct()!)) {
            <!-- Variant mode (Copazo) -->
            <div class="customizer-body">
              <div class="customizer-section">
                <h3 class="section-label">
                  <i class="fa-solid fa-wine-bottle"></i>
                  Elige tu destilado
                </h3>
                <p class="section-hint">Selecciona uno</p>
                <ul class="variant-list">
                  @for (option of variantOptions(); track option) {
                    <li
                      class="variant-item"
                      [class.selected]="selectedVariant() === option"
                      (click)="selectedVariant.set(option)">
                      <span class="radio-custom" [class.checked]="selectedVariant() === option"></span>
                      <span class="radio-text">{{ option }}</span>
                    </li>
                  }
                </ul>
              </div>
            </div>
            <div class="customizer-footer">
              <span class="customizer-total">{{ customizingProduct()!.precio.toFixed(2) }} EUR</span>
              <button
                class="btn-confirm"
                [disabled]="!selectedVariant()"
                (click)="confirmVariant()">
                <i class="fa-solid fa-cart-plus"></i>
                Anadir al pedido
              </button>
            </div>
          } @else {
            <!-- Hamburger mode -->
            <div class="customizer-body">
              <div class="customizer-section">
                <h3 class="section-label">
                  <i class="fa-solid fa-list-check"></i>
                  Ingredientes
                </h3>
                <p class="section-hint">Desmarca los que no quieras</p>
                <ul class="ingredient-list">
                  @for (ing of currentIngredients(); track ing) {
                    <li class="ingredient-item" [class.removed]="!ingredientStates()[ing]">
                      <label class="check-label">
                        <input
                          type="checkbox"
                          [checked]="ingredientStates()[ing]"
                          (change)="toggleIngredient(ing)" />
                        <span class="check-custom"></span>
                        <span class="check-text">{{ ing }}</span>
                      </label>
                    </li>
                  }
                </ul>
              </div>

              <div class="customizer-section">
                <h3 class="section-label">
                  <i class="fa-solid fa-plus-circle"></i>
                  Extras
                </h3>
                <p class="section-hint">Anade extras a tu hamburguesa</p>
                <ul class="extras-list">
                  @for (extra of extras(); track extra.id) {
                    <li class="extra-item" [class.selected]="extraStates()[extra.id]">
                      <label class="check-label">
                        <input
                          type="checkbox"
                          [checked]="extraStates()[extra.id]"
                          (change)="toggleExtra(extra.id)" />
                        <span class="check-custom"></span>
                        <span class="check-text">{{ extra.nombre.replace('Extra ', '') }}</span>
                      </label>
                      <span class="extra-price">+{{ extra.precio.toFixed(2) }} EUR</span>
                    </li>
                  }
                </ul>
              </div>
            </div>

            <div class="customizer-footer">
              <span class="customizer-total">Total: {{ customizedPrice().toFixed(2) }} EUR</span>
              <button class="btn-confirm" (click)="confirmCustomized()">
                <i class="fa-solid fa-cart-plus"></i>
                Anadir al pedido
              </button>
            </div>
          }
        </div>
      </div>
    }

    <!-- Floating Cart Bar -->
    @if (cartService.itemCount() > 0) {
      <div class="floating-cart">
        <div class="cart-info">
          <i class="fa-solid fa-cart-shopping"></i>
          <span class="cart-count">{{ cartService.itemCount() }} productos</span>
          <span class="cart-divider">|</span>
          <span class="cart-total">{{ cartService.total().toFixed(2) }} EUR</span>
        </div>
        <div class="cart-actions">
          <button class="btn-cart-view">
            <i class="fa-solid fa-eye"></i>
            Ver pedido
          </button>
          <button class="btn-cart-clear" (click)="cartService.clearCart()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    /* === Layout === */
    :host {
      display: block;
      padding-bottom: 6rem;
    }

    /* === Header === */
    .menu-header {
      text-align: center;
      padding: 2.5rem 1.5rem 1rem;
      max-width: var(--max-content-width, 1280px);
      margin: 0 auto;
    }

    .menu-title {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }

    .menu-subtitle {
      font-size: 1.1rem;
      color: var(--text-muted);
    }

    /* === Category Tabs === */
    .menu-tabs-wrapper {
      max-width: var(--max-content-width, 1280px);
      margin: 0 auto;
      padding: 1.5rem 1.5rem 0;
    }

    .menu-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
    }

    .tab-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      background-color: var(--secondary-bg, #F3F4F6);
      color: var(--text-muted);
      border: 1px solid var(--card-border);
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .tab-pill:hover:not(.active) {
      border-color: var(--text-muted);
      color: var(--text-main);
    }

    .tab-pill.active {
      background-color: var(--primary-coral);
      color: var(--text-white, #FFFFFF);
      border-color: var(--primary-coral);
    }

    .tab-pill i {
      font-size: 0.85rem;
    }

    /* === Search === */
    .menu-search-wrapper {
      max-width: var(--max-content-width, 1280px);
      margin: 0 auto;
      padding: 1.25rem 1.5rem 0;
    }

    .search-bar {
      position: relative;
      max-width: 480px;
      margin: 0 auto;
    }

    .search-icon {
      position: absolute;
      left: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 0.875rem;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 0.625rem 2.5rem 0.625rem 2.5rem;
      border: 1px solid var(--input-border);
      border-radius: var(--radius-lg, 1rem);
      background-color: var(--input-bg);
      color: var(--text-main);
      font-size: 0.9rem;
      font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--input-focus);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .search-input::placeholder {
      color: var(--text-muted);
    }

    .search-clear {
      position: absolute;
      right: 0.625rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.25rem;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .search-clear:hover {
      color: var(--text-main);
    }

    /* === Product Grid === */
    .menu-grid-wrapper {
      max-width: var(--max-content-width, 1280px);
      margin: 0 auto;
      padding: 1.5rem;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }

    .product-card {
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md, 0.5rem);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .product-card:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      border-color: var(--text-muted);
    }

    .product-card-header {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .product-icon {
      width: 44px;
      height: 44px;
      min-width: 44px;
      border-radius: var(--radius-md, 0.5rem);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }

    /* Category icon colors - matching landing page */
    .cat-comida { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
    .cat-bebida { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
    .cat-alcohol { background: rgba(168, 85, 247, 0.1); color: #A855F7; }
    .cat-postre { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
    .cat-servicio { background: rgba(16, 185, 129, 0.1); color: #10B981; }

    .product-info {
      flex: 1;
      min-width: 0;
    }

    .product-name {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.25rem;
      line-height: 1.3;
    }

    .product-desc {
      font-size: 0.825rem;
      color: var(--text-muted);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .product-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--card-border);
    }

    .product-price {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--primary-coral);
    }

    .btn-add {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.9rem;
      border-radius: var(--radius-md, 0.5rem);
      font-size: 0.8125rem;
      font-weight: 600;
      background-color: var(--primary-coral);
      color: var(--text-white, #FFFFFF);
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
      font-family: inherit;
    }

    .btn-add:hover {
      background-color: var(--primary-hover);
    }

    .btn-add i {
      font-size: 0.75rem;
    }

    /* === Empty State === */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 30vh;
      text-align: center;
      color: var(--text-muted);
      gap: 1rem;
      padding: 3rem 1rem;
    }

    .empty-state i {
      font-size: 3rem;
      opacity: 0.3;
    }

    .empty-state p {
      font-size: 1.1rem;
    }

    /* === Floating Cart Bar === */
    .floating-cart {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background-color: var(--secondary-dark);
      color: var(--text-white, #FFFFFF);
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .cart-info {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      font-size: 0.9rem;
    }

    .cart-info > i {
      font-size: 1.1rem;
      color: var(--primary-coral);
    }

    .cart-count {
      font-weight: 600;
    }

    .cart-divider {
      opacity: 0.4;
    }

    .cart-total {
      font-weight: 700;
      color: var(--primary-coral);
      font-size: 1rem;
    }

    .cart-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-cart-view {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md, 0.5rem);
      font-size: 0.8125rem;
      font-weight: 600;
      background-color: var(--primary-coral);
      color: var(--text-white, #FFFFFF);
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
      font-family: inherit;
    }

    .btn-cart-view:hover {
      background-color: var(--primary-hover);
    }

    .btn-cart-clear {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: var(--radius-sm, 0.25rem);
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: var(--text-white, #FFFFFF);
      cursor: pointer;
      font-size: 0.875rem;
      transition: background 0.2s;
    }

    .btn-cart-clear:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* === Customizer Modal === */
    .customizer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .customizer-modal {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-lg, 1rem);
      width: 100%;
      max-width: 480px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: scaleIn 0.2s ease-out;
    }

    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .customizer-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--card-border);
    }

    .customizer-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.25rem;
    }

    .customizer-base-price {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .customizer-close {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.25rem;
      transition: color 0.2s;
    }

    .customizer-close:hover {
      color: var(--text-main);
    }

    .customizer-body {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 1.5rem;
    }

    .customizer-section {
      margin-bottom: 1.5rem;
    }

    .customizer-section:last-child {
      margin-bottom: 0;
    }

    .section-label {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .section-label i {
      color: var(--primary-coral);
      font-size: 0.9rem;
    }

    .section-hint {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }

    .ingredient-list,
    .extras-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .ingredient-item,
    .extra-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 0.75rem;
      border-radius: var(--radius-md, 0.5rem);
      background: var(--secondary-bg, #F3F4F6);
      transition: background 0.2s, opacity 0.2s;
    }

    .ingredient-item.removed {
      opacity: 0.5;
    }

    .ingredient-item.removed .check-text {
      text-decoration: line-through;
    }

    .extra-item.selected {
      background: rgba(239, 68, 68, 0.08);
    }

    .check-label {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      cursor: pointer;
      flex: 1;
    }

    .check-label input[type="checkbox"] {
      display: none;
    }

    .check-custom {
      width: 20px;
      height: 20px;
      min-width: 20px;
      border: 2px solid var(--text-muted);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .check-label input:checked + .check-custom {
      background: var(--primary-coral);
      border-color: var(--primary-coral);
    }

    .check-label input:checked + .check-custom::after {
      content: '';
      width: 6px;
      height: 10px;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
      margin-top: -2px;
    }

    .check-text {
      font-size: 0.9rem;
      color: var(--text-main);
      text-transform: capitalize;
    }

    .extra-price {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--primary-coral);
      white-space: nowrap;
    }

    .customizer-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--card-border);
      background: var(--card-bg);
    }

    .customizer-total {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .btn-confirm {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.25rem;
      border-radius: var(--radius-md, 0.5rem);
      font-size: 0.875rem;
      font-weight: 600;
      background: var(--primary-coral);
      color: var(--text-white, #FFFFFF);
      border: none;
      cursor: pointer;
      transition: background 0.2s;
      font-family: inherit;
    }

    .btn-confirm:hover {
      background: var(--primary-hover);
    }

    .btn-confirm:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* === Variant Radio List (Copazo) === */
    .variant-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .variant-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.7rem 0.85rem;
      border-radius: var(--radius-md, 0.5rem);
      background: var(--secondary-bg, #F3F4F6);
      cursor: pointer;
      transition: background 0.2s, box-shadow 0.2s;
    }

    .variant-item:hover {
      background: rgba(255, 127, 80, 0.08);
    }

    .variant-item.selected {
      background: rgba(255, 127, 80, 0.1);
      box-shadow: inset 0 0 0 2px var(--primary-coral);
    }

    .radio-custom {
      width: 20px;
      height: 20px;
      min-width: 20px;
      border: 2px solid var(--text-muted);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .radio-custom.checked {
      border-color: var(--primary-coral);
    }

    .radio-custom.checked::after {
      content: '';
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--primary-coral);
    }

    .radio-text {
      font-size: 0.9rem;
      color: var(--text-main);
    }

    /* === Responsive === */
    @media (max-width: 768px) {
      .menu-title {
        font-size: 1.75rem;
      }

      .menu-subtitle {
        font-size: 0.95rem;
      }

      .product-grid {
        grid-template-columns: 1fr;
      }

      .menu-tabs {
        justify-content: flex-start;
        overflow-x: auto;
        flex-wrap: nowrap;
        padding-bottom: 0.25rem;
        -webkit-overflow-scrolling: touch;
      }

      .tab-pill {
        white-space: nowrap;
        flex-shrink: 0;
      }

      .floating-cart {
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
      }

      .cart-info {
        font-size: 0.825rem;
      }

      .cart-actions {
        width: 100%;
      }

      .btn-cart-view {
        flex: 1;
      }
    }
  `]
})
export class MenuPageComponent implements OnInit {
  private productoService = inject(ProductoService);
  readonly cartService = inject(CartService);

  readonly isLoading = signal(true);
  readonly selectedCategory = signal<Categoria>('TODOS');
  readonly searchTerm = signal('');
  readonly allProducts = signal<Producto[]>([]);

  readonly customizingProduct = signal<Producto | null>(null);
  readonly ingredientStates = signal<Record<string, boolean>>({});
  readonly extraStates = signal<Record<number, boolean>>({});
  readonly selectedVariant = signal<string>('');

  readonly categoryTabs: CategoryTab[] = [
    { key: 'TODOS',    label: 'Todos',    icon: '' },
    { key: 'COMIDA',   label: 'Comida',   icon: 'fa-burger' },
    { key: 'BEBIDA',   label: 'Bebida',   icon: 'fa-mug-hot' },
    { key: 'ALCOHOL',  label: 'Alcohol',  icon: 'fa-wine-glass' },
    { key: 'POSTRE',   label: 'Postre',   icon: 'fa-ice-cream' },
    { key: 'SERVICIO', label: 'Servicio', icon: 'fa-concierge-bell' },
  ];

  readonly extras = computed(() =>
    this.allProducts().filter(p => p.activo && p.nombre.toLowerCase().startsWith('extra '))
  );

  readonly currentIngredients = computed(() => {
    const product = this.customizingProduct();
    if (!product?.descripcion) return [];
    return product.descripcion.split(',').map(s => s.trim()).filter(s => s.length > 0);
  });

  readonly customizedPrice = computed(() => {
    const product = this.customizingProduct();
    if (!product) return 0;
    const extrasTotal = this.extras()
      .filter(e => this.extraStates()[e.id])
      .reduce((sum, e) => sum + e.precio, 0);
    return product.precio + extrasTotal;
  });

  readonly filteredProducts = computed(() => {
    let products = this.allProducts().filter(p =>
      p.activo && !p.nombre.toLowerCase().startsWith('extra ')
    );

    const category = this.selectedCategory();
    if (category !== 'TODOS') {
      products = products.filter(p => p.categoria === category);
    }

    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      products = products.filter(p =>
        p.nombre.toLowerCase().includes(term)
      );
    }

    return products;
  });

  private readonly categoryIconMap: Record<string, string> = {
    'COMIDA':   'fa-burger',
    'BEBIDA':   'fa-mug-hot',
    'ALCOHOL':  'fa-wine-glass',
    'POSTRE':   'fa-ice-cream',
    'SERVICIO': 'fa-concierge-bell',
  };

  ngOnInit(): void {
    this.productoService.getAll().subscribe({
      next: (productos) => {
        this.allProducts.set(productos);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoading.set(false);
      },
    });
  }

  getCategoryIcon(categoria: string): string {
    return this.categoryIconMap[categoria] || 'fa-utensils';
  }

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

  readonly variantOptions = computed(() => {
    const product = this.customizingProduct();
    if (!product?.descripcion) return [];
    return product.descripcion.split(',').map(s => s.trim()).filter(s => s.length > 0);
  });

  addToCart(product: Producto): void {
    if (this.isVariantProduct(product)) {
      this.openVariantSelector(product);
    } else if (this.isCustomizable(product)) {
      this.openCustomizer(product);
    } else {
      this.cartService.addToCart(product);
    }
  }

  openVariantSelector(product: Producto): void {
    this.customizingProduct.set(product);
    this.selectedVariant.set('');
  }

  confirmVariant(): void {
    const product = this.customizingProduct();
    const variant = this.selectedVariant();
    if (!product || !variant) return;
    this.cartService.addVariantToCart(product, variant);
    this.closeCustomizer();
  }

  openCustomizer(product: Producto): void {
    this.customizingProduct.set(product);
    const ingredients = product.descripcion!.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const ingStates: Record<string, boolean> = {};
    ingredients.forEach(ing => ingStates[ing] = true);
    this.ingredientStates.set(ingStates);
    const extStates: Record<number, boolean> = {};
    this.extras().forEach(e => extStates[e.id] = false);
    this.extraStates.set(extStates);
  }

  closeCustomizer(): void {
    this.customizingProduct.set(null);
  }

  toggleIngredient(ingredient: string): void {
    this.ingredientStates.update(states => ({
      ...states,
      [ingredient]: !states[ingredient]
    }));
  }

  toggleExtra(extraId: number): void {
    this.extraStates.update(states => ({
      ...states,
      [extraId]: !states[extraId]
    }));
  }

  confirmCustomized(): void {
    const product = this.customizingProduct();
    if (!product) return;
    const removed = Object.entries(this.ingredientStates())
      .filter(([_, included]) => !included)
      .map(([name]) => name);
    const selectedExtras = this.extras().filter(e => this.extraStates()[e.id]);
    this.cartService.addCustomizedToCart(product, removed, selectedExtras);
    this.closeCustomizer();
  }
}
