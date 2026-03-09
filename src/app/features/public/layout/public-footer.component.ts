import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsletterService } from '../../../core/services/newsletter.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Wave separator -->
    <div class="footer-wave">
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,20 1440,30 L1440,60 L0,60 Z" />
      </svg>
    </div>

    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-grid">

          <!-- Column 1: Brand -->
          <div class="footer-col brand-col">
            <a class="logo" routerLink="/public">
              <img class="logo-img" src="assets/GGBarPhotoSlide/GiberGamesBarLogo.webp" alt="Giber Games Bar" />
            </a>
            <p class="brand-description">
              Tu espacio para jugar, comer y disfrutar. Mas de 200 juegos de mesa,
              cerveza, refrescos, comida rica y la mejor ludoteca de Alcorcon.
            </p>
            <div class="social-icons">
              <a href="https://www.instagram.com/gibergamesbar/" target="_blank" rel="noopener" class="social-link" aria-label="Instagram">
                <i class="fa-brands fa-instagram"></i>
              </a>
              <a href="https://www.instagram.com/gibergames/" target="_blank" rel="noopener" class="social-link" aria-label="Instagram Giber Games">
                <i class="fa-brands fa-instagram"></i>
              </a>
              <a href="https://x.com/giber_games" target="_blank" rel="noopener" class="social-link" aria-label="X (Twitter)">
                <svg class="x-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@gibergamesbar" target="_blank" rel="noopener" class="social-link" aria-label="TikTok">
                <i class="fa-brands fa-tiktok"></i>
              </a>
            </div>
          </div>

          <!-- Column 2: Quick Links -->
          <div class="footer-col">
            <h4 class="col-title">Descubre</h4>
            <ul class="footer-links">
              <li><a routerLink="/public/juegos"><i class="fa-solid fa-dice"></i> Catalogo de Juegos</a></li>
              <li><a routerLink="/public/carta"><i class="fa-solid fa-utensils"></i> Nuestra Carta</a></li>
              <li><a routerLink="/public/eventos"><i class="fa-solid fa-calendar-days"></i> Eventos</a></li>
              <li><a routerLink="/public/reservas"><i class="fa-solid fa-chair"></i> Reservar Mesa</a></li>
              <li><a routerLink="/public/encuentra-tu-juego"><i class="fa-solid fa-magnifying-glass"></i> Encuentra tu Juego</a></li>
            </ul>
          </div>

          <!-- Column 3: Contact & Hours -->
          <div class="footer-col">
            <h4 class="col-title">Contacto</h4>
            <ul class="contact-list">
              <li>
                <i class="fa-solid fa-location-dot"></i>
                <span>Av. Alcalde Jose Aranda 57, 28925 Alcorcon, Madrid</span>
              </li>
              <li>
                <i class="fa-solid fa-phone"></i>
                <span>+34 614 449 475</span>
              </li>
              <li>
                <i class="fa-solid fa-envelope"></i>
                <span>gibergamesbar&#64;gmail.com</span>
              </li>
            </ul>
            <div class="contact-divider"></div>
            <div class="hours">
              <p class="hours-title"><i class="fa-regular fa-clock"></i> Horario</p>
              <p class="hours-line"><span class="hours-day">Lunes:</span> Cerrado</p>
              <p class="hours-line"><span class="hours-day">Mar-Jue:</span> 17:00 - 23:00</p>
              <p class="hours-line"><span class="hours-day">Vie:</span> 17:00 - 00:00</p>
              <p class="hours-line"><span class="hours-day">Sab:</span> 12:00 - 00:00</p>
              <p class="hours-line"><span class="hours-day">Dom:</span> 12:00 - 22:00</p>
            </div>
          </div>

          <!-- Column 4: Newsletter + Map -->
          <div class="footer-col">
            <h4 class="col-title">Newsletter</h4>
            <p class="newsletter-description">
              Recibe novedades, eventos y ofertas exclusivas.
            </p>
            <form class="newsletter-form" (submit)="onSubscribe($event)">
              <div class="newsletter-row">
                <input
                  type="email"
                  class="newsletter-input"
                  placeholder="Tu email"
                  [value]="email()"
                  (input)="email.set($any($event.target).value)"
                  required
                />
                <button type="submit" class="newsletter-btn">
                  <i class="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </form>

            <!-- Mini map -->
            <div class="map-wrapper">
              <iframe
                class="map-iframe"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3040.5!2d-3.8258!3d40.3456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd4187e5d2e6ad5b%3A0x5b2a7c07e1c9c0!2sGiber%20Games%20Bar!5e0!3m2!1ses!2ses!4v1700000000000!5m2!1ses!2ses"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Ubicacion Giber Games Bar"
              ></iframe>
            </div>
          </div>

        </div>
      </div>

      <!-- Scroll to top -->
      <button class="scroll-top-btn" (click)="scrollToTop()" aria-label="Volver arriba">
        <i class="fa-solid fa-chevron-up"></i>
      </button>

      <!-- Bottom bar -->
      <div class="footer-bottom">
        <div class="footer-bottom-inner">
          <p class="copyright">
            &copy; 2026 Giber Games Bar. Todos los derechos reservados.
          </p>
          @if (authService.currentRole() === 'ADMIN') {
            <a class="admin-link" routerLink="/admin">Panel Admin</a>
          }
        </div>
      </div>
    </footer>
  `,
  styles: [`
    /* ===== Host ===== */
    :host {
      display: block;
    }

    /* ===== Wave separator ===== */
    .footer-wave {
      margin-bottom: -2px;
    }

    .footer-wave svg {
      display: block;
      width: 100%;
      height: 40px;
    }

    .footer-wave path {
      fill: var(--card-bg);
    }

    :host-context([data-theme="dark"]) .footer-wave path {
      fill: var(--secondary-dark);
    }

    /* ===== Footer shell ===== */
    .footer {
      background-color: var(--card-bg);
      color: var(--text-main);
      position: relative;
    }

    :host-context([data-theme="dark"]) .footer {
      background-color: var(--secondary-dark);
      color: var(--text-white);
    }

    /* ===== Inner container ===== */
    .footer-inner {
      max-width: var(--max-content-width, 1280px);
      margin: 0 auto;
      padding: 2rem 1.5rem 2.5rem;
    }

    /* ===== Grid layout ===== */
    .footer-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
      gap: 2.5rem;
    }

    /* ===== Column base ===== */
    .footer-col {
      display: flex;
      flex-direction: column;
    }

    /* ===== Column titles ===== */
    .col-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 1.25rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      position: relative;
      padding-bottom: 0.75rem;
    }

    :host-context([data-theme="dark"]) .col-title {
      color: var(--text-white);
    }

    .col-title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 32px;
      height: 2px;
      background-color: var(--primary-coral);
      border-radius: 1px;
    }

    /* ===== Column 1: Brand ===== */
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      text-decoration: none;
      margin-bottom: 1rem;
    }

    .logo-img {
      height: 36px;
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 0 8px rgba(0, 255, 209, 0.3));
      transition: filter 0.3s;
    }

    .logo:hover .logo-img {
      filter: drop-shadow(0 0 14px rgba(0, 255, 209, 0.5));
    }

    :host-context([data-theme="dark"]) .logo-img {
      filter: invert(1) hue-rotate(180deg) drop-shadow(0 0 8px rgba(0, 255, 209, 0.3));
    }

    :host-context([data-theme="dark"]) .logo:hover .logo-img {
      filter: invert(1) hue-rotate(180deg) drop-shadow(0 0 14px rgba(0, 255, 209, 0.5));
    }

    .brand-description {
      font-size: 0.875rem;
      line-height: 1.65;
      color: var(--text-muted);
      margin: 0 0 1.25rem;
    }

    /* ===== Social icons ===== */
    .social-icons {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .social-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      font-size: 1rem;
      text-decoration: none;
      transition: color 0.25s, border-color 0.25s, background-color 0.25s, transform 0.15s;
    }

    .social-link:hover {
      color: var(--neon-cyan);
      border-color: var(--neon-cyan);
      background-color: rgba(0, 255, 209, 0.08);
      transform: translateY(-2px);
    }

    .x-icon {
      width: 1rem;
      height: 1rem;
    }

    /* ===== Column 2: Quick Links ===== */
    .footer-links {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s, padding-left 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .footer-links a i {
      width: 16px;
      text-align: center;
      font-size: 0.8rem;
      opacity: 0.6;
      transition: opacity 0.2s, color 0.2s;
    }

    .footer-links a:hover {
      color: var(--primary-coral);
      padding-left: 4px;
    }

    .footer-links a:hover i {
      opacity: 1;
      color: var(--primary-coral);
    }

    /* ===== Column 3: Contact ===== */
    .contact-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .contact-list li {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .contact-list li i {
      color: var(--primary-coral);
      font-size: 0.9rem;
      margin-top: 2px;
      width: 16px;
      text-align: center;
      flex-shrink: 0;
    }

    .contact-divider {
      height: 1px;
      background-color: var(--card-border);
      margin: 1rem 0;
    }

    .hours {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .hours-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-main);
      margin: 0 0 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .hours-title i {
      color: var(--primary-coral);
      font-size: 0.85rem;
    }

    :host-context([data-theme="dark"]) .hours-title {
      color: var(--text-white);
    }

    .hours-line {
      font-size: 0.825rem;
      color: var(--text-muted);
      margin: 0;
    }

    .hours-day {
      font-weight: 600;
      color: var(--text-main);
      min-width: 55px;
      display: inline-block;
    }

    :host-context([data-theme="dark"]) .hours-day {
      color: var(--text-white);
    }

    /* ===== Column 4: Newsletter ===== */
    .newsletter-description {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin: 0 0 1rem;
    }

    .newsletter-form {
      margin-bottom: 1.25rem;
    }

    .newsletter-row {
      display: flex;
      gap: 0;
    }

    .newsletter-input {
      flex: 1;
      padding: 0.65rem 0.9rem;
      font-size: 0.875rem;
      color: var(--text-main);
      background-color: var(--bg-main);
      border: 1px solid var(--card-border);
      border-right: none;
      border-radius: 8px 0 0 8px;
      outline: none;
      transition: border-color 0.25s, box-shadow 0.25s;
      box-sizing: border-box;
      min-width: 0;
    }

    :host-context([data-theme="dark"]) .newsletter-input {
      color: var(--text-white);
      background-color: rgba(255, 255, 255, 0.06);
    }

    .newsletter-input::placeholder {
      color: var(--text-muted);
    }

    .newsletter-input:focus {
      border-color: var(--neon-cyan);
      box-shadow: 0 0 0 3px rgba(0, 255, 209, 0.12);
    }

    .newsletter-btn {
      padding: 0.65rem 1rem;
      font-size: 1rem;
      color: var(--text-white);
      background-color: var(--primary-coral);
      border: none;
      border-radius: 0 8px 8px 0;
      cursor: pointer;
      transition: background-color 0.25s, transform 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .newsletter-btn:hover {
      filter: brightness(1.1);
    }

    .newsletter-btn:active {
      transform: scale(0.96);
    }

    /* ===== Mini Map ===== */
    .map-wrapper {
      border-radius: var(--radius-md, 8px);
      overflow: hidden;
      border: 1px solid var(--card-border);
      aspect-ratio: 16 / 9;
    }

    .map-iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }

    :host-context([data-theme="dark"]) .map-iframe {
      filter: invert(0.9) hue-rotate(180deg) brightness(0.95) contrast(1.1);
    }

    /* ===== Scroll to top ===== */
    .scroll-top-btn {
      position: absolute;
      right: 2rem;
      top: -20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid var(--card-border);
      background-color: var(--card-bg);
      color: var(--primary-coral);
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      box-shadow: var(--shadow-md);
    }

    .scroll-top-btn:hover {
      transform: translateY(-3px);
      border-color: var(--primary-coral);
      box-shadow: var(--shadow-lg);
    }

    :host-context([data-theme="dark"]) .scroll-top-btn {
      background-color: var(--secondary-light);
      color: var(--neon-cyan);
    }

    :host-context([data-theme="dark"]) .scroll-top-btn:hover {
      border-color: var(--neon-cyan);
    }

    /* ===== Bottom bar ===== */
    .footer-bottom {
      border-top: 1px solid var(--card-border);
      background-color: var(--secondary-bg);
    }

    :host-context([data-theme="dark"]) .footer-bottom {
      background-color: rgba(0, 0, 0, 0.15);
    }

    .footer-bottom-inner {
      max-width: var(--max-content-width, 1280px);
      margin: 0 auto;
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .copyright {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0;
    }

    .admin-link {
      font-size: 0.8rem;
      color: var(--text-muted);
      text-decoration: none;
      padding: 0.4rem 1rem;
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md, 8px);
      transition: color 0.2s, background-color 0.2s, border-color 0.2s;
      cursor: pointer;
    }

    :host-context([data-theme="dark"]) .admin-link {
      color: var(--text-white);
    }

    .admin-link:hover {
      color: var(--primary-coral);
      border-color: var(--primary-coral);
      background-color: rgba(255, 127, 80, 0.08);
    }

    :host-context([data-theme="dark"]) .admin-link:hover {
      color: var(--neon-cyan, #00FFD1);
      border-color: var(--neon-cyan, #00FFD1);
      background-color: rgba(0, 255, 209, 0.08);
    }

    /* ===== Responsive - Tablet ===== */
    @media (max-width: 1024px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2.5rem 2rem;
      }

      .footer-inner {
        padding: 2rem 1.25rem;
      }

      .scroll-top-btn {
        right: 1.25rem;
      }
    }

    /* ===== Responsive - Mobile ===== */
    @media (max-width: 768px) {
      .footer-inner {
        padding: 1.5rem 1rem;
      }

      .footer-grid {
        grid-template-columns: 1fr;
        gap: 1.75rem;
      }

      .col-title {
        font-size: 0.95rem;
        margin-bottom: 1rem;
      }

      .brand-description {
        font-size: 0.825rem;
      }

      .social-link {
        width: 36px;
        height: 36px;
        font-size: 0.95rem;
      }

      .footer-links a {
        font-size: 0.85rem;
      }

      .contact-list li {
        font-size: 0.825rem;
        gap: 0.5rem;
      }

      .hours-line {
        font-size: 0.8rem;
      }

      .newsletter-input {
        font-size: 16px;
        padding: 0.6rem 0.8rem;
      }

      .newsletter-btn {
        padding: 0.6rem 0.875rem;
      }

      .footer-bottom-inner {
        flex-direction: column;
        gap: 0.75rem;
        text-align: center;
        padding: 1rem;
      }

      .copyright {
        font-size: 0.75rem;
      }

      .scroll-top-btn {
        right: 1rem;
        width: 36px;
        height: 36px;
        font-size: 0.8rem;
      }

      .footer-wave svg {
        height: 25px;
      }
    }

    /* ===== Responsive - Small Phone ===== */
    @media (max-width: 480px) {
      .footer-inner {
        padding: 1.25rem 0.75rem;
      }

      .footer-grid {
        gap: 1.5rem;
      }

      .logo-img {
        height: 30px;
      }

      .social-link {
        width: 34px;
        height: 34px;
      }

      .col-title {
        font-size: 0.9rem;
      }

      .footer-links a {
        font-size: 0.8rem;
      }

      .contact-list li {
        font-size: 0.8rem;
      }

      .newsletter-description {
        font-size: 0.825rem;
      }

      .footer-wave svg {
        height: 18px;
      }
    }
  `]
})
export class PublicFooterComponent {
  // ---------- DI ----------
  private readonly newsletterService = inject(NewsletterService);
  protected readonly authService = inject(AuthService);

  // ---------- State ----------
  email = signal('');

  // ---------- Actions ----------
  onSubscribe(event: Event): void {
    event.preventDefault();
    const value = this.email().trim();
    if (!value) return;

    const success = this.newsletterService.subscribe(value);
    if (success) {
      this.email.set('');
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
