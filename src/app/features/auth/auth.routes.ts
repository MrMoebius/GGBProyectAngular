import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { VerificarEmailComponent } from './verificar-email/verificar-email.component';

/**
 * Rutas del modulo de autenticacion.
 * - /auth/login: inicio de sesion
 * - /auth/registro: registro publico de nuevos clientes
 * - /auth/verificar-email: verificacion de email con token (llega por enlace del correo)
 */
export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'verificar-email', component: VerificarEmailComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
