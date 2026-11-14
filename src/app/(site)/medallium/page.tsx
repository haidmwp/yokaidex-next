import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import MedalliumList from "@/components/site/MedalliumList";
import { getYokaiCards } from "@/lib/data";
import { pageTitle } from "@/lib/constants";

export const metadata: Metadata = { title: pageTitle("Medallium") };

export default async function MedalliumPage() {
  const yokais = await getYokaiCards();
  return (
    <div className="medallium">
      <PageHeader title="Medallium" color="#E85A3D" />
      <MedalliumList yokais={yokais} />
    </div>
  );
}
