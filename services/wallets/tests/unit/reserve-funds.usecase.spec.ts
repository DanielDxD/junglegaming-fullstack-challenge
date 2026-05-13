import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { ReserveFundsUseCase } from '../../src/application/usecases/reserve-funds.usecase';
import { Wallet } from '../../src/domain/entities/wallet.entity';

describe('ReserveFundsUseCase', () => {
  let useCase: ReserveFundsUseCase;
  let walletRepository: any;
  let clientProxy: any;

  beforeEach(() => {
    const wallet = new Wallet('1', 'user1', 5000n, new Date(), new Date());
    
    walletRepository = {
      findByKeycloakId: mock(async () => wallet),
      decrementBalance: mock(async () => {}),
    };
    
    clientProxy = {
      emit: mock(() => {}),
    };
    
    useCase = new ReserveFundsUseCase(walletRepository, clientProxy);
  });

  it('should reserve funds successfully', async () => {
    await useCase.execute({ betId: 'bet1', keycloakId: 'user1', amount: 1000 });
    expect(walletRepository.decrementBalance).toHaveBeenCalledWith('user1', 1000n);
    expect(clientProxy.emit).toHaveBeenCalledWith('wallet.funds_reserved', { betId: 'bet1' });
  });

  it('should reject if wallet not found', async () => {
    walletRepository.findByKeycloakId = mock(async () => null);
    await useCase.execute({ betId: 'bet1', keycloakId: 'user1', amount: 1000 });
    expect(clientProxy.emit).toHaveBeenCalledWith('wallet.bet_rejected', { betId: 'bet1', reason: 'WALLET_NOT_FOUND' });
  });

  it('should reject if insufficient funds', async () => {
    await useCase.execute({ betId: 'bet1', keycloakId: 'user1', amount: 6000 });
    expect(clientProxy.emit).toHaveBeenCalledWith('wallet.bet_rejected', { betId: 'bet1', reason: 'INSUFFICIENT_FUNDS' });
  });
});
