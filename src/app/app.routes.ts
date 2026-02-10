import { Routes } from '@angular/router';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'public',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'public',
    loadChildren: () => import('./features/public/public.routes').then(m => m.PUBLIC_ROUTES)
  },
  {
    path: 'customer',
    loadChildren: () => import('./features/customer/customer.routes').then(m => m.CUSTOMER_ROUTES),
    canActivate: [RoleGuard],
    data: { role: 'CLIENTE' }
  },
  {
    path: 'staff',
    loadChildren: () => import('./features/staff/staff.routes').then(m => m.STAFF_ROUTES),
    canActivate: [RoleGuard],
    data: { role: 'EMPLEADO' }
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [RoleGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: '**',
    redirectTo: 'public'
  }
];
