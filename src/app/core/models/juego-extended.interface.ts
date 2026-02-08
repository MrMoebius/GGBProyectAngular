import { Juego } from './juego.interface';

export interface JuegoExtended extends Juego {
  imagenUrl?: string;
  edadMinima?: number;
  editorial?: string;
  rating?: number;
  totalRatings?: number;
  tags?: string[];
}
