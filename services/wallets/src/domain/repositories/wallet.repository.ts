import { Wallet } from "../entities/wallet.entity";

export abstract class WalletRepository {
  abstract create(wallet: Wallet): Promise<Wallet>;
  abstract findByKeycloakId(keycloakId: string): Promise<Wallet | null>;
  abstract incrementBalance(keycloakId: string, amount: bigint): Promise<Wallet>;
  abstract decrementBalance(keycloakId: string, amount: bigint): Promise<Wallet>;
}
