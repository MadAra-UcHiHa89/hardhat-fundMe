// SPDX-License-Identifier: MIT
// pragma
pragma solidity ^0.8.0;
// Imports
import {PriceConvertor} from './PriceConvertor.sol';
import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';
import 'hardhat/console.sol';

// errors
error FundMe__NotOwner();

// Interfaces , Libraries , Contracts
// Natspec documentation for the contract
/**
 * @title A contract for croud funding
 * @author Aadil Saudagar
 * @notice This contract is for crowd funding of a project
 * @dev This implements price feed as our library
 */
contract FundMe {
    // Type Declrations ( Structs )
    using PriceConvertor for uint256;

    // State Variables
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    // 	21393 gas -> contant
    //   23493 gas  -> without constant
    address[] private funders;
    mapping(address => uint256) private addressToAmtDonated;
    address private immutable i_owner;
    // 	21486 gas -> immutable
    // 23493 gas -> without immutable
    AggregatorV3Interface private priceFeed; // to hold the priceFeed contract, done so that we can modularise the code wrt thepriceFeed based on chains since each chain will have differnet priceFeed contract address

    // Modifiers
    modifier onlyOwner() {
        // require(msg.sender==i_owner,"Sender is not owner");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _; // _ -> rperesnets the function body
    }

    // Functions
    constructor(address priceFeedAddress) {
        i_owner = msg.sender; // The person deploying the contract is the owner
        priceFeed = AggregatorV3Interface(priceFeedAddress); // Initializing the price feed with the contract , since when we provide the interface with the contract address we get the contract instance
    }

    // What happens when someone sends ETH to the contract without using the fund (which is payable) function.
    receive() external payable {
        // Whenever someone sends plain Eth without having any call data then receive will get executed
        //  and we'll call the fund() function
        fund();
    }

    fallback() external payable {
        //  Whenever somonse sends Eth to contract , but txn has call data and not other function signature matches
        // then fallback will get executed , and we'll call the fund() function
        fund();
    }

    /**
     * @notice This function is for funding the project
     * @dev This implements feed as a library
     */
    function fund()
        public
        payable
    // payable allows txn initiators to send ether to this smart contract's function
    {
        //  For setting 1eth as min fund value:
        require(
            msg.value.getConversion(priceFeed) >= MINIMUM_USD,
            'Donated amt must be atleast 1 eth!'
        ); // 1e18 == 1 * 10 ** 18 i.e 10^18
        // msg.value-> is the field that contains / stores the value field of the txn
        funders.push(msg.sender); // Pushing the funder's account address , msg.sender -> contains the address of the account that initiated the txn
        addressToAmtDonated[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        // We want only the person who deployed the contract to withdraw and not just anyone

        // Loop through the funders array and , set the amt donated to 0 for each since we are withdrawing
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            addressToAmtDonated[funder] = 0; // Setting it to 0 since we have withdrwan , the amt
        }
        // console.log('Withdraw fn called by', msg.sender);
        //  reset funders array
        funders = new address[](0); // i.e now funders points to a new address array with 0 elements
        // Transer the ether to the owner

        // transfer
        // payable(msg.sender).transfer(address(this).balance); // address.transfer(amtOfEther);
        // send
        // bool success= payable(msg.sender).send(address(this).balance); // address.send(amtOfEther);
        // require(success,"Send Failed, Transfer of ether failed");
        // call
        // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use.
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }('');
        require(success, 'Failed to send Ether');
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory fundersCopy = funders;
        for (uint256 i = 0; i < fundersCopy.length; i++) {
            address funder = fundersCopy[i];
            addressToAmtDonated[funder] = 0; // Setting it to 0 since we have withdrwan , the amt
        }

        funders = new address[](0); // i.e now funders points to a new address array with 0 elements
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }('');
        require(success, 'Failed to send Ether');
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return funders[index];
    }

    function getAddressToAmtDonated(address funder)
        public
        view
        returns (uint256)
    {
        return addressToAmtDonated[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }
}
