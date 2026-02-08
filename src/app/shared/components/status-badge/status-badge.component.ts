import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngStyle]="badgeStyles">
      {{ displayStatus }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.025em;
      white-space: nowrap;
      border: 1px solid transparent;
    }
  `]
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: string;

  private readonly greenStates = ['LIBRE', 'ACTIVO', 'DISPONIBLE', 'COMPLETADO', 'SERVIDA'];
  private readonly redStates = ['OCUPADA', 'BAJA', 'CANCELADA', 'DANADA'];
  private readonly yellowStates = ['RESERVADA', 'PENDIENTE', 'EN_USO', 'PREPARACION'];
  private readonly grayStates = ['FUERA_DE_SERVICIO', 'INACTIVO'];

  get displayStatus(): string {
    return (this.status || '').replace(/_/g, ' ');
  }

  get badgeStyles(): Record<string, string> {
    const s = (this.status || '').toUpperCase();

    if (this.greenStates.includes(s)) {
      return {
        'background-color': 'var(--success-bg)',
        'color': 'var(--success-text)',
        'border-color': 'var(--success)'
      };
    }

    if (this.redStates.includes(s)) {
      return {
        'background-color': 'var(--danger-bg)',
        'color': 'var(--danger-text)',
        'border-color': 'var(--danger)'
      };
    }

    if (this.yellowStates.includes(s)) {
      return {
        'background-color': 'var(--warning-bg)',
        'color': 'var(--warning-text)',
        'border-color': 'var(--warning)'
      };
    }

    if (this.grayStates.includes(s)) {
      return {
        'background-color': 'var(--secondary-bg)',
        'color': 'var(--text-muted)',
        'border-color': 'var(--input-border)'
      };
    }

    // Default: blue / info
    return {
      'background-color': 'var(--info-bg)',
      'color': 'var(--info-text)',
      'border-color': 'var(--info)'
    };
  }
}
