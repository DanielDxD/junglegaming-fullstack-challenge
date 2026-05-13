import { Round } from "../entities/round.entity";

export abstract class RoundRepository {
  abstract create(round: Round): Promise<Round>;
  abstract update(round: Round): Promise<Round>;
  abstract findById(id: string): Promise<Round | null>;
  abstract findCurrent(): Promise<Round | null>;
  abstract findHistory(limit: number): Promise<Round[]>;
}
