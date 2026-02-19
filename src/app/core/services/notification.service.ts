import { Injectable, inject, signal, computed } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { GGBNotification } from '../models/notification.interface';

const SEED_NOTIFICATIONS: GGBNotification[] = [];

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
