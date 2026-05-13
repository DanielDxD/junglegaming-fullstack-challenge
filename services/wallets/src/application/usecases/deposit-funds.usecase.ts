import { Injectable } from "@nestjs/common";
import { WalletRepository } from "../../domain/repositories/wallet.repository";

export interface DepositFundsInput {
  keycloakId: string;
  amount: number;
}

@Injectable()
export class DepositFundsUseCase {
  constructor(private readonly walletRepository: WalletRepository) {}

  async execute(input: DepositFundsInput): Promise<void> {
    const amountBigInt = BigInt(Math.floor(input.amount));
    
    if (amountBigInt > 0n) {
      await this.walletRepository.incrementBalance(input.keycloakId, amountBigInt);
    }
  }
}
