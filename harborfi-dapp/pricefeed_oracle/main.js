const { ethers, ContractFactory } = require("ethers");
const fs = require("fs");
require("dotenv").config();

// SETTINGS
//-----------------------------------------------------------------------------------------------------------------
const storageContractAddress = "0xf08A9C60bbF1E285BF61744b17039c69BcD6287d"; // TESTNET Address of the Supra Oracle Storage Contract
//-----------------------------------------------------------------------------------------------------------------

const abi = fs.readFileSync("./contracts/artifacts/ConsumerContract.abi").toString();
const bytecode = fs.readFileSync("./contracts/artifacts/ConsumerContract.bin").toString();

const rpcUrl = `https://devnet.dplabs-internal.com/`;
const explorerURL = `https://pharosscan.xyz`;
const privateKey = process.env.PRIVATE_KEY; //Your private key

const provider = new ethers.JsonRpcProvider(rpcUrl);
const signer = new ethers.Wallet(privateKey, provider);

// Main function to deploy the contract
async function main() {
    // STEP 1 ===================================
    console.log(`\nSTEP 1 ===================================\n`);
    console.log(`- Deploy the smart contract...\n`);

    let gasLimit = 4000000;
    const newContract = new ContractFactory(abi, bytecode, signer);
    const contractDeployTx = await newContract.deploy(storageContractAddress, { gasLimit: gasLimit });
    const contractDeployRx = await contractDeployTx.deploymentTransaction().wait();
    const contractAddress = contractDeployRx.contractAddress;
    console.log(`- Contract deployed to address: ${contractAddress} ✅`);
    console.log(`- See details in Pharosscan: \n ${explorerURL}/address/${contractAddress} \n `);

    // STEP 2 ===================================
    console.log(`\nSTEP 2 ===================================\n`);
    console.log(`- Call contract functions...\n`);

    // Set the pair indices that you wish to request/use as an array
    //https://supra.com/docs/data-feeds/data-feeds-index
    const pricePairName = [ "ETH/USD", "USD/IDR", "USD/THB", "USD/PHP"];
    const pricePairIdx = [1, 5020,5009, 5015 ];

    gasLimit = 200000;
    const myContract = new ethers.Contract(contractAddress, abi, signer);
    const ethUsd = await myContract.getPriceForMultiplePair([1]);
const usdIdr = await myContract.getPriceForMultiplePair([5020]);
const usdThb = await myContract.getPriceForMultiplePair([5009]);
const usdPhp = await myContract.getPriceForMultiplePair([5015]);

console.log("ETH/USD price:", ethUsd[0].price.toString());
console.log("USD/IDR price:", usdIdr[0].price.toString());
console.log("USD/THB price:", usdThb[0].price.toString());
console.log("USD/PHP price:", usdPhp[0].price.toString());


    const callResult = await myContract.getPriceForMultiplePair(pricePairIdx, { gasLimit: gasLimit });

    let ethUsdPrice, usdIdrPrice, usdThbPrice, usdPhpPrice;

    for (let i = 0; i < callResult.length; i++) {
        const singleResult = callResult[i]; 
        const price = singleResult.price;
        const decimals = singleResult.decimals;
    
        const formattedPrice = Number(price) * 10 ** -Number(decimals);
    
        if (pricePairName[i] === "ETH/USD") {
            ethUsdPrice = formattedPrice;
        } else if (pricePairName[i] === "USD/IDR") {
            usdIdrPrice = formattedPrice;
        } else if (pricePairName[i] === "USD/THB") {
            usdThbPrice = formattedPrice;
        } else if (pricePairName[i] === "USD/PHP") {
            usdPhpPrice = formattedPrice;
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
    }
}

main();
