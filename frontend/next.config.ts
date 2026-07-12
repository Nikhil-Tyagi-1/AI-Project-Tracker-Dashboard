import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@mui/material", "@mui/system", "@mui/material-nextjs"],
};

export default nextConfig;
