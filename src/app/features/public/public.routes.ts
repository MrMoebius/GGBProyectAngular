import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent) },
      { path: 'juegos', loadComponent: () => import('./games/game-catalog.component').then(m => m.GameCatalogComponent) },
      { path: 'juegos/:id', loadComponent: () => import('./games/game-detail.component').then(m => m.GameDetailComponent) },
      { path: 'encuentra-tu-juego', loadComponent: () => import('./games/game-quiz.component').then(m => m.GameQuizComponent) },
      { path: 'sugerir-juego', loadComponent: () => import('./games/game-request.component').then(m => m.GameRequestComponent) },
      { path: 'carta', loadComponent: () => import('./menu/menu-page.component').then(m => m.MenuPageComponent) },
      { path: 'eventos', loadComponent: () => import('./events/events-page.component').then(m => m.EventsPageComponent) },
      { path: 'eventos/:id', loadComponent: () => import('./events/event-detail.component').then(m => m.EventDetailComponent) },
      { path: 'reservas', loadComponent: () => import('./reservations/reservations-page.component').then(m => m.ReservationsPageComponent) },
      { path: 'nosotros', loadComponent: () => import('./about/about-page.component').then(m => m.AboutPageComponent) },
      { path: 'contacto', loadComponent: () => import('./contact/contact-page.component').then(m => m.ContactPageComponent) },
    ]
  }
];
