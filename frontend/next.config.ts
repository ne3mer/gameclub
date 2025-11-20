import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.igdb.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" } // Allow all HTTPS images in production
    ]
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Turbopack configuration for Next.js 16
  turbopack: {
    // Set root directory to fix workspace detection warning
    // This tells Turbopack to use the frontend directory as root
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
