// DEPRECADO: Usar ReservasMesaService en su lugar.
// Este archivo se mantiene solo como referencia.
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
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
      const reservaTime = new Date(r.fechaHoraInicio);
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
    const fecha = reserva.fechaHoraInicio ? reserva.fechaHoraInicio.substring(0, 10) : '';
    const hora = reserva.fechaHoraInicio ? reserva.fechaHoraInicio.substring(11, 16) : '';

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
      fechaHoraInicio: reserva.fechaHoraInicio || '',
      fechaHoraFin: reserva.fechaHoraFin,
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


}
