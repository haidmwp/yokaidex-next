import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nút DevTools (chỉ hiện khi dev) đặt bên phải để không đè lên sidebar admin
  devIndicators: { position: "bottom-right" },
  cacheComponents: true,
  // URL cũ của bản CRA -> Medallium Yo-kai Watch 3
  async redirects() {
    return [{ source: "/yokai-information/:slug", destination: "/yokai-watch-3/:slug", permanent: true }];
  },
  partialPrefetching: true,
};

export default nextConfig;
