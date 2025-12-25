'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatEther } from 'viem';

interface MarketProps {
    id: string; // Address
    question: string;
    yesShares: bigint;
    noShares: bigint;
    totalYes: bigint;
    totalNo: bigint;
    endTime: bigint;
    outcome: boolean;
    resolved: boolean;
}

export function MarketCard({ market }: { market: MarketProps }) {
    const totalPool = market.totalYes + market.totalNo;
    const yesProb = totalPool > 0n ? Number((market.totalYes * 100n) / totalPool) : 50;
    const noProb = 100 - yesProb;

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
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                    <div
                        className="bg-green-500 h-full"
                        style={{ width: `${yesProb}%` }}
                    />
                    <div
                        className="bg-red-500 h-full"
                        style={{ width: `${noProb}%` }}
                    />
                </div>
                <p className="mt-4 text-sm text-gray-500">
                    Pool: {formatEther(totalPool)} Tokens
                </p>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline">Buy NO</Button>
                <Button>Buy YES</Button>
            </CardFooter>
        </Card>
    );
}
