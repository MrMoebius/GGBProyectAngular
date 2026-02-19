import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <!-- Logo -->
        <div class="login-logo">
          <img src="assets/GGBarPhotoSlide/GiberGamesBarLogo.webp" alt="Giber Games Bar" class="login-logo-img">
        </div>
        <p class="login-subtitle">Inicia sesión en tu cuenta</p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <!-- Email Field -->
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

          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-input"
              [class.input-error]="isFieldInvalid('password')"
              placeholder="Tu contraseña"
            >
            @if (isFieldInvalid('password')) {
              <p class="field-error">
                <i class="fa-solid fa-circle-exclamation"></i>
                La contraseña es obligatoria
              </p>
            }
          </div>

          <!-- Enlace recuperar contraseña -->
          <div class="forgot-password">
            <a class="forgot-link" routerLink="/auth/solicitar-recuperacion">¿Olvidaste tu contraseña?</a>
          </div>

          <!-- Error Message -->
          @if (errorMessage()) {
            <div class="error-banner">
              <i class="fa-solid fa-triangle-exclamation"></i>
              {{ errorMessage() }}
            </div>
          }

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-submit"
            [disabled]="loginForm.invalid || isLoading()"
          >
            @if (isLoading()) {
              <i class="fa-solid fa-spinner fa-spin"></i>
              Cargando...
            } @else {
              <i class="fa-solid fa-right-to-bracket"></i>
              Entrar
            }
          </button>
        </form>

        <!-- Enlace a registro para nuevos usuarios -->
        <p class="register-link-text">
          ¿No tienes cuenta?
          <a class="register-link" routerLink="/auth/registro">Crear cuenta</a>
        </p>

        <!-- Back link -->
        <a class="back-link" routerLink="/public">
          <i class="fa-solid fa-arrow-left"></i>
          Volver al inicio
        </a>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Full page layout ===== */
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background: var(--content-bg, #F3F4F6);
    }

    :host-context([data-theme="dark"]) .login-page {
      background: linear-gradient(135deg, var(--hero-gradient-start, #0F172A), var(--hero-gradient-end, #1E293B));
    }

    /* ===== Card ===== */
    .login-card {
      width: 100%;
      max-width: 420px;
      background-color: var(--card-bg, #FFFFFF);
      border: 1px solid var(--card-border, #E5E7EB);
      border-radius: var(--radius-lg, 16px);
      padding: 2.5rem 2rem;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    }

    :host-context([data-theme="dark"]) .login-card {
      background-color: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.4),
        0 0 60px rgba(0, 255, 209, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }

    /* ===== Logo ===== */
    .login-logo {
      text-align: center;
      margin-bottom: 0.5rem;
    }

    .login-logo-img {
      height: 60px;
      object-fit: contain;
    }

    .login-subtitle {
      text-align: center;
      color: var(--text-main);
      font-size: 0.9rem;
      margin: 0 0 2rem;
    }

    /* ===== Form ===== */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

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

    .form-input::placeholder {
      color: var(--text-muted, #94a3b8);
      opacity: 0.6;
    }

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

    /* ===== Field error ===== */
    .field-error {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      color: var(--danger, #EF4444);
      margin: 0;
    }

    .field-error i {
      font-size: 0.75rem;
    }

    /* ===== Error banner ===== */
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

    .error-banner i {
      font-size: 1rem;
      flex-shrink: 0;
    }

    /* ===== Submit button ===== */
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

    .btn-submit:active:not(:disabled) {
      transform: translateY(0);
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* ===== Forgot password ===== */
    .forgot-password {
      text-align: right;
      margin-top: -0.5rem;
    }

    .forgot-link {
      font-size: 0.8rem;
      color: var(--text-muted, #94a3b8);
      text-decoration: none;
      transition: color 0.2s;
    }

    .forgot-link:hover {
      color: var(--primary-coral, #FF6B6B);
    }

    :host-context([data-theme="dark"]) .forgot-link:hover {
      color: var(--neon-cyan, #00FFD1);
    }

    /* ===== Enlace a registro ===== */
    .register-link-text {
      text-align: center;
      color: var(--text-main);
      font-size: 0.85rem;
      margin-top: 1.25rem;
      margin-bottom: 0;
    }

    .register-link {
      color: var(--primary-coral);
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s;
    }

    :host-context([data-theme="dark"]) .register-link {
      color: var(--neon-cyan, #00FFD1);
    }

    .register-link:hover { opacity: 0.8; }

    /* ===== Back link ===== */
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

    .back-link:hover {
      color: var(--primary-coral);
    }

    :host-context([data-theme="dark"]) .back-link:hover {
      color: var(--neon-cyan, #00FFD1);
    }

    .back-link i {
      font-size: 0.75rem;
      transition: transform 0.2s;
    }

    .back-link:hover i {
      transform: translateX(-3px);
    }

    /* ===== Responsive ===== */
    @media (max-width: 480px) {
      .login-card {
        padding: 2rem 1.25rem;
      }

      .logo-giber,
      .logo-bar {
        font-size: 1.65rem;
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.redirectUser();
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 401 || err.status === 403) {
          this.errorMessage.set('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
        } else {
          this.errorMessage.set('Ocurrió un error inesperado. Inténtalo más tarde.');
        }
        console.error('Login error:', err);
      }
    });
  }

  private redirectUser() {
    const role = this.authService.currentRole();
    console.log('LoginComponent: Redirigiendo usuario con rol:', role);

    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'EMPLEADO':
        this.router.navigate(['/staff/sala']);
        break;
      case 'CLIENTE':
        this.router.navigate(['/customer/dashboard']);
        break;
      default:
        console.warn('LoginComponent: Rol no reconocido o nulo, redirigiendo a public');
        this.router.navigate(['/public']);
    }
  }
}
