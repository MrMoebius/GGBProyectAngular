import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Empleado } from '../models/empleado.interface';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {
  private api = inject(ApiService);
  private endpoint = 'empleados';

  getAll(): Observable<Empleado[]> {
    return this.api.get<Empleado[]>(this.endpoint);
  }

  getById(id: number): Observable<Empleado> {
    return this.api.get<Empleado>(`${this.endpoint}/${id}`);
  }

  create(empleado: Partial<Empleado>): Observable<Empleado> {
    return this.api.post<Empleado>(this.endpoint, empleado);
  }

  update(id: number, empleado: Partial<Empleado>): Observable<Empleado> {
    return this.api.put<Empleado>(`${this.endpoint}/${id}`, empleado);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
