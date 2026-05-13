import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { BetRepository } from "../../domain/repositories/bet.repository";
import { RoundRepository } from "../../domain/repositories/round.repository";
import { Bet } from "../../domain/entities/bet.entity";
import { ClientProxy } from "@nestjs/microservices";
import { MetricsService } from "../services/metrics.service";

export interface PlaceBetInput {
  keycloakId: string;
  amount: number;
  autoCashoutMultiplier?: number;
}

@Injectable()
export class PlaceBetUseCase {
  constructor(
    private readonly betRepository: BetRepository,
    private readonly roundRepository: RoundRepository,
    @Inject('WALLET_SERVICE') private readonly client: ClientProxy,
    private readonly metricsService: MetricsService
  ) { }

  async execute(input: PlaceBetInput): Promise<Bet> {
    if (input.amount < 100) throw new BadRequestException("Minimum bet is 1.00");
    if (input.amount > 100000) throw new BadRequestException("Maximum bet is 1000.00");

    const currentRound = await this.roundRepository.findCurrent();
    if (!currentRound) throw new BadRequestException("No active round");
    if (currentRound.status !== 'BETTING') throw new BadRequestException("Bets are closed for this round");

    const existingBet = await this.betRepository.findByRoundIdAndKeycloakId(currentRound.id, input.keycloakId);
    if (existingBet) throw new BadRequestException("You have already bet on this round");

    const amountInCents = BigInt(Math.round(input.amount));

    const bet = Bet.create(currentRound.id, input.keycloakId, amountInCents, input.autoCashoutMultiplier);
    const createdBet = await this.betRepository.create(bet);

    this.metricsService.recordBet(Number(createdBet.amount));

    this.client.emit('game.bet_placed', {
      betId: createdBet.id,
      keycloakId: input.keycloakId,
      amount: createdBet.amount.toString(),
    });

    return createdBet;
  }
}
