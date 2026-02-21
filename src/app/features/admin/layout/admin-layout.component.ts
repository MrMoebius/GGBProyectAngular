import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AdminSidebarComponent } from './admin-sidebar.component';
import { AdminHeaderComponent } from './admin-header.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent, AdminHeaderComponent, ToastComponent, CommonModule],
  template: `
    <app-admin-sidebar
      [collapsed]="collapsed()"
      [mobileOpen]="sidebarOpen()"
      (toggleCollapse)="onToggleSidebar()"
    ></app-admin-sidebar>

    @if (sidebarOpen()) {
      <div class="sidebar-backdrop" (click)="closeSidebar()"></div>
    }

    <app-admin-header
      [collapsed]="collapsed()"
      (toggleSidebar)="onToggleSidebar()"
    ></app-admin-header>

    <main
      class="admin-content"
      [style.margin-left]="collapsed() ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'"
    >
      <router-outlet></router-outlet>
    </main>

    <app-toast />
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: var(--content-bg);
    }

    .admin-content {
      padding: 1.5rem;
      min-height: calc(100vh - 60px);
      transition: margin-left 0.3s ease;
      background-color: var(--content-bg);
    }

    .sidebar-backdrop {
      display: none;
    }

    @media (max-width: 1024px) {
      .admin-content { margin-left: 0 !important; padding: 1.25rem; }
      .sidebar-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 25;
        animation: fadeIn 0.3s ease;
      }
    }
    @media (max-width: 768px) {
      .admin-content { padding: 1rem; }
    }
    @media (max-width: 480px) {
      .admin-content { padding: 0.75rem; }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class AdminLayoutComponent {
  private router = inject(Router);

  collapsed = signal(false);
  sidebarOpen = signal(false);

  constructor() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.sidebarOpen.set(false);
    });
  }

  onToggleSidebar(): void {
    if (window.innerWidth <= 1024) {
      this.sidebarOpen.update(v => !v);
    } else {
      this.collapsed.update(v => !v);
    }
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
