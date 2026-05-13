import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { CashoutUseCase } from '../../src/application/usecases/cashout.usecase';
import { Round } from '../../src/domain/entities/round.entity';
import { Bet } from '../../src/domain/entities/bet.entity';

describe('CashoutUseCase', () => {
  let useCase: CashoutUseCase;
  let betRepository: any;
  let roundRepository: any;
  let clientProxy: any;
  let multiplierProvider: any;
  let roundEngineService: any;

  beforeEach(() => {
    const bet = Bet.create('round1', 'user1', 1000n);
    bet.accept();

    betRepository = {
      update: mock(async (b) => b),
      findByRoundIdAndKeycloakId: mock(async () => bet),
    };

    const round = Round.create('seed', 'hash', 2.0);
    round.startBetting();
    round.start();

    roundRepository = {
      findCurrent: mock(async () => round),
    };

    clientProxy = {
      emit: mock(() => { }),
    };

    multiplierProvider = {
      getCurrentMultiplier: mock(() => 1.50),
    };

    roundEngineService = {
      emitCashedOut: mock(() => {})
    };

    const metricsService = {
      recordBet: mock(() => { }),
      recordWin: mock(() => { }),
    } as any;

    useCase = new CashoutUseCase(betRepository, roundRepository, clientProxy, multiplierProvider, roundEngineService, metricsService);
  });

  it('should cashout successfully', async () => {
    await useCase.execute({ keycloakId: 'user1' });
    expect(betRepository.update).toHaveBeenCalled();
    expect(clientProxy.emit).toHaveBeenCalledWith('game.bet_won', {
      keycloakId: 'user1',
      amount: '1500',
    });
  });

  it('should fail if round already crashed', async () => {
    multiplierProvider.getCurrentMultiplier = mock(() => 2.50);
    expect(useCase.execute({ keycloakId: 'user1' })).rejects.toThrow('Round already crashed');
  });
});
