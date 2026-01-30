import { Routes } from '@angular/router';
import { StaffSalaComponent } from './sala/staff-sala.component';

export const STAFF_ROUTES: Routes = [
  { path: 'sala', component: StaffSalaComponent },
  { path: '', redirectTo: 'sala', pathMatch: 'full' }
];
