'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { parseAbiItem } from 'viem';
import MarketFactoryABI from '@/abis/MarketFactory.json';
import PredictionMarketABI from '@/abis/PredictionMarket.json';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;

export interface MarketData {
    address: `0x${string}`;
    question: string;
    yesShares: bigint;
    noShares: bigint;
    totalYes: bigint;
    totalNo: bigint;
    endTime: bigint;
    outcome: boolean;
    resolved: boolean;
}

export function useMarkets() {
    // 1. Get list of market addresses from Factory
    const { data: marketAddressesData } = useReadContract({
        address: FACTORY_ADDRESS,
        abi: MarketFactoryABI.abi,
        functionName: 'getMarkets',
    });
    const marketAddresses = marketAddressesData as `0x${string}`[] | undefined;

    // 2. Prepare contract calls for each market (multicall)
    // We need to fetch details, yesShares, noShares, etc.
    // For simplicity, let's just fetch details and state struct first.
    const marketsContractConfig = {
        abi: PredictionMarketABI.abi,
    };

    const contracts = (marketAddresses as `0x${string}`[] || []).flatMap((addr) => [
        { ...marketsContractConfig, abi: marketsContractConfig.abi as any, address: addr, functionName: 'details' },
        { ...marketsContractConfig, abi: marketsContractConfig.abi as any, address: addr, functionName: 'totalYesShares' },
        { ...marketsContractConfig, abi: marketsContractConfig.abi as any, address: addr, functionName: 'totalNoShares' },
        { ...marketsContractConfig, abi: marketsContractConfig.abi as any, address: addr, functionName: 'outcome' },
        { ...marketsContractConfig, abi: marketsContractConfig.abi as any, address: addr, functionName: 'state' },
    ]);

    const { data: results, isLoading } = useReadContracts({
        contracts: contracts,
    });

    // 3. Parse results into structured MarketData objects
    const markets: MarketData[] = [];

    if (results && marketAddresses) {
        const numFields = 5; // details, totalYes, totalNo, outcome, state
        for (let i = 0; i < marketAddresses.length; i++) {
            const baseIndex = i * numFields;
            const details = results[baseIndex]?.result as any;
            const totalYes = results[baseIndex + 1]?.result as bigint;
            const totalNo = results[baseIndex + 2]?.result as bigint;
            const outcome = results[baseIndex + 3]?.result as boolean;
            const state = results[baseIndex + 4]?.result as number; // Enum

            if (details) {
                markets.push({
                    address: marketAddresses[i] as `0x${string}`,
                    question: details.question,
                    yesShares: 0n, // Individual User shares typically fetched separately
                    noShares: 0n,
                    totalYes: totalYes || 0n,
                    totalNo: totalNo || 0n,
                    endTime: details.endTime,
                    outcome: outcome,
                    resolved: state === 1, // MarketState.RESOLVED
                });
            }
        }
    }

    return { markets, isLoading };
}
