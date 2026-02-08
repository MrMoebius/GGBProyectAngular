export interface Mesa {
  id: number;
  numeroMesa: number;
  nombreMesa: string;
  capacidad: number;
  zona: string;
  ubicacion: string;
  estado: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'FUERA_DE_SERVICIO';
}
