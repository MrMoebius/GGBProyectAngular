import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Factura } from '../models/factura.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private api = inject(ApiService);
  private endpoint = 'facturas';

  getAll(): Observable<Factura[]> {
    return this.api.getAll<Factura>(this.endpoint);
  }

  getById(id: number): Observable<Factura> {
    return this.api.get<Factura>(`${this.endpoint}/${id}`);
  }

  getBySesionId(idSesion: number): Observable<Factura> {
    return this.api.get<Factura>(`${this.endpoint}/sesion/${idSesion}`);
  }

  getMisFacturas(): Observable<Factura[]> {
    return this.api.get<Factura[]>(`${this.endpoint}/mis-facturas`);
  }
}
