export interface ReservasMesa {
  id: number;
  idCliente?: number;
  idMesa?: number;
  fechaHoraInicio: string;
  fechaHoraFin?: string;
  numPersonas: number;
  idJuegoDeseado?: number;
  estado?: string;
  notas?: string;
  fechaSolicitud?: string;
  nombreManual?: string;
  telefonoManual?: string;
}
