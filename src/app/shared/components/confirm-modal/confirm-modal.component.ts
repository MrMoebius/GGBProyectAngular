import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="modal-overlay" (click)="cancel()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header">
            <div class="icon-wrapper">
              <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="text-content">
              <h3 class="modal-title">{{ title }}</h3>
              <p class="modal-message">{{ message }}</p>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" (click)="confirm()" class="btn btn-danger">
              Confirmar
            </button>
            <button type="button" (click)="cancel()" class="btn btn-cancel">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      background-color: var(--modal-overlay, rgba(107, 114, 128, 0.75));
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal-container {
      background-color: var(--card-bg, white);
      border: 1px solid var(--card-border, #e5e7eb);
      border-radius: var(--radius-lg);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      max-width: 32rem;
      width: 100%;
      transform: scale(1);
      transition: transform 0.3s;
    }

    .modal-content {
      padding: var(--spacing-lg);
    }

    .modal-header {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
    }

    .icon-wrapper {
      flex-shrink: 0;
      height: 3rem;
      width: 3rem;
      border-radius: 50%;
      background-color: #fee2e2;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon {
      height: 1.5rem;
      width: 1.5rem;
      color: #dc2626;
    }

    .text-content {
      text-align: left;
    }

    .modal-title {
      font-size: 1.125rem;
      font-weight: 500;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }

    .modal-message {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .modal-actions {
      background-color: var(--card-bg, white);
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: row-reverse;
      gap: 0.75rem;
    }

    .btn-danger {
      background-color: #dc2626;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
    }

    .btn-danger:hover {
      background-color: #b91c1c;
    }

    .btn-cancel {
      background-color: var(--card-bg, white);
      color: var(--text-main);
      border: 1px solid var(--card-border, #d1d5db);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
    }

    .btn-cancel:hover {
      background-color: var(--table-row-hover, #f3f4f6);
    }
  `]
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmar acción';
  @Input() message = '¿Estás seguro de que deseas realizar esta acción?';
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  confirm() {
    this.onConfirm.emit();
  }

  cancel() {
    this.onCancel.emit();
  }
}
