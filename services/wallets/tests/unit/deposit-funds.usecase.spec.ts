import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { DepositFundsUseCase } from '../../src/application/usecases/deposit-funds.usecase';

describe('DepositFundsUseCase', () => {
  let useCase: DepositFundsUseCase;
  let walletRepository: any;

  beforeEach(() => {
    walletRepository = {
      incrementBalance: mock(async () => {}),
    };
    useCase = new DepositFundsUseCase(walletRepository);
  });

  it('should deposit funds successfully', async () => {
    await useCase.execute({ keycloakId: 'user1', amount: 1500 });
    expect(walletRepository.incrementBalance).toHaveBeenCalledWith('user1', 1500n);
  });

  it('should not deposit if amount is zero or negative', async () => {
    await useCase.execute({ keycloakId: 'user1', amount: 0 });
    expect(walletRepository.incrementBalance).not.toHaveBeenCalled();
    
    await useCase.execute({ keycloakId: 'user1', amount: -500 });
    expect(walletRepository.incrementBalance).not.toHaveBeenCalled();
  });
});
