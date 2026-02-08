import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [RouterModule],
  template: `
    <!-- Hero Section -->
    <section class="about-hero">
      <div class="hero-content">
        <h1 class="hero-title">Sobre Giber Bar</h1>
        <p class="hero-subtitle">
          Mas que un bar, somos un espacio donde la comunidad gamer y los amantes
          de los juegos de mesa se reunen para compartir experiencias inolvidables.
        </p>
      </div>
    </section>

    <!-- Our Story Section -->
    <section class="section story-section">
      <div class="story-grid">
        <div class="story-text">
          <h2 class="section-title">Nuestra Historia</h2>
          <p class="story-paragraph">
            Giber Bar nacio en 2023 de una idea simple pero poderosa: crear un lugar donde
            las personas pudieran desconectar de la rutina y reconectar entre si a traves del juego.
          </p>
          <p class="story-paragraph">
            Nuestros fundadores, apasionados por los juegos de mesa desde la infancia, soñaban
            con un espacio acogedor donde cualquier persona, sin importar su experiencia, pudiera
            sentarse a una mesa y descubrir la magia de jugar en compañia.
          </p>
          <p class="story-paragraph">
            Lo que empezo como un pequeño local con apenas 30 juegos ha crecido hasta convertirse
            en el punto de encuentro favorito de la comunidad ludica de Madrid. Hoy contamos con
            una coleccion de mas de 200 juegos, un equipo apasionado y una comunidad vibrante
            que no para de crecer.
          </p>
        </div>
        <div class="story-image-placeholder">
          <i class="fa-solid fa-store"></i>
          <span>Foto del local</span>
        </div>
      </div>
    </section>

    <!-- Numbers Section -->
    <section class="section numbers-section">
      <h2 class="section-title">Giber Bar en numeros</h2>
      <div class="numbers-grid">
        @for (stat of stats(); track stat.label) {
          <div class="stat-card">
            <span class="stat-number">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        }
      </div>
    </section>

    <!-- Our Values Section -->
    <section class="section values-section">
      <h2 class="section-title">Nuestros Valores</h2>
      <p class="section-subtitle">Lo que nos mueve cada dia</p>
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

    <!-- Photo Gallery Placeholder -->
    <section class="section gallery-section">
      <h2 class="section-title">Nuestro Espacio</h2>
      <p class="section-subtitle">Un vistazo a Giber Bar</p>
      <div class="gallery-grid">
        @for (photo of galleryPhotos(); track photo.label) {
          <div class="gallery-item">
            <i [class]="photo.icon"></i>
            <span>{{ photo.label }}</span>
          </div>
        }
      </div>
    </section>

    <!-- Team Section -->
    <section class="section team-section">
      <h2 class="section-title">Nuestro Equipo</h2>
      <p class="section-subtitle">Las personas detras de Giber Bar</p>
      <div class="team-grid">
        @for (member of team(); track member.name) {
          <div class="card team-card">
            <div class="team-avatar">
              <i class="fa-solid fa-user"></i>
            </div>
            <h3 class="team-name">{{ member.name }}</h3>
            <span class="team-role">{{ member.role }}</span>
            <p class="team-bio">{{ member.bio }}</p>
          </div>
        }
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">Ven a conocernos</h2>
        <p class="cta-address">
          <i class="fa-solid fa-location-dot"></i>
          Calle Ficticia 42, Madrid
        </p>
        <a routerLink="/public/reservas" class="btn btn-primary cta-button">
          <i class="fa-solid fa-calendar-check"></i>
          Reservar Mesa
        </a>
      </div>
    </section>
  `,
  styles: [`
    /* Hero Section */
    .about-hero {
      background: linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end));
      padding: 5rem 2rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .about-hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 30% 50%, rgba(255, 107, 107, 0.1) 0%, transparent 60%),
                  radial-gradient(circle at 70% 50%, rgba(0, 212, 255, 0.08) 0%, transparent 60%);
      pointer-events: none;
    }

    .hero-content {
      max-width: 700px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    .hero-title {
      font-size: 2.75rem;
      font-weight: 800;
      color: var(--text-white);
      margin: 0 0 1rem 0;
    }

    .hero-subtitle {
      font-size: 1.15rem;
      color: var(--text-muted);
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

    .story-image-placeholder {
      background: linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end));
      border: 1px solid var(--card-border);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      min-height: 320px;
      color: var(--text-muted);
    }

    .story-image-placeholder i {
      font-size: 3rem;
      opacity: 0.4;
    }

    .story-image-placeholder span {
      font-size: 0.85rem;
      opacity: 0.5;
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
      gap: 0.5rem;
      transition: transform 0.3s ease, border-color 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      border-color: var(--primary-coral);
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
      max-width: 1000px;
      margin: 0 auto;
    }

    .gallery-item {
      background: linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end));
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
      aspect-ratio: 4 / 3;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      color: var(--text-muted);
      transition: border-color 0.3s ease;
    }

    .gallery-item:hover {
      border-color: var(--neon-purple);
    }

    .gallery-item i {
      font-size: 2rem;
      opacity: 0.35;
    }

    .gallery-item span {
      font-size: 0.8rem;
      opacity: 0.5;
    }

    /* Team Section */
    .team-section {
      padding: 4rem 2rem;
      max-width: 1100px;
      margin: 0 auto;
      text-align: center;
    }

    .team-section .section-title {
      margin-bottom: 0.5rem;
    }

    .team-section .section-subtitle {
      margin-bottom: 2.5rem;
    }

    .team-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .team-card {
      padding: 2rem 1.5rem;
      text-align: center;
      transition: transform 0.3s ease, border-color 0.3s ease;
    }

    .team-card:hover {
      transform: translateY(-4px);
      border-color: var(--primary-coral);
    }

    .team-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end));
      border: 2px solid var(--card-border);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem auto;
    }

    .team-avatar i {
      font-size: 2rem;
      color: var(--text-muted);
      opacity: 0.6;
    }

    .team-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 0.25rem 0;
    }

    .team-role {
      font-size: 0.85rem;
      color: var(--primary-coral);
      font-weight: 600;
      display: block;
      margin-bottom: 0.75rem;
    }

    .team-bio {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin: 0;
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
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
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
      color: var(--text-white);
      margin: 0 0 1rem 0;
    }

    .cta-address {
      font-size: 1.05rem;
      color: var(--text-muted);
      margin: 0 0 2rem 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .cta-address i {
      color: var(--primary-coral);
    }

    .cta-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.05rem;
      padding: 0.85rem 2rem;
      text-decoration: none;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
      }

      .story-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .story-text .section-title {
        text-align: center;
      }

      .numbers-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .values-grid,
      .team-grid {
        grid-template-columns: 1fr;
      }

      .gallery-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .numbers-grid {
        grid-template-columns: 1fr;
      }

      .gallery-grid {
        grid-template-columns: 1fr;
      }

      .hero-title {
        font-size: 1.65rem;
      }
    }
  `]
})
export class AboutPageComponent {
  stats = signal([
    { value: '+200', label: 'Juegos de mesa' },
    { value: '+5000', label: 'Visitantes mensuales' },
    { value: '+50', label: 'Eventos al mes' },
    { value: '3', label: 'Anos de historia' }
  ]);

  values = signal([
    {
      icon: 'fa-solid fa-users',
      title: 'Comunidad',
      description: 'Creemos en el poder de reunirse alrededor de una mesa. Cada partida es una oportunidad para hacer nuevos amigos y fortalecer lazos.'
    },
    {
      icon: 'fa-solid fa-dice',
      title: 'Diversidad Ludica',
      description: 'Desde party games hasta eurogames de estrategia, nuestra coleccion abarca todos los estilos para que cada persona encuentre su juego ideal.'
    },
    {
      icon: 'fa-solid fa-star',
      title: 'Experiencia',
      description: 'Cada visita debe ser especial. Nos esforzamos por ofrecer un ambiente unico, con atencion personalizada y recomendaciones a medida.'
    }
  ]);

  galleryPhotos = signal([
    { icon: 'fa-solid fa-couch', label: 'Zona de juegos' },
    { icon: 'fa-solid fa-utensils', label: 'Barra y cocina' },
    { icon: 'fa-solid fa-chess-board', label: 'Mesa de estrategia' },
    { icon: 'fa-solid fa-people-group', label: 'Evento comunitario' },
    { icon: 'fa-solid fa-gamepad', label: 'Rincon gamer' },
    { icon: 'fa-solid fa-champagne-glasses', label: 'Celebraciones' }
  ]);

  team = signal([
    {
      name: 'Carlos Martinez',
      role: 'Fundador & Director',
      bio: 'Apasionado de los juegos de mesa desde los 8 anos. Soño con crear un espacio donde todos pudieran compartir su amor por lo ludico.'
    },
    {
      name: 'Laura Gomez',
      role: 'Coordinadora de Eventos',
      bio: 'Experta en crear experiencias memorables. Organiza mas de 50 eventos mensuales entre torneos, noches tematicas y talleres.'
    },
    {
      name: 'Miguel Torres',
      role: 'Game Master & Barista',
      bio: 'Conoce cada juego de la coleccion al detalle. Si no sabes que jugar, el siempre tiene la recomendacion perfecta para tu grupo.'
    }
  ]);
}
