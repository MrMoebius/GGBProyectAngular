import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from './admin-sidebar.component';
import { AdminHeaderComponent } from './admin-header.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent, AdminHeaderComponent, ToastComponent],
  template: `
    <app-admin-sidebar
      [collapsed]="collapsed()"
      [mobileOpen]="mobileOpen()"
      (toggleCollapse)="toggleSidebar()"
      (closeMobile)="closeMobileMenu()"
    ></app-admin-sidebar>

    @if (mobileOpen()) {
      <div class="mobile-backdrop" (click)="closeMobileMenu()"></div>
    }

    <app-admin-header
      [collapsed]="collapsed()"
      (toggleSidebar)="toggleSidebar()"
    ></app-admin-header>

    <main
      class="admin-content"
      [class.sidebar-collapsed]="collapsed()"
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
      margin-left: var(--sidebar-width);
      min-height: calc(100vh - 60px);
      transition: margin-left 0.3s ease;
      background-color: var(--content-bg);
    }

    .admin-content.sidebar-collapsed {
      margin-left: var(--sidebar-collapsed-width);
    }

    @media (max-width: 1024px) {
      .admin-content, .admin-content.sidebar-collapsed { margin-left: var(--sidebar-collapsed-width); padding: 1.25rem; }
    }
    @media (max-width: 768px) {
      .admin-content, .admin-content.sidebar-collapsed { margin-left: 56px; padding: 1rem; }
    }
    @media (max-width: 480px) {
      .admin-content, .admin-content.sidebar-collapsed { margin-left: 0; padding: 0.75rem; }
      .mobile-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 25;
        animation: backdropIn 0.3s ease;
      }
    }

    @keyframes backdropIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class AdminLayoutComponent {
  collapsed = signal(false);
  mobileOpen = signal(false);

  toggleSidebar(): void {
    if (window.innerWidth <= 480) {
      this.mobileOpen.update(v => !v);
    } else {
      this.collapsed.update(v => !v);
    }
  }

  closeMobileMenu(): void {
    this.mobileOpen.set(false);
  }
}
