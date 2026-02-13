import { Routes } from '@angular/router';
import { StaffLayoutComponent } from './layout/staff-layout.component';

export const STAFF_ROUTES: Routes = [
  {
    path: '',
    component: StaffLayoutComponent,
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/staff-dashboard.component').then(m => m.StaffDashboardComponent) },
      { path: 'mesas', loadComponent: () => import('../admin/mesas/mesas-list.component').then(m => m.MesasListComponent) },
      { path: 'productos', loadComponent: () => import('../admin/productos/productos-list.component').then(m => m.ProductosListComponent) },
      { path: 'clientes', loadComponent: () => import('../admin/clientes/clientes-list.component').then(m => m.ClientesListComponent) },
      { path: 'comandas', loadComponent: () => import('../admin/comandas/comandas-list.component').then(m => m.ComandasListComponent) },
      { path: 'juegos', loadComponent: () => import('../admin/juegos/juegos-list.component').then(m => m.JuegosListComponent) },
      { path: 'juegos-copia', loadComponent: () => import('../admin/juegos-copia/juegos-copia-list.component').then(m => m.JuegosCopiaListComponent) },
      { path: 'peticiones-pago', loadComponent: () => import('../admin/peticiones-pago/peticiones-pago-list.component').then(m => m.PeticionesPagoListComponent) },
      { path: 'eventos', loadComponent: () => import('../admin/eventos/eventos-list.component').then(m => m.EventosListComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
