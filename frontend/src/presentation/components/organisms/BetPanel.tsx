import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameViewModel } from '@/application/view-models/useGameViewModel';
import { useWalletViewModel } from '@/application/view-models/useWalletViewModel';
import { useAuth } from 'react-oidc-context';
import { toast } from 'sonner';
import { useSound } from '@/application/hooks/sound';
import { cn } from '@/lib/utils';

export const BetPanel: React.FC = () => {
  const { round, multiplier, placeBet, cashout, bets } = useGameViewModel();
  const fetchWallet = useWalletViewModel(state => state.fetchWallet);
  const auth = useAuth();
  const { play: playCash } = useSound('/audio/cash.mp3', { autoPlay: false, loop: false });

  const [betAmount, setBetAmount] = useState<string>('10.00');
  const [autoCashoutValue, setAutoCashoutValue] = useState<string>('');
  const [isAutoBetEnabled, setIsAutoBetEnabled] = useState(false);
  const [autoBetStrategy, setAutoBetStrategy] = useState<'FIXED' | 'MARTINGALE'>('FIXED');
  const [martingaleMultiplier, setMartingaleMultiplier] = useState<string>('2.0');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [baseBetAmount, setBaseBetAmount] = useState<string>('10.00');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [totalSessionLoss, setTotalSessionLoss] = useState(0);

  const lastRoundId = useRef<string | null>(null);
  const isBettingPhase = round?.status === 'BETTING';
  const isActivePhase = round?.status === 'ACTIVE';

  const userBet = bets.find(b => b.keycloakId === auth.user?.profile.sub);
  const hasPlacedBet = !!userBet;
  const canCashout = hasPlacedBet && userBet.status === 'ACCEPTED' && isActivePhase;

  const handlePlaceBet = async (overrideAmount?: string) => {
    if (!auth.isAuthenticated) {
      auth.signinRedirect();
      return;
    }

    const amountToUse = overrideAmount || betAmount;
    const amountInCents = Math.round(parseFloat(amountToUse) * 100);
    const autoCashoutMult = autoCashoutValue ? parseFloat(autoCashoutValue) : undefined;

    if (isNaN(amountInCents) || amountInCents < 100 || amountInCents > 100000) {
      toast.error('Aposta inválida. Mínimo 1.00, Máximo 1000.00');
      return;
    }

    if (autoCashoutMult !== undefined && (isNaN(autoCashoutMult) || autoCashoutMult < 1.01)) {
      toast.error('Auto Cash Out inválido. Mínimo 1.01x');
      return;
    }

    setIsPlacingBet(true);
    const success = await placeBet(amountInCents, autoCashoutMult);
    setIsPlacingBet(false);

    if (success) {
      fetchWallet();
    }
  };

  const handleAutoBet = async () => {
    const lastRoundBet = bets.find(b => b.keycloakId === auth.user?.profile.sub);

    let nextBetAmount = parseFloat(betAmount);

    if (lastRoundBet) {
      if (lastRoundBet.status === 'LOST') {
        const loss = parseFloat(lastRoundBet.amount) / 100;
        setTotalSessionLoss(prev => prev + loss);

        if (autoBetStrategy === 'MARTINGALE') {
          nextBetAmount = nextBetAmount * parseFloat(martingaleMultiplier);
        }
      } else if (lastRoundBet.status === 'WON') {
        nextBetAmount = parseFloat(baseBetAmount);
      }
    }

    if (stopLoss && totalSessionLoss >= parseFloat(stopLoss)) {
      setIsAutoBetEnabled(false);
      toast.warning('Stop-loss atingido. Auto Bet desativado.');
      return;
    }

    setBetAmount(nextBetAmount.toFixed(2));
    await handlePlaceBet(nextBetAmount.toFixed(2));
  };

  useEffect(() => {
    if (isBettingPhase && isAutoBetEnabled && round?.id !== lastRoundId.current && !hasPlacedBet && !isPlacingBet) {
      lastRoundId.current = round?.id || null;
      handleAutoBet();
    }
  }, [isBettingPhase, isAutoBetEnabled, round?.id, hasPlacedBet]);





  const handleCashout = async () => {
    const success = await cashout();
    if (success) {
      playCash();
      toast.success(`Cash Out com sucesso em ${multiplier.toFixed(2)}x!`);
      fetchWallet();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/4">
            <label className="text-xs text-zinc-400 mb-1 block">Valor da Aposta</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">R$</span>
              <Input
                type="number"
                step="0.10"
                min="1"
                max="1000"
                className="pl-8 bg-zinc-950 border-zinc-800 font-mono text-lg"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                disabled={hasPlacedBet || !isBettingPhase || isPlacingBet}
              />
            </div>
          </div>

          <div className="w-full md:w-1/4">
            <label className="text-xs text-zinc-400 mb-1 block">Auto Cash Out</label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">x</span>
              <Input
                type="number"
                step="0.01"
                min="1.01"
                placeholder="Não definido"
                className="pr-8 bg-zinc-950 border-zinc-800 font-mono text-lg"
                value={autoCashoutValue}
                onChange={(e) => setAutoCashoutValue(e.target.value)}
                disabled={hasPlacedBet || !isBettingPhase || isPlacingBet}
              />
            </div>
          </div>

          <div className="w-full md:w-1/4 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="border-zinc-700 hover:bg-zinc-800"
              onClick={() => setBetAmount((parseFloat(betAmount) / 2).toFixed(2))}
              disabled={hasPlacedBet || !isBettingPhase}
            >
              1/2
            </Button>
            <Button
              variant="outline"
              className="border-zinc-700 hover:bg-zinc-800"
              onClick={() => setBetAmount((parseFloat(betAmount) * 2).toFixed(2))}
              disabled={hasPlacedBet || !isBettingPhase}
            >
              x2
            </Button>
          </div>

          <div className="w-full md:w-1/4">
            {canCashout ? (
              <Button
                className="w-full h-14 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                onClick={handleCashout}
              >
                Cash Out ({(parseFloat(userBet.amount) / 100 * multiplier).toFixed(2)})
              </Button>
            ) : (
              <Button
                className="w-full h-14 text-sm font-bold bg-green-500 hover:bg-green-600 text-zinc-950 transition-all"
                onClick={() => handlePlaceBet()}
                disabled={hasPlacedBet || !isBettingPhase || isPlacingBet}
              >
                {hasPlacedBet ? 'Aposta Registrada' : isBettingPhase ? 'Apostar' : 'Aguarde a próxima rodada'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-zinc-200">Auto Bet</h3>
              <button
                type="button"
                className={cn(
                  "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  isAutoBetEnabled ? "bg-green-600" : "bg-zinc-700"
                )}
                onClick={() => {
                  const newState = !isAutoBetEnabled;
                  setIsAutoBetEnabled(newState);
                  if (newState) {
                    setBaseBetAmount(betAmount);
                    setTotalSessionLoss(0);
                  }
                }}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    isAutoBetEnabled ? "translate-x-4" : "translate-x-0"
                  )}
                />
              </button>
            </div>
            <div className="text-xs text-zinc-500">
              Sessão: <span className={totalSessionLoss > 0 ? "text-red-400" : "text-green-400"}>R$ {totalSessionLoss.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Estratégia</label>
              <div className="flex bg-zinc-950 border border-zinc-800 rounded-md p-1">
                <button
                  className={cn(
                    "flex-1 text-xs py-1.5 rounded transition-all",
                    autoBetStrategy === 'FIXED' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                  )}
                  onClick={() => setAutoBetStrategy('FIXED')}
                >
                  Fixo
                </button>
                <button
                  className={cn(
                    "flex-1 text-xs py-1.5 rounded transition-all",
                    autoBetStrategy === 'MARTINGALE' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                  )}
                  onClick={() => setAutoBetStrategy('MARTINGALE')}
                >
                  Martingale
                </button>
              </div>
            </div>

            {autoBetStrategy === 'MARTINGALE' && (
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Multiplicador na Perda</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">x</span>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    className="pr-8 bg-zinc-950 border-zinc-800 font-mono text-sm"
                    value={martingaleMultiplier}
                    onChange={(e) => setMartingaleMultiplier(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Stop Loss (Limite de Perda)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">R$</span>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="Sem limite"
                  className="pl-8 bg-zinc-950 border-zinc-800 font-mono text-sm"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
