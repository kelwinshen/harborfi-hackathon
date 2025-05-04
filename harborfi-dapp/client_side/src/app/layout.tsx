import type { Metadata } from "next";
import "./globals.css";
import { MetamaskContextProvider } from "@/contexts/MetamaskContext";


import Navbar from "@/components/UI/Navbar";
import { FooterPrimary } from "@/components/Sections";



export const metadata: Metadata = {
  title: "HarborFi",
  description: "Seamless swapping powered by Supra Oracle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"> 
      <body className="bg-bgPrimary">
        <MetamaskContextProvider>
          <Navbar />
          {children}
         
          <div className="bg-bgPrimary">
        <FooterPrimary />
      </div>
        </MetamaskContextProvider>
      </body>
    </html>
  );
}


