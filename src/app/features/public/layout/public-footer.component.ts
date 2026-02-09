import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsletterService } from '../../../core/services/newsletter.service';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
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
                <i class="fa-brands fa-x-twitter"></i>
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
              <li><a routerLink="/public/juegos">Catalogo de Juegos</a></li>
              <li><a routerLink="/public/carta">Nuestra Carta</a></li>
              <li><a routerLink="/public/eventos">Eventos</a></li>
              <li><a routerLink="/public/reservas">Reservar Mesa</a></li>
              <li><a routerLink="/public/encuentra-tu-juego">Encuentra tu Juego</a></li>
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
              <p class="hours-title">Horario:</p>
              <p class="hours-line">Lunes: Cerrado</p>
              <p class="hours-line">Mar-Jue: 17:00 - 23:00</p>
              <p class="hours-line">Vie: 17:00 - 00:00</p>
              <p class="hours-line">Sab: 12:00 - 00:00</p>
              <p class="hours-line">Dom: 12:00 - 22:00</p>
            </div>
          </div>

          <!-- Column 4: Newsletter -->
          <div class="footer-col">
            <h4 class="col-title">Newsletter</h4>
            <p class="newsletter-description">
              Recibe novedades, eventos y ofertas exclusivas.
            </p>
            <form class="newsletter-form" (submit)="onSubscribe($event)">
              <input
                type="email"
                class="newsletter-input"
                placeholder="Tu email"
                [value]="email()"
                (input)="email.set($any($event.target).value)"
                required
              />
              <button type="submit" class="newsletter-btn">
                Suscribirse
              </button>
            </form>
          </div>

        </div>
      </div>

      <!-- Bottom bar -->
      <div class="footer-bottom">
        <div class="footer-bottom-inner">
          <p class="copyright">
            &copy; 2026 Giber Games Bar. Todos los derechos reservados.
          </p>
          <a class="admin-link" routerLink="/admin">Panel Admin</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    /* ===== Host ===== */
    :host {
      display: block;
    }

    /* ===== Footer shell ===== */
    .footer {
      background-color: var(--secondary-dark);
      color: var(--text-white);
    }

    /* ===== Inner container ===== */
    .footer-inner {
      max-width: var(--max-content-width, 1280px);
      margin: 0 auto;
      padding: 3.5rem 1.5rem 2.5rem;
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
      color: var(--text-white);
      margin: 0 0 1.25rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      position: relative;
      padding-bottom: 0.75rem;
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
      display: inline-block;
    }

    .footer-links a:hover {
      color: var(--primary-coral);
      padding-left: 4px;
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
      color: var(--text-white);
      margin: 0 0 0.25rem;
    }

    .hours-line {
      font-size: 0.825rem;
      color: var(--text-muted);
      margin: 0;
    }

    /* ===== Column 4: Newsletter ===== */
    .newsletter-description {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin: 0 0 1.25rem;
    }

    .newsletter-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .newsletter-input {
      width: 100%;
      padding: 0.7rem 0.9rem;
      font-size: 0.875rem;
      color: var(--text-white);
      background-color: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      outline: none;
      transition: border-color 0.25s, box-shadow 0.25s;
      box-sizing: border-box;
    }

    .newsletter-input::placeholder {
      color: var(--text-muted);
    }

    .newsletter-input:focus {
      border-color: var(--neon-cyan);
      box-shadow: 0 0 0 3px rgba(0, 255, 209, 0.12);
    }

    .newsletter-btn {
      padding: 0.7rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #fff;
      background-color: var(--primary-coral);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.25s, transform 0.15s, box-shadow 0.25s;
    }

    .newsletter-btn:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(255, 107, 107, 0.35);
    }

    .newsletter-btn:active {
      transform: translateY(0);
    }

    /* ===== Bottom bar ===== */
    .footer-bottom {
      border-top: 1px solid var(--card-border);
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
      transition: color 0.2s;
    }

    .admin-link:hover {
      color: var(--primary-coral);
    }

    /* ===== Responsive ===== */
    @media (max-width: 1024px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2.5rem 2rem;
      }
    }

    @media (max-width: 640px) {
      .footer-inner {
        padding: 2.5rem 1.25rem 2rem;
      }

      .footer-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .footer-bottom-inner {
        flex-direction: column;
        gap: 0.75rem;
        text-align: center;
      }

      .newsletter-form {
        flex-direction: column;
      }
    }
  `]
})
export class PublicFooterComponent {
  // ---------- DI ----------
  private readonly newsletterService = inject(NewsletterService);

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
}
