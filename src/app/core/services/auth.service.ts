import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { AuthResponse } from '../models/auth-response.interface';
import { Cliente } from '../models/cliente.interface';
import { Empleado } from '../models/empleado.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth'; // Ajustar según endpoint real

  // Signals para gestión de estado
  private _currentUser = signal<Cliente | Empleado | null>(null);
  private _currentRole = signal<'CLIENTE' | 'EMPLEADO' | 'ADMIN' | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));

  // Computed signals
  public currentUser = computed(() => this._currentUser());
  public currentRole = computed(() => this._currentRole());
  public isAuthenticated = computed(() => !!this._token());

  constructor(private http: HttpClient) {
    // Intentar restaurar sesión si existe token (lógica simplificada)
    if (this._token()) {
      // Aquí se podría llamar a un endpoint /me para validar token y obtener usuario
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    // Simulación de llamada HTTP
    // return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
    //   tap(response => this.handleAuthSuccess(response))
    // );

    // Mock para desarrollo inicial (eliminar en producción)
    const mockResponse: AuthResponse = {
      token: 'mock-jwt-token',
      usuario: { id: 1, nombre: 'Usuario Test', email: credentials.email, idRol: 1 } as Empleado,
      rol: 'ADMIN'
    };
    this.handleAuthSuccess(mockResponse);
    return of(mockResponse);
  }

  logout(): void {
    this._currentUser.set(null);
    this._currentRole.set(null);
    this._token.set(null);
    localStorage.removeItem('token');
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this._token.set(response.token);
    this._currentUser.set(response.usuario);
    this._currentRole.set(response.rol);
    localStorage.setItem('token', response.token);
  }

  hasRole(role: 'CLIENTE' | 'EMPLEADO' | 'ADMIN'): boolean {
    return this._currentRole() === role;
  }
}
