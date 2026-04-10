import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    // Warnings do not fail the build on Cloudflare
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors are caught locally; skip on CI to speed up deploys
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
