import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // 🔥 Ini bikin <Image> behave seperti <img>
  },
};

export default nextConfig;