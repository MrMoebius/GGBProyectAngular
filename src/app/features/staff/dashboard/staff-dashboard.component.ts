import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { MesaService } from '../../../core/services/mesa.service';
import { ProductoService } from '../../../core/services/producto.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ComandaService } from '../../../core/services/comanda.service';
import { SesionMesaService } from '../../../core/services/sesion-mesa.service';
import { FacturaService } from '../../../core/services/factura.service';
import { MockReservasService } from '../../../core/services/mock-reservas.service';
import { Comanda } from '../../../core/models/comanda.interface';
import { ReservasMesa } from '../../../core/models/reservas-mesa.interface';
import { SesionMesa } from '../../../core/models/sesion-mesa.interface';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

interface ActivityItem {
  icon: string;
  color: string;
  title: string;
  detail: string;
  link?: string;
}

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatsCardComponent, BeerLoaderComponent],
  template: `
    <app-beer-loader [isLoading]="isLoading()" />
    <div class="dashboard-wrapper">
      <h1 class="dashboard-title">Dashboard</h1>

      <div class="stats-grid">
        <app-stats-card icon="fa-door-open" label="Sesiones Activas" [value]="sesionesActivasCount()" color="var(--success)" link="/staff/sesiones-mesa" />
        <app-stats-card icon="fa-calendar-check" label="Reservas" [value]="reservasCount()" color="var(--neon-purple, #A78BFA)" link="/staff/reservas" />
        <app-stats-card icon="fa-receipt" label="Comandas" [value]="comandasCount()" color="var(--danger)" link="/staff/comandas" />
        <app-stats-card icon="fa-file-invoice" label="Facturas" [value]="facturasCount()" color="var(--warning)" link="/staff/facturas" />
        <app-stats-card icon="fa-chair" label="Mesas" [value]="mesasCount()" color="var(--success)" link="/staff/mesas" />
        <app-stats-card icon="fa-utensils" label="Productos" [value]="productosCount()" color="var(--primary-coral)" link="/staff/productos" />
        <app-stats-card icon="fa-people-group" label="Clientes" [value]="clientesCount()" color="var(--warning)" link="/staff/clientes" />
      </div>

      @if (activityItems().length > 0) {
        <div class="activity-section">
          <h2 class="activity-title"><i class="fa-solid fa-bell"></i> Centro de Actividad</h2>
          <div class="activity-list">
            @for (item of activityItems(); track item.title + item.detail) {
              <a class="activity-item" [routerLink]="item.link" [style.border-left-color]="item.color">
                <div class="activity-icon" [style.color]="item.color">
                  <i class="fa-solid" [ngClass]="item.icon"></i>
                </div>
                <div class="activity-body">
                  <span class="activity-item-title">{{ item.title }}</span>
                  <span class="activity-item-detail">{{ item.detail }}</span>
                </div>
                <i class="fa-solid fa-chevron-right activity-arrow"></i>
              </a>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-wrapper { padding: var(--spacing-xl); }
    .dashboard-title { font-size: 1.75rem; font-weight: 700; color: var(--text-main); margin-bottom: var(--spacing-xl); }

    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--spacing-lg); }

    .activity-section { margin-top: var(--spacing-xl); }
    .activity-title { font-size: 1.125rem; font-weight: 700; color: var(--text-main); margin: 0 0 var(--spacing-md) 0; display: flex; align-items: center; gap: 0.5rem; }
    .activity-title i { color: var(--primary-coral); font-size: 1rem; }

    .activity-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .activity-item { display: flex; align-items: center; gap: 1rem; padding: 0.875rem 1.25rem; background-color: var(--card-bg); border: 1px solid var(--card-border); border-left: 3px solid transparent; border-radius: var(--radius-md, 8px); text-decoration: none; color: inherit; transition: border-color 0.2s, box-shadow 0.2s; cursor: pointer; }
    .activity-item:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .activity-icon { width: 32px; height: 32px; min-width: 32px; border-radius: 50%; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; font-size: 0.875rem; }
    .activity-body { flex: 1; display: flex; flex-direction: column; gap: 0.125rem; }
    .activity-item-title { font-size: 0.875rem; font-weight: 600; color: var(--text-main); }
    .activity-item-detail { font-size: 0.75rem; color: var(--text-muted); }
    .activity-arrow { font-size: 0.625rem; color: var(--text-muted); }

    @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); gap: var(--spacing-md); }
      .dashboard-wrapper { padding: var(--spacing-lg); }
      .dashboard-title { font-size: 1.5rem; }
    }
    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); gap: var(--spacing-sm); }
      .dashboard-wrapper { padding: var(--spacing-md); }
      .dashboard-title { font-size: 1.35rem; margin-bottom: var(--spacing-lg); }
      .activity-title { font-size: 1rem; }
      .activity-item { padding: 0.75rem 1rem; gap: 0.75rem; }
      .activity-item-title { font-size: 0.8125rem; }
      .activity-item-detail { font-size: 0.6875rem; }
      .activity-icon { width: 28px; height: 28px; min-width: 28px; font-size: 0.75rem; }
    }
    @media (max-width: 480px) {
      .stats-grid { grid-template-columns: 1fr; gap: var(--spacing-sm); }
      .dashboard-wrapper { padding: var(--spacing-sm); }
      .dashboard-title { font-size: 1.2rem; margin-bottom: var(--spacing-md); }
      .activity-item { padding: 0.625rem 0.75rem; gap: 0.5rem; flex-wrap: wrap; }
      .activity-item-title { font-size: 0.75rem; }
      .activity-item-detail { font-size: 0.625rem; }
      .activity-icon { width: 24px; height: 24px; min-width: 24px; font-size: 0.6875rem; }
      .activity-arrow { display: none; }
    }
  `]
})
export class StaffDashboardComponent implements OnInit {
  private mesaService = inject(MesaService);
  private productoService = inject(ProductoService);
  private clienteService = inject(ClienteService);
  private comandaService = inject(ComandaService);
  private sesionMesaService = inject(SesionMesaService);
  private facturaService = inject(FacturaService);
  private reservasService = inject(MockReservasService);

  mesasCount = signal(0);
  reservasCount = signal(0);
  productosCount = signal(0);
  clientesCount = signal(0);
  comandasCount = signal(0);
  sesionesActivasCount = signal(0);
  facturasCount = signal(0);
  isLoading = signal(true);
  activityItems = signal<ActivityItem[]>([]);

  ngOnInit(): void {
    this.mesaService.getAll().subscribe({ next: (d) => this.mesasCount.set(d.length), error: () => {} });
    this.productoService.getAll().subscribe({ next: (d) => this.productosCount.set(d.length), error: () => {} });
    this.clienteService.getAll().subscribe({ next: (d) => this.clientesCount.set(d.length), error: () => {} });
    this.comandaService.getAll().subscribe({ next: (d) => { this.comandasCount.set(d.length); this.buildComandaActivity(d); }, error: () => {} });
    this.sesionMesaService.getAll().subscribe({ next: (d) => { this.sesionesActivasCount.set(d.filter(s => s.estado === 'ACTIVA').length); this.buildSesionActivity(d); }, error: () => {} });
    this.reservasService.getAll().subscribe({ next: (d) => { this.reservasCount.set(d.filter(r => r.estado === 'CONFIRMADA' || r.estado === 'PENDIENTE').length); this.buildReservaActivity(d); }, error: () => {} });
    this.facturaService.getAll().subscribe({
      next: (d) => { this.facturasCount.set(d.length); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); }
    });
  }

  private buildComandaActivity(comandas: Comanda[]): void {
    const pendientes = comandas.filter(c => c.estado === 'PENDIENTE');
    const preparacion = comandas.filter(c => c.estado === 'PREPARACION');
    const items: ActivityItem[] = [];
    if (pendientes.length > 0) {
      items.push({ icon: 'fa-clock', color: 'var(--warning, #FACC15)', title: `${pendientes.length} comanda${pendientes.length > 1 ? 's' : ''} pendiente${pendientes.length > 1 ? 's' : ''}`, detail: 'Esperando confirmacion', link: '/staff/comandas' });
    }
    if (preparacion.length > 0) {
      items.push({ icon: 'fa-fire-burner', color: 'var(--primary-coral, #FF7F50)', title: `${preparacion.length} comanda${preparacion.length > 1 ? 's' : ''} en preparacion`, detail: 'En cocina ahora', link: '/staff/comandas' });
    }
    this.activityItems.update(current => [...current, ...items]);
  }

  private buildReservaActivity(reservas: ReservasMesa[]): void {
    const pendientes = reservas.filter(r => r.estado === 'PENDIENTE');
    const hoy = new Date().toISOString().split('T')[0];
    const confirmadaHoy = reservas.filter(r => r.estado === 'CONFIRMADA' && r.fechaReserva === hoy);
    const items: ActivityItem[] = [];
    if (pendientes.length > 0) {
      items.push({ icon: 'fa-calendar-plus', color: 'var(--neon-purple, #A78BFA)', title: `${pendientes.length} reserva${pendientes.length > 1 ? 's' : ''} por confirmar`, detail: 'Solicitudes pendientes de aprobacion', link: '/staff/reservas' });
    }
    if (confirmadaHoy.length > 0) {
      items.push({ icon: 'fa-calendar-check', color: 'var(--success, #22C55E)', title: `${confirmadaHoy.length} reserva${confirmadaHoy.length > 1 ? 's' : ''} hoy`, detail: 'Confirmadas para hoy', link: '/staff/reservas' });
    }
    this.activityItems.update(current => [...current, ...items]);
  }

  private buildSesionActivity(sesiones: SesionMesa[]): void {
    const stale = sesiones.filter(s => {
      if (s.estado !== 'ACTIVA') return false;
      return Date.now() - new Date(s.fechaHoraApertura).getTime() > 24 * 60 * 60 * 1000;
    });
    if (stale.length > 0) {
      this.activityItems.update(current => [...current, { icon: 'fa-triangle-exclamation', color: 'var(--danger, #EF4444)', title: `${stale.length} sesion${stale.length > 1 ? 'es' : ''} antigua${stale.length > 1 ? 's' : ''}`, detail: 'Abiertas hace mas de 24 horas', link: '/staff/sesiones-mesa' }]);
    }
  }
}
