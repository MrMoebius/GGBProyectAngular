export interface GGBEvent {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  horaFin?: string;
  ubicacion: string;
  capacidad: number;
  inscritos: number;
  listaEspera: number;
  tipo: 'TORNEO' | 'NOCHE_TEMATICA' | 'TALLER' | 'EVENTO_ESPECIAL';
  estado: 'PROXIMO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';
  tags: string[];
  creadoPor?: string;
}

export interface EventSubscription {
  id: number;
  idEvento: number;
  emailUsuario: string;
  estado: 'CONFIRMADA' | 'LISTA_ESPERA' | 'CANCELADA';
  fechaInscripcion: string;
}
