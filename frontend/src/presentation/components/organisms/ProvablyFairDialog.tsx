import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useVerifyRound } from '@/application/hooks/useGame';
import { VerifyRoundResult } from '@/domain/entities/round';
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProvablyFairDialogProps {
  roundId?: string;
  trigger: React.ReactNode;
}

export const ProvablyFairDialog: React.FC<ProvablyFairDialogProps> = ({ roundId, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<VerifyRoundResult | null>(null);
  const verifyMutation = useVerifyRound();

  const verify = () => {
    if (!roundId) return;

    verifyMutation.mutate(roundId, {
      onSuccess: (data) => {
        setResult(data);
      }
    });
  };

  const isLoading = verifyMutation.isPending;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = verifyMutation.error ? (verifyMutation.error as any).response?.data?.message || "Erro ao verificar rodada" : null;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && roundId && !result && !isLoading) {
      verify();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger className="p-0 border-none bg-transparent">
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            Provably Fair 🔐
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Verifique se o crash point desta rodada foi justo e inalterado.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!roundId ? (
            <div className="text-zinc-500 text-center py-4 text-sm">
              Esta rodada não pode ser verificada (não possui ID).
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm">Verificando hash criptográfico...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-6 text-red-400 gap-2">
              <ShieldAlert className="w-8 h-8" />
              <p className="text-sm text-center">{error}</p>
              <Button variant="outline" size="sm" onClick={verify} className="mt-2 text-zinc-100">
                Tentar Novamente
              </Button>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg space-y-3">

                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Server Seed</label>
                  <p className="font-mono text-xs text-zinc-300 break-all bg-zinc-950 p-2 rounded mt-1 border border-zinc-800/50">
                    {result.seed}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Hash SHA-256</label>
                  <p className="font-mono text-xs text-zinc-300 break-all bg-zinc-950 p-2 rounded mt-1 border border-zinc-800/50">
                    {result.hash}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50 mt-4">
                  <span className="text-sm text-zinc-400">Crash Point Calculado:</span>
                  <span className={cn("font-mono font-bold text-lg", result.crashPoint && result.crashPoint >= 2.0 ? "text-green-500" : "text-red-500")}>
                    {result.crashPoint?.toFixed(2)}x
                  </span>
                </div>
              </div>

              <div className={cn(
                "flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-bold border",
                result.isValid
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              )}>
                {result.isValid ? (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Rodada 100% Justa
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5" />
                    Incompatibilidade Detectada!
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
