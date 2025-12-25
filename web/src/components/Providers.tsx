'use client';

import '@rainbow-me/rainbowkit/styles.css';
import * as React from 'react';
import {
    RainbowKitProvider,
    getDefaultWallets,
    getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import {
    base,
    baseSepolia,
    polygon,
    arbitrum,
    mainnet,
} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

const { wallets } = getDefaultWallets();

const config = getDefaultConfig({
    appName: 'Forecaster',
    projectId: 'YOUR_PROJECT_ID', // TODO: User needs to provide WalletConnect Project ID or we leave placeholder
    wallets: wallets,
    chains: [
        base,
        baseSepolia,
        mainnet,
        polygon,
        arbitrum,
    ],
    ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
