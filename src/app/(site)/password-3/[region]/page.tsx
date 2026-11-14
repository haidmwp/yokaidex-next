import type { Metadata } from "next";
import { Suspense } from "react";
import { PasswordTable, passwordRegionParams, passwordRegionTitle } from "@/components/site/PasswordPages";
import { pageTitle } from "@/lib/constants";

export function generateStaticParams() {
  return passwordRegionParams(3);
}

export async function generateMetadata(props: PageProps<"/password-3/[region]">): Promise<Metadata> {
  const { region } = await props.params;
  return { title: pageTitle(await passwordRegionTitle(3, region)) };
}

export default function Password3RegionPage(props: PageProps<"/password-3/[region]">) {
  return (
    <div id="attitudes" className="content-wrapper">
      <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
        <PasswordTable game={3} params={props.params} />
      </Suspense>
    </div>
  );
}
