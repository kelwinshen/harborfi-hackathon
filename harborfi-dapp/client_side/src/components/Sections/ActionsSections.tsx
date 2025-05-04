"use client";
import React from "react";
import {PortfolioActions, QrActions, SwapActions} from "./index";
import RampActions from "./RampActions";
const ActionsSections = () => {
  const [activeTab, setActiveTab] = React.useState("QRPay");
  return (
    <>
      <section className="lg:container w-[100%] md:w-[80%] lg:w-[40%] lg:mx-auto mx-auto">
        <div className="flex gap-4 my-8 overflow-x-scroll scrollbar-hide snap-x snap-mandatory">
          {["QRPay", "Transaction", "Ramp", "Portfolio"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`button ${activeTab === tab ? "!bg-bgPrimary text-white" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>

          {activeTab === "QRPay" && <QrActions />}
          {activeTab === "Transaction" && <SwapActions />}
          {activeTab === "Ramp" && <RampActions />}
          {activeTab === "Portfolio" && <PortfolioActions />}
      </section>
    </>
  );
};

export default ActionsSections;
