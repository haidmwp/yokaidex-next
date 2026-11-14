import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PageHeader from "@/components/site/PageHeader";
import { getFoodCategories, getFoodCategory } from "@/lib/data";
import { pageTitle } from "@/lib/constants";

export async function generateStaticParams() {
  const cats = await getFoodCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/food/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const cat = await getFoodCategory(slug);
  return { title: pageTitle(cat?.name ?? "Page not found!"), openGraph: cat?.image ? { images: [cat.image] } : undefined };
}

async function FoodTable({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await getFoodCategory(slug);
  if (!cat) notFound();
  return (
    <div id={cat.slug} className="content-wrapper">
      <PageHeader title={cat.name} color={cat.color} />
      <div className={`${cat.slug}-content`}>
        <div className="container">
          <table cellSpacing={0} className="table-food">
            <thead>
              <tr>
                <th>Name</th>
                <th>Image</th>
                <th>On Friend</th>
                <th>On Foe</th>
              </tr>
            </thead>
            <tbody>
              {cat.items.map((it) => (
                <tr key={it.id}>
                  <td>{it.name}</td>
                  <td>{it.image && <img alt={it.name} className="img-food-content" src={it.image} />}</td>
                  <td>{it.onFriend}</td>
                  <td>{it.onFoe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function FoodCategoryPage(props: PageProps<"/food/[slug]">) {
  return (
    <Suspense fallback={<div className="content-wrapper" style={{ minHeight: "80vh" }} />}>
      <FoodTable params={props.params} />
    </Suspense>
  );
}
