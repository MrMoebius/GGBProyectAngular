import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'mesas', loadComponent: () => import('./mesas/mesas-list.component').then(m => m.MesasListComponent) },
      { path: 'productos', loadComponent: () => import('./productos/productos-list.component').then(m => m.ProductosListComponent) },
      { path: 'empleados', loadComponent: () => import('./empleados/empleados-list.component').then(m => m.EmpleadosListComponent) },
      { path: 'clientes', loadComponent: () => import('./clientes/clientes-list.component').then(m => m.ClientesListComponent) },
      { path: 'comandas', loadComponent: () => import('./comandas/comandas-list.component').then(m => m.ComandasListComponent) },
      { path: 'juegos', loadComponent: () => import('./juegos/juegos-list.component').then(m => m.JuegosListComponent) },
      { path: 'juegos-copia', loadComponent: () => import('./juegos-copia/juegos-copia-list.component').then(m => m.JuegosCopiaListComponent) },
      { path: 'peticiones-pago', loadComponent: () => import('./peticiones-pago/peticiones-pago-list.component').then(m => m.PeticionesPagoListComponent) },
      { path: 'eventos', loadComponent: () => import('./eventos/eventos-list.component').then(m => m.EventosListComponent) },
      { path: 'reservas', loadComponent: () => import('./reservas/reservas-list.component').then(m => m.ReservasListComponent) },
      { path: 'sesiones-mesa', loadComponent: () => import('./sesiones-mesa/sesiones-mesa-list.component').then(m => m.SesionesMesaListComponent) },
      { path: 'sesiones-mesa/:id', loadComponent: () => import('./sesiones-mesa/sesion-mesa-detail.component').then(m => m.SesionMesaDetailComponent) },
      { path: 'facturas', loadComponent: () => import('./facturas/facturas-list.component').then(m => m.FacturasListComponent) },
      { path: 'pagos-mesa', loadComponent: () => import('./pagos-mesa/pagos-mesa-list.component').then(m => m.PagosMesaListComponent) },
      { path: 'lineas-comanda', loadComponent: () => import('./lineas-comanda/lineas-comanda-list.component').then(m => m.LineasComandaListComponent) },
      { path: 'ludoteca-sesiones', loadComponent: () => import('./ludoteca-sesiones/ludoteca-sesiones-list.component').then(m => m.LudotecaSesionesListComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
