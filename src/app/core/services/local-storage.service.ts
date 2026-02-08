import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private prefix = 'ggb_';

  load<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  save<T>(key: string, data: T): void {
    localStorage.setItem(this.prefix + key, JSON.stringify(data));
  }

  remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }
}
