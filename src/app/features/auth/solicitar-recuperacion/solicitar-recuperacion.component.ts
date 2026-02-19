import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-solicitar-recuperacion',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  template: `
    <div class="recuperar-page">
      <div class="recuperar-card">
        <div class="recuperar-logo">
          <img src="assets/GGBarPhotoSlide/GiberGamesBarLogo.webp" alt="Giber Games Bar" class="recuperar-logo-img">
        </div>

        @if (enviado()) {
          <div class="status-container">
            <div class="status-icon success">
              <i class="fa-solid fa-envelope-circle-check"></i>
            </div>
            <h3 class="status-title">Email enviado</h3>
            <p class="status-message">Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.</p>
            <a class="btn-submit" routerLink="/auth/login" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
              <i class="fa-solid fa-right-to-bracket"></i>
              Volver al login
            </a>
          </div>
        } @else {
          <p class="recuperar-subtitle">Recuperar contraseña</p>
          <p class="recuperar-info">Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.</p>

          <form [formGroup]="emailForm" (ngSubmit)="onSubmit()" class="recuperar-form">
            <div class="form-group">
              <label for="email" class="form-label">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                formControlName="email"
                class="form-input"
                [class.input-error]="isFieldInvalid('email')"
                placeholder="tu@email.com"
              >
              @if (isFieldInvalid('email')) {
                <p class="field-error">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  Introduce un email válido
                </p>
              }
            </div>

            @if (errorMessage()) {
              <div class="error-banner">
                <i class="fa-solid fa-triangle-exclamation"></i>
                {{ errorMessage() }}
              </div>
            }

            <button
              type="submit"
              class="btn-submit"
              [disabled]="emailForm.invalid || isLoading()"
            >
              @if (isLoading()) {
                <i class="fa-solid fa-spinner fa-spin"></i>
                Enviando...
              } @else {
                <i class="fa-solid fa-paper-plane"></i>
                Enviar enlace
              }
            </button>
          </form>
        }

        <a class="back-link" routerLink="/auth/login">
          <i class="fa-solid fa-arrow-left"></i>
          Volver al login
        </a>
      </div>
    </div>
  `,
  styles: [`
    .recuperar-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background: var(--content-bg, #F3F4F6);
    }

    :host-context([data-theme="dark"]) .recuperar-page {
      background: linear-gradient(135deg, var(--hero-gradient-start, #0F172A), var(--hero-gradient-end, #1E293B));
    }

    .recuperar-card {
      width: 100%;
      max-width: 420px;
      background-color: var(--card-bg, #FFFFFF);
      border: 1px solid var(--card-border, #E5E7EB);
      border-radius: var(--radius-lg, 16px);
      padding: 2.5rem 2rem;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    }

    :host-context([data-theme="dark"]) .recuperar-card {
      background-color: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.4),
        0 0 60px rgba(0, 255, 209, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }

    .recuperar-logo { text-align: center; margin-bottom: 0.5rem; }
    .recuperar-logo-img { height: 60px; object-fit: contain; }

    .recuperar-subtitle {
      text-align: center;
      color: var(--text-main);
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0.5rem 0 0.25rem;
    }

    .recuperar-info {
      text-align: center;
      color: var(--text-muted, #94a3b8);
      font-size: 0.85rem;
      margin: 0 0 1.5rem;
      line-height: 1.4;
    }

    .recuperar-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }

    .form-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-main);
      letter-spacing: 0.02em;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
      color: var(--text-main, #1F2937);
      background-color: var(--input-bg, #FFFFFF);
      border: 1px solid var(--input-border, #D1D5DB);
      border-radius: var(--radius-md, 8px);
      outline: none;
      transition: border-color 0.25s, box-shadow 0.25s;
      box-sizing: border-box;
    }

    .form-input::placeholder { color: var(--text-muted, #94a3b8); opacity: 0.6; }

    .form-input:focus {
      border-color: var(--input-focus);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    :host-context([data-theme="dark"]) .form-input:focus {
      border-color: var(--neon-cyan, #00FFD1);
      box-shadow: 0 0 0 3px rgba(0, 255, 209, 0.12);
    }

    .form-input.input-error {
      border-color: var(--danger, #EF4444);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
    }

    .field-error {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      color: var(--danger, #EF4444);
      margin: 0;
    }

    .field-error i { font-size: 0.75rem; }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md, 8px);
      background-color: var(--danger-bg, rgba(239, 68, 68, 0.1));
      border: 1px solid var(--danger, #EF4444);
      color: var(--danger-text, #FCA5A5);
      font-size: 0.85rem;
      font-weight: 500;
    }

    .error-banner i { font-size: 1rem; flex-shrink: 0; }

    .btn-submit {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.8rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 700;
      color: #fff;
      background-color: var(--primary-coral, #FF6B6B);
      border: none;
      border-radius: var(--radius-md, 8px);
      cursor: pointer;
      transition: background-color 0.25s, transform 0.15s, box-shadow 0.25s;
      margin-top: 0.5rem;
    }

    .btn-submit:hover:not(:disabled) {
      background-color: var(--primary-hover, #FF5252);
      transform: translateY(-1px);
      box-shadow: 0 4px 18px rgba(255, 107, 107, 0.35);
    }

    .btn-submit:active:not(:disabled) { transform: translateY(0); }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    .status-container { text-align: center; padding: 1rem 0; }

    .status-icon { font-size: 3rem; margin-bottom: 1rem; }
    .status-icon.success { color: var(--neon-cyan, #00FFD1); }

    :host-context(:not([data-theme="dark"])) .status-icon.success {
      color: var(--primary-coral, #FF6B6B);
    }

    .status-title {
      color: var(--text-main);
      font-size: 1.25rem;
      margin: 0 0 0.5rem;
    }

    .status-message {
      color: var(--text-muted, #94a3b8);
      font-size: 0.9rem;
      margin: 0 0 1.5rem;
      line-height: 1.5;
    }

    .back-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
      color: var(--text-main);
      font-size: 0.85rem;
      text-decoration: none;
      transition: color 0.2s;
    }

    .back-link:hover { color: var(--primary-coral); }
    :host-context([data-theme="dark"]) .back-link:hover { color: var(--neon-cyan, #00FFD1); }
    .back-link i { font-size: 0.75rem; transition: transform 0.2s; }
    .back-link:hover i { transform: translateX(-3px); }

    @media (max-width: 480px) {
      .recuperar-card { padding: 2rem 1.25rem; }
    }
  `]
})
export class SolicitarRecuperacionComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  errorMessage = signal('');
  isLoading = signal(false);
  enviado = signal(false);

  isFieldInvalid(field: string): boolean {
    const control = this.emailForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.solicitarRecuperacion(this.emailForm.value.email!).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.enviado.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.enviado.set(true);
      }
    });
  }
}
