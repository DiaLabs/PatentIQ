import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  transpilePackages: ["@theme-toggles/react"],
  experimental: {
    
    turbopack: {
      root: "..",
    },
  },
};

export default nextConfig;
