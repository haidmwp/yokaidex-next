import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import MedalliumList from "@/components/site/MedalliumList";
import { getYokaiCards } from "@/lib/data";
import { pageTitle, yokaiListHref } from "@/lib/constants";

export const metadata: Metadata = { title: pageTitle("Medallium Yo-kai Watch 2") };

export default async function Medallium2Page() {
  const yokais = await getYokaiCards(2);
  return (
    <div className="medallium">
      <PageHeader title="Medallium Yo-kai Watch 2" color="#E85A3D" />
      <MedalliumList yokais={yokais} basePath={yokaiListHref(2)} />
    </div>
  );
}
