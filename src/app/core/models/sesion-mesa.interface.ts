export interface SesionMesa {
  id: number;
  idMesa: number;
  idReserva?: number;
  idEmpleadoApertura?: number;
  idCliente?: number;
  numComensales?: number;
  usaLudoteca: boolean;
  estado: string;
  fechaHoraApertura: string;
  fechaHoraCierre?: string;
  inicio?: string;
  fin?: string;
}
