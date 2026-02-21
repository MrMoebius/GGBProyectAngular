import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-staff-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header" [style.margin-left]="collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'">
      <div class="header-left">
        <button class="header-btn" (click)="toggleSidebar.emit()">
          <i class="fa-solid fa-bars"></i>
        </button>
        <h1 class="header-title">Panel de Empleados</h1>
      </div>

      <div class="header-right">
        <button class="header-btn theme-toggle" (click)="themeService.toggleTheme()">
          <i class="fa-solid" [class.fa-moon]="!themeService.isDark()" [class.fa-sun]="themeService.isDark()"></i>
        </button>
        <div class="user-badge">
          <i class="fa-solid fa-circle-user"></i>
          <span class="user-label">{{ authService.currentUser()?.email || 'Empleado' }}</span>
        </div>
        <button class="header-btn logout-btn" (click)="logout()" title="Cerrar sesion">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      padding: 0 1.5rem;
      background-color: var(--header-bg);
      border-bottom: 1px solid var(--header-border);
      transition: margin-left 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-main);
      white-space: nowrap;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      background: none;
      border: 1px solid var(--input-border);
      border-radius: 0.5rem;
      color: var(--text-muted);
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
    }

    .header-btn:hover {
      background-color: var(--table-row-hover);
      color: var(--text-main);
    }

    .theme-toggle {
      font-size: 0.95rem;
    }

    .user-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      background-color: var(--table-row-hover);
      border: 1px solid var(--input-border);
      border-radius: 0.5rem;
      color: var(--text-main);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .user-badge i {
      font-size: 1.1rem;
      color: var(--primary-coral);
    }

    .user-label {
      white-space: nowrap;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logout-btn {
      color: var(--danger, #EF4444);
      border-color: rgba(239, 68, 68, 0.3);
    }

    .logout-btn:hover {
      background-color: rgba(239, 68, 68, 0.1);
      color: var(--danger, #EF4444);
      border-color: var(--danger, #EF4444);
    }

    @media (max-width: 1024px) {
      .header { margin-left: 0 !important; padding: 0 1rem; }
      .header-title { display: none; }
    }
    @media (max-width: 480px) {
      .header { padding: 0 0.75rem; }
      .user-label { display: none; }
      .user-badge { padding: 0.375rem 0.5rem; }
      .header-right { gap: 0.5rem; }
    }
  `]
})
export class StaffHeaderComponent {
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  themeService = inject(ThemeService);
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
