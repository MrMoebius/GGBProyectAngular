import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, tap, shareReplay } from 'rxjs';

export interface BggData {
  imagenUrl?: string;
  rating?: number;
  totalRatings?: number;
  description?: string;
}

interface BggMetaEntry {
  bgg_id: number;
  rating: number | null;
  num_ratings: number | null;
  description: string | null;
  has_image: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BggService {
  private http = inject(HttpClient);
  private metadata: Record<string, BggMetaEntry> = {};
  private loaded = false;
  private load$: Observable<void> | null = null;

  /** Carga bgg-metadata.json una sola vez. */
  loadMetadata(): Observable<void> {
    if (this.loaded) return of(undefined);
    if (this.load$) return this.load$;

    this.load$ = this.http.get<Record<string, BggMetaEntry>>('assets/games/bgg-metadata.json').pipe(
      tap(data => {
        this.metadata = data;
        this.loaded = true;
      }),
      map(() => undefined),
      shareReplay(1)
    );
    return this.load$;
  }

  /** Devuelve datos BGG para un juego por su ID de backend. */
  getForGame(gameId: number): BggData {
    const entry = this.metadata[String(gameId)];
    if (!entry) return {};
    return {
      imagenUrl: entry.has_image ? `assets/games/${gameId}.jpg` : undefined,
      rating: entry.rating != null ? Math.round((entry.rating / 2) * 10) / 10 : undefined,
      totalRatings: entry.num_ratings ?? undefined,
      description: entry.description ?? undefined,
    };
  }

  /** Compatibilidad con JuegoService.enrichOne() */
  enrich(_nombre: string): Observable<BggData> {
    return of({});
  }
}
