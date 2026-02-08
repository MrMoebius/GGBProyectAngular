import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { JuegosCopia } from '../models/juegos-copia.interface';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class JuegosCopiaService {
  private api = inject(ApiService);
  private endpoint = 'juegos-copia';

  getAll(): Observable<JuegosCopia[]> {
    return this.api.get<JuegosCopia[]>(this.endpoint);
  }

  getById(id: number): Observable<JuegosCopia> {
    return this.api.get<JuegosCopia>(`${this.endpoint}/${id}`);
  }

  create(juegosCopia: Partial<JuegosCopia>): Observable<JuegosCopia> {
    return this.api.post<JuegosCopia>(this.endpoint, juegosCopia);
  }

  update(id: number, juegosCopia: Partial<JuegosCopia>): Observable<JuegosCopia> {
    return this.api.put<JuegosCopia>(`${this.endpoint}/${id}`, juegosCopia);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
