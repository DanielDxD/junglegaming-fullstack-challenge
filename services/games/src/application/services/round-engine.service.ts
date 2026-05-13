import { Injectable, Logger, Inject } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { RoundRepository } from "../../domain/repositories/round.repository";
import { BetRepository } from "../../domain/repositories/bet.repository";
import { ProvablyFairService } from "../../domain/services/provably-fair.service";
import { Round } from "../../domain/entities/round.entity";
import { MetricsService } from "./metrics.service";
import { Server } from "socket.io";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class RoundEngineService {
  private readonly logger = new Logger(RoundEngineService.name);
  private currentMultiplier = 1.00;
  private io: Server | null = null;
  private tickInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly roundRepository: RoundRepository,
    private readonly betRepository: BetRepository,
    private readonly provablyFairService: ProvablyFairService,
    @Inject('WALLET_SERVICE') private readonly client: ClientProxy,
    private readonly metricsService: MetricsService
  ) { }

  setWebSocketServer(io: Server) {
    this.io = io;
  }

  getCurrentMultiplier(): number {
    return this.currentMultiplier;
  }

  emitBetPlaced(betData: any) {
    this.io?.emit('bet.placed', betData);
  }

  emitBetRejected(betData: { betId: string; keycloakId: string; reason: string }) {
    this.io?.emit('bet.rejected', betData);
  }

  emitCashedOut(cashoutData: any) {
    this.io?.emit('bet.cashed_out', cashoutData);
  }

  @Cron(CronExpression.EVERY_SECOND)
  handleCron() {
  }

  async startEngine() {
    this.logger.log("Starting Round Engine...");
    this.loop();
  }

  private async loop() {
    try {
      const { seed, hash, crashPoint } = this.provablyFairService.generateRoundData();
      let currentRound = Round.create(seed, hash, crashPoint);
      currentRound = await this.roundRepository.create(currentRound);

      currentRound.startBetting();
      await this.roundRepository.update(currentRound);

      this.logger.log(`Round ${currentRound.id} - Betting Phase started. Hash: ${hash}`);
      this.io?.emit('round.betting', { roundId: currentRound.id, hash });

      await this.delay(10000);

      currentRound = (await this.roundRepository.findById(currentRound.id))!;
      currentRound.start();
      await this.roundRepository.update(currentRound);

      this.logger.log(`Round ${currentRound.id} - Active Phase started.`);
      this.io?.emit('round.started', { roundId: currentRound.id });

      this.currentMultiplier = 1.00;
      const startTime = Date.now();

      const growthRate = 0.00006;
      
      const autoCashoutBets = await this.betRepository.findByRoundId(currentRound.id);
      let pendingAutoCashouts = autoCashoutBets.filter(b => b.status === 'ACCEPTED' && b.autoCashoutMultiplier !== null);

      return new Promise<void>((resolve) => {
        this.tickInterval = setInterval(async () => {
          const elapsed = Date.now() - startTime;
          this.currentMultiplier = Math.pow(Math.E, growthRate * elapsed);

          if (this.currentMultiplier >= crashPoint) {
            this.currentMultiplier = crashPoint;
            clearInterval(this.tickInterval!);
            await this.crashRound(currentRound, crashPoint, seed);

            await this.delay(3000);
            resolve();
            this.loop();
          } else {
            this.io?.emit('round.multiplier_update', { multiplier: this.currentMultiplier });
            
            for (let i = 0; i < pendingAutoCashouts.length; i++) {
              const bet = pendingAutoCashouts[i];
              if (this.currentMultiplier >= bet.autoCashoutMultiplier!) {
                await this.processAutoCashout(bet, bet.autoCashoutMultiplier!);
                pendingAutoCashouts.splice(i, 1);
                i--;
              }
            }
          }
        }, 100);
      });

    } catch (e) {
      this.logger.error("Error in Round Engine Loop", e);
      await this.delay(5000);
      this.loop();
    }
  }

  private async crashRound(round: Round, crashPoint: number, seed: string) {
    this.logger.log(`Round ${round.id} - CRASHED at ${crashPoint}x`);

    round.finish();
    await this.roundRepository.update(round);

    this.io?.emit('round.crashed', {
      roundId: round.id,
      crashPoint,
      seed
    });

    const bets = await this.betRepository.findByRoundId(round.id);
    for (const bet of bets) {
      if (bet.status === 'ACCEPTED') {
        bet.lose();
        await this.betRepository.update(bet);
        // Note: Loss doesn't increase totalWinCounter, but updateRTP will use the current totals.
      }
    }
  }

  private async processAutoCashout(bet: any, multiplier: number) {
    this.logger.log(`Auto-cashout for bet ${bet.id} at ${multiplier}x`);
    
    bet.cashout(multiplier);
    await this.betRepository.update(bet);

    const winAmount = BigInt(Math.floor(Number(bet.amount) * multiplier));
    this.metricsService.recordWin(Number(winAmount));

    this.client.emit('game.bet_won', {
      keycloakId: bet.keycloakId,
      amount: winAmount.toString(),
    });

    this.emitCashedOut({
      betId: bet.id,
      multiplier: multiplier,
      keycloakId: bet.keycloakId,
    });
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
