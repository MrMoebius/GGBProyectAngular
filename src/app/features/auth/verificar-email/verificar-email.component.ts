import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Componente de verificacion de email.
 * El usuario llega aqui desde el enlace del correo de verificacion.
 * Lee el token de la URL (?token=xxx) y pide al usuario que establezca su contraseña.
 * Flujo: email con enlace → esta pagina → usuario elige password → cuenta verificada → login.
 */
@Component({
  selector: 'app-verificar-email',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  template: `
    <div class="verificar-page">
      <div class="verificar-card">
        <!-- Logo -->
        <div class="verificar-logo">
          <img src="assets/GGBarPhotoSlide/GiberGamesBarLogo.webp" alt="Giber Games Bar" class="verificar-logo-img">
        </div>

        <!-- Estado: sin token en la URL -->
        @if (!token) {
          <div class="status-container">
            <div class="status-icon error">
              <i class="fa-solid fa-link-slash"></i>
            </div>
            <h3 class="status-title">Enlace invalido</h3>
            <p class="status-message">El enlace de verificacion no es valido o ha expirado.</p>
            <a class="btn-submit" routerLink="/auth/login" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
              <i class="fa-solid fa-right-to-bracket"></i>
              Ir al login
            </a>
          </div>

        <!-- Estado: verificacion completada -->
        } @else if (verificado()) {
          <div class="status-container">
            <div class="status-icon success">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <h3 class="status-title">Cuenta verificada</h3>
            <p class="status-message">Tu email ha sido verificado y tu contraseña establecida. Ya puedes iniciar sesion.</p>
            <a class="btn-submit" routerLink="/auth/login" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
              <i class="fa-solid fa-right-to-bracket"></i>
              Iniciar sesion
            </a>
          </div>

        <!-- Estado: formulario para establecer contraseña -->
        } @else {
          <p class="verificar-subtitle">Establece tu contraseña</p>
          <p class="verificar-info">Para completar la verificacion, elige una contraseña para tu cuenta.</p>

          <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()" class="verificar-form">
            <!-- Campo contraseña -->
            <div class="form-group">
              <label for="password" class="form-label">Contraseña</label>
              <input
                type="password"
                id="password"
                formControlName="password"
                class="form-input"
                [class.input-error]="isFieldInvalid('password')"
                placeholder="Minimo 6 caracteres"
              >
              @if (isFieldInvalid('password')) {
                <p class="field-error">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  La contraseña debe tener entre 6 y 100 caracteres
                </p>
              }
            </div>

            <!-- Campo confirmar contraseña -->
            <div class="form-group">
              <label for="confirmPassword" class="form-label">Confirmar contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                formControlName="confirmPassword"
                class="form-input"
                [class.input-error]="passwordsMismatch()"
                placeholder="Repite tu contraseña"
              >
              @if (passwordsMismatch()) {
                <p class="field-error">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  Las contraseñas no coinciden
                </p>
              }
            </div>

            <!-- Mensaje de error del servidor -->
            @if (errorMessage()) {
              <div class="error-banner">
                <i class="fa-solid fa-triangle-exclamation"></i>
                {{ errorMessage() }}
              </div>
            }

            <!-- Boton de envio -->
            <button
              type="submit"
              class="btn-submit"
              [disabled]="passwordForm.invalid || isLoading() || passwordsMismatch()"
            >
              @if (isLoading()) {
                <i class="fa-solid fa-spinner fa-spin"></i>
                Verificando...
              } @else {
                <i class="fa-solid fa-shield-check"></i>
                Verificar cuenta
              }
            </button>
          </form>
        }

        <!-- Enlace para volver -->
        <a class="back-link" routerLink="/public">
          <i class="fa-solid fa-arrow-left"></i>
          Volver al inicio
        </a>
      </div>
    </div>
  `,
  styles: [`
    .verificar-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background: linear-gradient(135deg, var(--hero-gradient-start, #0F172A), var(--hero-gradient-end, #1E293B));
    }

    .verificar-card {
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

    .verificar-logo { text-align: center; margin-bottom: 0.5rem; }
    .verificar-logo-img { height: 60px; object-fit: contain; }

    .verificar-subtitle {
      text-align: center;
      color: #fff;
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0.5rem 0 0.25rem;
    }

    .verificar-info {
      text-align: center;
      color: var(--text-muted, #94a3b8);
      font-size: 0.85rem;
      margin: 0 0 1.5rem;
      line-height: 1.4;
    }

    .verificar-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }

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

    .form-input::placeholder { color: var(--text-muted, #94a3b8); opacity: 0.6; }

    .form-input:focus {
      border-color: var(--input-focus, var(--neon-cyan, #00FFD1));
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

    /* Contenedor de estado (exito / error) */
    .status-container { text-align: center; padding: 1rem 0; }

    .status-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .status-icon.success { color: var(--neon-cyan, #00FFD1); }
    .status-icon.error { color: var(--danger, #EF4444); }

    .status-title {
      color: #fff;
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
      color: var(--text-muted, #94a3b8);
      font-size: 0.85rem;
      text-decoration: none;
      transition: color 0.2s;
    }

    .back-link:hover { color: var(--neon-cyan, #00FFD1); }
    .back-link i { font-size: 0.75rem; transition: transform 0.2s; }
    .back-link:hover i { transform: translateX(-3px); }

    @media (max-width: 480px) {
      .verificar-card { padding: 2rem 1.25rem; }
    }
  `]
})
export class VerificarEmailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Token de verificacion leido de los query params de la URL */
  token: string | null = null;

  passwordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
    confirmPassword: ['', [Validators.required]]
  });

  errorMessage = signal('');
  isLoading = signal(false);
  verificado = signal(false);

  /** Lee el token de la URL al iniciar el componente */
  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  isFieldInvalid(field: string): boolean {
    const control = this.passwordForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /** Comprueba si las contraseñas no coinciden (solo si confirmPassword ha sido tocado) */
  passwordsMismatch(): boolean {
    const confirm = this.passwordForm.get('confirmPassword');
    if (!confirm || !confirm.dirty) return false;
    return this.passwordForm.value.password !== this.passwordForm.value.confirmPassword;
  }

  /** Envia el token y la contraseña al backend para verificar la cuenta */
  onSubmit() {
    if (this.passwordForm.invalid || this.passwordsMismatch()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.verificarEmail({
      token: this.token!,
      password: this.passwordForm.value.password!
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.verificado.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.error?.mensaje) {
          this.errorMessage.set(err.error.mensaje);
        } else if (err.status === 404) {
          this.errorMessage.set('El token no es valido o ha expirado.');
        } else {
          this.errorMessage.set('Ocurrio un error. Intentalo mas tarde.');
        }
      }
    });
  }
}
