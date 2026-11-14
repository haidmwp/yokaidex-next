import type { Metadata } from "next";
import "@/styles/site.css";
import SiteShell from "@/components/site/SiteShell";
import Analytics from "@/components/site/Analytics";
import AdBar from "@/components/site/AdBar";
import { getGeneralSettings } from "@/lib/settings";

// Tiêu đề tab: trang chủ = tiêu đề website, trang con = "Tên trang | tiêu đề website" (sửa trong Admin › Cài đặt chung)
export async function generateMetadata(): Promise<Metadata> {
  const { siteTitle, siteUrl, gscVerification } = await getGeneralSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: siteTitle, template: `%s | ${siteTitle}` },
    openGraph: { siteName: siteTitle },
    // thẻ <meta name="google-site-verification"> cho Google Search Console
    verification: gscVerification ? { google: gscVerification } : undefined,
  };
}

/** Thanh quảng cáo cố định dưới chân trang – chỉ hiện khi có mã trong Cài đặt chung. */
async function Ads() {
  const { adCode } = await getGeneralSettings();
  return adCode ? <AdBar code={adCode} /> : null;
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteShell>{children}</SiteShell>
      <Ads />
      <Analytics />
    </>
  );
}
