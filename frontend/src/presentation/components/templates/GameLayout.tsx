import React from 'react';
import { Header } from '../organisms/Header';

interface GameLayoutProps {
  children: React.ReactNode;
}

export const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
};
