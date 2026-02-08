import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.interface';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private api = inject(ApiService);
  private endpoint = 'productos';

  getAll(): Observable<Producto[]> {
    return this.api.get<Producto[]>(this.endpoint);
  }

  getById(id: number): Observable<Producto> {
    return this.api.get<Producto>(`${this.endpoint}/${id}`);
  }

  create(producto: Partial<Producto>): Observable<Producto> {
    return this.api.post<Producto>(this.endpoint, producto);
  }

  update(id: number, producto: Partial<Producto>): Observable<Producto> {
    return this.api.put<Producto>(`${this.endpoint}/${id}`, producto);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
