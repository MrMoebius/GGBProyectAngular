import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { MockReservasService } from '../../../core/services/mock-reservas.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReservasMesa } from '../../../core/models/reservas-mesa.interface';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [],
  template: `
    <div class="reservations-page">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">
          <i class="fa-solid fa-calendar-check"></i>
          Mis Reservas
        </h1>
        <p class="page-subtitle">Gestiona tus reservas en Giber Games Bar</p>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          class="tab"
          [class.tab-active]="activeTab() === 'CONFIRMADA'"
          (click)="activeTab.set('CONFIRMADA')"
        >
          <i class="fa-solid fa-circle-check"></i>
          Activas
          @if (activeReservations().length > 0) {
            <span class="tab-count">{{ activeReservations().length }}</span>
          }
        </button>
        <button
          class="tab"
          [class.tab-active]="activeTab() === 'COMPLETADA'"
          (click)="activeTab.set('COMPLETADA')"
        >
          <i class="fa-solid fa-circle-check"></i>
          Pasadas
          @if (completedReservations().length > 0) {
            <span class="tab-count">{{ completedReservations().length }}</span>
          }
        </button>
        <button
          class="tab"
          [class.tab-active]="activeTab() === 'CANCELADA'"
          (click)="activeTab.set('CANCELADA')"
        >
          <i class="fa-solid fa-circle-xmark"></i>
          Canceladas
          @if (cancelledReservations().length > 0) {
            <span class="tab-count">{{ cancelledReservations().length }}</span>
          }
        </button>
      </div>

      <!-- Content -->
      @switch (activeTab()) {
        @case ('CONFIRMADA') {
          @if (activeReservations().length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><i class="fa-solid fa-calendar"></i></div>
              <h2 class="empty-title">Sin reservas activas</h2>
              <p class="empty-text">No tienes ninguna reserva confirmada en este momento.</p>
            </div>
          } @else {
            <div class="reservation-list">
              @for (res of activeReservations(); track res.id) {
                <div class="reservation-card">
                  <div class="res-left">
                    <div class="res-date-badge">
                      <span class="res-day">{{ getDay(res.fechaReserva) }}</span>
                      <span class="res-month">{{ getMonth(res.fechaReserva) }}</span>
                    </div>
                  </div>
                  <div class="res-center">
                    <div class="res-time">
                      <i class="fa-solid fa-clock"></i>
                      {{ res.horaInicio }}@if (res.horaFin) { - {{ res.horaFin }} }
                    </div>
                    <div class="res-details">
                      <span class="res-detail-item">
                        <i class="fa-solid fa-chair"></i> Mesa {{ res.idMesa }}
                      </span>
                      <span class="res-detail-item">
                        <i class="fa-solid fa-users"></i> {{ res.numPersonas }} personas
                      </span>
                    </div>
                    @if (res.notas) {
                      <div class="res-notes">
                        <i class="fa-solid fa-sticky-note"></i> {{ res.notas }}
                      </div>
                    }
                  </div>
                  <div class="res-right">
                    <span class="status-badge badge-confirmed">Confirmada</span>
                    <button class="btn-cancel" (click)="cancelReservation(res.id)">
                      <i class="fa-solid fa-xmark"></i> Cancelar
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        }
        @case ('COMPLETADA') {
          @if (completedReservations().length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><i class="fa-solid fa-clock-rotate-left"></i></div>
              <h2 class="empty-title">Sin reservas pasadas</h2>
              <p class="empty-text">Cuando completes una reserva, aparecera aqui.</p>
            </div>
          } @else {
            <div class="reservation-list">
              @for (res of completedReservations(); track res.id) {
                <div class="reservation-card card-muted">
                  <div class="res-left">
                    <div class="res-date-badge muted">
                      <span class="res-day">{{ getDay(res.fechaReserva) }}</span>
                      <span class="res-month">{{ getMonth(res.fechaReserva) }}</span>
                    </div>
                  </div>
                  <div class="res-center">
                    <div class="res-time">
                      <i class="fa-solid fa-clock"></i>
                      {{ res.horaInicio }}@if (res.horaFin) { - {{ res.horaFin }} }
                    </div>
                    <div class="res-details">
                      <span class="res-detail-item">
                        <i class="fa-solid fa-chair"></i> Mesa {{ res.idMesa }}
                      </span>
                      <span class="res-detail-item">
                        <i class="fa-solid fa-users"></i> {{ res.numPersonas }} personas
                      </span>
                    </div>
                    @if (res.notas) {
                      <div class="res-notes">
                        <i class="fa-solid fa-sticky-note"></i> {{ res.notas }}
                      </div>
                    }
                  </div>
                  <div class="res-right">
                    <span class="status-badge badge-completed">Completada</span>
                  </div>
                </div>
              }
            </div>
          }
        }
        @case ('CANCELADA') {
          @if (cancelledReservations().length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><i class="fa-solid fa-ban"></i></div>
              <h2 class="empty-title">Sin cancelaciones</h2>
              <p class="empty-text">No tienes reservas canceladas.</p>
            </div>
          } @else {
            <div class="reservation-list">
              @for (res of cancelledReservations(); track res.id) {
                <div class="reservation-card card-muted">
                  <div class="res-left">
                    <div class="res-date-badge muted">
                      <span class="res-day">{{ getDay(res.fechaReserva) }}</span>
                      <span class="res-month">{{ getMonth(res.fechaReserva) }}</span>
                    </div>
                  </div>
                  <div class="res-center">
                    <div class="res-time">
                      <i class="fa-solid fa-clock"></i>
                      {{ res.horaInicio }}@if (res.horaFin) { - {{ res.horaFin }} }
                    </div>
                    <div class="res-details">
                      <span class="res-detail-item">
                        <i class="fa-solid fa-chair"></i> Mesa {{ res.idMesa }}
                      </span>
                      <span class="res-detail-item">
                        <i class="fa-solid fa-users"></i> {{ res.numPersonas }} personas
                      </span>
                    </div>
                  </div>
                  <div class="res-right">
                    <span class="status-badge badge-cancelled">Cancelada</span>
                  </div>
                </div>
              }
            </div>
          }
        }
      }
    </div>
  `,
  styles: [`
    .reservations-page {
      max-width: 900px;
      margin: 0 auto;
    }

    /* ===== Header ===== */
    .page-header {
      margin-bottom: 1.5rem;
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
      color: var(--neon-cyan, #00FFD1);
    }

    .page-subtitle {
      font-size: 0.85rem;
      color: var(--text-muted, #94a3b8);
      margin: 0.3rem 0 0;
    }

    /* ===== Tabs ===== */
    .tabs {
      display: flex;
      gap: 0.25rem;
      padding: 0.25rem;
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--card-border, rgba(255,255,255,0.08));
      border-radius: var(--radius-lg, 16px);
      margin-bottom: 1.5rem;
    }

    .tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.7rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted, #94a3b8);
      background: none;
      border: none;
      border-radius: var(--radius-md, 8px);
      cursor: pointer;
      transition: color 0.2s, background-color 0.2s;
    }

    .tab:hover {
      color: var(--text-white, #fff);
      background-color: rgba(255, 255, 255, 0.04);
    }

    .tab-active {
      color: var(--neon-cyan, #00FFD1);
      background-color: rgba(0, 255, 209, 0.08);
    }

    .tab-active:hover {
      color: var(--neon-cyan, #00FFD1);
      background-color: rgba(0, 255, 209, 0.1);
    }

    .tab i { font-size: 0.8rem; }

    .tab-count {
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 9999px;
      background-color: var(--neon-pink, #FF6B9D);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* ===== Reservation list ===== */
    .reservation-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .reservation-card {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      padding: 1.25rem;
      background-color: var(--card-bg, #1E293B);
      border: 1px solid var(--card-border, rgba(255,255,255,0.08));
      border-radius: var(--radius-lg, 16px);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .reservation-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .card-muted {
      opacity: 0.7;
    }

    .card-muted:hover {
      opacity: 0.85;
    }

    /* Date badge */
    .res-date-badge {
      width: 56px;
      height: 64px;
      border-radius: var(--radius-md, 8px);
      background: linear-gradient(135deg, rgba(0, 255, 209, 0.12), rgba(0, 255, 209, 0.06));
      border: 1px solid rgba(0, 255, 209, 0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .res-date-badge.muted {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--card-border, rgba(255,255,255,0.08));
    }

    .res-day {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-white, #fff);
      line-height: 1;
    }

    .res-month {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--neon-cyan, #00FFD1);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .muted .res-month {
      color: var(--text-muted, #94a3b8);
    }

    /* Center info */
    .res-center {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      min-width: 0;
    }

    .res-time {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-white, #fff);
    }

    .res-time i {
      font-size: 0.8rem;
      color: var(--neon-cyan, #00FFD1);
    }

    .res-details {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .res-detail-item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: var(--text-muted, #94a3b8);
    }

    .res-detail-item i {
      font-size: 0.7rem;
    }

    .res-notes {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      color: var(--text-muted, #94a3b8);
      font-style: italic;
    }

    .res-notes i { font-size: 0.65rem; }

    /* Right actions */
    .res-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.6rem;
      flex-shrink: 0;
    }

    /* Status badges */
    .status-badge {
      padding: 0.25rem 0.7rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .badge-confirmed {
      background-color: var(--success-bg, rgba(34,197,94,0.12));
      color: var(--success, #22C55E);
      border: 1px solid var(--success, #22C55E);
    }

    .badge-completed {
      background-color: rgba(59, 130, 246, 0.12);
      color: #60A5FA;
      border: 1px solid #60A5FA;
    }

    .badge-cancelled {
      background-color: var(--danger-bg, rgba(239,68,68,0.12));
      color: var(--danger, #EF4444);
      border: 1px solid var(--danger, #EF4444);
    }

    /* Cancel button */
    .btn-cancel {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.4rem 0.85rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--danger, #EF4444);
      background: none;
      border: 1px solid var(--danger, #EF4444);
      border-radius: var(--radius-sm, 6px);
      cursor: pointer;
      transition: background-color 0.2s, color 0.2s;
    }

    .btn-cancel:hover {
      background-color: var(--danger, #EF4444);
      color: #fff;
    }

    .btn-cancel i { font-size: 0.65rem; }

    /* ===== Empty state ===== */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 30vh;
      text-align: center;
      padding: 2rem;
    }

    .empty-icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background-color: rgba(0, 255, 209, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .empty-icon i {
      font-size: 1.75rem;
      color: rgba(0, 255, 209, 0.25);
    }

    .empty-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-white, #fff);
      margin: 0 0 0.35rem;
    }

    .empty-text {
      font-size: 0.85rem;
      color: var(--text-muted, #94a3b8);
      margin: 0;
    }

    /* ===== Responsive ===== */
    @media (max-width: 640px) {
      .reservation-card {
        flex-direction: column;
        gap: 0.75rem;
      }

      .res-left {
        align-self: flex-start;
      }

      .res-right {
        flex-direction: row;
        align-items: center;
        width: 100%;
        justify-content: space-between;
      }

      .tabs {
        flex-direction: column;
        gap: 0.25rem;
      }

      .page-title {
        font-size: 1.25rem;
      }
    }
  `]
})
export class MyReservationsComponent implements OnInit {
  private reservasService = inject(MockReservasService);
  private toastService = inject(ToastService);

  allReservations = signal<ReservasMesa[]>([]);
  activeTab = signal<'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA'>('CONFIRMADA');

  activeReservations = computed(() =>
    this.allReservations().filter(r => r.estado === 'CONFIRMADA')
  );

  completedReservations = computed(() =>
    this.allReservations().filter(r => r.estado === 'COMPLETADA')
  );

  cancelledReservations = computed(() =>
    this.allReservations().filter(r => r.estado === 'CANCELADA')
  );

  ngOnInit(): void {
    this.loadReservations();
  }

  private loadReservations(): void {
    this.reservasService.getByCliente(1).subscribe(reservas => {
      this.allReservations.set(reservas);
    });
  }

  cancelReservation(id: number): void {
    this.reservasService.cancel(id).subscribe(() => {
      this.toastService.success('Reserva cancelada correctamente');
      this.loadReservations();
    });
  }

  getDay(dateStr: string): string {
    return new Date(dateStr).getDate().toString();
  }

  getMonth(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-ES', { month: 'short' });
  }
}
