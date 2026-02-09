import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FavoritesService } from '../../../core/services/favorites.service';
import { JuegoService } from '../../../core/services/juego.service';
import { GameCardPublicComponent } from '../../../shared/components/game-card-public/game-card-public.component';
import { JuegoExtended } from '../../../core/models/juego-extended.interface';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [GameCardPublicComponent],
  template: `
    <div class="favorites-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            <i class="fa-solid fa-heart"></i>
            Mis Favoritos
          </h1>
          <p class="page-subtitle">{{ favoriteGames().length }} juegos guardados</p>
        </div>
      </div>

      <!-- Content -->
      @if (favoriteGames().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fa-regular fa-heart"></i>
          </div>
          <h2 class="empty-title">No tienes favoritos aun</h2>
          <p class="empty-text">
            Explora nuestro catalogo de juegos y marca tus favoritos con el corazon
            para tenerlos siempre a mano.
          </p>
        </div>
      } @else {
        <div class="favorites-grid">
          @for (game of favoriteGames(); track game.id) {
            <app-game-card-public [game]="game" />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .favorites-page {
      max-width: 1100px;
      margin: 0 auto;
    }

    /* ===== Header ===== */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-white, #fff);
      margin: 0;
    }

    .page-title i {
      color: #EF4444;
    }

    .page-subtitle {
      font-size: 0.85rem;
      color: var(--text-muted, #94a3b8);
      margin: 0.3rem 0 0;
    }

    /* ===== Grid ===== */
    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }

    /* ===== Empty state ===== */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 40vh;
      text-align: center;
      padding: 2rem;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: rgba(239, 68, 68, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .empty-icon i {
      font-size: 2.25rem;
      color: rgba(239, 68, 68, 0.4);
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-white, #fff);
      margin: 0 0 0.5rem;
    }

    .empty-text {
      font-size: 0.875rem;
      color: var(--text-muted, #94a3b8);
      max-width: 360px;
      line-height: 1.6;
      margin: 0;
    }

    /* ===== Responsive ===== */
    @media (max-width: 900px) {
      .favorites-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 560px) {
      .favorites-grid {
        grid-template-columns: 1fr;
      }

      .page-title {
        font-size: 1.25rem;
      }
    }
  `]
})
export class FavoritesPageComponent implements OnInit {
  private favoritesService = inject(FavoritesService);
  private juegosService = inject(JuegoService);

  private allGames = signal<JuegoExtended[]>([]);

  favoriteGames = computed(() => {
    const favIds = this.favoritesService.favorites();
    return this.allGames().filter(g => favIds.includes(g.id));
  });

  ngOnInit(): void {
    this.juegosService.getAll().subscribe(games => {
      this.allGames.set(games);
    });
  }
}
