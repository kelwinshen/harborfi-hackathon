"use client";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { ButtonPrime } from "@/components/UI";
import { harborBoat } from "@/img";

const LearnMore = () => {
  const [visible, setVisible] = useState(true);

  return (
    <>
      {visible && (
        <section className="bg-white/70 backdrop-blur-md xl:container mx-4 xl:mx-auto relative px-2 py-8 lg:px-8 lg:py-8 rounded-lg">
          {/* flex row */}
          <div className="flex flex-col gap-8 md:flex-row items-center ">
            {/* image */}
            <Image
              src={harborBoat}
              alt="Harbor Boat"
              className="w-[80%] md:w-[30%] xl:w-[15%] h-auto"
            />

            {/* content */}
            <div className="flex flex-row items-start justify-between w-full px-8 ">
              <div className="flex flex-col gap-4 w-full xl:w-[50%]  ">
                <h3 className="text-Primary text-xl lg:text-2xl font-bold">
                  Your Port to Practical Crypto Payment
                </h3>
                <p className="text-Primary text-base">
                  Daily micro transaction, send money worldwide, deposit, and
                  withdrawal using your local currency.
                </p>
                <div>
                <ButtonPrime
  textButton="Learn More"
  action={() => {
    const faqElement = document.getElementById("faq-section");
    if (faqElement) {
      faqElement.scrollIntoView({ behavior: "smooth" });
    }
  }}
/>


                </div>
              </div>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setVisible(false);
                }}
                className="text-Primary absolute top-4 right-8"
              >
                <Icon icon="ion:close-outline" width="50" height="50" />
              </a>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default LearnMore;
