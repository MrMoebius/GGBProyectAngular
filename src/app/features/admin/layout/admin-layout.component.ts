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
      (toggleCollapse)="toggleSidebar()"
    ></app-admin-sidebar>

    <app-admin-header
      [collapsed]="collapsed()"
      (toggleSidebar)="toggleSidebar()"
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
  `]
})
export class AdminLayoutComponent {
  collapsed = signal(false);

  toggleSidebar(): void {
    this.collapsed.update(v => !v);
  }
}
