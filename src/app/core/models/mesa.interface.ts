export interface Mesa {
  id: number;
  numeroMesa: number;
  nombreMesa: string;
  capacidad: number;
  zona: string;
  ubicacion: string;
  estado: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO';
  posX?: number;
  posY?: number;
  forma?: string;
  rotacion?: number;
}

export interface MesaLayout {
  id: number;
  posX: number | null;
  posY: number | null;
  forma: string;
  rotacion: number;
}
