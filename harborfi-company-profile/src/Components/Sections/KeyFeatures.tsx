import React from "react";

const KeyFeatures = () => {
  const features = [
    {
      title: "QR-Based Payments",
      description:
        "Scan and pay using crypto, just like mobile banking, but Web3.",
    },
    {
      title: "Swap Between Stablecoins",
      description:
        "Easily convert between regional stablecoins (HIDR, HTHB, HPHP).",
    },
    {
      title: "Cross-Border Payments",
      description:
        "Send stablecoins globally. Backed 1:1 by fiat.",
    },
    {
      title: "Track & Manage Assets",
      description:
        "Monitor portfolio activity and track spending in one place.",
    },
    {
      title: "Send, Deposit, Withdraw",
      description:
        "Simple and secure real life transactions. Anytime, anywhere.",
    },
  ];

  return (
    <>
      <section className="w-full py-[80px] xl:py-[150px] mt-[0px] xl:mt-[300px] mx-auto px-4 lg:container">
        <div className="flex flex-col">
          <h2 className="text-6xl font-bold pb-10">Key Features</h2>
        </div>

        <div className="flex flex-col gap-[80px] justify-between mt-12">
          <div className="flex flex-wrap gap-12 justify-center">
            {features.map((feature, index) => (
              <div
                key={index}
                className="py-16 px-12 rounded-[40px] w-[600px] inset-shadow-harbor"
              >
                <h3 className="text-3xl font-bold">{feature.title}</h3>
                <p className="text-[18px]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-[150px] mx-auto lg:container px-4">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl leading-normal xl:text-5xl font-semibold xl:leading-16">
            3+ Countries Supported with Native Stablecoins<br />
            (HIDR, HTHB, HPHP)
          </h2>
          
          <div className="w-full border-t border-gray-500/50 mt-12 mb-12"></div>
          <div className="flex justify-center items-center gap-12 xl:gap-24">
            <div className="flex flex-col items-center">
              <h4 className="text-xl xl:text-2xl font-semibold">Low Fee</h4>
              <p className="xl:text-4xl font-bold mt-2">(2%)</p>
            </div>
            <div className="h-[150px] w-px bg-gray-500/20"></div>
            <div className="flex flex-col items-center">
              <h4 className="text-xl xl:text-2xl font-semibold">Real Time Tracking</h4>
              <p className="text-xl xl:text-4xl font-bold mt-2">(99% Uptime)</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default KeyFeatures;
