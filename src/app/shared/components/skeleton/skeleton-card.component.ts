import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  template: `
    <div class="skeleton-card" [style.height]="height">
      <div class="skeleton-image"></div>
      <div class="skeleton-body">
        <div class="skeleton-line title"></div>
        <div class="skeleton-line subtitle"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .skeleton-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .skeleton-image {
      width: 100%;
      height: 45%;
      background: linear-gradient(90deg, var(--secondary-bg) 25%, var(--card-border) 50%, var(--secondary-bg) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-body {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .skeleton-line {
      height: 0.75rem;
      border-radius: 4px;
      background: linear-gradient(90deg, var(--secondary-bg) 25%, var(--card-border) 50%, var(--secondary-bg) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-line.title { width: 70%; height: 1rem; }
    .skeleton-line.subtitle { width: 90%; }
    .skeleton-line.short { width: 50%; }
  `]
})
export class SkeletonCardComponent {
  @Input() height = '280px';
}
