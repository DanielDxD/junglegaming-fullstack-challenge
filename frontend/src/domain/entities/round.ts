import { PlayerBet } from './bet';

export type RoundStatus = 'PENDING' | 'BETTING' | 'ACTIVE' | 'FINISHED';

export interface CrashPoint {
  id?: string;
  hash: string;
  seed?: string;
  crashPoint?: number;
}

export interface Round {
  id: string;
  status: RoundStatus;
  startedAt: string | null;
  finishedAt: string | null;
  hash: string;
  seed?: string;
  crashPoint?: number;
  bets?: PlayerBet[];
}

export interface VerifyRoundResult {
  isValid: boolean;
  hash: string;
  seed: string;
  crashPoint: number | null;
}
