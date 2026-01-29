import { Routes } from '@angular/router';

export const CUSTOMER_ROUTES: Routes = [
  // { path: 'dashboard', component: DashboardComponent },
  // { path: 'live-session/:id', component: LiveSessionComponent },
  // { path: 'history', component: HistoryComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
