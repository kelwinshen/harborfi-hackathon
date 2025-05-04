// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ISupraSValueFeed.sol";


contract Swap {
   ISupraSValueFeed internal sValueFeed;

    address public tokenA;
    address public tokenB;
    address public tokenC;

    uint256 public nativePriceId;
    uint256 public usdToIdrPriceId;
    uint256 public usdToThbPriceId;
    uint256 public usdToPhpPriceId;

    uint256 public reserveNative;
    uint256 public reserveA;
    uint256 public reserveB;
    uint256 public reserveC;

    constructor(
        address _sValueFeed,
        address _tokenA,
        address _tokenB,
        address _tokenC,
        uint256 _nativePriceId,
        uint256 _usdToIdrPriceId,
        uint256 _usdToThbPriceId,
        uint256 _usdToPhpPriceId
    ) {
        sValueFeed = ISupraSValueFeed(_sValueFeed);
        tokenA = _tokenA;
        tokenB = _tokenB;
        tokenC = _tokenC;
        nativePriceId = _nativePriceId;
        usdToIdrPriceId = _usdToIdrPriceId;
        usdToThbPriceId = _usdToThbPriceId;
        usdToPhpPriceId = _usdToPhpPriceId;
    }

    // ===== LIQUIDITY MANAGEMENT =====
    function addLiquidity(address token, uint256 amount) external payable {
        if (token == address(0)) {
            require(msg.value == amount, "Incorrect native amount");
            reserveNative += amount;
        } else {
            require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
            if (token == tokenA) reserveA += amount;
            else if (token == tokenB) reserveB += amount;
            else if (token == tokenC) reserveC += amount;
            else revert("Invalid token");
        }
    }

    function removeLiquidity(address token, uint256 amount) external {
        if (token == address(0)) {
            require(reserveNative >= amount, "Insufficient native reserve");
            reserveNative -= amount;
            payable(msg.sender).transfer(amount);
        } else {
            if (token == tokenA) {
                require(reserveA >= amount, "Insufficient tokenA reserve");
                reserveA -= amount;
                require(IERC20(tokenA).transfer(msg.sender, amount), "Transfer failed");
            } else if (token == tokenB) {
                require(reserveB >= amount, "Insufficient tokenB reserve");
                reserveB -= amount;
                require(IERC20(tokenB).transfer(msg.sender, amount), "Transfer failed");
            } else if (token == tokenC) {
                require(reserveC >= amount, "Insufficient tokenC reserve");
                reserveC -= amount;
                require(IERC20(tokenC).transfer(msg.sender, amount), "Transfer failed");
            } else {
                revert("Invalid token");
            }
        }
    }

 

    function swapNativeToToken(address toToken) external payable {
    require(msg.value > 0, "Zero amount");

   ISupraSValueFeed.priceFeed memory ethUsd =  sValueFeed.getSvalue(nativePriceId);
    uint256 tokenPriceId = toToken == tokenA ? usdToIdrPriceId : toToken == tokenB ? usdToThbPriceId : usdToPhpPriceId;
   ISupraSValueFeed.priceFeed memory usdToLocal = sValueFeed.getSvalue(tokenPriceId);


        uint256 nativePrice = (ethUsd.price * usdToLocal.price) / 10**(ethUsd.decimals + usdToLocal.decimals);  

        uint256 tokenAmountCheck = (msg.value * nativePrice); 
     //Hardcoded for just devnet use because the pull or push Supra oracle for Pharos Devenet if unavailable 
        uint256 tokenAmount = tokenAmountCheck == 0 ? (msg.value*30000000/1e18) : (tokenAmountCheck * nativePrice)/1e18; 

    if (toToken == tokenA) {
        require(reserveA >= tokenAmount, "Insufficient tokenA liquidity");
        reserveA -= tokenAmount;
        IERC20(tokenA).transfer(msg.sender, tokenAmount);
    } else if (toToken == tokenB) {
        require(reserveB >= tokenAmount, "Insufficient tokenB liquidity");
        reserveB -= tokenAmount;
        IERC20(tokenB).transfer(msg.sender, tokenAmount);
    } else if (toToken == tokenC) {
        require(reserveC >= tokenAmount, "Insufficient tokenC liquidity");
        reserveC -= tokenAmount;
        IERC20(tokenC).transfer(msg.sender, tokenAmount);
    }   else revert("Invalid toToken");

    reserveNative += msg.value;
}


    function swapTokenToNative(address fromToken, uint256 amountIn) external {
        require(amountIn > 0, "Zero amount");
        
        ISupraSValueFeed.priceFeed memory ethUsd = sValueFeed.getSvalue(nativePriceId); 

          uint256 tokenPriceId = fromToken == tokenA ? usdToIdrPriceId : fromToken == tokenB ? usdToThbPriceId : usdToPhpPriceId  ;
     
        ISupraSValueFeed.priceFeed memory usdToLocal = sValueFeed.getSvalue(tokenPriceId); 

    
        uint256 nativePriceCheck = (ethUsd.price * usdToLocal.price) / 10**(ethUsd.decimals + usdToLocal.decimals);  
        
        //Hardcoded for just devnet use because the pull or push Supra oracle for Pharos Devenet if unavailable 
        uint256 nativePrice = nativePriceCheck == 0 ? (fromToken == tokenA ? 30000000 : fromToken == tokenB ? 60000 : 100000) : nativePriceCheck;

        uint256 nativeAmount = (amountIn * 1e18) / nativePrice; 

        require(reserveNative >= nativeAmount, "Insufficient native liquidity");

        require(IERC20(fromToken).transferFrom(msg.sender, address(this), amountIn), "Transfer failed");

        if (fromToken == tokenA) reserveA += amountIn;
        else if (fromToken == tokenB) reserveB += amountIn;
        else if (fromToken == tokenC) reserveC += amountIn;
        else revert("Invalid fromToken");

        reserveNative -= nativeAmount;
        payable(msg.sender).transfer(nativeAmount);
    }



    function swapTokenToToken(address fromToken, address toToken, uint256 amountIn) external {
        require(amountIn > 0, "Zero amount");
        require(fromToken != toToken, "Tokens must differ");


           uint256 tokenPriceIdFrom = fromToken == tokenA ? usdToIdrPriceId : fromToken == tokenB ? usdToThbPriceId : usdToPhpPriceId  ;
            
            uint256 tokenPriceIdTo = toToken == tokenA ? usdToIdrPriceId : toToken == tokenB ? usdToThbPriceId : usdToPhpPriceId  ;
           
           
            ISupraSValueFeed.priceFeed memory fromUsd = sValueFeed.getSvalue(tokenPriceIdFrom); 
            ISupraSValueFeed.priceFeed memory toUsd = sValueFeed.getSvalue(tokenPriceIdTo); 

        
       
        uint256 amountOutCheck = (toUsd.price == 0 || fromUsd.price ==0 ) ? 0 : (amountIn * fromUsd.price * (10 ** toUsd.decimals)) / (toUsd.price * (10 ** fromUsd.decimals));

 //Hardcoded for just devnet use because the pull or push Supra oracle for Pharos Devenet if unavailable 
       uint256 amountOut = amountOutCheck == 0
    ? (
        fromToken == tokenA && toToken == tokenB ? (amountIn * 2) / 1000 :
        fromToken == tokenB && toToken == tokenA ? (amountIn * 1000)/2 :
        fromToken == tokenA && toToken == tokenC ? (amountIn * 35) / 10000 :
        fromToken == tokenC && toToken == tokenA ? (amountIn * 10000) / 35 :
        fromToken == tokenB && toToken == tokenC ? (amountIn * 168) / 100 :
        (amountIn * 100) / 168
    )
    : amountOutCheck;


        require(IERC20(fromToken).transferFrom(msg.sender, address(this), amountIn), "Transfer failed");

        if (fromToken == tokenA) reserveA += amountIn;
        else if (fromToken == tokenB) reserveB += amountIn;
        else if (fromToken == tokenC) reserveC += amountIn;
        else revert("Invalid fromToken");

        if (toToken == tokenA) {
            require(reserveA >= amountOut, "Insufficient tokenA liquidity");
            reserveA -= amountOut;
            IERC20(tokenA).transfer(msg.sender, amountOut);
        } else if (toToken == tokenB) {
            require(reserveB >= amountOut, "Insufficient tokenB liquidity");
            reserveB -= amountOut;
            IERC20(tokenB).transfer(msg.sender, amountOut);
        } else if (toToken == tokenC) {
            require(reserveC >= amountOut, "Insufficient tokenC liquidity");
            reserveC -= amountOut;
            IERC20(tokenC).transfer(msg.sender, amountOut);
        } else {
            revert("Invalid toToken");
        }
    }


    receive() external payable {}
}
