import { Injectable } from "@nestjs/common";
import { RoundRepository } from "../../domain/repositories/round.repository";
import { Round, RoundStatus } from "../../domain/entities/round.entity";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PrismaRoundRepository implements RoundRepository {
  constructor(private readonly prisma: PrismaService) { }

  private mapToDomain(data: any): Round {
    return new Round(
      data.id,
      data.status as RoundStatus,
      data.crashPoint ? data.crashPoint.toNumber() : null,
      data.seed,
      data.hash,
      data.startedAt,
      data.finishedAt,
      data.createdAt,
      data.updatedAt,
    );
  }

  async create(round: Round): Promise<Round> {
    const data = await this.prisma.rounds.create({
      data: {
        status: round.status,
        crashPoint: round.crashPoint,
        seed: round.seed,
        hash: round.hash,
        startedAt: round.startedAt,
        finishedAt: round.finishedAt,
      },
    });
    return this.mapToDomain(data);
  }

  async update(round: Round): Promise<Round> {
    const data = await this.prisma.rounds.update({
      where: { id: round.id },
      data: {
        status: round.status,
        startedAt: round.startedAt,
        finishedAt: round.finishedAt,
      },
    });
    return this.mapToDomain(data);
  }

  async findById(id: string): Promise<Round | null> {
    const data = await this.prisma.rounds.findUnique({ where: { id } });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  async findCurrent(): Promise<Round | null> {
    const data = await this.prisma.rounds.findFirst({
      where: {
        status: { in: ['PENDING', 'BETTING', 'ACTIVE'] },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  async findHistory(limit: number): Promise<Round[]> {
    const data = await this.prisma.rounds.findMany({
      where: { status: 'FINISHED' },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return data.map(d => this.mapToDomain(d));
  }
}
