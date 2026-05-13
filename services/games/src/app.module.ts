import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { GamesController } from "./presentation/controllers/games.controller";
import { GamesMessageController } from "./presentation/controllers/games-message.controller";
import { GamesGateway } from "./presentation/gateways/games.gateway";
import { RoundRepository } from "./domain/repositories/round.repository";
import { BetRepository } from "./domain/repositories/bet.repository";
import { PrismaRoundRepository } from "./infrastructure/repositories/prisma-round.repository";
import { PrismaBetRepository } from "./infrastructure/repositories/prisma-bet.repository";
import { ProvablyFairService } from "./domain/services/provably-fair.service";
import { RoundEngineService } from "./application/services/round-engine.service";
import { PlaceBetUseCase } from "./application/usecases/place-bet.usecase";
import { CashoutUseCase } from "./application/usecases/cashout.usecase";
import { ProcessBetResultUseCase } from "./application/usecases/process-bet-result.usecase";
import { PrismaModule } from "./infrastructure/prisma/prisma.module";
import { env } from "./config/env";
import { MetricsService } from "./application/services/metrics.service";

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    ClientsModule.register([
      {
        name: 'WALLET_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [env.RABBITMQ_URL],
          queue: 'wallet_queue',
          queueOptions: {
            durable: true
          },
        },
      },
    ]),
  ],
  controllers: [GamesController, GamesMessageController],
  providers: [
    GamesGateway,
    ProvablyFairService,
    RoundEngineService,
    PlaceBetUseCase,
    CashoutUseCase,
    ProcessBetResultUseCase,
    MetricsService,
    {
      provide: RoundRepository,
      useClass: PrismaRoundRepository,
    },
    {
      provide: BetRepository,
      useClass: PrismaBetRepository,
    },
    {
      provide: 'MULTIPLIER_PROVIDER',
      useFactory: (engine: RoundEngineService) => ({
        getCurrentMultiplier: () => engine.getCurrentMultiplier()
      }),
      inject: [RoundEngineService]
    }
  ],
})
export class AppModule { }
