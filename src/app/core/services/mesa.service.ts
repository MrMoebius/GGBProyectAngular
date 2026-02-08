import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Mesa } from '../models/mesa.interface';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class MesaService {
  private api = inject(ApiService);
  private endpoint = 'mesas';

  getAll(): Observable<Mesa[]> {
    return this.api.get<Mesa[]>(this.endpoint);
  }

  getById(id: number): Observable<Mesa> {
    return this.api.get<Mesa>(`${this.endpoint}/${id}`);
  }

  create(mesa: Partial<Mesa>): Observable<Mesa> {
    return this.api.post<Mesa>(this.endpoint, mesa);
  }

  update(id: number, mesa: Partial<Mesa>): Observable<Mesa> {
    return this.api.put<Mesa>(`${this.endpoint}/${id}`, mesa);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
