import { Wallet } from '@rainbow-me/rainbowkit';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

export const farcasterWallet = (): Wallet => ({
    id: 'farcaster-miniapp',
    name: 'Farcaster',
    iconUrl: 'https://warpcast.com/favicon.ico',
    iconBackground: '#855DCD',
    createConnector: (walletDetails) => {
        // farcasterMiniApp returns a generic connector, which RainbowKit can use
        return farcasterMiniApp();
    },
});
