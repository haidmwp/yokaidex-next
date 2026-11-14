import type { Metadata } from "next";
import "@/styles/admin.css";
import { faviconIcons, getGeneralSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const { favicon } = await getGeneralSettings();
  return {
    title: { default: "YokaiDex Admin", template: "%s · YokaiDex Admin" },
    robots: { index: false, follow: false },
    icons: faviconIcons(favicon),
  };
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-body">{children}</div>;
}
