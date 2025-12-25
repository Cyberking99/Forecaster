'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { MarketCard } from '@/components/MarketCard';
import { parseEther } from 'viem';

// Mock data
const MOCK_MARKETS = [
  {
    id: "0x123...",
    question: "Will Bitcoin hit $100k by end of 2024?",
    yesShares: parseEther("600"),
    noShares: parseEther("400"),
    totalYes: parseEther("600"),
    totalNo: parseEther("400"),
    endTime: 1735689600n,
    outcome: false,
    resolved: false
  },
  {
    id: "0x456...",
    question: "Will Ethereum flip Bitcoin in 2025?",
    yesShares: parseEther("200"),
    noShares: parseEther("800"),
    totalYes: parseEther("200"),
    totalNo: parseEther("800"),
    endTime: 1767225600n,
    outcome: false,
    resolved: false
  }
];

export default function Home() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_MARKETS.map((market, index) => (
            <MarketCard key={index} market={market} />
          ))}
        </div>
      </main>
    </div>
  );
}
