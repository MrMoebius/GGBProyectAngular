import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReservasMesa } from '../models/reservas-mesa.interface';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ReservasMesaService {
  private api = inject(ApiService);
  private endpoint = 'reservas-mesa';

  getAll(): Observable<ReservasMesa[]> {
    return this.api.getAll<ReservasMesa>(this.endpoint);
  }

  getById(id: number): Observable<ReservasMesa> {
    return this.api.get<ReservasMesa>(`${this.endpoint}/${id}`);
  }

  create(reserva: Partial<ReservasMesa>): Observable<ReservasMesa> {
    return this.api.post<ReservasMesa>(this.endpoint, reserva);
  }

  update(id: number, reserva: Partial<ReservasMesa>): Observable<ReservasMesa> {
    return this.api.put<ReservasMesa>(`${this.endpoint}/${id}`, reserva);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getMisReservas(): Observable<ReservasMesa[]> {
    return this.api.get<ReservasMesa[]>(`${this.endpoint}/mis-reservas`);
  }

  cancelCliente(id: number): Observable<ReservasMesa> {
    return this.api.post<ReservasMesa>(`${this.endpoint}/${id}/cancelar-cliente`, {});
  }

  changeEstado(id: number, estado: string): Observable<ReservasMesa> {
    return this.api.patch<ReservasMesa>(`${this.endpoint}/${id}/estado`, { estado });
  }

  static extractDate(isoStr: string): string {
    if (!isoStr) return '';
    return isoStr.substring(0, 10);
  }

  static extractTime(isoStr: string): string {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  static toInstant(date: string, time: string): string {
    return date + 'T' + time + ':00Z';
  }

  static buildInstant(date: string, time: string): string {
    return ReservasMesaService.toInstant(date, time);
  }
}
