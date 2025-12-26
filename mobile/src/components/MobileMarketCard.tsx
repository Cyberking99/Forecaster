import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerTrigger, DrawerClose } from '@/components/ui/drawer';
import { formatUnits, parseUnits, erc20Abi } from 'viem';
import { MarketData } from '@/hooks/useMarkets';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import PredictionMarketABI from '@/abis/PredictionMarket.json';

export function MobileMarketCard({ market }: { market: MarketData }) {
    const { address } = useAccount();
    const [amount, setAmount] = useState('');
    const [selectedOutcome, setSelectedOutcome] = useState<boolean | null>(null);
    const totalPool = market.totalYes + market.totalNo;
    const yesProb = totalPool > 0n ? Number((market.totalYes * 100n) / totalPool) : 50;
    const noProb = 100 - yesProb;

    // Buying hooks
    const { writeContract: writeBuy, data: buyHash, isPending: isBuyPending } = useWriteContract();
    const { isLoading: isBuyConfirming, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({ hash: buyHash });

    // Approval hooks
    const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending } = useWriteContract();
    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: market.collateralToken,
        abi: erc20Abi,
        functionName: 'allowance',
        args: address ? [address, market.address] : undefined,
    });

    const parsedAmount = amount ? parseUnits(amount, 6) : 0n;
    const needsApproval = (allowance ?? 0n) < parsedAmount;

    useEffect(() => {
        if (isApproveSuccess) {
            refetchAllowance();
        }
    }, [isApproveSuccess, refetchAllowance]);

    const handleApprove = () => {
        if (!amount) return;
        writeApprove({
            address: market.collateralToken,
            abi: erc20Abi,
            functionName: 'approve',
            args: [market.address, parseUnits(amount, 6)],
        });
    };

    const handleBuy = () => {
        if (!amount || selectedOutcome === null) return;
        writeBuy({
            address: market.address,
            abi: PredictionMarketABI.abi,
            functionName: 'buyShares',
            args: [selectedOutcome, parseUnits(amount, 6)],
        });
    };

    return (
        <Card className="mb-4 shadow-sm active:scale-[0.98] transition-transform">
            <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 leading-tight">{market.question}</h3>

                <div className="flex gap-2 mb-3">
                    <div className="text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded">YES {yesProb}%</div>
                    <div className="text-red-600 font-bold text-sm bg-red-50 px-2 py-1 rounded">NO {noProb}%</div>
                </div>

                <Drawer>
                    <DrawerTrigger asChild>
                        <Button className="w-full" size="lg">Predict</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Place your prediction</DrawerTitle>
                        </DrawerHeader>
                        <div className="p-4 space-y-4">
                            <p className="font-medium text-gray-700">{market.question}</p>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant={selectedOutcome === true ? "default" : "outline"}
                                    className={selectedOutcome === true ? "bg-green-600 hover:bg-green-700" : "border-green-600 text-green-600"}
                                    onClick={() => setSelectedOutcome(true)}
                                >
                                    YES ({yesProb}%)
                                </Button>
                                <Button
                                    variant={selectedOutcome === false ? "default" : "outline"}
                                    className={selectedOutcome === false ? "bg-red-600 hover:bg-red-700" : "border-red-600 text-red-600"}
                                    onClick={() => setSelectedOutcome(false)}
                                >
                                    NO ({noProb}%)
                                </Button>
                            </div>

                            <Input
                                type="number"
                                placeholder="Amount (USDC)"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-lg py-6"
                            />

                            {/* Status Messages */}
                            {approveHash && <div className="text-xs text-blue-500 truncate">Approve Tx: {approveHash}</div>}
                            {isApproveConfirming && <div className="text-xs text-orange-500">Approving...</div>}
                            {isApproveSuccess && <div className="text-xs text-green-500">Approved!</div>}

                            {buyHash && <div className="text-xs text-blue-500 truncate">Buy Tx: {buyHash}</div>}
                            {isBuyConfirming && <div className="text-xs text-orange-500">Confirming Buy...</div>}
                            {isBuySuccess && <div className="text-xs text-green-500">Prediction Placed!</div>}

                            {needsApproval ? (
                                <Button
                                    className="w-full py-6 text-lg"
                                    onClick={handleApprove}
                                    disabled={!amount || isApprovePending || isApproveConfirming}
                                >
                                    {isApprovePending || isApproveConfirming ? "Approving..." : "Approve USDC"}
                                </Button>
                            ) : (
                                <Button
                                    className="w-full py-6 text-lg"
                                    onClick={handleBuy}
                                    disabled={!amount || selectedOutcome === null || isBuyPending || isBuyConfirming}
                                >
                                    {isBuyPending || isBuyConfirming ? "Confirming..." : "Swipe to Buy (Tap)"}
                                </Button>
                            )}
                        </div>
                        <DrawerFooter>
                            <DrawerClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </CardContent>
        </Card>
    );
}
