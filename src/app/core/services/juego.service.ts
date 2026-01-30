import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Juego } from '../models/juego.interface';

@Injectable({
  providedIn: 'root'
})
export class JuegoService {
  private http = inject(HttpClient);
  private apiUrl = '/api/juegos';

  getJuegos(): Observable<Juego[]> {
    return this.http.get<Juego[]>(this.apiUrl);
  }

  getJuegoById(id: number): Observable<Juego> {
    return this.http.get<Juego>(`${this.apiUrl}/${id}`);
  }

  saveJuego(juego: Juego): Observable<Juego> {
    return this.http.post<Juego>(this.apiUrl, juego);
  }

  updateJuego(id: number, juego: Juego): Observable<Juego> {
    return this.http.put<Juego>(`${this.apiUrl}/${id}`, juego);
  }

  deleteJuego(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
