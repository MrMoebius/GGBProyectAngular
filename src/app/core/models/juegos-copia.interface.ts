export interface JuegosCopia {
  id: number;
  idJuego: number; // ID reference to Juego
  codigoReferencia: string;
  estado: string; // 'DISPONIBLE', 'EN_USO', 'MANTENIMIENTO', 'BAJA'
  fechaAdquisicion?: string;
  notas?: string;
}
