export interface LudotecaSesiones {
  id: number;
  idSesionMesa: number; // ID reference to SesionesMesa
  idTarifa: number; // ID reference to TarifasLudoteca
  horaInicio: string;
  horaFin?: string;
  totalCalculado?: number;
}
