"use client";

import { useContext, useEffect, useState } from "react";
import { MetamaskContext } from "@/contexts/MetamaskContext";
import { logo } from "@/img";
import Image from "next/image";
import { motion } from "framer-motion"; // switched to framer-motion for compatibility
import Link from "next/link";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Navbar() {
  const { metamaskAccountAddress, setMetamaskAccountAddress } = useContext(MetamaskContext);
  const [isScrolled, setIsScrolled] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setMetamaskAccountAddress(accounts[0]);
        localStorage.setItem("connected", "true");
      }
    } else {
      alert("Metamask not detected!");
    }
  };

  const disconnectWallet = () => {
    setMetamaskAccountAddress("");
    localStorage.removeItem("connected");
  };

  useEffect(() => {
    const previouslyConnected = localStorage.getItem("connected");
    if (previouslyConnected === "true" && window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setMetamaskAccountAddress(accounts[0]);
        }
      });
    }
  }, [setMetamaskAccountAddress]);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setMetamaskAccountAddress(accounts[0]);
          localStorage.setItem("connected", "true");
        } else {
          setMetamaskAccountAddress("");
          localStorage.removeItem("connected");
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    }
  }, [setMetamaskAccountAddress]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 w-full z-10 xl:block"
      animate={{
        backgroundColor: isScrolled ? "rgba(15, 23, 42, 0.1)" : "rgba(0, 0, 0, 0)",
        backdropFilter: isScrolled ? "blur(10px)" : "blur(0px)",
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex container mx-auto justify-between items-center p-4">
        {/* logo + title */}
        <Link href="/" className="flex items-center gap-2">
  <motion.div animate={{ width: 40 }} transition={{ duration: 0.3 }} className="overflow-hidden">
    <Image src={logo} alt="HarborFi Logo" className="w-[50px] md:w-full cursor-pointer" />
  </motion.div>
  <motion.h3
    className="text-xl sm:text-3xl font-bold"
    animate={{ opacity: isScrolled ? 0 : 1, x: isScrolled ? -20 : 0 }}
    transition={{ duration: 0.3 }}
  >
    HarborFi
  </motion.h3>
</Link>


        {/* wallet controls */}
        <div className="flex gap-3 items-center">
        {metamaskAccountAddress ? (
  <>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white text-[#0F2B46] px-4 py-2 rounded font-semibold"
    >
      {`${metamaskAccountAddress.slice(0, 6)}...${metamaskAccountAddress.slice(-4)}`}
    </motion.button>

    {/* Full button for desktop */}
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={disconnectWallet}
      className="hidden md:block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-semibold"
    >
      Disconnect
    </motion.button>

    {/* Icon-only for mobile */}
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={disconnectWallet}
      className="block md:hidden bg-red-500 text-white px-2 py-2 rounded-full hover:bg-red-600 font-bold text-lg"
      aria-label="Disconnect"
      title="Disconnect"
    >
      X
    </motion.button>
  </>
) : (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={connectWallet}
    className="bg-white text-[#0F2B46] px-4 py-2 rounded font-semibold hover:bg-gray-200"
  >
    Connect Wallet
  </motion.button>
)}

        </div>
      </div>
    </motion.nav>
  );
}


