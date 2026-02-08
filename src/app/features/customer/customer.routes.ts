import { Routes } from '@angular/router';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/customer-layout.component').then(m => m.CustomerLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/customer-dashboard.component').then(m => m.CustomerDashboardComponent) },
      { path: 'favoritos', loadComponent: () => import('./favorites/favorites-page.component').then(m => m.FavoritesPageComponent) },
      { path: 'historial', loadComponent: () => import('./history/game-history-page.component').then(m => m.GameHistoryPageComponent) },
      { path: 'reservas', loadComponent: () => import('./reservations/my-reservations.component').then(m => m.MyReservationsComponent) },
      { path: 'notificaciones', loadComponent: () => import('./notifications/notifications-page.component').then(m => m.NotificationsPageComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
