"use client";

import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { format } from "date-fns";
import { MetamaskContext } from "@/contexts/MetamaskContext";
import {
  swap,
  qr,
  send,
  receive,
  deposit,
  withdraw,
} from "@/img";

const tokenA = "0x459ed4f0f9398608db761cec80efc2528ba81699";
const tokenB = "0x9343850dbdd5aafac57084f6be7777c736815df5";
const tokenC = "0x8242b1f5b6a067d1eadf3ad5093636188bdfcbc6";



const TabsHistory = () => {
  const { metamaskAccountAddress } = useContext(MetamaskContext);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(false);

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(transactions.length / itemsPerPage);


  

  
  
  useEffect(() => {
    const fetchTxHistory = async () => {
      if (!metamaskAccountAddress) return;

      try {
        const backendRes = await fetch(`/api/transaction/address/${metamaskAccountAddress}`);
        const backendData = await backendRes.json();
        const backendTxs = backendData?.transactions || [];

        const knownHashes = new Set(
          backendTxs.map((tx: any) => tx.onChainTxHash?.toLowerCase()).filter(Boolean)
        );

        const transferRes = await fetch(
          `https://pharosscan.xyz/api/v2/addresses/${metamaskAccountAddress}/token-transfers`
        );
        const transferData = await transferRes.json();
        const tokenTransfers = transferData?.items || [];

        const groupedTransfers: Record<string, any[]> = {};
        for (const tx of tokenTransfers) {
          const hash = tx.transaction_hash?.toLowerCase();
          const tokenAddr = tx.token?.address?.toLowerCase();
          if (!hash || knownHashes.has(hash)) continue;
          if (![tokenA, tokenB, tokenC].includes(tokenAddr)) continue;

          if (!groupedTransfers[hash]) groupedTransfers[hash] = [];
          groupedTransfers[hash].push(tx);
        }

        const swapCandidates: any[] = [];
        const normalTokenTxs: any[] = [];

        for (const [hash, txs] of Object.entries(groupedTransfers)) {
          const sends = txs.filter(
            (tx: any) => tx.from?.hash?.toLowerCase() === metamaskAccountAddress.toLowerCase()
          );
          const receives = txs.filter(
            (tx: any) => tx.to?.hash?.toLowerCase() === metamaskAccountAddress.toLowerCase()
          );

          if (sends.length === 1 && receives.length === 1) {
            const sendTx = sends[0];
            const receiveTx = receives[0];

            const tokenAddrSend = sendTx.token.address.toLowerCase();
            const tokenAddrReceive = receiveTx.token.address.toLowerCase();
            const decimalsSend = parseInt(sendTx.token.decimals || "18");
            const decimalsReceive = parseInt(receiveTx.token.decimals || "18");

            const swapFrom = tokenAddrSend === tokenA ? "HIDR" : tokenAddrSend === tokenB ? "HTHB" : "HPHP";
            const swapTo = tokenAddrReceive === tokenA ? "HIDR" : tokenAddrReceive === tokenB ? "HTHB" : "HPHP";

            swapCandidates.push({
              id: hash,
              type: "SWAP",
              status: "COMPLETED",
              tokenType: swapTo,
              swapFrom,
              swapTo,
              swapAmountFrom: parseFloat(sendTx.total.value) / 10 ** decimalsSend,
              swapAmountTo: parseFloat(receiveTx.total.value) / 10 ** decimalsReceive,
              createdAt: sendTx.timestamp,
              onChainTxHash: hash,
            });
          } else {
            for (const tx of txs) {
              const isSender = tx.from?.hash?.toLowerCase() === metamaskAccountAddress.toLowerCase();
              const tokenAddr = tx.token?.address?.toLowerCase();
              const tokenType =
                tokenAddr === tokenA ? "HIDR" :
                tokenAddr === tokenB ? "HTHB" :
                tokenAddr === tokenC ? "HPHP" : undefined;

              const decimals = parseInt(tx.token?.decimals || "18");
              const value = parseFloat(tx.total.value) / 10 ** decimals;

              normalTokenTxs.push({
                id: tx.transaction_hash,
                type: isSender ? "SEND" : "RECEIVE",
                status: "COMPLETED",
                tokenType,
                tokenAmount: value,
                createdAt: tx.timestamp,
                onChainTxHash: tx.transaction_hash,
              });
            }
          }
        }

        const nativeRes = await fetch(`https://pharosscan.xyz/api/v2/addresses/${metamaskAccountAddress}`);
        const nativeData = await nativeRes.json();
        const nativeTxs = nativeData?.txs || [];

        const mappedNativeTxs = nativeTxs
          .filter((tx: any) => {
            const hash = tx.hash?.toLowerCase();
            return (
              hash &&
              !knownHashes.has(hash) &&
              (tx.from?.hash?.toLowerCase() === metamaskAccountAddress.toLowerCase() ||
               tx.to?.hash?.toLowerCase() === metamaskAccountAddress.toLowerCase())
            );
          })
          .map((tx: any) => {
            const isSender = tx.from?.hash?.toLowerCase() === metamaskAccountAddress.toLowerCase();
            return {
              id: tx.hash,
              type: isSender ? "SEND" : "RECEIVE",
              status: "COMPLETED",
              tokenType: "PHAROS",
              tokenAmount: parseFloat(tx.value) / 1e18,
              createdAt: tx.timestamp,
              onChainTxHash: tx.hash,
            };
          });

        const combined = [
          ...backendTxs,
          ...swapCandidates,
          ...normalTokenTxs,
          ...mappedNativeTxs,
        ];

        combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setTransactions(combined);
      } catch (err) {
        console.error("❌ Failed to fetch txs", err);
      }
    };

    fetchTxHistory();

    const interval = setInterval(fetchTxHistory, 15_000);
    return () => clearInterval(interval);

  
  }, [metamaskAccountAddress]);

  const groupByDate = (txs: any[]) => {
    const grouped: Record<string, any[]> = {};
    for (const tx of txs) {
      const dateStr = format(new Date(tx.createdAt), "MMMM dd, yyyy");
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(tx);
    }
    return grouped;
  };

  const grouped = groupByDate(paginatedTransactions);

  const getIcon = (tx: any) => {
    if (tx.type === "SWAP") return swap;
    if (tx.type === "DEPOSIT") return deposit;
    if (tx.type === "WITHDRAWAL") return withdraw;
    if (tx.type === "QR") return qr;
    if (tx.type === "SEND") return send;
    if (tx.type === "RECEIVE") return receive;
    return receive;
  };

  const getLabel = (tx: any) => {
    if (tx.type === "SWAP") return `Swap ${tx.swapFrom} → ${tx.swapTo}`;
    if (tx.type === "DEPOSIT") return "Deposit";
    if (tx.type === "WITHDRAWAL") return "Withdraw";
    if (tx.type === "QR") return "QR Payment";
    if (tx.type === "SEND") return "Sent";
    if (tx.type === "RECEIVE") return "Received";
    return tx.type;
  };

  return (
    <div className="tabsContainer">
      <div className="fieldRow">
        <div className="flex flex-col gap-4">
        {!metamaskAccountAddress ? (
  <div className="flex justify-center text-xl font-bold py-2 px-2">Connect your wallet to see history.</div>
) : isLoading ? (
  <div className="text-center text-gray-400 my-6">Fetching transactions...</div>
) : transactions.length === 0 ? (
  <div className="text-center text-gray-400 my-6">No transactions found</div>
) : (
  Object.entries(grouped).map(([date, txs]) => (

            <div key={date}>
              <p className="text-sm text-gray-500 mb-2">{date}</p>
              {txs.map((tx) => {
                const icon = getIcon(tx);
                const label = getLabel(tx);
                const isNegative = ["SEND", "WITHDRAWAL", "QR"].includes(tx.type);

                return (
                  <a
  key={tx.id}
  href={
    ["DEPOSIT", "WITHDRAWAL", "QR"].includes(tx.type)
      ? `/transaction/${tx.id}`
      : `https://pharosscan.xyz/tx/${tx.onChainTxHash}`
  }
  target="_blank"
  rel="noopener noreferrer"
  className=""
>
                  <div key={tx.id} className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <Image src={icon} alt="icon" width={32} height={32} />
                      <div className="flex flex-col text-sm">
                        <span className="font-semibold">{label}</span>
                        <span className="text-xs text-gray-400">{tx.status}</span>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      {tx.type === "SWAP" ? (
                        <>
                          <p className="text-gray-600  font-semibold">
                            - {tx.swapAmountFrom.toLocaleString()} {tx.swapFrom}
                          </p>
                          <p className="text-Primary text-xs font-light">
                            + {tx.swapAmountTo.toLocaleString()} {tx.swapTo}
                          </p>
                        </>
                      ) : (
                        <p className={`${isNegative ? "text-gray-600  font-semibold" : "text-Primary font-semibold"}`}>
                          {isNegative ? "-" : "+"} {tx.tokenAmount.toLocaleString()} {tx.tokenType}
                        </p>
                      )}
                    </div>
                  </div> </a>
                );
              })}
            </div>
          )))}
        </div>
      </div>
      {totalPages > 1 && (
  <div className="flex justify-center items-center gap-4 mt-4">
    <button
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="button"
      hidden= {currentPage === 1}
    >
      Previous
    </button>
    
    <button
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="button"
      hidden ={ currentPage === totalPages}
    >
      Next
    </button>
  </div>
)}

    </div>
  );
};

export default TabsHistory;
