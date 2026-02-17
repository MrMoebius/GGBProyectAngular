import { Component, inject, computed, signal } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { PublicNavbarComponent } from '../../public/layout/public-navbar.component';
import { PublicFooterComponent } from '../../public/layout/public-footer.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ClienteService } from '../../../core/services/cliente.service';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, PublicNavbarComponent, PublicFooterComponent, ToastComponent],
  template: `
    <app-public-navbar />

    <div class="customer-layout">
      <!-- Sidebar (desktop) / Horizontal nav (mobile) -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <!-- Toggle button -->
        <button class="sidebar-toggle" (click)="toggleSidebar()" [attr.title]="sidebarCollapsed() ? 'Expandir menu' : 'Colapsar menu'">
          <i class="fa-solid" [class.fa-chevron-left]="!sidebarCollapsed()" [class.fa-chevron-right]="sidebarCollapsed()"></i>
        </button>

        <!-- User greeting -->
        <div class="user-greeting">
          <div class="user-avatar">
            @if (hasProfilePhoto()) {
              <img class="avatar-img" [src]="profilePhotoUrl()" (error)="onImageError()" alt="Foto de perfil">
            } @else {
              <span class="avatar-initial">{{ userInitial() }}</span>
            }
          </div>
          @if (!sidebarCollapsed()) {
            <div class="user-info">
              <p class="user-name">{{ userName() }}</p>
              <p class="user-email">{{ userEmail() }}</p>
            </div>
          }
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          @for (link of navLinks; track link.path) {
            <a
              class="sidebar-link"
              [routerLink]="link.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              [attr.title]="sidebarCollapsed() ? link.label : null"
            >
              <i class="fa-solid" [class]="link.icon"></i>
              @if (!sidebarCollapsed()) {
                <span class="link-label">{{ link.label }}</span>
              }
              @if (!sidebarCollapsed() && link.badge && link.badge() > 0) {
                <span class="link-badge">{{ link.badge() }}</span>
              }
              @if (sidebarCollapsed() && link.badge && link.badge() > 0) {
                <span class="link-badge-dot"></span>
              }
            </a>
          }

          <button class="sidebar-link logout-btn" (click)="onLogout()" [attr.title]="sidebarCollapsed() ? 'Cerrar sesion' : null">
            <i class="fa-solid fa-right-from-bracket"></i>
            @if (!sidebarCollapsed()) {
              <span class="link-label">Cerrar sesion</span>
            }
          </button>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="customer-content">
        <router-outlet />
      </main>
    </div>

    <app-public-footer />
    <app-toast />
  `,
  styles: [`
    /* ===== Layout ===== */
    .customer-layout {
      display: flex;
      min-height: calc(100vh - var(--public-nav-height, 64px));
      padding-top: var(--public-nav-height, 64px);
      background-color: var(--content-bg, #0F172A);
    }

    /* ===== Sidebar ===== */
    .sidebar {
      width: 260px;
      flex-shrink: 0;
      background-color: var(--card-bg, #1E293B);
      border-right: 1px solid var(--card-border, rgba(255,255,255,0.08));
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      position: sticky;
      top: var(--public-nav-height, 64px);
      height: calc(100vh - var(--public-nav-height, 64px));
      overflow-y: auto;
      transition: width 0.3s ease;
    }

    .sidebar.collapsed {
      width: 64px;
      padding: 1.5rem 0.5rem;
      align-items: center;
    }

    /* ===== Toggle button ===== */
    .sidebar-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid var(--card-border, rgba(255,255,255,0.08));
      background-color: rgba(255, 255, 255, 0.03);
      color: var(--text-muted, #94a3b8);
      cursor: pointer;
      transition: all 0.2s;
      align-self: flex-end;
      flex-shrink: 0;
    }

    .sidebar.collapsed .sidebar-toggle {
      align-self: center;
    }

    .sidebar-toggle:hover {
      color: var(--neon-cyan, #00FFD1);
      border-color: var(--neon-cyan, #00FFD1);
      background-color: rgba(0, 255, 209, 0.08);
    }

    .sidebar-toggle i {
      font-size: 0.7rem;
    }

    /* ===== User greeting ===== */
    .user-greeting {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--card-border, rgba(255,255,255,0.08));
      border-radius: var(--radius-lg, 16px);
      overflow: hidden;
      transition: padding 0.3s ease;
    }

    .sidebar.collapsed .user-greeting {
      padding: 0.5rem;
      justify-content: center;
    }

    .user-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--neon-cyan, #00FFD1), var(--neon-pink, #FF6B9D));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }

    .sidebar.collapsed .user-avatar {
      width: 36px;
      height: 36px;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .avatar-initial {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0F172A;
      text-transform: uppercase;
    }

    .sidebar.collapsed .avatar-initial {
      font-size: 0.9rem;
    }

    .user-info {
      overflow: hidden;
    }

    .user-name {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 0.75rem;
      color: var(--text-muted, #94a3b8);
      margin: 0.15rem 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ===== Sidebar nav ===== */
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-muted, #94a3b8);
      text-decoration: none;
      border-radius: var(--radius-md, 8px);
      transition: color 0.2s, background-color 0.2s;
      border: none;
      background: none;
      cursor: pointer;
      width: 100%;
      text-align: left;
      position: relative;
    }

    .sidebar.collapsed .sidebar-link {
      justify-content: center;
      padding: 0.7rem;
      gap: 0;
    }

    .sidebar-link i {
      width: 20px;
      text-align: center;
      font-size: 0.95rem;
      flex-shrink: 0;
    }

    .sidebar-link:hover {
      color: var(--text-white, #fff);
      background-color: rgba(255, 255, 255, 0.06);
    }

    .sidebar-link.active {
      color: var(--neon-cyan, #00FFD1);
      background-color: rgba(0, 255, 209, 0.08);
      font-weight: 600;
    }

    .sidebar-link.active i {
      text-shadow: 0 0 8px var(--neon-cyan, #00FFD1);
    }

    /* Badge */
    .link-badge {
      margin-left: auto;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 9999px;
      background-color: var(--neon-pink, #FF6B9D);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 8px rgba(255, 107, 157, 0.4);
    }

    /* Badge dot for collapsed state */
    .link-badge-dot {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--neon-pink, #FF6B9D);
      box-shadow: 0 0 6px rgba(255, 107, 157, 0.5);
    }

    /* Logout button */
    .logout-btn {
      margin-top: 1rem;
      border-top: 1px solid var(--card-border, rgba(255,255,255,0.08));
      padding-top: 1rem;
      color: var(--text-muted, #94a3b8);
    }

    .logout-btn:hover {
      color: var(--danger, #EF4444);
      background-color: rgba(239, 68, 68, 0.08);
    }

    /* ===== Main content ===== */
    .customer-content {
      flex: 1;
      min-width: 0;
      padding: 2rem;
    }

    /* ===== Responsive: Mobile horizontal nav ===== */
    @media (max-width: 768px) {
      .customer-layout {
        flex-direction: column;
      }

      .sidebar {
        width: 100% !important;
        height: auto;
        position: relative;
        top: 0;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1rem;
        border-right: none;
        border-bottom: 1px solid var(--card-border, rgba(255,255,255,0.08));
      }

      .sidebar-toggle {
        display: none;
      }

      .user-greeting {
        padding: 0.75rem;
      }

      .sidebar .user-info {
        display: block !important;
      }

      .sidebar-nav {
        flex-direction: row;
        overflow-x: auto;
        gap: 0.25rem;
        padding-bottom: 0.25rem;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }

      .sidebar-nav::-webkit-scrollbar {
        display: none;
      }

      .sidebar-link {
        flex-shrink: 0;
        white-space: nowrap;
        padding: 0.6rem 0.85rem;
        font-size: 0.8rem;
        gap: 0.5rem;
        justify-content: flex-start !important;
      }

      .sidebar-link .link-label {
        display: inline !important;
      }

      .logout-btn {
        margin-top: 0;
        border-top: none;
        padding-top: 0.6rem;
      }

      .customer-content {
        padding: 1.25rem 1rem;
      }
    }
  `]
})
export class CustomerLayoutComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private clienteService = inject(ClienteService);
  private router = inject(Router);

  sidebarCollapsed = signal(false);
  hasProfilePhoto = signal(false);

  userInitial = computed(() => {
    const user = this.authService.currentUser();
    if (user && 'nombre' in user && (user as any).nombre) {
      return (user as any).nombre.charAt(0).toUpperCase();
    }
    if (user && 'email' in user && user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  });

  userName = computed(() => {
    const user = this.authService.currentUser();
    if (user && 'nombre' in user && (user as any).nombre) {
      return (user as any).nombre;
    }
    return 'Usuario';
  });

  userEmail = computed(() => {
    const user = this.authService.currentUser();
    return user?.email ?? '';
  });

  profilePhotoUrl = computed(() => {
    const user = this.authService.currentUser();
    const id = (user as any)?.id;
    if (!id) return '';
    return this.clienteService.getFotoPerfilUrl(id) + '?v=' + Date.now();
  });

  constructor() {
    const user = this.authService.currentUser();
    if ((user as any)?.id) {
      this.hasProfilePhoto.set(true);
    }
  }

  navLinks = [
    { path: '/customer/dashboard', label: 'Dashboard', icon: 'fa-house', badge: null as (() => number) | null },
    { path: '/customer/mi-sesion', label: 'Mi Sesion', icon: 'fa-utensils', badge: null },
    { path: '/customer/notificaciones', label: 'Notificaciones', icon: 'fa-bell', badge: () => this.notificationService.unreadCount() },
    { path: '/customer/facturas', label: 'Mis Facturas', icon: 'fa-file-invoice', badge: null },
  ];

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  onImageError(): void {
    this.hasProfilePhoto.set(false);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/public']);
  }
}
