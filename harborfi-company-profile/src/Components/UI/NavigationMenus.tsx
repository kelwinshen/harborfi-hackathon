"use client";
import { logo } from "@/img";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import ButtonPrime from "./ButtonPrime";
import { Icon } from "@iconify/react";

const NavigationMenus = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menus = [
    {
      label: "Brand",
      link: "https://drive.google.com/file/d/1ifoO7i2QDEUbm2kmzz2D96qXf33KIcEy/view?usp=share_link",
    },
    {
      label: "Lite Paper",
      link: "https://drive.google.com/file/d/1f2AVfSJ-i93jripEydPx7ffcSqABlpts/view?usp=share_link",
    },
  ];

  return (
    <>
      <motion.nav
        className=" xl:block fixed top-0 left-0 w-full z-10"
        animate={{
          backgroundColor: isScrolled
            ? "rgba(15, 23, 42, 0.1)"
            : "rgba(0, 0, 0, 0)",
          backdropFilter: isScrolled ? "blur(10px)" : "blur(0px)",
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex container mx-auto justify-between items-center p-4">
          {/* logo */}
          <div className="flex items-center gap-1">
            <motion.div
              animate={{ width: isScrolled ? 50 : 80 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <a
                href="https://harborfi.xyz"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image src={logo} alt="HarborFi Logo" className="w-full" />
              </a>
            </motion.div>
            <motion.h3
              className="text-2xl sm:text-3xl font-bold"
              animate={{
                opacity: isScrolled ? 0 : 1,
                x: isScrolled ? -20 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              HarborFi
            </motion.h3>
          </div>
          {/* content */}
          <div className="flex items-center gap-8">
            <ul className="hidden lg:flex gap-8 text-lg">
              {menus.map((menu, index) => (
                <li key={index} className="relative group cursor-pointer">
                  <a href={menu.link} target="_blank" rel="noopener noreferrer">
                    {menu.label}
                  </a>
                  <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-white/50 transition-all duration-300 group-hover:w-full"></span>
                </li>
              ))}
            </ul>

            <motion.div
              animate={{
                opacity: isScrolled ? 1 : 0,
                display: isScrolled ? "block" : "none",
                x: isScrolled ? 0 : -20,
              }}
            >
              <a
                href="https://dapp.harborfi.xyz"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ButtonPrime textButton="Open dApp" />
              </a>
            </motion.div>

            <motion.div
              animate={{
                width: isScrolled ? 28 : 24,
                height: isScrolled ? 28 : 24,
                transition: { duration: 0.3 },
              }}
              whileTap={{
                scale: 0.9,
                transition: { duration: 0.3 },
              }}
              className="xl:hidden cursor-pointer"
              onClick={() => setShowMenu(true)}
            >
              <Icon icon="ri:menu-3-fill" className="w-full h-full" />
            </motion.div>
            {/* Open dApp */}
          </div>
        </div>
      </motion.nav>

      {/* menu full */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 w-full h-full bg-bgPrimary z-40 flex flex-col justify-center items-center gap-8"
          >
            {/* Tombol Close */}
            <button
              onClick={() => setShowMenu(false)}
              className="absolute top-8 right-8 text-white text-4xl"
            >
              &times;
            </button>

            {/* Menu Items */}
            {menus.map((menu, index) => (
              <motion.a
                key={index}
                href={menu.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-white text-4xl font-bold"
              >
                {menu.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavigationMenus;
