"use client";
import React from "react";
import { motion } from "framer-motion";

const ButtonPrime = () => {
  return (
    <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
    className="relative bg-white  hover:cursor-pointer text-Primary px-4 py-2 rounded font-semibold overflow-hidden group">
      <span className="relative z-10">0xPharosNich</span>
    </motion.button>
  );
};

export default ButtonPrime;
