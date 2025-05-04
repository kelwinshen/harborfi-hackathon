const { ethers, ContractFactory } = require("ethers");
const fs = require("fs");
require("dotenv").config();


//0x459ed4f0f9398608dB761CeC80EFc2528ba81699
// ===== SETTINGS =====
const rpcUrl = `https://devnet.dplabs-internal.com/`;
const explorerURL = `https://pharosscan.xyz`;
const privateKey = process.env.PRIVATE_KEY;

const provider = new ethers.JsonRpcProvider(rpcUrl);
const signer = new ethers.Wallet(privateKey, provider);

// ===== Read ABI and Bytecode =====
const abi = fs.readFileSync("./contracts/artifacts/HIDRToken.abi").toString();
const bytecode = fs.readFileSync("./contracts/artifacts/HIDRToken.bin").toString();

async function main() {
    console.log(`\nSTEP 1 - Deploying Token...\n`);

    const TokenFactory = new ContractFactory(abi, bytecode, signer);
    const initialSupply = ethers.parseUnits("200000000", 0); // 200M tokens
    const gasLimit = 4_000_000;

    const tokenContract = await TokenFactory.deploy(initialSupply, { gasLimit });
    const deployReceipt = await tokenContract.deploymentTransaction().wait();
    const contractAddress = deployReceipt.contractAddress;

    console.log(`✅ Token deployed at: ${contractAddress}`);
    console.log(`🔎 View on Explorer: ${explorerURL}/address/${contractAddress}\n`);

    // ====== Attach contract ======
    const token = new ethers.Contract(contractAddress, abi, signer);

    console.log(`\nSTEP 2 - Checking Token Info...\n`);
    const name = await token.name();
    const symbol = await token.symbol();
    const totalSupply = await token.totalSupply();
    console.log(`- Name: ${name}`);
    console.log(`- Symbol: ${symbol}`);
    console.log(`- Total Supply: ${ethers.formatUnits(totalSupply, 0)} ${symbol}\n`);

    // // ====== Mint more tokens ======
    // console.log(`\nSTEP 3 - Minting more tokens...\n`);
    // const mintAmount = ethers.parseUnits("100000", 18); // Mint 100,000 tokens
    // const mintTx = await token.mint(signer.address, mintAmount);
    // await mintTx.wait();
    // console.log(`✅ Minted 100,000 ${symbol} to deployer.`);

    // const newSupply = await token.totalSupply();
    // console.log(`- New Total Supply: ${ethers.formatUnits(newSupply, 18)} ${symbol}\n`);

    // // ====== Burn some tokens ======
    // console.log(`\nSTEP 4 - Burning tokens...\n`);
    // const burnAmount = ethers.parseUnits("50000", 18); // Burn 50,000 tokens
    // const burnTx = await token.burn(burnAmount);
    // await burnTx.wait();
    // console.log(`✅ Burned 50,000 ${symbol} from deployer.`);

    // const afterBurnSupply = await token.totalSupply();
    // console.log(`- Total Supply after Burn: ${ethers.formatUnits(afterBurnSupply, 18)} ${symbol}\n`);

    console.log(`\n🎯 All operations completed!\n`);
}

main().catch(console.error);
