import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../core/services/producto.service';
import { CartService } from '../../../core/services/cart.service';
import { Producto } from '../../../core/models/producto.interface';

type Categoria = 'TODOS' | 'COMIDA' | 'BEBIDA' | 'ALCOHOL' | 'POSTRE' | 'SERVICIO';

interface CategoryTab {
  key: Categoria;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-menu-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
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

  readonly selectedCategory = signal<Categoria>('TODOS');
  readonly searchTerm = signal('');
  readonly allProducts = signal<Producto[]>([]);

  readonly categoryTabs: CategoryTab[] = [
    { key: 'TODOS',    label: 'Todos',    icon: '' },
    { key: 'COMIDA',   label: 'Comida',   icon: 'fa-burger' },
    { key: 'BEBIDA',   label: 'Bebida',   icon: 'fa-mug-hot' },
    { key: 'ALCOHOL',  label: 'Alcohol',  icon: 'fa-wine-glass' },
    { key: 'POSTRE',   label: 'Postre',   icon: 'fa-ice-cream' },
    { key: 'SERVICIO', label: 'Servicio', icon: 'fa-concierge-bell' },
  ];

  readonly filteredProducts = computed(() => {
    let products = this.allProducts().filter(p => p.activo);

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
      next: (productos) => this.allProducts.set(productos),
      error: (err) => console.error('Error loading products:', err),
    });
  }

  getCategoryIcon(categoria: string): string {
    return this.categoryIconMap[categoria] || 'fa-utensils';
  }

  addToCart(product: Producto): void {
    this.cartService.addToCart(product);
  }
}
