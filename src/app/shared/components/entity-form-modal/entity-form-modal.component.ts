import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-entity-form-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="modal-overlay" (click)="close()">
      <div class="modal-card" (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">{{ title }}</h2>
          <button type="button" class="modal-close-btn" (click)="close()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-ghost" (click)="close()">
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn-primary"
            [disabled]="!formValid"
            (click)="submit()"
          >
            {{ isEditing ? 'Actualizar' : submitLabel }}
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      background-color: var(--modal-overlay);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-card {
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-lg);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                  0 8px 10px -6px rgba(0, 0, 0, 0.1);
      max-width: 42rem;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: scaleIn 0.2s ease-out;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--card-border);
      flex-shrink: 0;
    }

    .modal-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-main);
      margin: 0;
    }

    .modal-close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted);
      font-size: 1.125rem;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      transition: background-color 0.2s, color 0.2s;
    }

    .modal-close-btn:hover {
      background-color: var(--table-row-hover);
      color: var(--text-main);
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--card-border);
      flex-shrink: 0;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from {
        transform: scale(0.95);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* ===== Responsive ===== */
    @media (max-width: 768px) {
      .modal-card {
        max-width: 95vw;
        max-height: 90vh;
      }

      .modal-header {
        padding: 1rem 1.25rem;
      }

      .modal-title {
        font-size: 1rem;
      }

      .modal-body {
        padding: 1rem 1.25rem;
      }

      .modal-footer {
        padding: 0.75rem 1.25rem;
      }
    }

    @media (max-width: 480px) {
      .modal-overlay {
        padding: 0.5rem;
      }

      .modal-card {
        max-width: 100vw;
        max-height: 95vh;
        border-radius: var(--radius-md);
      }

      .modal-header {
        padding: 0.85rem 1rem;
      }

      .modal-body {
        padding: 0.85rem 1rem;
      }

      .modal-footer {
        padding: 0.65rem 1rem;
        gap: 0.5rem;
      }
    }
  `]
})
export class EntityFormModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() submitLabel: string = 'Guardar';
  @Input() isEditing: boolean = false;
  @Input() formValid: boolean = true;

  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<void>();

  close(): void {
    this.onClose.emit();
  }

  submit(): void {
    this.onSubmit.emit();
  }
}
