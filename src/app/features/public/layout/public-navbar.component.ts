import { Component, inject, signal, HostListener, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  template: `
    <nav
      class="navbar"
      [ngClass]="{ scrolled: isScrolled(), 'menu-open': mobileMenuOpen() }"
    >
      <div class="navbar-inner">
        <!-- Logo -->
        <a class="logo" routerLink="/public">
          <span class="logo-giber">GIBER</span>
          <span class="logo-bar">BAR</span>
        </a>

        <!-- Center nav links (desktop) -->
        <ul class="nav-links">
          @for (link of navLinks; track link.path) {
            <li>
              <a
                class="nav-link"
                [routerLink]="link.path"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: false }"
              >
                {{ link.label }}
              </a>
            </li>
          }
        </ul>

        <!-- Right side actions -->
        <div class="nav-actions">
          <!-- Theme toggle -->
          <button
            class="action-btn"
            (click)="themeService.toggleTheme()"
            [attr.aria-label]="themeService.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          >
            <i [ngClass]="themeService.isDark() ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"></i>
          </button>

          <!-- Notification bell -->
          <a class="action-btn notification-btn" routerLink="/customer/notificaciones">
            <i class="fa-solid fa-bell"></i>
            @if (notificationService.unreadCount() > 0) {
              <span class="badge">{{ notificationService.unreadCount() }}</span>
            }
          </a>

          <!-- User avatar or Login button -->
          @if (authService.isAuthenticated()) {
            <a class="user-avatar" routerLink="/customer/dashboard">
              {{ userInitial() }}
            </a>
          } @else {
            <a class="btn btn-primary btn-sm login-btn" routerLink="/auth/login">
              Entrar
            </a>
          }

          <!-- Mobile hamburger -->
          <button
            class="action-btn hamburger"
            (click)="toggleMobileMenu()"
            aria-label="Menu"
          >
            <i [ngClass]="mobileMenuOpen() ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'"></i>
          </button>
        </div>
      </div>

      <!-- Mobile dropdown menu -->
      @if (mobileMenuOpen()) {
        <div class="mobile-menu">
          <ul class="mobile-links">
            @for (link of navLinks; track link.path) {
              <li>
                <a
                  class="mobile-link"
                  [routerLink]="link.path"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: false }"
                  (click)="closeMobileMenu()"
                >
                  {{ link.label }}
                </a>
              </li>
            }
          </ul>

          <div class="mobile-divider"></div>

          <div class="mobile-actions">
            @if (authService.isAuthenticated()) {
              <a
                class="mobile-link"
                routerLink="/customer/dashboard"
                (click)="closeMobileMenu()"
              >
                <i class="fa-solid fa-user"></i>
                Mi cuenta
              </a>
            } @else {
              <a
                class="mobile-link login-mobile"
                routerLink="/auth/login"
                (click)="closeMobileMenu()"
              >
                <i class="fa-solid fa-right-to-bracket"></i>
                Entrar
              </a>
            }
            <a
              class="mobile-link"
              routerLink="/customer/notificaciones"
              (click)="closeMobileMenu()"
            >
              <i class="fa-solid fa-bell"></i>
              Notificaciones
              @if (notificationService.unreadCount() > 0) {
                <span class="badge mobile-badge">{{ notificationService.unreadCount() }}</span>
              }
            </a>
          </div>
        </div>
      }
    </nav>
  `,
  styles: [`
    /* ===== Host ===== */
    :host {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: var(--public-nav-height);
    }

    /* ===== Navbar shell ===== */
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--public-nav-height);
      background-color: transparent;
      transition: background-color 0.35s ease, box-shadow 0.35s ease, backdrop-filter 0.35s ease;
      z-index: 1000;
    }

    .navbar.scrolled {
      background-color: var(--card-bg);
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    /* ===== Inner layout ===== */
    .navbar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: var(--max-content-width);
      margin: 0 auto;
      height: 100%;
      padding: 0 1.5rem;
    }

    /* ===== Logo ===== */
    .logo {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      text-decoration: none;
      flex-shrink: 0;
    }

    .logo-giber {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-white);
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .logo-bar {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--neon-cyan);
      letter-spacing: 2px;
      text-transform: uppercase;
      text-shadow: 0 0 10px var(--neon-cyan), 0 0 20px rgba(0, 255, 209, 0.4);
    }

    /* ===== Desktop nav links ===== */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-link {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: var(--radius-md);
      transition: color 0.2s, background-color 0.2s, text-shadow 0.2s;
      position: relative;
    }

    .nav-link:hover {
      color: var(--text-main);
      background-color: rgba(255, 255, 255, 0.06);
    }

    .nav-link.active {
      color: var(--neon-cyan);
      font-weight: 600;
    }

    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: 2px;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 2px;
      background-color: var(--neon-cyan);
      border-radius: 1px;
      box-shadow: 0 0 8px var(--neon-cyan);
    }

    :host-context([data-theme="dark"]) .nav-link.active {
      text-shadow: 0 0 10px var(--neon-cyan), 0 0 20px rgba(0, 255, 209, 0.3);
    }

    /* ===== Actions (right side) ===== */
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border: none;
      border-radius: var(--radius-md);
      background-color: transparent;
      color: var(--text-muted);
      font-size: 1.05rem;
      cursor: pointer;
      transition: color 0.2s, background-color 0.2s, transform 0.15s;
      text-decoration: none;
      position: relative;
    }

    .action-btn:hover {
      color: var(--text-main);
      background-color: rgba(255, 255, 255, 0.08);
      transform: scale(1.08);
    }

    /* ===== Notification badge ===== */
    .notification-btn {
      position: relative;
    }

    .badge {
      position: absolute;
      top: 2px;
      right: 2px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 9999px;
      background-color: var(--neon-pink);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      box-shadow: 0 0 8px var(--neon-pink);
      pointer-events: none;
    }

    /* ===== User avatar ===== */
    .user-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple));
      color: #0F172A;
      font-size: 0.875rem;
      font-weight: 700;
      text-decoration: none;
      text-transform: uppercase;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.25s;
      flex-shrink: 0;
    }

    .user-avatar:hover {
      transform: scale(1.1);
      box-shadow: 0 0 14px var(--neon-cyan), 0 0 28px rgba(0, 255, 209, 0.25);
    }

    /* ===== Login button ===== */
    .login-btn {
      text-decoration: none;
      white-space: nowrap;
      font-size: 0.8125rem;
    }

    /* ===== Hamburger (hidden on desktop) ===== */
    .hamburger {
      display: none;
    }

    /* ===== Mobile menu dropdown ===== */
    .mobile-menu {
      display: none;
      position: absolute;
      top: var(--public-nav-height);
      left: 0;
      right: 0;
      background-color: var(--card-bg);
      border-top: 1px solid var(--card-border);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
      padding: 1rem 1.5rem 1.5rem;
      animation: slideDown 0.25s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .mobile-links {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .mobile-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: var(--radius-md);
      transition: color 0.2s, background-color 0.2s;
    }

    .mobile-link:hover {
      color: var(--text-main);
      background-color: rgba(255, 255, 255, 0.06);
    }

    .mobile-link.active {
      color: var(--neon-cyan);
      font-weight: 600;
      background-color: rgba(0, 255, 209, 0.06);
    }

    :host-context([data-theme="dark"]) .mobile-link.active {
      text-shadow: 0 0 8px var(--neon-cyan);
    }

    .mobile-link.login-mobile {
      color: var(--primary-coral);
      font-weight: 600;
    }

    .mobile-divider {
      height: 1px;
      background-color: var(--card-border);
      margin: 0.75rem 0;
    }

    .mobile-actions {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .mobile-badge {
      position: static;
      margin-left: auto;
    }

    /* ===== Responsive ===== */
    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }

      .login-btn {
        display: none;
      }

      .user-avatar {
        display: none;
      }

      .hamburger {
        display: inline-flex;
      }

      .mobile-menu {
        display: flex;
        flex-direction: column;
      }

      .navbar-inner {
        padding: 0 1rem;
      }
    }

    @media (min-width: 769px) {
      .mobile-menu {
        display: none !important;
      }
    }
  `]
})
export class PublicNavbarComponent {
  // ---------- DI ----------
  protected readonly themeService = inject(ThemeService);
  protected readonly authService = inject(AuthService);
  protected readonly notificationService = inject(NotificationService);

  // ---------- State ----------
  isScrolled = signal(false);
  mobileMenuOpen = signal(false);

  // ---------- Computed ----------
  userInitial = computed(() => {
    const user = this.authService.currentUser();
    if (user && 'nombre' in user && user.nombre) {
      return user.nombre.charAt(0).toUpperCase();
    }
    if (user && 'email' in user && user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  });

  // ---------- Nav config ----------
  readonly navLinks = [
    { label: 'Juegos', path: '/public/juegos' },
    { label: 'Carta', path: '/public/carta' },
    { label: 'Eventos', path: '/public/eventos' },
    { label: 'Reservar', path: '/public/reservas' },
    { label: 'Nosotros', path: '/public/nosotros' },
  ];

  // ---------- Scroll listener ----------
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
  }

  // ---------- Mobile menu ----------
  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(open => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
