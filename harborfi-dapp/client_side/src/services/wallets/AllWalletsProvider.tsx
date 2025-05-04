import { ReactNode, useEffect } from "react";
import { MetamaskContextProvider } from "../../contexts/MetamaskContext";
import { getMetaMaskWallet } from "./metamask/metamaskClient";

type Props = {
  children: ReactNode;
};

export const AllWalletsProvider = ({ children }: Props) => {
  useEffect(() => {
    const metamaskWallet = getMetaMaskWallet();
    metamaskWallet.init().catch(console.error);
  }, []);

  return (
    <MetamaskContextProvider>
      {children}
    </MetamaskContextProvider>
  );
};
