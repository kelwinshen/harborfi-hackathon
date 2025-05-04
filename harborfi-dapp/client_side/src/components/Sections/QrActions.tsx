"use client";

import React, { useContext, useEffect, useState } from "react";
import { TabsHIDR, TabsHTHB, TabsHPHP } from ".";
import { MetamaskContext } from "@/contexts/MetamaskContext";


// Token addresses (same as your constants)
const tokenA = "0x459ed4f0f9398608db761cec80efc2528ba81699".toLowerCase(); // HIDR
const tokenB = "0x9343850dbdd5aafac57084f6be7777c736815df5".toLowerCase(); // HTHB
const tokenC = "0x8242b1f5b6a067d1eadf3ad5093636188bdfcbc6".toLowerCase(); // HPHP

const QrActions = () => {
  const [activeTab, setActiveTab] = useState("HIDR");
  const { metamaskAccountAddress  } = useContext(MetamaskContext);
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>({
    [tokenA]: 0,
    [tokenB]: 0,
    [tokenC]: 0,
  });

  useEffect(() => {
    if (!metamaskAccountAddress){
      setTokenBalances({
        [tokenA]: 0,
        [tokenB]: 0,
        [tokenC]: 0,
      });
    }
  
    const fetchBalances = async () => {
      try {
        const res = await fetch(`https://pharosscan.xyz/api/v2/addresses/${metamaskAccountAddress}/token-balances`);
        const data = await res.json();
        const balances: Record<string, number> = { [tokenA]: 0, [tokenB]: 0, [tokenC]: 0 };
  
        data.forEach((entry: any) => {
          const address = entry.token.address.toLowerCase();
          const decimals = parseInt(entry.token.decimals || "18", 10);
          const value = entry.value || "0";
          if ([tokenA, tokenB, tokenC].includes(address)) {
            balances[address] = parseFloat(value) / 10 ** decimals;
          }
        });
  
        setTokenBalances(balances);
      } catch (err) {
        console.error("❌ Error fetching balances:", err);
      }
    };
  
    fetchBalances(); // initial fetch
    const interval = setInterval(fetchBalances, 10_000); 
  
    return () => clearInterval(interval); 
  }, [metamaskAccountAddress]);
  

  return (
    <div className="actionsTabsView">
      <div className="flex gap-2 mb-4">
        {["HIDR", "HTHB", "HPHP"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`button ${activeTab === tab ? "tabButtonActions" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "HIDR" && <TabsHIDR balance={tokenBalances[tokenA]} />}
      {activeTab === "HTHB" && <TabsHTHB balance={tokenBalances[tokenB]} />}
      {activeTab === "HPHP" && <TabsHPHP balance={tokenBalances[tokenC]} />}
    </div>
  );
};

export default QrActions;
