"use client";
import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
const FaqSections = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const faqs = [
  {
    title: "How to use QR Payment in Thailand",
    description: `To use QR Payment in Thailand with HarborFi, open the app, select HTHB, and scan the merchant’s PromptPay – QR code. HarborFi will auto-convert your crypto and process the payment instantly, make sure your wallet has enough HTHB balance or swap assets beforehand.`,
  },
  {
    title: "How to use QR Payment in Indonesia",
    description: `To use QR Payment in Indonesia with HarborFi, open the app, select HIDR, and scan the merchant’s QRIS – QR code. HarborFi will auto-convert your crypto and process the payment instantly, make sure your wallet has enough HIDR balance or swap assets beforehand.`,
  },
  {
    title: "How to use QR Payment in Philippines",
    description: `To use QR Payment in Philippines with HarborFi, open the app, select HPHP, and scan the merchant’s QR Ph – QR code. HarborFi will auto-convert your crypto and process the payment instantly, make sure your wallet has enough HPHP balance or swap assets beforehand.`,
  },
  {
    title: "How Does the Swap Feature Works?",
    description: `With the Swap feature, you can seamlessly swap ETH, Pharos tokens, and (soon) many other cryptocurrencies into Harbor stablecoins pegged to your desired national currency (IDR, THB, PHP). You can also send these stablecoins across the world, whether to your own wallets, friends, family, or clients instantly and securely.`,
  },
  {
    title: "How Does the Withdrawal Feature Works?",
    description: `The Withdrawal feature allows you to easily convert your Harbor stablecoins back into your national currency (IDR, THB, PHP). Choose your preferred withdrawal method (bank account, e-wallet, or other supported platforms). You can also deposit funds into your HarborFi wallet by sending your local currency and receiving stablecoins.`,
  },
  {
    title: "How Does the Portfolio Feature Works?",
    description: `Your Portfolio gives you a real-time overview of all your activities including Swaps, Sends, Withdrawals, Deposits, and future features. All transactions are tracked with 99% uptime, ensuring you stay updated anytime, anywhere.`,
  },
];
  return (
    <>
      <section className="bg-bgPrimary py-24  -mt-1">
        <div className="xl:container xl:mx-auto mx-4">
          <h2 className="text-4xl font-bold text-white py-8 text-center">
            Learn about HarborFi dApp
          </h2>
        </div>

        <div className="mx-4 flex xl:container xl:mx-auto flex-col gap-[30px] justify-between mt-12">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="py-8 px-12 rounded-[40px] w-full inset-shadow-harbor cursor-pointer"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
              <div className={`flex justify-between ${isOpen ? "items-start" : "items-center"}`}>
                  <div className="flex flex-col gap-4">
                    <h3 className="lg:text-2xl text-xl font-bold">{faq.title}</h3>
                    <p className={`${isOpen ? "block" : "hidden"}`}>{faq.description}</p>
                  </div>
                  <Icon
                    icon="weui:arrow-outlined"
                    width="50"
                    height="50"
                    className={`${isOpen ? "rotate-90 transition-transform" : "transition-transform"}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default FaqSections;
