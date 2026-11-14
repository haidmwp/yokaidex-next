import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nút DevTools (chỉ hiện khi dev) đặt bên phải để không đè lên sidebar admin
  devIndicators: { position: "bottom-right" },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
