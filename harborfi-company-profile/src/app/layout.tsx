"use client";
import "./globals.css";

import FooterPrimary from "@/Components/Sections/FooterPrimary";
import NavigationMenus from "@/Components/UI/NavigationMenus";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { logo } from "@/img";
import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 bg-bgPrimary flex items-center justify-center z-50"
          >
            <Image
              src={logo}
              alt="Logo"
              className="w-[100px] h-[100px] object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <html>
        <head>
          <link rel="icon" href="/favicon.icon" />
        </head>
        {/* animasi loading screen */}

        <body className="bg-bgPrimary">
          {/* Navigation Button */}
          <NavigationMenus />
          {children}

          <FooterPrimary />
        </body>
      </html>
    </>
  );
}
