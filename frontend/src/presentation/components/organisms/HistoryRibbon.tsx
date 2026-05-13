import React from 'react';
import { useGameViewModel } from '@/application/view-models/useGameViewModel';
import { HistoryPill } from '../molecules/HistoryPill';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export const HistoryRibbon: React.FC = () => {
  const { history } = useGameViewModel();

  return (
    <ScrollArea className="w-full whitespace-nowrap pb-2">
      <div className="flex w-max space-x-2 p-1">
        {history.map((h, i) => (
          <HistoryPill key={h.hash || i} roundId={h.id} multiplier={h.crashPoint || 1.0} />
        ))}
        {history.length === 0 && (
          <span className="text-zinc-500 text-xs py-1">Nenhum histórico recente</span>
        )}
      </div>
      <ScrollBar orientation="horizontal" className="h-1.5" />
    </ScrollArea>
  );
};
