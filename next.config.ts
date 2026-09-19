import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    "@pump-fun/pump-sdk",
    "@pump-fun/pump-swap-sdk",
    "@pump-fun/agent-payments-sdk",
    "@coral-xyz/anchor",
  ],
  webpack: (config) => {
    config.module.rules.push({
      resourceQuery: /raw/,
      type: "asset/source",
    });
    config.resolve.fallback = {
      ...(config.resolve.fallback ?? {}),
      fs: false,
      os: false,
      path: false,
    };
    return config;
  },
};

export default nextConfig;
