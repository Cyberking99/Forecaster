'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatEther, parseEther } from 'viem';
import { MarketData } from '@/hooks/useMarkets';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import PredictionMarketABI from '@/abis/PredictionMarket.json';

export function MarketCard({ market }: { market: MarketData }) {
    const [amount, setAmount] = useState('');
    const totalPool = market.totalYes + market.totalNo;
    const yesProb = totalPool > 0n ? Number((market.totalYes * 100n) / totalPool) : 50;
    const noProb = 100 - yesProb;

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleBuy = (isYes: boolean) => {
        if (!amount) return;
        writeContract({
            address: market.address,
            abi: PredictionMarketABI.abi,
            functionName: 'buyShares',
            args: [isYes, parseEther(amount)],
        });
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle className="text-xl">{market.question}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between mb-4">
                    <div className="text-green-600 font-bold">YES: {yesProb}%</div>
                    <div className="text-red-600 font-bold">NO: {noProb}%</div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex mb-4">
                    <div
                        className="bg-green-500 h-full"
                        style={{ width: `${yesProb}%` }}
                    />
                    <div
                        className="bg-red-500 h-full"
                        style={{ width: `${noProb}%` }}
                    />
                </div>
                <p className="mb-4 text-sm text-gray-500">
                    Pool: {formatEther(totalPool)} Tokens
                </p>

                <div className="flex gap-2 items-center">
                    <Input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                {hash && <div className="text-xs text-blue-500 mt-2 truncate">Tx: {hash}</div>}
                {isConfirming && <div className="text-xs text-orange-500">Confirming...</div>}
                {isSuccess && <div className="text-xs text-green-500">Transaction Confirmed!</div>}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
                <Button
                    variant="outline"
                    className="w-full border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => handleBuy(false)}
                    disabled={isPending || isConfirming}
                >
                    Buy NO
                </Button>
                <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleBuy(true)}
                    disabled={isPending || isConfirming}
                >
                    Buy YES
                </Button>
            </CardFooter>
        </Card>
    );
}
