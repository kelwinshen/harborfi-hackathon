import React from "react";
import ButtonPrime from "../UI/ButtonPrime";
import Spline from "@splinetool/react-spline/next";

const Hero = () => {
  return (
    <section className="w-full 2xl:h-[1200px] h-[1600px] sm:h-[2000px]  xl:h-[800px] bg-bgSecondary">
      <div className="container mx-auto xl:w-full h-full px-4">
        <div className="flex flex-col xl:flex-row justify-between items-center h-full">
          <div className="w-[100%] xl:w-[60%] h-full flex flex-col justify-center">
            <h1 className="text-6xl font-bold pb-10">
              Connecting Everything
              <br />
              Beneath the Surface
            </h1>
            <div className="w-[80%]">
              <p className="pb-3">
                HarborFi is a decentralized app designed to connect digital
                assets with real-world payments, built on Pharos Network.
              </p>
              <p className="pb-12">
                Whether its local transactions or cross-border payments,
                HarborFi connecting crypto use cases in daily life. Seamlessly,
                securely, and globally.
              </p>

              <ButtonPrime textButton="Join Community" />
            </div>
          </div>

          <div className="w-[100%] md:w-[80%] xl:w-[60%] h-full flex justify-center items-center">
            <Spline scene="https://prod.spline.design/BI8cBXQYEVR395eb/scene.splinecode" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
