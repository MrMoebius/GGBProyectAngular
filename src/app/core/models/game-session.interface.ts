export interface GameSession {
  id: number;
  gameId: number;
  gameName: string;
  date: string;
  duration: number;
  players: number;
  notes?: string;
}
