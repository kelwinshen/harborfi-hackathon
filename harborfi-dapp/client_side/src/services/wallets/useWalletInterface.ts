import { useContext } from "react";
import { MetamaskContext } from "../../contexts/MetamaskContext";
import { getMetaMaskWallet } from "./metamask/metamaskClient"; // notice we import getMetaMaskWallet instead

export const useWalletInterface = () => {
  const metamaskCtx = useContext(MetamaskContext);

  if (typeof window === "undefined") {
    return {
      accountId: null,
      walletInterface: null,
    };
  }

  if (metamaskCtx.metamaskAccountAddress) {
    return {
      accountId: metamaskCtx.metamaskAccountAddress,
      walletInterface: getMetaMaskWallet(), // Call it here!
    };
  } else {
    return {
      accountId: null,
      walletInterface: null,
    };
  }
};
