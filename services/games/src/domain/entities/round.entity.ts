export type RoundStatus = 'PENDING' | 'BETTING' | 'ACTIVE' | 'FINISHED';

export class Round {
  constructor(
    public readonly id: string,
    public status: RoundStatus,
    public readonly crashPoint: number | null,
    public readonly seed: string,
    public readonly hash: string,
    public startedAt: Date | null,
    public finishedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  public static create(seed: string, hash: string, crashPoint: number): Round {
    return new Round(
      '',
      'PENDING',
      crashPoint,
      seed,
      hash,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  public startBetting(): void {
    if (this.status !== 'PENDING') throw new Error('Round must be in PENDING state to start betting');
    this.status = 'BETTING';
  }

  public start(): void {
    if (this.status !== 'BETTING') throw new Error('Round must be in BETTING state to start');
    this.status = 'ACTIVE';
    this.startedAt = new Date();
  }

  public finish(): void {
    if (this.status !== 'ACTIVE') throw new Error('Round must be in ACTIVE state to finish');
    this.status = 'FINISHED';
    this.finishedAt = new Date();
  }
}
