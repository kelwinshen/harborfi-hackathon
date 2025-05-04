import { logo } from "@/img";
import Image from "next/image";
import React from "react";

const FooterPrimary = () => {
  return (
    <>
      <footer className="w-full py-8 border-t-1 border-white/20 lg:container mx-auto">
        <div className="w-full max-h-[300px] flex xl:flex-row flex-col gap-8 justify-between items-center">
          <a href="https://harborfi.xyz" rel="noopener noreferrer">
            <div className="flex items-center gap-1">
              <div className="overflow-hidden">
                <Image src={logo} alt="HarborFi Logo" className="w-[80px]" />
              </div>
              <h3 className="text-2xl font-bold">HarborFi</h3>
            </div>
          </a>
          <p className="text-center text-white">
            © 2025 HarborFi. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="https://x.com/harborfi_xyz"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>X</span>
            </a>
            <a
              href="https://t.me/harborfi"
              target="_blank"
              rel="noopener noreferrer"
            >
              Telegram
            </a>
            <a
              href="https://discord.gg/qF3aF8D8"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Discord</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default FooterPrimary;
