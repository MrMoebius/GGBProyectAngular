export interface GameRating {
  id: number;
  gameId: number;
  userId: string;
  userName: string;
  rating: number;
  review?: string;
  createdAt: string;
}
