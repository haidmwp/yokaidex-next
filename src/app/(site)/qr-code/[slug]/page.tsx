import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PageHeader from "@/components/site/PageHeader";
import QrSetList from "@/components/site/QrSetList";
import { getQrCategories, getQrCategory } from "@/lib/data";
import { pageTitle } from "@/lib/constants";

export async function generateStaticParams() {
  const cats = await getQrCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/qr-code/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const cat = await getQrCategory(slug);
  return { title: pageTitle(cat?.name ?? "Page not found!"), openGraph: cat ? { images: [cat.icon] } : undefined };
}

async function QrList({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await getQrCategory(slug);
  if (!cat) notFound();
  return (
    <>
      <PageHeader title={cat.name} color={cat.color} />
      <div className="qr-code-list-wrapper">
        <div className="container">
          <div className="qr-list-content">
            <QrSetList category={cat.slug} sets={cat.sets} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function QrCategoryPage(props: PageProps<"/qr-code/[slug]">) {
  return (
    <div id="qr-code" className="content-wrapper">
      <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
        <QrList params={props.params} />
      </Suspense>
    </div>
  );
}
