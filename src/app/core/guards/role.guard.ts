import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const RoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'];
  const currentRole = authService.currentRole();

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (expectedRole && currentRole !== expectedRole) {
    // Si el rol no coincide, redirigir a una página de acceso denegado o al home
    // Por ahora redirigimos al public
    router.navigate(['/public']);
    return false;
  }

  return true;
};
