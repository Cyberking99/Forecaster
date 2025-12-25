'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { MarketCard } from '@/components/MarketCard';
import { useMarkets } from '@/hooks/useMarkets';

export default function Home() {
  const { markets, isLoading } = useMarkets();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="p-4 bg-white border-b shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Forecaster
        </h1>
        <ConnectButton />
      </header>

      <main className="flex-1 container mx-auto p-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Active Markets</h2>
          <p className="text-gray-500">Predict the future and win.</p>
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading markets...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.length === 0 ? (
              <p>No markets found.</p>
            ) : (
              markets.map((market, index) => (
                <MarketCard key={index} market={market} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
