import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Comanda } from '../models/comanda.interface';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class ComandaService {
  private api = inject(ApiService);
  private endpoint = 'comandas';

  getAll(): Observable<Comanda[]> {
    return this.api.getAll<Comanda>(this.endpoint);
  }

  getById(id: number): Observable<Comanda> {
    return this.api.get<Comanda>(`${this.endpoint}/${id}`);
  }

  create(comanda: Partial<Comanda>): Observable<Comanda> {
    return this.api.post<Comanda>(this.endpoint, comanda);
  }

  update(id: number, comanda: Partial<Comanda>): Observable<Comanda> {
    return this.api.put<Comanda>(`${this.endpoint}/${id}`, comanda);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  confirmar(id: number): Observable<Comanda> {
    return this.api.post<Comanda>(`${this.endpoint}/${id}/confirmar`, {});
  }

  preparar(id: number): Observable<Comanda> {
    return this.api.post<Comanda>(`${this.endpoint}/${id}/preparar`, {});
  }

  servir(id: number): Observable<Comanda> {
    return this.api.post<Comanda>(`${this.endpoint}/${id}/servir`, {});
  }

  cancelar(id: number): Observable<Comanda> {
    return this.api.post<Comanda>(`${this.endpoint}/${id}/cancelar`, {});
  }

  createByCliente(comanda: Partial<Comanda>): Observable<Comanda> {
    return this.api.post<Comanda>(`${this.endpoint}/cliente`, comanda);
  }
}
