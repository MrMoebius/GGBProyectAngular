import { Component } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <div class="placeholder-container">
      <div class="content-box">
        <h1 class="title">GGBProyect</h1>
        <p class="subtitle">¡Frontend Inicializado!</p>
        <p class="description">Estilos nativos CSS/SCSS configurados y funcionando.</p>

        <div class="actions">
            <button class="btn btn-primary">
              Acción Primaria
            </button>
            <button class="btn btn-secondary">
              Acción Secundaria
            </button>
        </div>

        <div class="status-grid">
          <div class="status-item free">Libre</div>
          <div class="status-item occupied">Ocupado</div>
          <div class="status-item reserved">Reservado</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f3f4f6;
    }

    .content-box {
      text-align: center;
      padding: 2rem;
      background-color: white;
      border-radius: var(--radius-lg);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      max-width: 32rem;
      width: 100%;
    }

    .title {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--primary-coral);
      margin-bottom: 1rem;
    }

    .subtitle {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--secondary-dark);
      margin-bottom: 0.5rem;
    }

    .description {
      color: var(--text-muted);
      margin-bottom: 2rem;
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      font-size: 0.875rem;
    }

    .status-item {
      padding: 0.5rem;
      border-radius: var(--radius-sm);
      border: 1px solid;
      text-align: center;
    }

    .status-item.free {
      background-color: rgba(16, 185, 129, 0.1);
      color: var(--status-free);
      border-color: var(--status-free);
    }

    .status-item.occupied {
      background-color: rgba(239, 68, 68, 0.1);
      color: var(--status-occupied);
      border-color: var(--status-occupied);
    }

    .status-item.reserved {
      background-color: rgba(245, 158, 11, 0.1);
      color: var(--status-reserved);
      border-color: var(--status-reserved);
    }
  `]
})
export class PlaceholderComponent {}
