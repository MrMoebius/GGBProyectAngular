import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StaffSidebarComponent } from './staff-sidebar.component';
import { StaffHeaderComponent } from './staff-header.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [RouterOutlet, StaffSidebarComponent, StaffHeaderComponent, ToastComponent],
  template: `
    <app-staff-sidebar
      [collapsed]="collapsed()"
      (toggleCollapse)="toggleSidebar()"
    ></app-staff-sidebar>

    <app-staff-header
      [collapsed]="collapsed()"
      (toggleSidebar)="toggleSidebar()"
    ></app-staff-header>

    <main
      class="staff-content"
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

    .staff-content {
      padding: 1.5rem;
      min-height: calc(100vh - 60px);
      transition: margin-left 0.3s ease;
      background-color: var(--content-bg);
    }
  `]
})
export class StaffLayoutComponent {
  collapsed = signal(false);

  toggleSidebar(): void {
    this.collapsed.update(v => !v);
  }
}
