import { Injectable } from "@nestjs/common";
import { WalletRepository } from "../../domain/repositories/wallet.repository";
import { Wallet } from "../../domain/entities/wallet.entity";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PrismaWalletRepository implements WalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(wallet: Wallet): Promise<Wallet> {
    const data = await this.prisma.wallets.create({
      data: {
        keycloakId: wallet.keycloakId,
        balance: wallet.balance,
      },
    });

    return new Wallet(
      data.id,
      data.keycloakId,
      data.balance,
      data.createdAt,
      data.updatedAt,
    );
  }

  async findByKeycloakId(keycloakId: string): Promise<Wallet | null> {
    const data = await this.prisma.wallets.findUnique({
      where: { keycloakId },
    });

    if (!data) return null;

    return new Wallet(
      data.id,
      data.keycloakId,
      data.balance,
      data.createdAt,
      data.updatedAt,
    );
  }
  async incrementBalance(keycloakId: string, amount: bigint): Promise<Wallet> {
    const data = await this.prisma.wallets.update({
      where: { keycloakId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    return new Wallet(
      data.id,
      data.keycloakId,
      data.balance,
      data.createdAt,
      data.updatedAt,
    );
  }

  async decrementBalance(keycloakId: string, amount: bigint): Promise<Wallet> {
    const data = await this.prisma.wallets.update({
      where: { keycloakId },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    return new Wallet(
      data.id,
      data.keycloakId,
      data.balance,
      data.createdAt,
      data.updatedAt,
    );
  }
}
