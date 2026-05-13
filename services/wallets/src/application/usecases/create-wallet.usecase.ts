import { Injectable, ConflictException } from "@nestjs/common";
import { WalletRepository } from "../../domain/repositories/wallet.repository";
import { Wallet } from "../../domain/entities/wallet.entity";

@Injectable()
export class CreateWalletUseCase {
  constructor(private readonly walletRepository: WalletRepository) {}

  async execute(keycloakId: string): Promise<Wallet> {
    const existingWallet = await this.walletRepository.findByKeycloakId(keycloakId);
    
    if (existingWallet) {
      throw new ConflictException("Wallet already exists for this user.");
    }

    const newWallet = Wallet.create(keycloakId);
    return this.walletRepository.create(newWallet);
  }
}
