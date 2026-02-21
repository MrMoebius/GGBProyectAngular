export interface ReservasMesa {
  id: number;
  idCliente?: number;
  idMesa?: number;
  fechaHoraInicio: string;  // ISO 8601 instant (e.g. "2026-03-01T19:00:00Z")
  fechaHoraFin?: string;    // ISO 8601 instant
  numPersonas: number;
  idJuegoDeseado?: number;
  estado?: string;           // 'PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA', 'NO_PRESENTADO'
  notas?: string;
  fechaSolicitud?: string;
  nombreManual?: string;
  telefonoManual?: string;
}
