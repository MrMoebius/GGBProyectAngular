import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-card">
      <div class="stats-card-body">
        <div class="icon-circle" [ngStyle]="{ 'background-color': color + '1A', 'color': color }">
          <i class="fa-solid" [ngClass]="icon"></i>
        </div>
        <div class="stats-info">
          <span class="stats-value">{{ value }}</span>
          <span class="stats-label">{{ label }}</span>
        </div>
      </div>
      <div *ngIf="subtitle" class="stats-subtitle">
        {{ subtitle }}
      </div>
    </div>
  `,
  styles: [`
    .stats-card {
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      transition: background-color 0.3s, border-color 0.3s;
    }

    .stats-card-body {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .icon-circle {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .stats-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .stats-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1.2;
    }

    .stats-label {
      font-size: 0.8125rem;
      color: var(--text-muted);
      font-weight: 500;
      margin-top: 0.125rem;
    }

    .stats-subtitle {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--card-border);
      font-size: 0.75rem;
      color: var(--text-muted);
    }
  `]
})
export class StatsCardComponent {
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input({ required: true }) color!: string;
  @Input() subtitle: string = '';
}
