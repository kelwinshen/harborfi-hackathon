"use client";

import { ethers } from "ethers";
import abiData from "@/app/contractJson/Swap.json";
import { useContext, useEffect } from "react";
import { MetamaskContext } from "@/contexts/MetamaskContext";

const SWAP_CONTRACT_ADDRESS = "0x06f51607a599B2143C40025a6De8cFfF7fB8eB44";
const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
];

const PHAROS_CHAIN_ID_HEX = "0xC352"; // 50002
const PHAROS_RPC = "https://devnet.dplabs-internal.com/";
const PHAROS_EXPLORER = "https://pharosscan.xyz";

const ethereum = typeof window !== "undefined" ? (window as any).ethereum : null;

const getProvider = () => {
  if (typeof window === "undefined") {
    throw new Error("getProvider must only be called in the browser.");
  }
  const ethereum = (window as any).ethereum;
  if (!ethereum) {
    window.open("https://metamask.io/download.html", "_blank");
    throw new Error("MetaMask not installed");
  }
  return new ethers.BrowserProvider(ethereum);
};


async function switchToPharosDevnet() {
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: PHAROS_CHAIN_ID_HEX }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
     
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: PHAROS_CHAIN_ID_HEX,
            chainName: "Pharos Devnet",
            rpcUrls: [PHAROS_RPC],
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
            blockExplorerUrls: [PHAROS_EXPLORER],
          },
        ],
      });
    } else {
      console.error("Failed to switch to Pharos Devnet:", error);
    }
  }
}

class MetaMaskWallet {
  provider: ethers.BrowserProvider;
  signer!: ethers.JsonRpcSigner;
  swapContract!: ethers.Contract;

  constructor() {
    this.provider = getProvider();
  }

  async init() {
    await switchToPharosDevnet(); 
    this.signer = await this.provider.getSigner();
    this.swapContract = new ethers.Contract(SWAP_CONTRACT_ADDRESS, abiData.abi, this.signer);
  }

  async approveToken(tokenAddress: string, amount: string) {
    const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, this.signer);
    const tx = await tokenContract.approve(SWAP_CONTRACT_ADDRESS, ethers.parseUnits(amount, 0));
    await tx.wait();
  }

  async swapNativeToToken(toToken: string, amountInEther: string) {
    const tx = await this.swapContract.swapNativeToToken(toToken, {
      value: ethers.parseEther(amountInEther),
      gasLimit: 1_000_000,
    });
    await tx.wait();
    return tx; 
  }
  
  async swapTokenToNative(fromToken: string, amount: string) {
    const tx = await this.swapContract.swapTokenToNative(
      fromToken,
      ethers.parseUnits(amount, 0),
      { gasLimit: 1_000_000 }
    );
    await tx.wait();
    return tx; 
  }
  
  async swapTokenToToken(fromToken: string, toToken: string, amount: string) {
    const tx = await this.swapContract.swapTokenToToken(
      fromToken,
      toToken,
      ethers.parseUnits(amount, 0),
      { gasLimit: 1_000_000 }
    );
    await tx.wait();
    return tx; 
  }

  async transferNative(toAddress: string, amountInEther: string) {
    const tx = await this.signer.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amountInEther),
      gasLimit: 1_000_000,
    });
    await tx.wait();
    return tx;
  }
  

  async transferToken(tokenAddress: string, toAddress: string, amount: string) {
    const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, this.signer);
    const tx = await tokenContract.transfer(toAddress, ethers.parseUnits(amount, 0)); // assume 0 decimals
    await tx.wait();
    return tx; 
  }
  

  
  
}

 let metamaskWallet: MetaMaskWallet | null = null;

export function getMetaMaskWallet() {
  if (typeof window === "undefined") {
    throw new Error("MetaMaskWallet can only be created in browser environment");
  }
  if (!metamaskWallet) {
    metamaskWallet = new MetaMaskWallet();
  }
  return metamaskWallet;
}



export const MetaMaskClient = () => {
  const { setMetamaskAccountAddress } = useContext(MetamaskContext);
  useEffect(() => {
    try {
      const provider = getProvider();
      provider.listAccounts().then((signers) => {
        if (signers.length !== 0) {
          setMetamaskAccountAddress(signers[0].address);
        } else {
          setMetamaskAccountAddress("");
        }
      });

      ethereum.on("accountsChanged", (accounts: string | any[]) => {
        if(accounts.length > 1){
  window.location.reload();
        }
        if (accounts.length !== 0) {
          setMetamaskAccountAddress(accounts[0]);
        } else {
          setMetamaskAccountAddress("");
        
        }
       
      });

      return () => {
        ethereum.removeAllListeners("accountsChanged");
      }
    } catch (error) {
      console.warn(error);
    }
  }, [setMetamaskAccountAddress]);
}
