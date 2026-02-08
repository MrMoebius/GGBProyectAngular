export interface GGBNotification {
  id: number;
  type: 'EVENT_REMINDER' | 'RESERVATION_CONFIRMED' | 'NEW_EVENT' | 'GAME_AVAILABLE' | 'PROMO' | 'GENERAL';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  icon?: string;
}
