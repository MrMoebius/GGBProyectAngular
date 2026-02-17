import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-staff-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <!-- Logo -->
      <div class="sidebar-logo">
        <a routerLink="/staff/dashboard" class="logo-link">
          <span class="logo-icon">G</span>
          <span class="logo-text" *ngIf="!collapsed">GB Staff</span>
        </a>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li *ngFor="let item of navItems" class="nav-item">
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-link"
              [title]="collapsed ? item.label : ''"
            >
              <i class="fa-solid {{ item.icon }} nav-icon"></i>
              <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- External link -->
      <div class="sidebar-external">
        <a routerLink="/public" class="nav-link external-link" [title]="collapsed ? 'Ver Web' : ''">
          <i class="fa-solid fa-arrow-up-right-from-square nav-icon"></i>
          <span class="nav-label" *ngIf="!collapsed">Ver Web</span>
        </a>
      </div>

      <!-- Collapse toggle -->
      <div class="sidebar-footer">
        <button class="collapse-btn" (click)="toggleCollapse.emit()">
          <i
            class="fa-solid"
            [class.fa-angles-left]="!collapsed"
            [class.fa-angles-right]="collapsed"
          ></i>
          <span *ngIf="!collapsed" class="collapse-label">Colapsar</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      width: var(--sidebar-width);
      background-color: var(--sidebar-bg);
      color: var(--sidebar-text);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      z-index: 20;
      overflow: hidden;
    }

    .sidebar.collapsed {
      width: var(--sidebar-collapsed-width);
    }

    .sidebar-logo {
      padding: 1.25rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      flex-shrink: 0;
    }

    .logo-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: inherit;
    }

    .logo-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background-color: var(--sidebar-active);
      color: #fff;
      font-weight: 800;
      font-size: 1.125rem;
      border-radius: 0.5rem;
      flex-shrink: 0;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0.75rem 0;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      margin: 2px 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 1rem;
      color: var(--sidebar-text);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      border-left: 3px solid transparent;
      transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
      white-space: nowrap;
      overflow: hidden;
    }

    .nav-link:hover {
      background-color: var(--sidebar-hover);
      color: #fff;
    }

    .nav-link.active {
      background-color: var(--sidebar-hover);
      color: #fff;
      border-left-color: var(--sidebar-active);
    }

    .nav-link.active .nav-icon {
      color: var(--sidebar-active);
    }

    .nav-icon {
      width: 20px;
      text-align: center;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .nav-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar.collapsed .nav-link {
      justify-content: center;
      padding: 0.7rem 0;
      border-left: 3px solid transparent;
    }

    .sidebar.collapsed .nav-link.active {
      border-left-color: var(--sidebar-active);
    }

    .sidebar.collapsed .nav-icon {
      margin: 0;
      font-size: 1.1rem;
    }

    .sidebar.collapsed .sidebar-logo {
      padding: 1.25rem 0;
      display: flex;
      justify-content: center;
    }

    .sidebar.collapsed .logo-link {
      justify-content: center;
    }

    .sidebar-external {
      padding: 0.5rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      flex-shrink: 0;
    }

    .external-link {
      opacity: 0.7;
    }

    .external-link:hover {
      opacity: 1;
    }

    .sidebar.collapsed .sidebar-external .nav-link {
      justify-content: center;
      padding: 0.7rem 0;
    }

    .sidebar-footer {
      padding: 0.75rem 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      flex-shrink: 0;
    }

    .collapse-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.6rem 0.5rem;
      background: none;
      border: none;
      color: var(--sidebar-text);
      font-size: 0.875rem;
      cursor: pointer;
      border-radius: 0.375rem;
      transition: background-color 0.2s ease, color 0.2s ease;
      white-space: nowrap;
      overflow: hidden;
    }

    .collapse-btn:hover {
      background-color: var(--sidebar-hover);
      color: #fff;
    }

    .collapse-btn i {
      width: 20px;
      text-align: center;
      flex-shrink: 0;
    }

    .collapse-label {
      white-space: nowrap;
      overflow: hidden;
    }

    .sidebar.collapsed .sidebar-footer {
      padding: 0.75rem 0.5rem;
    }

    .sidebar.collapsed .collapse-btn {
      justify-content: center;
      padding: 0.6rem 0;
    }

    .sidebar-nav::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.12);
      border-radius: 2px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `]
})
export class StaffSidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'Dashboard',       icon: 'fa-gauge-high',    route: '/staff/dashboard' },
    // TPV
    { label: 'Sesiones Mesa',   icon: 'fa-door-open',     route: '/staff/sesiones-mesa' },
    { label: 'Pagos Mesa',      icon: 'fa-money-bill',    route: '/staff/pagos-mesa' },
    { label: 'Peticiones Pago', icon: 'fa-credit-card',   route: '/staff/peticiones-pago' },
    { label: 'Facturas',        icon: 'fa-file-invoice',  route: '/staff/facturas' },
    // Catalogo
    { label: 'Productos',       icon: 'fa-utensils',      route: '/staff/productos' },
    { label: 'Mesas',           icon: 'fa-chair',         route: '/staff/mesas' },
    { label: 'Juegos',          icon: 'fa-puzzle-piece',  route: '/staff/juegos' },
    { label: 'Ludoteca',        icon: 'fa-children',      route: '/staff/ludoteca-sesiones' },
    // Personas
    { label: 'Clientes',        icon: 'fa-people-group',  route: '/staff/clientes' },
    // Otros
    { label: 'Eventos',         icon: 'fa-calendar-days', route: '/staff/eventos' },
  ];
}
