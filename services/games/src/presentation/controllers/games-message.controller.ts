import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { ProcessBetResultUseCase } from "../../application/usecases/process-bet-result.usecase";

@Controller()
export class GamesMessageController {
  constructor(private readonly processBetResultUseCase: ProcessBetResultUseCase) {}

  @EventPattern('wallet.funds_reserved')
  async handleFundsReserved(@Payload() data: { betId: string }) {
    await this.processBetResultUseCase.execute({
      betId: data.betId,
      status: 'ACCEPTED'
    });
  }

  @EventPattern('wallet.bet_rejected')
  async handleBetRejected(@Payload() data: { betId: string; reason: string }) {
    await this.processBetResultUseCase.execute({
      betId: data.betId,
      status: 'REJECTED',
      reason: data.reason
    });
  }
}
