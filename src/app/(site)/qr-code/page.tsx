import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";
import { getQrCategories } from "@/lib/data";
import { pageTitle } from "@/lib/constants";

export const metadata: Metadata = { title: pageTitle("QR Code") };

export default async function QrCodePage() {
  const categories = await getQrCategories();
  return (
    <div id="qr-code" className="content-wrapper">
      <PageHeader title="QR Code" color="#FFC648" />
      <div className="qr-code-content-wrapper">
        <div className="container">
          <div className="qr-code-content">
            {categories.map((qr) => (
              <div key={qr.id} className="qr-code" style={{ backgroundColor: qr.color }}>
                <Link href={`/qr-code/${qr.slug}`}>
                  <img alt={qr.name} className="icon-qr" src={qr.icon} />
                  {qr.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
