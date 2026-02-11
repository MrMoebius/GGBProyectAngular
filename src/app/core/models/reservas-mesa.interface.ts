export interface ReservasMesa {
  id: number;
  idCliente: number; // ID reference to Cliente
  idMesa?: number; // ID reference to Mesa (optional, staff assigns later)
  fechaReserva: string;
  horaInicio: string;
  horaFin?: string;
  numPersonas: number;
  estado: string; // 'CONFIRMADA', 'CANCELADA', 'COMPLETADA', 'NO_SHOW'
  notas?: string;
}
