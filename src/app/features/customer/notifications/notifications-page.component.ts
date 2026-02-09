import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { GGBNotification } from '../../../core/models/notification.interface';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [],
  template: `
    <div class="notifications-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            <i class="fa-solid fa-bell"></i>
            Notificaciones
            @if (notificationService.unreadCount() > 0) {
              <span class="unread-badge">{{ notificationService.unreadCount() }}</span>
            }
          </h1>
          <p class="page-subtitle">Mantente al dia con las novedades de Giber Games Bar</p>
        </div>
        @if (notificationService.unreadCount() > 0) {
          <button class="btn-mark-all" (click)="markAllRead()">
            <i class="fa-solid fa-check-double"></i>
            Marcar todas como leidas
          </button>
        }
      </div>

      <!-- Content -->
      @if (allNotifications().length === 0) {
        <div class="empty-state">
          <div class="empty-icon"><i class="fa-solid fa-bell-slash"></i></div>
          <h2 class="empty-title">Sin notificaciones</h2>
          <p class="empty-text">Cuando haya novedades, apareceran aqui.</p>
        </div>
      } @else {
        <!-- Today -->
        @if (todayNotifications().length > 0) {
          <div class="notification-group">
            <h3 class="group-title">Hoy</h3>
            @for (notif of todayNotifications(); track notif.id) {
              <div
                class="notification-item"
                [class.unread]="!notif.read"
                (click)="onNotificationClick(notif)"
              >
                <div class="notif-icon" [class.unread-icon]="!notif.read">
                  <i class="fa-solid" [class]="notif.icon || 'fa-bell'"></i>
                </div>
                <div class="notif-content">
                  <div class="notif-header">
                    <span class="notif-title">{{ notif.title }}</span>
                    <span class="notif-time">{{ timeAgo(notif.createdAt) }}</span>
                  </div>
                  <p class="notif-message">{{ notif.message }}</p>
                </div>
                <button
                  class="notif-dismiss"
                  (click)="dismiss(notif.id, $event)"
                  aria-label="Descartar"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            }
          </div>
        }

        <!-- This week -->
        @if (thisWeekNotifications().length > 0) {
          <div class="notification-group">
            <h3 class="group-title">Esta semana</h3>
            @for (notif of thisWeekNotifications(); track notif.id) {
              <div
                class="notification-item"
                [class.unread]="!notif.read"
                (click)="onNotificationClick(notif)"
              >
                <div class="notif-icon" [class.unread-icon]="!notif.read">
                  <i class="fa-solid" [class]="notif.icon || 'fa-bell'"></i>
                </div>
                <div class="notif-content">
                  <div class="notif-header">
                    <span class="notif-title">{{ notif.title }}</span>
                    <span class="notif-time">{{ timeAgo(notif.createdAt) }}</span>
                  </div>
                  <p class="notif-message">{{ notif.message }}</p>
                </div>
                <button
                  class="notif-dismiss"
                  (click)="dismiss(notif.id, $event)"
                  aria-label="Descartar"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            }
          </div>
        }

        <!-- Older -->
        @if (olderNotifications().length > 0) {
          <div class="notification-group">
            <h3 class="group-title">Anteriores</h3>
            @for (notif of olderNotifications(); track notif.id) {
              <div
                class="notification-item"
                [class.unread]="!notif.read"
                (click)="onNotificationClick(notif)"
              >
                <div class="notif-icon" [class.unread-icon]="!notif.read">
                  <i class="fa-solid" [class]="notif.icon || 'fa-bell'"></i>
                </div>
                <div class="notif-content">
                  <div class="notif-header">
                    <span class="notif-title">{{ notif.title }}</span>
                    <span class="notif-time">{{ timeAgo(notif.createdAt) }}</span>
                  </div>
                  <p class="notif-message">{{ notif.message }}</p>
                </div>
                <button
                  class="notif-dismiss"
                  (click)="dismiss(notif.id, $event)"
                  aria-label="Descartar"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .notifications-page {
      max-width: 800px;
      margin: 0 auto;
    }

    /* ===== Header ===== */
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 2rem;
      gap: 1rem;
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

    .unread-badge {
      min-width: 24px;
      height: 24px;
      padding: 0 7px;
      border-radius: 9999px;
      background-color: var(--neon-pink, #FF6B9D);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 10px rgba(255, 107, 157, 0.4);
    }

    .btn-mark-all {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.15rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--neon-cyan, #00FFD1);
      background: rgba(0, 255, 209, 0.08);
      border: 1px solid rgba(0, 255, 209, 0.2);
      border-radius: var(--radius-md, 8px);
      cursor: pointer;
      transition: background-color 0.2s, border-color 0.2s;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .btn-mark-all:hover {
      background-color: rgba(0, 255, 209, 0.15);
      border-color: rgba(0, 255, 209, 0.35);
    }

    .btn-mark-all i { font-size: 0.75rem; }

    /* ===== Notification groups ===== */
    .notification-group {
      margin-bottom: 1.5rem;
    }

    .group-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted, #94a3b8);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin: 0 0 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--card-border, rgba(255,255,255,0.08));
    }

    /* ===== Notification item ===== */
    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 0.875rem;
      padding: 1rem 1.25rem;
      background-color: var(--card-bg, #1E293B);
      border: 1px solid var(--card-border, rgba(255,255,255,0.08));
      border-radius: var(--radius-md, 8px);
      margin-bottom: 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s, border-color 0.2s, transform 0.15s;
    }

    .notification-item:hover {
      background-color: rgba(255, 255, 255, 0.04);
      transform: translateX(2px);
    }

    .notification-item.unread {
      border-left: 3px solid var(--neon-cyan, #00FFD1);
      background-color: rgba(0, 255, 209, 0.03);
    }

    /* Icon */
    .notif-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md, 8px);
      background-color: rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      color: var(--text-muted, #94a3b8);
      flex-shrink: 0;
      transition: background-color 0.2s;
    }

    .notif-icon.unread-icon {
      background-color: rgba(0, 255, 209, 0.1);
      color: var(--neon-cyan, #00FFD1);
    }

    /* Content */
    .notif-content {
      flex: 1;
      min-width: 0;
    }

    .notif-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.25rem;
    }

    .notif-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-white, #fff);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .unread .notif-title {
      color: var(--text-white, #fff);
    }

    .notif-time {
      font-size: 0.7rem;
      color: var(--text-muted, #94a3b8);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .notif-message {
      font-size: 0.8rem;
      color: var(--text-muted, #94a3b8);
      line-height: 1.5;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Dismiss button */
    .notif-dismiss {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      border-radius: var(--radius-sm, 6px);
      background: none;
      color: var(--text-muted, #94a3b8);
      font-size: 0.8rem;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s, color 0.2s, background-color 0.2s;
      flex-shrink: 0;
    }

    .notification-item:hover .notif-dismiss {
      opacity: 1;
    }

    .notif-dismiss:hover {
      color: var(--danger, #EF4444);
      background-color: rgba(239, 68, 68, 0.1);
    }

    /* ===== Empty state ===== */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 35vh;
      text-align: center;
      padding: 2rem;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: rgba(0, 255, 209, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .empty-icon i {
      font-size: 2rem;
      color: rgba(0, 255, 209, 0.25);
    }

    .empty-title {
      font-size: 1.15rem;
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
      .page-header {
        flex-direction: column;
      }

      .btn-mark-all {
        align-self: flex-start;
      }

      .notification-item {
        padding: 0.85rem 1rem;
      }

      .notif-dismiss {
        opacity: 1;
      }

      .page-title {
        font-size: 1.25rem;
      }
    }
  `]
})
export class NotificationsPageComponent {
  notificationService = inject(NotificationService);
  private router = inject(Router);

  allNotifications = computed(() => this.notificationService.notifications());

  todayNotifications = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.allNotifications().filter(n => {
      const d = new Date(n.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
  });

  thisWeekNotifications = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return this.allNotifications().filter(n => {
      const d = new Date(n.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() < today.getTime() && d.getTime() >= weekAgo.getTime();
    });
  });

  olderNotifications = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return this.allNotifications().filter(n => {
      const d = new Date(n.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime() < weekAgo.getTime();
    });
  });

  markAllRead(): void {
    this.notificationService.markAllAsRead();
  }

  onNotificationClick(notif: GGBNotification): void {
    if (!notif.read) {
      this.notificationService.markAsRead(notif.id);
    }
    if (notif.actionUrl) {
      this.router.navigate([notif.actionUrl]);
    }
  }

  dismiss(id: number, event: Event): void {
    event.stopPropagation();
    this.notificationService.dismiss(id);
  }

  timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} dias`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}
