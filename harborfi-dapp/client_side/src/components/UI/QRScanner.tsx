"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { poweredbyPromptpay, poweredbyQRIS, poweredbyQRPh } from "@/img"; // <- adjust path if needed
import { useContext } from "react";
import { MetamaskContext } from "@/contexts/MetamaskContext";

const tokenMap = {
  HIDR: "0x459ed4f0f9398608db761cec80efc2528ba81699".toLowerCase(),
  HTHB: "0x9343850dbdd5aafac57084f6be7777c736815df5".toLowerCase(),
  HPHP: "0x8242b1f5b6a067d1eadf3ad5093636188bdfcbc6".toLowerCase(),
};

export default function QRScanner({
  type,
  onDetected,
  onCancel,
}: {
  type: "HIDR" | "HTHB" | "HPHP";
  onDetected: (result: string) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const { metamaskAccountAddress } = useContext(MetamaskContext);

  const stopStream = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    readerRef.current = new BrowserQRCodeReader();

    const startScan = async () => {
      try {
        await readerRef.current!.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result, err, controls) => {
            if (result) {
              console.log("QR Code Detected:", result.getText());
              controls.stop();
              stopStream();
              onDetected(result.getText());
            }
          }
        );
      } catch (err) {
        console.error("QR scanner error:", err);
        stopStream();
        onCancel();
      }
    };

    startScan();
    return () => stopStream();
  }, [onDetected, onCancel]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!metamaskAccountAddress) return;
      try {
        const res = await fetch(
          `https://pharosscan.xyz/api/v2/addresses/${metamaskAccountAddress}/token-balances`
        );
        const data = await res.json();
        const tokenAddress = tokenMap[type];
        const tokenData = data.find((entry: any) => entry.token.address.toLowerCase() === tokenAddress);
        if (tokenData) {
       
          const value = parseFloat(tokenData.value );
          setBalance(value);
        }
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    };

    fetchBalance();
  }, [type, metamaskAccountAddress]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Live camera feed */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover absolute inset-0 opacity-30"
        muted
        playsInline
      />

      {/* Header */}
      <div className="absolute top-0 w-full z-20 flex justify-between items-center px-6 pt-6">
        <button
          onClick={() => {
            stopStream();
            onCancel();
          }}
          className="bg-white px-3 py-1 text-sm font-semibold text-black rounded-full"
        >
          ← Back
        </button>
        <p className="text-white font-bold text-sm">HarborFi QR Payment</p>
        <span className="w-12" />
      </div>

      {/* Scanner box */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div className="w-64 h-64 rounded-xl border-4 border-white animate-pulse shadow-lg" />
        <p className="mt-4 text-sm text-white opacity-80">
          Align QR code inside the box
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 w-full z-10 pb-6">
        <div className="flex justify-center mb-4">
          <Image
            src={type == "HIDR" ? poweredbyQRIS : type == "HPHP" ? poweredbyQRPh :poweredbyPromptpay} 
            alt="powered by qris"
            className="max-w-[180px]"
          />
        </div>
        <div className="bg-Primary text-white py-4 px-6 rounded-t-2xl text-sm flex justify-between">
          <span>Balance: {balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {type}</span>
          <Icon icon="ion:reload" width={20} height={20} />
        </div>
      </div>
    </div>
  );
}
