import { Injectable, inject, signal, computed } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private storage = inject(LocalStorageService);
  private _favorites = signal<number[]>(this.storage.load<number[]>('favorites', []));

  favorites = computed(() => this._favorites());
  count = computed(() => this._favorites().length);

  isFavorite(gameId: number): boolean {
    return this._favorites().includes(gameId);
  }

  toggle(gameId: number): void {
    this._favorites.update(favs => {
      const updated = favs.includes(gameId)
        ? favs.filter(id => id !== gameId)
        : [...favs, gameId];
      this.storage.save('favorites', updated);
      return updated;
    });
  }

  add(gameId: number): void {
    if (!this.isFavorite(gameId)) {
      this._favorites.update(favs => {
        const updated = [...favs, gameId];
        this.storage.save('favorites', updated);
        return updated;
      });
    }
  }

  remove(gameId: number): void {
    this._favorites.update(favs => {
      const updated = favs.filter(id => id !== gameId);
      this.storage.save('favorites', updated);
      return updated;
    });
  }
}
