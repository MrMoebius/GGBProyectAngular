import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PagosMesa } from '../models/pagos-mesa.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PagosMesaService {
  private api = inject(ApiService);
  private endpoint = 'pagos-mesa';

  getAll(): Observable<PagosMesa[]> {
    return this.api.getAll<PagosMesa>(this.endpoint);
  }

  getById(id: number): Observable<PagosMesa> {
    return this.api.get<PagosMesa>(`${this.endpoint}/${id}`);
  }

  create(pago: Partial<PagosMesa>): Observable<PagosMesa> {
    return this.api.post<PagosMesa>(this.endpoint, pago);
  }

  update(id: number, pago: Partial<PagosMesa>): Observable<PagosMesa> {
    return this.api.put<PagosMesa>(`${this.endpoint}/${id}`, pago);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
