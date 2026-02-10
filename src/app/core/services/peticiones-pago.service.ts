import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PeticionesPago } from '../models/peticiones-pago.interface';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class PeticionesPagoService {
  private api = inject(ApiService);
  private endpoint = 'peticiones-pago';

  getAll(): Observable<PeticionesPago[]> {
    return this.api.getAll<PeticionesPago>(this.endpoint);
  }

  getById(id: number): Observable<PeticionesPago> {
    return this.api.get<PeticionesPago>(`${this.endpoint}/${id}`);
  }

  create(peticionesPago: Partial<PeticionesPago>): Observable<PeticionesPago> {
    return this.api.post<PeticionesPago>(this.endpoint, peticionesPago);
  }

  update(id: number, peticionesPago: Partial<PeticionesPago>): Observable<PeticionesPago> {
    return this.api.put<PeticionesPago>(`${this.endpoint}/${id}`, peticionesPago);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
