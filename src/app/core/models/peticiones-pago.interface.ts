export interface PeticionesPago {
  id: number;
  idSesion: number; // ID reference to SesionesMesa
  metodoPago: string; // 'EFECTIVO', 'TARJETA', 'BIZUM'
  monto: number;
  estado: string; // 'PENDIENTE', 'PAGADO', 'CANCELADO'
  fechaPeticion: string;
}
