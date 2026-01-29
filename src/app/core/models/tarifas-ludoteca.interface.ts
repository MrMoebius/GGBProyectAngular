export interface TarifasLudoteca {
  id: number;
  nombre: string;
  precio: number;
  duracionMinutos: number;
  descripcion?: string;
  activa: boolean;
}
