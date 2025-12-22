import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude Prisma from bundling to avoid Turbopack issues
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
