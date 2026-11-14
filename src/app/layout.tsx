import type { Metadata } from "next";
import { OG_IMAGE, SITE_DESCRIPTION, SITE_URL, pageTitle } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: pageTitle(),
  description: SITE_DESCRIPTION,
  openGraph: { description: SITE_DESCRIPTION, images: [OG_IMAGE] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
