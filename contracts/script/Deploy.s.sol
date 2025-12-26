// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {MarketFactory} from "../src/MarketFactory.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying contracts with address:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Mock Token
        // MockERC20 token = new MockERC20();
        // console.log("MockERC20 deployed at:", address(token));

        // 2. Deploy MarketFactory
        MarketFactory factory = new MarketFactory();
        console.log("MarketFactory deployed at:", address(factory));

        vm.stopBroadcast();
    }
}
