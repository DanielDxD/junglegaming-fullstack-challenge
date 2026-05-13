import { Injectable, NotFoundException } from "@nestjs/common";
import { WalletRepository } from "../../domain/repositories/wallet.repository";
import { Wallet } from "../../domain/entities/wallet.entity";

@Injectable()
export class GetWalletUseCase {
  constructor(private readonly walletRepository: WalletRepository) {}

  async execute(keycloakId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findByKeycloakId(keycloakId);
    
    if (!wallet) {
      throw new NotFoundException("Wallet not found.");
    }

    return wallet;
  }
}
