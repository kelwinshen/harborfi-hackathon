// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

//TODO: Add comments, pass feed contract address as param to constructor, import interface file

//interface to interact with price feed, refer to documentation https://supraoracles.com/docs/get-started
import "./ISupraSValueFeed.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract priceFeedInPayable is Ownable {
    uint mintPrice;
    ISupraSValueFeed sValueFeed;
 
    constructor(address supraAdr) Ownable (msg.sender) {
        sValueFeed = ISupraSValueFeed(supraAdr);
        mintPrice = 100;
    }

    function updateSupraSvalueFeed(address _newSValueFeed) external  onlyOwner {
        sValueFeed = ISupraSValueFeed(_newSValueFeed);
    }
 
     //modifier used to validate the amount sent in the transaction
    modifier validAmount(){
        
        //pair index for eth or whatever pair you want
        ISupraSValueFeed.priceFeed memory data = sValueFeed.getSvalue(75);

        uint mintPriceAdjusted = mintPrice * (10 ** data.decimals);
        uint requiredAmount = (mintPriceAdjusted * (10 ** data.decimals)) / data.price;

        require(msg.value >= requiredAmount, 'Not enough ETH sent.');
        _;
    }

     //arbitrary PAYABLE function with the validAmount modifier
    function mint() external payable validAmount() {
        //mint logic here
    }
 
     //withdraw function
    function withdraw(address payable _to) external onlyOwner {
        _to.transfer(address(this).balance);
    }
 
}