import { create } from 'zustand';
import { WalletService } from '../services/wallet';
import { Wallet } from '@/domain/entities/wallet';
import { AxiosError } from 'axios';

interface WalletState {
  wallet: Wallet | null;
  isLoading: boolean;
  error: string | null;
  fetchWallet: () => Promise<void>;
  createWallet: () => Promise<void>;
  setWallet: (wallet: Wallet) => void;
}

const walletService = new WalletService();

export const useWalletViewModel = create<WalletState>((set, get) => ({
  wallet: null,
  isLoading: false,
  error: null,

  fetchWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await walletService.getMyWallet();
      set({ wallet: data, isLoading: false });
    } catch (error: unknown) {
      const err = error as AxiosError;
      if (err?.response?.status === 404) {
        await get().createWallet();
      } else {
        set({ error: walletService.getErrorMessage(err), isLoading: false });
      }
    }
  },

  createWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await walletService.createWallet();
      set({ wallet: data, isLoading: false });
    } catch (error: unknown) {
      set({ error: walletService.getErrorMessage(error as Error), isLoading: false });
    }
  },

  setWallet: (wallet: Wallet) => {
    set({ wallet });
  }
}));
