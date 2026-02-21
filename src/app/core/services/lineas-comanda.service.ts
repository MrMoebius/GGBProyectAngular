import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LineasComanda } from '../models/lineas-comanda.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class LineasComandaService {
  private api = inject(ApiService);
  private endpoint = 'lineas-comanda';

  getAll(): Observable<LineasComanda[]> {
    return this.api.getAll<LineasComanda>(this.endpoint);
  }

  getById(id: number): Observable<LineasComanda> {
    return this.api.get<LineasComanda>(`${this.endpoint}/${id}`);
  }

  create(linea: Partial<LineasComanda>): Observable<LineasComanda> {
    return this.api.post<LineasComanda>(this.endpoint, linea);
  }

  update(id: number, linea: Partial<LineasComanda>): Observable<LineasComanda> {
    return this.api.put<LineasComanda>(`${this.endpoint}/${id}`, linea);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getByComanda(idComanda: number): Observable<LineasComanda[]> {
    return this.api.get<LineasComanda[]>(`${this.endpoint}/comanda/${idComanda}`);
  }

  createByCliente(linea: Partial<LineasComanda>): Observable<LineasComanda> {
    return this.api.post<LineasComanda>(`${this.endpoint}/cliente`, linea);
  }

  deleteByCliente(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}/cliente`);
  }
}
