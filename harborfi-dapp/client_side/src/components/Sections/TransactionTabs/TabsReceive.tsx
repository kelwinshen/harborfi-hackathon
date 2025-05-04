"use client";
import { useState, useContext } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { pharosToken, hidrToken, hthbToken, hphpToken } from "@/img";
import { MetamaskContext } from "@/contexts/MetamaskContext";

const allTokens = {
  PHAROS: { symbol: "PHAROS", image: pharosToken },
  HIDR: { symbol: "HIDR", image: hidrToken },
  HTHB: { symbol: "HTHB", image: hthbToken },
  HPHP: { symbol: "HPHP", image: hphpToken },
};

const TabsReceive = ({
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
  const [copied, setCopied] = useState(false);

  const { metamaskAccountAddress } = useContext(MetamaskContext);

  const balance =
    selectedToken === "PHAROS"
      ? pharosBalance
      : selectedToken === "HIDR"
      ? hidrBalance
      : selectedToken === "HTHB"
      ? hthbBalance
      : hphpBalance;

  const usdRate =
    selectedToken === "PHAROS"
      ? ethToUsd
      : selectedToken === "HIDR"
      ? 1 / usdToIdr
      : selectedToken === "HTHB"
      ? 1 / usdToThb
      : 1 / usdToPhp;

  const token = allTokens[selectedToken];

  const handleCopy = () => {
    if (!metamaskAccountAddress) return;
    navigator.clipboard.writeText(metamaskAccountAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        {/* Token balance section */}
        <div className="fieldRow">
          <div className="flex justify-start">
            <span className={metamaskAccountAddress ? "font-bold" : "text-2xl font-bold py-2 px-2"} >{metamaskAccountAddress ?" Your Balance" : "Please connect your wallet to see balance and get address for receive."}</span>
          </div>

      {metamaskAccountAddress ? <div>

        <div className="flex justify-between">
            <button
              className="buttonSelectToken"
              onClick={() => setShowTokenPopup(true)}
            >
              <Image src={token.image} alt={token.symbol} className="w-8 h-8" />
              <span className="font-semibold">{selectedToken}</span>
            </button>
            <input
              type="text"
              className="inputAmount text-gray-400"
              readOnly
              value={selectedToken === "PHAROS" ? balance.toFixed(6) : balance.toFixed(0)}
            />
          </div>
          <div className="flex justify-between">
            <span className="balancedText">
              Balance:{" "}
              {selectedToken === "PHAROS" ? balance.toFixed(6) : balance.toFixed(0)}{" "}
              {selectedToken}
            </span>
            <span className="balancedText">{(balance * usdRate).toFixed(2)} USD</span>
          </div>
      </div> : null}
         
        </div>

        {/* Wallet Address section */}

       {metamaskAccountAddress ?  <div className="fieldRow">
          <span className="font-bold">Your Wallet Address</span>
          <div className="flex items-center gap-3">
            <span className="truncate max-w-[60%] text-sm">
              {metamaskAccountAddress
                ? `${metamaskAccountAddress.slice(0, 6)}...${metamaskAccountAddress.slice(-4)}`
                : "Not Connected"}
            </span>
            <Icon
              icon="mdi:content-copy"
              className="w-5 h-5 text-Primary cursor-pointer"
              onClick={handleCopy}
            />
          </div>
          {copied && (
            <div className="text-xs text-green-500 mt-1">Copied to clipboard!</div>
          )}
        </div>  : null}
      </div>
    </>
  );
};

export default TabsReceive;
