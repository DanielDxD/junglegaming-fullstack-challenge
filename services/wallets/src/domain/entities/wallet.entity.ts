export class Wallet {
  constructor(
    public readonly id: string,
    public readonly keycloakId: string,
    public balance: bigint,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) { }

  public static create(keycloakId: string): Wallet {
    return new Wallet(
      '',
      keycloakId,
      100000n,
      new Date(),
      new Date(),
    );
  }
}
