import { Injectable, inject, signal, computed } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { GGBNotification } from '../models/notification.interface';

const SEED_NOTIFICATIONS: GGBNotification[] = [
  {
    id: 1,
    type: 'NEW_EVENT',
    title: 'Nuevo evento disponible',
    message: 'Se ha abierto la inscripcion para el Torneo de Catan. Plazas limitadas!',
    read: false,
    createdAt: '2026-02-05T10:00:00',
    actionUrl: '/public/eventos/1',
    icon: 'fa-calendar-plus'
  },
  {
    id: 2,
    type: 'GAME_AVAILABLE',
    title: 'Nuevo juego en la ludoteca',
    message: 'Hemos anadido Wingspan a nuestra coleccion. Ven a probarlo!',
    read: false,
    createdAt: '2026-02-04T14:30:00',
    actionUrl: '/public/juegos/16',
    icon: 'fa-dice'
  },
  {
    id: 3,
    type: 'PROMO',
    title: 'Happy Hour Gaming',
    message: 'Todos los viernes de 18:00 a 20:00, 2x1 en bebidas mientras juegas.',
    read: false,
    createdAt: '2026-02-03T09:00:00',
    icon: 'fa-tag'
  },
  {
    id: 4,
    type: 'EVENT_REMINDER',
    title: 'Recordatorio: Noche de Rol manana',
    message: 'No olvides que manana a las 19:00 comienza la Noche de Rol. Trae tu ficha de personaje!',
    read: true,
    createdAt: '2026-02-01T18:00:00',
    actionUrl: '/public/eventos/2',
    icon: 'fa-bell'
  },
  {
    id: 5,
    type: 'RESERVATION_CONFIRMED',
    title: 'Reserva confirmada',
    message: 'Tu reserva para el sabado 8 de febrero a las 17:00 ha sido confirmada. Mesa 5, zona Sala Principal.',
    read: true,
    createdAt: '2026-01-30T12:00:00',
    icon: 'fa-check-circle'
  },
  {
    id: 6,
    type: 'GENERAL',
    title: 'Bienvenido a Giber Bar',
    message: 'Gracias por unirte! Explora nuestro catalogo de juegos y no te pierdas los proximos eventos.',
    read: true,
    createdAt: '2026-01-28T10:00:00',
    actionUrl: '/public/juegos',
    icon: 'fa-hand-wave'
  }
];

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private storage = inject(LocalStorageService);
  private _notifications = signal<GGBNotification[]>(this.loadNotifications());

  notifications = computed(() => this._notifications());
  unreadCount = computed(() => this._notifications().filter(n => !n.read).length);

  private loadNotifications(): GGBNotification[] {
    const stored = this.storage.load<GGBNotification[] | null>('notifications', null);
    if (stored === null) {
      this.storage.save('notifications', SEED_NOTIFICATIONS);
      return SEED_NOTIFICATIONS;
    }
    return stored;
  }

  getAll(): GGBNotification[] {
    return this._notifications();
  }

  markAsRead(id: number): void {
    this._notifications.update(list => {
      const updated = list.map(n => n.id === id ? { ...n, read: true } : n);
      this.storage.save('notifications', updated);
      return updated;
    });
  }

  markAllAsRead(): void {
    this._notifications.update(list => {
      const updated = list.map(n => ({ ...n, read: true }));
      this.storage.save('notifications', updated);
      return updated;
    });
  }

  dismiss(id: number): void {
    this._notifications.update(list => {
      const updated = list.filter(n => n.id !== id);
      this.storage.save('notifications', updated);
      return updated;
    });
  }

  add(notification: Omit<GGBNotification, 'id' | 'createdAt' | 'read'>): void {
    this._notifications.update(list => {
      const newNotif: GGBNotification = {
        ...notification,
        id: Math.max(0, ...list.map(n => n.id)) + 1,
        read: false,
        createdAt: new Date().toISOString()
      };
      const updated = [newNotif, ...list];
      this.storage.save('notifications', updated);
      return updated;
    });
  }
}
