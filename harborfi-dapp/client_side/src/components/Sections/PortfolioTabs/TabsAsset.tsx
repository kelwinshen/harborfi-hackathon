import { hidrToken, hthbToken, hphpToken, pharosToken } from "@/img";
import Image from "next/image";
import React from "react";

const TabsAsset = ({
  hidrBalance,
  hthbBalance,
  hphpBalance,
  usdToIdr,
  usdToThb,
  usdToPhp,
  ethToUsd,
  pharosBalance
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
  const assets = [
    
    {
      id: 1,
      name: "HIDR",
      label: "Harbor Indonesian Rupiah",
      icon: hidrToken,
      balance: hidrBalance,
      usdValue: hidrBalance / usdToIdr,
    },
    {
      id: 2,
      name: "HTHB",
      label: "Harbor Thailand Baht",
      icon: hthbToken,
      balance: hthbBalance,
      usdValue: hthbBalance / usdToThb,
    },
    {
      id: 3,
      name: "HPHP",
      label: "Harbor Philipines Peso",
      icon: hphpToken,
      balance: hphpBalance,
      usdValue: hphpBalance / usdToPhp,
    },

    {
      id: 4,
      name: "PHAROS",
      label: "Pharos",
      icon: pharosToken,
      balance: pharosBalance,
      usdValue: pharosBalance * ethToUsd,
    },


  ];

  return (
    <div className="tabsContainer">
      <div className="fieldRow">
        <div className="flex flex-col gap-4">
          {assets.map((asset) => (
            <div key={asset.id} className="flex justify-between">
              <div className="flex gap-2">
                <Image src={asset.icon} alt={asset.name} width={40} height={40} />
                <div className="flex flex-col gap-0 text-Primary">
                  <span className="text-base font-semibold">{asset.name}</span>
                  <span>{asset.label}</span>
                </div>
              </div>
              <div className="flex flex-col text-Primary text-right">
                <span className="font-bold">
                  {asset.balance.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  {asset.name}
                </span>
                <span>
                  ${asset.usdValue.toFixed(2)} USD
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabsAsset;
