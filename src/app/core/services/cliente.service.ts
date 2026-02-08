import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.interface';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private api = inject(ApiService);
  private endpoint = 'clientes';

  getAll(): Observable<Cliente[]> {
    return this.api.get<Cliente[]>(this.endpoint);
  }

  getById(id: number): Observable<Cliente> {
    return this.api.get<Cliente>(`${this.endpoint}/${id}`);
  }

  create(cliente: Partial<Cliente>): Observable<Cliente> {
    return this.api.post<Cliente>(this.endpoint, cliente);
  }

  update(id: number, cliente: Partial<Cliente>): Observable<Cliente> {
    return this.api.put<Cliente>(`${this.endpoint}/${id}`, cliente);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
