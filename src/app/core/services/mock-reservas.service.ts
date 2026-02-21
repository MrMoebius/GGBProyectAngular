// DEPRECADO: Usar ReservasMesaService en su lugar.
// Este archivo se mantiene solo como referencia.
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { ReservasMesa } from '../models/reservas-mesa.interface';

const SEED_RESERVAS: ReservasMesa[] = [
  { id: 1, idCliente: 1, idMesa: 3, fechaHoraInicio: '2026-02-08T17:00:00Z', fechaHoraFin: '2026-02-08T19:00:00Z', numPersonas: 4, estado: 'CONFIRMADA', notas: 'Cumpleanos' },
  { id: 2, idCliente: 2, idMesa: 5, fechaHoraInicio: '2026-02-10T18:00:00Z', fechaHoraFin: '2026-02-10T20:00:00Z', numPersonas: 6, estado: 'CONFIRMADA' },
  { id: 3, idCliente: 1, idMesa: 1, fechaHoraInicio: '2026-01-25T16:00:00Z', fechaHoraFin: '2026-01-25T18:00:00Z', numPersonas: 2, estado: 'COMPLETADA' },
  { id: 4, idCliente: 3, idMesa: 7, fechaHoraInicio: '2026-02-14T19:00:00Z', fechaHoraFin: '2026-02-14T21:00:00Z', numPersonas: 2, estado: 'CONFIRMADA', notas: 'San Valentin' },
];

@Injectable({ providedIn: 'root' })
export class MockReservasService {
  private storage = inject(LocalStorageService);
  private _reservas = signal<ReservasMesa[]>(this.loadReservas());

  private loadReservas(): ReservasMesa[] {
    const stored = this.storage.load<ReservasMesa[] | null>('reservas', null);
    if (stored === null) {
      this.storage.save('reservas', SEED_RESERVAS);
      return SEED_RESERVAS;
    }
    return stored;
  }

  getAll(): Observable<ReservasMesa[]> {
    return of(this._reservas());
  }

  getByCliente(clienteId: number): Observable<ReservasMesa[]> {
    return of(this._reservas().filter(r => r.idCliente === clienteId));
  }

  getById(id: number): Observable<ReservasMesa | undefined> {
    return of(this._reservas().find(r => r.id === id));
  }

  create(reserva: Partial<ReservasMesa>): Observable<ReservasMesa> {
    const newReserva: ReservasMesa = {
      id: Math.max(0, ...this._reservas().map(r => r.id)) + 1,
      idCliente: reserva.idCliente || 0,
      idMesa: reserva.idMesa,
      fechaHoraInicio: reserva.fechaHoraInicio || '',
      fechaHoraFin: reserva.fechaHoraFin,
      numPersonas: reserva.numPersonas || 1,
      estado: reserva.idMesa ? 'CONFIRMADA' : 'PENDIENTE',
      notas: reserva.notas
    };
    this._reservas.update(list => {
      const updated = [...list, newReserva];
      this.storage.save('reservas', updated);
      return updated;
    });
    return of(newReserva);
  }

  cancel(id: number): Observable<void> {
    this._reservas.update(list => {
      const updated = list.map(r => r.id === id ? { ...r, estado: 'CANCELADA' } : r);
      this.storage.save('reservas', updated);
      return updated;
    });
    return of(void 0);
  }
}
