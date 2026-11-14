import type { Metadata } from "next";
import { Suspense } from "react";
import { PasswordTable, passwordRegionParams, passwordRegionTitle } from "@/components/site/PasswordPages";
import { pageTitle } from "@/lib/constants";

export function generateStaticParams() {
  return passwordRegionParams(2);
}

export async function generateMetadata(props: PageProps<"/password-2/[region]">): Promise<Metadata> {
  const { region } = await props.params;
  return { title: pageTitle(await passwordRegionTitle(2, region)) };
}

export default function Password2RegionPage(props: PageProps<"/password-2/[region]">) {
  return (
    <div id="attitudes" className="content-wrapper">
      <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
        <PasswordTable game={2} params={props.params} />
      </Suspense>
    </div>
  );
}
