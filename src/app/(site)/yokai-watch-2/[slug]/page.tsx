import { Suspense } from "react";
import { YokaiDetail, yokaiMetadata, yokaiStaticParams } from "@/components/site/YokaiDetail";

export function generateStaticParams() {
  return yokaiStaticParams(2);
}

export function generateMetadata(props: PageProps<"/yokai-watch-2/[slug]">) {
  return yokaiMetadata(2, props.params);
}

export default function Yokai2Page(props: PageProps<"/yokai-watch-2/[slug]">) {
  return (
    <div id="yokai-detail" className="content-wrapper">
      <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
        <YokaiDetail game={2} params={props.params} />
      </Suspense>
    </div>
  );
}
