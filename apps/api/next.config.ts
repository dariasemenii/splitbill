import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Спільний пакет монорепозиторію постачається як TypeScript-код
  transpilePackages: ["@split/shared"],
};

export default nextConfig;
