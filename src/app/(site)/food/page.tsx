import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";
import { getFoodCategories } from "@/lib/data";
import { pageTitle } from "@/lib/constants";

export const metadata: Metadata = { title: pageTitle("Food") };

export default async function FoodPage() {
  const cats = await getFoodCategories();
  const rows: (typeof cats)[] = [];
  for (let i = 0; i < cats.length; i += 2) rows.push(cats.slice(i, i + 2));
  return (
    <div id="food" className="content-wrapper">
      <PageHeader title="Food" color="#FBA6CC" />
      <div className="food-content">
        <div className="container">
          {rows.map((row, i) => (
            <div key={i} className="food">
              {row.map((c) => (
                <Link key={c.id} style={{ backgroundColor: c.color }} className="img-food-wrapper" href={`/food/${c.slug}`}>
                  <img alt={c.name} className="img-food" src={c.image} />
                  {c.name}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
