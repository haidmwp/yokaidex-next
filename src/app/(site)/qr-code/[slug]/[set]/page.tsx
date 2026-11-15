import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PageHeader from "@/components/site/PageHeader";
import QrSlider from "@/components/site/QrSlider";
import { getQrSet } from "@/lib/data";
import { pageTitle } from "@/lib/constants";

export async function generateMetadata(props: PageProps<"/qr-code/[slug]/[set]">): Promise<Metadata> {
  const { slug, set } = await props.params;
  const qr = await getQrSet(slug, set);
  return { title: pageTitle(qr?.name ?? "Page not found!") };
}

async function QrSetView({ params }: { params: Promise<{ slug: string; set: string }> }) {
  const { slug, set } = await params;
  const qr = await getQrSet(slug, set);
  if (!qr) notFound();
  return (
    <>
      <PageHeader title={qr.name} color={qr.color} />
      <div className="qr-code-slide-content-wrapper">
        <div className="container">
          <div className="qr-code-slide-content">
            <QrSlider key={`${slug}/${set}`} slides={qr.slides} storageKey={`yd-qr-slide:${slug}/${set}`} setKey={`${slug}/${set}`} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function QrSetPage(props: PageProps<"/qr-code/[slug]/[set]">) {
  return (
    <div id="qr-code-slide" className="content-wrapper">
      <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
        <QrSetView params={props.params} />
      </Suspense>
    </div>
  );
}
