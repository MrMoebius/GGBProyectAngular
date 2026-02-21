import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { VerificarEmailComponent } from './verificar-email/verificar-email.component';
import { SolicitarRecuperacionComponent } from './solicitar-recuperacion/solicitar-recuperacion.component';
import { RecuperarPasswordComponent } from './recuperar-password/recuperar-password.component';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'verificar-email', component: VerificarEmailComponent },
  { path: 'solicitar-recuperacion', component: SolicitarRecuperacionComponent },
  { path: 'recuperar-password', component: RecuperarPasswordComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
