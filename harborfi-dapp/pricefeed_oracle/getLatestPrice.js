const { ethers } = require("ethers");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

// SETTINGS
//-----------------------------------------------------------------------------------------------------------------
const storageContractAddress = "0x11FD5d483bD7fB84Aa4Cfcb893bc4c86dAbC2253"; // Your deployed contract address
//-----------------------------------------------------------------------------------------------------------------

const abi = fs.readFileSync("./contracts/artifacts/ConsumerContract.abi").toString();
const rpcUrl = `https://devnet.dplabs-internal.com/`;  
const privateKey = process.env.PRIVATE_KEY;      
const serverUrl = process.env.SERVER_URL;    

const provider = new ethers.JsonRpcProvider(rpcUrl);
const signer = new ethers.Wallet(privateKey, provider);

// Function to fetch and submit prices
async function fetchAndSubmitPrices() {
    try {
        const myContract = new ethers.Contract(storageContractAddress, abi, signer);
        const pricePairName = ["BTC/USD", "ETH/USD", "USD/IDR", "USD/THB", "USD/PHP"];
        const pricePairIdx = [0, 1, 5020,5009, 5015 ];
        
        const callResult = await myContract.getPriceForMultiplePair(pricePairIdx);

        let ethUsdPrice, usdIdrPrice, usdThbPrice, usdPhpPrice;

        for (let i = 0; i < pricePairIdx.length; i++) {
            const price = callResult[i].price;
            const decimals = callResult[i].decimals;
            const formattedPrice = Number(price) * 10 ** -Number(decimals);

            if (pricePairName[i] === "ETH/USD") {
                ethUsdPrice = formattedPrice;
                console.log(ethUsdPrice);
                console.log(decimals);
            } else if (pricePairName[i] === "USD/IDR") {
                usdIdrPrice = formattedPrice;
                console.log(usdIdrPrice);
                console.log(decimals);
            } else if (pricePairName[i] === "USD/THB") {
                usdThbPrice = formattedPrice;
                console.log(usdThbPrice);
                console.log(decimals);
            } else if (pricePairName[i] === "USD/PHP") {
                usdPhpPrice = formattedPrice;
                console.log(usdPhpPrice);
                console.log(decimals);
            } else if (pricePairName[i] === "BTC/USD") {
                usdPhpPrice = formattedPrice;
                console.log(usdPhpPrice);
                console.log(decimals);
            }
        }

       if (ethUsdPrice && usdIdrPrice && usdThbPrice && usdPhpPrice ) {
            const ethIdrPrice = ethUsdPrice * usdIdrPrice;
            const ethThbPrice = ethUsdPrice * usdThbPrice;
            const ethPhpPrice = ethUsdPrice * usdPhpPrice;

            console.log(`\n- ETH to IDR Price: ${ethIdrPrice}`);
            console.log(`\n- ETH to THB Price: ${ethThbPrice}`);
            console.log(`\n- ETH to PHP Price: ${ethPhpPrice}`);
            console.log(`\n===================================\n`);

         //Submit data to database
            await axios.put(`${serverUrl}/hbar-to-hidr/1`, {
             "price" : hbarIdrPrice.toString()
            });
            console.log("Price data submitted to the server.");
        } else {
            console.log("\n- Failed to retrieve one or all prices.\n");
        }
    } catch (error) {
        console.error("Error fetching prices or submitting data:", error);
    }
}

// Function to run the fetch process every 10 seconds and submit to the database for api get the latest pricefeed show to the user
function startFetchingPrices() {
    fetchAndSubmitPrices();  // Initial call
    setInterval(fetchAndSubmitPrices, 10000);  // Subsequent calls every 10 seconds
}

startFetchingPrices();

 