"use client";
import React, { useContext, useEffect, useState } from 'react'
import {TabsDeposit, TabsWithdraw} from '.';
import { MetamaskContext } from '@/contexts/MetamaskContext';


const tokenA = "0x459ed4f0f9398608db761cec80efc2528ba81699"; // HIDR
const tokenB = "0x9343850dbdd5aafac57084f6be7777c736815df5"; // HTHB
const tokenC = "0x8242b1f5b6a067d1eadf3ad5093636188bdfcbc6"; // HPHP


const RampActions = () => {
  const [activeTab, setActiveTab] = useState("Deposit");
  const [ethToUsd, setEthToUsd] = useState(2000);
const [usdToIdr, setUsdToIdr] = useState(17000);
const [usdToPhp, setUsdToPhp] = useState(50);
const [usdToThb, setUsdToThb] = useState(35);

const [tokenBalances, setTokenBalances] = useState<Record<string, number>>({
  [tokenA]: 0,
  [tokenB]: 0,
  [tokenC]: 0,
});
const [nativeBalance, setNativeBalance] = useState<number>(0);

const { metamaskAccountAddress } = useContext(MetamaskContext);

useEffect(() => {
  if (!metamaskAccountAddress){
    setTokenBalances({
      [tokenA]: 0,
      [tokenB]: 0,
      [tokenC]: 0,
   
    });
       setNativeBalance(0);
  }

  const fetchPrices = async () => {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd&vs_currencies=usd,php,idr,thb");
      const data = await res.json();
      setEthToUsd(data.ethereum.usd);
      setUsdToPhp(data.usd.php);
      setUsdToIdr(data.usd.idr);
      setUsdToThb(data.usd.thb);
    } catch (err) {
      console.error("Failed to fetch exchange rates", err);
    }
  };

  fetchPrices();
  const interval = setInterval(fetchPrices, 10_000);
  return () => clearInterval(interval);
}, [metamaskAccountAddress]);


useEffect(() => {
  if (!metamaskAccountAddress) return;

  const fetchBalances = async () => {
    try {
      const tokenRes = await fetch(`https://pharosscan.xyz/api/v2/addresses/${metamaskAccountAddress}/token-balances`);
      const tokenData = await tokenRes.json();
      const balances: Record<string, number> = { [tokenA]: 0, [tokenB]: 0, [tokenC]: 0 };

      tokenData.forEach((entry: any) => {
        const address = entry.token.address.toLowerCase();
        const decimals = parseInt(entry.token.decimals || "18", 10);
        const value = entry.value || "0";
        if ([tokenA, tokenB, tokenC].includes(address)) {
          balances[address] = parseFloat(value) / 10 ** decimals;
        }
      });

      setTokenBalances(balances);

      const nativeRes = await fetch(`https://pharosscan.xyz/api/v2/addresses/${metamaskAccountAddress}`);
      const nativeData = await nativeRes.json();
      const coinBalance = nativeData?.coin_balance || "0";
      setNativeBalance(parseFloat((parseFloat(coinBalance) / 1e18).toFixed(4)));
    } catch (err) {
      console.error("Error fetching balances:", err);
    }
  };

  fetchBalances();
  const interval = setInterval(fetchBalances, 10_000);
  return () => clearInterval(interval);
}, [metamaskAccountAddress]);



  return (
    <>
      <div className="actionsTabsView">
        <div className="flex gap-2 mb-4">
          {["Deposit", "Withdraw"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`button ${activeTab === tab ? "tabButtonActions" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Deposit" && <TabsDeposit
          hidrBalance={tokenBalances[tokenA]}
          hthbBalance={tokenBalances[tokenB]}
          hphpBalance={tokenBalances[tokenC]}
          pharosBalance={nativeBalance}
          ethToUsd={ethToUsd}
          usdToIdr={usdToIdr}
          usdToThb={usdToThb}
          usdToPhp={usdToPhp}
        />}
        {activeTab === "Withdraw" && <TabsWithdraw 
          hidrBalance={tokenBalances[tokenA]}
          hthbBalance={tokenBalances[tokenB]}
          hphpBalance={tokenBalances[tokenC]}
          pharosBalance={nativeBalance}
          ethToUsd={ethToUsd}
          usdToIdr={usdToIdr}
          usdToThb={usdToThb}
          usdToPhp={usdToPhp}
        />}
      </div>
    </>
  );
};

export default RampActions;