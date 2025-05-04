"use client";
import React from "react";
import { motion } from "framer-motion";

const ButtonPrime = ({textButton} : {textButton: string}) => {
  return (
    <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
    className="relative bg-white hover:text-white hover:cursor-pointer text-Primary px-4 py-2 rounded font-semibold overflow-hidden group">
      <span className="relative z-10">{textButton}</span>
      <span className="absolute left-0 top-0 w-0 h-full bg-Primary transition-all duration-300 group-hover:w-full"></span>
    </motion.button>
  );
};

export default ButtonPrime;
