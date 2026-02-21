import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GGBEvent, EventSubscription } from '../models/evento.interface';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class EventService {
  private api = inject(ApiService);
  private http = inject(HttpClient);

  getAll(): Observable<GGBEvent[]> {
    return this.api.getAll<GGBEvent>('eventos');
  }

  getById(id: number): Observable<GGBEvent> {
    return this.api.get<GGBEvent>(`eventos/${id}`);
  }

  create(event: Partial<GGBEvent>): Observable<GGBEvent> {
    return this.api.post<GGBEvent>('eventos', event);
  }

  update(id: number, event: Partial<GGBEvent>): Observable<GGBEvent> {
    return this.api.put<GGBEvent>(`eventos/${id}`, event);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`eventos/${id}`);
  }

  inscribirse(eventoId: number): Observable<EventSubscription> {
    return this.api.post<EventSubscription>(`eventos/${eventoId}/inscribirse`, {});
  }

  desinscribirse(eventoId: number): Observable<void> {
    return this.api.post<void>(`eventos/${eventoId}/desinscribirse`, {});
  }

  getMisInscripciones(): Observable<EventSubscription[]> {
    return this.api.get<EventSubscription[]>('inscripciones/mis-inscripciones');
  }

  private _imageVersion = signal(Date.now());

  getImageUrl(eventId: number): string {
    return `/api/eventos/${eventId}/imagen?v=${this._imageVersion()}`;
  }

  uploadImage(eventId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`/api/eventos/${eventId}/imagen`, formData).pipe(
      tap(() => this._imageVersion.set(Date.now()))
    );
  }

  deleteImage(eventId: number): Observable<any> {
    return this.http.delete(`/api/eventos/${eventId}/imagen`).pipe(
      tap(() => this._imageVersion.set(Date.now()))
    );
  }
}
