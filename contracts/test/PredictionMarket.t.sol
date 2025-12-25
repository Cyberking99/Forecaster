// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {PredictionMarket} from "../src/PredictionMarket.sol";
import {MarketFactory} from "../src/MarketFactory.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";

// Mock ERC20 for testing
contract MockERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        balanceOf[from] -= amount;
        allowance[from][msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract PredictionMarketTest is Test {
    PredictionMarket public market;
    MarketFactory public factory;
    MockERC20 public token;

    address public oracle = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);

    function setUp() public {
        token = new MockERC20();
        factory = new MarketFactory();

        token.mint(user1, 1000 ether);
        token.mint(user2, 1000 ether);

        vm.prank(user1);
        token.approve(address(factory), 1000 ether); // Not needed for factory create but good practice

        address marketAddr = factory.createMarket(
            "Will BTC hit 100k?",
            "End of 2024",
            1 days,
            oracle,
            address(token)
        );
        market = PredictionMarket(marketAddr);
    }

    function testBuyShares() public {
        vm.startPrank(user1);
        token.approve(address(market), 100 ether);
        market.buyShares(true, 10 ether); // Buy 10 YES
        vm.stopPrank();

        assertEq(market.yesShares(user1), 10 ether);
        assertEq(market.totalYesShares(), 10 ether);
    }

    function testResolutionAndClaim() public {
        // User 1 buys YES
        vm.startPrank(user1);
        token.approve(address(market), 100 ether);
        market.buyShares(true, 50 ether);
        vm.stopPrank();

        // User 2 buys NO
        vm.startPrank(user2);
        token.approve(address(market), 100 ether);
        market.buyShares(false, 50 ether);
        vm.stopPrank();

        // Check balances before
        uint256 totalPot = 100 ether;

        // Resolve YES
        vm.prank(oracle);
        market.resolve(true);

        console.log("User1 Yes Shares:", market.yesShares(user1));
        console.log("Total Yes Shares:", market.totalYesShares());
        console.log("Total Pot:", market.totalYesStaked() + market.totalNoStaked());
        console.log("Market Balance:", token.balanceOf(address(market)));

        // User 1 claims
        uint256 preBalance = token.balanceOf(user1);
        vm.prank(user1);
        market.claim();
        uint256 postBalance = token.balanceOf(user1);

        // User 1 should get 100% of the pot because they own 100% of winning shares
        // User 2 owns NO shares, and NO lost.
        // User 1 share = 50. Total Yes = 50. Pool = 100.
        // Payout = 50 / 50 * 100 = 100.
        assertEq(postBalance - preBalance, 100 ether);
        
        // User 2 claims (should be 0)
        vm.prank(user2);
        preBalance = token.balanceOf(user2);
        market.claim();
        postBalance = token.balanceOf(user2);
        assertEq(postBalance - preBalance, 0);
    }
}
