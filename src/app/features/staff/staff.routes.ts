import { Routes } from '@angular/router';

export const STAFF_ROUTES: Routes = [
  // { path: 'sala', component: SalaComponent },
  // { path: 'tpv', component: TpvComponent },
  // { path: 'ludoteca', component: LudotecaComponent },
  { path: '', redirectTo: 'sala', pathMatch: 'full' }
];
