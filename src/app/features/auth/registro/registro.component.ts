import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Componente de registro publico de clientes.
 * Permite a cualquier persona crear una cuenta proporcionando nombre y email.
 * Tras el registro, el backend envia un email de verificacion con un enlace
 * para que el usuario establezca su contraseña (ver VerificarEmailComponent).
 * Flujo: registro → email enviado → usuario verifica → establece password → login.
 */
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  template: `
    <div class="registro-page">
      <div class="registro-card">
        <div class="registro-logo">
          <img src="assets/GGBarPhotoSlide/GiberGamesBarLogo.webp" alt="Giber Games Bar" class="registro-logo-img">
        </div>
        <p class="registro-subtitle">Crea tu cuenta</p>

        @if (!registroExitoso()) {
          <form [formGroup]="registroForm" (ngSubmit)="onSubmit()" class="registro-form">
            <div class="form-group">
              <label for="nombre" class="form-label">Nombre</label>
              <input
                type="text"
                id="nombre"
                formControlName="nombre"
                class="form-input"
                [class.input-error]="isFieldInvalid('nombre')"
                placeholder="Tu nombre"
              >
              @if (isFieldInvalid('nombre')) {
                <p class="field-error">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  El nombre es obligatorio
                </p>
              }
            </div>

            <div class="form-group">
              <label for="email" class="form-label">Correo Electronico</label>
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
                  Introduce un email valido
                </p>
              }
            </div>

            <!-- Campo telefono (opcional) -->
            <div class="form-group">
              <label for="telefono" class="form-label">Telefono</label>
              <input
                type="tel"
                id="telefono"
                formControlName="telefono"
                class="form-input"
                [class.input-error]="isFieldInvalid('telefono')"
                placeholder="Ej: 612 345 678"
              >
              @if (isFieldInvalid('telefono')) {
                <p class="field-error">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  El telefono es obligatorio
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
              [disabled]="registroForm.invalid || isLoading()"
            >
              @if (isLoading()) {
                <i class="fa-solid fa-spinner fa-spin"></i>
                Creando cuenta...
              } @else {
                <i class="fa-solid fa-user-plus"></i>
                Crear cuenta
              }
            </button>
          </form>

          <p class="login-link-text">
            Ya tienes cuenta?
            <a class="login-link" routerLink="/auth/login">Inicia sesion</a>
          </p>
        } @else {
          <div class="success-container">
            <div class="success-icon">
              <i class="fa-solid fa-envelope-circle-check"></i>
            </div>
            <h3 class="success-title">Cuenta creada</h3>
            <p class="success-message">{{ successMessage() }}</p>
            <a class="btn-submit" routerLink="/auth/login" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
              <i class="fa-solid fa-right-to-bracket"></i>
              Ir al login
            </a>
          </div>
        }

        <a class="back-link" routerLink="/public">
          <i class="fa-solid fa-arrow-left"></i>
          Volver al inicio
        </a>
      </div>
    </div>
  `,
  styles: [`
    .registro-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background: linear-gradient(135deg, var(--hero-gradient-start, #0F172A), var(--hero-gradient-end, #1E293B));
    }

    .registro-card {
      width: 100%;
      max-width: 420px;
      background-color: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-lg, 16px);
      padding: 2.5rem 2rem;
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.4),
        0 0 60px rgba(0, 255, 209, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }

    .registro-logo {
      text-align: center;
      margin-bottom: 0.5rem;
    }

    .registro-logo-img {
      height: 60px;
      object-fit: contain;
    }

    .registro-subtitle {
      text-align: center;
      color: var(--text-muted, #94a3b8);
      font-size: 0.9rem;
      margin: 0 0 2rem;
    }

    .registro-form {
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
      color: var(--text-muted, #94a3b8);
      letter-spacing: 0.02em;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
      color: var(--text-white, #fff);
      background-color: var(--input-bg, rgba(255, 255, 255, 0.06));
      border: 1px solid var(--input-border, rgba(255, 255, 255, 0.12));
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
      border-color: var(--input-focus, var(--neon-cyan, #00FFD1));
      box-shadow: 0 0 0 3px rgba(0, 255, 209, 0.12);
    }

    .form-input.input-error {
      border-color: var(--danger, #EF4444);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
    }

    .optional-label {
      font-weight: 400;
      font-size: 0.75rem;
      opacity: 0.7;
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

    .login-link-text {
      text-align: center;
      color: var(--text-muted, #94a3b8);
      font-size: 0.85rem;
      margin-top: 1.25rem;
    }

    .login-link {
      color: var(--neon-cyan, #00FFD1);
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s;
    }

    .login-link:hover { opacity: 0.8; }

    .success-container {
      text-align: center;
      padding: 1rem 0;
    }

    .success-icon {
      font-size: 3rem;
      color: var(--neon-cyan, #00FFD1);
      margin-bottom: 1rem;
    }

    .success-title {
      color: #fff;
      font-size: 1.25rem;
      margin: 0 0 0.5rem;
    }

    .success-message {
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
      color: var(--text-muted, #94a3b8);
      font-size: 0.85rem;
      text-decoration: none;
      transition: color 0.2s;
    }

    .back-link:hover { color: var(--neon-cyan, #00FFD1); }
    .back-link i { font-size: 0.75rem; transition: transform 0.2s; }
    .back-link:hover i { transform: translateX(-3px); }

    @media (max-width: 480px) {
      .registro-card { padding: 2rem 1.25rem; }
    }
  `]
})
export class RegistroComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registroForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: ['', [Validators.required, Validators.maxLength(20)]]
  });

  errorMessage = signal('');
  successMessage = signal('');
  isLoading = signal(false);
  registroExitoso = signal(false);

  isFieldInvalid(field: string): boolean {
    const control = this.registroForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { nombre, email, telefono } = this.registroForm.value;

    this.authService.registro({ nombre: nombre!, email: email!, telefono: telefono! }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.registroExitoso.set(true);
        this.successMessage.set(res.message || 'Cuenta creada. Revisa tu correo para verificar tu email.');
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.error?.mensaje) {
          this.errorMessage.set(err.error.mensaje);
        } else if (err.status === 409) {
          this.errorMessage.set('Ya existe una cuenta con ese email.');
        } else {
          this.errorMessage.set('Ocurrio un error. Intentalo mas tarde.');
        }
      }
    });
  }
}
