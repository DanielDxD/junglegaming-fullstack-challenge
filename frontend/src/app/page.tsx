'use client';

import React, { useEffect } from 'react';
import { GameLayout } from '@/presentation/components/templates/GameLayout';
import { CrashGraph } from '@/presentation/components/organisms/CrashGraph';
import { BetPanel } from '@/presentation/components/organisms/BetPanel';
import { PlayersList } from '@/presentation/components/organisms/PlayersList';
import { HistoryRibbon } from '@/presentation/components/organisms/HistoryRibbon';
import { useGameViewModel } from '@/application/view-models/useGameViewModel';

export default function Home() {
  const { initialize, cleanup } = useGameViewModel();

  useEffect(() => {
    initialize();
    return () => cleanup();
  }, [initialize, cleanup]);

  return (
    <GameLayout>
      <div className="flex flex-col gap-6">
        <div className="w-full">
          <HistoryRibbon />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="hidden lg:block lg:col-span-1 h-full">
            <PlayersList />
          </div>
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
              <CrashGraph />
            </div>
            
            <BetPanel />
          
            <div className="block lg:hidden mt-4">
              <PlayersList />
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
