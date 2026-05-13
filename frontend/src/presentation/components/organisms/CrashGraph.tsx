import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useGameViewModel } from '@/application/view-models/useGameViewModel';
import { cn } from '@/lib/utils';
import { useSound } from '@/application/hooks/sound';

export const CrashGraph: React.FC = () => {
  const { multiplier, round } = useGameViewModel();
  const { play: playAlert } = useSound('/audio/alert.mp3', { autoPlay: false, loop: false });
  
  const [timeLeft, setTimeLeft] = useState(5.0);

  const isCrashed = round?.status === 'FINISHED';
  const isBetting = round?.status === 'BETTING';

  useEffect(() => {
    if (isBetting) {
      playAlert();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(5.0);
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isBetting, playAlert]);

  return (
    <Card className="flex flex-col items-center justify-center h-64 md:h-96 bg-zinc-950 border-zinc-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="z-10 text-center">
        {isBetting ? (
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl font-semibold mb-1 text-zinc-300">Preparando Rodada</span>
            <span className="text-4xl font-mono font-bold text-orange-500 mb-4">{timeLeft.toFixed(1)}s</span>
            
            <div className="w-48 md:w-64 h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-orange-500 transition-all duration-100 ease-linear" 
                style={{ width: `${(timeLeft / 5.0) * 100}%` }}
              />
            </div>

            {round?.hash && (
              <span className="text-xs font-mono text-zinc-600 bg-zinc-900 px-2 py-1 rounded">
                Hash: {round.hash.substring(0, 16)}...
              </span>
            )}
          </div>
        ) : (
          <h1
            className={cn(
              "text-6xl md:text-8xl font-black font-mono transition-colors duration-200",
              isCrashed ? "text-red-500" : "text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]"
            )}
          >
            {multiplier.toFixed(2)}x
          </h1>
        )}

        {isCrashed && (
          <div className="mt-4 text-red-500 text-xl font-bold animate-bounce">
            CRASHED!
          </div>
        )}
      </div>

      {!isBetting && !isCrashed && (
        <svg className="absolute bottom-0 left-0 w-full h-full pointer-events-none opacity-50" preserveAspectRatio="none">
           <path d="M0,400 Q200,400 400,200 T800,0" fill="none" stroke="currentColor" strokeWidth="4" className="text-green-500" />
        </svg>
      )}

      <div className="absolute top-4 right-4 z-20 text-right opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-[10px] text-zinc-500">Transparência do Algoritmo</p>
        <p className="text-[10px] text-zinc-400 font-mono">f(t) = e^(0.00006 * t)</p>
        <p className="text-[8px] text-zinc-600 max-w-[120px]">O multiplicador cresce exponencialmente com base no tempo decorrido (ms).</p>
      </div>
    </Card>
  );
};
