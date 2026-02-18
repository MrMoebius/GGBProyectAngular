import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <!-- Hero -->
    <section class="contact-hero">
      <h1 class="hero-title">Contacto</h1>
      <p class="hero-subtitle">Estamos aqui para ayudarte. Escribenos y te responderemos lo antes posible.</p>
    </section>

    <!-- Main Content -->
    <section class="section contact-content">
      <div class="contact-grid">

        <!-- Left: Contact Form -->
        <div class="contact-form-wrapper">
          <h2 class="form-heading">Enviar mensaje</h2>
          <form (ngSubmit)="onSubmit()" class="contact-form">
            <div class="form-group">
              <label class="form-label" for="contact-name">Nombre</label>
              <input
                class="form-input"
                id="contact-name"
                type="text"
                placeholder="Tu nombre completo"
                [(ngModel)]="formData.name"
                name="name"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="contact-email">Email</label>
              <input
                class="form-input"
                id="contact-email"
                type="email"
                placeholder="tu@email.com"
                [(ngModel)]="formData.email"
                name="email"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="contact-subject">Asunto</label>
              <select
                class="form-input"
                id="contact-subject"
                [(ngModel)]="formData.subject"
                name="subject"
                required
              >
                <option value="" disabled>Selecciona un asunto</option>
                @for (option of subjectOptions(); track option) {
                  <option [value]="option">{{ option }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="contact-message">Mensaje</label>
              <textarea
                class="form-input message-textarea"
                id="contact-message"
                placeholder="Escribe tu mensaje aqui..."
                rows="5"
                [(ngModel)]="formData.message"
                name="message"
                required
              ></textarea>
            </div>

            <button type="submit" class="btn btn-primary submit-btn">
              <i class="fa-solid fa-paper-plane"></i>
              Enviar Mensaje
            </button>
          </form>
        </div>

        <!-- Right: Info Cards -->
        <div class="contact-info">

          <!-- Address Card -->
          <div class="card info-card">
            <div class="info-icon">
              <i class="fa-solid fa-location-dot"></i>
            </div>
            <div class="info-details">
              <h3 class="info-title">Direccion</h3>
              <p class="info-text">Av. Alcalde Jose Aranda 57, 28925 Alcorcon, Madrid</p>
            </div>
          </div>

          <!-- Phone Card -->
          <div class="card info-card">
            <div class="info-icon">
              <i class="fa-solid fa-phone"></i>
            </div>
            <div class="info-details">
              <h3 class="info-title">Telefono</h3>
              <p class="info-text">+34 614 449 475</p>
            </div>
          </div>

          <!-- Email Card -->
          <div class="card info-card">
            <div class="info-icon">
              <i class="fa-solid fa-envelope"></i>
            </div>
            <div class="info-details">
              <h3 class="info-title">Email</h3>
              <p class="info-text">gibergamesbar&#64;gmail.com</p>
            </div>
          </div>

          <!-- Hours Card -->
          <div class="card info-card hours-card">
            <div class="info-icon">
              <i class="fa-solid fa-clock"></i>
            </div>
            <div class="info-details">
              <h3 class="info-title">Horario</h3>
              <div class="hours-list">
                @for (schedule of hours(); track schedule.days) {
                  <div class="hours-row">
                    <span class="hours-days">{{ schedule.days }}</span>
                    <span class="hours-time">{{ schedule.time }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Social Links -->
          <div class="card info-card social-card">
            <h3 class="info-title social-title">Siguenos</h3>
            <div class="social-links">
              @for (social of socials(); track social.label) {
                <a [href]="social.url" target="_blank" rel="noopener" class="social-link" [attr.aria-label]="social.label">
                  @if (social.svg) {
                    <svg class="x-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  } @else {
                    <i [class]="social.icon"></i>
                  }
                </a>
              }
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Map -->
    <section class="section map-section">
      <div class="map-container">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3040.5!2d-3.8308!3d40.3489!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd4188d6c9c9e8f1%3A0x0!2sAv.+del+Alcalde+Jos%C3%A9+Aranda%2C+57%2C+28925+Alcorc%C3%B3n%2C+Madrid!5e0!3m2!1ses!2ses!4v1700000000000!5m2!1ses!2ses"
          width="100%"
          height="350"
          style="border:0; border-radius: var(--radius-lg);"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="Ubicacion de Giber Games Bar"
        ></iframe>
      </div>
    </section>
  `,
  styles: [`
    /* Hero */
    .contact-hero {
      background: linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end));
      padding: 4rem 2rem;
      text-align: center;
    }

    .hero-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-white);
      margin: 0 0 0.75rem 0;
    }

    .hero-subtitle {
      font-size: 1.05rem;
      color: var(--text-muted);
      margin: 0;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.6;
    }

    /* Main Content */
    .contact-content {
      padding: 3rem 2rem;
      max-width: 1100px;
      margin: 0 auto;
    }

    .contact-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 2.5rem;
      align-items: start;
    }

    /* Form */
    .contact-form-wrapper {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-lg);
      padding: 2rem;
    }

    .form-heading {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 1.5rem 0;
    }

    .contact-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .message-textarea {
      resize: vertical;
      min-height: 120px;
      font-family: inherit;
    }

    .submit-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.8rem 1.5rem;
      font-size: 0.95rem;
      cursor: pointer;
      align-self: flex-start;
    }

    /* Info Cards */
    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
    }

    .info-icon {
      width: 42px;
      height: 42px;
      min-width: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--hero-gradient-start), var(--hero-gradient-end));
      border: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .info-icon i {
      font-size: 1rem;
      color: var(--primary-coral);
    }

    .info-details {
      flex: 1;
    }

    .info-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 0.3rem 0;
    }

    .info-text {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.5;
    }

    /* Hours */
    .hours-card {
      flex-direction: column;
      gap: 0.75rem;
    }

    .hours-card .info-icon {
      display: none;
    }

    .hours-card .info-details {
      width: 100%;
    }

    .hours-list {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-top: 0.25rem;
    }

    .hours-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.88rem;
    }

    .hours-days {
      color: var(--text-muted);
    }

    .hours-time {
      color: var(--text-main);
      font-weight: 600;
    }

    /* Social Card */
    .social-card {
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem;
    }

    .social-title {
      text-align: center;
      margin: 0;
    }

    .social-links {
      display: flex;
      gap: 0.75rem;
    }

    .social-link {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--secondary-bg);
      border: 1px solid var(--card-border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      text-decoration: none;
      transition: border-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
    }

    .social-link:hover {
      border-color: var(--primary-coral);
      color: var(--primary-coral);
      transform: translateY(-2px);
    }

    .social-link i {
      font-size: 1.1rem;
    }

    .social-link .x-icon {
      width: 1.1rem;
      height: 1.1rem;
    }

    /* Map Placeholder */
    .map-section {
      padding: 0 2rem 3rem 2rem;
      max-width: 1100px;
      margin: 0 auto;
    }

    .map-container {
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--card-border);
    }

    .map-container iframe {
      display: block;
      width: 100%;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .contact-grid {
        grid-template-columns: 1fr;
      }

      .hero-title {
        font-size: 2rem;
      }

      .contact-form-wrapper {
        padding: 1.5rem;
      }
    }
  `]
})
export class ContactPageComponent {
  private toastService = inject(ToastService);

  formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  subjectOptions = signal([
    'Consulta general',
    'Reservas',
    'Eventos',
    'Sugerencia',
    'Otro'
  ]);

  hours = signal([
    { days: 'Lunes', time: 'Cerrado' },
    { days: 'Mar - Jue', time: '17:00 - 23:00' },
    { days: 'Viernes', time: '17:00 - 00:00' },
    { days: 'Sabado', time: '12:00 - 00:00' },
    { days: 'Domingo', time: '12:00 - 22:00' }
  ]);

  socials = signal([
    { icon: 'fa-brands fa-instagram', url: 'https://www.instagram.com/gibergamesbar/', label: 'Instagram Bar', svg: false },
    { icon: 'fa-brands fa-instagram', url: 'https://www.instagram.com/gibergames/', label: 'Instagram Giber Games', svg: false },
    { icon: '', url: 'https://x.com/giber_games', label: 'X (Twitter)', svg: true },
    { icon: 'fa-brands fa-tiktok', url: 'https://www.tiktok.com/@gibergamesbar', label: 'TikTok', svg: false }
  ]);

  onSubmit(): void {
    if (!this.formData.name || !this.formData.email || !this.formData.subject || !this.formData.message) {
      this.toastService.show('Por favor, completa todos los campos.', 'error');
      return;
    }
    this.toastService.success('Mensaje enviado!');
    this.formData = { name: '', email: '', subject: '', message: '' };
  }
}
