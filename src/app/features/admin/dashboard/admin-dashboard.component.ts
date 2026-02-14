import { Component, inject, signal, OnInit } from '@angular/core';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { MesaService } from '../../../core/services/mesa.service';
import { ProductoService } from '../../../core/services/producto.service';
import { EmpleadoService } from '../../../core/services/empleado.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ComandaService } from '../../../core/services/comanda.service';
import { PeticionesPagoService } from '../../../core/services/peticiones-pago.service';
import { SesionMesaService } from '../../../core/services/sesion-mesa.service';
import { FacturaService } from '../../../core/services/factura.service';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [StatsCardComponent, BeerLoaderComponent],
  template: `
    <app-beer-loader [isLoading]="isLoading()" />
    <div class="dashboard-wrapper">
      <h1 class="dashboard-title">Dashboard</h1>

      <div class="stats-grid">
        <app-stats-card icon="fa-door-open" label="Sesiones Activas" [value]="sesionesActivasCount()" color="var(--success)" link="/admin/sesiones-mesa" />
        <app-stats-card icon="fa-receipt" label="Comandas" [value]="comandasCount()" color="var(--danger)" link="/admin/comandas" />
        <app-stats-card icon="fa-file-invoice" label="Facturas" [value]="facturasCount()" color="var(--warning)" link="/admin/facturas" />
        <app-stats-card icon="fa-credit-card" label="Peticiones Pago" [value]="peticionesPagoCount()" color="var(--info)" link="/admin/peticiones-pago" />
        <app-stats-card icon="fa-chair" label="Mesas" [value]="mesasCount()" color="var(--success)" link="/admin/mesas" />
        <app-stats-card icon="fa-utensils" label="Productos" [value]="productosCount()" color="var(--primary-coral)" link="/admin/productos" />
        <app-stats-card icon="fa-users-gear" label="Empleados" [value]="empleadosCount()" color="var(--info)" link="/admin/empleados" />
        <app-stats-card icon="fa-people-group" label="Clientes" [value]="clientesCount()" color="var(--warning)" link="/admin/clientes" />
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
      grid-template-columns: repeat(4, 1fr);
      gap: var(--spacing-lg);
    }

    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(3, 1fr);
      }
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
export class AdminDashboardComponent implements OnInit {
  private mesaService = inject(MesaService);
  private productoService = inject(ProductoService);
  private empleadoService = inject(EmpleadoService);
  private clienteService = inject(ClienteService);
  private comandaService = inject(ComandaService);
  private peticionesPagoService = inject(PeticionesPagoService);
  private sesionMesaService = inject(SesionMesaService);
  private facturaService = inject(FacturaService);

  mesasCount = signal(0);
  productosCount = signal(0);
  empleadosCount = signal(0);
  clientesCount = signal(0);
  comandasCount = signal(0);
  peticionesPagoCount = signal(0);
  sesionesActivasCount = signal(0);
  facturasCount = signal(0);
  isLoading = signal(true);

  ngOnInit(): void {
    this.mesaService.getAll().subscribe({ next: (d) => this.mesasCount.set(d.length), error: () => {} });
    this.productoService.getAll().subscribe({ next: (d) => this.productosCount.set(d.length), error: () => {} });
    this.empleadoService.getAll().subscribe({ next: (d) => this.empleadosCount.set(d.length), error: () => {} });
    this.clienteService.getAll().subscribe({ next: (d) => this.clientesCount.set(d.length), error: () => {} });
    this.comandaService.getAll().subscribe({ next: (d) => this.comandasCount.set(d.length), error: () => {} });
    this.peticionesPagoService.getAll().subscribe({ next: (d) => this.peticionesPagoCount.set(d.length), error: () => {} });
    this.sesionMesaService.getAll().subscribe({ next: (d) => this.sesionesActivasCount.set(d.filter(s => s.estado === 'ACTIVA').length), error: () => {} });
    this.facturaService.getAll().subscribe({
      next: (d) => { this.facturasCount.set(d.length); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); }
    });
  }
}
