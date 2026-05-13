import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGameViewModel } from '@/application/view-models/useGameViewModel';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export const PlayersList: React.FC = () => {
  const { bets, round } = useGameViewModel();

  const activeBets = bets.filter(b => b.roundId === round?.id || !b.roundId); 

  return (
    <Card className="bg-zinc-900 border-zinc-800 flex flex-col h-full">
      <CardHeader className="py-4 border-b border-zinc-800">
        <CardTitle className="text-sm font-medium flex justify-between items-center text-zinc-300">
          <span>Apostas da Rodada</span>
          <Badge variant="secondary" className="bg-zinc-800">{activeBets.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-[300px] md:h-full w-full">
          <div className="flex flex-col">
            {activeBets.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                Nenhuma aposta registrada
              </div>
            ) : (
              activeBets.map((bet, idx) => {
                const isWon = bet.status === 'WON';
                const isLost = bet.status === 'LOST';
                
                return (
                  <div 
                    key={bet.id || idx} 
                    className={cn(
                      "flex items-center justify-between p-3 border-b border-zinc-800/50 text-sm transition-colors",
                      isWon && "bg-green-500/10",
                      isLost && "opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={cn(
                        "font-medium truncate max-w-[100px] md:max-w-[150px]",
                        isWon ? "text-green-400" : "text-zinc-300"
                      )}>
                        {bet.username || bet.keycloakId.substring(0, 8) + '...'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {isWon && bet.cashoutMultiplier && (
                        <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-transparent font-mono">
                          {bet.cashoutMultiplier.toFixed(2)}x
                        </Badge>
                      )}
                      <span className={cn(
                        "font-mono whitespace-nowrap",
                        isWon ? "text-green-400 font-bold" : "text-zinc-400"
                      )}>
                        R$ {(parseFloat(bet.amount) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
