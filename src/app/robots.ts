import type { MetadataRoute } from "next";
import { getGeneralSettings } from "@/lib/settings";

// /robots.txt – cho phép index website, chặn khu quản trị; trỏ tới sitemap nếu đang bật.
// (Không liệt kê đường dẫn đăng nhập tuỳ chỉnh để không lộ trang quản trị.)
export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getGeneralSettings();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/api/"] }],
    sitemap: s.sitemapEnabled ? `${s.siteUrl}/sitemap_index.xml` : undefined,
    host: s.siteUrl,
  };
}
