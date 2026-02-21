import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BggSearchResult {
  bggId: number;
  name: string;
  yearPublished: number | null;
}

export interface BggGameDetails {
  bggId: number;
  nombre: string;
  minJugadores: number | null;
  maxJugadores: number | null;
  duracionMediaMin: number | null;
  complejidad: string | null;
  genero: string | null;
  descripcion: string | null;
  imageUrl: string | null;
  rawWeight: number | null;
  yearPublished: number | null;
}

@Injectable({ providedIn: 'root' })
export class BggAdminService {
  private http = inject(HttpClient);
  private apiUrl = '/api/bgg';

  search(query: string): Observable<BggSearchResult[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<BggSearchResult[]>(`${this.apiUrl}/search`, { params });
  }

  getDetails(bggId: number): Observable<BggGameDetails> {
    return this.http.get<BggGameDetails>(`${this.apiUrl}/details/${bggId}`);
  }

  importImage(bggId: number, juegoId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/import-image/${bggId}/${juegoId}`, {});
  }
}
