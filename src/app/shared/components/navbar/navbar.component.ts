import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center cursor-pointer" routerLink="/">
            <span class="text-2xl font-bold text-coral-600">GGB</span>
            <span class="text-xl font-semibold text-gray-700 ml-1">Proyect</span>
          </div>

          <!-- User Menu -->
          <div class="flex items-center">
            <ng-container *ngIf="authService.isAuthenticated(); else loginBtn">
              <div class="flex items-center gap-4">
                <div class="text-right hidden sm:block">
                  <p class="text-sm font-medium text-gray-900">
                    {{ authService.currentUser()?.nombre || 'Usuario' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ authService.currentRole() }}
                  </p>
                </div>

                <button
                  (click)="logout()"
                  class="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Salir
                </button>
              </div>
            </ng-container>

            <ng-template #loginBtn>
              <a
                routerLink="/auth/login"
                class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Iniciar Sesión
              </a>
            </ng-template>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .text-coral-600 { color: #FF6B6B; }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
