import { Component, inject, signal, OnInit } from '@angular/core';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { MesaService } from '../../../core/services/mesa.service';
import { ProductoService } from '../../../core/services/producto.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ComandaService } from '../../../core/services/comanda.service';
import { JuegosCopiaService } from '../../../core/services/juegos-copia.service';
import { PeticionesPagoService } from '../../../core/services/peticiones-pago.service';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [StatsCardComponent, BeerLoaderComponent],
  template: `
    <app-beer-loader [isLoading]="isLoading()" />
    <div class="dashboard-wrapper">
      <h1 class="dashboard-title">Dashboard</h1>

      <div class="stats-grid">
        <app-stats-card
          icon="fa-chair"
          label="Mesas"
          [value]="mesasCount()"
          color="var(--success)"
        />
        <app-stats-card
          icon="fa-utensils"
          label="Productos"
          [value]="productosCount()"
          color="var(--primary-coral)"
        />
        <app-stats-card
          icon="fa-people-group"
          label="Clientes"
          [value]="clientesCount()"
          color="var(--warning)"
        />
        <app-stats-card
          icon="fa-receipt"
          label="Comandas"
          [value]="comandasCount()"
          color="var(--danger)"
        />
        <app-stats-card
          icon="fa-dice"
          label="Copias Juegos"
          [value]="juegosCopiaCount()"
          color="var(--success)"
        />
        <app-stats-card
          icon="fa-credit-card"
          label="Peticiones Pago"
          [value]="peticionesPagoCount()"
          color="var(--info)"
        />
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      padding: var(--spacing-xl);
    }

    .dashboard-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: var(--spacing-xl);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-lg);
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-wrapper {
        padding: var(--spacing-md);
      }
    }
  `]
})
export class StaffDashboardComponent implements OnInit {
  private mesaService = inject(MesaService);
  private productoService = inject(ProductoService);
  private clienteService = inject(ClienteService);
  private comandaService = inject(ComandaService);
  private juegosCopiaService = inject(JuegosCopiaService);
  private peticionesPagoService = inject(PeticionesPagoService);

  mesasCount = signal(0);
  productosCount = signal(0);
  clientesCount = signal(0);
  comandasCount = signal(0);
  juegosCopiaCount = signal(0);
  peticionesPagoCount = signal(0);
  isLoading = signal(true);

  ngOnInit(): void {
    this.mesaService.getAll().subscribe({
      next: (data) => this.mesasCount.set(data.length),
      error: () => this.mesasCount.set(0)
    });

    this.productoService.getAll().subscribe({
      next: (data) => this.productosCount.set(data.length),
      error: () => this.productosCount.set(0)
    });

    this.clienteService.getAll().subscribe({
      next: (data) => this.clientesCount.set(data.length),
      error: () => this.clientesCount.set(0)
    });

    this.comandaService.getAll().subscribe({
      next: (data) => this.comandasCount.set(data.length),
      error: () => this.comandasCount.set(0)
    });

    this.juegosCopiaService.getAll().subscribe({
      next: (data) => this.juegosCopiaCount.set(data.length),
      error: () => this.juegosCopiaCount.set(0)
    });

    this.peticionesPagoService.getAll().subscribe({
      next: (data) => {
        this.peticionesPagoCount.set(data.length);
        this.isLoading.set(false);
      },
      error: () => {
        this.peticionesPagoCount.set(0);
        this.isLoading.set(false);
      }
    });
  }
}
