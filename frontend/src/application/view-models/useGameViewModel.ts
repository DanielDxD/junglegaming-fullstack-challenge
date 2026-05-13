import { create } from 'zustand';
import { GameService } from '../services/game';
import { socketClient } from '@/infrastructure/socket';
import { Round, CrashPoint } from '@/domain/entities/round';
import { PlayerBet } from '@/domain/entities/bet';
import { useWalletViewModel } from './useWalletViewModel';
import { toast } from 'sonner';

interface GameState {
  round: Round | null;
  multiplier: number;
  bets: PlayerBet[];
  history: CrashPoint[];
  isLoading: boolean;
  error: string | null;

  initialize: () => void;
  cleanup: () => void;
  placeBet: (amount: number, autoCashoutMultiplier?: number) => Promise<boolean>;
  cashout: () => Promise<boolean>;
}

const gameService = new GameService();

export const useGameViewModel = create<GameState>((set, get) => ({
  round: null,
  multiplier: 1.0,
  bets: [],
  history: [],
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const currentRound = await gameService.getCurrentRound();
      const history = await gameService.getHistory(20);

      if (currentRound) {
        set({
          round: {
            id: currentRound.id,
            status: currentRound.status,
            hash: currentRound.hash,
            startedAt: currentRound.startedAt,
            finishedAt: null,
          },
          bets: currentRound.bets || [],
        });
      }

      set({ history: history || [], isLoading: false });
      const socket = socketClient.connect();

      socket.on('round.started', (data: { roundId: string }) => {
        set((state) => ({
          round: state.round ? { ...state.round, status: 'ACTIVE', id: data.roundId } : null,
          multiplier: 1.0
        }));
      });

      socket.on('round.betting', (data: { roundId: string, hash: string }) => {
        set({
          round: {
            id: data.roundId,
            hash: data.hash,
            status: 'BETTING',
            startedAt: new Date().toISOString(),
            finishedAt: null
          },
          multiplier: 1.0,
          bets: []
        });
      });

      socket.on('round.multiplier_update', (data: { multiplier: number }) => {
        set({ multiplier: data.multiplier });
      });

      socket.on('bet.placed', (data: { bet: PlayerBet }) => {
        const { bets } = get();
        if (!bets.find(b => b.id === data.bet.id)) {
          set({ bets: [...bets, data.bet] });
        }

        if (data.bet.keycloakId === useWalletViewModel.getState().wallet?.keycloakId) {
          toast.success('Aposta realizada com sucesso!');
          useWalletViewModel.getState().fetchWallet();
        }
      });

      socket.on('bet.rejected', (data: { betId: string; keycloakId: string; reason: string }) => {
        if (data.keycloakId === useWalletViewModel.getState().wallet?.keycloakId) {
          if (data.reason === 'INSUFFICIENT_FUNDS') {
            toast.error('Saldo insuficiente para realizar esta aposta.');
          } else {
            toast.error('Aposta rejeitada. Motivo: ' + data.reason);
          }
        }
        
        // Remove the pending bet from the list
        const { bets } = get();
        set({ bets: bets.filter(b => b.id !== data.betId) });
      });

      socket.on('bet.cashed_out', (data: { betId: string; multiplier: number; keycloakId: string }) => {
        const { bets } = get();
        set({
          bets: bets.map(b =>
            b.id === data.betId || b.keycloakId === data.keycloakId
              ? { ...b, status: 'WON', cashoutMultiplier: data.multiplier }
              : b
          )
        });

        if (data.keycloakId === useWalletViewModel.getState().wallet?.keycloakId) {
          useWalletViewModel.getState().fetchWallet();
        }
      });

      socket.on('round.crashed', (data: { crashPoint: number; seed: string; roundId: string }) => {
        const { round, history } = get();
        if (round && round.id === data.roundId) {
          set({
            round: { ...round, status: 'FINISHED', crashPoint: data.crashPoint, seed: data.seed },
            multiplier: data.crashPoint,
            history: [{ hash: round.hash, crashPoint: data.crashPoint, seed: data.seed }, ...history].slice(0, 20)
          });
        }
      });

    } catch (error: unknown) {
      set({ error: gameService.getErrorMessage(error as Error), isLoading: false });
    }
  },

  cleanup: () => {
    const socket = socketClient.getSocket();
    if (socket) {
      socket.off('round.started');
      socket.off('round.betting');
      socket.off('round.multiplier_update');
      socket.off('bet.placed');
      socket.off('bet.rejected');
      socket.off('bet.cashed_out');
      socket.off('round.crashed');
    }
  },

  placeBet: async (amount: number, autoCashoutMultiplier?: number) => {
    set({ error: null });
    try {
      await gameService.placeBet(amount, autoCashoutMultiplier);
      return true;
    } catch (error: unknown) {
      set({ error: gameService.getErrorMessage(error as Error) });
      return false;
    }
  },

  cashout: async () => {
    set({ error: null });
    try {
      await gameService.cashout();
      return true;
    } catch (error: unknown) {
      set({ error: gameService.getErrorMessage(error as Error) });
      return false;
    }
  }
}));
