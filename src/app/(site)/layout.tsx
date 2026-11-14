import type { Metadata } from "next";
import "@/styles/site.css";
import SiteShell from "@/components/site/SiteShell";
import Analytics from "@/components/site/Analytics";
import { getGeneralSettings } from "@/lib/settings";

// Tiêu đề tab: trang chủ = tiêu đề website, trang con = "Tên trang | tiêu đề website" (sửa trong Admin › Cài đặt chung)
export async function generateMetadata(): Promise<Metadata> {
  const { siteTitle } = await getGeneralSettings();
  return {
    title: { default: siteTitle, template: `%s | ${siteTitle}` },
    openGraph: { siteName: siteTitle },
  };
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteShell>{children}</SiteShell>
      <Analytics />
    </>
  );
}
