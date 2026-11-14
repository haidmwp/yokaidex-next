import { sitemapIndexResponse } from "@/lib/sitemap";

// Sitemap index (kiểu Yoast SEO) – bật/tắt trong Admin › Cài đặt chung › SEO & Sitemap
export function GET() {
  return sitemapIndexResponse();
}
