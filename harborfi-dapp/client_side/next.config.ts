import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable the dev indicator (the green bar at the top in dev mode)
  devIndicators: {
    buildActivity: false,
  },
};

export default nextConfig;
