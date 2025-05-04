"use client";
import { Spacer } from "@/components/UI";
import {
  bcaIcon,
  bniIcon,
  briIcon,
  mandiriIcon,
  permataIcon,
  qrisIcon,
  hidrToken,
  hthbToken,
  hphpToken,
  pesonet,
  instapay,
  standardChatered,
  qrph,
  promptpay,
} from "@/img";
import { Icon } from "@iconify/react";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { MetamaskContext } from "@/contexts/MetamaskContext"; // make sure path is correct


const allTokens = {
  HIDR: { symbol: "HIDR", image: hidrToken },
  HTHB: { symbol: "HTHB", image: hthbToken },
  HPHP: { symbol: "HPHP", image: hphpToken },
};

const TabsDeposit = ({
  hidrBalance,
  hthbBalance,
  hphpBalance,
  usdToIdr,
  usdToThb,
  usdToPhp,
}: {
  pharosBalance: number;
  hidrBalance: number;
  hthbBalance: number;
  hphpBalance: number;
  ethToUsd: number;
  usdToIdr: number;
  usdToThb: number;
  usdToPhp: number;
}) => {
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<keyof typeof allTokens>("HIDR");
  const [showTokenPopup, setShowTokenPopup] = useState(false);
  const [showMethodPopup, setShowMethodPopup] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const { metamaskAccountAddress } = useContext(MetamaskContext);
  const [showConfirm, setShowConfirm] = useState(false);

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
      setError(null);
      const minimumDeposit = selectedToken == "HIDR" ? 10000 : selectedToken == "HPHP" ? 35 : 20;
      const maximumDeposit = selectedToken == "HIDR" ? 10000000 : selectedToken == "HPHP" ? 35000 : 20000;
      if (amount && parseFloat(amount) < minimumDeposit  ){
        setError(`Minimum of the deposit is ${minimumDeposit} ${selectedToken}`)
      } 

      else if (amount && parseFloat(amount) > maximumDeposit  ){
        setError(`Maximum of the deposit is ${maximumDeposit} ${selectedToken}`)
      } 
    }, [metamaskAccountAddress, amount, selectedMethod])

  const fiatAmount =  parseFloat(amount || "0");

  const balance =
    selectedToken === "HIDR"
      ? hidrBalance
      : selectedToken === "HTHB"
      ? hthbBalance
      : hphpBalance;


      
  const methodOptions = {
    HIDR: [
      { symbol: "BCA", label: "BCA Virtual Account", image: bcaIcon },
      { symbol: "MANDIRI", label: "Mandiri Virtual Account", image: mandiriIcon },
      { symbol: "BNI", label: "BRI Virtual Account", image: bniIcon },
      { symbol: "BRI", label: "BRI Virtual Account", image: briIcon },
      { symbol: "PERMATA", label: "Permata Virtual Account", image: permataIcon },
    ],
    HPHP: [
      { symbol: "UNKNOWN_ENUM_VALUE", label: "PESONet", image: pesonet },
      { symbol: "UNKNOWN_ENUM_VALUE", label: "InstaPay", image: instapay }, 
    ],
    HTHB: [
      { symbol: "UNKNOWN_ENUM_VALUE", label: "Standard Chartered Bank", image: standardChatered },
    ],
  };
  

  const getMethodDisplay = () => {
    if (!selectedMethod) return null;
  
    if (selectedMethod === "QR") {
      return {
        label:
          selectedToken === "HIDR"
            ? "QRIS"
            : selectedToken === "HPHP"
            ? "QRPh"
            : "PromptPay",
        icon:
          selectedToken === "HIDR"
            ? qrisIcon
            : selectedToken === "HPHP"
            ? qrph
            : promptpay,
      };
    }


  
    const method = methodOptions[selectedToken].find(
      (m) => m.symbol === selectedMethod
    );
    return method ? { label: method.label, icon: method.image } : null;
  };

  const selected = getMethodDisplay();
  

  const handleConfirm = async () => {
    if (!amount) return alert("Please enter amount.");
    if (!selectedMethod) return alert("Select a transfer method.");
    if (!metamaskAccountAddress) return alert("Wallet not connected.");

    const payload = {
      type: "DEPOSIT",
      userWallet: metamaskAccountAddress,
      tokenType: selectedToken,
      fiatCurrency:
        selectedToken === "HIDR"
          ? "IDR"
          : selectedToken === "HTHB"
          ? "THB"
          : "PHP",
      fiatAmount: fiatAmount,
      tokenAmount: parseFloat(amount),
      paymentDetails: {
        method: selectedMethod == "QR" ? "QR" : "VA",
        channelCode: selectedMethod,
      },
    };

    try {
      const res = await fetch("/api/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data?.tx?.id) {
        router.push(`/transaction/${data.tx.id}`);
      } else {
        // alert("Transaction created but missing ID");
      }
    } catch (err) {
      console.error("Transaction failed", err);
     
    }
  };

  return (
    <>
      {/* Token Selection Popup */}
      {showTokenPopup && (
        <div className="fixed inset-0 w-screen h-screen bg-black/40 z-10 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md text-Primary">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Select Token</h2>
              <Icon
                icon="ion:close-outline"
                className="w-6 h-6 cursor-pointer"
                onClick={() => setShowTokenPopup(false)}
              />
            </div>
            <div className="flex flex-col gap-3">
              {Object.keys(allTokens).map((key) => {
                const token = allTokens[key as keyof typeof allTokens];
                return (
                  <button
                    key={token.symbol}
                    className="flex items-center gap-3 p-3 bg-Primary text-white rounded w-full justify-start"
                    onClick={() => {
                      setSelectedToken(token.symbol as keyof typeof allTokens);
                      setAmount(""); // reset input
                      setShowTokenPopup(false);
                    }}
                  >
                    <Image src={token.image} alt={token.symbol} className="w-8 h-8" />
                    <div className="text-left">
                      <div className="font-bold">{token.symbol}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Method Popup */}
      {showMethodPopup && (
        <div className="fixed inset-0 w-screen h-screen bg-Primary/40 z-10 overflow-y-scroll">
          <div className="w-full h-full container mx-auto flex flex-col justify-center items-center text-Primary px-8">
            <div className="bg-white flex-col rounded-lg p-8 w-full lg:w-[60%] mt-[100px]">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Select Transfer Method</span>
                <Icon
                  icon="ion:close-outline"
                  className="text-Primary w-4 h-4 md:w-8 md:h-8 cursor-pointer"
                  onClick={() => setShowMethodPopup(false)}
                />
              </div>
              <Spacer height={20} />
              <div className="flex flex-col gap-4">
                <span>Virtual Account</span>
                {methodOptions[selectedToken].map((method) => (
  <div
    key={method.symbol}
    onClick={() => {
      setSelectedMethod(method.symbol); 
      setShowMethodPopup(false);
    }}
    
    className={`flex flex-row gap-4 items-center ${
 "bg-Primary text-white"
    }  rounded px-4 py-2 cursor-pointer`}
  >
    <Image src={method.image} alt={method.symbol} className="w-8 h-8" />
    <div className="flex flex-col gap-0">
      <span className="font-semibold text-lg">{method.label}</span>
      <span className=" text-xs">
                      Fee: 2% from the transaction amount
                    </span>
     
    </div>
  </div>
))}

              </div>

              <Spacer height={20} />

              <div className="flex flex-col gap-4">
                <span>QR Method</span>
                <div
                  className="flex flex-row gap-4 items-center bg-Primary text-white rounded px-4 py-2 cursor-pointer"
                  onClick={() => {
                    setSelectedMethod("QR");
                    setShowMethodPopup(false);
                  }}
                >
                  <Image src={selectedToken == "HIDR" ?  qrisIcon : selectedToken =="HPHP" ? qrph : promptpay} alt="QR" className="rounded w-8 h-8" />
                  <div className="flex flex-col gap-0">
                    <span className="font-semibold text-lg">{selectedToken == "HIDR" ?  "QRIS" : selectedToken =="HPHP" ? "QRPh" : "Promtpay"}</span>
                    <span className=" text-xs">
                      Fee: 2% from the transaction amount <br /> {selectedToken == "HIDR" ? 
                      "Available: GoPay, OVO, Shopee Pay, Link Aja, Astra Pay, Jenius Pay" : selectedToken == "HPHP" ? "Available: Maya (PayMaya), GrabPay, GCash, ShopeePay" : "Available: WechatPay, LINE Pay, Shopee Pay , TrueMoney"}
                    </span>
    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="tabsContainer">
        {/* Receive Token (Input) */}
        <div className="fieldRow">
          <span className="font-bold">You Will Receive</span>
          <div className="flex justify-between">
            <button className="buttonSelectToken" onClick={() => setShowTokenPopup(true)}>
              <Image src={allTokens[selectedToken].image} alt="token" className="w-8 h-8" />
              <span className="font-semibold">{selectedToken}</span>
            </button>
            <input
              type="text"
              placeholder="0"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) setAmount(val);
              }}
              className="inputAmount"
            />
          </div>
          <div className="flex justify-between">
            <span className="balancedText">
              Balance: {balance.toFixed(0)} {selectedToken}
            </span>
            <span className="balancedText">{!amount ? "0.00" : selectedToken == "HIDR" ? (parseFloat(amount)/usdToIdr).toFixed(2) : selectedToken == "HPHP" ? (parseFloat(amount)/usdToPhp).toFixed(2)  : (parseFloat(amount)/usdToThb).toFixed(2)} USD</span>
          </div>
        </div>

        {/* Fiat Preview */}
        <div className="fieldRow">
          <span className="font-bold">You Will Pay</span>
          <div className="flex justify-between">
            <button className="buttonSelectToken" disabled>
              <span className="font-semibold">
                {selectedToken === "HIDR" ? "IDR" : selectedToken === "HTHB" ? "THB" : "PHP"}
              </span>
            </button>
            <input
              type="text"
              value={fiatAmount || ""}
              readOnly
              className="inputAmount text-gray-400"
            />
          </div>
        </div>

        {/* Transfer Method */}
        <div className="fieldRow">
          <span className="font-bold">Transfer Method</span>
          <button className="buttonActions" onClick={() => setShowMethodPopup(true)}>
            <div className="flex justify-between items-center px-4">
            <div className="flex gap-2 items-center">
              
  {selected && (
    <Image
      src={selected.icon}
      alt={selected.label}
      className="w-6 h-6 "
    />
  )}
  <span>{selected ? selected.label : "Select transfer method"}</span>
</div>

            </div>
          </button>
        </div>

        {/* Confirm */}
        <div className="fieldRow">
        <button
  className="buttonActions"
  onClick={() => 
  {
    const maximumDeposit = selectedToken == "HIDR" ? 10000000 : selectedToken == "HPHP" ? 350000 : 50000;
    const minimumDeposit = selectedToken == "HIDR" ? 10000 : selectedToken == "HPHP" ? 35 : 20;
    if(!metamaskAccountAddress){
      setError("Please connect your wallet to continue.")
    } 
    else if (parseFloat(amount) == 0 || !amount  ){
      setError(`Input the deposit amount first.`)
    } else if (!selectedMethod){
      setError(`Select the payment method to continue.`)
    } else  if (amount && parseFloat(amount) > maximumDeposit  ){
      setError(`Maximum of the deposit is ${maximumDeposit} ${selectedToken}`)
      
    }  else  if (amount && parseFloat(amount) < minimumDeposit  ){
      setError(`Minimum of the deposit is ${minimumDeposit} ${selectedToken}`)
      
    } 
    else{
      setShowConfirm(true)
    } 
  }
  
}
>
  Confirm
</button>


          <div className="flex justify-between">
            <span className="balancedText">Stable Rate</span>
            <span className="balancedText">1 {selectedToken} = 1 {selectedToken === "HIDR" ? "IDR" : selectedToken === "HTHB" ? "THB" : "PHP"}</span>
          </div>
          {error && <div className="text-red-400 text-sm text-center mt-2">{error}</div>}
        </div>
     
      </div>
      {showConfirm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="w-full max-w-md bg-Primary rounded-xl p-6 mx-4">
      <div className="tabsContainer">
        <div className="fieldRow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Review Deposit</span>
            <Icon
              icon="material-symbols-light:close-rounded"
              width="24"
              height="24"
              onClick={() => setShowConfirm(false)}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2 text-sm text-Primary">
           
            <div className="flex justify-between">
              <span>Amount</span>
              <span>{amount} {selectedToken}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method</span>
              <span>{selected?.label}</span>
            </div>
            <div className="flex justify-between">
              <span>Wallet</span>
              <span className="truncate max-w-[50%] text-right">
                {metamaskAccountAddress?.slice(0, 6)}...{metamaskAccountAddress?.slice(-4)}
              </span>
            </div>
            <hr className="my-2 border-white/10" />
            <div className="flex justify-between">
              <span>Fiat Value</span>
              <span>{fiatAmount.toLocaleString()} {selectedToken === "HIDR" ? "IDR" : selectedToken === "HTHB" ? "THB" : "PHP"}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee (2%)</span>
              <span>{Math.ceil(fiatAmount * 0.02).toLocaleString()} {selectedToken === "HIDR" ? "IDR" : selectedToken === "HTHB" ? "THB" : "PHP"}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total Payable</span>
              <span>{Math.ceil(fiatAmount * 1.02).toLocaleString()} {selectedToken === "HIDR" ? "IDR" : selectedToken === "HTHB" ? "THB" : "PHP"}</span>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="mt-6 buttonActions"
          >
            Confirm Deposit
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </>
  );
};

export default TabsDeposit;
