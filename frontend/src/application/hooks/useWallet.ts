import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WalletService } from '../services/wallet';

const walletService = new WalletService();

import { AxiosError } from 'axios';

export const useGetWallet = (enabled = true) => {
  const queryClient = useQueryClient();
  const createWalletMutation = useMutation({
    mutationFn: () => walletService.createWallet(),
    onSuccess: (data) => {
      queryClient.setQueryData(['wallet'], data);
    },
  });

  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      try {
        return await walletService.getMyWallet();
      } catch (error: unknown) {
        const err = error as AxiosError;
        if (err?.response?.status === 404) {
          return createWalletMutation.mutateAsync();
        }
        throw error;
      }
    },
    enabled,
  });
};

export const useCreateWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => walletService.createWallet(),
    onSuccess: (data) => {
      queryClient.setQueryData(['wallet'], data);
    },
  });
};
