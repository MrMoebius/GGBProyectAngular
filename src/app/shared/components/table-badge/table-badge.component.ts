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
      background-color: #d1fae5;
      color: #065f46;
      border-color: #a7f3d0;
    }

    .badge.OCUPADA {
      background-color: #fee2e2;
      color: #991b1b;
      border-color: #fecaca;
    }

    .badge.RESERVADA {
      background-color: #fef3c7;
      color: #92400e;
      border-color: #fde68a;
    }
  `]
})
export class TableBadgeComponent {
  @Input({ required: true }) status!: 'LIBRE' | 'OCUPADA' | 'RESERVADA';

  get statusClass(): string {
    return this.status;
  }
}
