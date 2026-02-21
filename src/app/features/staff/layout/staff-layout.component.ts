import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { StaffSidebarComponent } from './staff-sidebar.component';
import { StaffHeaderComponent } from './staff-header.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [RouterOutlet, StaffSidebarComponent, StaffHeaderComponent, ToastComponent, CommonModule],
  template: `
    <app-staff-sidebar
      [collapsed]="collapsed()"
      [mobileOpen]="sidebarOpen()"
      (toggleCollapse)="onToggleSidebar()"
    ></app-staff-sidebar>

    @if (sidebarOpen()) {
      <div class="sidebar-backdrop" (click)="closeSidebar()"></div>
    }

    <app-staff-header
      [collapsed]="collapsed()"
      (toggleSidebar)="onToggleSidebar()"
    ></app-staff-header>

    <main
      class="staff-content"
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

    .staff-content {
      padding: 1.5rem;
      margin-left: var(--sidebar-width);
      min-height: calc(100vh - 60px);
      transition: margin-left 0.3s ease;
      background-color: var(--content-bg);
    }

    .sidebar-backdrop {
      display: none;
    }

    @media (max-width: 1024px) {
      .staff-content { margin-left: 0 !important; padding: 1.25rem; }
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
      .staff-content { padding: 1rem; }
    }
    @media (max-width: 480px) {
      .staff-content { padding: 0.75rem; }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class StaffLayoutComponent {
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
