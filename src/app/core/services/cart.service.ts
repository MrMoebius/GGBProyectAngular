import { Injectable, signal, computed } from '@angular/core';
import { Producto } from '../models/producto.interface';

export interface CartItem {
  product: Producto;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private _items = signal<CartItem[]>([]);

  public items = computed(() => this._items());
  public total = computed(() =>
    this._items().reduce((acc, item) => acc + (item.product.precio * item.quantity), 0)
  );
  public itemCount = computed(() =>
    this._items().reduce((acc, item) => acc + item.quantity, 0)
  );

  addToCart(product: Producto, quantity: number = 1): void {
    this._items.update(items => {
      const existingItem = items.find(i => i.product.id === product.id);
      if (existingItem) {
        return items.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...items, { product, quantity }];
    });
  }

  removeFromCart(productId: number): void {
    this._items.update(items => items.filter(i => i.product.id !== productId));
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this._items.update(items =>
      items.map(i => i.product.id === productId ? { ...i, quantity } : i)
    );
  }

  clearCart(): void {
    this._items.set([]);
  }
}
