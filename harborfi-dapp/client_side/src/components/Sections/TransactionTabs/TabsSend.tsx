"use client";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { pharosToken, hidrToken, hthbToken, hphpToken, finalIconSuccess } from "@/img";
import { getMetaMaskWallet } from "@/services/wallets/metamask/metamaskClient";
import { MetamaskContext } from "@/contexts/MetamaskContext";

const allTokens = {
  PHAROS: { symbol: "PHAROS", image: pharosToken, usdRate: "ethToUsd", address: "" },
  HIDR: { symbol: "HIDR", image: hidrToken, usdRate: "usdToIdr", address: "0x459ed4f0f9398608db761cec80efc2528ba81699" },
  HTHB: { symbol: "HTHB", image: hthbToken, usdRate: "usdToThb", address: "0x9343850dbdd5aafac57084f6be7777c736815df5" },
  HPHP: { symbol: "HPHP", image: hphpToken, usdRate: "usdToPhp", address: "0x8242b1f5b6a067d1eadf3ad5093636188bdfcbc6" },
};

const TabsSend = ({
  pharosBalance,
  hidrBalance,
  hthbBalance,
  hphpBalance,
  ethToUsd,
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
  const [selectedToken, setSelectedToken] = useState<keyof typeof allTokens>("PHAROS");
  const [showTokenPopup, setShowTokenPopup] = useState(false);
  const [sendAmount, setSendAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentTxHash, setSentTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);

   const { metamaskAccountAddress } = useContext(MetamaskContext);
  const token = allTokens[selectedToken];
  const usdRate =
    selectedToken === "PHAROS"
      ? ethToUsd
      : selectedToken === "HIDR"
      ? 1 / usdToIdr
      : selectedToken === "HTHB"
      ? 1 / usdToThb
      : 1 / usdToPhp;

  const balance =
    selectedToken === "PHAROS"
      ? pharosBalance
      : selectedToken === "HIDR"
      ? hidrBalance
      : selectedToken === "HTHB"
      ? hthbBalance
      : hphpBalance;

  const amount = parseFloat(sendAmount || "0");


      useEffect(() => {
        setError(null);
        if (parseFloat(sendAmount) > balance  )return setError("Your balance is not enough.")
      
      }, [metamaskAccountAddress, sendAmount])

  const validateAddress = (address: string) => {
    if (!address.startsWith("0x")) return false;
    if (address.length !== 42) return false;
    return /^[0-9a-fA-F]{40}$/.test(address.slice(2));
  };
 

  const handleSend = async () => {

    const balance = selectedToken  == "HIDR" ? hidrBalance :  selectedToken == "HTHB" ? hthbBalance : selectedToken == "HPHP" ? hphpBalance :  pharosBalance;
    
    if(!metamaskAccountAddress )  return setError("Please connect your wallet to continue.")
    
    if (!sendAmount || amount <= 0) return setError("Please enter a valid amount.");
    if (!recipientAddress || !validateAddress(recipientAddress)) {
      return setError("Invalid wallet address.");
      
    }
    if (parseFloat(sendAmount) > balance  )return setError("Your balance is not enough.")

    setShowConfirm(true);
  };


  const handleConfirmSend = async () => {
    try {
      setIsSending(true);
      setError(null);
      setSentTxHash(null);
      setShowConfirm(false);
  
      const wallet = getMetaMaskWallet();
      await wallet.init();
  
      let tx;
      if (selectedToken === "PHAROS") {
        tx = await wallet.transferNative(recipientAddress, sendAmount);
      } else {
        tx = await wallet.transferToken(token.address, recipientAddress, sendAmount);
      }
  
      setSentTxHash(tx.hash);
      setShowSuccess(true);
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setIsSending(false);
    }
  };
  

  
  return (
    <>
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
                      setSendAmount("");
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

      <div className="tabsContainer">
        {/* Token & Amount */}
        <div className="fieldRow">
          <div className="flex justify-start">
            <span className="font-bold">Sending</span>
          </div>
          <div className="flex justify-between">
            <button className="buttonSelectToken" onClick={() => setShowTokenPopup(true)}>
              <Image src={token.image} alt={selectedToken} className="w-8 h-8" />
              <span className="font-semibold">{selectedToken}</span>
            </button>
            <input
              type="text"
              placeholder="0"
              className="inputAmount"
              value={sendAmount}
              onChange={(e) => {
                if (error) setError(null);
                const val = e.target.value;
                if (!/^\d*\.?\d*$/.test(val)) return;
                if (selectedToken !== "PHAROS" && val.includes(".")) return;
                setSendAmount(val);
               
              }}
            />
          </div>
          <div className="flex justify-between">
            <span className="balancedText">
              Balance: {selectedToken == "PHAROS" ? balance.toFixed(6) :  balance.toFixed(0)} {selectedToken}
            </span>
            <span className="balancedText">{(amount * usdRate).toFixed(2)} USD</span>
          </div>
        </div>

        {/* Recipient */}
        <div className="fieldRow">
          <span className="font-bold">Send to</span>
          <input
            type="text"
            name="walletAddress"
            className="border border-Primary rounded py-2 p-1 w-full"
            placeholder="Wallet Address"
            value={recipientAddress}
            onChange={(e) => {
              if (error) setError(null);
              setRecipientAddress(e.target.value)}
              
            }
          />
        </div>

        {/* Action */}
        <div className="fieldRow">
          <button className="buttonActions" onClick={handleSend} disabled={isSending}>
            {isSending ? "Sending..." :"Send" }
          </button>
          <div className="flex justify-end text-sm mt-2">
           
            <span className="balancedText">Gas Fee: ≈ 0.000035 PHAROS</span>
          </div>
          {error && <div className="text-red-400 text-sm text-center mt-2">{error}</div>}
          
        </div>
        {showConfirm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="w-full max-w-md bg-Primary rounded-xl p-6 mx-4">
      <div className="tabsContainer">
        <div className="fieldRow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Review Send</span>
            <Icon
              icon="material-symbols-light:close-rounded"
              width="24"
              height="24"
              onClick={() => setShowConfirm(false)}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Token</span>
              <span>{selectedToken}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount</span>
              <span>{sendAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Recipient</span>
              <span className="truncate max-w-[50%] text-right">
  {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
</span>

            </div>
            <hr className="my-2 border-white/10" />
            <div className="flex justify-between font-semibold">
              <span>Total USD</span>
              <span>{(amount * usdRate).toFixed(2)} USD</span>
            </div>
          </div>

          <button
            onClick={handleConfirmSend}
            disabled={isSending}
            className="mt-6 buttonActions"
          >
            {isSending ? "Sending..." : "Confirm Send"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{showSuccess && sentTxHash && (
  <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
    <div className="w-full max-w-md bg-Primary rounded-xl p-6">
      <div className="tabsContainer">
        <div className="fieldRow text-center">
          <div className="flex justify-end">
            <Icon
              icon="material-symbols-light:close-rounded"
              width="24"
              height="24"
              className="cursor-pointer"
              onClick={() => setShowSuccess(false)}
            />
          </div>

        

         <Image
            src={finalIconSuccess} // Replace with your actual success image or `finalIconSuccess`
            alt="success"
            className="max-w-[200px] mx-auto my-4"
          />
          <h2 className="text-2xl font-semibold text-Primary">Send Successful</h2>

          <a
            href={`https://pharosscan.xyz/tx/${sentTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="buttonActions mt-4"
          >
           View on Chain
          </a>
        </div>
      </div>
    </div>
  </div>
)}

      </div>
    </>
  );
};

export default TabsSend;
