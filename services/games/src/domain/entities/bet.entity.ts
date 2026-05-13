import { Round } from './round.entity';

export type BetStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WON' | 'LOST';

export class Bet {
  constructor(
    public readonly id: string,
    public readonly roundId: string,
    public readonly keycloakId: string,
    public readonly amount: bigint,
    public cashoutMultiplier: number | null,
    public autoCashoutMultiplier: number | null,
    public status: BetStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public round?: Round,
  ) {}

  public static create(roundId: string, keycloakId: string, amount: bigint, autoCashoutMultiplier: number | null = null): Bet {
    return new Bet(
      '',
      roundId,
      keycloakId,
      amount,
      null,
      autoCashoutMultiplier,
      'PENDING',
      new Date(),
      new Date(),
    );
  }

  public accept(): void {
    if (this.status !== 'PENDING') throw new Error('Bet is not PENDING');
    this.status = 'ACCEPTED';
  }

  public reject(): void {
    if (this.status !== 'PENDING') throw new Error('Bet is not PENDING');
    this.status = 'REJECTED';
  }

  public cashout(multiplier: number): void {
    if (this.status !== 'ACCEPTED') throw new Error('Bet is not ACCEPTED');
    this.cashoutMultiplier = multiplier;
    this.status = 'WON';
  }

  public lose(): void {
    if (this.status !== 'ACCEPTED') throw new Error('Bet is not ACCEPTED');
    this.status = 'LOST';
  }
}
