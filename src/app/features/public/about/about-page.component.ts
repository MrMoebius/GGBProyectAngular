import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [RouterModule],
  template: `
    <!-- Hero Section -->
    <section class="about-hero">
      <img class="hero-bg-img" src="assets/GGBarPhotoSlide/GiberGamesBarSlide05.webp" alt="" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <img class="hero-logo" src="assets/GGBarPhotoSlide/GiberGamesBarLogo.webp" alt="Giber Games Bar" />
        <h1 class="hero-title">Sobre Giber Games Bar</h1>
        <p class="hero-subtitle">
          Cerveza, refrescos, comida rica y una amplia ludoteca.
          Tu bar de juegos de mesa en Alcorcon.
        </p>
      </div>
    </section>

    <!-- Our Story Section -->
    <section class="section story-section">
      <div class="story-grid">
        <div class="story-text">
          <h2 class="section-title">Nuestra Historia</h2>
          <p class="story-paragraph">
            Giber Games Bar nacio en 2025 de la pasion de su fundador por los juegos de mesa
            y de una idea clara: crear un espacio en Alcorcon donde las personas pudieran
            desconectar de la rutina, sentarse a una mesa y disfrutar de una buena partida
            acompanados de cerveza, refrescos y comida casera.
          </p>
          <p class="story-paragraph">
            Inaugurado en abril de 2025 en la Avenida Alcalde Jose Aranda 57, el bar
            rapidamente se convirtio en el punto de encuentro favorito de la comunidad
            ludica del sur de Madrid. Un lugar acogedor donde cualquier persona, sin
            importar su experiencia, puede descubrir la magia de jugar en compania.
          </p>
          <p class="story-paragraph">
            Hoy contamos con una coleccion de mas de 330 juegos de mesa de todos los
            generos: desde party games rapidos hasta eurogames de estrategia, pasando por
            cooperativos, juegos de rol, juegos infantiles y mucho mas. Y seguimos creciendo
            cada semana.
          </p>
        </div>
        <div class="story-image">
          <img src="assets/GGBarPhotoSlide/GiberGamesBarSlide01.webp" alt="Interior de Giber Games Bar" />
        </div>
      </div>
    </section>

    <!-- Numbers Section -->
    <section class="section numbers-section">
      <h2 class="section-title">Giber Games Bar en numeros</h2>
      <div class="numbers-grid">
        @for (stat of stats(); track stat.label) {
          <div class="stat-card">
            <i [class]="stat.icon"></i>
            <span class="stat-number">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        }
      </div>
    </section>

    <!-- Our Values Section -->
    <section class="section values-section">
      <h2 class="section-title">Que nos hace diferentes</h2>
      <p class="section-subtitle">Mas que un bar, un espacio para compartir</p>
      <div class="values-grid">
        @for (value of values(); track value.title) {
          <div class="card value-card">
            <div class="value-icon">
              <i [class]="value.icon"></i>
            </div>
            <h3 class="value-title">{{ value.title }}</h3>
            <p class="value-description">{{ value.description }}</p>
          </div>
        }
      </div>
    </section>

    <!-- Photo Gallery -->
    <section class="section gallery-section">
      <h2 class="section-title">Nuestro Espacio</h2>
      <p class="section-subtitle">Un vistazo a Giber Games Bar</p>
      <div class="gallery-grid">
        @for (photo of galleryPhotos; track photo) {
          <div class="gallery-item">
            <img [src]="photo" alt="Giber Games Bar" loading="lazy" />
          </div>
        }
      </div>
    </section>

    <!-- What We Offer Section -->
    <section class="section offer-section">
      <h2 class="section-title">Que ofrecemos</h2>
      <div class="offer-grid">
        @for (item of offerings(); track item.title) {
          <a [routerLink]="item.route" class="card offer-card">
            <i [class]="item.icon"></i>
            <h3 class="offer-title">{{ item.title }}</h3>
            <p class="offer-desc">{{ item.description }}</p>
          </a>
        }
      </div>
    </section>

    <!-- Social Section -->
    <section class="section social-section">
      <h2 class="section-title">Siguenos en redes</h2>
      <p class="section-subtitle">Enterate de novedades, eventos y recomendaciones</p>
      <div class="social-grid">
        <a href="https://www.instagram.com/gibergamesbar/" target="_blank" rel="noopener" class="social-card">
          <i class="fa-brands fa-instagram"></i>
          <span class="social-handle">&#64;gibergamesbar</span>
        </a>
        <a href="https://www.instagram.com/gibergames/" target="_blank" rel="noopener" class="social-card">
          <i class="fa-brands fa-instagram"></i>
          <span class="social-handle">&#64;gibergames</span>
        </a>
        <a href="https://x.com/giber_games" target="_blank" rel="noopener" class="social-card">
          <svg class="x-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          <span class="social-handle">&#64;giber_games</span>
        </a>
        <a href="https://www.tiktok.com/@gibergamesbar" target="_blank" rel="noopener" class="social-card">
          <i class="fa-brands fa-tiktok"></i>
          <span class="social-handle">&#64;gibergamesbar</span>
        </a>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">Ven a conocernos</h2>
        <div class="cta-info">
          <p class="cta-address">
            <i class="fa-solid fa-location-dot"></i>
            Av. Alcalde Jose Aranda 57, 28925 Alcorcon, Madrid
          </p>
        </div>
        <div class="cta-actions">
          <a routerLink="/public/reservas" class="btn btn-primary cta-button">
            <i class="fa-solid fa-calendar-check"></i>
            Reservar Mesa
          </a>
          <a routerLink="/public/contacto" class="btn btn-outline cta-button">
            <i class="fa-solid fa-envelope"></i>
            Contactar
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* Hero Section */
    .about-hero {
      position: relative;
      padding: 6rem 2rem 5rem;
      text-align: center;
      overflow: hidden;
      min-height: 340px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hero-bg-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(15, 23, 42, 0.7) 0%,
        rgba(15, 23, 42, 0.8) 60%,
        rgba(15, 23, 42, 0.95) 100%
      );
    }

    .hero-content {
      max-width: 700px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    .hero-logo {
      height: 180px;
      width: auto;
      margin-bottom: 1.5rem;
      filter: drop-shadow(0 0 12px rgba(0, 255, 209, 0.4));
    }

    .hero-title {
      font-size: 2.75rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 1rem 0;
    }

    .hero-subtitle {
      font-size: 1.15rem;
      color: #94A3B8;
      line-height: 1.7;
      margin: 0;
    }

    /* Story Section */
    .story-section {
      padding: 4rem 2rem;
      max-width: 1100px;
      margin: 0 auto;
    }

    .story-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
    }

    .story-text .section-title {
      text-align: left;
      margin-bottom: 1.5rem;
    }

    .story-paragraph {
      color: var(--text-muted);
      line-height: 1.8;
      margin: 0 0 1rem 0;
      font-size: 0.95rem;
    }

    .story-image {
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--card-border);
    }

    .story-image img {
      width: 100%;
      height: 100%;
      min-height: 320px;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
    }

    .story-image:hover img {
      transform: scale(1.05);
    }

    /* Numbers Section */
    .numbers-section {
      padding: 4rem 2rem;
      background: var(--secondary-bg);
      text-align: center;
    }

    .numbers-section .section-title {
      margin-bottom: 2.5rem;
    }

    .numbers-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
      padding: 2rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      transition: transform 0.3s ease, border-color 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      border-color: var(--primary-coral);
    }

    .stat-card > i {
      font-size: 1.5rem;
      color: var(--neon-cyan);
      margin-bottom: 0.25rem;
    }

    .stat-number {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--primary-coral);
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    /* Values Section */
    .values-section {
      padding: 4rem 2rem;
      max-width: 1100px;
      margin: 0 auto;
      text-align: center;
    }

    .values-section .section-title {
      margin-bottom: 0.5rem;
    }

    .values-section .section-subtitle {
      margin-bottom: 2.5rem;
    }

    .values-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .value-card {
      padding: 2rem 1.5rem;
      text-align: center;
      transition: transform 0.3s ease, border-color 0.3s ease;
    }

    .value-card:hover {
      transform: translateY(-4px);
      border-color: var(--neon-cyan);
    }

    .value-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end));
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem auto;
      border: 1px solid var(--card-border);
    }

    .value-icon i {
      font-size: 1.4rem;
      color: var(--primary-coral);
    }

    .value-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 0.75rem 0;
    }

    .value-description {
      font-size: 0.9rem;
      color: var(--text-muted);
      line-height: 1.7;
      margin: 0;
    }

    /* Gallery Section */
    .gallery-section {
      padding: 4rem 2rem;
      background: var(--secondary-bg);
      text-align: center;
    }

    .gallery-section .section-title {
      margin-bottom: 0.5rem;
    }

    .gallery-section .section-subtitle {
      margin-bottom: 2.5rem;
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      max-width: 1100px;
      margin: 0 auto;
    }

    .gallery-item {
      border-radius: var(--radius-md);
      overflow: hidden;
      aspect-ratio: 4 / 3;
      border: 1px solid var(--card-border);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .gallery-item:hover {
      transform: scale(1.03);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Offer Section */
    .offer-section {
      padding: 4rem 2rem;
      max-width: 1100px;
      margin: 0 auto;
      text-align: center;
    }

    .offer-section .section-title {
      margin-bottom: 2.5rem;
    }

    .offer-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    .offer-card {
      padding: 2rem 1.25rem;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
      transition: transform 0.3s ease, border-color 0.3s ease;
    }

    .offer-card:hover {
      transform: translateY(-4px);
      border-color: var(--neon-cyan);
    }

    .offer-card > i {
      font-size: 2rem;
      color: var(--neon-cyan);
      margin-bottom: 1rem;
    }

    .offer-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 0.5rem 0;
    }

    .offer-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin: 0;
    }

    /* Social Section */
    .social-section {
      padding: 4rem 2rem;
      background: var(--secondary-bg);
      text-align: center;
    }

    .social-section .section-title {
      margin-bottom: 0.5rem;
    }

    .social-section .section-subtitle {
      margin-bottom: 2rem;
    }

    .social-grid {
      display: flex;
      gap: 1.25rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .social-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.75rem;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
      text-decoration: none;
      transition: transform 0.2s, border-color 0.3s, box-shadow 0.3s;
    }

    .social-card:hover {
      transform: translateY(-3px);
      border-color: var(--neon-pink);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    .social-card i {
      font-size: 1.5rem;
      color: var(--neon-pink);
    }

    .social-card .x-icon {
      width: 1.5rem;
      height: 1.5rem;
    }

    .social-handle {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-main);
    }

    /* CTA Section */
    .cta-section {
      background: linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end));
      padding: 4rem 2rem;
      text-align: center;
      position: relative;
    }

    .cta-section::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 50%, rgba(255, 107, 107, 0.08) 0%, transparent 60%);
      pointer-events: none;
    }

    .cta-content {
      position: relative;
      z-index: 1;
    }

    .cta-title {
      font-size: 2rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 1.25rem 0;
    }

    .cta-info {
      margin-bottom: 2rem;
    }

    .cta-address {
      font-size: 1.05rem;
      color: #94A3B8;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .cta-address i {
      color: var(--primary-coral);
    }

    .cta-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .cta-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.05rem;
      padding: 0.85rem 2rem;
      text-decoration: none;
    }

    .cta-actions .btn-outline {
      color: #FFFFFF;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .cta-actions .btn-outline:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.6);
      color: #FFFFFF;
    }

    /* Responsive - Tablet */
    @media (max-width: 1024px) {
      .about-hero {
        padding: 5rem 1.5rem 4rem;
        min-height: 280px;
      }
      .hero-logo {
        height: 140px;
      }
      .hero-title {
        font-size: 2.25rem;
      }
      .story-section {
        padding: 3rem 1.5rem;
      }
      .story-image img {
        min-height: 260px;
      }
      .numbers-section {
        padding: 3rem 1.5rem;
      }
      .numbers-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.25rem;
      }
      .values-section {
        padding: 3rem 1.5rem;
      }
      .values-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.25rem;
      }
      .gallery-section {
        padding: 3rem 1.5rem;
      }
      .gallery-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .offer-section {
        padding: 3rem 1.5rem;
      }
      .offer-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
      .social-section {
        padding: 3rem 1.5rem;
      }
      .cta-section {
        padding: 3rem 1.5rem;
      }
      .cta-title {
        font-size: 1.75rem;
      }
      .stat-number {
        font-size: 2rem;
      }
    }

    /* Responsive - Mobile */
    @media (max-width: 768px) {
      .about-hero {
        padding: 4rem 1.25rem 3rem;
        min-height: 240px;
      }
      .hero-logo {
        height: 100px;
        margin-bottom: 1rem;
      }
      .hero-title {
        font-size: 2rem;
      }
      .hero-subtitle {
        font-size: 1rem;
      }
      .story-section {
        padding: 2.5rem 1.25rem;
      }
      .story-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
      .story-text .section-title {
        text-align: center;
      }
      .story-image img {
        min-height: 220px;
      }
      .numbers-section {
        padding: 2.5rem 1.25rem;
      }
      .numbers-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
      .stat-card {
        padding: 1.5rem 0.75rem;
      }
      .stat-number {
        font-size: 1.75rem;
      }
      .values-section {
        padding: 2.5rem 1.25rem;
      }
      .values-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      .value-card {
        padding: 1.5rem 1.25rem;
      }
      .gallery-section {
        padding: 2.5rem 1.25rem;
      }
      .gallery-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }
      .offer-section {
        padding: 2.5rem 1.25rem;
      }
      .offer-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
      .offer-card {
        padding: 1.5rem 1rem;
      }
      .social-section {
        padding: 2.5rem 1.25rem;
      }
      .social-card {
        padding: 0.85rem 1.25rem;
      }
      .cta-section {
        padding: 2.5rem 1.25rem;
      }
      .cta-title {
        font-size: 1.6rem;
      }
      .cta-address {
        font-size: 0.95rem;
      }
    }

    /* Responsive - Small Phone */
    @media (max-width: 480px) {
      .about-hero {
        padding: 3rem 1rem 2.5rem;
        min-height: 200px;
      }
      .hero-logo {
        height: 72px;
        margin-bottom: 0.75rem;
      }
      .hero-title {
        font-size: 1.65rem;
      }
      .hero-subtitle {
        font-size: 0.9rem;
      }
      .story-section {
        padding: 2rem 1rem;
      }
      .story-paragraph {
        font-size: 0.9rem;
      }
      .story-image img {
        min-height: 180px;
      }
      .numbers-section {
        padding: 2rem 1rem;
      }
      .numbers-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }
      .stat-number {
        font-size: 1.5rem;
      }
      .values-section {
        padding: 2rem 1rem;
      }
      .value-card {
        padding: 1.25rem 1rem;
      }
      .gallery-section {
        padding: 2rem 1rem;
      }
      .gallery-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }
      .offer-section {
        padding: 2rem 1rem;
      }
      .offer-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }
      .social-section {
        padding: 2rem 1rem;
      }
      .social-grid {
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }
      .social-card {
        width: 100%;
        max-width: 280px;
        justify-content: center;
      }
      .cta-section {
        padding: 2rem 1rem;
      }
      .cta-title {
        font-size: 1.4rem;
      }
      .cta-actions {
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }
      .cta-button {
        width: 100%;
        max-width: 280px;
        justify-content: center;
      }
      input, select, textarea {
        font-size: 16px;
      }
    }
  `]
})
export class AboutPageComponent {
  stats = signal([
    { icon: 'fa-solid fa-dice-d20', value: '330+', label: 'Juegos de mesa' },
    { icon: 'fa-solid fa-tags', value: '18', label: 'Generos diferentes' },
    { icon: 'fa-solid fa-calendar-days', value: '2025', label: 'Año de apertura' },
    { icon: 'fa-solid fa-location-dot', value: 'Alcorcon', label: 'Madrid Sur' }
  ]);

  values = signal([
    {
      icon: 'fa-solid fa-users',
      title: 'Comunidad',
      description: 'Creemos en el poder de reunirse alrededor de una mesa. Cada partida es una oportunidad para hacer nuevos amigos y fortalecer lazos.'
    },
    {
      icon: 'fa-solid fa-dice',
      title: 'Ludoteca para todos',
      description: 'Desde party games hasta eurogames de estrategia, nuestra coleccion de mas de 330 juegos abarca todos los estilos. Siempre hay un juego perfecto para ti.'
    },
    {
      icon: 'fa-solid fa-utensils',
      title: 'Comida y bebida',
      description: 'Cerveza, refrescos y comida rica para acompanar tus partidas. Porque una buena partida se disfruta mejor con algo en la mesa.'
    }
  ]);

  readonly galleryPhotos = [
    'assets/GGBarPhotoSlide/GiberGamesBarSlide02.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide03.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide06.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide08.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide11.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide13.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide17.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide19.webp',
    'assets/GGBarPhotoSlide/GiberGamesBarSlide20.webp',
  ];

  offerings = signal([
    {
      icon: 'fa-solid fa-chess-board',
      title: 'Ludoteca',
      description: 'Mas de 330 juegos de mesa disponibles para jugar. Te ayudamos a elegir el perfecto para tu grupo.',
      route: '/public/juegos'
    },
    {
      icon: 'fa-solid fa-beer-mug-empty',
      title: 'Bar',
      description: 'Cervezas, refrescos, cafes y una variada seleccion de bebidas para acompanar tus partidas.',
      route: '/public/carta'
    },
    {
      icon: 'fa-solid fa-burger',
      title: 'Cocina',
      description: 'Comida casera y rica pensada para comer mientras juegas. Bocados perfectos entre turno y turno.',
      route: '/public/carta'
    },
    {
      icon: 'fa-solid fa-trophy',
      title: 'Eventos',
      description: 'Torneos, noches tematicas, talleres y eventos especiales. Siempre hay algo nuevo que descubrir.',
      route: '/public/eventos'
    }
  ]);
}
