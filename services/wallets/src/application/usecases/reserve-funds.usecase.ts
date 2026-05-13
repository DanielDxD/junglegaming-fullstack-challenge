import { Injectable, Inject } from "@nestjs/common";
import { WalletRepository } from "../../domain/repositories/wallet.repository";
import { ClientProxy } from "@nestjs/microservices";

export interface ReserveFundsInput {
  betId: string;
  keycloakId: string;
  amount: number;
}

@Injectable()
export class ReserveFundsUseCase {
  constructor(
    private readonly walletRepository: WalletRepository,
    @Inject('GAMES_SERVICE') private readonly client: ClientProxy
  ) {}

  async execute(input: ReserveFundsInput): Promise<void> {
    const wallet = await this.walletRepository.findByKeycloakId(input.keycloakId);
    
    if (!wallet) {
      this.client.emit('wallet.bet_rejected', { betId: input.betId, reason: 'WALLET_NOT_FOUND' });
      return;
    }

    const amountBigInt = BigInt(input.amount);

    if (wallet.balance < amountBigInt) {
      this.client.emit('wallet.bet_rejected', { betId: input.betId, reason: 'INSUFFICIENT_FUNDS' });
      return;
    }

    try {
      await this.walletRepository.decrementBalance(input.keycloakId, amountBigInt);
      this.client.emit('wallet.funds_reserved', { betId: input.betId });
    } catch (e) {
      this.client.emit('wallet.bet_rejected', { betId: input.betId, reason: 'INTERNAL_ERROR' });
    }
  }
}
