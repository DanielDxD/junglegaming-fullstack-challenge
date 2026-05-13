import { Injectable } from "@nestjs/common";
import { BetRepository } from "../../domain/repositories/bet.repository";
import { Bet, BetStatus } from "../../domain/entities/bet.entity";
import { Round, RoundStatus } from "../../domain/entities/round.entity";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PrismaBetRepository implements BetRepository {
  constructor(private readonly prisma: PrismaService) { }

  private mapToDomain(data: any): Bet {
    let round: Round | undefined;
    if (data.round) {
      round = new Round(
        data.round.id,
        data.round.status as RoundStatus,
        data.round.crashPoint ? data.round.crashPoint.toNumber() : null,
        data.round.seed,
        data.round.hash,
        data.round.startedAt,
        data.round.finishedAt,
        data.round.createdAt,
        data.round.updatedAt,
      );
    }

    return new Bet(
      data.id,
      data.roundId,
      data.keycloakId,
      data.amount,
      data.cashoutMultiplier ? data.cashoutMultiplier.toNumber() : null,
      data.autoCashoutMultiplier ? data.autoCashoutMultiplier.toNumber() : null,
      data.status as BetStatus,
      data.createdAt,
      data.updatedAt,
      round,
    );
  }

  async create(bet: Bet): Promise<Bet> {
    const data = await this.prisma.bets.create({
      data: {
        roundId: bet.roundId,
        keycloakId: bet.keycloakId,
        amount: bet.amount,
        cashoutMultiplier: bet.cashoutMultiplier,
        autoCashoutMultiplier: bet.autoCashoutMultiplier,
        status: bet.status,
      },
    });
    return this.mapToDomain(data);
  }

  async update(bet: Bet): Promise<Bet> {
    const data = await this.prisma.bets.update({
      where: { id: bet.id },
      data: {
        status: bet.status,
        cashoutMultiplier: bet.cashoutMultiplier,
        autoCashoutMultiplier: bet.autoCashoutMultiplier,
      },
    });
    return this.mapToDomain(data);
  }

  async findById(id: string): Promise<Bet | null> {
    const data = await this.prisma.bets.findUnique({ where: { id } });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  async findByRoundId(roundId: string): Promise<Bet[]> {
    const data = await this.prisma.bets.findMany({
      where: { roundId },
    });
    return data.map(d => this.mapToDomain(d));
  }

  async findByRoundIdAndKeycloakId(roundId: string, keycloakId: string): Promise<Bet | null> {
    const data = await this.prisma.bets.findFirst({
      where: { roundId, keycloakId },
    });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  async findHistoryByKeycloakId(keycloakId: string, limit: number): Promise<Bet[]> {
    const data = await this.prisma.bets.findMany({
      where: { keycloakId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { round: true },
    });
    return data.map(d => this.mapToDomain(d));
  }
}
