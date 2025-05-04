'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { getMetaMaskWallet } from "@/services/wallets/metamask/metamaskClient";
import { QR_DEV_WALLET_ADDRESS, WITHDRAWAL_DEV_WALLET_ADDRESS } from '@/constant';
import { finalIconSuccess, hidrToken, hthbToken, hphpToken , wave, bcaIcon, mandiriIcon, briIcon, bniIcon, permataIcon } from '@/img';
import Image from 'next/image';
import axios from 'axios';
import { Icon } from "@iconify/react";
import {  Spacer } from "@/components/UI";
import { FaqSections, FooterPrimary } from '@/components/Sections';
import { MetamaskContext } from '@/contexts/MetamaskContext';



const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleString(  "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


const tokenAddresses: Record<string, string> = {
  HIDR: "0x459ed4f0f9398608db761cec80efc2528ba81699",
  HTHB: "0x9343850dbdd5aafac57084f6be7777c736815df5",
  HPHP: "0x8242b1f5b6a067d1eadf3ad5093636188bdfcbc6",
};

export default function TransactionPage({ params }: { params: { id: string } }) {

    const { metamaskAccountAddress } = useContext(MetamaskContext);
  const [tx, setTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [triggerPaymentStatus, setTriggerPayment] = useState("");
 


  const [usdToIdr, setUsdToIdr] = useState<number | null>(null);
  const [usdToThb, setUsdToThb] = useState<number | null>(null);
  const [usdToPhp, setUsdToPhp] = useState<number | null>(null);
  const [idrbalance, setIdrBalance] = useState<number | null>(null);
  const [thbbalance, setThbBalance] = useState<number | null>(null);
  const [phpbalance, setPhpBalance] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState("--:--");




  const getCurrencyLabel = (fiatCurrency: string) => {
    switch (fiatCurrency.toUpperCase()) {
      case "IDR":
        return "HIDR";
      case "THB":
        return "HTHB";
      case "PHP":
        return "HPHP";
      default:
        return "HIDR";
    }
  };


  const prevStatusRef = useRef<string | null>(null); 
  
  const fetchTransaction = async () => {
    try {
      const res = await fetch(`/api/transaction/${params.id}`);
      const data = await res.json();

      const newStatus = data.tx.status;
      const prevStatus = prevStatusRef.current;

    


      if (prevStatus !== "COMPLETED" && prevStatus && newStatus === "COMPLETED") {
        setShowSuccess(true);
      }
      

      setTx(data.tx);
      prevStatusRef.current = newStatus;

    } catch (err) {
      console.error("Failed to load transaction", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tx?.createdAt) return;

    const interval = setInterval(() => {
      const created = new Date(tx.createdAt);
      const now = new Date();
      const expiry = new Date(created.getTime() + 10 * 60 * 1000);
      const remaining = expiry.getTime() - now.getTime();


      const minutes = Math.max(0, Math.floor(remaining / 60000));
      const seconds = Math.max(0, Math.floor((remaining % 60000) / 1000));
      setTimeLeft(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [tx, metamaskAccountAddress]);

  const fetchUsdRate = async () => {
    try {
      const { data } = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=idr,thb,php"
      );
      setUsdToIdr(data.usd.idr);
      setUsdToThb(data.usd.thb);
      setUsdToPhp(data.usd.php);

    } catch (err) {
      console.error("❌ Failed to fetch USD to IDR", err);
    }
  };

  const fetchUserBalance = async (wallet: string) => {
    try {
      const res = await fetch(`https://pharosscan.xyz/api/v2/addresses/${wallet}/token-balances`);
      
      const data = await res.json();
      const target = data.find((t: any) => t.token.address.toLowerCase() === tokenAddresses.HIDR.toLowerCase());
      if (target) {
        const raw = parseFloat(target.value || "0");
       
        setIdrBalance(raw);
      }

      const target2 = data.find((t: any) => t.token.address.toLowerCase() === tokenAddresses.HTHB.toLowerCase());
      if (target2) {
        const raw = parseFloat(target.value || "0");
       
        setThbBalance(raw);
      }


      const target3 = data.find((t: any) => t.token.address.toLowerCase() === tokenAddresses.HPHP.toLowerCase());
      if (target3) {
        const raw = parseFloat(target.value || "0");
       
        setPhpBalance(raw);
      }

    } catch (err) {
      console.error("Failed to fetch balance", err);
    }
  };

  useEffect(() => {

    fetchTransaction();
    const interval = setInterval(() => {
      fetchTransaction();
    }, 5000); 
    
  
    return () => clearInterval(interval);
  }, []);
  

  useEffect(() => {
    if (tx?.userWallet) {
      fetchUsdRate();
      fetchUserBalance(tx.userWallet);
    }
  }, [tx]);

  const handleConfirmPayment = async () => {
        

    if (!tx || (tx.type =="QR" && tx.fiatCurrency == "IDR" &&  tx.fiatAmount > idrbalance!) || 
    (tx.type =="WITHDRAWAL" && tx.fiatCurrency == "IDR" &&  tx.fiatAmount > idrbalance!) ||
    (tx.type =="QR" && tx.fiatCurrency == "PHP" &&  tx.fiatAmount > phpbalance!) || 
    (tx.type =="WITHDRAWAL" && tx.fiatCurrency == "PHP" &&  tx.fiatAmount > phpbalance!) ||
    (tx.type =="QR" && tx.fiatCurrency == "THB" &&  tx.fiatAmount > thbbalance!) || 
    (tx.type =="WITHDRAWAL" && tx.fiatCurrency == "THB" &&  tx.fiatAmount  > thbbalance!)
  ) return;

    setConfirming(true);
  
    try {
      const wallet = getMetaMaskWallet();
      await wallet.init();
  
      const tokenAddress = tokenAddresses[tx.tokenType];
      const recipientAddress =
        tx.type === "WITHDRAWAL"
          ? WITHDRAWAL_DEV_WALLET_ADDRESS
          : QR_DEV_WALLET_ADDRESS;
  
      await wallet.transferToken(
        tokenAddress,
        recipientAddress,
        String(tx.tokenAmount)
      );
  
      setShowConfirm(false);      // Close confirm modal
      setShowSuccess(true);       // Show success modal
     
    } catch (err) {
      console.error("❌ Token transfer failed:", err);
      alert("❌ Failed to send token");
    } finally {
      setConfirming(false);
    }
  };
  

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-6 min-h-screen flex justify-center items-center text-white">
       <div className='w-full flex justify-center items-center text-xl font-bold'>Loading...</div>
      
      </div>
    );
  }
  
  if (!tx) {
    return (
      <div className="pt-24 pb-16 px-6 min-h-screen flex justify-center items-center text-white">
        <div className='w-full flex justify-center items-center text-xl font-bold'>Oops... Transaction Not Found.</div>
       
      </div>
    );
  }
  
  if (tx.userWallet !== metamaskAccountAddress) {
    return (
      <div className="pt-24 pb-16 px-6 min-h-screen flex justify-center items-center text-white">
        <div className='w-full flex justify-center items-center text-xl font-bold'>Oops... It's not your transaction. Let's create your own.</div>
       
      </div>
    );
  }
  

  if (tx.type === "QR") {
    const totalWithFee = (tx.tokenAmount).toFixed(0);
    const fee = (tx.tokenAmount * 0).toFixed(0);

    const isInsufficient = (
    (tx.type =="QR" && tx.fiatCurrency == "IDR" &&  tx.fiatAmount > idrbalance!) ||

    (tx.type =="QR" && tx.fiatCurrency == "PHP" &&  tx.fiatAmount > phpbalance!) ||

    (tx.type =="QR" && tx.fiatCurrency == "THB" &&  tx.fiatAmount > thbbalance!)
  );

    return (
      <>
      <div className="  w-full overflow-y-scroll">
        <div className="pt-24 pb-10">
          <h1 className="text-white text-5xl text-center font-bold mb-10">
            HarborFi QR Payment
          </h1>
          
          {tx.status == "COMPLETED"  ?  
          <div className="w-full lg:w-[40%] bg-Primary rounded-xl p-6 container mx-auto">
           
           {tx.status == "COMPLETED"  ? 
           
           <> <Image
            src={finalIconSuccess} 
            alt="success"
            className="max-w-[200px] mx-auto my-4"
          />
          <h2 className="text-2xl font-semibold text-Primary">Payment Successful</h2>
          <Spacer height={16} /> </> : null }


          <div className="flex justify-between">
              <span>Transaction ID</span>
              <span>{tx.id}</span>
            </div>


            <div className="flex justify-between">
              
              <span>Merchant QR</span>
              <span>{tx.paymentDetails.accountHolderName}</span>
            </div>

         
           
           
            <div className="flex justify-between">
              <span>Status</span>
              <span>{tx.status}</span>
            </div>

            <div className="flex justify-between">
              <span>Created</span>
              <span>{formatDateTime(tx.createdAt)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Payment Amount</span>
              <span>{tx.tokenAmount} {getCurrencyLabel(tx.fiatCurrency)}</span>
            </div>


           
            <div className="flex justify-between">
              <span>Platform Fee (0%)</span>
              <span>{fee} {getCurrencyLabel(tx.fiatCurrency)}</span>
            </div>
            <hr className="my-2 border-white/10" />
            <div className="flex justify-between font-semibold">
              <span>Total Payment</span>
              <span>{totalWithFee} {getCurrencyLabel(tx.fiatCurrency)}</span>
            </div>

            {tx.onChainTxHash && (
                  <a
                    href={`https://pharosscan.xyz/tx/${tx.onChainTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="block w-full text-center  bg-white py-2 mt-5 rounded font-bold text-Primary"
                  >
                     Check On Chain
                  </a>
                )}
          </div>
          :  tx.status == "PENDING"  ||  tx.status == "PAID" ||  tx.status == "WAITING"?  
          <div className="w-full lg:w-[40%] bg-Primary rounded-xl p-6 container mx-auto">
            <div className="tabsContainer space-y-6">
              <div className="fieldRow">
                <span>Send To</span>
                <span className="border py-2 px-2 rounded text-sm">
                  {tx.paymentDetails?.accountHolderName || "QRIS Merchant"}
                </span>
              </div>

              <div className="fieldRow space-y-2">
                <div className="flex justify-start">
                  <span className="font-bold">{"Sending"}</span>
                </div>

                <div className="flex justify-between items-center">
                  <button className="buttonSelectToken flex items-center gap-2">
                    <Image src={tx.tokenType == "HIDR" ?  hidrToken : tx.tokenType == "HTHB" ? hthbToken : hphpToken} alt="pharos token" className="w-6 h-6" />
                    <span className="font-semibold">{tx.tokenType}</span>
                  </button>
                  <input
                    type="number"
                    className="inputAmount text-right"
                    readOnly
                    value={tx.tokenAmount}
                  />
                </div>

               
                
                <div className="flex justify-between text-sm text-gray-300">
                  <span className="balancedText">Balance: {tx.fiatCurrency == "IDR" ?  idrbalance?.toFixed(0): tx.fiatCurrency == "THB" ?  thbbalance?.toFixed(0) : tx.fiatCurrency == "PHP" ?  phpbalance?.toFixed(0)  : "..."}</span>
                 
                 { tx.fiatCurrency == "IDR" ? 
                  <span className="balancedText">
                    ≈ {usdToIdr && tx.fiatAmount ? (tx.fiatAmount / usdToIdr).toFixed(2) : "..."} USD
                  </span> : tx.fiatCurrency == "THB" ?
                  <span className="balancedText">
                    ≈ {usdToThb && tx.fiatAmount ? (tx.fiatAmount / usdToThb).toFixed(2) : "..."} USD
                  </span> :
                  <span className="balancedText">
                    ≈ {usdToPhp && tx.fiatAmount ? (tx.fiatAmount / usdToPhp).toFixed(2) : "..."} USD
                  </span>
  }
                </div>
              </div>

              

              <div className="fieldRow space-y-2">
                {tx.status === "WAITING" && !tx.onChainTxHash && (
                 <button
                 onClick={() => setShowConfirm(true)}
               
                    disabled={confirming || isInsufficient}
                    className="buttonActions"
                  >
                    {isInsufficient
                      ? "Insufficient Balance"
                     
                      : "Pay Now"}
                  </button>
                )}

                

                <div className="flex justify-between text-sm text-gray-300">
                  <span className="balancedText">
                    1 USD = {tx.fiatCurrency == "IDR" ? usdToIdr?.toFixed(0) : tx.fiatCurrency == "PHP" ? usdToPhp?.toFixed(0) : tx.fiatCurrency == "THB" ? usdToThb?.toFixed(0) : "..."} {getCurrencyLabel(tx.fiatCurrency)}
                  </span>
                  <span className="balancedText">Network Fee: 0.000035 PHAROS</span>
                </div>

             
              </div>
            </div>
            
          </div> 
          :
          <div className='w-full flex justify-center items-center text-xl font-bold'>Oops... Transaction already expired.</div>
          }
        </div>
      
        <Image src={wave} alt="wave" className="w-full py-0" />
        <FaqSections />
      </div>
      
      {showConfirm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="w-full max-w-md bg-Primary rounded-xl p-6 mx-4">
      <div className="tabsContainer">
        <div className="fieldRow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Review Payment</span>
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
              <span>Payment Amount</span>
              <span>{tx.tokenAmount} {getCurrencyLabel(tx.fiatCurrency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Network Fee</span>
              <span>0.000035 PHAROS</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee (0%)</span>
              <span>{fee} {getCurrencyLabel(tx.fiatCurrency)}</span>
            </div>
            <hr className="my-2 border-white/10" />
            <div className="flex justify-between font-semibold">
              <span>Total Estimated Payment</span>
              <span>{totalWithFee} {getCurrencyLabel(tx.fiatCurrency)}</span>
            </div>
          </div>

          <button
            onClick={handleConfirmPayment}
            disabled={confirming}
            className="mt-6 buttonActions"
          >
            {confirming ? "Processing..." : "Confirm Payment"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}


{showSuccess && tx.onChainTxHash && (
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
            src={finalIconSuccess} 
            alt="success"
            className="max-w-[200px] mx-auto my-4"
          />
          <h2 className="text-2xl font-semibold text-Primary">Payment Successful</h2>
          <Spacer height={16} />

          <div className="flex flex-col gap-3 mt-4">
            <a
              href={`https://pharosscan.xyz/tx/${tx.onChainTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="buttonActions"
            >
              Check on Chain
            </a>
           
          </div>
        </div>
      </div>
    </div>
  </div>
)}


</>
    );


    
  }
  else if (tx.type === "DEPOSIT") {


    const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
       
      });
    };

    return   <>
    <div className={`w-full container h-[100px] mx-auto`}></div>

    {/* Settlement process */}
    <section className="px-4">
      <h2 className="text-5xl font-semibold text-center">HarborFi Deposit Ramps</h2>
      <Spacer height={50} />
{ tx.status != "EXPIRED" ?
      <div
        data-section="bg putih"
        className="flex flex-col justify-center w-full  lg:w-[60%] bg-white lg:mx-auto text-Primary py-8 rounded"
      >

        {tx.status == "WAITING"  &&   <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-center">
            Transfer Before
          </span>
          <span className="text-4xl font-semibold text-center">
            {timeLeft}
          </span>
        </div>}
      

        {/* Payment Sending Complete here */}
        <div className="my-8 px-4 sm:px-12 md:px-24 relative">
  <div className="flex flex-row gap-6 md:gap-8 justify-center md:justify-between relative w-full">
    <hr className="text-Primary absolute w-full md:w-[90%] lg:w-[90%] xl:w-[96%] border md:left-3 top-[25px]" />

    {/* Payment Step */}
    <div className="flex flex-col justify-center items-center gap-2">
      <Icon
        icon={
          tx.status === "WAITING"
            ? "svg-spinners:clock"
            : "line-md:check-all"
        }
        width="50"
        height="50"
        className="bg-white z-1 rounded-full"
      />
      <span className="text-center font-semibold">Payment</span>
    </div>

    {/* Sending Step */}
    <div className="flex flex-col justify-center items-center gap-2">
      <Icon
        icon={
          tx.status === "PAID"
            ? "svg-spinners:clock"
            : tx.status === "PENDING" || tx.status === "COMPLETED"
            ? "line-md:check-all"
            : "mdi:clock-outline"
        }
        width="50"
        height="50"
        className="bg-white z-1 rounded-full"
      />
      <span className="text-center font-semibold">Sending</span>
    </div>

    {/* Completed Step */}
    <div className="flex flex-col justify-center items-center gap-2">
      <Icon
        icon={
          tx.status === "COMPLETED"
            ? "line-md:check-all"
            : "mdi:clock-outline"
        }
        width="50"
        height="50"
        className="bg-white z-1 rounded-full"
      />
      <span className="text-center font-semibold">Complete</span>
    </div>
  </div>
</div>


        <div className="flex justify-center">

        {tx.paymentDetails.method == "QR" && tx.status == "WAITING" &&
        
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <img
            id="qris-image"
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tx.paymentDetails.qrString)}`}
            alt="QR Code"
            className="w-40 h-40 rounded-lg object-contain"
          />
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.href = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tx.paymentDetails.qrString)}`;
              link.download = "bitvault-qris.png";
              link.click();
            }}
            className="sm:text-xs text-[10px] text-primerColor font-semibold hover:underline"
          >
            {"Download QR Code"}
          </button>
        </div>
        <p className="sm:text-sm text-[10px] text-center text-gray-600">{"Scan the QR to Pay or you can download it."}</p>
      </div>}


      
        </div>
        <Spacer height={50} />
        <div className="px-8 sm:px-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-sm">
        <span className="font-bold text-lg">Transaction ID</span>
  <span className="text-lg break-words">
    {tx.id}
  </span>
  <span className="font-bold text-lg">Deposit To</span>
  <span className="text-lg break-words">
    {`${tx.userWallet.slice(0, 8)}...${tx.userWallet.slice(-8)}`}
  </span>




  { tx.paymentDetails.method === "VA" && (
    <>
      <span className="font-bold text-lg">Transfer Method</span>
      <span className="text-lg">
        {tx.paymentDetails.method}
      </span>
{tx.status === "WAITING" && <>
  <span className="font-bold text-lg">VA Number</span>
      <span className="text-lg flex flex-wrap items-center gap-2 break-words">
        {tx.paymentDetails.vaNumber}
        <button
          className="cursor-pointer"
          onClick={() => handleCopy(tx.paymentDetails.vaNumber)}
        >
          <Icon icon="ph:copy-thin" width={20} height={20} />
        </button>
      </span>
</>}
     

      <span className="font-bold text-lg">Transfer Amount</span>
      <span className="text-lg flex flex-wrap items-center gap-2">
        {Math.floor(tx.fiatAmount * 1.02)} {tx.fiatCurrency}

        {tx.status == "WAITING" &&    <button
          className="cursor-pointer"
          onClick={() => handleCopy(String(Math.floor(tx.fiatAmount * 1.02)))}
        >
          <Icon icon="ph:copy-thin" width={20} height={20} />
        </button>}
     
      </span>
      
    </>
  )}

<span className="font-bold text-lg">Fee (2%)</span>
      <span className="text-lg">
        {tx.fiatAmount*0.02} {tx.fiatCurrency}
      </span>

  <span className="font-bold text-lg">Receive Amount</span>
  <span className="text-lg">{tx.tokenAmount} {tx.tokenType}</span>

  
</div>


         <br></br>
         {tx.status === "COMPLETED" && (
                  <a
                    href={`https://pharosscan.xyz/tx/${tx.onChainTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="block w-full text-center  bg-Primary py-2 mt-5 rounded font-bold text-white"
                  >
                     Check On Chain
                  </a>
                )}


{showSuccess && tx.onChainTxHash && (
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
          <h2 className="text-2xl font-semibold text-Primary">Deposit Successful</h2>
          <Spacer height={16} />

          <div className="flex flex-col gap-3 mt-4">
            <a
              href={`https://pharosscan.xyz/tx/${tx.onChainTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="buttonActions"
            >
              Check on Chain
            </a>
           
          </div>
        </div>
      </div>
    </div>
  </div>
)}
        
        </div>
        {tx.status === "WAITING" && (
  <div className="px-6 md:mx-auto mt-4 w-full max-w-[400px]">
    <button
      className="buttonActions"
      onClick={async () => {
        setTriggerPayment("PROCESS");
        try {
          const res = await fetch(`/api/transaction/settle/${tx.id}`, {
            method: "POST",
          });

          const data = await res.json();

          if (res.ok) {
           setTriggerPayment("SUCCESS");
            
          } else {
            alert(`❌ Failed to simulate: ${data.error || "Unknown error"}`);
          }
        } catch (err) {
          console.error("Mock pay error:", err);
          alert("❌ An error occurred while simulating payment.");
        }
      }}
    > {triggerPaymentStatus == "PROCESS" ? "Processing..." : triggerPaymentStatus == "SUCCESS" ? "Payment Trigger is succeed" : "Trigger Pay"}
    
    </button>
  </div>
)}



        
       
      </div> :  <div className='w-full flex justify-center items-center text-xl font-bold'>Oops... Transaction already expired.</div>
  }
    </section>


    <div className={`w-full container h-[100px] lg:h-[140px] mx-auto`}></div>
    <Image src={wave} alt="wave" className="w-full py-0" />
    <FaqSections />
    
  </>
  

  
  } else if (tx.type === "WITHDRAWAL") {
    const netWithdraw = (tx.tokenAmount*0.98).toFixed(0);
    const fee = (tx.tokenAmount * 0.02).toFixed(0);

    const isInsufficient = (
    (tx.type =="WITHDRAWAL" && tx.fiatCurrency == "IDR" &&  tx.fiatAmount > idrbalance!) ||

    (tx.type =="WITHDRAWAL" && tx.fiatCurrency == "PHP" &&  tx.fiatAmount > phpbalance!) ||

    (tx.type =="WITHDRAWAL" && tx.fiatCurrency == "THB" &&  tx.fiatAmount > thbbalance!)
  );

    return (
      <>
      <div className="  w-full overflow-y-scroll">
        <div className="pt-24 pb-10">
          <h1 className="text-white text-5xl text-center font-bold mb-10">
            HarborFi Withdrawal Ramp
          </h1>
          
          {tx.status == "COMPLETED"  ?  
          <div className="w-full lg:w-[40%] bg-Primary rounded-xl p-6 container mx-auto">
           
           {tx.status == "COMPLETED"  ? 
           
           <> <Image
            src={finalIconSuccess} 
            alt="success"
            className="max-w-[200px] mx-auto my-4"
          />
          <h2 className="text-2xl font-semibold text-Primary">Withdraw Successful</h2>
          <Spacer height={16} /> </> : null }


          <div className="flex justify-between">
              <span>Transaction ID</span>
              <span>{tx.id}</span>
            </div>

            <div className="flex justify-between">
              
              <span>Withdraw Method</span>
              <span>{tx.paymentDetails.method.split("_")[1]}</span>
            </div>



            <div className="flex justify-between">
              
              <span>Account Holder</span>
              <span>{tx.paymentDetails.accountHolderName}</span>
            </div>


            <div className="flex justify-between">
              
              <span>Account Number</span>
              <span>{tx.paymentDetails.accountNumber}</span>
            </div>
         
           
           
            <div className="flex justify-between">
              <span>Status</span>
              <span>{tx.status}</span>
            </div>

            <div className="flex justify-between">
              <span>Created</span>
              <span>{formatDateTime(tx.createdAt)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Payment Amount</span>
              <span>{tx.tokenAmount} {getCurrencyLabel(tx.fiatCurrency)}</span>
            </div>


           
            <div className="flex justify-between">
              <span>Platform Fee (2%)</span>
              <span>{fee} {getCurrencyLabel(tx.fiatCurrency)}</span>
            </div>
            <hr className="my-2 border-white/10" />
            <div className="flex justify-between font-semibold">
              <span>Total Payment</span>
              <span>{netWithdraw} {getCurrencyLabel(tx.fiatCurrency)}</span>
            </div>

            {tx.onChainTxHash && (
                  <a
                    href={`https://pharosscan.xyz/tx/${tx.onChainTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="block w-full text-center  bg-white py-2 mt-5 rounded font-bold text-Primary"
                  >
                     Check On Chain
                  </a>
                )}
          </div>
          :  tx.status == "PENDING"  ||  tx.status == "PAID" ||  tx.status == "WAITING"?  
          <div className="w-full lg:w-[40%] bg-Primary rounded-xl p-6 container mx-auto">
            <div className="tabsContainer space-y-6">
              <div className="fieldRow">
                <span>Account Holder</span>
                <span className="border py-2 px-2 rounded text-sm">
                  {tx.paymentDetails?.accountHolderName}
                </span>
              </div>

              <div className="fieldRow">
                <span>Account Number</span>
                <span className="border py-2 px-2 rounded text-sm">
                  {tx.paymentDetails.accountNumber}
                </span>
              </div>


              <div className="fieldRow">
                <span>Withdraw Method</span>
                <span className="border py-2 px-2 rounded text-sm">
                  {tx.paymentDetails.method.split("_")[1]}
                </span>
              </div>


        
             

              <div className="fieldRow space-y-2">
                <div className="flex justify-start">
                  <span className="font-bold">{"Withdraw"}</span>
                </div>

                <div className="flex justify-between items-center">
                  <button className="buttonSelectToken flex items-center gap-2">
                    <Image src={tx.tokenType == "HIDR" ?  hidrToken : tx.tokenType == "HTHB" ? hthbToken : hphpToken} alt="pharos token" className="w-6 h-6" />
                    <span className="font-semibold">{tx.tokenType}</span>
                  </button>
                  <input
                    type="number"
                    className="inputAmount text-right"
                    readOnly
                    value={tx.tokenAmount}
                  />
                </div>

               
                
                <div className="flex justify-between text-sm text-gray-300">
                  <span className="balancedText">Balance: {tx.fiatCurrency == "IDR" ?  idrbalance?.toFixed(0): tx.fiatCurrency == "THB" ?  thbbalance?.toFixed(0) : tx.fiatCurrency == "PHP" ?  phpbalance?.toFixed(0)  : "..."}</span>
                 
                 { tx.fiatCurrency == "IDR" ? 
                  <span className="balancedText">
                    ≈ {usdToIdr && tx.fiatAmount ? (tx.fiatAmount / usdToIdr).toFixed(2) : "..."} USD
                  </span> : tx.fiatCurrency == "THB" ?
                  <span className="balancedText">
                    ≈ {usdToThb && tx.fiatAmount ? (tx.fiatAmount / usdToThb).toFixed(2) : "..."} USD
                  </span> :
                  <span className="balancedText">
                    ≈ {usdToPhp && tx.fiatAmount ? (tx.fiatAmount / usdToPhp).toFixed(2) : "..."} USD
                  </span>
  }
                </div>
              </div>

              

              <div className="fieldRow space-y-2">
                {tx.status === "WAITING" && !tx.onChainTxHash && (
                 <button
                 onClick={() => setShowConfirm(true)}
               
                    disabled={confirming || isInsufficient}
                    className="buttonActions"
                  >
                    {isInsufficient
                      ? "Insufficient Balance"
                     
                      : "Confirm Withdraw"}
                  </button>
                )}

                

                <div className="flex justify-between text-sm text-gray-300">
                  <span className="balancedText">
                    1 USD = {tx.fiatCurrency == "IDR" ? usdToIdr?.toFixed(0) : tx.fiatCurrency == "PHP" ? usdToPhp?.toFixed(0) : tx.fiatCurrency == "THB" ? usdToThb?.toFixed(0) : "..."} {getCurrencyLabel(tx.fiatCurrency)}
                  </span>
                  <span className="balancedText">Network Fee: 0.000035 PHAROS</span>
                </div>

             
              </div>
            </div>
            
          </div> 
          :
          <div className='w-full flex justify-center items-center text-xl font-bold'>Oops... Transaction already expired.</div>
          }
        </div>
      
        <Image src={wave} alt="wave" className="w-full py-0" />
        <FaqSections />
      </div>
      
      {showConfirm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="w-full max-w-md bg-Primary rounded-xl p-6 mx-4">
      <div className="tabsContainer">
        <div className="fieldRow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Review Withdraw</span>
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
              <span>Withdraw Amount</span>
              <span>{tx.tokenAmount} {getCurrencyLabel(tx.fiatCurrency)}</span>
            </div>


            <div className="flex justify-between">
              <span>Account Holder</span>
              <span>{tx.paymentDetails.accountHolderName}</span>
            </div>

            <div className="flex justify-between">
              <span>Account Number</span>
              <span>{tx.paymentDetails.accountNumber}</span>
            </div>

            <div className="flex justify-between">
            <span>Withdraw Method</span>
              <span>{tx.paymentDetails.method.split("_")[1]}</span>
              </div>
            
            
            <div className="flex justify-between">
              <span>Estimated Network Fee</span>
              <span>0.000035 PHAROS</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee (2%)</span>
              <span>{fee} {getCurrencyLabel(tx.fiatCurrency)}</span>
            </div>
            <hr className="my-2 border-white/10" />
            <div className="flex justify-between font-semibold">
              <span>Total Withdraw after Fee</span>
              <span>{netWithdraw} {getCurrencyLabel(tx.fiatCurrency)}</span>
            </div>
          </div>

          <button
            onClick={handleConfirmPayment}
            disabled={confirming}
            className="mt-6 buttonActions"
          >
            {confirming ? "Processing..." : "Confirm Withdraw"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}


{showSuccess && tx.onChainTxHash && (
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
          <h2 className="text-2xl font-semibold text-Primary">Withdraw Successful</h2>
          <Spacer height={16} />

          <div className="flex flex-col gap-3 mt-4">
            <a
              href={`https://pharosscan.xyz/tx/${tx.onChainTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="buttonActions"
            >
              Check on Chain
            </a>
           
          </div>
        </div>
      </div>
    </div>
  </div>
)}


</>
    ); }
else {
    return null;
  }
  
}

