import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toastService.toasts()"
        class="toast"
        [ngClass]="'toast-' + toast.type"
      >
        <i class="fa-solid toast-icon"
           [ngClass]="{
             'fa-check-circle': toast.type === 'success',
             'fa-exclamation-circle': toast.type === 'error',
             'fa-info-circle': toast.type === 'info'
           }">
        </i>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" (click)="toastService.dismiss(toast.id)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 24rem;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      border: 1px solid transparent;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideInRight 0.3s ease-out;
      font-size: 0.875rem;
    }

    .toast-success {
      background-color: var(--success-bg);
      color: var(--success-text);
      border-color: var(--success);
    }

    .toast-error {
      background-color: var(--danger-bg);
      color: var(--danger-text);
      border-color: var(--danger);
    }

    .toast-info {
      background-color: var(--info-bg);
      color: var(--info-text);
      border-color: var(--info);
    }

    .toast-icon {
      font-size: 1.125rem;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      font-weight: 500;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
      padding: 0.25rem;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.2s;
    }

    .toast-close:hover {
      opacity: 1;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
