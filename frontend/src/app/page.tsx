'use client';

import React, { useEffect } from 'react';
import { GameLayout } from '@/presentation/components/templates/GameLayout';
import { CrashGraph } from '@/presentation/components/organisms/CrashGraph';
import { BetPanel } from '@/presentation/components/organisms/BetPanel';
import { PlayersList } from '@/presentation/components/organisms/PlayersList';
import { HistoryRibbon } from '@/presentation/components/organisms/HistoryRibbon';
import { useGetCurrentRound, useGetGameHistory } from '@/application/hooks/useGame';
import { useGameViewModel } from '@/application/view-models/useGameViewModel';

import { useQueryClient } from '@tanstack/react-query';

export default function Home() {
  const queryClient = useQueryClient();
  const { initialize, cleanup, setInitialData } = useGameViewModel();
  const { data: currentRound, isLoading: isLoadingRound } = useGetCurrentRound();
  const { data: history, isLoading: isLoadingHistory } = useGetGameHistory();

  useEffect(() => {
    if (currentRound !== undefined && history !== undefined) {
      setInitialData({ round: currentRound, history: history || [] });
    }
  }, [currentRound, history, setInitialData]);

  useEffect(() => {
    initialize(queryClient);
    return () => cleanup();
  }, [initialize, cleanup, queryClient]);

  if (isLoadingRound || isLoadingHistory) {
    return (
      <GameLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 font-medium animate-pulse">Carregando jogo...</p>
        </div>
      </GameLayout>
    );
  }

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
