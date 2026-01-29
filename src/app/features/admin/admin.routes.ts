import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  // { path: 'inventory', component: InventoryComponent },
  // { path: 'staff', component: StaffManagementComponent },
  // { path: 'settings', component: SettingsComponent },
  { path: '', redirectTo: 'inventory', pathMatch: 'full' }
];
