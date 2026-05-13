import { Module } from "@nestjs/common";
import { WalletsController } from "./presentation/controllers/wallets.controller";
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { CreateWalletUseCase } from "./application/usecases/create-wallet.usecase";
import { GetWalletUseCase } from "./application/usecases/get-wallet.usecase";
import { WalletRepository } from "./domain/repositories/wallet.repository";
import { PrismaWalletRepository } from "./infrastructure/repositories/prisma-wallet.repository";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { env } from "./config/env";
import { WalletMessageController } from "./presentation/controllers/wallet-message.controller";
import { ReserveFundsUseCase } from "./application/usecases/reserve-funds.usecase";
import { DepositFundsUseCase } from "./application/usecases/deposit-funds.usecase";

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'GAMES_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [env.RABBITMQ_URL],
          queue: 'game_queue',
          queueOptions: {
            durable: true
          },
        },
      },
    ])
  ],
  controllers: [WalletsController, WalletMessageController],
  providers: [
    CreateWalletUseCase,
    GetWalletUseCase,
    ReserveFundsUseCase,
    DepositFundsUseCase,
    {
      provide: WalletRepository,
      useClass: PrismaWalletRepository,
    },
  ],
})
export class AppModule {}
