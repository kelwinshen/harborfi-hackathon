const { ethers } = require("ethers");
require("dotenv").config();

// ===== SETTINGS ===== 
const rpcUrl = `https://devnet.dplabs-internal.com/`;
const privateKey = process.env.USER_PRIVATE_KEY;
const provider = new ethers.JsonRpcProvider(rpcUrl);
const signer = new ethers.Wallet(privateKey, provider);

async function sendNative(toAddress, amountInEther) {
  try {
    const tx = await signer.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amountInEther.toString()), 
      gasLimit: 21000, 
    });

    console.log(`Transaction sent!`);
    console.log(`TX Hash: ${tx.hash}`);
    console.log(`Explorer: https://pharosscan.xyz/tx/${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  } catch (error) {
    console.error("Error sending transaction:", error);
  }
}

const recipientAddress = process.env.WALLET_ADDRESS; 
const amountToSend = 1.5; // 

sendNative(recipientAddress, amountToSend);
