export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoria: 'COMIDA' | 'BEBIDA' | 'ALCOHOL' | 'POSTRE' | 'SERVICIO';
  activo: boolean;
}
