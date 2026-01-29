import { Routes } from '@angular/router';
import { PlaceholderComponent } from './placeholder.component';

export const PUBLIC_ROUTES: Routes = [
  { path: 'catalog', component: PlaceholderComponent },
  { path: '', redirectTo: 'catalog', pathMatch: 'full' }
];
