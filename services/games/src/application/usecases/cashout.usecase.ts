import { Injectable, BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { BetRepository } from "../../domain/repositories/bet.repository";
import { RoundRepository } from "../../domain/repositories/round.repository";
import { ClientProxy } from "@nestjs/microservices";
import { RoundEngineService } from "../services/round-engine.service";
import { MetricsService } from "../services/metrics.service";

export interface CashoutInput {
  keycloakId: string;
}

@Injectable()
export class CashoutUseCase {
  constructor(
    private readonly betRepository: BetRepository,
    private readonly roundRepository: RoundRepository,
    @Inject('WALLET_SERVICE') private readonly client: ClientProxy,
    @Inject('MULTIPLIER_PROVIDER') private readonly multiplierProvider: { getCurrentMultiplier: () => number },
    private readonly roundEngineService: RoundEngineService,
    private readonly metricsService: MetricsService
  ) { }

  async execute(input: CashoutInput): Promise<void> {
    const currentRound = await this.roundRepository.findCurrent();
    if (!currentRound) throw new BadRequestException("No active round");
    if (currentRound.status !== 'ACTIVE') throw new BadRequestException("Round is not active");

    const bet = await this.betRepository.findByRoundIdAndKeycloakId(currentRound.id, input.keycloakId);
    if (!bet) throw new NotFoundException("No bet found for this round");
    if (bet.status !== 'ACCEPTED') throw new BadRequestException("Bet cannot be cashed out");

    const currentMultiplier = this.multiplierProvider.getCurrentMultiplier();

    if (currentRound.crashPoint !== null && currentMultiplier >= currentRound.crashPoint) {
      throw new BadRequestException("Round already crashed");
    }

    bet.cashout(currentMultiplier);
    await this.betRepository.update(bet);

    const winAmount = BigInt(Math.floor(Number(bet.amount) * currentMultiplier));
    this.metricsService.recordWin(Number(winAmount));

    this.client.emit('game.bet_won', {
      keycloakId: input.keycloakId,
      amount: winAmount.toString(),
    });

    this.roundEngineService.emitCashedOut({
      betId: bet.id,
      multiplier: currentMultiplier,
      keycloakId: input.keycloakId
    });
  }
}
