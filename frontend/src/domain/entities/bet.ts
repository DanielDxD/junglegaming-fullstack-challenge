export type BetStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WON' | 'LOST';

export interface Bet {
  id: string;
  roundId?: string;
  keycloakId: string;
  amount: string;
  status: BetStatus;
  cashoutMultiplier: number | null;
  createdAt?: string;
}

export interface PlayerBet extends Bet {
  username?: string;
}
