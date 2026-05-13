import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { PlaceBetUseCase } from '../../src/application/usecases/place-bet.usecase';
import { Round } from '../../src/domain/entities/round.entity';

describe('PlaceBetUseCase', () => {
  let useCase: PlaceBetUseCase;
  let betRepository: any;
  let roundRepository: any;
  let clientProxy: any;

  beforeEach(() => {
    betRepository = {
      create: mock(async (b) => b),
      findByRoundIdAndKeycloakId: mock(async () => null),
    };
    roundRepository = {
      findCurrent: mock(async () => {
        const round = Round.create('seed', 'hash', 2.0);
        round.startBetting();
        return round;
      }),
    };
    clientProxy = {
      emit: mock(() => {}),
    };
    const metricsService = {
      recordBet: mock(() => {}),
      recordWin: mock(() => {}),
    } as any;

    useCase = new PlaceBetUseCase(betRepository, roundRepository, clientProxy, metricsService);
  });

  it('should place a bet successfully', async () => {
    const bet = await useCase.execute({ keycloakId: 'user1', amount: 1000 });
    expect(bet.amount).toBe(1000n);
    expect(clientProxy.emit).toHaveBeenCalled();
  });

  it('should fail if amount is less than 1.00 (100 cents)', async () => {
    expect(useCase.execute({ keycloakId: 'user1', amount: 50 })).rejects.toThrow('Minimum bet is 1.00');
  });

  it('should fail if round is not in BETTING state', async () => {
    roundRepository.findCurrent = mock(async () => Round.create('seed', 'hash', 2.0));
    expect(useCase.execute({ keycloakId: 'user1', amount: 1000 })).rejects.toThrow('Bets are closed for this round');
  });
});
