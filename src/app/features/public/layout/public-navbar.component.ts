import { Component, inject, signal, HostListener, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
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
          <img class="logo-img" src="assets/GGBarPhotoSlide/GiberGamesBarLogo.webp" alt="Giber Games Bar" />
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

          <!-- Staff button (visible for EMPLEADO) -->
          @if (currentRole() === 'EMPLEADO') {
            <a class="btn btn-sm staff-btn" routerLink="/staff/dashboard">
              <i class="fa-solid fa-id-badge"></i> Panel Staff
            </a>
          }

          <!-- Notification bell -->
          @if (authService.isAuthenticated()) {
            <a class="action-btn notification-btn" routerLink="/customer/notificaciones">
              <i class="fa-solid fa-bell"></i>
              @if (notificationService.unreadCount() > 0) {
                <span class="badge">{{ notificationService.unreadCount() }}</span>
              }
            </a>
          }

          <!-- User avatar or Login button -->
          @if (authService.isAuthenticated()) {
            <div class="user-menu-wrapper">
              <button class="user-avatar" (click)="toggleUserMenu($event)">
                {{ userInitial() }}
              </button>
              @if (userMenuOpen()) {
                <div class="user-dropdown">
                  <a class="user-dropdown-item" [routerLink]="profileRoute()" (click)="closeUserMenu()">
                    @switch (currentRole()) {
                      @case ('ADMIN') { <i class="fa-solid fa-shield-halved"></i> Panel Admin }
                      @case ('EMPLEADO') { <i class="fa-solid fa-id-badge"></i> Panel Staff }
                      @default { <i class="fa-solid fa-user"></i> Mi Panel }
                    }
                  </a>
                  <div class="user-dropdown-divider"></div>
                  <button class="user-dropdown-item logout-item" (click)="confirmLogout()">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    Cerrar sesión
                  </button>
                </div>
              }
            </div>
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
                [routerLink]="profileRoute()"
                (click)="closeMobileMenu()"
              >
                @switch (currentRole()) {
                  @case ('ADMIN') { <i class="fa-solid fa-shield-halved"></i> Panel Admin }
                  @case ('EMPLEADO') { <i class="fa-solid fa-id-badge"></i> Panel Staff }
                  @default { <i class="fa-solid fa-user"></i> Mi Panel }
                }
              </a>
              <button
                class="mobile-link mobile-logout"
                (click)="closeMobileMenu(); confirmLogout()"
              >
                <i class="fa-solid fa-right-from-bracket"></i>
                Cerrar sesión
              </button>
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

    <!-- Logout confirmation modal (fuera del nav para evitar stacking context) -->
    @if (showLogoutConfirm()) {
      <div class="modal-overlay" (click)="cancelLogout()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-icon">
            <i class="fa-solid fa-right-from-bracket"></i>
          </div>
          <h3 class="modal-title">Cerrar sesión</h3>
          <p class="modal-text">¿Estás seguro de que quieres salir de tu cuenta?</p>
          <div class="modal-actions">
            <button class="modal-btn modal-btn-cancel" (click)="cancelLogout()">Cancelar</button>
            <button class="modal-btn modal-btn-confirm" (click)="doLogout()">Sí, salir</button>
          </div>
        </div>
      </div>
    }
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
      background: rgba(240, 241, 243, 0.9);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: background 0.35s ease, box-shadow 0.35s ease, backdrop-filter 0.35s ease;
      z-index: 1000;
    }

    :host-context([data-theme="dark"]) .navbar {
      background: rgba(15, 23, 42, 0.92);
    }

    .navbar.scrolled {
      background: var(--card-bg);
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    /* ===== Inner layout ===== */
    .navbar-inner {
      display: flex;
      align-items: center;
      position: relative;
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
      margin-right: auto;
    }

    .logo-img {
      height: 42px;
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.15));
      transition: filter 0.3s;
    }

    .logo:hover .logo-img {
      filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.25));
    }

    :host-context([data-theme="dark"]) .logo-img {
      filter: drop-shadow(0 0 8px rgba(0, 255, 209, 0.3));
    }

    :host-context([data-theme="dark"]) .logo:hover .logo-img {
      filter: drop-shadow(0 0 14px rgba(0, 255, 209, 0.5));
    }

    /* ===== Desktop nav links ===== */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      list-style: none;
      margin: 0;
      padding: 0;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
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

    .navbar.scrolled .nav-link:hover {
      background-color: var(--secondary-bg);
    }

    :host-context([data-theme="dark"]) .navbar.scrolled .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.06);
    }

    .nav-link.active {
      color: var(--primary-coral);
      font-weight: 600;
    }

    :host-context([data-theme="dark"]) .nav-link.active {
      color: var(--neon-cyan);
      text-shadow: 0 0 10px var(--neon-cyan), 0 0 20px rgba(0, 255, 209, 0.3);
    }

    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: 2px;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 2px;
      background-color: var(--primary-coral);
      border-radius: 1px;
    }

    :host-context([data-theme="dark"]) .nav-link.active::after {
      background-color: var(--neon-cyan);
      box-shadow: 0 0 8px var(--neon-cyan);
    }

    /* ===== Actions (right side) ===== */
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
      margin-left: auto;
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

    .navbar.scrolled .action-btn:hover {
      background-color: var(--secondary-bg);
    }

    :host-context([data-theme="dark"]) .navbar.scrolled .action-btn:hover {
      background-color: rgba(255, 255, 255, 0.08);
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

    /* ===== User dropdown menu ===== */
    .user-menu-wrapper {
      position: relative;
    }

    .user-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 180px;
      background-color: var(--card-bg, #FFFFFF);
      border: 1px solid var(--card-border, #E5E7EB);
      border-radius: var(--radius-md, 8px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      padding: 0.375rem 0;
      animation: dropdownFade 0.15s ease-out;
      z-index: 1001;
    }

    :host-context([data-theme="dark"]) .user-dropdown {
      background-color: #1E293B;
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }

    @keyframes dropdownFade {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .user-dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      width: 100%;
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-main);
      background: none;
      border: none;
      text-decoration: none;
      cursor: pointer;
      transition: background-color 0.15s;
    }

    .user-dropdown-item:hover {
      background-color: var(--secondary-bg, #F3F4F6);
    }

    :host-context([data-theme="dark"]) .user-dropdown-item:hover {
      background-color: rgba(255, 255, 255, 0.06);
    }

    .user-dropdown-item i {
      width: 16px;
      text-align: center;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .logout-item {
      color: var(--danger, #EF4444);
    }

    .logout-item i {
      color: var(--danger, #EF4444);
    }

    .user-dropdown-divider {
      height: 1px;
      background-color: var(--card-border, #E5E7EB);
      margin: 0.25rem 0;
    }

    :host-context([data-theme="dark"]) .user-dropdown-divider {
      background-color: rgba(255, 255, 255, 0.08);
    }

    /* ===== Logout confirm modal ===== */
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: fadeIn 0.15s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-card {
      width: 100%;
      max-width: 360px;
      background-color: var(--card-bg, #FFFFFF);
      border: 1px solid var(--card-border, #E5E7EB);
      border-radius: var(--radius-lg, 16px);
      padding: 2rem;
      text-align: center;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
      animation: modalScale 0.2s ease-out;
    }

    :host-context([data-theme="dark"]) .modal-card {
      background-color: #1E293B;
      border-color: rgba(255, 255, 255, 0.08);
    }

    @keyframes modalScale {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .modal-icon {
      font-size: 2.5rem;
      color: var(--danger, #EF4444);
      margin-bottom: 1rem;
    }

    .modal-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 0.5rem;
    }

    .modal-text {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin: 0 0 1.5rem;
      line-height: 1.5;
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
    }

    .modal-btn {
      flex: 1;
      padding: 0.65rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      border: none;
      border-radius: var(--radius-md, 8px);
      cursor: pointer;
      transition: background-color 0.2s, transform 0.1s;
    }

    .modal-btn:active {
      transform: scale(0.97);
    }

    .modal-btn-cancel {
      background-color: var(--secondary-bg, #F3F4F6);
      color: var(--text-main);
    }

    .modal-btn-cancel:hover {
      background-color: var(--input-border, #D1D5DB);
    }

    :host-context([data-theme="dark"]) .modal-btn-cancel {
      background-color: rgba(255, 255, 255, 0.08);
    }

    :host-context([data-theme="dark"]) .modal-btn-cancel:hover {
      background-color: rgba(255, 255, 255, 0.14);
    }

    .modal-btn-confirm {
      background-color: var(--danger, #EF4444);
      color: #FFFFFF;
    }

    .modal-btn-confirm:hover {
      background-color: #DC2626;
    }

    /* ===== Mobile logout ===== */
    .mobile-logout {
      width: 100%;
      background: none;
      border: none;
      font-family: inherit;
      color: var(--danger, #EF4444);
      cursor: pointer;
    }

    /* ===== Login button ===== */
    .login-btn {
      text-decoration: none;
      white-space: nowrap;
      font-size: 0.8125rem;
    }

    /* ===== Staff button ===== */
    .staff-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      text-decoration: none;
      white-space: nowrap;
      font-size: 0.8125rem;
      font-weight: 600;
      padding: 0.375rem 0.875rem;
      border-radius: var(--radius-md, 8px);
      background-color: var(--info, #3B82F6);
      color: #fff;
      transition: background-color 0.2s, transform 0.15s;
    }

    .staff-btn:hover {
      background-color: #2563EB;
      transform: scale(1.03);
    }

    .staff-btn i { font-size: 0.75rem; }

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
      background-color: var(--secondary-bg);
    }

    :host-context([data-theme="dark"]) .mobile-link:hover {
      background-color: rgba(255, 255, 255, 0.06);
    }

    .mobile-link.active {
      color: var(--primary-coral);
      font-weight: 600;
      background-color: rgba(255, 127, 80, 0.08);
    }

    :host-context([data-theme="dark"]) .mobile-link.active {
      color: var(--neon-cyan);
      background-color: rgba(0, 255, 209, 0.06);
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

    /* ===== Responsive - Tablet ===== */
    @media (max-width: 1024px) and (min-width: 769px) {
      .navbar-inner {
        padding: 0 1rem;
      }

      .nav-link {
        padding: 0.4rem 0.65rem;
        font-size: 0.8rem;
      }

      .action-btn {
        width: 36px;
        height: 36px;
      }

      .user-avatar {
        width: 34px;
        height: 34px;
        font-size: 0.8rem;
      }

      .staff-btn {
        padding: 0.3rem 0.7rem;
        font-size: 0.75rem;
      }

      .login-btn {
        font-size: 0.75rem;
        padding: 0.35rem 0.75rem;
      }
    }

    /* ===== Responsive - Mobile ===== */
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

      .logo-img {
        height: 36px;
      }

      .action-btn {
        width: 36px;
        height: 36px;
        font-size: 1rem;
      }

      .mobile-menu {
        padding: 0.75rem 1rem 1rem;
      }

      .mobile-link {
        padding: 0.65rem 0.85rem;
        font-size: 0.9rem;
      }

      .staff-btn {
        padding: 0.3rem 0.7rem;
        font-size: 0.75rem;
      }

      .modal-card {
        max-width: min(360px, 90vw);
        padding: 1.5rem;
      }
    }

    /* ===== Responsive - Small Phone ===== */
    @media (max-width: 480px) {
      .navbar-inner {
        padding: 0 0.75rem;
        gap: 0.25rem;
      }

      .logo-img {
        height: 32px;
      }

      .action-btn {
        width: 34px;
        height: 34px;
        font-size: 0.95rem;
      }

      .nav-actions {
        gap: 0.25rem;
      }

      .mobile-link {
        padding: 0.55rem 0.75rem;
        font-size: 0.85rem;
      }

      .modal-card {
        padding: 1.25rem;
      }

      .modal-title {
        font-size: 1rem;
      }

      .modal-text {
        font-size: 0.85rem;
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
  private router = inject(Router);

  // ---------- State ----------
  isScrolled = signal(false);
  mobileMenuOpen = signal(false);
  userMenuOpen = signal(false);
  showLogoutConfirm = signal(false);

  // ---------- Computed ----------
  currentRole = computed(() => this.authService.currentRole());

  profileRoute = computed(() => {
    switch (this.currentRole()) {
      case 'ADMIN': return '/admin/dashboard';
      case 'EMPLEADO': return '/staff/dashboard';
      default: return '/customer/dashboard';
    }
  });

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
    { label: 'Contacto', path: '/public/contacto' },
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

  // ---------- User menu ----------
  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.userMenuOpen.update(open => !open);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.userMenuOpen.set(false);
  }

  // ---------- Logout ----------
  confirmLogout(): void {
    this.userMenuOpen.set(false);
    this.showLogoutConfirm.set(true);
  }

  cancelLogout(): void {
    this.showLogoutConfirm.set(false);
  }

  doLogout(): void {
    this.showLogoutConfirm.set(false);
    this.authService.logout();
    this.router.navigate(['/public']);
  }
}
