"use client";

import { Spacer } from "@/components/UI";
import {
  hidrToken,
  hthbToken,
  hphpToken,

  bcaIcon,
  mandiriIcon,
  briIcon,
  bniIcon,
  permataIcon,
  bdo,
  bpi,
  metro,
  krungthai,
  kasikorn,
  scb,
} from "@/img";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MetamaskContext } from "@/contexts/MetamaskContext";

const allTokens = {
  HIDR: { symbol: "HIDR", image: hidrToken, currency: "IDR" },
  HTHB: { symbol: "HTHB", image: hthbToken, currency: "THB" },
  HPHP: { symbol: "HPHP", image: hphpToken, currency: "PHP" },
};

const methodOptions = {
  HIDR: [
    { symbol: "ID_BCA", label: "Bank Central Asia (BCA)", image: bcaIcon },
    { symbol: "ID_MANDIRI", label: "Bank Mandiri", image: mandiriIcon },
    { symbol: "ID_BRI", label: "Bank Rakyat Indonesia (BRI)", image: briIcon },
    { symbol: "ID_BNI", label: "Bank Negara Indonesia (BNI)", image: bniIcon },
    { symbol: "ID_PERMATA", label: "Bank Permata", image: permataIcon },
  ],
  HPHP: [
    { symbol: "PH_BDO", label: "Banco De Oro (BDO)", image: bdo },
    { symbol: "PH_BPI", label: "Bank of the Philippine Islands (BPI)", image: bpi },
    { symbol: "PH_MET", label: "Metrobank", image: metro },
  ],
  HTHB: [
    { symbol: "TH_KTB", label: "Krung Thai Bank (KTB)", image: krungthai },
    { symbol: "TH_KKB", label: "Kasikornbank (KBank)", image: kasikorn },
    { symbol: "TH_SCB", label: "Siam Commercial Bank (SCB)", image: scb },
  ],
};



const TabsWithdraw = ({
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
  const { metamaskAccountAddress } = useContext(MetamaskContext);
  const [selectedToken, setSelectedToken] = useState<keyof typeof allTokens>("HIDR");
  const [amount, setAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [showTokenPopup, setShowTokenPopup] = useState(false);
  const [showMethodPopup, setShowMethodPopup] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const router = useRouter();

  const tokenInfo = allTokens[selectedToken];
  const balance =
    selectedToken === "HIDR"
      ? hidrBalance
      : selectedToken === "HTHB"
      ? hthbBalance
      : hphpBalance;

  const fiatAmount = parseFloat(amount || "0");

  const selected = methodOptions[selectedToken].find(m => m.symbol === withdrawMethod);

  
  
   useEffect(() => {
        setError("");
        const minimumWithdrawal = selectedToken == "HIDR" ? 10000 : selectedToken == "HPHP" ? 35 : 20;
        const maximumWithdrawal = selectedToken == "HIDR" ? 10000000 : selectedToken == "HPHP" ? 35000 : 20000;
        if (amount && parseFloat(amount) < minimumWithdrawal  ){
          setError(`Minimum of the withdraw is ${minimumWithdrawal} ${selectedToken}`)
        } 
  
        else if (amount && parseFloat(amount) > maximumWithdrawal  ){
          setError(`Maximum of the withdraw is ${maximumWithdrawal} ${selectedToken}`)
        } 
      }, [metamaskAccountAddress, amount, withdrawMethod, accountNumber])
  

  const handleConfirm = async () => {
    const payload = {
      type: "WITHDRAWAL",
      userWallet: metamaskAccountAddress,
      tokenType: selectedToken,
      fiatCurrency: tokenInfo.currency,
      fiatAmount,
      tokenAmount: fiatAmount,
      paymentDetails: {
        method: withdrawMethod,
        accountNumber,
        accountHolderName: accountName,
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
      {/* Token Popup */}
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
                      setAmount("");
                      setShowTokenPopup(false);
                    }}
                  >
                    <Image src={token.image} alt={token.symbol} className="w-8 h-8" />
                    <div className="text-left font-bold">{token.symbol}</div>
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
                <span className="text-lg font-semibold">Select Withdrawal Method</span>
                <Icon
                  icon="ion:close-outline"
                  className="text-Primary w-4 h-4 md:w-8 md:h-8 cursor-pointer"
                  onClick={() => setShowMethodPopup(false)}
                />
              </div>
              <Spacer height={20} />
              <div className="flex flex-col gap-4">
                {methodOptions[selectedToken].map((method) => (
                  <div
                    key={method.symbol}
                    onClick={() => {
                      setWithdrawMethod(method.symbol);
                      setShowMethodPopup(false);
                    }}
                    className="flex flex-row gap-4 items-center bg-Primary text-white rounded px-4 py-2 cursor-pointer"
                  >
                    <Image src={method.image} alt={method.symbol} className="w-8 h-8" />
                    <div className="flex flex-col gap-0">
                      <span className="font-semibold text-lg">{method.label}</span>
                      <span className="text-xs">Fee: 2% from the transaction amount</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Form */}
      <div className="tabsContainer">
        {/* Token + Amount */}
        <div className="fieldRow">
          <span className="font-bold">Withdraw</span>
          <div className="flex justify-between">
            <button className="buttonSelectToken" onClick={() => setShowTokenPopup(true)}>
              <Image src={tokenInfo.image} alt="token" className="w-8 h-8" />
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
            <span className="balancedText">{amount || "0"} {tokenInfo.currency}</span>
          </div>
        </div>

        {/* Method */}
        <div className="fieldRow">
          <span className="font-bold">Withdraw Method</span>
          <button className="buttonActions" onClick={() => setShowMethodPopup(true)}>
            <div className="flex items-center gap-2 px-4">
              {selected && <Image src={selected.image} alt={selected.label} className="w-6 h-6" />}
              <span>{selected ? selected.label : "Select withdraw method"}</span>
            </div>
          </button>
        </div>

        {/* Bank Info */}
        <div className="fieldRow">
  <label className="font-bold">Account Number</label>
  <div className="flex gap-2">
    <input
      type="text"
      value={accountNumber}
      onChange={(e) => {
        setAccountNumber(e.target.value);
        setAccountName(""); // reset mock name
      }}
      className="w-full bg-white rounded px-4 py-2 text-black border-none outline-none focus:outline-none focus:ring-0"
      placeholder="Enter account number"
    />
    <button
      onClick={() => {
        if (!accountNumber || accountNumber.length < 8) {
          setError("Enter a valid account number before checking.");
          return;
        }

        // Mock logic — obfuscate some characters
       
        const maskWord = (word: string) => {
          if (word.length <= 2) return word[0] + "*";
          return (
            word[0] +
            "*".repeat(Math.max(1, word.length - 2)) +
            word[word.length - 1]
          );
        };
        
        const mockName = "KELWIN SHEN";
        const maskedName = mockName
          .split(" ")
          .map(maskWord)
          .join(" ");

        setAccountName(maskedName);
      }}
      className="bg-Primary text-white px-4 rounded"
    >
      Check
    </button>
  </div>
  {accountName && (
    <p className="text-sm text-green-500 mt-2">
      Account Name: <span className="font-semibold">{accountName}</span>
    </p>
  )}
</div>



        {/* Confirm */}
        <div className="fieldRow">
          <button
            className="buttonActions"
            onClick={() => {

              const minimumWithdrawal = selectedToken == "HIDR" ? 10000 : selectedToken == "HPHP" ? 35 : 20;
              const maximumWithdrawal = selectedToken == "HIDR" ? 10000000 : selectedToken == "HPHP" ? 35000 : 20000;


              if (!metamaskAccountAddress) return setError("Connect your wallet to continue.");
             
            else if (parseFloat(amount) == 0 || !amount  ){
              setError(`Input the withdrawal amount first.`)
            } else if (!withdrawMethod){
              setError(`Select the withdraw method to continue.`)
            } else  if (amount && parseFloat(amount) > maximumWithdrawal  ){
      setError(`Maximum of the withdrawal is ${maximumWithdrawal} ${selectedToken}`)
    }  else  if (amount && parseFloat(amount) < minimumWithdrawal  ){
      setError(`Minimum of the withdrawal is ${minimumWithdrawal} ${selectedToken}`)
      
    } else if(!accountName){
      setError(`Please check withdrawal destination until valid.`)
    }
    else{
              setShowConfirm(true);
            }
         
            }}
          >
            Confirm
          </button>
          {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-Primary rounded-xl p-6 mx-4">
            <div className="tabsContainer">
              <div className="fieldRow">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Review Withdrawal</span>
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
                    <span>Method</span>
                    <span>{selected?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account Name</span>
                    <span>{accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account Number</span>
                    <span>{accountNumber}</span>
                  </div>
                  <hr className="my-2 border-white/10" />
                  <div className="flex justify-between font-semibold">
                    <span>Total Received</span>
                    <span>{(Math.floor(fiatAmount * 0.98))} {tokenInfo.currency}</span>
                  </div>
                </div>
                <button onClick={handleConfirm} className="mt-6 buttonActions">
                  Confirm Withdrawal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TabsWithdraw;
