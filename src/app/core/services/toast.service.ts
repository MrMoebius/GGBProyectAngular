import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  private nextId = 0;

  public toasts = this._toasts.asReadonly();

  show(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const id = this.nextId++;
    this._toasts.update(t => [...t, { message, type, id }]);
    setTimeout(() => this.dismiss(id), 3000);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error'); }

  dismiss(id: number): void {
    this._toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
