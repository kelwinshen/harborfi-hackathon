# Coin Studio

Coin Studio is a lightweight stablecoin development suite that demonstrates how to deploy stablecoins such as HIDR, HTHB, and HPHP. The project also includes a near real-time price feed oracle using **Supra Oracles**, allowing secure on-chain price execution and free web-based access for reference.

---

##  Project Overview

- Deploy custom ERC-20 tokens representing local fiat (IDR, THB, PHP)
- Execute secure and real-time swap pricing through Supra Oracle
- Expose a read-only web API for price display (free and public)
- Enable low-friction integrations with platforms like HarborFi

---

## 📦 Tokens Deployed

- **HIDR** → Stablecoin pegged to Indonesian Rupiah  
- **HTHB** → Stablecoin pegged to Thai Baht  
- **HPHP** → Stablecoin pegged to Philippine Peso  

Each token uses `decimals = 0` to reflect *real-world fiat behavior* (e.g., IDR has no cents).

---

## 🔧 Step-by-Step Implementation Guide

## Step-by-Step Implementation Guide

### 1. Smart Contract Setup

1. **Navigate to Remix IDE:**
   - Go to [Remix Ethereum](https://remix.ethereum.org).
   
2. **Upload Smart Contract Files:**
   - Upload the necessary smart contract files into the IDE.

3. **Compile Contracts:**
   - Compile each contract step-by-step to ensure compatibility between related contracts.
   
### 2. ABI and Bytecode Integration

1. **Copy ABI and Bytecode:**
   - After successful compilation, copy the generated ABI and bytecode.
   
2. **Artifact Directory:**
   - Place the copied ABI and bytecode into the designated `artifacts` directory in your project.

### 3. Environment Configuration

1. **Install Dotenv:**
   - Ensure the `dotenv` package is installed by running the following command:

 --------------------------------
   npm install dotenv
 --------------------------------  

2. Set Up Environment Variables:
Rename .env.sample to .env.
Update the .env file with your private key and wallet address.
If you need a Pharos Devnet account, create at Metamask and ask for faucet in Pharos Devnet Guide.


### 4.Testing the Coin Smart Contract

1. Run Test Script:

Execute the following command to test the smart contract:
-----------------------------
[tokenSymbol].js
-----------------------------


2. Verify Deployment by check the console of the deployment that already test the functional of the smartcontract.

Ensure the smart contract is correctly deployed and capable of doing what we needed and compatible to the swap contract.


# Acknowledgements
- Thanks to HarborFi that already provide blockchain infrastrucure that have incredible performance to handle deploy and execute smartcontract properly.
- Remix IDE - The online Solidity IDE used to write and deploy the smart contract.