import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GGBEvent, EventSubscription } from '../models/evento.interface';
import { LocalStorageService } from './local-storage.service';

const EVENTS_KEY = 'events';
const EVENTS_VERSION_KEY = 'events_version';
const SUBS_KEY = 'event_subs';
const CURRENT_SEED_VERSION = 2;

const SEED_EVENTS: GGBEvent[] = [
  {
    id: 1,
    title: 'Torneo de Catan',
    description:
      'Compite por el titulo de mejor colonizador en nuestro torneo mensual de Catan en Giber Games Bar. ' +
      'Se jugaran rondas eliminatorias con las reglas oficiales del juego base. ' +
      'Los tres primeros clasificados recibiran premios exclusivos. ' +
      'Inscripcion abierta hasta completar aforo, no te quedes fuera!',
    date: '2026-02-14',
    time: '17:00',
    endTime: '22:00',
    imageUrl: 'assets/images/events/torneo-catan.webp',
    location: 'Giber Games Bar, Alcorcon',
    capacity: 16,
    currentAttendees: 14,
    waitlistCount: 3,
    type: 'TORNEO',
    status: 'PROXIMO',
    tags: ['estrategia', 'competitivo', 'premios'],
    createdBy: 'Admin'
  },
  {
    id: 2,
    title: 'Noche de Rol: La Maldicion del Templo',
    description:
      'Sumérgete en una aventura one-shot de Dungeons & Dragons ambientada en un templo maldito. ' +
      'Un master experimentado guiara la partida, perfecta tanto para veteranos como para curiosos. ' +
      'Se proporcionan fichas de personaje pregeneradas para facilitar el acceso. ' +
      'Incluye merienda tematica y ambientacion inmersiva con musica y efectos de sonido.',
    date: '2026-02-21',
    time: '19:00',
    endTime: '23:00',
    imageUrl: 'assets/images/events/noche-rol.webp',
    location: 'Giber Games Bar, Alcorcon',
    capacity: 20,
    currentAttendees: 18,
    waitlistCount: 4,
    type: 'NOCHE_TEMATICA',
    status: 'PROXIMO',
    tags: ['rol', 'D&D', 'narrativa'],
    createdBy: 'Admin'
  },
  {
    id: 3,
    title: 'Taller de Pintura de Miniaturas',
    description:
      'Aprende a pintar miniaturas como un profesional en este taller guiado paso a paso. ' +
      'Cubriremos tecnicas de imprimacion, capas base, lavados y resaltados secos. ' +
      'Todo el material esta incluido: miniaturas, pinturas, pinceles y barniz. ' +
      'Al finalizar te llevas tu miniatura terminada y un kit basico de pinturas para seguir practicando.',
    date: '2026-02-28',
    time: '12:00',
    endTime: '15:00',
    imageUrl: 'assets/images/events/taller-miniaturas.webp',
    location: 'Giber Games Bar, Alcorcon',
    capacity: 12,
    currentAttendees: 8,
    waitlistCount: 0,
    type: 'TALLER',
    status: 'PROXIMO',
    tags: ['taller', 'miniaturas', 'creativo'],
    createdBy: 'Admin'
  },
  {
    id: 4,
    title: 'Torneo de Wingspan',
    description:
      'El torneo definitivo de Wingspan llega a Giber Games Bar. ' +
      'Formato de rondas clasificatorias y final a 4 jugadores con las reglas oficiales. ' +
      'Disponemos de varias copias del juego con todas las expansiones para que no falte de nada. ' +
      'Habra premios para el top 3 y consumicion incluida para todos los participantes.',
    date: '2026-03-07',
    time: '17:00',
    endTime: '22:00',
    imageUrl: 'assets/images/events/torneo-wingspan.webp',
    location: 'Giber Games Bar, Alcorcon',
    capacity: 24,
    currentAttendees: 20,
    waitlistCount: 2,
    type: 'TORNEO',
    status: 'PROXIMO',
    tags: ['estrategia', 'competitivo', 'Wingspan'],
    createdBy: 'Admin'
  },
  {
    id: 5,
    title: 'Noche de Juegos Party',
    description:
      'Una velada perfecta para reir y pasarlo en grande con juegos party de nuestra ludoteca: Jungle Speed, Dobble, Dixit y muchos mas. ' +
      'Ideal para grupos de amigos o para venir solo y conocer gente nueva en un ambiente distendido. ' +
      'Nuestro equipo rotara por las mesas explicando las reglas de cada juego. ' +
      'Incluye una consumicion gratuita y descuento del 10% en carta durante todo el evento.',
    date: '2026-03-14',
    time: '20:00',
    endTime: '23:30',
    imageUrl: 'assets/images/events/noche-party.webp',
    location: 'Giber Games Bar, Alcorcon',
    capacity: 30,
    currentAttendees: 12,
    waitlistCount: 0,
    type: 'NOCHE_TEMATICA',
    status: 'PROXIMO',
    tags: ['party', 'social', 'casual'],
    createdBy: 'Admin'
  },
  {
    id: 6,
    title: 'Escape Room en Mesa: El Misterio del Faro',
    description:
      'Resuelve el misterio del faro abandonado en esta experiencia de escape room de mesa. ' +
      'Trabajaras en equipo para descifrar enigmas, encontrar pistas ocultas y desvelar la verdad antes de que se agote el tiempo. ' +
      'Cada grupo de 4 jugadores tendra su propio set de materiales exclusivos con sobres sellados y objetos fisicos. ' +
      'Dificultad media-alta, recomendado para jugadores con experiencia en juegos de deduccion.',
    date: '2026-03-20',
    time: '18:00',
    endTime: '20:30',
    imageUrl: 'assets/images/events/escape-room.webp',
    location: 'Giber Games Bar, Alcorcon',
    capacity: 8,
    currentAttendees: 6,
    waitlistCount: 2,
    type: 'EVENTO_ESPECIAL',
    status: 'PROXIMO',
    tags: ['escape room', 'cooperativo', 'enigmas'],
    createdBy: 'Admin'
  },
  {
    id: 7,
    title: 'Liga de Ajedrez Mensual',
    description:
      'Participa en nuestra liga mensual de ajedrez con sistema suizo a 5 rondas y control de tiempo clasico. ' +
      'Abierta a todos los niveles, desde principiantes hasta jugadores de club experimentados. ' +
      'Se utilizaran tableros profesionales con reloj digital y se registraran las partidas para el ranking interno. ' +
      'El ganador de la liga recibira un premio especial y un trofeo conmemorativo.',
    date: '2026-03-22',
    time: '12:00',
    endTime: '17:00',
    imageUrl: 'assets/images/events/liga-ajedrez.webp',
    location: 'Giber Games Bar, Alcorcon',
    capacity: 16,
    currentAttendees: 10,
    waitlistCount: 0,
    type: 'TORNEO',
    status: 'PROXIMO',
    tags: ['ajedrez', 'estrategia', 'liga'],
    createdBy: 'Admin'
  },
  {
    id: 8,
    title: 'Taller de Dungeons & Dragons para Principiantes',
    description:
      'Siempre quisiste jugar a D&D pero no sabias por donde empezar? Este taller es para ti. ' +
      'Aprenderemos las reglas basicas, crearemos personajes juntos y jugaremos una breve aventura introductoria. ' +
      'No necesitas traer nada, proporcionamos manuales, dados y hojas de personaje. ' +
      'Al finalizar recibiras una guia con recursos para seguir jugando por tu cuenta.',
    date: '2026-03-28',
    time: '12:00',
    endTime: '16:00',
    imageUrl: 'assets/images/events/taller-dnd.webp',
    location: 'Giber Games Bar, Alcorcon',
    capacity: 10,
    currentAttendees: 7,
    waitlistCount: 0,
    type: 'TALLER',
    status: 'PROXIMO',
    tags: ['taller', 'D&D', 'principiantes'],
    createdBy: 'Admin'
  },
  {
    id: 9,
    title: 'Maraton de Juegos Cooperativos',
    description:
      'Un dia entero dedicado a los mejores juegos cooperativos de nuestra ludoteca: Pandemic Legacy, Gloomhaven y Spirit Island. ' +
      'Forma equipo con otros jugadores y enfrentaos a desafios que solo podreis superar trabajando juntos. ' +
      'Habra monitores en cada mesa para ensenar las reglas y resolver dudas durante la partida. ' +
      'Comida y bebida incluidas en la inscripcion para que no tengas que moverte de la mesa en todo el dia.',
    date: '2026-04-04',
    time: '12:00',
    endTime: '21:00',
    imageUrl: 'assets/images/events/maraton-coop.webp',
    location: 'Giber Games Bar, Alcorcon',
    capacity: 24,
    currentAttendees: 15,
    waitlistCount: 0,
    type: 'EVENTO_ESPECIAL',
    status: 'PROXIMO',
    tags: ['cooperativo', 'maraton', 'juegos de mesa'],
    createdBy: 'Admin'
  },
  {
    id: 10,
    title: 'Noche de Trivial: Cultura Friki',
    description:
      'Pon a prueba tus conocimientos sobre videojuegos, comics, peliculas de ciencia ficcion, anime y juegos de mesa. ' +
      'Compite en equipos de 3 a 5 personas en 6 rondas tematicas con preguntas de dificultad creciente. ' +
      'El equipo ganador se lleva un vale de 50 euros para gastar en Giber Games Bar. ' +
      'Ambiente festivo garantizado con musica, decoracion tematica y bebidas especiales para la ocasion.',
    date: '2026-04-11',
    time: '20:00',
    endTime: '23:00',
    imageUrl: 'assets/images/events/trivial-friki.webp',
    location: 'Giber Games Bar, Alcorcon',
    capacity: 40,
    currentAttendees: 22,
    waitlistCount: 0,
    type: 'NOCHE_TEMATICA',
    status: 'PROXIMO',
    tags: ['trivial', 'cultura friki', 'equipos'],
    createdBy: 'Admin'
  }
];

@Injectable({ providedIn: 'root' })
export class EventService {
  private storage = inject(LocalStorageService);

  private _events = signal<GGBEvent[]>(this.loadEvents());
  private _subscriptions = signal<EventSubscription[]>(this.loadSubscriptions());

  events = computed(() => this._events());
  subscriptions = computed(() => this._subscriptions());

  // ── Queries ──────────────────────────────────────────────

  private refreshFromStorage(): void {
    this._events.set(this.loadEvents());
  }

  getAll(): Observable<GGBEvent[]> {
    this.refreshFromStorage();
    return of(this._events());
  }

  getUpcoming(limit?: number): Observable<GGBEvent[]> {
    this.refreshFromStorage();
    const upcoming = this._events()
      .filter(e => e.status === 'PROXIMO')
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
      });
    return of(limit ? upcoming.slice(0, limit) : upcoming);
  }

  getById(id: number): Observable<GGBEvent | undefined> {
    this.refreshFromStorage();
    return of(this._events().find(e => e.id === id));
  }

  // ── Admin mutations ──────────────────────────────────────

  create(event: Partial<GGBEvent>): Observable<GGBEvent> {
    const current = this._events();
    const nextId = current.length > 0 ? Math.max(...current.map(e => e.id)) + 1 : 1;

    const newEvent: GGBEvent = {
      id: nextId,
      title: event.title ?? '',
      description: event.description ?? '',
      date: event.date ?? new Date().toISOString().split('T')[0],
      time: event.time ?? '00:00',
      endTime: event.endTime,
      imageUrl: event.imageUrl,
      location: event.location ?? '',
      capacity: event.capacity ?? 0,
      currentAttendees: event.currentAttendees ?? 0,
      waitlistCount: event.waitlistCount ?? 0,
      type: event.type ?? 'EVENTO_ESPECIAL',
      status: event.status ?? 'PROXIMO',
      tags: event.tags ?? [],
      createdBy: event.createdBy ?? 'Admin'
    };

    this._events.update(list => {
      const updated = [...list, newEvent];
      this.storage.save(EVENTS_KEY, updated);
      return updated;
    });

    return of(newEvent);
  }

  update(id: number, changes: Partial<GGBEvent>): Observable<GGBEvent> {
    let updatedEvent!: GGBEvent;

    this._events.update(list => {
      const updated = list.map(e => {
        if (e.id === id) {
          updatedEvent = { ...e, ...changes, id };
          return updatedEvent;
        }
        return e;
      });
      this.storage.save(EVENTS_KEY, updated);
      return updated;
    });

    return of(updatedEvent);
  }

  delete(id: number): Observable<void> {
    this._events.update(list => {
      const updated = list.filter(e => e.id !== id);
      this.storage.save(EVENTS_KEY, updated);
      return updated;
    });

    // Also remove subscriptions related to this event
    this._subscriptions.update(subs => {
      const updated = subs.filter(s => s.eventId !== id);
      this.storage.save(SUBS_KEY, updated);
      return updated;
    });

    return of(void 0);
  }

  // ── Subscriptions ────────────────────────────────────────

  subscribe(eventId: number, userId: string): Observable<EventSubscription> {
    const event = this._events().find(e => e.id === eventId);
    if (!event) {
      throw new Error(`Event with id ${eventId} not found`);
    }

    const existing = this._subscriptions().find(
      s => s.eventId === eventId && s.userId === userId && s.status !== 'CANCELLED'
    );
    if (existing) {
      return of(existing);
    }

    const isFull = event.currentAttendees >= event.capacity;
    const status: EventSubscription['status'] = isFull ? 'WAITLIST' : 'CONFIRMED';

    const allSubs = this._subscriptions();
    const nextId = allSubs.length > 0 ? Math.max(...allSubs.map(s => s.id)) + 1 : 1;

    const subscription: EventSubscription = {
      id: nextId,
      eventId,
      userId,
      status,
      subscribedAt: new Date().toISOString()
    };

    this._subscriptions.update(subs => {
      const updated = [...subs, subscription];
      this.storage.save(SUBS_KEY, updated);
      return updated;
    });

    // Update event counters
    this._events.update(list => {
      const updated = list.map(e => {
        if (e.id === eventId) {
          return status === 'CONFIRMED'
            ? { ...e, currentAttendees: e.currentAttendees + 1 }
            : { ...e, waitlistCount: e.waitlistCount + 1 };
        }
        return e;
      });
      this.storage.save(EVENTS_KEY, updated);
      return updated;
    });

    return of(subscription);
  }

  unsubscribe(eventId: number, userId: string): Observable<void> {
    const sub = this._subscriptions().find(
      s => s.eventId === eventId && s.userId === userId && s.status !== 'CANCELLED'
    );

    if (sub) {
      const wasCancelled = sub.status;

      this._subscriptions.update(subs => {
        const updated = subs.map(s =>
          s.id === sub.id ? { ...s, status: 'CANCELLED' as const } : s
        );
        this.storage.save(SUBS_KEY, updated);
        return updated;
      });

      // Decrement appropriate event counter
      this._events.update(list => {
        const updated = list.map(e => {
          if (e.id === eventId) {
            return wasCancelled === 'CONFIRMED'
              ? { ...e, currentAttendees: Math.max(0, e.currentAttendees - 1) }
              : { ...e, waitlistCount: Math.max(0, e.waitlistCount - 1) };
          }
          return e;
        });
        this.storage.save(EVENTS_KEY, updated);
        return updated;
      });

      // Promote first waitlisted user if a confirmed spot opened
      if (wasCancelled === 'CONFIRMED') {
        this.promoteFromWaitlist(eventId);
      }
    }

    return of(void 0);
  }

  getSubscription(eventId: number, userId: string): Observable<EventSubscription | undefined> {
    return of(
      this._subscriptions().find(
        s => s.eventId === eventId && s.userId === userId && s.status !== 'CANCELLED'
      )
    );
  }

  getSubscriptionsByUser(userId: string): Observable<EventSubscription[]> {
    return of(
      this._subscriptions().filter(s => s.userId === userId && s.status !== 'CANCELLED')
    );
  }

  // ── Private helpers ──────────────────────────────────────

  private loadEvents(): GGBEvent[] {
    const storedVersion = this.storage.load<number>(EVENTS_VERSION_KEY, 0);
    if (storedVersion < CURRENT_SEED_VERSION) {
      this.storage.save(EVENTS_KEY, SEED_EVENTS);
      this.storage.save(EVENTS_VERSION_KEY, CURRENT_SEED_VERSION);
      return [...SEED_EVENTS];
    }
    const stored = this.storage.load<GGBEvent[] | null>(EVENTS_KEY, null);
    if (stored && stored.length > 0) {
      return stored;
    }
    this.storage.save(EVENTS_KEY, SEED_EVENTS);
    this.storage.save(EVENTS_VERSION_KEY, CURRENT_SEED_VERSION);
    return [...SEED_EVENTS];
  }

  private loadSubscriptions(): EventSubscription[] {
    return this.storage.load<EventSubscription[]>(SUBS_KEY, []);
  }

  private promoteFromWaitlist(eventId: number): void {
    const waitlisted = this._subscriptions()
      .filter(s => s.eventId === eventId && s.status === 'WAITLIST')
      .sort((a, b) => a.subscribedAt.localeCompare(b.subscribedAt));

    if (waitlisted.length === 0) return;

    const promoted = waitlisted[0];

    this._subscriptions.update(subs => {
      const updated = subs.map(s =>
        s.id === promoted.id ? { ...s, status: 'CONFIRMED' as const } : s
      );
      this.storage.save(SUBS_KEY, updated);
      return updated;
    });

    this._events.update(list => {
      const updated = list.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            currentAttendees: e.currentAttendees + 1,
            waitlistCount: Math.max(0, e.waitlistCount - 1)
          };
        }
        return e;
      });
      this.storage.save(EVENTS_KEY, updated);
      return updated;
    });
  }
}
