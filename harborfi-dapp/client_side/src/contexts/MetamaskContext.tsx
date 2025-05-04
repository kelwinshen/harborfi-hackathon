'use client'
import { createContext, useState, ReactNode } from "react";

type MetamaskContextType = {
  metamaskAccountAddress: string;
  setMetamaskAccountAddress: (address: string) => void;
};

const defaultValue: MetamaskContextType = {
  metamaskAccountAddress: '',
  setMetamaskAccountAddress: () => {}, // You can leave this empty in default
};

export const MetamaskContext = createContext<MetamaskContextType>(defaultValue);

export const MetamaskContextProvider = (props: { children: ReactNode }) => {
  const [metamaskAccountAddress, setMetamaskAccountAddress] = useState('');

  return (
    <MetamaskContext.Provider
      value={{
        metamaskAccountAddress,
        setMetamaskAccountAddress
      }}
    >
      {props.children}
    </MetamaskContext.Provider>
  );
};
