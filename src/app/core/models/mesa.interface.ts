export interface Mesa {
  id: number;
  numeroMesa: number;
  capacidad: number;
  zona: string;
  estado: 'LIBRE' | 'OCUPADA' | 'RESERVADA'; // Ajustar según valores del backend
}
