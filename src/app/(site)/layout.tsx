import type { Metadata } from "next";
import "@/styles/site.css";
import SiteShell from "@/components/site/SiteShell";
import Analytics from "@/components/site/Analytics";
import AdBar from "@/components/site/AdBar";
import SupportNotice from "@/components/site/SupportNotice";
import { faviconIcons, getGeneralSettings } from "@/lib/settings";

// Tiêu đề tab: trang chủ = tiêu đề website, trang con = "Tên trang | tiêu đề website" (sửa trong Admin › Cài đặt chung)
export async function generateMetadata(): Promise<Metadata> {
  const { siteTitle, siteUrl, gscVerification, favicon } = await getGeneralSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: siteTitle, template: `%s | ${siteTitle}` },
    icons: faviconIcons(favicon),
    openGraph: { siteName: siteTitle },
    // thẻ <meta name="google-site-verification"> cho Google Search Console
    verification: gscVerification ? { google: gscVerification } : undefined,
  };
}

/** Thanh quảng cáo cố định dưới chân trang + cảnh báo chặn quảng cáo – chỉ khi có mã trong Cài đặt chung. */
async function Ads() {
  const { adCode, adblockWarning } = await getGeneralSettings();
  if (!adCode) return null;
  return (
    <>
      <AdBar code={adCode} />
      {adblockWarning && <SupportNotice code={adCode} />}
    </>
  );
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
