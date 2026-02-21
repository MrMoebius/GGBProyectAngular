import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { Juego } from '../models/juego.interface';
import { JuegoExtended } from '../models/juego-extended.interface';
import { BggService } from './bgg.service';

@Injectable({
  providedIn: 'root'
})
export class JuegoService {
  private http = inject(HttpClient);
  private bgg = inject(BggService);
  private apiUrl = '/api/juegos';

  // === Metodos CRUD (backend directo) ===

  getJuegos(): Observable<Juego[]> {
    const params = new HttpParams().set('size', '10000');
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(page => page.content)
    );
  }

  getJuegoById(id: number): Observable<Juego> {
    return this.http.get<Juego>(`${this.apiUrl}/${id}`);
  }

  existsByNombre(nombre: string): Observable<boolean> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/exists`, { params }).pipe(
      map(res => res.exists)
    );
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

  copyImagen(targetId: number, sourceId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${targetId}/copy-imagen/${sourceId}`, {});
  }

  uploadImagen(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${id}/imagen`, formData);
  }

  deleteImagen(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/imagen`);
  }

  getImagenUrl(id: number): string {
    return `${this.apiUrl}/${id}/imagen`;
  }

  // === Metodos para componentes publicos ===
  // Cargan metadata BGG local y devuelven JuegoExtended[]

  getAll(): Observable<JuegoExtended[]> {
    return this.bgg.loadMetadata().pipe(
      switchMap(() => this.getJuegos()),
      map(juegos => juegos.map(j => this.toExtended(j)))
    );
  }

  getById(id: number): Observable<JuegoExtended | undefined> {
    return this.bgg.loadMetadata().pipe(
      switchMap(() => this.getJuegoById(id)),
      map(juego => this.toExtended(juego))
    );
  }

  getByGenero(genero: string): Observable<JuegoExtended[]> {
    return this.getAll().pipe(
      map(juegos => juegos.filter(j =>
        (j.genero || '').split(',').some(g => g.trim() === genero)
      ))
    );
  }

  getFeatured(): Observable<JuegoExtended[]> {
    return this.getAll().pipe(
      map(juegos => {
        const sorted = [...juegos].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        return sorted.slice(0, 6);
      })
    );
  }

  search(term: string): Observable<JuegoExtended[]> {
    const lower = term.toLowerCase();
    return this.getAll().pipe(
      map(juegos => juegos.filter(j =>
        j.nombre.toLowerCase().includes(lower) ||
        (j.genero || '').toLowerCase().includes(lower)
      ))
    );
  }

  // === Merge con metadata BGG local ===

  private toExtended(juego: Juego): JuegoExtended {
    const bgg = this.bgg.getForGame(juego.id);
    return {
      ...juego,
      imagenUrl: `/api/juegos/${juego.id}/imagen`,
      rating: bgg.rating,
      totalRatings: bgg.totalRatings,
    };
  }
}
