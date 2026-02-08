export interface GGBEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  imageUrl?: string;
  location: string;
  capacity: number;
  currentAttendees: number;
  waitlistCount: number;
  type: 'TORNEO' | 'NOCHE_TEMATICA' | 'TALLER' | 'EVENTO_ESPECIAL';
  status: 'PROXIMO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';
  tags: string[];
  createdBy?: string;
}

export interface EventSubscription {
  id: number;
  eventId: number;
  userId: string;
  status: 'CONFIRMED' | 'WAITLIST' | 'CANCELLED';
  subscribedAt: string;
}
