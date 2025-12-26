'use client';

import { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { MobileMarketCard } from '@/components/MobileMarketCard';
import { useMarkets } from '@/hooks/useMarkets';
import { sdk } from '@farcaster/miniapp-sdk'
import { Home as HomeIcon, Search, User } from 'lucide-react';
import { useFarcasterUser } from '@/hooks/useFarcasterUser';
import Link from 'next/link';

export default function Home() {
  const { markets, isLoading } = useMarkets();
  const { user } = useFarcasterUser();

  useEffect(() => {
    const init = async () => {
      await sdk.actions.ready();
    };
    init();
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Mobile Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b p-4 flex justify-between items-center">
        <span className="font-bold text-lg"><img src="/icon.png" alt="" className="w-6 h-6" /></span>
        <div className="transform scale-90 origin-right">
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
        </div>
      </header>

      <main className="p-4">
        <h2 className="text-2xl font-bold mb-4">Trending</h2>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <span className="animate-pulse text-gray-400">Loading...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {markets.map((market, index) => (
              <MobileMarketCard key={index} market={market} />
            ))}
            {markets.length === 0 && <p className="text-center text-gray-500">No active markets.</p>}
          </div>
        )}
      </main>

      {/* Bottom Nav Mockup */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around text-gray-500 text-xs">
        <Link href="/" className="flex flex-col items-center text-black font-semibold">
          <HomeIcon className="w-6 h-6 mb-1" />
          <span>Home</span>
        </Link>
        <div className="flex flex-col items-center">
          <Search className="w-6 h-6 mb-1" />
          <span>Search</span>
        </div>
        <Link href="/profile" className="flex flex-col items-center cursor-pointer">
          {user?.pfpUrl ? (
            <img
              src={user.pfpUrl}
              alt={user.username || "Profile"}
              className="w-6 h-6 rounded-full mb-1 object-cover"
            />
          ) : (
            <User className="w-6 h-6 mb-1" />
          )}
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
