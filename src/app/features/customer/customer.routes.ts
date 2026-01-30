import { Routes } from '@angular/router';
import { CustomerDashboardComponent } from './dashboard/customer-dashboard.component';

export const CUSTOMER_ROUTES: Routes = [
  { path: 'dashboard', component: CustomerDashboardComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
