import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReservasMesaService } from '../../../core/services/reservas-mesa.service';
import { AuthService } from '../../../core/services/auth.service';
import { JuegoService } from '../../../core/services/juego.service';
import { MesaService } from '../../../core/services/mesa.service';
import { ToastService } from '../../../core/services/toast.service';
import { JuegoExtended } from '../../../core/models/juego-extended.interface';
import { BeerLoaderComponent } from '../../../shared/components/beer-loader/beer-loader.component';

interface ContactInfo {
  nombre: string;
  telefono: string;
  email: string;
}

@Component({
  selector: 'app-reservations-page',
  standalone: true,
  imports: [FormsModule, BeerLoaderComponent],
  template: `
    <app-beer-loader [isLoading]="isLoading()" />
    <div class="reservations-wizard">

      <!-- Header -->
      <div class="wizard-header">
        <h1 class="wizard-title">
          <i class="fa-solid fa-chair"></i>
          Reservar Mesa
        </h1>
        <p class="wizard-subtitle">Giber Games Bar &mdash; Av. Alcalde Jose Aranda 57, Alcorcon</p>
      </div>

      <!-- Progress Bar -->
      @if (!reservationConfirmed()) {
        <div class="progress-bar">
          @for (step of steps; track step.num) {
            <div
              class="progress-step"
              [class.active]="currentStep() === step.num"
              [class.completed]="currentStep() > step.num">
              <div class="step-circle">
                @if (currentStep() > step.num) {
                  <i class="fa-solid fa-check"></i>
                } @else {
                  <span>{{ step.num }}</span>
                }
              </div>
              <span class="step-label">{{ step.label }}</span>
            </div>
            @if (step.num < 3) {
              <div class="step-connector" [class.completed]="currentStep() > step.num"></div>
            }
          }
        </div>
      }

      <!-- Step Container -->
      <div class="step-container">

        <!-- STEP 1: Date, Time & Party Size -->
        @if (currentStep() === 1) {
          <div class="step-content step-animate">
            <h2 class="step-title">
              <i class="fa-solid fa-calendar-days"></i>
              Fecha, Hora y Personas
            </h2>

            <!-- Date Picker -->
            <div class="form-group">
              <label class="form-label" for="reserva-date">
                <i class="fa-solid fa-calendar"></i>
                Fecha de reserva
              </label>
              <input
                type="date"
                id="reserva-date"
                class="form-input"
                [min]="todayStr"
                [value]="selectedDate()"
                (input)="onDateChange($event)" />
            </div>

            <!-- Time Slots -->
            <div class="form-group">
              <label class="form-label">
                <i class="fa-solid fa-clock"></i>
                Hora
              </label>
              @if (isDayClosed()) {
                <div class="closed-banner">
                  <i class="fa-solid fa-door-closed"></i>
                  <span>Los lunes estamos cerrados. Selecciona otro dia.</span>
                </div>
              } @else if (availableTimeSlots().length === 0 && selectedDate()) {
                <div class="closed-banner">
                  <i class="fa-solid fa-circle-info"></i>
                  <span>Selecciona una fecha para ver los horarios disponibles.</span>
                </div>
              } @else {
                <div class="time-slots">
                  @for (slot of availableTimeSlots(); track slot) {
                    <button
                      class="time-pill"
                      [class.selected]="selectedTime() === slot"
                      (click)="selectedTime.set(slot)">
                      {{ slot }}
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Party Size -->
            <div class="form-group">
              <label class="form-label">
                <i class="fa-solid fa-users"></i>
                Numero de personas
              </label>
              <div class="party-size-selector">
                <button
                  class="size-btn"
                  [disabled]="partySize() <= 1"
                  (click)="decrementParty()">
                  <i class="fa-solid fa-minus"></i>
                </button>
                <span class="size-display">{{ partySize() }}</span>
                <button
                  class="size-btn"
                  [disabled]="partySize() >= 12"
                  (click)="incrementParty()">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>

            <!-- Next -->
            <div class="step-actions">
              <button
                class="btn-primary"
                [disabled]="!step1Valid() || checkingAvailability()"
                (click)="checkAvailabilityAndProceed()">
                @if (checkingAvailability()) {
                  <i class="fa-solid fa-spinner fa-spin"></i>
                  Comprobando disponibilidad...
                } @else {
                  Siguiente
                  <i class="fa-solid fa-arrow-right"></i>
                }
              </button>
            </div>
          </div>
        }

        <!-- STEP 2: Optional Game -->
        @if (currentStep() === 2) {
          <div class="step-content step-animate">
            <h2 class="step-title">
              <i class="fa-solid fa-dice"></i>
              Reservar Juego (Opcional)
            </h2>

            <!-- Availability banner -->
            @if (availabilityChecked()) {
              @if (hasAvailability()) {
                <div class="availability-banner available">
                  <i class="fa-solid fa-circle-check"></i>
                  <div>
                    <strong>Hay disponibilidad!</strong>
                    <p>Tenemos {{ availableMesaCount() }} {{ availableMesaCount() === 1 ? 'mesa disponible' : 'mesas disponibles' }} para {{ partySize() }} personas.</p>
                  </div>
                </div>
              } @else {
                <div class="availability-banner pending">
                  <i class="fa-solid fa-hat-wizard"></i>
                  <div>
                    <strong>Disponibilidad pendiente</strong>
                    <p>No hay mesas libres en este momento para {{ partySize() }} personas. No te preocupes: tu reserva quedara en estado pendiente y cuando el Dungeon Master confirme la disponibilidad se te informara.</p>
                  </div>
                </div>
              }
            }

            <!-- Toggle -->
            <div class="game-toggle">
              <label class="toggle-label">
                <span class="toggle-text">Quieres reservar un juego para tu visita?</span>
                <button
                  class="toggle-btn"
                  [class.active]="wantGame()"
                  (click)="wantGame.set(!wantGame())">
                  <span class="toggle-knob"></span>
                </button>
              </label>
            </div>

            @if (wantGame()) {
              <!-- Search -->
              <div class="form-group">
                <label class="form-label" for="game-search">
                  <i class="fa-solid fa-magnifying-glass"></i>
                  Buscar juego
                </label>
                <input
                  type="text"
                  id="game-search"
                  class="form-input"
                  placeholder="Nombre, genero o etiqueta..."
                  [value]="gameSearchTerm()"
                  (input)="onGameSearch($event)" />
              </div>

              <!-- Game Results -->
              <div class="games-grid">
                @for (game of filteredGames(); track game.id) {
                  <div
                    class="game-card"
                    [class.selected]="selectedGame()?.id === game.id"
                    (click)="onGameSelected(game)">
                    <div class="game-card-header">
                      <h4 class="game-name">{{ game.nombre }}</h4>
                      @if (game.rating) {
                        <div class="game-rating">
                          <i class="fa-solid fa-star"></i>
                          {{ game.rating }}
                        </div>
                      }
                    </div>
                    <div class="game-card-meta">
                      <span class="game-meta-item">
                        <i class="fa-solid fa-users"></i>
                        {{ game.minJugadores }}-{{ game.maxJugadores }}
                      </span>
                      @if (game.duracionMediaMin) {
                        <span class="game-meta-item">
                          <i class="fa-solid fa-hourglass-half"></i>
                          {{ game.duracionMediaMin }} min
                        </span>
                      }
                      <span class="game-meta-item">
                        <i class="fa-solid fa-layer-group"></i>
                        {{ game.complejidad }}
                      </span>
                    </div>
                    @if (selectedGame()?.id === game.id) {
                      <div class="game-selected-badge">
                        <i class="fa-solid fa-circle-check"></i>
                        Seleccionado
                      </div>
                    }
                  </div>
                } @empty {
                  <div class="games-empty">
                    <i class="fa-solid fa-dice"></i>
                    <p>No se encontraron juegos</p>
                  </div>
                }
              </div>
            }

            <!-- Navigation -->
            <div class="step-actions">
              <button class="btn-secondary" (click)="goToStep(1)">
                <i class="fa-solid fa-arrow-left"></i>
                Anterior
              </button>
              <button class="btn-primary" (click)="goToStep(3)">
                Siguiente
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        }

        <!-- STEP 3: Confirmation -->
        @if (currentStep() === 3 && !reservationConfirmed()) {
          <div class="step-content step-animate">
            <h2 class="step-title">
              <i class="fa-solid fa-clipboard-check"></i>
              Confirmar Reserva
            </h2>

            <!-- Summary Card -->
            <div class="summary-card">
              <h3 class="summary-heading">
                <i class="fa-solid fa-receipt"></i>
                Resumen de tu reserva
              </h3>
              <div class="summary-rows">
                <div class="summary-row">
                  <span class="summary-label">
                    <i class="fa-solid fa-calendar"></i>
                    Fecha
                  </span>
                  <span class="summary-value">{{ selectedDate() }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">
                    <i class="fa-solid fa-clock"></i>
                    Hora
                  </span>
                  <span class="summary-value">{{ selectedTime() }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">
                    <i class="fa-solid fa-users"></i>
                    Personas
                  </span>
                  <span class="summary-value">{{ partySize() }}</span>
                </div>
                @if (selectedGame()) {
                  <div class="summary-row">
                    <span class="summary-label">
                      <i class="fa-solid fa-dice"></i>
                      Juego
                    </span>
                    <span class="summary-value">{{ selectedGame()!.nombre }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Contact Form -->
            <div class="contact-form">
              <h3 class="form-section-title">
                <i class="fa-solid fa-address-card"></i>
                Datos de contacto
              </h3>

              <div class="form-group">
                <label class="form-label" for="contact-name">
                  <i class="fa-solid fa-user"></i>
                  Nombre completo *
                </label>
                <input
                  type="text"
                  id="contact-name"
                  class="form-input"
                  placeholder="Tu nombre"
                  [class.invalid]="contactSubmitted() && !contactInfo().nombre.trim()"
                  [value]="contactInfo().nombre"
                  (input)="onContactChange('nombre', $event)" />
                @if (contactSubmitted() && !contactInfo().nombre.trim()) {
                  <span class="field-error">El nombre es obligatorio</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label" for="contact-phone">
                  <i class="fa-solid fa-phone"></i>
                  Telefono *
                </label>
                <input
                  type="tel"
                  id="contact-phone"
                  class="form-input"
                  placeholder="Ej: 612345678"
                  [class.invalid]="contactSubmitted() && !isPhoneValid()"
                  [value]="contactInfo().telefono"
                  (input)="onContactChange('telefono', $event)" />
                @if (contactSubmitted() && !isPhoneValid()) {
                  <span class="field-error">Introduce un telefono valido (9 digitos)</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label" for="contact-email">
                  <i class="fa-solid fa-envelope"></i>
                  Email *
                </label>
                <input
                  type="email"
                  id="contact-email"
                  class="form-input"
                  placeholder="tu@email.com"
                  [class.invalid]="contactSubmitted() && !isEmailValid()"
                  [value]="contactInfo().email"
                  (input)="onContactChange('email', $event)" />
                @if (contactSubmitted() && !isEmailValid()) {
                  <span class="field-error">Introduce un email valido</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label" for="contact-notes">
                  <i class="fa-solid fa-comment"></i>
                  Notas (opcional)
                </label>
                <textarea
                  id="contact-notes"
                  class="form-input form-textarea"
                  placeholder="Alergias, celebraciones, peticiones especiales..."
                  rows="3"
                  [value]="reservationNotes()"
                  (input)="onNotesChange($event)">
                </textarea>
              </div>
            </div>

            <!-- Navigation -->
            <div class="step-actions">
              <button class="btn-secondary" (click)="goToStep(2)">
                <i class="fa-solid fa-arrow-left"></i>
                Anterior
              </button>
              <button
                class="btn-confirm"
                [disabled]="submitting()"
                (click)="confirmReservation()">
                @if (submitting()) {
                  <i class="fa-solid fa-spinner fa-spin"></i>
                  Procesando...
                } @else {
                  <i class="fa-solid fa-check-circle"></i>
                  Confirmar Reserva
                }
              </button>
            </div>
          </div>
        }

        <!-- SUCCESS STATE -->
        @if (reservationConfirmed()) {
          <div class="step-content step-animate">
            <div class="success-container">
              <div class="success-icon-wrap">
                <i class="fa-solid fa-circle-check"></i>
              </div>
              <h2 class="success-title">Reserva Confirmada!</h2>
              @if (hasAvailability()) {
                <p class="success-subtitle">Tu mesa te espera en Giber Games Bar</p>
              } @else {
                <p class="success-subtitle">Tu reserva esta pendiente. El Dungeon Master te avisara cuando confirme la disponibilidad.</p>
              }

              <div class="confirmation-card">
                <div class="confirmation-id">
                  <span class="confirmation-label">ID de Reserva</span>
                  <span class="confirmation-value">#{{ confirmedReservationId() }}</span>
                </div>
                <div class="confirmation-details">
                  <div class="confirmation-row">
                    <i class="fa-solid fa-calendar"></i>
                    <span>{{ selectedDate() }}</span>
                  </div>
                  <div class="confirmation-row">
                    <i class="fa-solid fa-clock"></i>
                    <span>{{ selectedTime() }}</span>
                  </div>
                  <div class="confirmation-row">
                    <i class="fa-solid fa-users"></i>
                    <span>{{ partySize() }} {{ partySize() === 1 ? 'persona' : 'personas' }}</span>
                  </div>
                  @if (selectedGame()) {
                    <div class="confirmation-row">
                      <i class="fa-solid fa-dice"></i>
                      <span>{{ selectedGame()!.nombre }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- QR Placeholder -->
              <div class="qr-placeholder">
                <i class="fa-solid fa-qrcode"></i>
                <span>QR de tu reserva</span>
              </div>

              <a class="btn-home" href="/">
                <i class="fa-solid fa-house"></i>
                Volver al inicio
              </a>
            </div>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    /* === Host === */
    :host {
      display: block;
    }

    /* === Wizard Container === */
    .reservations-wizard {
      max-width: 860px;
      margin: 0 auto;
      padding: 2rem 1rem 4rem;
    }

    /* === Header === */
    .wizard-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .wizard-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .wizard-title i {
      color: var(--primary-coral);
    }

    .wizard-subtitle {
      color: var(--text-muted);
      font-size: 1rem;
      margin-top: 0.25rem;
    }

    /* === Progress Bar === */
    .progress-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: 2.5rem;
      padding: 0 1rem;
    }

    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      position: relative;
      z-index: 1;
    }

    .step-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--card-bg);
      border: 2px solid var(--card-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      color: var(--text-muted);
      transition: all 0.3s ease;
    }

    .progress-step.active .step-circle {
      border-color: var(--primary-coral);
      background: var(--primary-coral);
      color: #fff;
      box-shadow: 0 0 16px rgba(255, 107, 107, 0.4);
    }

    .progress-step.completed .step-circle {
      border-color: var(--neon-cyan, #00ffd1);
      background: var(--neon-cyan, #00ffd1);
      color: #0d1117;
    }

    .step-label {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-muted);
      text-align: center;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .progress-step.active .step-label {
      color: var(--primary-coral);
    }

    .progress-step.completed .step-label {
      color: var(--neon-cyan, #00ffd1);
    }

    .step-connector {
      flex: 1;
      height: 2px;
      background: var(--card-border);
      min-width: 32px;
      max-width: 80px;
      margin: 0 0.25rem;
      margin-bottom: 1.75rem;
      transition: background 0.3s ease;
    }

    .step-connector.completed {
      background: var(--neon-cyan, #00ffd1);
    }

    /* === Step Container === */
    .step-container {
      position: relative;
    }

    .step-content {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md, 0.75rem);
      padding: 2rem;
    }

    .step-animate {
      animation: stepFadeIn 0.35s ease-out;
    }

    @keyframes stepFadeIn {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* === Step Title === */
    .step-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--card-border);
    }

    .step-title i {
      color: var(--primary-coral);
    }

    .step-hint {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: rgba(255, 107, 107, 0.06);
      border-radius: var(--radius-md, 0.5rem);
      border: 1px solid rgba(255, 107, 107, 0.15);
    }

    .step-hint i {
      color: var(--primary-coral);
      flex-shrink: 0;
    }

    /* === Form Elements === */
    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }

    .form-label i {
      color: var(--primary-coral);
      font-size: 0.8rem;
    }

    .form-input {
      width: 100%;
      padding: 0.7rem 1rem;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: var(--radius-md, 0.5rem);
      color: var(--text-main);
      font-size: 0.95rem;
      font-family: inherit;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--input-focus, var(--primary-coral));
      box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.15);
    }

    .form-input.invalid {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .field-error {
      display: block;
      font-size: 0.78rem;
      color: #ef4444;
      margin-top: 0.3rem;
    }

    .form-section-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }

    .form-section-title i {
      color: var(--primary-coral);
    }

    /* === Date input dark mode fix === */
    :host-context([data-theme="dark"]) input[type="date"]::-webkit-calendar-picker-indicator {
      filter: invert(1) brightness(0.8);
      cursor: pointer;
    }

    /* === Closed banner === */
    .closed-banner {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.85rem 1.1rem;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: var(--radius-md, 0.5rem);
      font-size: 0.88rem;
      color: var(--text-main);
    }

    .closed-banner i {
      color: #ef4444;
      font-size: 1rem;
      flex-shrink: 0;
    }

    /* === Time Slots === */
    .time-slots {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .time-pill {
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      border: 1px solid var(--input-border);
      background: var(--input-bg);
      color: var(--text-main);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .time-pill:hover {
      border-color: var(--primary-coral);
      background: rgba(255, 107, 107, 0.08);
    }

    .time-pill.selected {
      background: var(--primary-coral);
      border-color: var(--primary-coral);
      color: #fff;
      box-shadow: 0 0 12px rgba(255, 107, 107, 0.35);
    }

    /* === Party Size Selector === */
    .party-size-selector {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .size-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid var(--card-border);
      background: var(--input-bg);
      color: var(--text-main);
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .size-btn:hover:not(:disabled) {
      border-color: var(--primary-coral);
      background: rgba(255, 107, 107, 0.1);
      color: var(--primary-coral);
    }

    .size-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .size-display {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-main);
      min-width: 48px;
      text-align: center;
    }

    /* === Selected Info Card === */
    .selected-info-card {
      margin-top: 1.25rem;
      padding: 1rem 1.25rem;
      background: rgba(0, 255, 209, 0.05);
      border: 1px solid rgba(0, 255, 209, 0.25);
      border-radius: var(--radius-md, 0.5rem);
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .info-card-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md, 0.5rem);
      background: rgba(0, 255, 209, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--neon-cyan, #00ffd1);
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .info-card-details h4 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.25rem;
    }

    .info-card-details p {
      font-size: 0.85rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin-top: 0.15rem;
    }

    .info-card-details p i {
      color: var(--neon-cyan, #00ffd1);
      font-size: 0.75rem;
    }

    .capacity-warning {
      width: 100%;
      padding: 0.6rem 0.8rem;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: var(--radius-md, 0.5rem);
      font-size: 0.82rem;
      color: #f59e0b;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    /* === Game Toggle === */
    .game-toggle {
      margin-bottom: 1.5rem;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      cursor: pointer;
      padding: 1rem 1.25rem;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: var(--radius-md, 0.5rem);
      transition: border-color 0.2s ease;
    }

    .toggle-label:hover {
      border-color: var(--primary-coral);
    }

    .toggle-text {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .toggle-btn {
      position: relative;
      width: 52px;
      height: 28px;
      border-radius: 14px;
      border: none;
      background: var(--card-border);
      cursor: pointer;
      transition: background 0.3s ease;
      flex-shrink: 0;
      padding: 0;
    }

    .toggle-btn.active {
      background: var(--primary-coral);
    }

    .toggle-knob {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.3s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .toggle-btn.active .toggle-knob {
      transform: translateX(24px);
    }

    /* === Games Grid === */
    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      max-height: 420px;
      overflow-y: auto;
      padding-right: 0.25rem;
    }

    .games-grid::-webkit-scrollbar {
      width: 6px;
    }

    .games-grid::-webkit-scrollbar-thumb {
      background: var(--card-border);
      border-radius: 3px;
    }

    .game-card {
      padding: 1rem;
      background: var(--input-bg);
      border: 2px solid var(--card-border);
      border-radius: var(--radius-md, 0.5rem);
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .game-card:hover {
      border-color: var(--primary-coral);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.15);
    }

    .game-card.selected {
      border-color: var(--neon-cyan, #00ffd1);
      background: rgba(0, 255, 209, 0.05);
      box-shadow: 0 0 16px rgba(0, 255, 209, 0.2);
    }

    .game-card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.6rem;
    }

    .game-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1.2;
    }

    .game-rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: #f59e0b;
      flex-shrink: 0;
    }

    .game-rating i {
      font-size: 0.7rem;
    }

    .game-card-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
    }

    .game-meta-item {
      font-size: 0.78rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .game-meta-item i {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    .game-selected-badge {
      margin-top: 0.6rem;
      padding: 0.3rem 0.6rem;
      background: rgba(0, 255, 209, 0.12);
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--neon-cyan, #00ffd1);
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    .games-empty {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      color: var(--text-muted);
      gap: 0.5rem;
    }

    .games-empty i {
      font-size: 2rem;
      opacity: 0.3;
    }

    /* === Summary Card === */
    .summary-card {
      background: var(--input-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md, 0.5rem);
      padding: 1.25rem;
      margin-bottom: 1.75rem;
    }

    .summary-heading {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--card-border);
    }

    .summary-heading i {
      color: var(--primary-coral);
    }

    .summary-rows {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .summary-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.4rem 0;
    }

    .summary-label {
      font-size: 0.88rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .summary-label i {
      color: var(--primary-coral);
      font-size: 0.8rem;
      width: 18px;
      text-align: center;
    }

    .summary-value {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .contact-form {
      margin-bottom: 1.5rem;
    }

    /* === Step Actions === */
    .step-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--card-border);
    }

    .btn-primary,
    .btn-secondary,
    .btn-confirm {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.7rem 1.5rem;
      border-radius: var(--radius-md, 0.5rem);
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      font-family: inherit;
    }

    .btn-primary {
      background: var(--primary-coral);
      color: #fff;
    }

    .btn-primary:hover:not(:disabled) {
      box-shadow: 0 0 16px rgba(255, 107, 107, 0.4);
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--card-border);
    }

    .btn-secondary:hover {
      border-color: var(--text-muted);
      color: var(--text-main);
    }

    .btn-confirm {
      background: linear-gradient(135deg, var(--neon-cyan, #00ffd1) 0%, #00ccaa 100%);
      color: #0d1117;
    }

    .btn-confirm:hover:not(:disabled) {
      box-shadow: 0 0 20px rgba(0, 255, 209, 0.4);
      transform: translateY(-1px);
    }

    .btn-confirm:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* === Success State === */
    .success-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1rem 0;
    }

    .success-icon-wrap {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(0, 255, 209, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
      animation: successPulse 1.5s ease-in-out infinite;
    }

    .success-icon-wrap i {
      font-size: 2.5rem;
      color: var(--neon-cyan, #00ffd1);
    }

    @keyframes successPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(0, 255, 209, 0.25); }
      50% { box-shadow: 0 0 0 16px rgba(0, 255, 209, 0); }
    }

    .success-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 0.25rem;
    }

    .success-subtitle {
      font-size: 1rem;
      color: var(--text-muted);
      margin-bottom: 2rem;
    }

    /* === Confirmation Card === */
    .confirmation-card {
      width: 100%;
      max-width: 400px;
      background: var(--input-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md, 0.5rem);
      overflow: hidden;
      margin-bottom: 1.5rem;
    }

    .confirmation-id {
      padding: 1rem;
      background: var(--primary-coral);
      text-align: center;
    }

    .confirmation-label {
      display: block;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 0.2rem;
    }

    .confirmation-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: #fff;
    }

    .confirmation-details {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .confirmation-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.9rem;
      color: var(--text-main);
    }

    .confirmation-row i {
      color: var(--primary-coral);
      width: 18px;
      text-align: center;
      font-size: 0.85rem;
    }

    /* === QR Placeholder === */
    .qr-placeholder {
      width: 180px;
      height: 180px;
      border: 2px dashed var(--card-border);
      border-radius: var(--radius-md, 0.5rem);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: var(--text-muted);
      margin-bottom: 2rem;
    }

    .qr-placeholder i {
      font-size: 3rem;
      opacity: 0.4;
    }

    .qr-placeholder span {
      font-size: 0.82rem;
      font-weight: 600;
    }

    /* === Home Button === */
    .btn-home {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.7rem 2rem;
      border-radius: var(--radius-md, 0.5rem);
      background: var(--primary-coral);
      color: #fff;
      font-size: 0.9rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-home:hover {
      box-shadow: 0 0 16px rgba(255, 107, 107, 0.4);
      transform: translateY(-1px);
    }

    /* === Responsive === */
    @media (max-width: 1024px) {
      .reservations-wizard { padding: 2rem 1.5rem 3rem; }
      .wizard-title { font-size: 1.75rem; }
      .step-content { padding: 1.5rem 1.25rem; }
      .games-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 768px) {
      .reservations-wizard { padding: 1.25rem 0.75rem 3rem; }
      .wizard-title { font-size: 1.5rem; gap: 0.5rem; }
      .wizard-subtitle { font-size: 0.9rem; }
      .progress-bar { padding: 0 0.25rem; margin-bottom: 2rem; }
      .step-circle { width: 36px; height: 36px; font-size: 0.8rem; }
      .step-label { font-size: 0.6rem; }
      .step-connector { min-width: 20px; }
      .step-content { padding: 1.5rem 1.25rem; }
      .step-title { font-size: 1.15rem; gap: 0.5rem; margin-bottom: 1.25rem; padding-bottom: 0.75rem; }
      .form-input { font-size: 16px; padding: 0.65rem 0.85rem; }
      .form-textarea { font-size: 16px; }
      .time-slots { gap: 0.4rem; }
      .time-pill { padding: 0.45rem 0.85rem; font-size: 0.82rem; }
      .games-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); max-height: 350px; gap: 0.6rem; }
      .game-card { padding: 0.85rem; }
      .game-name { font-size: 0.88rem; }
      .step-actions { flex-direction: column-reverse; gap: 0.5rem; margin-top: 1.5rem; padding-top: 1.25rem; }
      .step-actions .btn-primary,
      .step-actions .btn-secondary,
      .step-actions .btn-confirm { width: 100%; justify-content: center; }
      .btn-primary, .btn-secondary, .btn-confirm { padding: 0.65rem 1.25rem; font-size: 0.88rem; }
      .summary-card { padding: 1rem; }
      .summary-row { flex-direction: column; align-items: flex-start; gap: 0.15rem; }
      .game-toggle .toggle-label { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
      .availability-banner { padding: 0.85rem 1rem; font-size: 0.85rem; }
      .success-title { font-size: 1.35rem; }
      .success-subtitle { font-size: 0.9rem; }
      .confirmation-value { font-size: 1.5rem; }
      .qr-placeholder { width: 150px; height: 150px; }
      .qr-placeholder i { font-size: 2.5rem; }
    }

    @media (max-width: 480px) {
      .reservations-wizard { padding: 1rem 0.5rem 2.5rem; }
      .wizard-header { margin-bottom: 1.5rem; }
      .wizard-title { font-size: 1.3rem; gap: 0.4rem; }
      .wizard-title i { font-size: 0.9em; }
      .wizard-subtitle { font-size: 0.82rem; }
      .progress-bar { margin-bottom: 1.5rem; }
      .step-circle { width: 30px; height: 30px; font-size: 0.7rem; }
      .step-label { font-size: 0.5rem; }
      .step-connector { min-width: 12px; margin-bottom: 1.25rem; }
      .step-content { padding: 1rem 0.85rem; }
      .step-title { font-size: 1rem; margin-bottom: 1rem; padding-bottom: 0.6rem; }
      .form-label { font-size: 0.8rem; }
      .form-input { font-size: 16px; padding: 0.6rem 0.75rem; }
      .form-section-title { font-size: 1rem; }
      .size-display { font-size: 1.5rem; min-width: 40px; }
      .size-btn { width: 38px; height: 38px; }
      .time-slots { gap: 0.3rem; }
      .time-pill { padding: 0.35rem 0.65rem; font-size: 0.75rem; }
      .closed-banner { padding: 0.7rem 0.85rem; font-size: 0.82rem; }
      .games-grid { grid-template-columns: 1fr; max-height: 300px; }
      .game-card-meta { gap: 0.4rem; }
      .game-meta-item { font-size: 0.72rem; }
      .summary-heading { font-size: 0.9rem; }
      .summary-label { font-size: 0.82rem; }
      .summary-value { font-size: 0.85rem; }
      .toggle-text { font-size: 0.88rem; }
      .success-container { padding: 0.5rem 0; }
      .success-icon-wrap { width: 64px; height: 64px; }
      .success-icon-wrap i { font-size: 2rem; }
      .success-title { font-size: 1.2rem; }
      .success-subtitle { font-size: 0.85rem; margin-bottom: 1.5rem; }
      .confirmation-card { max-width: 100%; }
      .confirmation-id { padding: 0.85rem; }
      .confirmation-label { font-size: 0.65rem; }
      .confirmation-value { font-size: 1.35rem; }
      .confirmation-details { padding: 1rem; }
      .confirmation-row { font-size: 0.85rem; }
      .qr-placeholder { width: 130px; height: 130px; margin-bottom: 1.5rem; }
      .qr-placeholder i { font-size: 2rem; }
      .qr-placeholder span { font-size: 0.75rem; }
      .btn-home { padding: 0.65rem 1.5rem; font-size: 0.85rem; }
      .field-error { font-size: 0.72rem; }
    }

    /* === Availability Banners === */
    .availability-banner {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: var(--radius-md, 0.5rem);
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .availability-banner > i {
      font-size: 1.25rem;
      margin-top: 0.1rem;
      flex-shrink: 0;
    }

    .availability-banner strong {
      display: block;
      margin-bottom: 0.15rem;
    }

    .availability-banner p {
      margin: 0;
      font-size: 0.85rem;
    }

    .availability-banner.available {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: var(--text-main);
    }

    .availability-banner.available > i {
      color: var(--success, #10B981);
    }

    .availability-banner.pending {
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.25);
      color: var(--text-main);
    }

    .availability-banner.pending > i {
      color: #f59e0b;
    }
  `]
})
export class ReservationsPageComponent {
  private reservasService = inject(ReservasMesaService);
  private authService = inject(AuthService);
  private juegosService = inject(JuegoService);
  private mesaService = inject(MesaService);
  private toastService = inject(ToastService);

  // Progress steps
  readonly steps = [
    { num: 1, label: 'Fecha y Hora' },
    { num: 2, label: 'Juego' },
    { num: 3, label: 'Confirmar' }
  ];

  // Current step
  readonly currentStep = signal(1);

  // Today's date string for min attribute
  readonly todayStr = new Date().toISOString().split('T')[0];

  // Horarios por dia (0=Dom, 1=Lun, 2=Mar, 3=Mie, 4=Jue, 5=Vie, 6=Sab)
  private readonly schedule: Record<number, { open: number; lastSlot: number } | null> = {
    0: { open: 12, lastSlot: 21 },     // Dom  12:00-22:00 → ultima reserva 21:00
    1: null,                             // Lun  Cerrado
    2: { open: 17, lastSlot: 22 },      // Mar  17:00-23:00
    3: { open: 17, lastSlot: 22 },      // Mie  17:00-23:00
    4: { open: 17, lastSlot: 22 },      // Jue  17:00-23:00
    5: { open: 17, lastSlot: 23 },      // Vie  17:00-00:00
    6: { open: 12, lastSlot: 23 },      // Sab  12:00-00:00
  };

  readonly isDayClosed = computed(() => {
    const dateStr = this.selectedDate();
    if (!dateStr) return false;
    const day = new Date(dateStr + 'T12:00:00').getDay();
    return this.schedule[day] === null;
  });

  readonly availableTimeSlots = computed(() => {
    const dateStr = this.selectedDate();
    if (!dateStr) return [];
    const day = new Date(dateStr + 'T12:00:00').getDay();
    const hours = this.schedule[day];
    if (!hours) return [];
    const slots: string[] = [];
    for (let h = hours.open; h <= hours.lastSlot; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      if (h < hours.lastSlot) {
        slots.push(`${h.toString().padStart(2, '0')}:30`);
      }
    }
    const isToday = dateStr === this.todayStr;
    if (!isToday) return slots;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return slots.filter(slot => {
      const [hh, mm] = slot.split(':').map(Number);
      return hh * 60 + mm > currentMinutes;
    });
  });

  // Step 1 signals
  readonly selectedDate = signal('');
  readonly selectedTime = signal('');
  readonly partySize = signal(2);

  readonly step1Valid = computed(() =>
    this.selectedDate() !== '' && this.selectedTime() !== '' && this.partySize() >= 1 && !this.isDayClosed()
  );

  // Availability check signals
  readonly checkingAvailability = signal(false);
  readonly availabilityChecked = signal(false);
  readonly hasAvailability = signal(false);
  readonly availableMesaCount = signal(0);

  // Step 2 signals
  readonly wantGame = signal(false);
  readonly gameSearchTerm = signal('');
  readonly allGames = signal<JuegoExtended[]>([]);
  readonly selectedGame = signal<JuegoExtended | null>(null);

  readonly filteredGames = computed(() => {
    const term = this.gameSearchTerm().toLowerCase().trim();
    const games = this.allGames();
    if (!term) return games;
    return games.filter(g =>
      g.nombre.toLowerCase().includes(term) ||
      g.genero.toLowerCase().includes(term) ||
      (g.tags ?? []).some(tag => tag.toLowerCase().includes(term))
    );
  });

  // Step 4 signals
  readonly contactInfo = signal<ContactInfo>({ nombre: '', telefono: '', email: '' });
  readonly reservationNotes = signal('');
  readonly contactSubmitted = signal(false);
  readonly submitting = signal(false);

  // Success state
  readonly reservationConfirmed = signal(false);
  readonly confirmedReservationId = signal(0);

  isLoading = signal(true);

  constructor() {
    this.juegosService.getAll().subscribe(games => {
      this.allGames.set(games);
      this.isLoading.set(false);
    });

    const user = this.authService.currentUser();
    if (user) {
      this.contactInfo.set({
        nombre: user.nombre || '',
        telefono: user.telefono || '',
        email: user.email || ''
      });
    }
  }

  // Navigation
  goToStep(step: number): void {
    this.currentStep.set(step);
  }

  // Step 1 handlers
  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate.set(input.value);
    const slots = this.availableTimeSlots();
    if (!slots.includes(this.selectedTime())) {
      this.selectedTime.set('');
    }
  }

  incrementParty(): void {
    if (this.partySize() < 12) {
      this.partySize.update(v => v + 1);
    }
  }

  decrementParty(): void {
    if (this.partySize() > 1) {
      this.partySize.update(v => v - 1);
    }
  }

  // Availability check
  checkAvailabilityAndProceed(): void {
    this.checkingAvailability.set(true);
    this.mesaService.getAll().subscribe({
      next: (mesas) => {
        const available = mesas.filter(
          m => m.estado === 'LIBRE' && m.capacidad >= this.partySize()
        );
        this.hasAvailability.set(available.length > 0);
        this.availableMesaCount.set(available.length);
        this.availabilityChecked.set(true);
        this.checkingAvailability.set(false);
        this.goToStep(2);
      },
      error: () => {
        this.hasAvailability.set(false);
        this.availabilityChecked.set(true);
        this.checkingAvailability.set(false);
        this.goToStep(2);
      }
    });
  }

  // Step 2 handlers
  onGameSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.gameSearchTerm.set(input.value);
  }

  onGameSelected(game: JuegoExtended): void {
    if (this.selectedGame()?.id === game.id) {
      this.selectedGame.set(null);
    } else {
      this.selectedGame.set(game);
    }
  }

  // Step 4 handlers
  onContactChange(field: keyof ContactInfo, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.contactInfo.update(info => ({ ...info, [field]: input.value }));
  }

  onNotesChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.reservationNotes.set(textarea.value);
  }

  isPhoneValid(): boolean {
    return /^\d{9,}$/.test(this.contactInfo().telefono.replace(/\s+/g, ''));
  }

  isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.contactInfo().email.trim());
  }

  isContactValid(): boolean {
    return (
      this.contactInfo().nombre.trim() !== '' &&
      this.isPhoneValid() &&
      this.isEmailValid()
    );
  }

  confirmReservation(): void {
    this.contactSubmitted.set(true);

    if (!this.isContactValid()) {
      this.toastService.error('Por favor completa todos los campos de contacto correctamente.');
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.toastService.error('Debes iniciar sesion para hacer una reserva.');
      return;
    }

    this.submitting.set(true);

    const notes: string[] = [];
    if (this.reservationNotes().trim()) {
      notes.push(this.reservationNotes().trim());
    }
    notes.push('Contacto: ' + this.contactInfo().nombre + ' / ' + this.contactInfo().telefono + ' / ' + this.contactInfo().email);

    const fechaHoraInicio = ReservasMesaService.toInstant(this.selectedDate(), this.selectedTime());

    const [h, m] = this.selectedTime().split(':').map(Number);
    const horaFin = `${String(h + 2).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const fechaHoraFin = ReservasMesaService.toInstant(this.selectedDate(), horaFin);

    const user = this.authService.currentUser();

    this.reservasService.create({
      idCliente: user ? (user as any).id : undefined,
      fechaHoraInicio,
      fechaHoraFin,
      numPersonas: this.partySize(),
      idJuegoDeseado: this.selectedGame()?.id,
      notas: notes.join(' | ')
    }).subscribe({
      next: (reserva) => {
        this.submitting.set(false);
        this.confirmedReservationId.set(reserva.id);
        this.reservationConfirmed.set(true);
        this.toastService.success('Reserva confirmada con exito!');
      },
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 401 || err.status === 403) {
          this.toastService.error('Debes iniciar sesion para hacer una reserva.');
        } else if (err.status === 400) {
          const msg = err.error?.message || 'Datos de reserva invalidos. Revisa las fechas.';
          this.toastService.error(msg);
        } else {
          this.toastService.error('Error al crear la reserva. Intentalo de nuevo.');
        }
      }
    });
  }
}
