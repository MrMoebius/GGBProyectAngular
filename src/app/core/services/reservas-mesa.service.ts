import { Injectable, inject } from '@angular/core';
import { Observable, of, tap, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LocalStorageService } from './local-storage.service';
import { ReservasMesa } from '../models/reservas-mesa.interface';

@Injectable({ providedIn: 'root' })
export class ReservasMesaService {
  private api = inject(ApiService);
  private storage = inject(LocalStorageService);
  private endpoint = 'reservas-mesa';

  /** Crea una reserva en el backend real. Guarda en localStorage para vista del cliente. */
  create(reserva: Partial<ReservasMesa>): Observable<ReservasMesa> {
    return this.api.post<ReservasMesa>(this.endpoint, reserva).pipe(
      tap(saved => {
        const cached = this.storage.load<ReservasMesa[]>('reservas', []);
        cached.push(saved);
        this.storage.save('reservas', cached);
      })
    );
  }

  /** Obtiene reservas del cliente desde localStorage (el backend no tiene endpoint GET para clientes). */
  getByCliente(): Observable<ReservasMesa[]> {
    return of(this.storage.load<ReservasMesa[]>('reservas', []));
  }

  /** Cancela una reserva localmente. Solo actualiza localStorage (clientes no tienen PUT en el backend). */
  cancel(id: number): Observable<void> {
    const reservas = this.storage.load<ReservasMesa[]>('reservas', []);
    const updated = reservas.map(r => r.id === id ? { ...r, estado: 'CANCELADA' } : r);
    this.storage.save('reservas', updated);
    return of(void 0);
  }

  /** Helpers para extraer fecha y hora de un ISO instant */
  static extractDate(iso: string): string {
    if (!iso) return '';
    return iso.substring(0, 10); // "2026-03-01"
  }

  static extractTime(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.getUTCHours().toString().padStart(2, '0') + ':' + d.getUTCMinutes().toString().padStart(2, '0');
  }

  /** Combina fecha (YYYY-MM-DD) y hora (HH:mm) en un ISO instant string */
  static toInstant(date: string, time: string): string {
    return `${date}T${time}:00Z`;
  }
}
