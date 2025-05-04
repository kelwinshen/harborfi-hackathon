
// ===== NOTE ===== 
// REMEMBEMBER DON'T LET THE CODE DO MANY TX WITH SAME WALLET IN ARROW
// IT MAKE INTERACT THE BLOCKCHAIN FAILED DUE TO PREVENT THE REPLY ATTACK

const { ethers, ContractFactory } = require("ethers");
const fs = require("fs");
require("dotenv").config();

// ===== SETTINGS =====
const rpcUrl = `https://devnet.dplabs-internal.com/`;
const explorerURL = `https://pharosscan.xyz`;
const privateKey = process.env.PRIVATE_KEY;
const provider = new ethers.JsonRpcProvider(rpcUrl);
const signer = new ethers.Wallet(privateKey, provider);

// ===== Contract ABIs and Bytecode =====
const swapAbi = fs.readFileSync("./contracts/artifacts/Swap.abi").toString();
const swapBytecode = fs.readFileSync("./contracts/artifacts/Swap.bin").toString();

// ===== Token Addresses =====
const tokenA = "0x459ed4f0f9398608dB761CeC80EFc2528ba81699"; // HIDR
const tokenB = "0x9343850dBdD5AAfac57084f6Be7777c736815DF5"; // HBAHT
const tokenC = "0x8242b1F5B6A067d1EADf3AD5093636188bDfcBC6"; // HPHP

const storageContractAddress = "0xf08A9C60bbF1E285BF61744b17039c69BcD6287d"
const nativePriceId = 1;    // ETH/USD
const usdToIdrPriceId = 5020; // USD/IDR
const usdToThbPriceId = 5009; // USD/THB
const usdToPhpPriceId = 5015; // USD/PHP

const erc20Abi = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
];

// ===== MAIN FUNCTION =====
async function main() {
  const gasLimit = 10_000_000;
  let swap;
  let contractAddress = "0x06f51607a599B2143C40025a6De8cFfF7fB8eB44"; // Deployed swap address

//   console.log("\n🚀 Connecting to Swap Contract...\n");

  if (!contractAddress) {
    console.log(`Deploying Swap contract...`);
    const SwapFactory = new ContractFactory(swapAbi, swapBytecode, signer);
    swap = await SwapFactory.deploy(
    storageContractAddress,
      tokenA,
      tokenB,
      tokenC,
      nativePriceId,
      usdToIdrPriceId,
      usdToThbPriceId,
      usdToPhpPriceId,
      { gasLimit }
    );
    const receipt = await swap.deploymentTransaction().wait();
    contractAddress = receipt.contractAddress;
    console.log(`✅ Deployed at: ${contractAddress}\n`);
  }

  swap = new ethers.Contract(contractAddress, swapAbi, signer);

  const tokenAContract = new ethers.Contract(tokenA, erc20Abi, signer);
  const tokenBContract = new ethers.Contract(tokenB, erc20Abi, signer);
  const tokenCContract = new ethers.Contract(tokenC, erc20Abi, signer);

  // ===== Add Liquidity (already commented for you if done) =====
  console.log("💧 Adding Liquidity...\n");

  // const ethLiquidity = ethers.parseEther("2");
  // const tokenALiquidity = ethers.parseUnits("10000000", 0);
  // const tokenBLiquidity = ethers.parseUnits("200000", 0);
  // const tokenCLiquidity = ethers.parseUnits("350000", 0);

// //   Uncomment if you need to add liquidity
  // await (await swap.addLiquidity(ethers.ZeroAddress, ethLiquidity, { value: ethLiquidity, gasLimit })).wait();
  // console.log(`✅ Added ETH liquidity.`);

  //  await tokenAContract.approve(contractAddress, tokenALiquidity);
  // await (await swap.addLiquidity(tokenA, tokenALiquidity, { gasLimit })).wait();
  // console.log(`✅ Added HIDR liquidity.`);

  // await tokenBContract.approve(contractAddress, tokenBLiquidity);
  // await (await swap.addLiquidity(tokenB, tokenBLiquidity, { gasLimit })).wait();
  // console.log(`✅ Added HBAHT liquidity.`);

  // await tokenCContract.approve(contractAddress, tokenCLiquidity);
  // await (await swap.addLiquidity(tokenC, tokenCLiquidity, { gasLimit })).wait();
  // console.log(`✅ Added PHPH liquidity.`);


  // ===== Swap ETH to Token =====
//   console.log("\n🔄 Swapping ETH to HIDR...\n");
//   const ethSwapAmount = ethers.parseEther("0.0001"); // 0.0001 ETH
//   await (await swap.swapNativeToToken(tokenA, { value: ethSwapAmount, gasLimit })).wait();
//   console.log(`✅ Swapped ETH to HIDR.`);

//   // ===== Approve HIDR before swapping it to HBAHT =====
//   console.log("\n🔑 Approving HIDR for Swap Contract...\n");
//   await (await tokenAContract.approve(contractAddress, ethers.MaxUint256)).wait();
//   console.log(`✅ Approved HIDR token!`);


//   console.log("\n🔄 Swapping HIDR to ETH...\n");
// const tokenSwapAmount = ethers.parseUnits("100000", 0); 
//  const tx=  await (await swap.swapTokenToNative(tokenA, tokenSwapAmount, { gasLimit })).wait();
//   console.log(`✅ Swapped HIDR to ETH. ${tx.id}`);

//   // ===== Approve HIDR before swapping it to HBAHT =====
//   console.log("\n🔑 Approving HIDR for Swap Contract...\n");
//   await (await tokenAContract.approve(contractAddress, ethers.MaxUint256)).wait();
//   console.log(`✅ Approved HIDR token!`);

// // // //   // ===== Swap HIDR to HBAHT =====
  // console.log("\n🔄 Swapping HIDR to HBAHT...\n");
  // const tokenSwapAmount = ethers.parseUnits("100000", 0); 
  // await (await swap.swapTokenToToken(tokenA, tokenB, tokenSwapAmount, { gasLimit })).wait();
  // console.log(`✅ Swapped HIDR to HBAHT.`);

//   console.log("\n🎯 All tests completed successfully!\n");
// }

}

main().catch(console.error);
