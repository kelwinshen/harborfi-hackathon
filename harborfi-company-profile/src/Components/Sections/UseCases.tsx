import { manCallFriend, remoteWorker, smallBusiness, touristBuy } from "@/img";
import Image from "next/image";
import React from "react";

const UseCases = () => {
  const useCases = [
    {
      title: "Freelancers & Remote Workers",
      description:
        "Get paid in crypto, convert to local currency, and spend via QR.",
      image: remoteWorker,
    },
    {
      title: "Tourists & Digital Nomads",
      description:
        "No more high FX rates. Swap to local stablecoins and pay via QR at local stores.",
      image: touristBuy,
    },
    {
      title: "Small Businesses",
      description:
        "Accept crypto payments without worrying about volatility. Convert directly to stable fiat.",
      image: smallBusiness,
    },
    {
      title: "Cross-Border Families",
      description:
        "Send money to loved ones faster and cheaper than traditional remittance platforms.",
      image: manCallFriend,
    },
  ];

  return (
    <>
      <section className="w-full pt-[100px] xl:py-[150px] bg-bgSecondary ">
        <div className="container mx-auto w-full px-4">
          <div className="flex flex-col">
            <h2 className="text-6xl font-bold pb-10">Use Cases</h2>
          </div>
        </div>

        <div className="h-20"></div>

        {useCases.map((useCase, index) => (
          <div
            key={index}
            className="w-full xl:border-t-1 border-white/20 bg-fixed transition-all duration-300 xl:hover:bg-white/10 xl:hover:shadow-2xl xl:hover:scale-[1.02]"
          >
            <div className="container px-4 mx-auto w-full xl:h-[500px]">
              <div className="flex flex-col-reverse  xl:flex-row xl:items-center xl:justify-between h-full">
                <div className="w-full xl:w-[40%] py-14">
                  <h3 className="text-3xl font-bold">{useCase.title}</h3>
                  <p>{useCase.description}</p>
                </div>
                <div>
                  <Image
                    src={useCase.image}
                    alt={useCase.title}
                    className="w-full xl:max-w-[700px] h-[400px] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
};

export default UseCases;
