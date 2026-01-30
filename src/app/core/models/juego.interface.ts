export interface Juego {
  id: number;
  nombre: string;
  minJugadores: number;
  maxJugadores: number;
  duracionMediaMin?: number;
  complejidad: string;
  genero: string;
  idioma?: string;
  descripcion?: string;
  ubicacion: string;
  recomendadoDosJugadores?: boolean;
  activo?: boolean;
}
