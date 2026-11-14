import { Suspense } from "react";
import { YokaiDetail, yokaiMetadata, yokaiStaticParams } from "@/components/site/YokaiDetail";

export function generateStaticParams() {
  return yokaiStaticParams(1);
}

export function generateMetadata(props: PageProps<"/yokai-watch-1/[slug]">) {
  return yokaiMetadata(1, props.params);
}

export default function Yokai1Page(props: PageProps<"/yokai-watch-1/[slug]">) {
  return (
    <div id="yokai-detail" className="content-wrapper">
      <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
        <YokaiDetail game={1} params={props.params} />
      </Suspense>
    </div>
  );
}
