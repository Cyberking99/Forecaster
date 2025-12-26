// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {MarketFactory} from "../src/MarketFactory.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CreateMarketScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        address factoryAddress = 0x72fC4D5BBD0EcE3A1161d6Ce7078E3a5654eCCbe;
        address tokenAddress   = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

        vm.startBroadcast(deployerPrivateKey);

        MarketFactory factory = MarketFactory(factoryAddress);
        ERC20 token = ERC20(tokenAddress);

        //token.mint(deployer, 200_000 * 10**18);
        //console.log("Minted 200,000 mUSDC to", deployer);

        address oracle = deployer;

        string[10] memory questions = [
            // Crypto
            "Will ETH trade above $5,000 on Dec 31, 2025?",
            "Will BTC dominance exceed 55% by Dec 31, 2025?",
            "Will a Bitcoin ETF have over $100B AUM by Jan 1, 2026?",

            // Sports
            "Will Nigeria win AFCON 2025?",
            "Will Arsenal finish top 2 in the EPL 2024/2025 season?",
            "Will Lionel Messi score in his final match of 2025?",

            // Entertainment
            "Will a Nigerian movie win an international award in 2025?",
            "Will Drake release a new album in 2025?",
            "Will Netflix surpass 300M subscribers by 2025?",

            // Mixed
            "Will OpenAI release GPT-5 before 2026?"
        ];

        string[10] memory descriptions = [
            "Resolves YES if ETH price is above $5,000 on Dec 31, 2025.",
            "Resolves YES if BTC dominance is above 55% on Dec 31, 2025.",
            "Resolves YES if any Bitcoin ETF exceeds $100B AUM by Jan 1, 2026.",

            "Resolves YES if Nigeria wins AFCON 2025.",
            "Resolves YES if Arsenal finishes 1st or 2nd in EPL 24/25.",
            "Resolves YES if Messi scores in any official match before Dec 31, 2025.",

            "Resolves YES if a Nigerian movie wins a major international award in 2025.",
            "Resolves YES if Drake releases an album in 2025.",
            "Resolves YES if Netflix reports over 300M subscribers in 2025.",

            "Resolves YES if GPT-5 is officially released before Jan 1, 2026."
        ];

        // End timestamps (UTC) between Dec 26, 2025 → Jan 3, 2026
        uint256[10] memory endDates = [
            uint256(1766793600), // Dec 26, 2025
            1766793600,          // Dec 27
            1766880000,          // Dec 28
            1766966400,          // Dec 29
            1767052800,          // Dec 30
            1767139200,          // Dec 31
            1767225600,          // Jan 1, 2026
            1767312000,          // Jan 2
            1767398400,          // Jan 3
            1767398400           // Jan 3 (same date allowed)
        ];

        for (uint256 i = 0; i < 10; i++) {
            require(endDates[i] > block.timestamp, "End date in the past");

            uint256 duration = endDates[i] - block.timestamp;

            factory.createMarket(
                questions[i],
                descriptions[i],
                duration,
                oracle,
                tokenAddress
            );

            console.log("Created Market", i + 1);
            console.log("Question:", questions[i]);
        }

        vm.stopBroadcast();
    }
}
