import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme = signal<'light' | 'dark'>(
    (localStorage.getItem('ggb-theme') as 'light' | 'dark') || 'light'
  );

  public theme = computed(() => this._theme());
  public isDark = computed(() => this._theme() === 'dark');

  constructor() {
    document.documentElement.setAttribute('data-theme', this._theme());
  }

  toggleTheme(): void {
    const next = this._theme() === 'light' ? 'dark' : 'light';
    this._theme.set(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ggb-theme', next);
  }
}
