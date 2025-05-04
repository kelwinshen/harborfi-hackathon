import React from "react";
import ButtonPrime from "../UI/ButtonPrime";

const CallToAct = () => {
  return (
    <>
      <section className="w-full py-14 xl:h-[400px]">
        <div className="max-w-[600px] flex justify-center items-center mx-auto my-auto h-full">
          <div className="flex flex-col justify-center items-center gap-6 xl:gap-12 ">
            <h2 className="text-center text-4xl xl:text-6xl font-bold xl:leading-18">
              Your Port to Practical Crypto Payment
            </h2>
            
            <ButtonPrime textButton="Open App" />
          </div>
        </div>
      </section>
    </>
  );
};

export default CallToAct;
