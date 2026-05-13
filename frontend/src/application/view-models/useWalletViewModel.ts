import { create } from 'zustand';
import { Wallet } from '@/domain/entities/wallet';

interface WalletState {
  wallet: Wallet | null;
  setWallet: (wallet: Wallet | null) => void;
}

export const useWalletViewModel = create<WalletState>((set) => ({
  wallet: null,
  setWallet: (wallet: Wallet | null) => {
    set({ wallet });
  }
}));
