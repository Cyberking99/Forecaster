// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {console} from "forge-std/console.sol";

contract PredictionMarket {
    enum MarketState {
        OPEN,
        RESOLVED,
        CACELLED
    }

    struct MarketDetails {
        string question;
        string description;
        uint256 endTime;
        address creator;
        address oracle; // The AI agent
        IERC20 collateralToken;
    }

    MarketState public state;
    MarketDetails public details;
    bool public outcome; // true = YES, false = NO

    // Shares balance
    mapping(address => uint256) public yesShares;
    mapping(address => uint256) public noShares;

    // Total Supply of shares (Not strictly ERC20 for simplicity in this MVP version)
    uint256 public totalYesShares;
    uint256 public totalNoShares;

    event MarketResolved(bool outcome);
    event SharesPurchased(address indexed buyer, bool isYes, uint256 amount, uint256 cost);
    event WinningsClaimed(address indexed user, uint256 amount);

    constructor(
        string memory _question,
        string memory _description,
        uint256 _duration,
        address _oracle,
        address _collateralToken
    ) {
        details.question = _question;
        details.description = _description;
        details.endTime = block.timestamp + _duration;
        details.creator = msg.sender;
        details.oracle = _oracle;
        details.collateralToken = IERC20(_collateralToken);
        state = MarketState.OPEN;
    }

    function resolve(bool _outcome) external {
        require(msg.sender == details.oracle, "Only oracle can resolve");
        require(state == MarketState.OPEN, "Market not open");
        // require(block.timestamp >= details.endTime, "Market not ended"); // Optional: Allow early resolution by AI

        outcome = _outcome;
        state = MarketState.RESOLVED;
        emit MarketResolved(_outcome);
    }

    // Simplified buying mechanism: 1:1 backing for simplicity in MVP.
    // In a real generic AMM, price fluctuates.
    // For this MVP, let's implement a basic Binary Option style or Parimutuel?
    // Let's do a simple Order Book or Parimutuel (Pool).
    // Actually, CPMM is best for specialized markets.
    // However, writing a full CPMM from scratch in one go might be error prone.
    // Let's stick to a simple "1 Token = 1 YES + 1 NO" minting pattern (polymarket style mostly uses this + AMM).
    // Or simpler: Parimutuel. Winners take all losers' money.
    // Let's go with the "1 Token = 1 YES + 1 NO" minting. It's safe and understandable.
    // Mechanism:
    // 1. User deposits 1 USDC -> Mints 1 YES + 1 NO.
    // 2. User sells 1 NO to someone who wants NO (or AMM).
    //
    // To make it super simple for "AI resolution" demo:
    // User bets on YES or NO. Money goes into a pot.
    // Odds are determined by the ratio of the pot? (Parimutuel)
    //
    // Let's implement Parimutuel for "MVP" as it's easiest to verify.
    // Pot A (YES), Pot B (NO).
    // If YES wins, Pot B is distributed to Pot A holders pro-rata.
    
    // Pot Balances
    uint256 public totalYesStaked;
    uint256 public totalNoStaked;

    function buyShares(bool isYes, uint256 amount) external {
        require(state == MarketState.OPEN, "Market resolved");
        require(block.timestamp < details.endTime, "Market ended");

        details.collateralToken.transferFrom(msg.sender, address(this), amount);

        if (isYes) {
            yesShares[msg.sender] += amount;
            totalYesStaked += amount;
            totalYesShares += amount;
        } else {
            noShares[msg.sender] += amount;
            totalNoStaked += amount;
            totalNoShares += amount;
        }
        
        emit SharesPurchased(msg.sender, isYes, amount, amount);
    }

    function claim() external {
        require(state == MarketState.RESOLVED, "Market not resolved");
        
        uint256 payout = 0;
        console.log("Claimer:", msg.sender);
        console.log("Resolved Outcome:", outcome);
        
        if (outcome) { // YES Won
            uint256 userShares = yesShares[msg.sender];
            console.log("User Shares (YES):", userShares);
            if (userShares > 0) {
                // Share of the total pool (YES + NO)
                // Payout = UserShares / TotalYesShares * (TotalYes + TotalNo)
                uint256 totalPool = totalYesStaked + totalNoStaked;
                payout = (userShares * totalPool) / totalYesShares;
                yesShares[msg.sender] = 0;
            }
        } else { // NO Won
            uint256 userShares = noShares[msg.sender];
             if (userShares > 0) {
                uint256 totalPool = totalYesStaked + totalNoStaked;
                payout = (userShares * totalPool) / totalNoShares;
                noShares[msg.sender] = 0;
            }
        }

        if (payout > 0) {
            console.log("Claiming payout:", payout);
            details.collateralToken.transfer(msg.sender, payout);
            emit WinningsClaimed(msg.sender, payout);
        } else {
            console.log("Payout is zero");
        }
    }
}
