import { Empleado } from './empleado.interface';
import { Cliente } from './cliente.interface';

export interface AuthResponse {
  token: string;
  usuario: Cliente | Empleado;
  rol: 'CLIENTE' | 'EMPLEADO' | 'ADMIN';
}
