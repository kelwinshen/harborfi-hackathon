// services/pharosToken.ts

import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// Setup constants
const PHAROS_RPC = "https://devnet.dplabs-internal.com/";
const PRIVATE_KEY = process.env.HARBORWALLET_PRIVATEKEY!;
const provider = new ethers.JsonRpcProvider(PHAROS_RPC);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Minimal ERC-20 ABI
const TOKEN_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() view returns (uint8)"
];

/**
 * Transfer token on Pharos network
 * @param tokenAddress ERC-20 contract address
 * @param toAddress recipient address
 * @param amount human-readable amount (e.g. "500000" if token uses 0 decimals)
 * @returns transaction hash
 */
export async function sendPharosToken(
  tokenAddress: string,
  toAddress: string,
  amount: string
): Promise<string> {
  try {
    const token = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);

    const parsedAmount = ethers.parseUnits(amount, 0);

    const tx = await token.transfer(toAddress, parsedAmount, {
      gasLimit: 100000,
    });

    console.log(`Sent ${amount} token to ${toAddress}`);
    console.log(`Explorer: https://pharosscan.xyz/tx/${tx.hash}`);

    await tx.wait();
    console.log("Confirmed");
    return tx.hash;
  } catch (error: any) {
    console.error("Token transfer failed:", error);
    throw new Error("Token transfer error: " + error.message);
  }
}
