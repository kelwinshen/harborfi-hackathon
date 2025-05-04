"use client";
import { useContext, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { Spacer } from "@/components/UI";
import { finalIconSuccess, hidrToken, hphpToken, hthbToken, pharosToken } from "@/img";
import { getMetaMaskWallet } from "@/services/wallets/metamask/metamaskClient";
import { MetamaskContext } from "@/contexts/MetamaskContext";


const tokens = [
  { symbol: "PHAROS", name: "Pharos", image: pharosToken },
  { symbol: "HIDR", name: "Harbor Indonesian Rupiah", image: hidrToken },
  { symbol: "HTHB", name: "Harbor Thai Baht", image: hthbToken },
  { symbol: "HPHP", name: "Harbor Philippines Peso", image: hphpToken },
];



type TokenType = "PHAROS" | "HIDR" | "HTHB" | "HPHP";


const TabsSwap = ({pharosBalance, hidrBalance, hthbBalance, hphpBalance,  ethToUsd, usdToIdr, usdToThb, usdToPhp }:{pharosBalance: number, hidrBalance: number, hthbBalance: number, hphpBalance:number, ethToUsd: number, usdToIdr: number, usdToThb:number, usdToPhp:number }) => {
  const [showConfirm, setShowConfirm] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);
  const [swapAmount, setSwapAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null);

  const [showTokenPopup, setShowTokenPopup] = useState<"from" | "to" | null>(null);


  const tokenMap: Record<string, { address: string; usdRate: number }> = {
    PHAROS: { address: "", usdRate: ethToUsd },
    HIDR: { address: "0x459ed4f0f9398608db761cec80efc2528ba81699", usdRate: 1/usdToIdr },
    HTHB: { address: "0x9343850dbdd5aafac57084f6be7777c736815df5", usdRate: 1/usdToThb },
    HPHP: { address: "0x8242b1f5b6a067d1eadf3ad5093636188bdfcbc6", usdRate: 1/usdToPhp },


    
  };

  const [swapFrom, setSwapFrom] = useState<TokenType>("PHAROS");
  const [swapTo, setSwapTo] = useState<TokenType>("HIDR");
   const { metamaskAccountAddress } = useContext(MetamaskContext);

  // const handleSwap = async () => {
  //   try {
  //     if (swapFrom === swapTo) {
  //       setSwapError("From and To tokens cannot be the same.");
  //       return;
  //     }

  //     setIsSwapping(true);
  //     setSwapError(null);
  //     setSwapTxHash(null);

  //     const wallet = getMetaMaskWallet();
  //     await wallet.init();

  //     let tx;
  //     if (swapFrom === "PHAROS") {
  //       tx = await wallet.swapNativeToToken(tokenMap[swapTo].address, swapAmount);
  //     } else if (swapTo === "PHAROS") {
  //       await wallet.approveToken(tokenMap[swapFrom].address, swapAmount);
  //       tx = await wallet.swapTokenToNative(tokenMap[swapFrom].address, swapAmount);
  //     } else {
  //       await wallet.approveToken(tokenMap[swapFrom].address, swapAmount);
  //       tx = await wallet.swapTokenToToken(
  //         tokenMap[swapFrom].address,
  //         tokenMap[swapTo].address,
  //         swapAmount
  //       );
  //     }

  //     setSwapTxHash(tx.hash);
  //     alert("Swap successful!");
  //   } catch (err: any) {
  //     console.error(err);
  //     setSwapError(err.message || "Swap failed");
  //   } finally {
  //     setIsSwapping(false);
  //   }
  // };
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      setError(null);
      const balance = swapFrom == "HIDR" ? hidrBalance :  swapFrom == "HTHB" ? hthbBalance : swapFrom == "HPHP" ? hphpBalance :  pharosBalance;
      if (parseFloat(swapAmount) > balance  ){
        setError("Your balance is not enough")
      }
    
    }, [metamaskAccountAddress, swapAmount])
    

  const handleConfirmSwap = async () => {
    try {
      if (swapFrom === swapTo) {
        setSwapError("From and To tokens cannot be the same.");
        return;
      }
  
      setIsSwapping(true);
      setSwapError(null);
      setSwapTxHash(null);
      setShowConfirm(false);
  
      const wallet = getMetaMaskWallet();
      await wallet.init();
  
      let tx;
      if (swapFrom === "PHAROS") {
        tx = await wallet.swapNativeToToken(tokenMap[swapTo].address, swapAmount);
      } else if (swapTo === "PHAROS") {
        await wallet.approveToken(tokenMap[swapFrom].address, swapAmount);
        tx = await wallet.swapTokenToNative(tokenMap[swapFrom].address, swapAmount);
      } else {
        await wallet.approveToken(tokenMap[swapFrom].address, swapAmount);
        tx = await wallet.swapTokenToToken(
          tokenMap[swapFrom].address,
          tokenMap[swapTo].address,
          swapAmount
        );
      }
  
      setSwapTxHash(tx.hash);
      setShowSuccess(true);
    } catch (err: any) {
      console.error(err);
      setSwapError(err.message || "Swap failed");
    } finally {
      setIsSwapping(false);
    }
  };
  

  const inputAmount = parseFloat(swapAmount || "0");
  const fromTokenUsdRate = tokenMap[swapFrom].usdRate;
  const toTokenUsdRate = tokenMap[swapTo].usdRate;
  
  const convertedAmount = Math.floor(inputAmount * (fromTokenUsdRate / toTokenUsdRate));
  const fromAmountInUsd = inputAmount * fromTokenUsdRate;
  const toAmountInUsd = convertedAmount * toTokenUsdRate;
  



  const handleTokenSelect = (token: TokenType) => {
    if (showTokenPopup === "from") {
      if (token === swapTo) {
        setSwapError("Cannot select same token for From and To");
        return;
      }
      setSwapFrom(token);
    } else if (showTokenPopup === "to") {
      if (token === swapFrom) {
        setSwapError("Cannot select same token for To and From");
        return;
      }
      setSwapTo(token);
    }
    setSwapAmount("0");
    setShowTokenPopup(null);
  };


  
  return (
    <>
      {showTokenPopup && (
        <div className="fixed inset-0 w-screen h-screen bg-Primary/40 z-10 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md text-Primary">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Select {showTokenPopup === "from" ? "From" : "To"} Token</h2>
              <Icon
                icon="ion:close-outline"
                className="w-6 h-6 cursor-pointer"
                onClick={() => setShowTokenPopup(null)}
              />
            </div>
            <div className="flex flex-col gap-3">
              {tokens
                .filter((t) =>
                  showTokenPopup === "from" ? t.symbol !== swapTo : t.symbol !== swapFrom
                )
                .map((token) => (
                  <button
                  key={token.symbol}
                  className="flex items-center gap-3 p-3 bg-Primary text-white rounded w-full justify-start"
                  onClick={() => handleTokenSelect(token.symbol as TokenType)}
                >
                  <Image src={token.image} alt={token.symbol} className="w-8 h-8" />
                  <div className="text-left">
                    <div className="font-bold">{token.symbol}</div>
                    <div className="text-xs text-white/70">{token.name}</div>
                  </div>
                </button>
                
                ))}
            </div>
          </div>
        </div>
      )}

      <div className="tabsContainer">
        {/* From Token */}
        <div className="fieldRow">
          <div className="font-bold mb-1">From</div>
          <div className="flex justify-between items-center">
            <button onClick={() => setShowTokenPopup("from")}    className="buttonSelectToken">
              <Image src={tokens.find((t) => t.symbol === swapFrom)!.image} alt="from" className="w-8 h-8" />
              <span className="font-semibold">{swapFrom}</span>
            </button>
            <input
  type="text"
  placeholder="0"
  value={swapAmount}
  onChange={(e) => {
    const value = e.target.value;

    // Disallow non-numeric characters except dot
    if (!/^\d*\.?\d*$/.test(value)) return;

    // Disallow negative or leading dot
    if (value.startsWith("-") || value.startsWith(".")) return;

    // If not PHAROS, disallow decimals
    if (swapFrom !== "PHAROS" && value.includes(".")) return;

    setSwapAmount(value);
  }}
  className="inputAmount"
/>

          </div>
          <div className="flex justify-between">
            <span className="balancedText">
              Balance: {swapFrom == "HIDR" ? hidrBalance : swapFrom == "HTHB" ? hthbBalance :  swapFrom == "HPHP" ? hphpBalance : pharosBalance.toFixed(4)} {swapFrom}
            </span>
            <span className="balancedText">{toAmountInUsd.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={() => {
            if (swapFrom !== swapTo) {
              const temp = swapFrom;
              setSwapFrom(swapTo);
              setSwapTo(temp);
              setSwapAmount("0");
            }
          }}
          className="bg-Primary p-2 rounded-full w-fit mx-auto my-2"
          title="Swap direction"
        >
          <Icon icon="mdi:swap-vertical" className="text-white w-6 h-6" />
        </button>

        {/* To Token */}
        <div className="fieldRow">
          <div className="font-bold mb-1">To</div>
          <div className="flex justify-between items-center">
            <button onClick={() => setShowTokenPopup("to")}    className="buttonSelectToken">
              <Image src={tokens.find((t) => t.symbol === swapTo)!.image} alt="to" className="w-8 h-8" />
              <span className="font-semibold">{swapTo}</span>
            </button>
            <input
              type="text"
              value={convertedAmount}
              className="inputAmount text-gray-400"
              readOnly
            />
          </div>
          <div className="flex justify-between">
            <span className="balancedText">
              Balance: {swapTo == "HIDR" ? hidrBalance : swapTo == "HTHB" ? hthbBalance : swapTo == "HPHP" ? hphpBalance : pharosBalance.toFixed(4)} {swapTo}
            </span>
            <span className="balancedText">   <span className="balancedText">{fromAmountInUsd.toFixed(2)}</span> USD</span>
          </div>
        </div>

        {/* Swap Action */}
        <div className="fieldRow">
        <button
  onClick={() => {
const balance = swapFrom == "HIDR" ? hidrBalance :  swapFrom == "HTHB" ? hthbBalance : swapFrom == "HPHP" ? hphpBalance :  pharosBalance;
    
if(!metamaskAccountAddress){
      setError("Please connect your wallet to continue.")
    } else if (parseFloat(swapAmount) > balance  ){
      setError("Your balance is not enough")
    }
    else{
      setShowConfirm(true)
    } 
  }
 }
  disabled={isSwapping}
  className="buttonActions"
>
  {isSwapping ? "Swapping..." : "Swap"}
</button>

          {swapError && (
            <div className="text-sm text-red-400 mt-2 text-center">{swapError}</div>
          )}
         
        <div className="flex justify-end mt-1">
           
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
            <span className="text-lg font-semibold">Review Swap</span>
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
              <span>From</span>
              <span>{inputAmount} {swapFrom}</span>
            </div>
            <div className="flex justify-between">
              <span>To</span>
              <span>{convertedAmount} {swapTo}</span>
            </div>
           
            <div className="flex justify-between font-semibold">
              <span>Total USD Value</span>
              <span>{fromAmountInUsd.toFixed(2)} USD</span>
            </div>
          </div>

          <button
            onClick={handleConfirmSwap}
            disabled={isSwapping}
            className="mt-6 buttonActions"
          >
            {isSwapping ? "Processing..." : "Confirm Swap"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}


{showSuccess && swapTxHash && (
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
          <h2 className="text-2xl font-semibold text-Primary">Swap Successful</h2>
          <Spacer height={16} />

         
          <Spacer height={16} />
          <a
            href={`https://pharosscan.xyz/tx/${swapTxHash}`}
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

export default TabsSwap;
