import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/auth-response.interface';
import { Cliente } from '../models/cliente.interface';
import { Empleado } from '../models/empleado.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';

  // Signals para gestión de estado
  private _currentUser = signal<Cliente | Empleado | null>(null);
  private _currentRole = signal<'CLIENTE' | 'EMPLEADO' | 'ADMIN' | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));

  // Computed signals
  public currentUser = computed(() => this._currentUser());
  public currentRole = computed(() => this._currentRole());
  public isAuthenticated = computed(() => !!this._token());

  constructor(private http: HttpClient) {
    // Intentar restaurar sesión si existe token
    if (this._token()) {
      const storedRole = localStorage.getItem('role') as 'CLIENTE' | 'EMPLEADO' | 'ADMIN';
      if (storedRole) {
        this._currentRole.set(storedRole);
      }
      // Intentar recuperar usuario del localStorage si existe (persistencia básica)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this._currentUser.set(JSON.parse(storedUser));
      }
    }
  }

  /** Registro publico de cliente. Envia nombre, email y telefono al backend, que envia email de verificacion. */
  registro(data: { nombre: string; email: string; telefono: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registro`, data);
  }

  /** Verifica el email del cliente con el token recibido por correo y establece su contraseña. */
  verificarEmail(data: { token: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verificar-email`, data);
  }

  /** Reenvia el email de verificacion (util si el token expiro o no llego el correo). */
  reenviarVerificacion(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reenviar-verificacion`, null, {
      params: { email }
    });
  }

  solicitarRecuperacion(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/solicitar-recuperacion`, null, {
      params: { email }
    });
  }

  recuperarPassword(data: { token: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recuperar-password`, data);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    this.logout();
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('AuthService: Respuesta cruda del backend:', response);
        const normalizedRole = this.normalizeRole(response.role);

        // Usar nombre e id del backend si vienen, o fallback a la parte local del email
        const nombre = response.nombre || response.email?.split('@')[0] || 'Usuario';
        const usuarioBasico = { id: response.clienteId, email: response.email, nombre } as any;

        const authResponse: AuthResponse = {
          token: response.accessToken,
          rol: normalizedRole,
          usuario: usuarioBasico
        };
        this.handleAuthSuccess(authResponse);
      })
    );
  }

  logout(): void {
    this._currentUser.set(null);
    this._currentRole.set(null);
    this._token.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this._token.set(response.token);
    this._currentUser.set(response.usuario);
    this._currentRole.set(response.rol);

    localStorage.setItem('token', response.token);
    localStorage.setItem('role', response.rol);
    if (response.usuario) {
      localStorage.setItem('user', JSON.stringify(response.usuario));
    }
  }

  hasRole(role: 'CLIENTE' | 'EMPLEADO' | 'ADMIN'): boolean {
    return this._currentRole() === role;
  }

  private normalizeRole(role: string): 'CLIENTE' | 'EMPLEADO' | 'ADMIN' {
    if (!role) return 'CLIENTE'; // Fallback seguro
    if (role.startsWith('ROLE_')) {
      return role.substring(5) as 'CLIENTE' | 'EMPLEADO' | 'ADMIN';
    }
    return role as 'CLIENTE' | 'EMPLEADO' | 'ADMIN';
  }
}
