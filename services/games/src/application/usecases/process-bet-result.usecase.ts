import { Injectable, Logger } from "@nestjs/common";
import { BetRepository } from "../../domain/repositories/bet.repository";
import { RoundEngineService } from "../services/round-engine.service";

export interface BetResultInput {
  betId: string;
  status: 'ACCEPTED' | 'REJECTED';
  reason?: string;
}

@Injectable()
export class ProcessBetResultUseCase {
  private readonly logger = new Logger(ProcessBetResultUseCase.name);

  constructor(
    private readonly betRepository: BetRepository,
    private readonly roundEngineService: RoundEngineService
  ) { }

  async execute(input: BetResultInput): Promise<void> {
    const bet = await this.betRepository.findById(input.betId);
    if (!bet) {
      this.logger.error(`Bet not found: ${input.betId}`);
      return;
    }

    if (bet.status !== 'PENDING') {
      this.logger.warn(`Bet ${bet.id} is already in status ${bet.status}`);
      return;
    }

    if (input.status === 'ACCEPTED') {
      bet.accept();
      this.roundEngineService.emitBetPlaced({
        bet: {
          id: bet.id,
          roundId: bet.roundId,
          keycloakId: bet.keycloakId,
          amount: bet.amount.toString(),
          status: 'ACCEPTED'
        }
      });
    } else {
      bet.reject();
      this.roundEngineService.emitBetRejected({
        betId: bet.id,
        keycloakId: bet.keycloakId,
        reason: input.reason || 'UNKNOWN_REASON'
      });
    }

    await this.betRepository.update(bet);
  }
}
