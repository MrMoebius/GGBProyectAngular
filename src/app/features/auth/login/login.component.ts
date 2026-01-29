import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 class="text-2xl font-bold text-center text-gray-800 mb-8">Iniciar Sesión</h2>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              [ngClass]="{'border-red-500': isFieldInvalid('email')}"
            >
            <p *ngIf="isFieldInvalid('email')" class="mt-1 text-sm text-red-600">
              Introduce un email válido
            </p>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              [ngClass]="{'border-red-500': isFieldInvalid('password')}"
            >
            <p *ngIf="isFieldInvalid('password')" class="mt-1 text-sm text-red-600">
              La contraseña es obligatoria
            </p>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage()" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ errorMessage() }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading()"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span *ngIf="isLoading()">Cargando...</span>
            <span *ngIf="!isLoading()">Entrar</span>
          </button>
        </form>
      </div>
    </div>
  `
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
