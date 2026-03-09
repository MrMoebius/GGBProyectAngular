import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="statusClass">
      {{ status }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      border: 1px solid transparent;
    }

    .badge.LIBRE {
      background-color: var(--success-bg);
      color: var(--success-text);
      border-color: var(--success);
    }

    .badge.OCUPADA {
      background-color: var(--danger-bg);
      color: var(--danger-text);
      border-color: var(--danger);
    }

    .badge.RESERVADA {
      background-color: var(--warning-bg);
      color: var(--warning-text);
      border-color: var(--warning);
    }
  `]
})
export class TableBadgeComponent {
  @Input({ required: true }) status!: 'LIBRE' | 'OCUPADA' | 'RESERVADA';

  get statusClass(): string {
    return this.status;
  }
}
