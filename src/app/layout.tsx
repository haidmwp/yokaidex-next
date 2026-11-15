import type { Metadata } from "next";
import { OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: { description: SITE_DESCRIPTION, images: [OG_IMAGE] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-theme do ThemeScript (trong layout website / admin) đặt trước khi hydrate -> bỏ qua khác biệt thuộc tính
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
