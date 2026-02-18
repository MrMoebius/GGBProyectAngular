// MOCK: Replace with real ReservasService when /api/reservas 401 bug is fixed
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { ReservasMesa } from '../models/reservas-mesa.interface';

const SEED_RESERVAS: ReservasMesa[] = [
  { id: 1, idCliente: 1, idMesa: 3, fechaReserva: '2026-02-08', horaInicio: '17:00', horaFin: '19:00', numPersonas: 4, estado: 'CONFIRMADA', notas: 'Cumpleanos', fechaSolicitud: '2026-02-05T10:30:00' },
  { id: 2, idCliente: 2, idMesa: 5, fechaReserva: '2026-02-10', horaInicio: '18:00', horaFin: '20:00', numPersonas: 6, estado: 'CONFIRMADA', fechaSolicitud: '2026-02-07T14:15:00' },
  { id: 3, idCliente: 1, idMesa: 1, fechaReserva: '2026-01-25', horaInicio: '16:00', horaFin: '18:00', numPersonas: 2, estado: 'COMPLETADA', fechaSolicitud: '2026-01-22T09:00:00' },
  { id: 4, idCliente: 3, idMesa: 7, fechaReserva: '2026-02-14', horaInicio: '19:00', horaFin: '21:00', numPersonas: 2, estado: 'CONFIRMADA', notas: 'San Valentin', fechaSolicitud: '2026-02-10T11:45:00' },
];

@Injectable({ providedIn: 'root' })
export class MockReservasService {
  private storage = inject(LocalStorageService);
  private _reservas = signal<ReservasMesa[]>(this.loadReservas());

  // Horarios: 0=Dom, 1=Lun, 2=Mar, 3=Mie, 4=Jue, 5=Vie, 6=Sab
  private readonly schedule: Record<number, { open: number; lastSlot: number } | null> = {
    0: { open: 12, lastSlot: 21 },
    1: null,
    2: { open: 17, lastSlot: 22 },
    3: { open: 17, lastSlot: 22 },
    4: { open: 17, lastSlot: 22 },
    5: { open: 17, lastSlot: 23 },
    6: { open: 12, lastSlot: 23 },
  };

  private getSlotsForDate(date: string): string[] {
    const day = new Date(date + 'T12:00:00').getDay();
    const hours = this.schedule[day];
    if (!hours) return [];
    const slots: string[] = [];
    for (let h = hours.open; h <= hours.lastSlot; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      if (h < hours.lastSlot) {
        slots.push(`${h.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  }

  private loadReservas(): ReservasMesa[] {
    const stored = this.storage.load<ReservasMesa[] | null>('reservas', null);
    const reservas = stored !== null ? stored : [...SEED_RESERVAS];
    const updated = this.autoCancelPastReservas(reservas);
    this.storage.save('reservas', updated);
    return updated;
  }

  private autoCancelPastReservas(reservas: ReservasMesa[]): ReservasMesa[] {
    const now = new Date();
    let changed = false;
    const result = reservas.map(r => {
      if (r.estado !== 'CONFIRMADA') return r;
      const reservaTime = new Date(r.fechaReserva + 'T' + r.horaInicio + ':00');
      const deadline = new Date(reservaTime.getTime() + 60 * 60 * 1000); // +1 hora
      if (now > deadline) {
        changed = true;
        return { ...r, estado: 'CANCELADA' };
      }
      return r;
    });
    return result;
  }

  getAll(): Observable<ReservasMesa[]> {
    this.runAutoCancel();
    return of(this._reservas());
  }

  private runAutoCancel(): void {
    const current = this._reservas();
    const updated = this.autoCancelPastReservas(current);
    if (updated !== current && JSON.stringify(updated) !== JSON.stringify(current)) {
      this._reservas.set(updated);
      this.storage.save('reservas', updated);
    }
  }

  getByCliente(clienteId: number): Observable<ReservasMesa[]> {
    return of(this._reservas().filter(r => r.idCliente === clienteId));
  }

  getById(id: number): Observable<ReservasMesa | undefined> {
    return of(this._reservas().find(r => r.id === id));
  }

  create(reserva: Partial<ReservasMesa>): Observable<ReservasMesa> {
    const fecha = reserva.fechaReserva || '';
    const hora = reserva.horaInicio || '';

    if (fecha) {
      const day = new Date(fecha + 'T12:00:00').getDay();
      if (this.schedule[day] === null) {
        return throwError(() => new Error('Los lunes estamos cerrados'));
      }
      const validSlots = this.getSlotsForDate(fecha);
      if (hora && !validSlots.includes(hora)) {
        return throwError(() => new Error('La hora seleccionada esta fuera del horario de apertura'));
      }
    }

    if (fecha && hora) {
      const reservaTime = new Date(fecha + 'T' + hora + ':00');
      if (reservaTime < new Date()) {
        return throwError(() => new Error('No se puede crear una reserva en una fecha/hora pasada'));
      }
    }

    const newReserva: ReservasMesa = {
      id: Math.max(0, ...this._reservas().map(r => r.id)) + 1,
      idCliente: reserva.idCliente || 0,
      nombreManual: reserva.nombreManual,
      telefonoManual: reserva.telefonoManual,
      idMesa: reserva.idMesa,
      fechaReserva: reserva.fechaReserva || '',
      horaInicio: reserva.horaInicio || '',
      horaFin: reserva.horaFin,
      numPersonas: reserva.numPersonas || 1,
      estado: reserva.idMesa ? 'CONFIRMADA' : 'PENDIENTE',
      notas: reserva.notas,
      fechaSolicitud: new Date().toISOString()
    };
    this._reservas.update(list => {
      const updated = [...list, newReserva];
      this.storage.save('reservas', updated);
      return updated;
    });
    return of(newReserva);
  }

  update(id: number, changes: Partial<ReservasMesa>): Observable<ReservasMesa | undefined> {
    let result: ReservasMesa | undefined;
    this._reservas.update(list => {
      const updated = list.map(r => {
        if (r.id === id) {
          result = { ...r, ...changes, id: r.id };
          return result;
        }
        return r;
      });
      this.storage.save('reservas', updated);
      return updated;
    });
    return of(result);
  }

  changeEstado(id: number, estado: string): Observable<void> {
    this._reservas.update(list => {
      const updated = list.map(r => r.id === id ? { ...r, estado } : r);
      this.storage.save('reservas', updated);
      return updated;
    });
    return of(void 0);
  }

  cancel(id: number): Observable<void> {
    return this.changeEstado(id, 'CANCELADA');
  }

  getAvailableSlots(date: string, mesaId: number): Observable<string[]> {
    const allSlots = this.getSlotsForDate(date);
    const booked = this._reservas()
      .filter(r => r.fechaReserva === date && r.idMesa === mesaId && r.estado !== 'CANCELADA')
      .map(r => r.horaInicio);
    return of(allSlots.filter(s => !booked.includes(s)));
  }
}
