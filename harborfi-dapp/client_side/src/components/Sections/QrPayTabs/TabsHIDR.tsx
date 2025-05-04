"use client";

import { useContext, useEffect, useState } from "react";
import { MetamaskContext } from "@/contexts/MetamaskContext";
import { useRouter } from "next/navigation";
import { getMetaMaskWallet } from "@/services/wallets/metamask/metamaskClient";
import QRScanner from "@/components/UI/QRScanner";
import axios from "axios";

const TabsHIDR = ({ balance }: { balance: number }) => {
  const router = useRouter();
  const { metamaskAccountAddress } = useContext(MetamaskContext);
const [isScanning, setIsScanning] =  useState(false);

  const [usdToIdr, setUsdToIdr] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const { data } = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=idr"
        );
        setUsdToIdr(data.usd.idr);
      } catch (err) {
        console.error("Failed to fetch prices:", err);
      }
    };
  
    fetchPrices(); // initial fetch
    const interval = setInterval(fetchPrices, 10_000); // refresh every 10 seconds
  
    return () => clearInterval(interval); // cleanup
  }, []);
  

  const handleDetected = async (qrContent: string) => {
    const wallet = getMetaMaskWallet();
    await wallet.init();
  
    if (!qrContent.startsWith("qrHarbor-IDR") ) {
      alert("Invalid QR Code");
      return;
    } 
  
    setIsScanning(false);
  
    const userWallet = metamaskAccountAddress;
  
    try {
      const { data } = await axios.post("/api/transaction", {
        type: "QR",
        userWallet,
        paymentDetails: {
          qrString: qrContent,
        },
      });
  
      if (data.success && data.tx?.id) {
        router.push(`/transaction/${data.tx.id}`);
      }
  else{    
        alert("Failed to create transaction");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending QR transaction");
    }
  };

  const usdValue = usdToIdr ? (balance / usdToIdr).toFixed(2) : "...";

  return (
    <>
     {isScanning && (
             <QRScanner
             type="HIDR"
             onDetected={handleDetected}
             onCancel={() => setIsScanning(false)}
           />
            )}
    
      <div className="tabsContainer">
        <div className="fieldRow text-start">
          <span className="text-sm">Balance </span>
          {metamaskAccountAddress ?  <div>
            <div className="text-4xl font-bold justify-start">{balance} HIDR</div>
            <div className="text-sm text-gray-500">≈ {usdValue} USD</div>

          </div> : <div className="text-2xl font-bold py-2 px-2">Connect wallet to show HIDR balance and use QR Payment</div>}
         
        </div>
        {metamaskAccountAddress ? 
        <div className="fieldRow">
         <button onClick={() => setIsScanning(true)} className="buttonActions">
            Pay Now
          </button> 
          <div className="flex justify-between mt-1">
            <span className="balancedText">
              1 USD ≈ {usdToIdr?.toFixed(0) ?? "..."} HIDR
            </span>
            <span className="balancedText">Gas Fee: ≈ 0.000035 PHAROS</span>
          </div>
        </div>  : null}
      </div>
    </>
  );
};

export default TabsHIDR;
