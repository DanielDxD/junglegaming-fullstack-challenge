import { useQuery, useMutation } from '@tanstack/react-query';
import { GameService } from '../services/game';
import { toast } from 'sonner';

const gameService = new GameService();

export const useGetCurrentRound = () => {
  return useQuery({
    queryKey: ['game', 'current-round'],
    queryFn: () => gameService.getCurrentRound(),
  });
};

export const useGetGameHistory = (limit = 20) => {
  return useQuery({
    queryKey: ['game', 'history', limit],
    queryFn: () => gameService.getHistory(limit),
  });
};

export const usePlaceBet = () => {
  return useMutation({
    mutationFn: ({ amount, autoCashoutMultiplier }: { amount: number; autoCashoutMultiplier?: number }) =>
      gameService.placeBet(amount, autoCashoutMultiplier),
    onError: (error: Error) => {
      toast.error(gameService.getErrorMessage(error));
    },
  });
};

export const useCashout = () => {
  return useMutation({
    mutationFn: () => gameService.cashout(),
    onError: (error: Error) => {
      toast.error(gameService.getErrorMessage(error));
    },
  });
};

export const useVerifyRound = () => {
  return useMutation({
    mutationFn: (roundId: string) => gameService.verifyRound(roundId),
    onError: (error: Error) => {
      toast.error(gameService.getErrorMessage(error));
    },
  });
};
