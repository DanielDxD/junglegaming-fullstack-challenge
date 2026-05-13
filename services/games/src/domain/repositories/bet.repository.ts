import { Bet } from "../entities/bet.entity";

export abstract class BetRepository {
  abstract create(bet: Bet): Promise<Bet>;
  abstract update(bet: Bet): Promise<Bet>;
  abstract findById(id: string): Promise<Bet | null>;
  abstract findByRoundId(roundId: string): Promise<Bet[]>;
  abstract findByRoundIdAndKeycloakId(roundId: string, keycloakId: string): Promise<Bet | null>;
  abstract findHistoryByKeycloakId(keycloakId: string, limit: number): Promise<Bet[]>;
}
