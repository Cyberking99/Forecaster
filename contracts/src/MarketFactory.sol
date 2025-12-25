// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {PredictionMarket} from "./PredictionMarket.sol";

contract MarketFactory {
    event MarketCreated(address indexed marketAddress, string question, address creator);

    address[] public allMarkets;

    function createMarket(
        string memory _question,
        string memory _description,
        uint256 _duration,
        address _oracle,
        address _collateralToken
    ) external returns (address) {
        PredictionMarket market = new PredictionMarket(
            _question,
            _description,
            _duration,
            _oracle,
            _collateralToken
        );
        allMarkets.push(address(market));
        emit MarketCreated(address(market), _question, msg.sender);
        return address(market);
    }

    function getMarkets() external view returns (address[] memory) {
        return allMarkets;
    }
}
