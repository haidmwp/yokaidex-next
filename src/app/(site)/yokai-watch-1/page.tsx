import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import MedalliumList from "@/components/site/MedalliumList";
import { getYokaiCards } from "@/lib/data";
import { pageTitle, yokaiListHref } from "@/lib/constants";

export const metadata: Metadata = { title: pageTitle("Medallium Yo-kai Watch 1") };

export default async function Medallium1Page() {
  const yokais = await getYokaiCards(1);
  return (
    <div className="medallium">
      <PageHeader title="Medallium Yo-kai Watch 1" color="#E85A3D" />
      <MedalliumList yokais={yokais} basePath={yokaiListHref(1)} />
    </div>
  );
}
