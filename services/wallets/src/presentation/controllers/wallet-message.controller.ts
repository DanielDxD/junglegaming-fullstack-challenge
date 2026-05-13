import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { ReserveFundsUseCase } from "../../application/usecases/reserve-funds.usecase";
import { DepositFundsUseCase } from "../../application/usecases/deposit-funds.usecase";

@Controller()
export class WalletMessageController {
  constructor(
    private readonly reserveFundsUseCase: ReserveFundsUseCase,
    private readonly depositFundsUseCase: DepositFundsUseCase,
  ) {}

  @EventPattern('game.bet_placed')
  async handleBetPlaced(@Payload() data: { betId: string; keycloakId: string; amount: number }) {
    await this.reserveFundsUseCase.execute(data);
  }

  @EventPattern('game.bet_won')
  async handleBetWon(@Payload() data: { keycloakId: string; amount: number }) {
    await this.depositFundsUseCase.execute(data);
  }
}
