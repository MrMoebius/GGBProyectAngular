export interface Empleado {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  idRol: number;
  estado: 'ACTIVO' | 'INACTIVO' | 'VACACIONES' | 'BAJA';
  fechaIngreso: string;
}
