import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LudotecaSesiones } from '../models/ludoteca-sesiones.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class LudotecaSesionesService {
  private api = inject(ApiService);
  private endpoint = 'ludoteca-sesiones';

  getAll(): Observable<LudotecaSesiones[]> {
    return this.api.getAll<LudotecaSesiones>(this.endpoint);
  }

  getById(id: number): Observable<LudotecaSesiones> {
    return this.api.get<LudotecaSesiones>(`${this.endpoint}/${id}`);
  }

  create(ludoteca: Partial<LudotecaSesiones>): Observable<LudotecaSesiones> {
    return this.api.post<LudotecaSesiones>(this.endpoint, ludoteca);
  }

  update(id: number, ludoteca: Partial<LudotecaSesiones>): Observable<LudotecaSesiones> {
    return this.api.put<LudotecaSesiones>(`${this.endpoint}/${id}`, ludoteca);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
