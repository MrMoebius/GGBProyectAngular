import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-staff-sala',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">Gestión de Sala (Personal)</h1>
      <div class="bg-white shadow rounded-lg p-6">
        <p class="text-gray-600">Bienvenido al panel de empleados.</p>
        <p class="text-sm text-gray-500 mt-2">
          Sesión iniciada como: <strong>{{ authService.currentUser()?.email || 'Usuario' }}</strong>
        </p>
      </div>
    </div>
  `
})
export class StaffSalaComponent {
  authService = inject(AuthService);
}
