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
    }
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('AuthService: Respuesta cruda del backend:', response);
        const normalizedRole = this.normalizeRole(response.role);
        console.log('AuthService: Rol normalizado:', normalizedRole);

        const authResponse: AuthResponse = {
          token: response.accessToken,
          rol: normalizedRole,
          usuario: null
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
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this._token.set(response.token);
    this._currentUser.set(response.usuario);
    this._currentRole.set(response.rol);
    localStorage.setItem('token', response.token);
    localStorage.setItem('role', response.rol);
    console.log('AuthService: Estado actualizado. Current Role:', this._currentRole());
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
