export interface ReservasMesa {
  id: number;
  idCliente: number;
  nombreManual?: string;
  telefonoManual?: string;
  idMesa?: number;
  fechaReserva: string;
  horaInicio: string;
  horaFin?: string;
  numPersonas: number;
  estado: string;
  notas?: string;
  fechaSolicitud?: string;
}
