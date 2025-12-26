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
    foundry
} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

const { wallets } = getDefaultWallets();

const projectId = process.env.NEXT_PUBLIC_REOWN_APP_ID as string;

const config = getDefaultConfig({
    appName: 'Forecaster',
    projectId: projectId,
    wallets: wallets,
    chains: [
        foundry,
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
