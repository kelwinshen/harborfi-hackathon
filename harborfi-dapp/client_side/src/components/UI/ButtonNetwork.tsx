"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { metamask } from "@/img";

const ButtonPrime = () => {
  return (
    <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
    className="relative bg-white hover:text-white hover:cursor-pointer text-Primary px-3 py-2 rounded font-semibold overflow-hidden group">
      <span className="relative z-10">
        <Image src={metamask} alt="Metamask" className="w-5 h-5 inline-block" />
      </span>
    </motion.button>
  );
};

export default ButtonPrime;
