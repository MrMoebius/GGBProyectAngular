export interface PeticionesPago {
  id: number;
  idSesion: number;
  metodoPreferido: 'EFECTIVO' | 'TARJETA' | 'BIZUM';
  atendida: boolean;
  fechaPeticion: string;
}
