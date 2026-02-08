// MOCK: Replace with real ReservasService when /api/reservas 401 bug is fixed
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { ReservasMesa } from '../models/reservas-mesa.interface';

const SEED_RESERVAS: ReservasMesa[] = [
  { id: 1, idCliente: 1, idMesa: 3, fechaReserva: '2026-02-08', horaInicio: '17:00', horaFin: '19:00', numPersonas: 4, estado: 'CONFIRMADA', notas: 'Cumpleanos' },
  { id: 2, idCliente: 2, idMesa: 5, fechaReserva: '2026-02-10', horaInicio: '18:00', horaFin: '20:00', numPersonas: 6, estado: 'CONFIRMADA' },
  { id: 3, idCliente: 1, idMesa: 1, fechaReserva: '2026-01-25', horaInicio: '16:00', horaFin: '18:00', numPersonas: 2, estado: 'COMPLETADA' },
  { id: 4, idCliente: 3, idMesa: 7, fechaReserva: '2026-02-14', horaInicio: '19:00', horaFin: '21:00', numPersonas: 2, estado: 'CONFIRMADA', notas: 'San Valentin' },
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
      idMesa: reserva.idMesa || 0,
      fechaReserva: reserva.fechaReserva || '',
      horaInicio: reserva.horaInicio || '',
      horaFin: reserva.horaFin,
      numPersonas: reserva.numPersonas || 1,
      estado: 'CONFIRMADA',
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

  getAvailableSlots(date: string, mesaId: number): Observable<string[]> {
    const allSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
    const booked = this._reservas()
      .filter(r => r.fechaReserva === date && r.idMesa === mesaId && r.estado !== 'CANCELADA')
      .map(r => r.horaInicio);
    return of(allSlots.filter(s => !booked.includes(s)));
  }
}
