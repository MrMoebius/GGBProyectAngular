import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SesionMesa } from '../models/sesion-mesa.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SesionMesaService {
  private api = inject(ApiService);
  private endpoint = 'sesiones-mesa';

  getAll(): Observable<SesionMesa[]> {
    return this.api.getAll<SesionMesa>(this.endpoint);
  }

  getById(id: number): Observable<SesionMesa> {
    return this.api.get<SesionMesa>(`${this.endpoint}/${id}`);
  }

  create(sesion: Partial<SesionMesa>): Observable<SesionMesa> {
    return this.api.post<SesionMesa>(this.endpoint, sesion);
  }

  update(id: number, sesion: Partial<SesionMesa>): Observable<SesionMesa> {
    return this.api.put<SesionMesa>(`${this.endpoint}/${id}`, sesion);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  abrir(dto: Partial<SesionMesa>): Observable<SesionMesa> {
    return this.api.post<SesionMesa>(`${this.endpoint}/abrir`, dto);
  }

  cerrar(id: number): Observable<SesionMesa> {
    return this.api.post<SesionMesa>(`${this.endpoint}/${id}/cerrar`, {});
  }
}
