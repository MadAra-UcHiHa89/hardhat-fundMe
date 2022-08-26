// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConvertor {
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        // function to get the current usd price from Oracle i.e chain link
        //  Since for this we are interacting with another contract ( Aggregator contract , which has variable storing current usd price of ethereum )
        //  So we'll need the
        // 1] ABI of that contract
        // 2] Contract Address 0xA39434A63A52E749F02807ae27335515BA4b07F7 ( On Goreli)
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(
        //     0xA39434A63A52E749F02807ae27335515BA4b07F7
        // );
        (
            ,
            //  uint80 roundId
            int256 answer, //  uint256 startedAt //  uint256 updatedAt //  uint80 answeredInRound
            ,
            ,

        ) = priceFeed.latestRoundData();
        return uint256(answer * 1e10); // Since asnwer of price of ETH IN usd HAS 8 decimal places , while value sent to contract has 18 decimal places hence muiplied by 10^10 so both 18 deciaml places
    }

    // Taking priceFeed contract as parameter since we do not want to hardcode the address of the priceFeed contract, and want it to be flexible wrt the chain
    function getConversion(uint256 ethAmt, AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        uint256 price = getPrice(priceFeed); // Getting the price of ethereum in USD
        uint256 ethAmtInUsd = (ethAmt * price) / 1e18;
        return ethAmtInUsd;
    }
}
