import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from 'react-oidc-context';
import { useGetWallet } from '@/application/hooks/useWallet';
import { useWalletViewModel } from '@/application/view-models/useWalletViewModel';
import { WalletIcon, LogOut, User } from 'lucide-react';

export const Header: React.FC = () => {
  const auth = useAuth();
  const { setWallet } = useWalletViewModel();
  const { data: wallet, isLoading: isLoadingWallet } = useGetWallet(auth.isAuthenticated);

  useEffect(() => {
    if (wallet) {
      setWallet(wallet);
    }
  }, [wallet, setWallet]);

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-gradient-to-tr from-orange-500 to-yellow-500 flex items-center justify-center font-bold text-black">
          J
        </div>
        <span className="font-bold text-lg hidden sm:block text-zinc-100 tracking-tight">Jungle Crash</span>
      </div>

      <div className="flex items-center gap-4">
        {auth.isLoading ? (
          <div className="h-9 w-24 bg-zinc-800 animate-pulse rounded-md"></div>
        ) : auth.isAuthenticated ? (
          <>
            {isLoadingWallet ? (
              <div className="h-8 w-24 bg-zinc-900 border border-zinc-800 animate-pulse rounded-md"></div>
            ) : wallet && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800">
                <WalletIcon className="w-4 h-4 text-green-500" />
                <span className="font-mono text-sm font-bold text-green-400">
                  R$ {(parseFloat(wallet.balance) / 100).toFixed(2)}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 text-sm text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-md">
                <User className="w-4 h-4" />
                {auth.user?.profile.preferred_username || auth.user?.profile.given_name || 'Player'}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  if (auth.user?.id_token) {
                    auth.signoutRedirect({ id_token_hint: auth.user.id_token });
                  } else {
                    auth.removeUser();
                  }
                }}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <Button 
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
            onClick={() => auth.signinRedirect()}
          >
            Entrar
          </Button>
        )}
      </div>
    </header>
  );
};
